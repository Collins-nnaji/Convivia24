/** Public feature toggles — flip via env without deleting code. */

/** Events, venues, and circles in the consumer app. */
export const eventsEnabled = process.env.NEXT_PUBLIC_EVENTS_ENABLED !== 'false';
