/** Public-facing support address — keep in sync with SUPPORT_EMAIL in .env */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'support@convivia24.com';

export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`;
