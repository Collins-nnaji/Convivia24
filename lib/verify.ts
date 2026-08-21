/** Order-authenticity verification: every order gets a "Verified by Convivia24" page + QR/barcode. */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidOrderId(id: string): boolean {
  return UUID_RE.test(id);
}

function appOrigin(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://convivia24.com').replace(/\/$/, '');
}

/** Public URL a customer lands on after scanning a bottle's stamp/barcode. */
export function verifyUrl(orderId: string): string {
  return `${appOrigin()}/verify/${orderId}`;
}

/** Short human-readable authenticity code shown next to the seal (e.g. on a printed label). */
export function verifyCode(orderId: string): string {
  return orderId.slice(0, 8).toUpperCase();
}
