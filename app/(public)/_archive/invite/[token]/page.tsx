import * as repo from '@/lib/calendar/repo';
import InviteResponseCard from '@/components/calendar/InviteResponseCard';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let info;
  try {
    info = await repo.getInviteByToken(token);
  } catch (err) {
    console.error('[GET /invite/[token]]', err);
    info = null;
  }

  if (!info) {
    return (
      <section className="zen-ribbon-bg min-h-[80vh] flex items-center justify-center px-6 text-center">
        <p className="font-display text-2xl italic text-obsidian/60">This invite link isn&apos;t valid.</p>
      </section>
    );
  }

  return <InviteResponseCard token={token} initial={info} />;
}
