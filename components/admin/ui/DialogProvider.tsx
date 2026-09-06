'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import Modal from './Modal';

type ConfirmOptions = {
  title: string;
  /** Body copy. Say what will happen, in the admin's words. */
  message?: ReactNode;
  /** Label for the action button. Defaults to "Confirm". */
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` paints the action red — use it for anything destructive or irreversible. */
  tone?: 'default' | 'danger';
};

type ToastKind = 'success' | 'error' | 'info';
type Toast = { id: number; kind: ToastKind; message: string };

type DialogApi = {
  /** Promise-based replacement for `window.confirm`. */
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  /** Replacement for `alert` — a non-blocking toast. */
  notify: (message: string, kind?: ToastKind) => void;
};

const DialogContext = createContext<DialogApi | null>(null);

export function useDialogs(): DialogApi {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialogs must be used inside <DialogProvider>');
  return ctx;
}

export default function DialogProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { open: boolean }) | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);
  const toastId = useRef(0);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setConfirmState({ ...opts, open: true });
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = useCallback((ok: boolean) => {
    resolverRef.current?.(ok);
    resolverRef.current = null;
    setConfirmState(null);
  }, []);

  const notify = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);

  const api = useMemo(() => ({ confirm, notify }), [confirm, notify]);

  return (
    <DialogContext.Provider value={api}>
      {children}

      <Modal
        open={!!confirmState?.open}
        title={confirmState?.title ?? ''}
        description={confirmState?.message}
        tone={confirmState?.tone}
        size="sm"
        onClose={() => settle(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => settle(false)}
              className="px-5 py-2.5 rounded-lg border border-obsidian/15 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/70 transition-colors hover:bg-obsidian/[0.04]"
            >
              {confirmState?.cancelLabel ?? 'Cancel'}
            </button>
            <button
              type="button"
              onClick={() => settle(true)}
              className={`px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90 ${
                confirmState?.tone === 'danger' ? 'bg-ember' : 'bg-obsidian'
              }`}
            >
              {confirmState?.confirmLabel ?? 'Confirm'}
            </button>
          </>
        }
      />

      {/* Toasts sit above the sticky admin chrome but below any open modal. */}
      <div className="pointer-events-none fixed bottom-4 right-4 left-4 sm:left-auto z-[130] flex flex-col gap-2 sm:w-96">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-[0_12px_40px_-14px_rgba(10,10,10,0.4)] ring-1 ring-obsidian/8"
          >
            {t.kind === 'success' && <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" />}
            {t.kind === 'error' && <AlertTriangle size={17} className="mt-0.5 shrink-0 text-ember" />}
            {t.kind === 'info' && <Info size={17} className="mt-0.5 shrink-0 text-obsidian/45" />}
            <p className="min-w-0 flex-1 text-sm leading-snug text-obsidian/80">{t.message}</p>
            <button
              type="button"
              onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
              aria-label="Dismiss"
              className="shrink-0 text-obsidian/30 transition-colors hover:text-obsidian"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </DialogContext.Provider>
  );
}
