'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';

export type AdminTab = {
  key: string;
  label: string;
  /** Rendered as a pill beside the label. Omit for sections with nothing to count. */
  count?: number;
  icon: ReactNode;
};

/**
 * Full-bleed admin chrome.
 *
 * Desktop gets a fixed sidebar and the content takes the rest of the viewport — the desk is a
 * working tool, so it is deliberately not constrained to the marketing site's reading width.
 * Below `lg` the sidebar becomes an off-canvas drawer behind a header button.
 */
export default function AdminShell({
  tabs,
  active,
  onSelect,
  title,
  subtitle,
  actions,
  children,
}: {
  tabs: AdminTab[];
  active: string;
  onSelect: (key: string) => void;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeTab = tabs.find((t) => t.key === active);

  // Lock the page behind the drawer, and let Escape dismiss it.
  useEffect(() => {
    if (!drawerOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  function pick(key: string) {
    onSelect(key);
    setDrawerOpen(false);
  }

  const nav = (
    <nav className="flex flex-col gap-0.5" aria-label="Admin sections">
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => pick(t.key)}
            aria-current={on ? 'page' : undefined}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
              on
                ? 'bg-ember/[0.09] text-ember ring-1 ring-ember/20'
                : 'text-obsidian/60 hover:bg-obsidian/[0.04] hover:text-obsidian'
            }`}
          >
            <span className={`shrink-0 ${on ? 'text-ember' : 'text-obsidian/35 group-hover:text-obsidian/60'}`}>
              {t.icon}
            </span>
            <span className="min-w-0 flex-1 truncate">{t.label}</span>
            {typeof t.count === 'number' && (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums ${
                  on ? 'bg-ember/15 text-ember' : 'bg-obsidian/[0.06] text-obsidian/45'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-paper lg:flex">
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:flex-col border-r border-obsidian/8 bg-white">
        <div className="px-5 pt-6 pb-4">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember">Convivia24</p>
          <h1 className="mt-1 text-xl font-bold text-obsidian">{title}</h1>
          {subtitle && <div className="mt-1.5 text-[11px] leading-relaxed text-obsidian/45">{subtitle}</div>}
        </div>
        <div className="flex-1 px-3 pb-6">{nav}</div>
      </aside>

      {/* ── Mobile drawer ───────────────────────────────────────── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-[110]">
          <div className="absolute inset-0 bg-obsidian/45 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} aria-hidden />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Admin sections"
            className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 px-5 pt-6 pb-4">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember">Convivia24</p>
                <h2 className="mt-1 text-xl font-bold text-obsidian">{title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-obsidian/45 hover:bg-obsidian/[0.06]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 px-3 pb-6">{nav}</div>
          </aside>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-obsidian/8 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="lg:hidden -ml-1 grid h-10 w-10 shrink-0 place-items-center rounded-lg text-obsidian/60 hover:bg-obsidian/[0.06]"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold text-obsidian sm:text-lg">
                {activeTab?.label ?? title}
              </h2>
              <div className="truncate text-[11px] text-obsidian/45 lg:hidden">{subtitle}</div>
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        </header>

        {/* Full width by design — tables and boards get the whole viewport. */}
        <main className="px-4 py-5 sm:px-6 sm:py-7">{children}</main>
      </div>
    </div>
  );
}
