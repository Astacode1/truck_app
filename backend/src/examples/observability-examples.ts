/**
 * Sample integration code showing how to use the observability stack
 * in your application controllers and services
 */

import { captureError, captureMessage, addBreadcrumb, trackPerformance } from '../config/sentry';
import { getLogger } from '../config/logger';
import { getMetrics, trackExecutionTime } from '../config/metrics';

/**
 * Example OCR Controller with observability integration
 */
export class ObservableOcrController {
  private logger = getLogger();
  private metrics = getMetrics();

  /**
   * Process receipt with full observability
   */
  @trackExecutionTime('ocr_processing')
  async processReceipt(file: any, truckId: string, driverId: string) {
    const correlationId = `ocr-${Date.now()}`;
    const startTime = Date.now();

    // Add breadcrumb for tracking
    addBreadcrumb('OCR processing started', 'processing', {
      truckId,
      driverId,
      fileName: file.originalname,
      fileSize: file.size,
    });

    // Log operation start
    this.logger.operationStart('processReceipt', {
      correlationId,
      truckId,
      driverId,
      fileName: file.originalname,
      fileSize: file.size,
    });

    try {
      // Simulate OCR processing
      const result = await this.performOcrProcessing(file);
      const duration = Date.now() - startTime;

      // Track success metrics
      this.metrics.trackReceiptProcessing('success', truckId, driverId);
      this.metrics.trackOcrProcessingTime(file.mimetype || 'unknown', 'success', duration);

      // Log successful completion
      this.logger.operationEnd('processReceipt', duration, {
        correlationId,
        truckId,
        driverId,
        resultLength: result.text.length,
        confidence: result.confidence,
      });

      // Business event log
      this.logger.businessEvent('receipt_processed', {
        truckId,
        driverId,
        amount: result.amount,
        vendor: result.vendor,
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;

      // Track failure metrics
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.metrics.trackOcrFailure(errorMsg, truckId, file.mimetype || 'unknown');
      this.metrics.trackOcrProcessingTime(file.mimetype || 'unknown', 'failure', duration);

      // Log error with context
      this.logger.operationError('processReceipt', error as Error, {
        correlationId,
        truckId,
        driverId,
        fileName: file.originalname,
      });

      // Capture error in Sentry with context
      captureError(error as Error, {
        correlationId,
        truckId,
        driverId,
        fileName: file.originalname,
        fileSize: file.size,
        processingDuration: duration,
      });

      throw error;
    }
  }

  private async performOcrProcessing(file: any) {
    // Simulate OCR processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 5000));
    
    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error('OCR processing failed');
    }

    return {
      text: 'Sample receipt text',
      confidence: 0.95,
      amount: 45.67,
      vendor: 'Gas Station Inc',
    };
  }
}

/**
 * Example Authentication Controller with observability
 */
export class ObservableAuthController {
  private logger = getLogger();
  private metrics = getMetrics();

  async login(username: string, password: string, userAgent: string, ip: string) {
    const correlationId = `auth-${Date.now()}`;

    // Log authentication attempt
    this.logger.securityEvent('login_attempt', {
      correlationId,
      username,
      userAgent,
      ip,
    });

    try {
      // Simulate authentication
      const user = await this.authenticateUser(username, password);
      
      // Track successful authentication
      this.metrics.trackAuthAttempt('success', 'password', user.role);

      // Log successful login
      this.logger.audit('login', 'user_session', {
        correlationId,
        userId: user.id,
        username: user.username,
        role: user.role,
        ip,
      });

      return user;

    } catch (error) {
      // Track failed authentication
      this.metrics.trackAuthAttempt('failure', 'password', 'unknown');

      // Log security event
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.securityEvent('login_failed', {
        correlationId,
        username,
        reason: errorMsg,
        ip,
        userAgent,
      });

      // Capture in Sentry if too many failures
      if (errorMsg.includes('too many attempts')) {
        captureMessage('Multiple failed login attempts detected', 'warning', {
          username,
          ip,
          userAgent,
        });
      }

      throw error;
    }
  }

  private async authenticateUser(username: string, password: string) {
    // Simulate authentication logic
    if (username === 'admin' && password === 'admin') {
      return { id: '1', username: 'admin', role: 'admin' };
    }
    throw new Error('Invalid credentials');
  }
}

/**
 * Example Database Service with observability
 */
export class ObservableDbService {
  private logger = getLogger();
  private metrics = getMetrics();

  async findTruck(id: string) {
    const operation = 'SELECT';
    const table = 'trucks';
    const startTime = Date.now();

    try {
      // Simulate database query
      const result = await this.executeQuery(`SELECT * FROM trucks WHERE id = ?`, [id]);
      const duration = Date.now() - startTime;

      // Track successful query
      this.metrics.trackDatabaseQuery(operation, table, 'success', duration);

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;

      // Track failed query
      this.metrics.trackDatabaseQuery(operation, table, 'failure', duration);

      // Log database error
      this.logger.operationError('database_query', error as Error, {
        operation,
        table,
        duration,
        query: 'SELECT * FROM trucks WHERE id = ?',
      });

      // Capture critical database errors
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (errorMsg.includes('connection')) {
        captureError(error as Error, {
          operation,
          table,
          queryType: 'SELECT',
          severity: 'critical',
        });
      }

      throw error;
    }
  }

  private async executeQuery(sql: string, params: any[]) {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    
    // Simulate occasional failures
    if (Math.random() < 0.05) {
      throw new Error('Database connection failed');
    }

    return { id: '1', name: 'Truck 001' };
  }
}

/**
 * Example middleware for tracking business metrics
 */
export function businessMetricsMiddleware() {
  const logger = getLogger();
  const metrics = getMetrics();

  return async (req: any, res: any, next: any) => {
    // Update active resources periodically
    if (Math.random() < 0.01) { // 1% of requests
      try {
        // Simulate getting active counts
        const activeTrucks = Math.floor(Math.random() * 50) + 10;
        const activeTrips = Math.floor(Math.random() * 30) + 5;
        
        metrics.updateActiveTrucks(activeTrucks);
        metrics.updateActiveTrips(activeTrips);

        logger.performance('active_resources_updated', activeTrucks + activeTrips, {
          activeTrucks,
          activeTrips,
        });
      } catch (error) {
        logger.operationError('update_business_metrics', error as Error);
      }
    }

    next();
  };
}

/**
 * Health check with observability
 */
export async function healthCheckWithMetrics() {
  const logger = getLogger();
  const metrics = getMetrics();
  
  try {
    // Check database
    const dbStart = Date.now();
    await checkDatabase();
    const dbDuration = Date.now() - dbStart;
    
    metrics.trackDatabaseQuery('HEALTHCHECK', 'system', 'success', dbDuration);
    
    // Check external services
    await checkExternalServices();
    
    logger.businessEvent('health_check_passed');
    
    return { status: 'healthy', timestamp: new Date().toISOString() };
    
  } catch (error) {
    logger.operationError('health_check', error as Error);
    captureError(error as Error, { component: 'health_check' });
    
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return { status: 'unhealthy', error: errorMsg };
  }
}

async function checkDatabase() {
  // Simulate database check
  await new Promise(resolve => setTimeout(resolve, 50));
}

async function checkExternalServices() {
  // Simulate external service checks
  await new Promise(resolve => setTimeout(resolve, 100));
}