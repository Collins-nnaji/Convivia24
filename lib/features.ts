/** Public feature toggles — flip via env without deleting code. */

/** Events, venues, and circles in the consumer app. Off for MVP launch. */
export const eventsEnabled = process.env.NEXT_PUBLIC_EVENTS_ENABLED === 'true';
