import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import { getCurrentUser } from '@/lib/auth/session';
import {
  getSupplierAccessKeyHash,
  getSupplierBySlug,
  hashAccessKey,
  supplierSignInEmails,
  touchSupplierSeen,
  type Supplier,
} from './repo';

/**
 * Supplier portal sessions.
 *
 * A supplier signs in with the access key the desk issued them, or with a Neon Auth account whose
 * email is the supplier's contact email or on the supplier's allowlist. Either way the cookie is a signed, expiring token bound to
 * the supplier's current key hash — revoking or rotating the key ends every open session.
 */

const COOKIE_PREFIX = 'c24_supplier_';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

function secret(): string {
  return process.env.SUPPLIER_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
}

function sign(supplierId: string, expiresAt: number, keyHash: string): string {
  return createHmac('sha256', secret()).update(`${supplierId}.${expiresAt}.${keyHash}`).digest('hex');
}

function constantTimeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

function cookieName(supplierId: string): string {
  return `${COOKIE_PREFIX}${supplierId.replace(/-/g, '').slice(0, 12)}`;
}

export type SupplierGate =
  | { ok: true; supplier: Supplier; via: 'key' | 'account' }
  | { ok: false; status: number; error: string };

/**
 * Resolves the signed-in supplier for a portal slug. 401 when nobody is signed in, 403 when
 * the signed-in party is not this supplier, 404 when the slug is unknown.
 */
export async function requireSupplier(slug: string): Promise<SupplierGate> {
  const supplier = await getSupplierBySlug(slug);
  if (!supplier) return { ok: false, status: 404, error: 'No supplier at this address.' };
  if (!supplier.active || !supplier.portalEnabled) {
    return { ok: false, status: 403, error: 'This portal is switched off. Contact Convivia24.' };
  }

  // A Neon Auth account on the supplier's email list is good enough — no key needed.
  const user = await getCurrentUser().catch(() => null);
  if (user?.email && supplierSignInEmails(supplier).includes(user.email.trim().toLowerCase())) {
    return { ok: true, supplier, via: 'account' };
  }

  if (!secret()) return { ok: false, status: 503, error: 'Portal sign-in is not configured.' };
  const keyHash = await getSupplierAccessKeyHash(supplier.id);
  const jar = await cookies();
  const token = jar.get(cookieName(supplier.id))?.value;
  if (!keyHash || !token) {
    // Tell a signed-in account holder why they were not let in, rather than asking for a key they may not have.
    if (user?.email) {
      return { ok: false, status: 403, error: `${user.email} is not on this supplier's sign-in list. Ask the Convivia24 desk to add it, or use the access key.` };
    }
    return { ok: false, status: 401, error: keyHash ? 'Sign in with your access key, or with your Convivia24 account.' : 'Sign in with your Convivia24 account, or ask the desk for an access key.' };
  }
  const [expiresAtRaw, sig] = token.split('.');
  const expiresAt = Number(expiresAtRaw);
  if (!sig || !Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return { ok: false, status: 401, error: 'Your session has expired — sign in again.' };
  }
  if (!constantTimeEqual(sig, sign(supplier.id, expiresAt, keyHash))) {
    return { ok: false, status: 401, error: 'Sign in with your access key.' };
  }
  return { ok: true, supplier, via: 'key' };
}

/** Checks the key and, if right, sets the session cookie. */
export async function signInSupplier(slug: string, key: string): Promise<SupplierGate> {
  const supplier = await getSupplierBySlug(slug);
  if (!supplier) return { ok: false, status: 404, error: 'No supplier at this address.' };
  if (!supplier.active || !supplier.portalEnabled) {
    return { ok: false, status: 403, error: 'This portal is switched off. Contact Convivia24.' };
  }
  if (!secret()) return { ok: false, status: 503, error: 'Portal sign-in is not configured.' };
  const keyHash = await getSupplierAccessKeyHash(supplier.id);
  if (!keyHash || !constantTimeEqual(hashAccessKey(key), keyHash)) {
    return { ok: false, status: 401, error: 'That access key is not right.' };
  }

  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const jar = await cookies();
  jar.set(cookieName(supplier.id), `${expiresAt}.${sign(supplier.id, expiresAt, keyHash)}`, {
    httpOnly: true,
    sameSite: 'lax',
    path: `/`,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  await touchSupplierSeen(supplier.id);
  return { ok: true, supplier, via: 'key' };
}

export async function signOutSupplier(supplierId: string): Promise<void> {
  const jar = await cookies();
  jar.delete(cookieName(supplierId));
}
