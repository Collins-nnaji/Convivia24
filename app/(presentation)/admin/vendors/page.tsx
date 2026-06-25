'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Store, Search, Check, X, Star, Trash2, Mail, Phone, MessageCircle,
  Globe, Instagram, MapPin, Loader2, Copy, ExternalLink, Archive,
} from 'lucide-react';
import { useAdmin } from '../layout';
import {
  VENDOR_CATEGORIES, VENDOR_CATEGORY_LABELS, vendorCategoryLabel, type VendorRow,
} from '@/lib/vendors';
import { formatMoney } from '@/lib/money';

const STATUS_TABS = [
  { id: 'approved', label: 'Approved' },
  { id: 'pending', label: 'Pending' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'archived', label: 'Archived' },
  { id: 'all', label: 'All' },
] as const;

export default function VendorsAdmin() {
  const { secret } = useAdmin();
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('approved');
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 2500); }

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (category) params.set('category', category);
    if (q.trim()) params.set('q', q.trim());
    fetch(`/api/vendors?${params.toString()}`, { headers: { 'x-admin-secret': secret } })
      .then((r) => r.json())
      .then((d) => { setVendors(d.vendors ?? []); setCounts(d.counts ?? {}); })
      .finally(() => setLoading(false));
  }, [secret, status, category, q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  async function patch(id: string, body: Record<string, unknown>) {
    await fetch(`/api/vendors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify(body),
    });
    load();
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Permanently delete "${name}"?`)) return;
    await fetch(`/api/vendors/${id}`, { method: 'DELETE', headers: { 'x-admin-secret': secret } });
    flash('Vendor deleted.');
    load();
  }

  function copyApplyLink() {
    const url = `${window.location.origin}/vendors/apply`;
    navigator.clipboard?.writeText(url).then(() => flash('Vendor sign-up link copied.'));
  }

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-light italic text-obsidian flex items-center gap-2"><Store size={22} className="text-gold-dark" /> Vendor directory</h1>
          <p className="text-obsidian/40 text-sm mt-1">Browse and manage suppliers for your events — caterers, photographers, DJs and more.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyApplyLink} className="inline-flex items-center gap-1.5 border border-obsidian/15 text-obsidian/70 text-[11px] font-black uppercase tracking-[0.15em] px-3.5 py-2.5 hover:border-gold transition-colors">
            <Copy size={13} /> Invite link
          </button>
          <a href="/vendors/apply" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.15em] px-3.5 py-2.5 transition-colors">
            <ExternalLink size={13} /> Onboarding form
          </a>
        </div>
      </div>

      {msg && <p className="mb-4 text-[#a07c28] text-sm">{msg}</p>}

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setStatus(t.id)}
            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.12em] border transition-colors ${status === t.id ? 'bg-obsidian text-cream border-obsidian' : 'bg-white border-obsidian/15 text-obsidian/55 hover:border-obsidian/40'}`}
          >
            {t.label}
            {t.id !== 'all' && counts[t.id] != null && <span className="ml-1.5 opacity-60">{counts[t.id]}</span>}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian/30" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or service…"
            className="w-full bg-white border border-obsidian/15 focus:border-gold text-obsidian text-sm py-2.5 pl-9 pr-3 outline-none focus:ring-0"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-white border border-obsidian/15 focus:border-gold text-obsidian text-sm py-2.5 px-3 outline-none focus:ring-0">
          <option value="">All categories</option>
          {VENDOR_CATEGORIES.map((c) => <option key={c} value={c}>{VENDOR_CATEGORY_LABELS[c]}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="animate-spin text-gold-dark" /></div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-obsidian/15">
          <Store size={28} className="text-obsidian/20 mx-auto mb-3" />
          <p className="text-obsidian/50 text-sm">No vendors here yet.</p>
          <button onClick={copyApplyLink} className="mt-3 text-[#a07c28] text-[11px] font-black uppercase tracking-[0.15em]">Share the sign-up link →</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {vendors.map((v) => (
            <VendorCard key={v.id} vendor={v} onPatch={patch} onRemove={remove} />
          ))}
        </div>
      )}
    </div>
  );
}

function VendorCard({ vendor: v, onPatch, onRemove }: {
  vendor: VendorRow;
  onPatch: (id: string, body: Record<string, unknown>) => void;
  onRemove: (id: string, name: string) => void;
}) {
  const statusColor: Record<string, string> = {
    approved: 'text-emerald-600', pending: 'text-amber-600', rejected: 'text-red-500', archived: 'text-obsidian/40',
  };
  const contacts: { icon: typeof Mail; label: string; href: string }[] = [];
  if (v.email) contacts.push({ icon: Mail, label: v.email, href: `mailto:${v.email}` });
  if (v.phone) contacts.push({ icon: Phone, label: v.phone, href: `tel:${v.phone}` });
  if (v.whatsapp) contacts.push({ icon: MessageCircle, label: 'WhatsApp', href: `https://wa.me/${v.whatsapp.replace(/[^0-9]/g, '')}` });
  if (v.website) contacts.push({ icon: Globe, label: 'Website', href: v.website.startsWith('http') ? v.website : `https://${v.website}` });
  if (v.instagram) contacts.push({ icon: Instagram, label: v.instagram, href: `https://instagram.com/${v.instagram.replace(/^@/, '')}` });

  return (
    <div className="bg-white border border-obsidian/10 p-5 flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 shrink-0 bg-paper border border-obsidian/10 overflow-hidden flex items-center justify-center">
          {v.logo_url ? <img src={v.logo_url} alt="" className="w-full h-full object-cover" /> : <Store size={18} className="text-obsidian/25" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display text-lg italic text-obsidian leading-tight truncate">{v.business_name}</h3>
            {v.is_featured && <Star size={13} className="text-[#a07c28] fill-[#c9a84c] shrink-0" />}
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gold-dark mt-0.5">{vendorCategoryLabel(v.category)}</p>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-wider ${statusColor[v.status] ?? 'text-obsidian/40'}`}>{v.status}</span>
      </div>

      {v.description && <p className="text-obsidian/60 text-sm mb-3 line-clamp-3">{v.description}</p>}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {(v.services ?? []).slice(0, 5).map((s) => (
          <span key={s} className="text-[10px] bg-paper border border-obsidian/10 px-2 py-0.5 text-obsidian/60">{s}</span>
        ))}
      </div>

      <div className="text-xs text-obsidian/50 space-y-1 mb-3">
        {(v.city || v.country) && (
          <p className="flex items-center gap-1.5"><MapPin size={12} className="text-gold-dark" /> {[v.city, v.country].filter(Boolean).join(', ')}</p>
        )}
        {v.price_from && (
          <p className="text-obsidian/70">From <span className="text-gold-dark font-semibold">{formatMoney(v.price_from, v.currency)}</span></p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {contacts.map((c, i) => (
          <a key={i} href={c.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 border border-obsidian/12 text-obsidian/70 text-xs px-2.5 py-1.5 hover:border-gold hover:text-gold-dark transition-colors max-w-full">
            <c.icon size={12} className="shrink-0" /> <span className="truncate">{c.label}</span>
          </a>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-1 border-t border-obsidian/10 pt-3">
        {v.status !== 'approved' && (
          <button onClick={() => onPatch(v.id, { status: 'approved' })} title="Approve" className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 px-2 py-1.5 hover:bg-emerald-50 transition-colors"><Check size={13} /> Approve</button>
        )}
        {v.status !== 'rejected' && v.status !== 'approved' && (
          <button onClick={() => onPatch(v.id, { status: 'rejected' })} title="Reject" className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-500 px-2 py-1.5 hover:bg-red-50 transition-colors"><X size={13} /> Reject</button>
        )}
        {v.status === 'approved' && (
          <button onClick={() => onPatch(v.id, { is_featured: !v.is_featured })} title={v.is_featured ? 'Unfeature' : 'Feature'} className="p-2 text-obsidian/40 hover:text-[#a07c28]"><Star size={15} className={v.is_featured ? 'fill-[#c9a84c] text-[#a07c28]' : ''} /></button>
        )}
        <div className="ml-auto flex items-center gap-1">
          {v.status !== 'archived' && (
            <button onClick={() => onPatch(v.id, { status: 'archived' })} title="Archive" className="p-2 text-obsidian/40 hover:text-obsidian"><Archive size={14} /></button>
          )}
          <button onClick={() => onRemove(v.id, v.business_name)} title="Delete" className="p-2 text-obsidian/40 hover:text-red-500"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}
