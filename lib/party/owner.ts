import { resolveOwner } from '@/lib/owner';

/**
 * Who owns a saved party: the signed-in user when there is one, otherwise a
 * per-browser id so anonymous hosts keep their parties on the same device.
 */
export async function resolvePartyOwner(): Promise<string> {
  return resolveOwner('c24_planner');
}
