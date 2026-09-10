import { sendEmail, adminNotifyEmail } from '@/lib/email/resend';
import { adminPartnerApplicationEmail } from '@/lib/email/templates';
import type { PartnerApplicationInput } from '@/lib/partners/applications';

export async function notifyPartnerApplication(
  applicationId: string,
  input: PartnerApplicationInput
): Promise<void> {
  try {
    const admins = adminNotifyEmail();
    if (!admins) {
      console.warn('partner application saved but ADMIN_NOTIFY_EMAIL is not set');
      return;
    }
    const { subject, html, text } = adminPartnerApplicationEmail({
      applicationId,
      ...input,
    });
    const result = await sendEmail({
      to: admins,
      subject,
      html,
      text,
      replyTo: input.email,
    });
    if (!result.sent) console.error('Admin partner notification failed:', result.error);
  } catch (err) {
    console.error('notifyPartnerApplication failed', err);
  }
}
