import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/db';
import { adminNotifyEmail, sendEmail } from '@/lib/email/resend';
import { genericNoticeEmail } from '@/lib/email/templates';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';
import {
  GOAL_LABELS,
  BUDGET_LABELS,
  createBrandEnquiry,
  validateBrandEnquiry,
  type BudgetBand,
  type EnquiryGoal,
} from '@/lib/trivia/enquiries';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Public — a drinks brand asking about promotion on Convivia24. */
export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`brand-enquiry:${clientIp(req)}`, 5, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const input = {
      brand: typeof body.brand === 'string' ? body.brand : '',
      contactName: typeof body.contactName === 'string' ? body.contactName : '',
      email: typeof body.email === 'string' ? body.email : '',
      phone: typeof body.phone === 'string' ? body.phone : null,
      goal: typeof body.goal === 'string' ? body.goal : 'trivia-round',
      budgetBand: typeof body.budgetBand === 'string' ? body.budgetBand : null,
      message: typeof body.message === 'string' ? body.message : null,
    };

    const invalid = validateBrandEnquiry(input);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

    const enquiry = await createBrandEnquiry(input);

    // Best-effort ops ping — a failed email must not lose the enquiry, which is already saved.
    const to = adminNotifyEmail();
    if (to) {
      const rows = [
        ['Brand', enquiry.brand],
        ['Contact', `${enquiry.contactName} · ${enquiry.email}${enquiry.phone ? ` · ${enquiry.phone}` : ''}`],
        ['Wants', GOAL_LABELS[enquiry.goal as EnquiryGoal]],
        ['Budget', enquiry.budgetBand ? BUDGET_LABELS[enquiry.budgetBand as BudgetBand] : 'Not stated'],
        ['Message', enquiry.message || '—'],
      ];
      const mail = genericNoticeEmail({
        title: 'New brand enquiry',
        subject: `[Brand] ${enquiry.brand} · ${GOAL_LABELS[enquiry.goal as EnquiryGoal]}`,
        bodyHtml: rows
          .map(
            ([label, value]) =>
              `<p style="margin:0 0 10px;font-size:14px;color:#3a3532;"><strong>${label}:</strong> ${escapeHtml(String(value))}</p>`
          )
          .join(''),
      });
      await sendEmail({ to, subject: mail.subject, html: mail.html }).catch(() => null);
    }

    return NextResponse.json({ ok: true, id: enquiry.id }, { status: 201 });
  } catch (err) {
    captureApiError(err, { route: 'trivia/brand-enquiry POST' });
    const { status, error } = apiErrorResponse(err, 'Unable to send that enquiry.');
    return NextResponse.json({ error }, { status });
  }
}
