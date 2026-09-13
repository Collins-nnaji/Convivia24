'use client';

import { useCallback, useEffect, useState } from 'react';
import { Mail, Trophy } from 'lucide-react';
import { useDialogs } from './ui/DialogProvider';
import { AdminSelect, AdminTextArea } from './ui/Fields';
import { formatWhen, readError } from './types';

type Week = { id: string; roundSlug: string; weekStart: string; weekEnd: string; live: boolean };
type Round = { slug: string; brand: string; prizeLabel: string };
type Eligible = { id: string; name: string; email: string; score: number; total: number; createdAt: string };
type Draw = {
  id: string;
  roundSlug: string;
  brand: string;
  weekStart: string | null;
  weekEnd: string | null;
  prizeLabel: string;
  eligibleCount: number;
  drawnAt: string;
  winner: { entryId: string; name: string; email: string; phone: string | null; code: string; status: string };
  winnerNotifiedAt: string | null;
  othersNotifiedAt: string | null;
  othersNotifiedCount: number;
};

/**
 * The bottle draw. Pick the week (or a whole round), see who is in the hat, draw. The winner's
 * entry flips to `won`, they get the claim-code email, and the desk gets a copy.
 */
export default function TriviaDrawDesk({ rounds, weeks, onDrawn }: { rounds: Round[]; weeks: Week[]; onDrawn: () => void }) {
  const { confirm, notify } = useDialogs();
  const [weekId, setWeekId] = useState('');
  const [roundSlug, setRoundSlug] = useState('');
  const [eligible, setEligible] = useState<Eligible[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [mailOk, setMailOk] = useState(false);
  const [notifyOthers, setNotifyOthers] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');

  // Default to the live week, else the most recent.
  useEffect(() => {
    if (weekId || weeks.length === 0) return;
    const live = weeks.find((w) => w.live) || weeks[0];
    setWeekId(live.id);
    setRoundSlug(live.roundSlug);
  }, [weeks, weekId]);

  const week = weeks.find((w) => w.id === weekId) || null;
  const effectiveRound = week?.roundSlug || roundSlug;
  const round = rounds.find((r) => r.slug === effectiveRound);
  const alreadyDrawn = week ? draws.find((d) => d.roundSlug === week.roundSlug && d.weekStart === week.weekStart) : null;

  const load = useCallback(async () => {
    const qs = new URLSearchParams();
    if (effectiveRound) qs.set('round', effectiveRound);
    if (week) qs.set('week', week.weekStart);
    const res = await fetch(`/api/admin/trivia/draws?${qs}`);
    if (!res.ok) return;
    const data = await res.json();
    setDraws(data.draws || []);
    setEligible(data.eligible || []);
    setMailOk(Boolean(data.mailConfigured));
  }, [effectiveRound, week]);

  useEffect(() => {
    load();
  }, [load]);

  async function draw() {
    if (!round) return;
    const ok = await confirm({
      title: `Draw the ${round.brand} winner?`,
      message: (
        <>
          One name is picked at random from <strong>{eligible.length}</strong> eligible entr{eligible.length === 1 ? 'y' : 'ies'}
          {week ? ` for ${week.weekStart} → ${week.weekEnd}` : ' across the whole round'}. The prize is {round.prizeLabel}.
          {mailOk ? ' The winner is emailed their claim code straight away.' : ' Mail is not configured, so you will need to contact them yourself.'}
        </>
      ),
      confirmLabel: 'Draw winner',
    });
    if (!ok) return;
    setBusy('draw');
    try {
      const res = await fetch('/api/admin/trivia/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundSlug: effectiveRound, weekStart: week?.weekStart || null, notifyWinner: mailOk, notifyOthers: mailOk && notifyOthers, message }),
      });
      if (!res.ok) {
        notify(await readError(res, 'Could not run the draw.'), 'error');
        return;
      }
      const data = await res.json();
      const d: Draw = data.draw;
      notify(`${d.winner.name} won ${d.prizeLabel}${data.winnerMail?.sent ? ' — emailed' : data.winnerMail ? ` — email failed: ${data.winnerMail.error}` : ''}${data.othersCount ? ` · ${data.othersCount} runners-up told` : ''}.`);
      setMessage('');
      await load();
      onDrawn();
    } finally {
      setBusy('');
    }
  }

  async function resend(d: Draw, who: 'winner' | 'others') {
    setBusy(d.id + who);
    try {
      const res = await fetch('/api/admin/trivia/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'notify', id: d.id, who }),
      });
      if (!res.ok) {
        notify(await readError(res, 'Could not send.'), 'error');
        return;
      }
      const data = await res.json();
      notify(who === 'winner' ? `Emailed ${d.winner.email}.` : `Told ${data.count} runners-up.`);
      await load();
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-2xl border border-obsidian/10 bg-white p-5">
        <h3 className="flex items-center gap-2 font-bold"><Trophy size={16} className="text-ember" /> Run the draw</h3>
        <p className="text-sm text-obsidian/50">Everyone who passed the round is in the hat. One draw per brand week.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <AdminSelect
            label="Week"
            value={weekId}
            onChange={(v) => {
              setWeekId(v);
              if (!v) setRoundSlug(rounds[0]?.slug || '');
            }}
            placeholder="Whole round (no week)"
            options={weeks.map((w) => ({ value: w.id, label: `${w.weekStart} → ${w.weekEnd} · ${rounds.find((r) => r.slug === w.roundSlug)?.brand || w.roundSlug}${w.live ? ' (live)' : ''}` }))}
          />
          {!week && <AdminSelect label="Round" value={roundSlug} onChange={setRoundSlug} options={rounds.map((r) => ({ value: r.slug, label: `${r.brand} — ${r.prizeLabel}` }))} />}
        </div>
        <AdminTextArea label="Note in the winner's email" hint="optional" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. We'll deliver within Lagos on Saturday." className="mt-3 min-h-[60px]" />
        <label className="mt-3 flex items-center gap-2 text-sm text-obsidian/70">
          <input type="checkbox" checked={notifyOthers} disabled={!mailOk} onChange={(e) => setNotifyOthers(e.target.checked)} className="rounded border-obsidian/30 text-ember focus:ring-ember" />
          Also email everyone else a &ldquo;not this time&rdquo; ({Math.max(0, eligible.length - 1)} people)
        </label>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-paper px-4 py-3">
          <div>
            <p className="text-2xl font-bold tabular-nums text-obsidian">{eligible.length}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-obsidian/45">in the hat{round ? ` · ${round.prizeLabel}` : ''}</p>
          </div>
          {alreadyDrawn ? (
            <p className="text-sm text-obsidian/55">Drawn {formatWhen(alreadyDrawn.drawnAt)} — <strong>{alreadyDrawn.winner.name}</strong></p>
          ) : (
            <button type="button" disabled={busy === 'draw' || eligible.length === 0 || !round} onClick={draw} className="btn-brand rounded-lg px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-40">
              {busy === 'draw' ? 'Drawing…' : 'Draw winner'}
            </button>
          )}
        </div>

        {eligible.length > 0 && (
          <ul className="mt-3 max-h-56 divide-y divide-obsidian/6 overflow-y-auto text-sm">
            {eligible.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-1.5">
                <span className="min-w-0 truncate">
                  <span className="font-semibold">{e.name}</span> <span className="text-obsidian/45">{e.email}</span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-obsidian/45">{e.score}/{e.total}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-obsidian/10 bg-white p-5">
        <h3 className="font-bold">Past draws</h3>
        {draws.length === 0 ? (
          <p className="mt-2 text-sm text-obsidian/45">No draws yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-obsidian/6">
            {draws.map((d) => (
              <li key={d.id} className="py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">
                    {d.brand} <span className="text-obsidian/45">· {d.weekStart ? `${d.weekStart} → ${d.weekEnd}` : 'whole round'}</span>
                  </p>
                  <span className="text-xs text-obsidian/45">{formatWhen(d.drawnAt)} · {d.eligibleCount} in hat</span>
                </div>
                <p className="mt-1 text-sm">
                  <span className="rounded bg-ember px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">{d.winner.status}</span>{' '}
                  <strong>{d.winner.name}</strong> · {d.winner.email}{d.winner.phone ? ` · ${d.winner.phone}` : ''} · <code className="text-xs">{d.winner.code}</code>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
                  <span className={d.winnerNotifiedAt ? 'text-emerald-700' : 'text-amber-700'}>
                    {d.winnerNotifiedAt ? `Winner emailed ${formatWhen(d.winnerNotifiedAt)}` : 'Winner not emailed'}
                  </span>
                  {mailOk && (
                    <button type="button" disabled={busy === d.id + 'winner'} onClick={() => resend(d, 'winner')} className="inline-flex items-center gap-1 font-black uppercase tracking-wider text-obsidian/50 hover:text-ember disabled:opacity-40">
                      <Mail size={11} /> {d.winnerNotifiedAt ? 'Resend' : 'Send'}
                    </button>
                  )}
                  <span className="text-obsidian/40">
                    {d.othersNotifiedAt ? `${d.othersNotifiedCount} runners-up told` : 'Runners-up not told'}
                  </span>
                  {mailOk && !d.othersNotifiedAt && (
                    <button type="button" disabled={busy === d.id + 'others'} onClick={() => resend(d, 'others')} className="font-black uppercase tracking-wider text-obsidian/50 hover:text-ember disabled:opacity-40">
                      Tell them
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
