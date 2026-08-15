'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Check, Copy, Lock, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { DRINKS, getDrinkBySlug } from '@/lib/drinks/catalog';
import {
  addLineToCrew,
  crewSubtotal,
  equalSplit,
  getCrew,
  inviteUrl,
  setCrewLineQty,
  updateCrew,
  type PartyCrew,
  formatNgn,
} from '@/lib/crews/store';

export default function CrewDetailPage() {
  const params = useParams();
  const id = String(params.id || '');
  const router = useRouter();
  const { clear, addProduct } = useCart();
  const [crew, setCrew] = useState<PartyCrew | null>(null);
  const [guestName, setGuestName] = useState('Guest');
  const [members, setMembers] = useState(1);
  const [copied, setCopied] = useState(false);
  const [pickOpen, setPickOpen] = useState(false);

  function refresh() {
    const c = getCrew(id);
    setCrew(c || null);
    if (c) setMembers(c.memberCount);
  }

  useEffect(() => {
    refresh();
  }, [id]);

  if (!crew) {
    return (
      <section className="bg-paper min-h-[60vh] px-5 py-20">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-3">Crew not found</h1>
          <Link href="/crews" className="text-ember text-sm font-medium">
            ← Back to Crews
          </Link>
        </div>
      </section>
    );
  }

  const subtotal = crewSubtotal(crew);
  const split = equalSplit({ ...crew, memberCount: members });

  async function copyInvite() {
    const url = inviteUrl(crew!.id);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function bumpMembers(n: number) {
    const next = Math.max(1, Math.min(50, n));
    setMembers(next);
    updateCrew(crew!.id, { memberCount: next });
    refresh();
  }

  function addDrink(slug: string) {
    const product = getDrinkBySlug(slug);
    if (!product || crew!.locked) return;
    addLineToCrew(crew!.id, {
      slug: product.slug,
      name: product.name,
      priceNgn: product.priceNgn,
      addedBy: guestName || 'Guest',
      qty: 1,
    });
    refresh();
    setPickOpen(false);
  }

  function lockAndCheckout() {
    updateCrew(crew!.id, { locked: true });
    clear();
    for (const line of crew!.lines) {
      addProduct(line.slug, line.qty);
    }
    router.push(`/checkout?crew=${crew!.id}`);
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <Link href="/crews" className="text-[11px] font-black uppercase tracking-[0.15em] text-obsidian/40 hover:text-ember">
          ← All crews
        </Link>

        <div className="mt-6 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-2">Party Crew</p>
              <h1 className="text-3xl font-bold text-obsidian">{crew.name}</h1>
              <p className="text-sm text-obsidian/50 mt-1">
                {crew.venue} · {crew.targetTime} · Host {crew.hostName}
              </p>
            </div>
            {crew.locked && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-ember bg-ember/10 px-2.5 py-1">
                <Lock size={12} /> Locked
              </span>
            )}
          </div>
        </div>

        <div className="bg-white border border-obsidian/8 p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-1">Invite link</p>
            <p className="text-xs font-mono text-obsidian/60 break-all">{inviteUrl(crew.id)}</p>
          </div>
          <button
            type="button"
            onClick={copyInvite}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] hover:border-ember hover:text-ember"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy invite'}
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-white border border-obsidian/8 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/35 mb-1">Subtotal</p>
            <p className="text-xl font-bold">{formatNgn(subtotal)}</p>
          </div>
          <div className="bg-white border border-obsidian/8 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/35 mb-1">Members</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={crew.locked}
                onClick={() => bumpMembers(members - 1)}
                className="p-1 border border-obsidian/15 disabled:opacity-40"
              >
                <Minus size={12} />
              </button>
              <span className="text-xl font-bold w-8 text-center">{members}</span>
              <button
                type="button"
                disabled={crew.locked}
                onClick={() => bumpMembers(members + 1)}
                className="p-1 border border-obsidian/15 disabled:opacity-40"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
          <div className="bg-white border border-ember/25 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-ember mb-1">Equal split</p>
            <p className="text-xl font-bold text-ember">{formatNgn(split)}</p>
            <p className="text-[10px] text-obsidian/35 mt-0.5">Hint only · host pays</p>
          </div>
        </div>

        {!crew.locked && (
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your name"
              className="flex-1 border border-obsidian/10 px-3 py-2.5 text-sm focus:border-ember focus:ring-0"
            />
            <button
              type="button"
              onClick={() => setPickOpen((v) => !v)}
              className="px-5 py-2.5 btn-brand text-[11px] font-black uppercase tracking-[0.12em]"
            >
              {pickOpen ? 'Close picker' : 'Add drinks'}
            </button>
          </div>
        )}

        {pickOpen && !crew.locked && (
          <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto border border-obsidian/8 p-3 bg-white">
            {DRINKS.slice(0, 12).map((d) => (
              <button
                key={d.slug}
                type="button"
                onClick={() => addDrink(d.slug)}
                className="text-left p-2 border border-obsidian/8 hover:border-ember transition-colors"
              >
                <p className="text-xs font-semibold line-clamp-2">{d.name}</p>
                <p className="text-[10px] text-obsidian/45 mt-0.5">{formatNgn(d.priceNgn)}</p>
              </button>
            ))}
            <Link href="/shop" className="col-span-2 sm:col-span-3 text-center text-[10px] font-black uppercase tracking-wider text-ember py-2">
              Browse full shop →
            </Link>
          </div>
        )}

        <ul className="space-y-4 mb-10">
          {crew.lines.length === 0 ? (
            <li className="text-sm text-obsidian/45">No bottles yet — add from the picker or shop.</li>
          ) : (
            crew.lines.map((line) => (
              <li key={line.slug} className="flex items-center justify-between gap-4 border-b border-obsidian/8 pb-4">
                <div>
                  <p className="font-semibold text-obsidian">{line.name}</p>
                  <p className="text-[10px] text-obsidian/40">Added by {line.addedBy}</p>
                </div>
                <div className="flex items-center gap-3">
                  {!crew.locked && (
                    <div className="flex items-center border border-obsidian/15">
                      <button
                        type="button"
                        className="p-1.5"
                        onClick={() => {
                          setCrewLineQty(crew.id, line.slug, line.qty - 1);
                          refresh();
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-7 text-center text-sm">{line.qty}</span>
                      <button
                        type="button"
                        className="p-1.5"
                        onClick={() => {
                          setCrewLineQty(crew.id, line.slug, line.qty + 1);
                          refresh();
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  )}
                  {crew.locked && <span className="text-sm text-obsidian/50">×{line.qty}</span>}
                  <p className="text-sm font-semibold w-24 text-right">{formatNgn(line.priceNgn * line.qty)}</p>
                </div>
              </li>
            ))
          )}
        </ul>

        {!crew.locked && crew.lines.length > 0 && (
          <button
            type="button"
            onClick={lockAndCheckout}
            className="w-full flex items-center justify-center gap-2 py-4 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
          >
            <ShoppingBag size={16} /> Lock &amp; checkout {formatNgn(subtotal)}
          </button>
        )}
        {crew.locked && (
          <Link
            href={`/checkout?crew=${crew.id}`}
            className="w-full flex items-center justify-center gap-2 py-4 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
          >
            Continue checkout
          </Link>
        )}
      </div>
    </section>
  );
}
