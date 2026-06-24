'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Users, Plus, X, Pencil, MessageCircle } from 'lucide-react';
import { waCheckInLink, daysSince } from '@/lib/whatsapp';

interface Person {
  id: string;
  name: string;
  relationship: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  last_contacted_at: string | null;
}

function lastContactLabel(iso: string | null): string {
  if (!iso) return 'Never checked in';
  const d = daysSince(iso);
  if (d <= 0) return 'Checked in today';
  if (d === 1) return 'Checked in yesterday';
  return `Checked in ${d}d ago`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function PeoplePanel() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRelationship, setEditRelationship] = useState('');
  const [editPhone, setEditPhone] = useState('');

  function load() {
    return fetch('/api/people')
      .then((r) => r.json())
      .then((d) => setPeople(d.people || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function addPerson(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch('/api/people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, relationship, phone }),
    });
    setName(''); setRelationship(''); setPhone(''); setAdding(false);
    load();
  }

  async function removePerson(id: string) {
    setPeople((p) => p.filter((person) => person.id !== id));
    await fetch(`/api/people/${id}`, { method: 'DELETE' });
  }

  function startEdit(p: Person) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditRelationship(p.relationship || '');
    setEditPhone(p.phone || '');
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;
    const res = await fetch(`/api/people/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, relationship: editRelationship, phone: editPhone }),
    });
    const data = await res.json();
    if (data.person) setPeople((p) => p.map((person) => (person.id === editingId ? data.person : person)));
    setEditingId(null);
  }

  async function checkIn(p: Person) {
    if (!p.phone) return;
    window.open(waCheckInLink(p.phone, p.name), '_blank', 'noopener,noreferrer');
    await fetch(`/api/people/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ touch: true }),
    });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-obsidian/40 flex items-center gap-1.5">
          <Users size={13} /> Your people
        </p>
        <button
          type="button"
          onClick={() => setAdding((a) => !a)}
          aria-label="Add person"
          className="w-8 h-8 flex items-center justify-center rounded-full text-obsidian/45 hover:text-obsidian hover:bg-obsidian/[0.05] transition-colors"
        >
          {adding ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>
      <p className="text-sm text-obsidian/45 leading-relaxed mb-4">
        Add your partner, friends, family — whoever you&apos;ve gone longest without checking in on rises to the top.
      </p>

      {adding && (
        <form onSubmit={addPerson} className="space-y-2 mb-4 p-3.5 rounded-xl border border-obsidian/10 bg-white">
          <input
            value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" autoFocus
            className="w-full px-3 py-2.5 border border-obsidian/10 bg-white text-sm focus:border-gold outline-none"
          />
          <input
            value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="Relationship (optional)"
            className="w-full px-3 py-2.5 border border-obsidian/10 bg-white text-sm focus:border-gold outline-none"
          />
          <input
            value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp number, e.g. +1 555 123 4567 (optional)"
            className="w-full px-3 py-2.5 border border-obsidian/10 bg-white text-sm focus:border-gold outline-none"
          />
          <button type="submit" className="w-full py-2.5 bg-gold hover:bg-gold-light text-obsidian text-sm font-semibold transition-colors">
            Add
          </button>
        </form>
      )}

      {!loading && people.length === 0 && !adding && (
        <p className="text-sm text-obsidian/45 leading-relaxed py-6 text-center">No one here yet — tap + to add someone.</p>
      )}

      {people.length > 0 && (
        <ul className="space-y-2">
          {people.map((p) => (
            <li key={p.id} className="rounded-xl border border-obsidian/10 bg-white p-3.5">
              {editingId === p.id ? (
                <form onSubmit={saveEdit} className="space-y-2">
                  <input
                    value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" autoFocus
                    className="w-full px-3 py-2 border border-obsidian/10 bg-white text-sm focus:border-gold outline-none"
                  />
                  <input
                    value={editRelationship} onChange={(e) => setEditRelationship(e.target.value)} placeholder="Relationship (optional)"
                    className="w-full px-3 py-2 border border-obsidian/10 bg-white text-sm focus:border-gold outline-none"
                  />
                  <input
                    value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="WhatsApp number (optional)"
                    className="w-full px-3 py-2 border border-obsidian/10 bg-white text-sm focus:border-gold outline-none"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-2 bg-gold hover:bg-gold-light text-obsidian text-xs font-semibold transition-colors">Save</button>
                    <button type="button" onClick={() => setEditingId(null)} className="px-3 py-2 border border-obsidian/10 text-obsidian/60 hover:text-obsidian text-xs transition-colors">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-gold/15 text-gold-dark text-xs font-black flex items-center justify-center">
                    {initials(p.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-obsidian truncate">
                      {p.name}{p.relationship ? <span className="text-obsidian/40"> · {p.relationship}</span> : null}
                    </p>
                    <p className="text-xs text-obsidian/40 mt-0.5">{lastContactLabel(p.last_contacted_at)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {p.phone ? (
                      <button
                        type="button"
                        onClick={() => checkIn(p)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
                      >
                        <MessageCircle size={13} /> Check in
                      </button>
                    ) : (
                      <button type="button" onClick={() => startEdit(p)} className="text-xs text-obsidian/40 hover:text-obsidian transition-colors">
                        Add phone
                      </button>
                    )}
                    <button type="button" onClick={() => startEdit(p)} aria-label={`Edit ${p.name}`} className="w-7 h-7 flex items-center justify-center text-obsidian/30 hover:text-obsidian transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button type="button" onClick={() => removePerson(p.id)} aria-label={`Remove ${p.name}`} className="w-7 h-7 flex items-center justify-center text-obsidian/30 hover:text-rose-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
