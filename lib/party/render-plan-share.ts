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

const CANVAS_WIDTH = 840;
const PAD = 48;
const ITEM_BLOCK = 58; // name + unit price + divider spacing

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

export function planShareFilename(partyName: string): string {
  const safe = partyName.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 40) || 'party-plan';
  return `convivia24-${safe}.png`;
}

/** Render a branded PNG with the full plan — every line fits on the image. */
export async function renderPlanSharePng(input: PlanShareInput): Promise<Blob> {
  const lines = input.plan.lines;
  const measure = document.createElement('canvas').getContext('2d')!;
  measure.font = '14px system-ui, sans-serif';

  const title = input.partyName.trim() || 'My party';
  measure.font = 'bold 36px Georgia, serif';
  const titleLines = wrapText(measure, title, CANVAS_WIDTH - PAD * 2);

  const adviceLines = input.advice
    ? wrapText(measure, input.advice.slice(0, 360), CANVAS_WIDTH - PAD * 2).slice(0, 3)
    : [];

  const meta = [
    input.occasion,
    formatDate(input.eventDate),
    input.venue,
    `${input.guests.toLocaleString()} guests · ${input.hours}h · ${VIBE_LABELS[input.vibe]}`,
    input.budgetNgn > 0 ? `Budget ${formatNgn(input.budgetNgn)}` : '',
  ].filter(Boolean);

  const headerHeight = 108;
  const titleHeight = 28 + titleLines.length * 42;
  const metaHeight = 16 + meta.length * 22;
  const totalBlock = 48;
  const adviceHeight = adviceLines.length ? 28 + adviceLines.length * 18 : 0;
  const itemsHeight = Math.max(lines.length, 1) * ITEM_BLOCK + 24;
  const footerHeight = 56;
  const totalHeight =
    headerHeight + titleHeight + metaHeight + totalBlock + adviceHeight + itemsHeight + footerHeight;

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fafaf8';
  ctx.fillRect(0, 0, CANVAS_WIDTH, totalHeight);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 96);
  ctx.fillStyle = '#8B2A22';
  ctx.fillRect(0, 96, CANVAS_WIDTH, 4);

  try {
    const logo = await loadImage('/convivia24.png');
    const logoW = 200;
    const logoH = (logo.height / logo.width) * logoW;
    ctx.drawImage(logo, PAD, 22, logoW, logoH);
  } catch {
    ctx.fillStyle = '#0a0a0a';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillText('Convivia24', PAD, 52);
  }

  ctx.fillStyle = '#6b6560';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('Drink supply plan · nationwide delivery · 18+', PAD, 86);

  let y = 128;
  ctx.fillStyle = '#0a0a0a';
  ctx.font = 'bold 36px Georgia, serif';
  for (const row of titleLines) {
    ctx.fillText(row, PAD, y);
    y += 42;
  }
  y += 8;

  ctx.font = '14px system-ui, sans-serif';
  ctx.fillStyle = '#6b6560';
  for (const row of meta) {
    ctx.fillText(row, PAD, y);
    y += 22;
  }

  y += 12;
  ctx.fillStyle = '#8B2A22';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText(formatNgn(input.plan.totalNgn), PAD, y);
  y += 36;

  if (adviceLines.length) {
    ctx.fillStyle = '#0a0a0a';
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.fillText('Planner notes', PAD, y);
    y += 18;
    ctx.fillStyle = '#6b6560';
    ctx.font = '13px system-ui, sans-serif';
    for (const row of adviceLines) {
      ctx.fillText(row, PAD, y);
      y += 18;
    }
    y += 10;
  }

  ctx.strokeStyle = '#ece8e4';
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(CANVAS_WIDTH - PAD, y);
  ctx.stroke();
  y += 24;

  for (const [i, line] of lines.entries()) {
    ctx.font = '600 15px system-ui, sans-serif';
    ctx.fillStyle = '#0a0a0a';
    ctx.textAlign = 'left';
    const name = `${line.name}  ×${line.qty}`;
    const nameMax = CANVAS_WIDTH - PAD * 2 - 140;
    const clipped =
      ctx.measureText(name).width > nameMax
        ? `${line.name.slice(0, 28)}…  ×${line.qty}`
        : name;
    ctx.fillText(clipped, PAD, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#8B2A22';
    ctx.fillText(formatNgn(line.priceNgn * line.qty), CANVAS_WIDTH - PAD, y);
    ctx.textAlign = 'left';
    y += 20;

    ctx.fillStyle = '#6b6560';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(`${formatNgn(line.priceNgn)} / bottle`, PAD, y);
    y += 18;

    if (i < lines.length - 1) {
      ctx.strokeStyle = '#ece8e4';
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(CANVAS_WIDTH - PAD, y);
      ctx.stroke();
      y += 20;
    }
  }

  if (!lines.length) {
    ctx.fillStyle = '#6b6560';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('No items in this plan yet.', PAD, y);
  }

  ctx.fillStyle = '#0a0a0a';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('convivia24.com · Drink supplies for events', PAD, totalHeight - 24);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create image'))), 'image/png');
  });
}
