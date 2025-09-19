import pino from 'pino';
import pinoHttp from 'pino-http';

export interface LoggerConfig {
  level: string;
  environment: string;
  serviceName: string;
  version: string;
}

/**
 * Create a structured logger instance configured for CloudWatch
 */
export function createLogger(config: LoggerConfig): pino.Logger {
  const isDevelopment = config.environment === 'development';
  
  return pino({
    name: config.serviceName,
    level: config.level,
    
    // Base fields that will appear in every log
    base: {
      service: config.serviceName,
      version: config.version,
      environment: config.environment,
    },
    
    // Timestamp configuration
    timestamp: pino.stdTimeFunctions.isoTime,
    
    // Format configuration for different environments
    ...(isDevelopment ? {
      // Pretty print for development
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          messageFormat: '{service}[{version}] {msg}',
        }
      }
    } : {
      // JSON format for production (CloudWatch compatible)
      formatters: {
        level: (label) => ({ level: label }),
        log: (object) => {
          // Flatten nested objects for CloudWatch Insights
          const flattened: any = {};
          
          const flatten = (obj: any, prefix = '') => {
            for (const key in obj) {
              if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                flatten(obj[key], `${prefix}${key}.`);
              } else {
                flattened[`${prefix}${key}`] = obj[key];
              }
            }
          };
          
          flatten(object);
          return flattened;
        }
      }
    }),
    
    // Redact sensitive information
    redact: {
      paths: [
        'password',
        'token',
        'authorization',
        'cookie',
        'x-api-key',
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers["set-cookie"]',
      ],
      censor: '[REDACTED]'
    },
    
    // Custom serializers
    serializers: {
      err: pino.stdSerializers.err,
      req: (req) => ({
        method: req.method,
        url: req.url,
        userAgent: req.headers?.['user-agent'],
        ip: req.ip,
        correlationId: req.correlationId,
        userId: req.user?.id,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
        responseTime: res.responseTime,
      }),
    },
  });
}

/**
 * Create HTTP logger middleware for Express
 */
export function createHttpLogger(logger: pino.Logger) {
  return pinoHttp({
    logger,
    
    // Custom request ID generator
    genReqId: (req) => req.correlationId || req.headers['x-correlation-id'] || pino.stdSerializers.req(req).id,
    
    // Customize log level based on response
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn';
      } else if (res.statusCode >= 500 || err) {
        return 'error';
      } else if (res.statusCode >= 300 && res.statusCode < 400) {
        return 'info';
      }
      return 'info';
    },
    
    // Custom success message
    customSuccessMessage: (req, res) => {
      return `${req.method} ${req.url} - ${res.statusCode}`;
    },
    
    // Custom error message
    customErrorMessage: (req, res, err) => {
      return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`;
    },
    
    // Custom attribute keys
    customAttributeKeys: {
      req: 'request',
      res: 'response',
      err: 'error',
      responseTime: 'duration',
    },
    
    // Auto-logging configuration
    autoLogging: {
      ignore: (req) => {
        // Don't log health checks and metrics endpoints
        return req.url === '/health' || req.url === '/metrics';
      }
    },
  });
}

/**
 * Log levels for different operations
 */
export const LogLevel = {
  TRACE: 'trace',
  DEBUG: 'debug', 
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
} as const;

/**
 * Structured log context interface
 */
export interface LogContext {
  correlationId?: string;
  userId?: string;
  truckId?: string;
  tripId?: string;
  receiptId?: string;
  operation?: string;
  duration?: number;
  [key: string]: any;
}

/**
 * Enhanced logger with utility methods
 */
export class StructuredLogger {
  constructor(private logger: pino.Logger) {}

  /**
   * Log with context
   */
  log(level: string, message: string, context?: LogContext): void {
    this.logger[level as keyof pino.Logger](context, message);
  }

  /**
   * Log operation start
   */
  operationStart(operation: string, context?: LogContext): void {
    this.logger.info({ 
      ...context, 
      operation, 
      phase: 'start' 
    }, `Operation started: ${operation}`);
  }

  /**
   * Log operation completion
   */
  operationEnd(operation: string, duration: number, context?: LogContext): void {
    this.logger.info({ 
      ...context, 
      operation, 
      duration, 
      phase: 'end' 
    }, `Operation completed: ${operation} (${duration}ms)`);
  }

  /**
   * Log operation failure
   */
  operationError(operation: string, error: Error, context?: LogContext): void {
    this.logger.error({ 
      ...context, 
      operation, 
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      phase: 'error' 
    }, `Operation failed: ${operation}`);
  }

  /**
   * Log business events
   */
  businessEvent(event: string, context?: LogContext): void {
    this.logger.info({ 
      ...context, 
      eventType: 'business',
      event 
    }, `Business event: ${event}`);
  }

  /**
   * Log security events
   */
  securityEvent(event: string, context?: LogContext): void {
    this.logger.warn({ 
      ...context, 
      eventType: 'security',
      event 
    }, `Security event: ${event}`);
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, value: number, context?: LogContext): void {
    this.logger.info({ 
      ...context, 
      metricType: 'performance',
      metric,
      value 
    }, `Performance metric: ${metric} = ${value}`);
  }

  /**
   * Log audit events for compliance
   */
  audit(action: string, resource: string, context?: LogContext): void {
    this.logger.info({ 
      ...context, 
      eventType: 'audit',
      action,
      resource,
      timestamp: new Date().toISOString() 
    }, `Audit: ${action} on ${resource}`);
  }
}

/**
 * CloudWatch Insights query helpers
 */
export const CloudWatchQueries = {
  // Error analysis
  errors: `
    fields @timestamp, level, msg, error.message, error.stack
    | filter level = "error"
    | sort @timestamp desc
  `,
  
  // Performance analysis
  performance: `
    fields @timestamp, operation, duration, response.statusCode
    | filter metricType = "performance"
    | stats avg(duration), max(duration), min(duration) by operation
  `,
  
  // User activity
  userActivity: `
    fields @timestamp, userId, operation, request.method, request.url
    | filter userId exists
    | sort @timestamp desc
  `,
  
  // Security events
  security: `
    fields @timestamp, eventType, event, request.ip, userId
    | filter eventType = "security"
    | sort @timestamp desc
  `,
  
  // OCR processing
  ocrProcessing: `
    fields @timestamp, operation, receiptId, duration, error.message
    | filter operation like /ocr/
    | sort @timestamp desc
  `,
};

// Export singleton logger instance
let loggerInstance: StructuredLogger;

export function initializeLogger(config: LoggerConfig): StructuredLogger {
  const logger = createLogger(config);
  loggerInstance = new StructuredLogger(logger);
  return loggerInstance;
}

export function getLogger(): StructuredLogger {
  if (!loggerInstance) {
    throw new Error('Logger not initialized. Call initializeLogger first.');
  }
  return loggerInstance;
}