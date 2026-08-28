'use client';

import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, FileText, Upload } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import {
  isSuspicious,
  type PriceListSummary,
  type PriceProposal,
} from '@/lib/pricing/parse-price-list';

/** Browsers hand us a File; the API wants a data: URI it can pass straight to the vision model. */
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}

export default function PriceListImport({ onApplied }: { onApplied: () => void }) {
  const [text, setText] = useState('');
  const [proposals, setProposals] = useState<PriceProposal[] | null>(null);
  const [summary, setSummary] = useState<PriceListSummary | null>(null);
  const [transcript, setTranscript] = useState('');
  const [chosen, setChosen] = useState<Record<number, boolean>>({});
  const [reading, setReading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const changeable = useMemo(
    () => (proposals || []).filter((p) => p.slug && p.status === 'new-price'),
    [proposals]
  );
  const selectedCount = changeable.filter((p) => chosen[p.line]).length;

  async function read(payload: { text?: string; imageBase64?: string }) {
    setReading(true);
    setError('');
    setDone('');
    try {
      const res = await fetch('/api/admin/price-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to read that price list.');

      setProposals(data.proposals);
      setSummary(data.summary);
      setTranscript(data.transcript || '');
      // Pre-tick everything that changes and looks plausible; leave the odd ones for a human.
      const next: Record<number, boolean> = {};
      for (const p of data.proposals as PriceProposal[]) {
        if (p.slug && p.status === 'new-price') next[p.line] = !isSuspicious(p);
      }
      setChosen(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to read that price list.');
      setProposals(null);
      setSummary(null);
    } finally {
      setReading(false);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imageBase64 = await readAsDataUrl(file);
      await read({ imageBase64 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that file.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function apply() {
    const updates = changeable
      .filter((p) => chosen[p.line])
      .map((p) => ({ slug: p.slug as string, priceNgn: p.priceNgn }));
    if (!updates.length) return;

    setApplying(true);
    setError('');
    try {
      const res = await fetch('/api/admin/price-list', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to apply price updates.');

      const failed = (data.failed || []).length;
      setDone(
        `Updated ${data.applied.length} price${data.applied.length === 1 ? '' : 's'}` +
          (failed ? ` · ${failed} failed` : '.')
      );
      setProposals(null);
      setSummary(null);
      setChosen({});
      setText('');
      onApplied();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to apply price updates.');
    } finally {
      setApplying(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40 mb-1">
          Price list import
        </h2>
        <p className="text-[11px] text-obsidian/50 max-w-prose">
          Photograph a supplier price list or paste it as text. We read it, match each row to a SKU,
          and show you what would change. Nothing is saved until you apply.
        </p>
      </div>

      {error && <p className="text-sm text-ember">{error}</p>}
      {done && (
        <p className="text-sm text-emerald-700 inline-flex items-center gap-1.5">
          <Check size={14} /> {done}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
          onChange={onFile}
          className="hidden"
          id="price-list-file"
        />
        <label
          htmlFor="price-list-file"
          className="btn-brand text-[11px] px-4 py-2 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Upload size={13} /> Scan a price list
        </label>
        <span className="text-[11px] text-obsidian/40">or paste it below</span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder={'Jameson Original - 45,000\nHennessy VS - 82,000\nMoet Imperial - 195,000'}
        className="w-full border border-obsidian/15 px-3 py-2 text-sm font-mono"
      />
      <button
        type="button"
        onClick={() => read({ text })}
        disabled={reading || !text.trim()}
        className="btn-brand text-[11px] px-4 py-2 inline-flex items-center gap-1.5 disabled:opacity-40"
      >
        <FileText size={13} /> {reading ? 'Reading…' : 'Read list'}
      </button>

      {summary && proposals && (
        <div className="space-y-3 pt-2">
          <p className="text-[11px] text-obsidian/55">
            {summary.parsed} rows read · {summary.matched} matched · {summary.changed} price changes ·{' '}
            {summary.unchanged} already correct · {summary.unmatched} unmatched
            {summary.suspicious > 0 && (
              <span className="text-ember"> · {summary.suspicious} look wrong</span>
            )}
          </p>

          <div className="overflow-x-auto border border-obsidian/10">
            <table className="w-full text-[12px] bg-white">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-obsidian/40 border-b border-obsidian/10">
                  <th className="p-2 w-8" />
                  <th className="p-2">On the list</th>
                  <th className="p-2">Matched SKU</th>
                  <th className="p-2 text-right">Now</th>
                  <th className="p-2 text-right">New</th>
                  <th className="p-2 text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => {
                  const editable = Boolean(p.slug) && p.status === 'new-price';
                  const odd = isSuspicious(p);
                  return (
                    <tr
                      key={p.line}
                      className={`border-b border-obsidian/5 ${
                        p.status === 'unmatched' ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="p-2">
                        {editable && (
                          <input
                            type="checkbox"
                            aria-label={`Apply ${p.rawName}`}
                            checked={Boolean(chosen[p.line])}
                            onChange={(e) => setChosen({ ...chosen, [p.line]: e.target.checked })}
                          />
                        )}
                      </td>
                      <td className="p-2 text-obsidian/70">{p.rawName}</td>
                      <td className="p-2">
                        {p.matchedName ? (
                          <span className="text-obsidian">
                            {p.matchedName}
                            <span className="text-obsidian/35"> · {Math.round(p.confidence * 100)}%</span>
                          </span>
                        ) : (
                          <span className="text-obsidian/40">no match — skipped</span>
                        )}
                      </td>
                      <td className="p-2 text-right tabular-nums text-obsidian/50">
                        {p.currentPriceNgn != null ? formatNgn(p.currentPriceNgn) : '—'}
                      </td>
                      <td className="p-2 text-right tabular-nums font-semibold">
                        {formatNgn(p.priceNgn)}
                      </td>
                      <td className="p-2 text-right tabular-nums">
                        {p.status === 'unchanged' ? (
                          <span className="text-obsidian/35">no change</span>
                        ) : p.changePct != null ? (
                          <span
                            className={`inline-flex items-center gap-1 ${
                              odd ? 'text-ember font-semibold' : 'text-obsidian/60'
                            }`}
                          >
                            {odd && <AlertTriangle size={11} />}
                            {p.changePct > 0 ? '+' : ''}
                            {p.changePct}%
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {summary.suspicious > 0 && (
            <p className="text-[11px] text-ember">
              Rows marked with a warning move the price by more than 60% — usually a misread digit.
              They are left unticked; tick them only if the jump is real.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={apply}
              disabled={applying || selectedCount === 0}
              className="btn-brand text-[11px] px-4 py-2 disabled:opacity-40"
            >
              {applying ? 'Applying…' : `Apply ${selectedCount} price change${selectedCount === 1 ? '' : 's'}`}
            </button>
            <button
              type="button"
              onClick={() => {
                setProposals(null);
                setSummary(null);
                setChosen({});
              }}
              className="text-[11px] text-obsidian/45 hover:text-obsidian"
            >
              Discard
            </button>
          </div>

          {transcript && (
            <details className="text-[11px] text-obsidian/45">
              <summary className="cursor-pointer">What the scan read</summary>
              <pre className="mt-2 p-3 bg-paper border border-obsidian/10 overflow-x-auto whitespace-pre-wrap">
                {transcript}
              </pre>
            </details>
          )}
        </div>
      )}
    </section>
  );
}
