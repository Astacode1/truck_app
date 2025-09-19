import { register, collectDefaultMetrics, Counter, Histogram, Gauge, Summary } from 'prom-client';
import { Request, Response } from 'express';

/**
 * Prometheus metrics configuration and setup
 */
export class PrometheusMetrics {
  // Default metrics
  private defaultMetricsInterval: any = null;

  // Custom counters
  public readonly receiptsProcessed: Counter<string>;
  public readonly ocrFailures: Counter<string>;
  public readonly authAttempts: Counter<string>;
  public readonly apiRequests: Counter<string>;
  public readonly databaseQueries: Counter<string>;

  // Histograms for timing
  public readonly httpRequestDuration: Histogram<string>;
  public readonly ocrProcessingDuration: Histogram<string>;
  public readonly databaseQueryDuration: Histogram<string>;

  // Gauges for current state
  public readonly activeTrucks: Gauge<string>;
  public readonly activeTrips: Gauge<string>;
  public readonly queueSize: Gauge<string>;

  // Summary for percentiles
  public readonly responseTimesSummary: Summary<string>;

  constructor() {
    // Initialize custom counters
    this.receiptsProcessed = new Counter({
      name: 'truck_monitoring_receipts_processed_total',
      help: 'Total number of receipts processed by the OCR system',
      labelNames: ['status', 'truck_id', 'driver_id'],
      registers: [register],
    });

    this.ocrFailures = new Counter({
      name: 'truck_monitoring_ocr_failures_total',
      help: 'Total number of OCR processing failures',
      labelNames: ['error_type', 'truck_id', 'file_type'],
      registers: [register],
    });

    this.authAttempts = new Counter({
      name: 'truck_monitoring_auth_attempts_total',
      help: 'Total number of authentication attempts',
      labelNames: ['status', 'method', 'user_role'],
      registers: [register],
    });

    this.apiRequests = new Counter({
      name: 'truck_monitoring_api_requests_total',
      help: 'Total number of API requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [register],
    });

    this.databaseQueries = new Counter({
      name: 'truck_monitoring_database_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'table', 'status'],
      registers: [register],
    });

    // Initialize histograms
    this.httpRequestDuration = new Histogram({
      name: 'truck_monitoring_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5, 10], // seconds
      registers: [register],
    });

    this.ocrProcessingDuration = new Histogram({
      name: 'truck_monitoring_ocr_processing_duration_seconds',
      help: 'Duration of OCR processing in seconds',
      labelNames: ['file_type', 'status'],
      buckets: [1, 5, 10, 30, 60, 120], // seconds
      registers: [register],
    });

    this.databaseQueryDuration = new Histogram({
      name: 'truck_monitoring_database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1], // seconds
      registers: [register],
    });

    // Initialize gauges
    this.activeTrucks = new Gauge({
      name: 'truck_monitoring_active_trucks',
      help: 'Number of currently active trucks',
      labelNames: ['status'],
      registers: [register],
    });

    this.activeTrips = new Gauge({
      name: 'truck_monitoring_active_trips',
      help: 'Number of currently active trips',
      labelNames: ['status'],
      registers: [register],
    });

    this.queueSize = new Gauge({
      name: 'truck_monitoring_queue_size',
      help: 'Number of items in processing queues',
      labelNames: ['queue_name'],
      registers: [register],
    });

    // Initialize summary
    this.responseTimesSummary = new Summary({
      name: 'truck_monitoring_response_times_summary',
      help: 'Summary of response times',
      labelNames: ['endpoint'],
      percentiles: [0.5, 0.9, 0.95, 0.99],
      registers: [register],
    });
  }

  /**
   * Start collecting default Node.js metrics
   */
  startDefaultMetrics(): void {
    // Collect default metrics every 10 seconds
    this.defaultMetricsInterval = collectDefaultMetrics({ 
      register,
      timeout: 10000,
      prefix: 'truck_monitoring_',
    });
  }

  /**
   * Stop collecting default metrics
   */
  stopDefaultMetrics(): void {
    if (this.defaultMetricsInterval) {
      clearInterval(this.defaultMetricsInterval);
      this.defaultMetricsInterval = null;
    }
  }

  /**
   * Express middleware to track HTTP requests
   */
  createHttpMetricsMiddleware() {
    return (req: any, res: any, next: any) => {
      const start = Date.now();
      
      // Track request
      const route = req.route?.path || req.path;
      
      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const statusCode = res.statusCode.toString();
        
        // Update counters and histograms
        this.apiRequests.inc({ 
          method: req.method, 
          route, 
          status_code: statusCode 
        });
        
        this.httpRequestDuration.observe(
          { method: req.method, route, status_code: statusCode },
          duration
        );
        
        this.responseTimesSummary.observe(
          { endpoint: route },
          duration
        );
      });
      
      next();
    };
  }

  /**
   * Track receipt processing
   */
  trackReceiptProcessing(status: 'success' | 'failure', truckId: string, driverId: string): void {
    this.receiptsProcessed.inc({ status, truck_id: truckId, driver_id: driverId });
  }

  /**
   * Track OCR failures
   */
  trackOcrFailure(errorType: string, truckId: string, fileType: string): void {
    this.ocrFailures.inc({ error_type: errorType, truck_id: truckId, file_type: fileType });
  }

  /**
   * Track OCR processing time
   */
  trackOcrProcessingTime(fileType: string, status: 'success' | 'failure', duration: number): void {
    this.ocrProcessingDuration.observe(
      { file_type: fileType, status },
      duration / 1000 // Convert to seconds
    );
  }

  /**
   * Track authentication attempts
   */
  trackAuthAttempt(status: 'success' | 'failure', method: string, userRole: string): void {
    this.authAttempts.inc({ status, method, user_role: userRole });
  }

  /**
   * Track database query
   */
  trackDatabaseQuery(operation: string, table: string, status: 'success' | 'failure', duration: number): void {
    this.databaseQueries.inc({ operation, table, status });
    this.databaseQueryDuration.observe(
      { operation, table },
      duration / 1000 // Convert to seconds
    );
  }

  /**
   * Update active trucks count
   */
  updateActiveTrucks(count: number, status: string = 'active'): void {
    this.activeTrucks.set({ status }, count);
  }

  /**
   * Update active trips count
   */
  updateActiveTrips(count: number, status: string = 'in_progress'): void {
    this.activeTrips.set({ status }, count);
  }

  /**
   * Update queue size
   */
  updateQueueSize(queueName: string, size: number): void {
    this.queueSize.set({ queue_name: queueName }, size);
  }

  /**
   * Get metrics endpoint handler
   */
  getMetricsHandler() {
    return async (req: Request, res: Response) => {
      try {
        res.set('Content-Type', register.contentType);
        const metrics = await register.metrics();
        res.end(metrics);
      } catch (error) {
        res.status(500).end('Error collecting metrics');
      }
    };
  }

  /**
   * Reset all metrics (useful for testing)
   */
  reset(): void {
    register.resetMetrics();
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    register.clear();
  }

  /**
   * Get current metrics as string
   */
  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}

// Singleton instance
let metricsInstance: PrometheusMetrics;

/**
 * Initialize Prometheus metrics
 */
export function initializeMetrics(): PrometheusMetrics {
  if (!metricsInstance) {
    metricsInstance = new PrometheusMetrics();
    metricsInstance.startDefaultMetrics();
  }
  return metricsInstance;
}

/**
 * Get metrics instance
 */
export function getMetrics(): PrometheusMetrics {
  if (!metricsInstance) {
    throw new Error('Metrics not initialized. Call initializeMetrics first.');
  }
  return metricsInstance;
}

/**
 * Decorator for tracking function execution time
 */
export function trackExecutionTime(metricName: string, labels: Record<string, string> = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      const metrics = getMetrics();
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - start;
        
        // Track success
        metrics.responseTimesSummary.observe(
          { endpoint: `${target.constructor.name}.${propertyName}`, ...labels },
          duration / 1000
        );
        
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        
        // Track failure
        metrics.responseTimesSummary.observe(
          { endpoint: `${target.constructor.name}.${propertyName}`, ...labels, status: 'error' },
          duration / 1000
        );
        
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Business metrics for domain-specific tracking
 */
export class BusinessMetrics {
  private metrics: PrometheusMetrics;

  constructor(metrics: PrometheusMetrics) {
    this.metrics = metrics;
  }

  /**
   * Track fuel receipt processing
   */
  trackFuelReceiptProcessed(truckId: string, driverId: string, amount: number): void {
    this.metrics.trackReceiptProcessing('success', truckId, driverId);
    
    // You could add additional fuel-specific metrics here
    // this.fuelAmountProcessed.inc({ truck_id: truckId }, amount);
  }

  /**
   * Track maintenance events
   */
  trackMaintenanceEvent(truckId: string, eventType: string): void {
    // Could add specific maintenance metrics
  }

  /**
   * Track driver activity
   */
  trackDriverActivity(driverId: string, activity: string): void {
    // Could add driver-specific metrics
  }
}

export { register as prometheusRegister };