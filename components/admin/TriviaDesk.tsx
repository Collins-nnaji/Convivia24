'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useDialogs } from './ui/DialogProvider';
import { AdminInput, AdminSelect, AdminTextArea } from './ui/Fields';
import { readError } from './types';

type TriviaWeek = {
  id: string;
  roundSlug: string;
  weekStart: string;
  weekEnd: string;
  published: boolean;
  live: boolean;
};

type RoundOption = { slug: string; brand: string; prizeLabel: string; prizeSlug?: string; prizeImage?: string | null };
type CustomQuestion = { databaseId: string; roundSlug: string; prompt: string; options: string[]; answerIndex: number; explainer: string };

type TriviaEntry = {
  id: string;
  code: string;
  roundSlug: string;
  brand: string;
  name: string;
  email: string;
  phone: string | null;
  score: number;
  total: number;
  status: string;
  createdAt: string;
};

const ENTRY_TONE: Record<string, string> = {
  won: 'bg-ember text-white',
  claimed: 'bg-obsidian text-white',
};

export default function TriviaDesk({ onChanged }: { onChanged?: () => void }) {
  const { confirm } = useDialogs();
  const [error, setError] = useState('');
  const [entries, setEntries] = useState<TriviaEntry[]>([]);
  const [weeks, setWeeks] = useState<TriviaWeek[]>([]);
  const [rounds, setRounds] = useState<RoundOption[]>([]);
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [questionRound, setQuestionRound] = useState('');
  const [weekRound, setWeekRound] = useState('');
  const [weekStart, setWeekStart] = useState('');
  const [entryFilter, setEntryFilter] = useState<'all' | 'won' | 'entered' | 'claimed'>('all');

  const load = useCallback(async () => {
    const [entryRes, schedRes] = await Promise.all([fetch('/api/admin/trivia'), fetch('/api/admin/trivia/schedule')]);
    const entryData = await entryRes.json().catch(() => ({}));
    const schedData = await schedRes.json().catch(() => ({}));
    if (!entryRes.ok && !schedRes.ok) {
      setError(entryData.error || schedData.error || 'Could not load trivia.');
      return;
    }
    setError(entryData.error || schedData.error || '');
    setEntries(entryData.entries || []);
    setWeeks(schedData.weeks || []);
    const availableRounds: RoundOption[] = entryData.rounds || schedData.rounds || [];
    setRounds(availableRounds);
    setQuestions(entryData.questions || []);
    setWeekRound((v) => v || availableRounds[0]?.slug || '');
    setQuestionRound((v) => v || availableRounds[0]?.slug || '');
    setWeekStart((v) => v || schedData.thisWeek || '');
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function scheduleWeek() {
    setError('');
    const res = await fetch('/api/admin/trivia/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roundSlug: weekRound, weekStart }),
    });
    if (!res.ok) {
      setError(await readError(res, 'Could not schedule the week.'));
      return;
    }
    const data = await res.json();
    setWeeks((rows) => {
      const without = rows.filter((r) => r.weekStart !== data.week.weekStart);
      return [data.week, ...without].sort((a, b) => b.weekStart.localeCompare(a.weekStart));
    });
  }

  async function removeWeek(week: TriviaWeek) {
    setError('');
    const res = await fetch(`/api/admin/trivia/schedule?id=${encodeURIComponent(week.id)}`, { method: 'DELETE' });
    if (!res.ok) {
      setError(await readError(res, 'Could not remove the week.'));
      return;
    }
    setWeeks((rows) => rows.filter((r) => r.id !== week.id));
  }

  async function addQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const res = await fetch('/api/admin/trivia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roundSlug: questionRound,
        prompt: data.get('prompt'),
        options: [0, 1, 2, 3].map((i) => data.get(`option${i}`)),
        answerIndex: Number(data.get('answerIndex')),
        explainer: data.get('explainer'),
      }),
    });
    if (!res.ok) {
      setError(await readError(res, 'Could not add question.'));
      return;
    }
    const body = await res.json();
    setQuestions((rows) => [...rows, body.question]);
    form.reset();
  }

  async function removeQuestion(question: CustomQuestion) {
    const res = await fetch(`/api/admin/trivia?questionId=${encodeURIComponent(question.databaseId)}`, { method: 'DELETE' });
    if (res.ok) setQuestions((rows) => rows.filter((item) => item.databaseId !== question.databaseId));
    else setError('Could not remove the question.');
  }

  async function deleteEntry(entry: TriviaEntry) {
    const ok = await confirm({
      title: 'Delete trivia entry?',
      message: (
        <>
          The entry from <strong>{entry.name}</strong> is removed from this week&apos;s round.
        </>
      ),
      confirmLabel: 'Delete entry',
      tone: 'danger',
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/trivia?id=${encodeURIComponent(entry.id)}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('Could not delete entry.');
      return;
    }
    setEntries((rows) => rows.filter((r) => r.id !== entry.id));
    onChanged?.();
  }

  async function setEntryStatus(entry: TriviaEntry, status: string) {
    setError('');
    const res = await fetch('/api/admin/trivia', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: entry.id, status }),
    });
    if (!res.ok) {
      setError(await readError(res, 'Could not update the entry.'));
      return;
    }
    setEntries((rows) => rows.map((r) => (r.id === entry.id ? { ...r, status } : r)));
    onChanged?.();
  }

  const roundOptions = rounds.map((r) => ({ value: r.slug, label: `${r.brand} — ${r.prizeLabel}` }));
  const selectedRound = rounds.find((r) => r.slug === questionRound);
  const noRounds = rounds.length === 0;
  const visibleEntries = entryFilter === 'all' ? entries : entries.filter((e) => e.status === entryFilter);
  const unclaimed = entries.filter((e) => e.status === 'won').length;

  return (
    <>
      {error && <p className="mb-6 text-sm text-ember">{error}</p>}

      <div className="mb-12 bg-white p-6 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)] sm:p-8">
        <h2 className="font-bold">Brand of the week</h2>
        <p className="mb-5 mt-1 text-sm text-obsidian/50">
          One sponsoring house plays at a time. The week covering today is live on /discover; every other round stays
          open as practice with no draw.
        </p>
        <div className="grid items-end gap-4 sm:grid-cols-3">
          <AdminSelect label="Brand" value={weekRound} onChange={setWeekRound} options={roundOptions} disabled={noRounds} />
          <AdminInput label="Week starting" type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
          <button
            type="button"
            onClick={scheduleWeek}
            disabled={!weekRound || !weekStart}
            className="btn-brand px-5 py-3 text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-40"
          >
            Set week
          </button>
        </div>

        {weeks.length > 0 && (
          <ul className="mt-6 space-y-2 border-t border-obsidian/10 pt-6">
            {weeks.map((week) => (
              <li key={week.id} className="flex flex-wrap items-center gap-3">
                <span className="w-40 text-[11px] tabular-nums text-obsidian/45">
                  {week.weekStart} → {week.weekEnd}
                </span>
                <span className="text-sm font-medium">{rounds.find((r) => r.slug === week.roundSlug)?.brand || week.roundSlug}</span>
                {week.live && (
                  <span className="bg-ember px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-white">Live</span>
                )}
                {!week.published && (
                  <span className="bg-paper px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-obsidian/45">Hidden</span>
                )}
                <button
                  type="button"
                  onClick={() => removeWeek(week)}
                  className="ml-auto text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40 hover:text-ember"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_.9fr]">
        <form onSubmit={addQuestion} className="space-y-4 bg-white p-6 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
          <div>
            <h2 className="font-bold">Add trivia question</h2>
            <p className="mt-1 text-sm text-obsidian/50">
              Questions can only be attached to prize bottles already available with an image.
            </p>
          </div>
          {noRounds ? (
            <p className="text-sm text-ember">No rounds have a prize bottle with an image yet, so there is nothing to attach a question to.</p>
          ) : (
            <fieldset className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <AdminSelect label="Drink / round" value={questionRound} onChange={setQuestionRound} options={roundOptions} required />
                {selectedRound?.prizeImage && (
                  <Image src={selectedRound.prizeImage} alt="" width={44} height={56} className="h-14 w-11 object-contain" />
                )}
              </div>
              <AdminInput name="prompt" label="Question" required />
              <div className="grid gap-3 sm:grid-cols-2">
                {[0, 1, 2, 3].map((index) => (
                  <AdminInput key={index} name={`option${index}`} label={`Answer ${index + 1}`} required />
                ))}
              </div>
              <AdminSelect
                name="answerIndex"
                label="Correct answer"
                defaultValue="0"
                options={[0, 1, 2, 3].map((i) => ({ value: String(i), label: `Answer ${i + 1}` }))}
              />
              <AdminTextArea name="explainer" label="Answer explanation" rows={2} />
              <button type="submit" className="btn-brand px-5 py-3 text-[11px] font-black uppercase tracking-[0.12em]">
                Add question
              </button>
            </fieldset>
          )}
        </form>

        <div className="bg-white p-6 shadow-sm">
          <h2 className="font-bold">Added questions ({questions.length})</h2>
          <div className="mt-4 max-h-[32rem] divide-y divide-obsidian/8 overflow-y-auto">
            {questions.map((question) => (
              <div key={question.databaseId} className="py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-ember">
                  {rounds.find((round) => round.slug === question.roundSlug)?.brand || question.roundSlug}
                </p>
                <p className="mt-1 text-sm font-semibold text-obsidian">{question.prompt}</p>
                <p className="mt-1 text-xs text-obsidian/45">Correct: {question.options[question.answerIndex]}</p>
                <button
                  type="button"
                  onClick={() => removeQuestion(question)}
                  className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-ember"
                >
                  Remove
                </button>
              </div>
            ))}
            {questions.length === 0 && <p className="py-6 text-sm text-obsidian/40">No extra questions yet.</p>}
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mb-1 font-bold">Draw entries</h2>
          <p className="text-sm text-obsidian/50">
            Everyone who passed a brand round. Mark a winner, then mark the bottle claimed once collected.
            {unclaimed > 0 && <span className="text-ember"> {unclaimed} winner{unclaimed === 1 ? '' : 's'} yet to collect.</span>}
          </p>
        </div>
        <AdminSelect
          value={entryFilter}
          onChange={(v) => setEntryFilter(v as typeof entryFilter)}
          options={[
            { value: 'all', label: `All (${entries.length})` },
            { value: 'won', label: 'Won — awaiting collection' },
            { value: 'claimed', label: 'Claimed' },
            { value: 'entered', label: 'Entered' },
          ]}
          className="w-auto"
        />
      </div>
      <div className="space-y-3">
        {visibleEntries.map((entry) => (
          <div key={entry.id} className="flex flex-col gap-4 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{entry.name}</p>
                <span className="bg-paper px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-obsidian/50">{entry.brand}</span>
                <span
                  className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${
                    ENTRY_TONE[entry.status] ?? 'bg-paper text-obsidian/45'
                  }`}
                >
                  {entry.status}
                </span>
              </div>
              <p className="mt-1 truncate text-[12px] text-obsidian/50">
                {entry.email}
                {entry.phone ? ` · ${entry.phone}` : ''} · scored {entry.score}/{entry.total}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-obsidian/40">{entry.code}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {(['won', 'claimed', 'void'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={entry.status === status}
                  onClick={() => setEntryStatus(entry, status)}
                  className="border border-obsidian/15 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-35"
                >
                  {status}
                </button>
              ))}
              <button
                type="button"
                onClick={() => deleteEntry(entry)}
                className="border border-ember/40 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-ember"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {visibleEntries.length === 0 && !error && (
          <p className="text-sm text-obsidian/45">{entries.length === 0 ? 'No entries yet.' : 'Nothing matches that filter.'}</p>
        )}
      </div>
    </>
  );
}
