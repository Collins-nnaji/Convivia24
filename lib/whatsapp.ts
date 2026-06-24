/**
 * Builds a wa.me deep link with a pre-filled message. This needs no API keys
 * or business account — it just opens WhatsApp with the message ready to
 * send, so the user taps "send" themselves. True unattended/automated
 * sending would require a verified WhatsApp Business account (Meta Cloud API
 * or Twilio) with pre-approved message templates.
 */
export function waCheckInLink(phone: string, name: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  const message = `Hey ${name.split(' ')[0]}, it's been a bit — thinking of you. How have you been?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}
