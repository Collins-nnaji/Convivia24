/**
 * Share helpers for hangout invite URLs (WhatsApp, stories, etc.).
 * WhatsApp opens `api.whatsapp.com/send` so the user picks a chat or status flow with text prefilled.
 */
export function buildHangoutInviteMessage(title: string, inviteUrl: string): string {
  const t = (title || '').trim() || 'Join my table';
  return `You're invited — ${t}\n\n${inviteUrl}`;
}

/** Opens WhatsApp (app or web) with prefilled message; user chooses contact / channel. */
export function whatsAppSendPrefilledUrl(message: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}
