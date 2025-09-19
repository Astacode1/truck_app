import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import express from 'express';

export interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
  debug?: boolean;
}

/**
 * Initialize Sentry error tracking and performance monitoring
 */
export function initSentry(config: SentryConfig): void {
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    debug: config.debug,
    
    // Performance monitoring
    tracesSampleRate: config.tracesSampleRate,
    profilesSampleRate: config.profilesSampleRate,
    
    // Integrations
    integrations: [
      // Enable profiling
      nodeProfilingIntegration(),
      // Express integration
      Sentry.expressIntegration({
        shouldCreateSpanForRequest: (url) => {
          // Don't trace health checks and metrics
          return !url.includes('/health') && !url.includes('/metrics');
        },
      }),
      // Database integration
      Sentry.prismaIntegration(),
      // Node integrations
      Sentry.httpIntegration(),
      Sentry.fsIntegration(),
    ],
    
    // Additional configuration
    beforeSend(event) {
      // Filter out certain errors in production
      if (config.environment === 'production') {
        // Don't send validation errors
        if (event.exception?.values?.[0]?.type === 'ValidationError') {
          return null;
        }
        // Don't send 404 errors
        if (event.tags?.httpStatus === '404') {
          return null;
        }
      }
      return event;
    },
    
    // Set context tags
    initialScope: {
      tags: {
        component: 'truck-monitoring-backend',
      },
    },
  });
}

/**
 * Setup Express middleware for Sentry
 */
export function setupSentryMiddleware(app: any): void {
  // Request handler must be first
  app.use(Sentry.expressMiddleware());
  
  // Add Sentry context middleware
  app.use((req, res, next) => {
    Sentry.setContext('request', {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    
    // Add user context if available
    if (req.user) {
      Sentry.setUser({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
      });
    }
    
    next();
  });
}

/**
 * Setup Sentry error handling middleware (must be after routes)
 */
export function setupSentryErrorHandler(app: any): void {
  // Sentry error handler must be before other error handlers
  app.use(Sentry.expressErrorHandler({
    shouldHandleError(error) {
      // Capture all server errors
      return error.status >= 500;
    },
  }));
}

/**
 * Capture custom errors with context
 */
export function captureError(error: Error, context?: Record<string, any>): void {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('custom', context);
    }
    scope.setLevel('error');
    Sentry.captureException(error);
  });
}

/**
 * Capture custom messages/events
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>): void {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('custom', context);
    }
    scope.setLevel(level);
    Sentry.captureMessage(message);
  });
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Start a new transaction for performance tracking
 */
export function startTransaction(name: string, op: string): Sentry.Transaction {
  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Track custom performance metrics
 */
export function trackPerformance<T>(
  name: string, 
  operation: string, 
  fn: () => Promise<T>
): Promise<T> {
  const transaction = startTransaction(name, operation);
  
  return fn()
    .then((result) => {
      transaction.setStatus('ok');
      return result;
    })
    .catch((error) => {
      transaction.setStatus('internal_error');
      captureError(error, { transaction: name, operation });
      throw error;
    })
    .finally(() => {
      transaction.finish();
    });
}

export { Sentry };