'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Download, Share2, Copy, Check, Loader2, ImageOff, Sparkles,
} from 'lucide-react';
import {
  FLYER_TEMPLATES, FLYER_FORMATS, SHARE_TARGETS, drawFlyer, flyerCaption,
  resolveFlyerFonts, type FlyerEvent, type FlyerTemplateId, type FlyerFormatId,
} from '@/lib/flyer/templates';

interface EventFlyerStudioProps {
  event: FlyerEvent;
  coverImage?: string | null;
  open: boolean;
  onClose: () => void;
}

export default function EventFlyerStudio({ event, coverImage, open, onClose }: EventFlyerStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [template, setTemplate] = useState<FlyerTemplateId>('spotlight');
  const [format, setFormat] = useState<FlyerFormatId>('square');
  const [cover, setCover] = useState<HTMLImageElement | null>(null);
  const [coverFailed, setCoverFailed] = useState(false);
  const [rendering, setRendering] = useState(true);
  const [copied, setCopied] = useState<'caption' | 'link' | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  // Load the cover image once (CORS-enabled so the canvas stays exportable).
  useEffect(() => {
    if (!coverImage) { setCover(null); setCoverFailed(true); return; }
    let active = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { if (active) { setCover(img); setCoverFailed(false); } };
    img.onerror = () => { if (active) { setCover(null); setCoverFailed(true); } };
    img.src = coverImage;
    return () => { active = false; };
  }, [coverImage]);

  // (Re)draw whenever the inputs change. Wait for webfonts so text matches the site.
  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !open) return;
    setRendering(true);
    try {
      if (document.fonts?.ready) await document.fonts.ready;
    } catch { /* ignore */ }
    drawFlyer(canvas, { event, template, format, cover, fonts: resolveFlyerFonts() });
    setRendering(false);
  }, [event, template, format, cover, open]);

  useEffect(() => { render(); }, [render]);

  // Lock body scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  const filename = `convivia24-${(event.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)}-${format}.png`;

  function toBlob(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve(null);
      try { canvas.toBlob((b) => resolve(b), 'image/png'); }
      catch { resolve(null); } // tainted canvas (CORS) — share text still works
    });
  }

  async function download() {
    const blob = await toBlob();
    if (!blob) { alert('Could not export the image (the cover photo blocked it). Try the Velvet or Poster template — they need no photo.'); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true); setTimeout(() => setDownloaded(false), 2500);
  }

  async function nativeShare() {
    const blob = await toBlob();
    const caption = flyerCaption(event);
    try {
      const file = blob ? new File([blob], filename, { type: 'image/png' }) : null;
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: event.title, text: caption });
        return;
      }
      if (navigator.share) { await navigator.share({ title: event.title, text: caption, url: event.url }); return; }
    } catch { /* user cancelled or unsupported */ return; }
    // Fallback: copy the caption so they can paste it anywhere.
    copy('caption');
  }

  function copy(what: 'caption' | 'link') {
    const text = what === 'caption' ? flyerCaption(event) : event.url;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(what); setTimeout(() => setCopied(null), 2000);
    });
  }

  if (!open || typeof document === 'undefined') return null;

  const activeTpl = FLYER_TEMPLATES.find((t) => t.id === template)!;
  const showPhotoHint = activeTpl.needsPhoto && coverFailed;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center bg-ink/70 backdrop-blur-sm p-0 sm:p-6" onClick={onClose}>
      <div
        className="relative bg-surface w-full sm:max-w-5xl sm:rounded-2xl shadow-lift overflow-hidden flex flex-col max-h-screen sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-ink/8 shrink-0">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-copper" />
            <div>
              <h2 className="font-display text-lg sm:text-xl italic text-ink leading-none">Flyer studio</h2>
              <p className="text-ink-muted text-[11px] mt-1">Make a shareable graphic for this event</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-ink-muted hover:text-ink transition-colors"><X size={20} /></button>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-0 overflow-y-auto">
          {/* Preview */}
          <div className="bg-surface-sunken/60 flex items-center justify-center p-5 sm:p-8 min-h-[40vh]">
            <div className="relative max-w-full" style={{ width: format === 'wide' ? '100%' : format === 'story' ? '270px' : '380px' }}>
              <canvas
                ref={canvasRef}
                className="w-full h-auto rounded-lg shadow-lift bg-ink/5"
                style={{ aspectRatio: format === 'square' ? '1/1' : format === 'story' ? '9/16' : '1200/628' }}
              />
              {rendering && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={22} className="animate-spin text-copper" />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="p-5 sm:p-6 space-y-5 lg:border-l border-ink/8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper-deep mb-2.5">Style</p>
              <div className="grid grid-cols-2 gap-2">
                {FLYER_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`text-left px-3 py-2.5 rounded-xl border transition-colors ${template === t.id ? 'border-copper bg-copper/10' : 'border-ink/10 hover:border-copper/40'}`}
                  >
                    <span className="block text-sm font-semibold text-ink">{t.name}</span>
                    <span className="block text-[10px] text-ink-muted leading-tight mt-0.5">{t.blurb}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper-deep mb-2.5">Format</p>
              <div className="space-y-2">
                {FLYER_FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors ${format === f.id ? 'border-copper bg-copper/10' : 'border-ink/10 hover:border-copper/40'}`}
                  >
                    <span className="text-sm font-semibold text-ink">{f.name}</span>
                    <span className="text-[10px] text-ink-muted">{f.blurb}</span>
                  </button>
                ))}
              </div>
            </div>

            {showPhotoHint && (
              <p className="flex items-start gap-1.5 text-[11px] text-ink-muted bg-surface-sunken rounded-lg px-3 py-2">
                <ImageOff size={13} className="mt-0.5 shrink-0 text-copper-deep" />
                No usable cover photo — this style falls back to a gradient. Add a cover image for the full effect.
              </p>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button onClick={download} className="w-full inline-flex items-center justify-center gap-2 bg-ink text-pearl text-[11px] font-bold uppercase tracking-[0.15em] py-3 rounded-xl hover:bg-ink-soft transition-colors">
                {downloaded ? <><Check size={15} /> Saved</> : <><Download size={15} /> Download PNG</>}
              </button>
              <button onClick={nativeShare} className="w-full inline-flex items-center justify-center gap-2 bg-copper text-pearl text-[11px] font-bold uppercase tracking-[0.15em] py-3 rounded-xl hover:bg-copper-bright transition-colors">
                <Share2 size={15} /> Share…
              </button>
            </div>

            {/* Direct social links */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper-deep mb-2.5">Post the link</p>
              <div className="grid grid-cols-3 gap-2">
                {SHARE_TARGETS.map((s) => (
                  <a
                    key={s.id}
                    href={s.href(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center px-2 py-2.5 rounded-xl border border-ink/10 text-[11px] font-semibold text-ink hover:border-copper/50 hover:text-copper-deep transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
              <p className="text-[10px] text-ink-muted mt-2">Tip: download the flyer, then attach it to your post for the best reach.</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => copy('caption')} className="flex-1 inline-flex items-center justify-center gap-1.5 border border-ink/10 text-ink-muted text-[10px] font-bold uppercase tracking-[0.12em] py-2.5 rounded-xl hover:border-copper/40 hover:text-copper-deep transition-colors">
                {copied === 'caption' ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Caption</>}
              </button>
              <button onClick={() => copy('link')} className="flex-1 inline-flex items-center justify-center gap-1.5 border border-ink/10 text-ink-muted text-[10px] font-bold uppercase tracking-[0.12em] py-2.5 rounded-xl hover:border-copper/40 hover:text-copper-deep transition-colors">
                {copied === 'link' ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Link</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
