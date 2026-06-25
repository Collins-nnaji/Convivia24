// Currency + price helpers for the ticketing platform.

const SYMBOLS: Record<string, string> = {
  NGN: '₦',
  GBP: '£',
  USD: '$',
  EUR: '€',
  GHS: 'GH₵',
  KES: 'KSh',
  ZAR: 'R',
  CAD: 'CA$',
  AED: 'AED ',
};

export function currencySymbol(currency = 'NGN'): string {
  return SYMBOLS[currency.toUpperCase()] ?? `${currency} `;
}

/** Format a numeric amount as a localized price string, e.g. ₦12,000 */
export function formatMoney(amount: number | string, currency = 'NGN'): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!isFinite(n)) return `${currencySymbol(currency)}0`;
  const hasDecimals = n % 1 !== 0;
  const formatted = n.toLocaleString('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${currencySymbol(currency)}${formatted}`;
}

/** Free admission helper — respects the platform-wide free flag. */
export function isEverythingFree(): boolean {
  return process.env.CONVIVIA_EVERYTHING_FREE === '1' ||
    process.env.NEXT_PUBLIC_CONVIVIA_EVERYTHING_FREE === '1';
}

export function priceLabel(amount: number | string, currency = 'NGN'): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isEverythingFree() || !n || n <= 0) return 'Free';
  return formatMoney(n, currency);
}
