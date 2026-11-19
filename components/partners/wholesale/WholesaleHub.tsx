'use client';

import { Suspense, useCallback, useEffect, useRef, type ComponentType, type MouseEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  CircleHelp,
  ClipboardList,
  Crown,
  FileText,
  LayoutDashboard,
  Lock,
  Store,
} from 'lucide-react';
import WholesaleModal from './WholesaleModal';
import {
  ApplyPanel,
  DeskPanel,
  HelpPanel,
  HowPanel,
  LockedPricesPanel,
  PerksPanel,
  TermsPanel,
} from './panels';
import { WHOLESALE_OFF_PCT } from '@/lib/partners/pricing';

/*
 * /partners — the wholesale hub. A short hero and a grid of cards; each card
 * opens a full-page panel with its own URL (/partners?open=prices, …) so links
 * can be shared and Back closes the panel. The price list itself is only in the
 * signed-in wholesale portal (/partners/portal).
 */

type Panel = {
  id: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  sub: string;
  heading: string;
  Body: ComponentType;
  wide?: boolean;
};

export const WHOLESALE_PANELS: Panel[] = [
  { id: 'apply', icon: Store, title: 'Open an account', sub: 'For bars, clubs, hotels & events', heading: 'Apply for a wholesale account', Body: ApplyPanel, wide: true },
  { id: 'prices', icon: Lock, title: 'Partner price list', sub: 'Partners only — sign in to view', heading: 'Partner price list', Body: LockedPricesPanel },
  { id: 'desk', icon: LayoutDashboard, title: 'Wholesale portal', sub: 'Prices, orders, stock & margins', heading: 'Your wholesale portal', Body: DeskPanel },
  { id: 'how', icon: ClipboardList, title: 'How it works', sub: 'From application to first delivery', heading: 'How wholesale works', Body: HowPanel, wide: true },
  { id: 'terms', icon: FileText, title: 'Credit, payment & delivery', sub: 'Two weeks’ credit once signed', heading: 'Credit, payment and delivery', Body: TermsPanel },
  { id: 'perks', icon: Crown, title: 'Premium card & perks', sub: '2 points per ₦100 spent', heading: 'Premium card and perks', Body: PerksPanel, wide: true },
  { id: 'help', icon: CircleHelp, title: 'Help & FAQs', sub: 'Answers before you sign up', heading: 'Wholesale questions', Body: HelpPanel },
];

const PROOF = [
  [`${WHOLESALE_OFF_PCT}%`, 'below retail'],
  ['14 days', 'credit once signed'],
  ['2 pts', 'per ₦100 spent'],
  ['48', 'bottles per line'],
] as const;

/** Opens a panel without a server round trip; the URL still updates for sharing and Back. */
function useOpenPanel() {
  const openedInApp = useRef(false);

  const open = useCallback((id: string) => {
    openedInApp.current = true;
    window.history.pushState(null, '', `/partners?open=${encodeURIComponent(id)}`);
  }, []);

  const close = useCallback(() => {
    if (openedInApp.current) {
      openedInApp.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, '', '/partners');
    }
  }, []);

  // Links inside panels (data-wholesale-open) switch panels in place.
  useEffect(() => {
    function onClick(e: globalThis.MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[data-wholesale-open]');
      if (!a) return;
      e.preventDefault();
      const id = a.dataset.wholesaleOpen!;
      window.history.replaceState(null, '', `/partners?open=${encodeURIComponent(id)}`);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return { open, close };
}

function ActivePanel({ close }: { close: () => void }) {
  const params = useSearchParams();
  const panel = WHOLESALE_PANELS.find((p) => p.id === params.get('open'));
  if (!panel) return null;
  const { Body } = panel;
  return (
    <WholesaleModal key={panel.id} kicker={panel.title} title={panel.heading} icon={panel.icon} wide={panel.wide} onClose={close}>
      <Body />
    </WholesaleModal>
  );
}

export default function WholesaleHub() {
  const { open, close } = useOpenPanel();

  const onCard = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    open(id);
  };

  return (
    <section className="bg-paper pb-24 md:pb-16">
      <div className="relative mx-3 mt-4 overflow-hidden rounded-3xl bg-obsidian text-white sm:mx-4 lg:mx-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 90% at 85% 10%, rgba(139,42,34,0.55), transparent 60%), radial-gradient(40% 60% at 10% 110%, rgba(242,163,58,0.18), transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-[1600px] px-6 pb-8 pt-8 sm:px-10 sm:pb-12 sm:pt-14 lg:px-14">
          <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-saffron">
            <span className="h-px w-6 bg-saffron/70" /> Wholesale
          </p>
          <h1 className="max-w-[16ch] font-serif text-[2.15rem] font-light leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Stock the bar for less. Restock without the runaround.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Partner prices on every bottle we carry for clubs, lounges, hotels and event spaces — delivered to your
            venue, with two weeks’ credit once you’re signed.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="/partners?open=apply"
              onClick={onCard('apply')}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-obsidian transition-colors hover:bg-saffron"
            >
              Apply for wholesale <ArrowRight size={14} />
            </a>
            <Link
              href="/partners/portal"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-white/50"
            >
              <Lock size={13} /> Partner sign in
            </Link>
          </div>
          <dl className="mt-8 grid sm:mt-10 max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
            {PROOF.map(([v, l]) => (
              <div key={l} className="bg-obsidian/80 px-4 py-4">
                <dt className="sr-only">{l}</dt>
                <dd>
                  <span className="block font-serif text-2xl font-light tabular-nums sm:text-3xl">{v}</span>
                  <span className="mt-0.5 block text-xs text-white/50">{l}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-3 pt-8 sm:px-4 sm:pt-10 lg:px-5">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {WHOLESALE_PANELS.map(({ id, icon: Icon, title, sub }) => {
            const primary = id === 'apply';
            return (
              <li key={id}>
                <a
                  href={`/partners?open=${id}`}
                  onClick={onCard(id)}
                  className={`group relative flex h-full min-h-[136px] flex-col rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 sm:min-h-[150px] sm:p-5 ${
                    primary
                      ? 'border-ember bg-ember text-white hover:border-obsidian hover:bg-obsidian hover:shadow-[0_18px_36px_-22px_rgba(10,10,10,0.6)]'
                      : 'border-obsidian/8 bg-white text-obsidian hover:border-ember/35 hover:shadow-[0_18px_36px_-24px_rgba(10,10,10,0.35)]'
                  }`}
                >
                  <span
                    className={`mb-4 grid h-10 w-10 place-items-center rounded-xl ${
                      primary ? 'bg-white/15 text-white' : 'bg-ember/10 text-ember'
                    }`}
                  >
                    <Icon size={19} strokeWidth={1.7} />
                  </span>
                  <strong className="text-[15px] font-semibold leading-snug tracking-tight">{title}</strong>
                  <span className={`mt-1 text-[13px] leading-snug ${primary ? 'text-white/75' : 'text-obsidian/50'}`}>{sub}</span>
                  <ArrowRight
                    size={16}
                    className={`absolute right-4 top-5 transition-transform group-hover:translate-x-0.5 sm:right-5 ${
                      primary ? 'text-white/70' : 'text-obsidian/30 group-hover:text-ember'
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex flex-col gap-4 rounded-3xl bg-shell px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <p className="font-serif text-2xl font-light text-obsidian">Already a partner?</p>
            <p className="mt-1 text-sm text-obsidian/55">Sign in to see the price list, restock, count stock and spend your points.</p>
          </div>
          <Link href="/partners/portal" className="btn-brand inline-flex shrink-0 items-center gap-2 self-start px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] sm:self-auto">
            Open wholesale portal <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <Suspense fallback={null}>
        <ActivePanel close={close} />
      </Suspense>
    </section>
  );
}
