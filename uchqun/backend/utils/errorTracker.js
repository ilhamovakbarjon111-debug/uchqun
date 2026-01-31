import logger from './logger.js';

// Error tracking utility
// In production, integrate with Sentry or GCP Error Reporting

/**
 * Track error with additional context
 * @param {Error} error - Error object
 * @param {Object} context - Additional context (userId, request info, etc.)
 */
export function trackError(error, context = {}) {
  // Log error with context
  logger.error('Error tracked', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    ...context,
  });

  // TODO: In production, send to error tracking service
  // Example for Sentry:
  // if (process.env.SENTRY_DSN) {
  //   Sentry.captureException(error, { extra: context });
  // }

  // Example for GCP Error Reporting:
  // if (process.env.GCP_PROJECT_ID) {
  //   errorReporting.report(error, context);
  // }
}

/**
 * Track unhandled promise rejection
 */
export function setupErrorTracking() {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
    trackError(
      reason instanceof Error ? reason : new Error(String(reason)),
      { type: 'unhandledRejection' }
    );
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack,
    });
    trackError(error, { type: 'uncaughtException' });
    
    // Exit process after logging uncaught exception
    // In production, let the process manager restart it
    process.exit(1);
  });
}

// Initialize error tracking on import
if (process.env.NODE_ENV !== 'test') {
  setupErrorTracking();
}

