// Flyer Studio — canvas renderer that turns a created event into stylish,
// shareable social graphics. Everything is drawn on a <canvas> so the output
// exports cleanly to PNG for Instagram, WhatsApp status, X/Facebook, etc.

export type FlyerTemplateId = 'velvet' | 'editorial' | 'spotlight' | 'poster';
export type FlyerFormatId = 'square' | 'story' | 'wide';

export interface FlyerEvent {
  title: string;
  tagline?: string | null;
  category?: string | null;
  dateLabel: string;   // e.g. "SAT · 12 JUL"
  timeLabel?: string;  // e.g. "9:00 PM"
  venue?: string | null;
  city?: string | null;
  country?: string | null;
  priceLabel?: string | null; // e.g. "From ₦12,000" or "Free entry"
  organizer?: string | null;
  url: string;         // absolute event link, shown + used in share text
}

export interface FlyerTemplate {
  id: FlyerTemplateId;
  name: string;
  blurb: string;
  needsPhoto: boolean;
  dark: boolean;
}

export const FLYER_TEMPLATES: FlyerTemplate[] = [
  { id: 'spotlight', name: 'Spotlight', blurb: 'Full-bleed photo, bold title', needsPhoto: true, dark: true },
  { id: 'velvet', name: 'Velvet', blurb: 'Moody, luxe, gold serif', needsPhoto: false, dark: true },
  { id: 'editorial', name: 'Editorial', blurb: 'Clean magazine layout', needsPhoto: false, dark: false },
  { id: 'poster', name: 'Poster', blurb: 'Copper gradient, no photo needed', needsPhoto: false, dark: true },
];

export interface FlyerFormat {
  id: FlyerFormatId;
  name: string;
  blurb: string;
  w: number;
  h: number;
}

export const FLYER_FORMATS: FlyerFormat[] = [
  { id: 'square', name: 'Post', blurb: 'Instagram / Facebook · 1:1', w: 1080, h: 1080 },
  { id: 'story', name: 'Story', blurb: 'IG / WhatsApp status · 9:16', w: 1080, h: 1920 },
  { id: 'wide', name: 'Link card', blurb: 'X / LinkedIn preview · 1.91:1', w: 1200, h: 628 },
];

export interface RawFlyerEvent {
  title: string;
  tagline?: string | null;
  categoryLabel?: string | null;
  starts_at: string;
  venue?: string | null;
  city?: string | null;
  country?: string | null;
  priceLabel?: string | null;
  organizer?: string | null;
  url: string;
}

/** Format a raw event into the labels the flyer renderer expects. */
export function buildFlyerEvent(e: RawFlyerEvent): FlyerEvent {
  const d = new Date(e.starts_at);
  const valid = !isNaN(+d);
  const dateLabel = valid
    ? d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()
    : '';
  const timeLabel = valid
    ? d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })
    : '';
  return {
    title: e.title || 'Untitled event',
    tagline: e.tagline,
    category: e.categoryLabel,
    dateLabel,
    timeLabel,
    venue: e.venue,
    city: e.city,
    country: e.country,
    priceLabel: e.priceLabel,
    organizer: e.organizer,
    url: e.url,
  };
}

const C = {
  ink: '#0f0e12',
  velvet: '#0c0a10',
  glow: '#1e1830',
  copper: '#c4784a',
  bright: '#e0986a',
  deep: '#8f4f2e',
  pearl: '#faf8f5',
  cream: '#efecea',
};

export interface FlyerFonts {
  display: string; // serif family usable in a canvas font string
  sans: string;
}

/** Resolve the live next/font families so canvas text matches the site. */
export function resolveFlyerFonts(): FlyerFonts {
  if (typeof window === 'undefined') return { display: 'Georgia, serif', sans: 'system-ui, sans-serif' };
  const cs = getComputedStyle(document.documentElement);
  const display = cs.getPropertyValue('--font-fraunces').trim();
  const sans = cs.getPropertyValue('--font-jakarta').trim();
  return {
    display: display ? `${display}, Georgia, serif` : 'Georgia, serif',
    sans: sans ? `${sans}, system-ui, sans-serif` : 'system-ui, sans-serif',
  };
}

/* ───────────────────────── drawing helpers ───────────────────────── */

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// Draw an image cropped to "cover" a target box (like object-fit: cover).
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const ir = img.width / img.height;
  const tr = w / h;
  let sw = img.width, sh = img.height, sx = 0, sy = 0;
  if (ir > tr) { sw = img.height * tr; sx = (img.width - sw) / 2; }
  else { sh = img.width / tr; sy = (img.height - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

// Tracked (letter-spaced) uppercase text. Returns the drawn width.
function drawTracked(
  ctx: CanvasRenderingContext2D, text: string, x: number, y: number,
  tracking: number, align: 'left' | 'center' = 'left',
): number {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width + tracking);
  const total = widths.reduce((a, b) => a + b, 0) - tracking;
  let cx = align === 'center' ? x - total / 2 : x;
  const prev = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += widths[i]; });
  ctx.textAlign = prev;
  return total;
}

// Word-wrap with auto-fit: shrink the font until the text fits `maxLines`.
function fitWrap(
  ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number,
  start: number, min: number, font: (size: number) => string,
): { lines: string[]; size: number; lineHeight: number } {
  for (let size = start; size >= min; size -= 2) {
    ctx.font = font(size);
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
    if (lines.length <= maxLines) return { lines, size, lineHeight: size * 1.04 };
  }
  // Hard fallback at min size, truncating the last visible line.
  ctx.font = font(min);
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines) lines[maxLines - 1] = lines[maxLines - 1].replace(/.{1}$/, '…');
  return { lines, size: min, lineHeight: min * 1.04 };
}

function locationLine(e: FlyerEvent): string {
  return [e.venue, e.city].filter(Boolean).join(' · ');
}

/* ───────────────────────── main entry ───────────────────────── */

export interface DrawOpts {
  event: FlyerEvent;
  template: FlyerTemplateId;
  format: FlyerFormatId;
  cover: HTMLImageElement | null;
  fonts: FlyerFonts;
}

export function drawFlyer(canvas: HTMLCanvasElement, opts: DrawOpts) {
  const fmt = FLYER_FORMATS.find((f) => f.id === opts.format)!;
  canvas.width = fmt.w;
  canvas.height = fmt.h;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, fmt.w, fmt.h);
  ctx.textBaseline = 'alphabetic';

  const ctxOpts = { ...opts, ctx, w: fmt.w, h: fmt.h, story: fmt.id === 'story', wide: fmt.id === 'wide' };
  switch (opts.template) {
    case 'spotlight': return drawSpotlight(ctxOpts);
    case 'velvet': return drawVelvet(ctxOpts);
    case 'editorial': return drawEditorial(ctxOpts);
    case 'poster': return drawPoster(ctxOpts);
  }
}

interface Ctx extends DrawOpts {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  story: boolean;
  wide: boolean;
}

function brandFooter(c: Ctx, x: number, y: number, color: string, accent: string) {
  const { ctx, event } = c;
  ctx.fillStyle = accent;
  ctx.font = `700 ${c.wide ? 22 : 26}px ${c.fonts.sans}`;
  const w = drawTracked(ctx, 'CONVIVIA24', x, y, 3);
  ctx.fillStyle = color;
  ctx.font = `500 ${c.wide ? 20 : 24}px ${c.fonts.sans}`;
  const link = event.url.replace(/^https?:\/\//, '');
  ctx.fillText(`  ·  ${link}`, x + w + 4, y);
}

/* ── Spotlight: full-bleed photo, scrim, title bottom ── */
function drawSpotlight(c: Ctx) {
  const { ctx, w, h, event, cover } = c;
  const pad = c.wide ? 56 : 80;

  if (cover) drawCover(ctx, cover, 0, 0, w, h);
  else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, C.glow); g.addColorStop(1, C.velvet);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }

  // Bottom-up scrim for legibility.
  const scrim = ctx.createLinearGradient(0, h * (c.wide ? 0.1 : 0.35), 0, h);
  scrim.addColorStop(0, 'rgba(8,7,12,0)');
  scrim.addColorStop(0.55, 'rgba(8,7,12,0.55)');
  scrim.addColorStop(1, 'rgba(8,7,12,0.94)');
  ctx.fillStyle = scrim; ctx.fillRect(0, 0, w, h);

  // Top kicker chip
  if (event.category) {
    ctx.font = `700 ${c.wide ? 20 : 24}px ${c.fonts.sans}`;
    const tw = drawWidth(ctx, event.category.toUpperCase(), 4);
    roundRect(ctx, pad, pad, tw + 44, c.wide ? 44 : 54, 999);
    ctx.fillStyle = C.copper; ctx.fill();
    ctx.fillStyle = C.pearl;
    drawTracked(ctx, event.category.toUpperCase(), pad + 22, pad + (c.wide ? 30 : 36), 4);
  }

  let y = h - pad;
  // Footer brand
  brandFooter(c, pad, y, 'rgba(250,248,245,0.75)', C.bright);
  y -= c.wide ? 46 : 70;

  // Meta line
  ctx.fillStyle = C.bright;
  ctx.font = `700 ${c.wide ? 22 : 30}px ${c.fonts.sans}`;
  const meta = [event.dateLabel, event.timeLabel, locationLine(event)].filter(Boolean).join('   ·   ');
  drawTracked(ctx, meta.toUpperCase(), pad, y, 2);
  y -= c.wide ? 18 : 30;

  // Title (drawn upward)
  const title = fitWrap(ctx, event.title, w - pad * 2, c.wide ? 2 : 3,
    c.wide ? 80 : 132, 56, (s) => `600 ${s}px ${c.fonts.display}`);
  ctx.fillStyle = C.pearl;
  ctx.font = `600 ${title.size}px ${c.fonts.display}`;
  for (let i = title.lines.length - 1; i >= 0; i--) {
    ctx.fillText(title.lines[i], pad, y);
    y -= title.lineHeight;
  }

  if (event.priceLabel) {
    y -= 8;
    ctx.fillStyle = C.copper;
    ctx.font = `700 ${c.wide ? 22 : 28}px ${c.fonts.sans}`;
    drawTracked(ctx, event.priceLabel.toUpperCase(), pad, y, 3);
  }
}

function drawWidth(ctx: CanvasRenderingContext2D, text: string, tracking: number): number {
  return [...text].reduce((a, ch) => a + ctx.measureText(ch).width + tracking, 0) - tracking;
}

/* ── Velvet: dark luxe, gold serif, subtle photo medallion ── */
function drawVelvet(c: Ctx) {
  const { ctx, w, h, event, cover } = c;
  const pad = c.wide ? 56 : 90;

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#16121d'); bg.addColorStop(0.5, C.velvet); bg.addColorStop(1, '#0a0810');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  // Faint copper vignette glow top-right
  const glow = ctx.createRadialGradient(w * 0.85, h * 0.12, 0, w * 0.85, h * 0.12, w * 0.7);
  glow.addColorStop(0, 'rgba(196,120,74,0.22)'); glow.addColorStop(1, 'rgba(196,120,74,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

  // Thin frame
  ctx.strokeStyle = 'rgba(224,152,106,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(pad * 0.5, pad * 0.5, w - pad, h - pad);

  let y = pad + (c.wide ? 36 : 60);
  ctx.fillStyle = C.bright;
  ctx.font = `700 ${c.wide ? 20 : 26}px ${c.fonts.sans}`;
  drawTracked(ctx, (event.category || 'Convivia24 presents').toUpperCase(), pad + 30, y, 5);

  // Round photo medallion (if available) — only on tall formats
  if (cover && !c.wide) {
    const r = w * 0.16;
    const cx = w - pad - 30 - r;
    const cy = y - 8 + r;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    drawCover(ctx, cover, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = C.copper; ctx.lineWidth = 3; ctx.stroke();
    y = cy + r + (c.story ? 80 : 56);
  } else {
    y += c.wide ? 52 : 130;
  }

  // Title
  const title = fitWrap(ctx, event.title, w - pad * 2 - 60, c.story ? 4 : 3,
    c.wide ? 78 : 124, 52, (s) => `400 italic ${s}px ${c.fonts.display}`);
  ctx.fillStyle = C.pearl;
  ctx.font = `400 italic ${title.size}px ${c.fonts.display}`;
  for (const line of title.lines) { y += title.lineHeight; ctx.fillText(line, pad + 30, y); }

  if (event.tagline) {
    y += c.wide ? 36 : 52;
    ctx.fillStyle = 'rgba(250,248,245,0.6)';
    ctx.font = `400 ${c.wide ? 24 : 32}px ${c.fonts.sans}`;
    const tag = fitWrap(ctx, event.tagline, w - pad * 2 - 60, 2, c.wide ? 24 : 32, 20,
      (s) => `400 ${s}px ${c.fonts.sans}`);
    for (const line of tag.lines) { ctx.fillText(line, pad + 30, y); y += tag.lineHeight; }
  }

  // Divider
  const dy = h - pad - (c.wide ? 70 : 150);
  ctx.strokeStyle = 'rgba(224,152,106,0.4)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(pad + 30, dy); ctx.lineTo(w - pad - 30, dy); ctx.stroke();

  // Meta rows
  ctx.fillStyle = C.bright;
  ctx.font = `700 ${c.wide ? 22 : 30}px ${c.fonts.sans}`;
  drawTracked(ctx, [event.dateLabel, event.timeLabel].filter(Boolean).join('   ·   ').toUpperCase(), pad + 30, dy + (c.wide ? 36 : 52), 3);
  ctx.fillStyle = 'rgba(250,248,245,0.85)';
  ctx.font = `500 ${c.wide ? 22 : 28}px ${c.fonts.sans}`;
  ctx.fillText(locationLine(event), pad + 30, dy + (c.wide ? 70 : 96));
  if (event.priceLabel) {
    ctx.fillStyle = C.copper;
    ctx.font = `700 ${c.wide ? 22 : 28}px ${c.fonts.sans}`;
    const pl = event.priceLabel.toUpperCase();
    const pw = drawWidth(ctx, pl, 3);
    drawTracked(ctx, pl, w - pad - 30 - pw, dy + (c.wide ? 36 : 52), 3);
  }

  brandFooter(c, pad + 30, h - pad - (c.wide ? 26 : 40), 'rgba(250,248,245,0.5)', C.bright);
}

/* ── Editorial: light, clean, magazine-style ── */
function drawEditorial(c: Ctx) {
  const { ctx, w, h, event, cover } = c;
  const pad = c.wide ? 56 : 90;

  ctx.fillStyle = C.pearl; ctx.fillRect(0, 0, w, h);

  // Optional photo band along the top for tall formats
  let top = pad;
  if (cover && !c.wide) {
    const bandH = c.story ? h * 0.42 : h * 0.4;
    drawCover(ctx, cover, 0, 0, w, bandH);
    const scrim = ctx.createLinearGradient(0, bandH - 160, 0, bandH);
    scrim.addColorStop(0, 'rgba(250,248,245,0)'); scrim.addColorStop(1, C.pearl);
    ctx.fillStyle = scrim; ctx.fillRect(0, bandH - 160, w, 160);
    top = bandH + (c.story ? 20 : 8);
  }

  // Top rule + kicker
  ctx.fillStyle = C.deep;
  ctx.font = `700 ${c.wide ? 20 : 26}px ${c.fonts.sans}`;
  drawTracked(ctx, (event.category || 'EVENT').toUpperCase(), pad, top + 18, 5);
  ctx.strokeStyle = 'rgba(143,79,46,0.4)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(pad, top + 40); ctx.lineTo(w - pad, top + 40); ctx.stroke();

  let y = top + (c.wide ? 78 : 120);
  const title = fitWrap(ctx, event.title, w - pad * 2, c.wide ? 2 : 4,
    c.wide ? 76 : 118, 48, (s) => `500 ${s}px ${c.fonts.display}`);
  ctx.fillStyle = C.ink;
  ctx.font = `500 ${title.size}px ${c.fonts.display}`;
  for (const line of title.lines) { ctx.fillText(line, pad, y); y += title.lineHeight; }

  if (event.tagline) {
    y += c.wide ? 10 : 24;
    const tag = fitWrap(ctx, event.tagline, w - pad * 2, 2, c.wide ? 24 : 34, 20,
      (s) => `400 italic ${s}px ${c.fonts.display}`);
    ctx.font = `400 italic ${tag.size}px ${c.fonts.display}`;
    ctx.fillStyle = 'rgba(15,14,18,0.55)';
    for (const line of tag.lines) { ctx.fillText(line, pad, y); y += tag.lineHeight; }
  }

  // Detail rows near the bottom
  const rows = [
    ['WHEN', [event.dateLabel, event.timeLabel].filter(Boolean).join(' · ')],
    ['WHERE', locationLine(event) || (event.country ?? '')],
    ['ENTRY', event.priceLabel || 'See details'],
  ].filter((r) => r[1]);

  const baseY = h - pad - (c.wide ? 50 : 150);
  rows.forEach((r, i) => {
    const ry = baseY + i * (c.wide ? 0 : 50);
    if (c.wide) {
      // single horizontal row for the wide card
      const seg = (w - pad * 2) / rows.length;
      const x = pad + i * seg;
      ctx.fillStyle = C.deep; ctx.font = `700 16px ${c.fonts.sans}`;
      drawTracked(ctx, r[0], x, ry, 3);
      ctx.fillStyle = C.ink; ctx.font = `600 24px ${c.fonts.sans}`;
      ctx.fillText(r[1], x, ry + 30);
    } else {
      ctx.fillStyle = C.deep; ctx.font = `700 20px ${c.fonts.sans}`;
      drawTracked(ctx, r[0], pad, ry, 3);
      ctx.fillStyle = C.ink; ctx.font = `600 30px ${c.fonts.sans}`;
      const lw = drawWidth(ctx, r[0], 3);
      ctx.fillText(r[1], pad + Math.max(lw + 40, 160), ry);
    }
  });

  ctx.strokeStyle = 'rgba(143,79,46,0.4)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(pad, h - pad - 26); ctx.lineTo(w - pad, h - pad - 26); ctx.stroke();
  brandFooter(c, pad, h - pad + 4, 'rgba(15,14,18,0.55)', C.deep);
}

/* ── Poster: copper gradient, photo-free, typographic ── */
function drawPoster(c: Ctx) {
  const { ctx, w, h, event } = c;
  const pad = c.wide ? 56 : 90;

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, C.bright); bg.addColorStop(0.45, C.copper); bg.addColorStop(1, C.deep);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  // Concentric arcs motif (bottom-left)
  ctx.strokeStyle = 'rgba(250,248,245,0.16)'; ctx.lineWidth = 2;
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath(); ctx.arc(0, h, i * (c.wide ? 90 : 150), -Math.PI / 2, 0); ctx.stroke();
  }

  let y = pad + (c.wide ? 40 : 70);
  ctx.fillStyle = 'rgba(15,14,18,0.7)';
  ctx.font = `700 ${c.wide ? 20 : 26}px ${c.fonts.sans}`;
  drawTracked(ctx, (event.category || 'You are invited').toUpperCase(), pad, y, 5);

  y += c.wide ? 70 : 150;
  const title = fitWrap(ctx, event.title, w - pad * 2, c.story ? 4 : 3,
    c.wide ? 84 : 140, 56, (s) => `600 ${s}px ${c.fonts.display}`);
  ctx.fillStyle = C.pearl;
  ctx.font = `600 ${title.size}px ${c.fonts.display}`;
  for (const line of title.lines) { ctx.fillText(line, pad, y); y += title.lineHeight; }

  if (event.tagline) {
    y += c.wide ? 8 : 24;
    ctx.fillStyle = 'rgba(250,248,245,0.85)';
    const tag = fitWrap(ctx, event.tagline, w - pad * 2, 2, c.wide ? 24 : 34, 20,
      (s) => `400 italic ${s}px ${c.fonts.display}`);
    ctx.font = `400 italic ${tag.size}px ${c.fonts.display}`;
    for (const line of tag.lines) { ctx.fillText(line, pad, y); y += tag.lineHeight; }
  }

  // Meta block bottom
  const by = h - pad - (c.wide ? 64 : 150);
  ctx.fillStyle = 'rgba(15,14,18,0.85)';
  ctx.font = `800 ${c.wide ? 26 : 36}px ${c.fonts.sans}`;
  drawTracked(ctx, [event.dateLabel, event.timeLabel].filter(Boolean).join('  ·  ').toUpperCase(), pad, by, 2);
  ctx.fillStyle = 'rgba(250,248,245,0.95)';
  ctx.font = `600 ${c.wide ? 22 : 30}px ${c.fonts.sans}`;
  ctx.fillText(locationLine(event), pad, by + (c.wide ? 34 : 50));
  if (event.priceLabel) {
    ctx.fillStyle = 'rgba(15,14,18,0.8)';
    ctx.font = `800 ${c.wide ? 22 : 30}px ${c.fonts.sans}`;
    drawTracked(ctx, event.priceLabel.toUpperCase(), pad, by + (c.wide ? 66 : 96), 2);
  }

  brandFooter(c, pad, h - pad - (c.wide ? 20 : 36), 'rgba(15,14,18,0.65)', C.pearl);
}

/* ───────────────────────── share helpers ───────────────────────── */

export function flyerCaption(e: FlyerEvent): string {
  const when = [e.dateLabel, e.timeLabel].filter(Boolean).join(' · ');
  const where = locationLine(e);
  return [
    `✨ ${e.title}`,
    e.tagline || null,
    when ? `🗓  ${when}` : null,
    where ? `📍 ${where}` : null,
    e.priceLabel ? `🎟  ${e.priceLabel}` : null,
    '',
    `Get tickets → ${e.url}`,
  ].filter((l) => l !== null).join('\n');
}

export interface ShareTarget {
  id: string;
  label: string;
  href: (e: FlyerEvent) => string;
}

export const SHARE_TARGETS: ShareTarget[] = [
  {
    id: 'whatsapp', label: 'WhatsApp',
    href: (e) => `https://wa.me/?text=${encodeURIComponent(flyerCaption(e))}`,
  },
  {
    id: 'x', label: 'X / Twitter',
    href: (e) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${e.title} — ${e.tagline || 'Get your tickets'}`)}&url=${encodeURIComponent(e.url)}`,
  },
  {
    id: 'facebook', label: 'Facebook',
    href: (e) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(e.url)}`,
  },
  {
    id: 'linkedin', label: 'LinkedIn',
    href: (e) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(e.url)}`,
  },
  {
    id: 'telegram', label: 'Telegram',
    href: (e) => `https://t.me/share/url?url=${encodeURIComponent(e.url)}&text=${encodeURIComponent(e.title)}`,
  },
  {
    id: 'email', label: 'Email',
    href: (e) => `mailto:?subject=${encodeURIComponent(`You're invited: ${e.title}`)}&body=${encodeURIComponent(flyerCaption(e))}`,
  },
];
