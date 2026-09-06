'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export type ModalTone = 'default' | 'danger';

/**
 * The one dialog every admin surface uses. Escape and backdrop both close it, focus is trapped to
 * the panel, and the page behind is locked so a long table can't scroll under the dialog.
 */
export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  tone = 'default',
  size = 'md',
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  tone?: ModalTone;
  size?: 'sm' | 'md' | 'lg';
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown, true);
    // Focus the panel itself rather than the first control, so a destructive
    // confirm never starts with the destructive button pre-selected.
    requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-3xl' : 'max-w-lg';

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-obsidian/45 backdrop-blur-[2px] animate-[fadeIn_.15s_ease-out]"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative w-full ${maxW} max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-[0_24px_70px_-20px_rgba(10,10,10,0.45)] focus:outline-none`}
      >
        <div className="flex items-start gap-4 px-5 sm:px-6 pt-5 pb-4 border-b border-obsidian/8">
          <div className="min-w-0 flex-1">
            <h2
              className={`text-lg font-bold leading-snug ${tone === 'danger' ? 'text-ember' : 'text-obsidian'}`}
            >
              {title}
            </h2>
            {description && (
              <div className="mt-1.5 text-sm text-obsidian/55 leading-relaxed">{description}</div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 -mr-1 -mt-1 grid h-8 w-8 place-items-center rounded-full text-obsidian/40 transition-colors hover:bg-obsidian/[0.06] hover:text-obsidian"
          >
            <X size={17} />
          </button>
        </div>

        {children && <div className="px-5 sm:px-6 py-5">{children}</div>}

        {footer && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 px-5 sm:px-6 py-4 border-t border-obsidian/8 bg-paper/60 sm:rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
