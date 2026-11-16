'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';

export type AdminTab = {
  key: string;
  label: string;
  /** One line under the page title: what the page is for. */
  hint?: string;
  /** Rendered as a pill beside the label. Omit for sections with nothing to count. */
  count?: number;
  icon: ReactNode;
};

/** A department of the desk (Orders, Finance…) and the pages inside it. */
export type AdminGroup = {
  key: string;
  label: string;
  icon: ReactNode;
  tabs: AdminTab[];
};

const sumCounts = (tabs: AdminTab[]) => {
  const n = tabs.reduce((acc, t) => acc + (t.count ?? 0), 0);
  return n > 0 ? n : undefined;
};

function CountPill({ n, on }: { n?: number; on?: boolean }) {
  if (typeof n !== 'number') return null;
  return (
    <span
      className={`shrink-0 rounded px-1.5 py-px text-[11px] font-bold tabular-nums ${
        on ? 'bg-white text-obsidian' : 'bg-ember text-white'
      }`}
    >
      {n}
    </span>
  );
}

/**
 * Full-bleed admin chrome: a dark, high-contrast sidebar of departments, and a compact header with
 * a tab for each page in the current department plus a line on what the page is for. Below `lg` the sidebar becomes
 * an off-canvas drawer. Accepts either grouped pages (staff desk) or a flat list (supplier portal).
 */
export default function AdminShell({
  tabs: flatTabs,
  groups: rawGroups,
  active,
  onSelect,
  title,
  subtitle,
  actions,
  sidebarFooter,
  sidebarTop,
  children,
}: {
  /** A flat list of pages (supplier portal). */
  tabs?: AdminTab[];
  /** Pages grouped into departments. Takes precedence over `tabs`. */
  groups?: AdminGroup[];
  active: string;
  onSelect: (key: string) => void;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Pinned to the bottom of the sidebar (e.g. order alerts). */
  sidebarFooter?: ReactNode;
  /** Under the brand at the top of the sidebar (e.g. desk search). */
  sidebarTop?: ReactNode;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const groups = (rawGroups ?? []).filter((g) => g.tabs.length > 0);
  const grouped = groups.length > 0;
  const tabs = grouped ? groups.flatMap((g) => g.tabs) : flatTabs ?? [];
  const activeTab = tabs.find((t) => t.key === active);
  const activeGroup = groups.find((g) => g.tabs.some((t) => t.key === active));

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

  const item = (t: AdminTab, opts: { nested?: boolean; icon?: ReactNode } = {}) => {
    const on = t.key === active;
    return (
      <button
        key={t.key}
        type="button"
        onClick={() => pick(t.key)}
        aria-current={on ? 'page' : undefined}
        className={`group flex w-full items-center gap-2.5 rounded-md text-left font-medium transition-colors ${
          opts.nested ? 'px-2.5 py-1.5 text-[13px]' : 'px-2.5 py-2 text-sm'
        } ${on ? 'bg-obsidian text-white' : 'text-obsidian/75 hover:bg-obsidian/[0.06] hover:text-obsidian'}`}
      >
        {opts.icon && <span className={`shrink-0 ${on ? 'text-saffron' : 'text-obsidian/50 group-hover:text-obsidian/75'}`}>{opts.icon}</span>}
        <span className="min-w-0 flex-1 truncate">{t.label}</span>
        <CountPill n={t.count} on={on} />
      </button>
    );
  };

  // One entry per department; it opens the department's first page, the tabs do the rest.
  const groupedNav = (
    <nav className="flex flex-col gap-0.5" aria-label="Admin sections">
      {groups.map((g) => {
        const on = activeGroup?.key === g.key;
        return (
          <button
            key={g.key}
            type="button"
            onClick={() => pick(g.tabs[0].key)}
            aria-current={on ? 'page' : undefined}
            className={`group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-semibold transition-colors ${
              on ? 'bg-obsidian text-white' : 'text-obsidian/75 hover:bg-obsidian/[0.06] hover:text-obsidian'
            }`}
          >
            <span className={`shrink-0 ${on ? 'text-saffron' : 'text-obsidian/50 group-hover:text-obsidian/75'}`}>{g.icon}</span>
            <span className="min-w-0 flex-1 truncate">{g.label}</span>
            <CountPill n={sumCounts(g.tabs)} on={on} />
          </button>
        );
      })}
    </nav>
  );

  const flatNav = <nav className="flex flex-col gap-0.5" aria-label="Admin sections">{tabs.map((t) => item(t, { icon: t.icon }))}</nav>;
  const nav = grouped ? groupedNav : flatNav;

  const brand = (
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember">Convivia24 {title}</p>
      {subtitle && <div className="mt-0.5 text-xs leading-snug text-obsidian/65">{subtitle}</div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* ── Desktop sidebar. Fixed under the site header so it stays while the desk scrolls. */}
      <aside className="fixed bottom-0 left-0 top-[4.5rem] z-30 hidden w-56 flex-col border-r border-obsidian/15 bg-[#faf8f5] lg:flex">
        <div className="space-y-2 border-b border-obsidian/10 px-4 py-2.5">
          {brand}
          {sidebarTop}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">{nav}</div>
        {sidebarFooter && <div className="border-t border-obsidian/10 px-3 py-2.5">{sidebarFooter}</div>}
      </aside>

      {/* ── Mobile drawer ───────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[110] lg:hidden">
          <div className="absolute inset-0 bg-obsidian/55 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} aria-hidden />
          <aside role="dialog" aria-modal="true" aria-label="Admin sections" className="absolute inset-y-0 left-0 flex w-[84%] max-w-xs flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-obsidian/10 px-4 pb-3 pt-4">
              {brand}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-md text-obsidian/70 hover:bg-obsidian/[0.06]"
              >
                <X size={18} />
              </button>
            </div>
            {sidebarTop && <div className="px-3 pt-2">{sidebarTop}</div>}
            <div className="flex-1 overflow-y-auto px-2 py-3">{nav}</div>
            {sidebarFooter && <div className="border-t border-obsidian/10 px-3 py-2.5">{sidebarFooter}</div>}
          </aside>
        </div>
      )}

      {/* ── Content. Offset by the fixed sidebar from `lg` up. ── */}
      <div className="min-w-0 lg:pl-56">
        {/* On desktop the sidebar already names the department, so the header holds only its tabs. */}
        <header
          className={`sticky top-0 z-40 border-b border-obsidian/15 bg-white md:top-[4.5rem] ${
            !(activeGroup && activeGroup.tabs.length > 1) && !actions ? 'lg:hidden' : ''
          }`}
        >
          <div className="flex min-h-[2.75rem] items-end gap-x-4 px-3 sm:px-5">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="-ml-1 mb-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-obsidian/15 text-obsidian/75 hover:bg-obsidian/[0.05] lg:hidden"
            >
              <Menu size={17} />
            </button>
            <h2 className="shrink-0 pb-2 text-base font-bold tracking-tight text-obsidian lg:hidden">
              {activeGroup && activeGroup.tabs.length > 1 ? activeGroup.label : activeTab?.label ?? title}
            </h2>
            {/* A tab for each page in the department, on the same row as its name. */}
            {activeGroup && activeGroup.tabs.length > 1 ? (
              <div role="tablist" aria-label={`${activeGroup.label} pages`} className="scrollbar-hide -mb-px flex min-w-0 flex-1 gap-0.5 overflow-x-auto">
                {activeGroup.tabs.map((t) => {
                  const on = t.key === active;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => pick(t.key)}
                      className={`flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 pb-2 pt-2.5 text-sm font-semibold transition-colors ${
                        on ? 'border-ember text-obsidian' : 'border-transparent text-obsidian/60 hover:border-obsidian/25 hover:text-obsidian'
                      }`}
                    >
                      {t.label}
                      <CountPill n={t.count} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <span className="flex-1" />
            )}
            {actions && <div className="mb-1.5 flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        </header>

        {/* Full width by design — tables and boards get the whole viewport. */}
        <main className="px-3 pb-8 pt-3 sm:px-5">
          {activeTab?.hint && <p className="mb-3 text-xs text-obsidian/65">{activeTab.hint}</p>}
          {children}
        </main>
      </div>
    </div>
  );
}
