import { formatNgn } from '@/lib/drinks/catalog';
import { VIBE_LABELS, type DrinkPlan, type PartyVibe } from '@/lib/party/drinks-plan';

export type PlanShareInput = {
  partyName: string;
  occasion: string;
  eventDate?: string;
  venue?: string;
  guests: number;
  hours: number;
  vibe: PartyVibe;
  budgetNgn: number;
  plan: DrinkPlan;
  advice?: string;
};

const MAX_LINES_IMAGE = 18;
const MAX_LINES_PDF = 24;
const CANVAS_WIDTH = 840;
const PAD = 48;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString('en-NG', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/** Estimate canvas height before drawing. */
export function planShareLineLimit(mode: 'image' | 'pdf'): number {
  return mode === 'pdf' ? MAX_LINES_PDF : MAX_LINES_IMAGE;
}

export function planShareFilename(partyName: string): string {
  const safe = partyName.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 40) || 'party-plan';
  return `convivia24-${safe}.png`;
}

/** Render a branded PNG summary card for sharing. */
export async function renderPlanSharePng(input: PlanShareInput): Promise<Blob> {
  const lines = input.plan.lines.slice(0, MAX_LINES_IMAGE);
  const truncated = input.plan.lines.length > MAX_LINES_IMAGE;

  // Pre-measure with offscreen canvas
  const measure = document.createElement('canvas').getContext('2d')!;
  measure.font = '14px system-ui, sans-serif';
  const adviceLines = input.advice
    ? wrapText(measure, input.advice.slice(0, 320), CANVAS_WIDTH - PAD * 2).slice(0, 3)
    : [];
  const itemHeights = lines.map(() => 68);

  const headerHeight = 132;
  const metaHeight = 120;
  const adviceHeight = adviceLines.length ? 24 + adviceLines.length * 18 : 0;
  const itemsHeight = itemHeights.reduce((a, b) => a + b, 0) + 16;
  const footerHeight = 72;
  const totalHeight = headerHeight + metaHeight + adviceHeight + itemsHeight + footerHeight + (truncated ? 24 : 0);

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fafaf8';
  ctx.fillRect(0, 0, CANVAS_WIDTH, totalHeight);

  // Header — white band so the wordmark reads clearly
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 100);
  ctx.fillStyle = '#8B2A22';
  ctx.fillRect(0, 100, CANVAS_WIDTH, 4);

  try {
    const logo = await loadImage('/convivia24.png');
    const logoW = 220;
    const logoH = (logo.height / logo.width) * logoW;
    ctx.drawImage(logo, PAD, 24, logoW, logoH);
  } catch {
    ctx.fillStyle = '#0a0a0a';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText('Convivia24', PAD, 56);
  }

  ctx.fillStyle = '#6b6560';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('Party drink plan · nationwide delivery · 18+', PAD, 92);

  let y = 132;
  ctx.fillStyle = '#0a0a0a';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(input.partyName.trim() || 'My party', PAD, y);
  y += 34;

  ctx.font = '13px system-ui, sans-serif';
  ctx.fillStyle = '#6b6560';
  const meta = [
    input.occasion,
    formatDate(input.eventDate),
    input.venue,
    `${input.guests} guests · ${input.hours}h · ${VIBE_LABELS[input.vibe]}`,
    input.budgetNgn > 0 ? `Budget ${formatNgn(input.budgetNgn)}` : '',
  ].filter(Boolean);
  for (const row of meta) {
    ctx.fillText(row, PAD, y);
    y += 20;
  }

  y += 8;
  ctx.fillStyle = '#8B2A22';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(formatNgn(input.plan.totalNgn), PAD, y);
  ctx.fillStyle = '#6b6560';
  ctx.font = '12px system-ui, sans-serif';
  y += 28;

  if (adviceLines.length) {
    ctx.fillStyle = '#0a0a0a';
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.fillText('Planner notes', PAD, y);
    y += 18;
    ctx.fillStyle = '#6b6560';
    ctx.font = '12px system-ui, sans-serif';
    for (const row of adviceLines) {
      ctx.fillText(row, PAD, y);
      y += 18;
    }
    y += 8;
  }

  ctx.strokeStyle = '#ece8e4';
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(CANVAS_WIDTH - PAD, y);
  ctx.stroke();
  y += 20;

  ctx.font = '600 13px system-ui, sans-serif';
  for (const [i, line] of lines.entries()) {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillText(`${line.name}  ×${line.qty}`, PAD, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#8B2A22';
    ctx.fillText(formatNgn(line.priceNgn * line.qty), CANVAS_WIDTH - PAD, y);
    ctx.textAlign = 'left';
    y += 18;

    ctx.fillStyle = '#6b6560';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(`${formatNgn(line.priceNgn)} / bottle`, PAD, y);
    y += 16;
    ctx.font = '600 13px system-ui, sans-serif';

    if (i < lines.length - 1) {
      y += 8;
      ctx.strokeStyle = '#ece8e4';
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(CANVAS_WIDTH - PAD, y);
      ctx.stroke();
      y += 16;
    }
  }

  if (truncated) {
    ctx.fillStyle = '#6b6560';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(`+ ${input.plan.lines.length - MAX_LINES_IMAGE} more items on convivia24.com/plan`, PAD, y);
    y += 20;
  }

  ctx.fillStyle = '#0a0a0a';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('convivia24.com · Drink supplies for events', PAD, totalHeight - 28);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create image'))), 'image/png');
  });
}

export function canSharePlanPdf(plan: DrinkPlan): boolean {
  return plan.lines.length <= MAX_LINES_PDF;
}

/** Open a print-friendly page the user can save as PDF. */
export function printPlanSharePdf(input: PlanShareInput): void {
  if (!canSharePlanPdf(input.plan)) return;

  const rows = input.plan.lines
    .map(
      (line) =>
        `<tr><td>${escapeHtml(line.name)}<br><span style="color:#6b6560;font-size:11px">${escapeHtml(formatNgn(line.priceNgn))} / bottle</span></td><td style="text-align:center">×${line.qty}</td><td style="text-align:right;font-weight:600">${escapeHtml(formatNgn(line.priceNgn * line.qty))}</td></tr>`
    )
    .join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(input.partyName || 'Party plan')} · Convivia24</title>
<style>
  body{font-family:system-ui,sans-serif;color:#0a0a0a;margin:0;padding:32px;background:#fff}
  .head{border-bottom:3px solid #8B2A22;padding-bottom:16px;margin-bottom:20px}
  img{height:36px;width:auto}
  h1{font-family:Georgia,serif;margin:12px 0 4px;font-size:22px}
  .meta{color:#6b6560;font-size:13px;line-height:1.6}
  .total{font-size:20px;color:#8B2A22;font-weight:700;margin:16px 0}
  table{width:100%;border-collapse:collapse;font-size:13px}
  td{padding:10px 0;border-bottom:1px solid #ece8e4;vertical-align:top}
  footer{margin-top:24px;font-size:11px;color:#6b6560}
</style></head><body>
<div class="head"><img src="/convivia24.png" alt="Convivia24"><h1>${escapeHtml(input.partyName || 'My party')}</h1>
<div class="meta">${escapeHtml(input.occasion)}${input.eventDate ? ` · ${escapeHtml(formatDate(input.eventDate))}` : ''}${input.venue ? ` · ${escapeHtml(input.venue)}` : ''}<br>
${input.guests} guests · ${input.hours} hours · ${escapeHtml(VIBE_LABELS[input.vibe])}${input.budgetNgn > 0 ? ` · Budget ${escapeHtml(formatNgn(input.budgetNgn))}` : ''}</div>
<div class="total">${escapeHtml(formatNgn(input.plan.totalNgn))}</div></div>
${input.advice ? `<p style="font-size:12px;color:#6b6560;line-height:1.5;margin-bottom:16px">${escapeHtml(input.advice.slice(0, 400))}</p>` : ''}
<table><thead><tr><th align="left">Item</th><th>Qty</th><th align="right">Total</th></tr></thead><tbody>${rows}</tbody></table>
<footer>convivia24.com · Drink supplies for events · Nationwide delivery · 18+</footer>
<script>window.onload=()=>window.print()</script></body></html>`;

  const win = window.open('', '_blank', 'noopener,noreferrer');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
