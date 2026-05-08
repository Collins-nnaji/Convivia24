/**
 * Platform admins — comma-separated emails in CONVIVIA_ADMIN_EMAILS.
 */
export function parseConviviaAdminEmails(): string[] {
  const raw = process.env.CONVIVIA_ADMIN_EMAILS || '';
  return raw
    .split(/[,;\n\r]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isConviviaAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  return parseConviviaAdminEmails().includes(e);
}
