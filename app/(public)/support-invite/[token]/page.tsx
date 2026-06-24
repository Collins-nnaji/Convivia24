import * as repo from '@/lib/support/repo';
import SupportSessionResponseCard from '@/components/support/SupportSessionResponseCard';

export default async function SupportInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let session;
  try {
    session = await repo.getSessionByToken(token);
  } catch (err) {
    console.error('[GET /support-invite/[token]]', err);
    session = null;
  }

  if (!session) {
    return (
      <section className="zen-ribbon-bg min-h-[80vh] flex items-center justify-center px-6 text-center">
        <p className="font-display text-2xl italic text-obsidian/60">This booking link isn&apos;t valid.</p>
      </section>
    );
  }

  return <SupportSessionResponseCard token={token} initial={session} />;
}
