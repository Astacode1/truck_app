/**
 * Observability initialization script
 * Call this early in your application startup
 */

import { initSentry, setupSentryMiddleware, setupSentryErrorHandler } from './sentry';
import { initializeLogger, createHttpLogger, createLogger } from './logger';
import { initializeMetrics } from './metrics';

/**
 * Initialize all observability components
 */
export function initializeObservability(app: any) {
  // Environment variables
  const environment = process.env.NODE_ENV || 'development';
  const serviceName = process.env.SERVICE_NAME || 'truck-monitoring-backend';
  const serviceVersion = process.env.SERVICE_VERSION || '1.0.0';
  
  // 1. Initialize Sentry (must be first)
  if (process.env.SENTRY_DSN) {
    initSentry({
      dsn: process.env.SENTRY_DSN,
      environment,
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
      debug: environment === 'development',
    });

    // Setup Sentry middleware early in the middleware stack
    setupSentryMiddleware(app);
  }

  // 2. Initialize structured logging
  const structuredLogger = initializeLogger({
    level: process.env.LOG_LEVEL || (environment === 'production' ? 'info' : 'debug'),
    environment,
    serviceName,
    version: serviceVersion,
  });

  // Create a new logger instance for HTTP middleware
  const httpLogger = createHttpLogger(
    createLogger({
      level: process.env.LOG_LEVEL || (environment === 'production' ? 'info' : 'debug'),
      environment,
      serviceName,
      version: serviceVersion,
    })
  );
  app.use(httpLogger);

  // 3. Initialize Prometheus metrics
  const metrics = initializeMetrics();
  
  // Add metrics middleware
  app.use(metrics.createHttpMetricsMiddleware());

  // Add metrics endpoint
  app.get('/metrics', metrics.getMetricsHandler());

  // 4. Setup Sentry error handler (must be after routes but before other error handlers)
  if (process.env.SENTRY_DSN) {
    setupSentryErrorHandler(app);
  }

  return { logger: structuredLogger, metrics };
}

/**
 * Environment variables needed for observability
 */
export const REQUIRED_ENV_VARS = {
  // Sentry
  SENTRY_DSN: 'Your Sentry DSN for error tracking',
  
  // Logging
  LOG_LEVEL: 'Logging level (debug, info, warn, error)',
  
  // Service identification
  SERVICE_NAME: 'Name of the service',
  SERVICE_VERSION: 'Version of the service',
  NODE_ENV: 'Environment (development, production)',
} as const;

/**
 * Sample environment configuration
 */
export const SAMPLE_ENV_CONFIG = `
# Observability Configuration

# Sentry Error Tracking
SENTRY_DSN=https://your-key@o1234567.ingest.sentry.io/1234567

# Logging Configuration
LOG_LEVEL=info
SERVICE_NAME=truck-monitoring-backend
SERVICE_VERSION=1.0.0

# Environment
NODE_ENV=production

# Optional: Additional context
ENVIRONMENT=production
DEPLOYMENT_REGION=us-east-1
`;

/**
 * Health check endpoint with observability
 */
export function createObservableHealthCheck() {
  return async (req: any, res: any) => {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: process.env.SERVICE_NAME || 'truck-monitoring-backend',
        version: process.env.SERVICE_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        checks: {
          database: 'healthy', // Add actual database check
          redis: 'healthy',    // Add actual Redis check
        }
      };

      res.status(200).json(healthStatus);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}