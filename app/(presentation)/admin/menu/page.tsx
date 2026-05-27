'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { useAdmin } from '../layout';

type Category = { id: string; name: string; slug: string; section: string; note: string | null; sort_order: number; is_active: boolean; items: Item[] };
type Item = { id: string; category_id: string; name: string; description: string | null; price: string | null; is_highlight: boolean; is_active: boolean; sort_order: number };

export default function MenuAdmin() {
  const { secret } = useAdmin();
  const [menu, setMenu] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'food' | 'drinks'>('food');
  const [editItem, setEditItem] = useState<Partial<Item> & { category_id?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  function load() {
    if (!secret) return;
    fetch('/api/menu', { headers: { 'x-admin-secret': secret } })
      .then(r => r.json())
      .then(d => { setMenu(d.menu || []); setLoading(false); });
  }

  useEffect(load, [secret]);

  const categories = menu.filter(c => c.section === tab);

  async function saveItem() {
    if (!editItem?.name || !editItem.category_id) return;
    setSaving(true);
    const isNew = !editItem.id;
    const url = isNew ? '/api/menu' : `/api/menu/${editItem.id}`;
    const method = isNew ? 'POST' : 'PATCH';
    const body = isNew ? { type: 'item', ...editItem } : editItem;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify(body),
    });
    if (res.ok) { setEditItem(null); load(); flash(isNew ? 'Item added.' : 'Item updated.'); }
    setSaving(false);
  }

  async function toggleItem(item: Item) {
    await fetch(`/api/menu/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ is_active: !item.is_active }),
    });
    load();
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/menu/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ type: 'item' }),
    });
    load();
    flash('Item deleted.');
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a84c]/50 mb-1">Management</p>
          <h1 className="text-3xl font-light italic text-[#f5f0e8]">Menu</h1>
        </div>
        {msg && <p className="text-emerald-400 text-sm bg-emerald-400/10 px-3 py-1.5">{msg}</p>}
      </div>

      <div className="flex gap-2 mb-8">
        {(['food', 'drinks'] as const).map(s => (
          <button key={s} onClick={() => setTab(s)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${tab === s ? 'bg-[#c9a84c] text-[#0a0a0a]' : 'border border-[#c9a84c]/20 text-[#f5f0e8]/40 hover:text-[#f5f0e8]/70'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="border border-[#c9a84c]/10 p-6 animate-pulse h-24" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map(cat => (
            <div key={cat.id}>
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#c9a84c]/15">
                <div>
                  <h2 className="text-xl italic text-[#f5f0e8]">{cat.name}</h2>
                  {cat.note && <p className="text-[10px] uppercase tracking-widest text-[#c9a84c]/40">{cat.note}</p>}
                </div>
                <button
                  onClick={() => setEditItem({ category_id: cat.id, name: '', description: '', price: '', sort_order: 0 })}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#c9a84c]/60 hover:text-[#c9a84c] transition-colors"
                >
                  <Plus size={12} /> Add item
                </button>
              </div>
              <div className="space-y-1">
                {cat.items.length === 0 && <p className="text-[#f5f0e8]/20 text-sm py-2">No items yet.</p>}
                {cat.items.map(item => (
                  <div key={item.id} className={`flex items-start justify-between gap-4 p-3 border ${item.is_active ? 'border-[#c9a84c]/10' : 'border-[#c9a84c]/5 opacity-40'}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3">
                        <p className="text-sm text-[#f5f0e8] italic">{item.name}</p>
                        {item.price && <p className="text-xs text-[#c9a84c]/70 shrink-0">{item.price}</p>}
                      </div>
                      {item.description && <p className="text-xs text-[#f5f0e8]/30 mt-0.5 truncate">{item.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toggleItem(item)} title={item.is_active ? 'Hide' : 'Show'} className="text-[#f5f0e8]/30 hover:text-[#f5f0e8]/60 transition-colors">
                        {item.is_active ? <Check size={13} /> : <X size={13} />}
                      </button>
                      <button onClick={() => setEditItem({ ...item })} className="text-[#f5f0e8]/30 hover:text-[#c9a84c] transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="text-[#f5f0e8]/30 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add panel */}
      {editItem !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setEditItem(null)}>
          <div className="bg-[#0a0a0a] border border-[#c9a84c]/25 p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl italic text-[#f5f0e8]">{editItem.id ? 'Edit item' : 'Add item'}</h2>
              <button onClick={() => setEditItem(null)} className="text-[#f5f0e8]/30 hover:text-[#f5f0e8]"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-[#c9a84c]/50 block mb-1">Name *</label>
                <input value={editItem.name || ''} onChange={e => setEditItem(p => ({ ...p!, name: e.target.value }))}
                  className="w-full bg-transparent border-b border-[#c9a84c]/20 focus:border-[#c9a84c] text-[#f5f0e8] text-sm py-2 px-0 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-[#c9a84c]/50 block mb-1">Description</label>
                <textarea value={editItem.description || ''} onChange={e => setEditItem(p => ({ ...p!, description: e.target.value }))}
                  rows={2} className="w-full bg-transparent border-b border-[#c9a84c]/20 focus:border-[#c9a84c] text-[#f5f0e8] text-sm py-2 px-0 outline-none resize-none" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-[#c9a84c]/50 block mb-1">Price</label>
                <input value={editItem.price || ''} onChange={e => setEditItem(p => ({ ...p!, price: e.target.value }))}
                  placeholder="₦8,500" className="w-full bg-transparent border-b border-[#c9a84c]/20 focus:border-[#c9a84c] text-[#f5f0e8] text-sm py-2 px-0 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-[#c9a84c]/50 block mb-1">Sort order</label>
                <input type="number" value={editItem.sort_order ?? 0} onChange={e => setEditItem(p => ({ ...p!, sort_order: Number(e.target.value) }))}
                  className="w-full bg-transparent border-b border-[#c9a84c]/20 focus:border-[#c9a84c] text-[#f5f0e8] text-sm py-2 px-0 outline-none w-24" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditItem(null)} className="flex-1 border border-[#c9a84c]/20 text-[#f5f0e8]/40 hover:text-[#f5f0e8]/70 text-[10px] font-black uppercase tracking-widest py-2.5 transition-colors">
                Cancel
              </button>
              <button onClick={saveItem} disabled={saving || !editItem.name}
                className="flex-1 bg-[#c9a84c] hover:bg-[#d4b464] text-[#0a0a0a] text-[10px] font-black uppercase tracking-widest py-2.5 transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
