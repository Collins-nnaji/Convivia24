'use client';

import { useState } from 'react';
import { Download, FileText, Share2 } from 'lucide-react';
import {
  canSharePlanPdf,
  planShareFilename,
  printPlanSharePdf,
  renderPlanSharePng,
  type PlanShareInput,
} from '@/lib/party/render-plan-share';

export default function PlanShareActions({ input, disabled }: { input: PlanShareInput; disabled?: boolean }) {
  const [busy, setBusy] = useState<'image' | 'share' | null>(null);
  const [msg, setMsg] = useState('');

  async function downloadImage() {
    if (disabled || !input.plan.lines.length) return;
    setBusy('image');
    setMsg('');
    try {
      const blob = await renderPlanSharePng(input);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = planShareFilename(input.partyName);
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Image saved.');
    } catch {
      setMsg('Could not create the image. Try again.');
    } finally {
      setBusy(null);
    }
  }

  async function shareImage() {
    if (disabled || !input.plan.lines.length) return;
    setBusy('share');
    setMsg('');
    try {
      const blob = await renderPlanSharePng(input);
      const file = new File([blob], planShareFilename(input.partyName), { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${input.partyName || 'Party plan'} · Convivia24`,
          text: `Drink plan for ${input.guests} guests — ${input.plan.lines.length} items.`,
          files: [file],
        });
        setMsg('Shared.');
      } else {
        await downloadImage();
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        setMsg('Share unavailable — use Download image instead.');
      }
    } finally {
      setBusy(null);
    }
  }

  function savePdf() {
    if (disabled || !canSharePlanPdf(input.plan)) return;
    printPlanSharePdf(input);
    setMsg('Print dialog opened — choose Save as PDF.');
  }

  const pdfOk = canSharePlanPdf(input.plan);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={shareImage}
          disabled={disabled || busy !== null}
          className="inline-flex items-center gap-2 px-4 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-50"
        >
          <Share2 size={14} /> {busy === 'share' ? 'Preparing…' : 'Share plan'}
        </button>
        <button
          type="button"
          onClick={downloadImage}
          disabled={disabled || busy !== null}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-50"
        >
          <Download size={14} /> {busy === 'image' ? 'Saving…' : 'Download image'}
        </button>
        {pdfOk && (
          <button
            type="button"
            onClick={savePdf}
            disabled={disabled}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-50"
          >
            <FileText size={14} /> Save PDF
          </button>
        )}
      </div>
      {!pdfOk && input.plan.lines.length > 0 && (
        <p className="text-[11px] text-obsidian/45">
          PDF is available for plans with up to 24 items — download the image for longer baskets.
        </p>
      )}
      {msg && <p className="text-[11px] text-obsidian/55">{msg}</p>}
    </div>
  );
}
