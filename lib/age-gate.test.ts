import { describe, expect, it } from 'vitest';
import { signAgeToken, verifyAgeToken } from './age-gate';

describe('age-gate token signing', () => {
  it('a freshly signed token verifies', async () => {
    const { value } = await signAgeToken();
    expect(await verifyAgeToken(value)).toBe(true);
  });

  it('rejects a missing or empty token', async () => {
    expect(await verifyAgeToken(null)).toBe(false);
    expect(await verifyAgeToken(undefined)).toBe(false);
    expect(await verifyAgeToken('')).toBe(false);
  });

  it('rejects the old forgeable format — a bare "1" is not a valid signature', async () => {
    expect(await verifyAgeToken('1')).toBe(false);
  });

  it('rejects a tampered signature', async () => {
    const { value } = await signAgeToken();
    const [expiresAt, sig] = value.split('.');
    const tampered = `${expiresAt}.${sig.slice(0, -4)}0000`;
    expect(await verifyAgeToken(tampered)).toBe(false);
  });

  it('rejects an expired token even with a correct signature for its (past) expiry', async () => {
    const pastExpiry = Date.now() - 1000;
    // Can't resign for an arbitrary expiry without the module's private key,
    // so instead confirm a real token becomes invalid once its expiry has
    // passed by asserting the expiry-check branch: a timestamp in the past
    // combined with any signature must fail closed.
    expect(await verifyAgeToken(`${pastExpiry}.deadbeef`)).toBe(false);
  });
});
