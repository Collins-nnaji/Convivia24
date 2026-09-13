'use client';

import { useState } from 'react';
import { Check, RefreshCw, Trash2, Wand2 } from 'lucide-react';
import { useDialogs } from './ui/DialogProvider';
import { AdminInput, AdminSelect } from './ui/Fields';
import { readError } from './types';

export type Draft = { prompt: string; options: string[]; answerIndex: number; explainer: string };

/**
 * AI drafts for one round. Nothing is saved until the desk presses Add on a draft — the model
 * proposes, a person approves.
 */
export default function TriviaAiDrafts({
  roundSlug,
  roundLabel,
  aiOk,
  onAdd,
}: {
  roundSlug: string;
  roundLabel: string;
  aiOk: boolean;
  onAdd: (draft: Draft) => Promise<boolean>;
}) {
  const { notify } = useDialogs();
  const [count, setCount] = useState('5');
  const [focus, setFocus] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/trivia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', roundSlug, count: Number(count), focus }),
      });
      if (!res.ok) {
        notify(await readError(res, 'Could not generate questions.'), 'error');
        return;
      }
      const data = await res.json();
      setDrafts(data.drafts || []);
    } finally {
      setLoading(false);
    }
  }

  const patch = (i: number, p: Partial<Draft>) => setDrafts((d) => d.map((x, j) => (j === i ? { ...x, ...p } : x)));

  async function add(i: number) {
    setAdding(i);
    try {
      if (await onAdd(drafts[i])) setDrafts((d) => d.filter((_, j) => j !== i));
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="rounded-2xl border border-obsidian/10 bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-bold">Draft questions with AI</h3>
          <p className="text-sm text-obsidian/50">For {roundLabel}. Review each one — edit, add or drop it. Nothing is saved until you add it.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <AdminSelect label="How many" value={count} onChange={setCount} options={['3', '5', '8', '10']} className="w-24 py-2" />
          <AdminInput label="Focus" hint="optional" value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. production, history" className="w-52 py-2" />
          <button
            type="button"
            onClick={generate}
            disabled={loading || !aiOk || !roundSlug}
            title={aiOk ? undefined : 'Azure OpenAI is not configured'}
            className="btn-brand inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-40"
          >
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <Wand2 size={13} />} {loading ? 'Drafting…' : drafts.length ? 'Draft more' : 'Draft questions'}
          </button>
        </div>
      </div>

      {drafts.length > 0 && (
        <ul className="mt-4 divide-y divide-obsidian/8">
          {drafts.map((d, i) => (
            <li key={i} className="space-y-2 py-4">
              <AdminInput value={d.prompt} onChange={(e) => patch(i, { prompt: e.target.value })} className="font-semibold" aria-label="Question" />
              <div className="grid gap-2 sm:grid-cols-2">
                {d.options.map((o, k) => (
                  <label key={k} className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${d.answerIndex === k ? 'border-emerald-300 bg-emerald-50/60' : 'border-obsidian/10'}`}>
                    <input type="radio" name={`draft-${i}`} checked={d.answerIndex === k} onChange={() => patch(i, { answerIndex: k })} className="text-ember focus:ring-ember" title="Correct answer" />
                    <input
                      value={o}
                      onChange={(e) => patch(i, { options: d.options.map((x, j) => (j === k ? e.target.value : x)) })}
                      className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
                      aria-label={`Answer ${k + 1}`}
                    />
                  </label>
                ))}
              </div>
              <AdminInput value={d.explainer} onChange={(e) => patch(i, { explainer: e.target.value })} placeholder="Explainer" className="text-[13px]" aria-label="Explainer" />
              <div className="flex gap-2">
                <button type="button" disabled={adding === i} onClick={() => add(i)} className="inline-flex items-center gap-1.5 rounded-lg bg-obsidian px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white hover:bg-ember disabled:opacity-40">
                  <Check size={12} /> Add to round
                </button>
                <button type="button" onClick={() => setDrafts((x) => x.filter((_, j) => j !== i))} className="inline-flex items-center gap-1.5 rounded-lg border border-obsidian/15 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/60 hover:border-ember hover:text-ember">
                  <Trash2 size={12} /> Drop
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
