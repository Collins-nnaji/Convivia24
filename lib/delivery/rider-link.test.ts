import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRiderToken, verifyRiderToken } from './rider-link';

const id = '0b7c3f1e-2a4d-4e8b-9c1a-5d6e7f8a9b0c';
beforeEach(() => vi.stubEnv('RIDER_LINK_SECRET', 'test-rider-secret-that-is-long-enough-123'));
afterEach(() => vi.unstubAllEnvs());

describe('rider links', () => {
  it('round-trips an order id', () => {
    expect(verifyRiderToken(createRiderToken(id))).toBe(id);
  });
  it('expires', () => {
    const t = createRiderToken(id, Date.now(), 1);
    expect(verifyRiderToken(t, Date.now() + 2 * 3600_000)).toBeNull();
  });
  it('rejects a tampered order id', () => {
    const [, sig] = createRiderToken(id).split('.');
    const forged = `${Buffer.from(`${id.replace('0b', '1b')}.9999999999`).toString('base64url')}.${sig}`;
    expect(verifyRiderToken(forged)).toBeNull();
    expect(verifyRiderToken('garbage')).toBeNull();
  });
});
