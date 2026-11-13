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
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[linear-gradient(118deg,#050505_0%,#141212_55%,#2a1210_100%)] px-5 py-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:22px_22px]" />
      <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-saffron/15 blur-3xl" />
      <form method="post" action="/api/age-gate" className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
        <input type="hidden" name="next" value={next} />
        <img src="/convivia24.png" alt="Convivia24" className="h-10 w-auto rounded-sm mb-6" />
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.16em] text-ember">Delivery in supported areas across Nigeria · 18+</p>
        <h1 className="mb-3 font-serif text-[2rem] font-light leading-tight tracking-tight text-obsidian sm:text-[2.4rem]">
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
