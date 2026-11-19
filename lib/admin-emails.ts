// Admin emails come only from the deployment environment (CONVIVIA_ADMIN_EMAILS).
export function normaliseEmails(...lists: (string | undefined)[]): string[] {
  return [...new Set(lists.filter(Boolean)
    .flatMap(value => String(value).split(/[;,\s]+/))
    .map(email => email.trim().toLowerCase().replace(/\\@/g, '@'))
    .filter(email => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)))];
}

export function adminEmails(): string[] {
  return normaliseEmails(process.env.CONVIVIA_ADMIN_EMAILS);
}
