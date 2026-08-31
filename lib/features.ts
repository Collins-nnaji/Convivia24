/** Public feature toggles — flip via env without deleting code. */

/** Official event listings are secondary and opt-in while Plan a Night leads the product. */
export const eventsEnabled = process.env.NEXT_PUBLIC_EVENTS_ENABLED === 'true';
