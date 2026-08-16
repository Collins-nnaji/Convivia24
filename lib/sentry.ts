import * as Sentry from '@sentry/nextjs';

/** Capture API errors in Sentry when configured; never throws. */
export function captureApiError(err: unknown, context?: Record<string, unknown>) {
  try {
    if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(err, context ? { extra: context } : undefined);
    }
  } catch {
    /* ignore */
  }
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }
}
