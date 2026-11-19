'use client';

import { useEffect, useRef, type ComponentType, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Full-page panel for the wholesale hub. Esc, the ✕ and the browser Back button
 * all close it; focus stays inside and the page behind can't scroll.
 */
export default function WholesaleModal({
  kicker,
  title,
  icon: Icon,
  wide,
  onClose,
  children,
}: {
  kicker: string;
  title: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  wide?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown, true);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[130]">
      <div
        className="absolute inset-0 bg-obsidian/50 backdrop-blur-[3px] animate-[wsFade_.18s_ease-out]"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wholesale-modal-title"
        tabIndex={-1}
        className="absolute inset-0 flex flex-col overflow-hidden bg-paper shadow-[0_30px_80px_-30px_rgba(10,10,10,0.6)] focus:outline-none animate-[wsRise_.26s_cubic-bezier(0.16,1,0.3,1)] sm:inset-3 sm:rounded-3xl"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-obsidian/8 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ember/10 text-ember">
              <Icon size={19} strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-obsidian/45">Wholesale · {kicker}</p>
              <h2
                id="wholesale-modal-title"
                className="truncate font-serif text-lg font-light leading-tight tracking-tight text-obsidian sm:text-2xl"
              >
                {title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-obsidian/10 bg-white text-obsidian transition-colors hover:border-obsidian/25 hover:bg-paper"
          >
            <X size={19} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div
            className="mx-auto pb-[calc(3rem+env(safe-area-inset-bottom))] pt-6 sm:pt-8"
            style={{ width: `min(100% - 32px, ${wide ? 1160 : 780}px)` }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
