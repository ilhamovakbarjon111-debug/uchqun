import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}

export const captureException = (error, context) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  }
};

export default Sentry;
