import { safeNextPath } from '@/lib/age-gate';
import AgeConfirmButtons from '@/components/age/AgeConfirmButtons';

type Props = { searchParams: Promise<{ next?: string | string[]; error?: string | string[] }> };

/**
 * Server-rendered gate. "Yes" is a native form POST to /api/age-gate, which sets the cookie and
 * redirects in the same response, so confirming takes a single request and works even before the
 * page's JavaScript has loaded.
 */
export default async function AgeCheckPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = safeNextPath(Array.isArray(params.next) ? params.next[0] : params.next);
  const rateLimited = params.error === 'rate';

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-obsidian px-5 py-10">
      <form method="post" action="/api/age-gate" className="w-full max-w-md bg-white p-8 sm:p-10 shadow-2xl">
        <input type="hidden" name="next" value={next} />
        <img src="/convivia24.png" alt="Convivia24" className="h-10 w-auto rounded-sm mb-6" />
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-3">Delivery in supported areas across Nigeria · 18+</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-obsidian leading-tight mb-3">
          Are you of legal drinking age?
        </h1>
        <p className="text-sm text-obsidian/55 leading-relaxed mb-8">
          We deliver alcohol and mixers to parties, clubs, and lounges. You must be 18 or older to enter.
          By continuing you agree to our{' '}
          <a href="/terms-of-use" className="text-ember underline underline-offset-2">
            Terms
          </a>{' '}
          and{' '}
          <a href="/privacy-policy" className="text-ember underline underline-offset-2">
            Privacy Policy
          </a>
          .
        </p>
        {rateLimited && (
          <p role="alert" className="text-sm text-ember mb-4">Too many attempts. Please wait a minute and try again.</p>
        )}
        <AgeConfirmButtons />
      </form>
    </div>
  );
}
