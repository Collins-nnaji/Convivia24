'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Users, Plus, X } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  relationship: string | null;
  email: string | null;
  notes: string | null;
}

export default function PeoplePanel() {
  const [people, setPeople] = useState<Person[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/people')
      .then((r) => r.json())
      .then((d) => setPeople(d.people || []))
      .finally(() => setLoading(false));
  }, []);

  async function addPerson(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch('/api/people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, relationship }),
    });
    const data = await res.json();
    if (data.person) setPeople((p) => [...p, data.person]);
    setName(''); setRelationship(''); setAdding(false);
  }

  async function removePerson(id: string) {
    setPeople((p) => p.filter((person) => person.id !== id));
    await fetch(`/api/people/${id}`, { method: 'DELETE' });
  }

  return (
    <div className="flex-1 bg-white/50 p-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-obsidian/40 flex items-center gap-1">
          <Users size={11} /> People
        </p>
        <button
          type="button"
          onClick={() => setAdding((a) => !a)}
          aria-label="Add person"
          className="text-obsidian/35 hover:text-obsidian transition-colors"
        >
          {adding ? <X size={12} /> : <Plus size={12} />}
        </button>
      </div>

      {!loading && people.length === 0 && !adding && (
        <p className="text-xs text-obsidian/45 leading-relaxed">Add your partner, friends, family — plan around them.</p>
      )}

      {people.length > 0 && (
        <ul className="space-y-1 mb-2">
          {people.map((p) => (
            <li key={p.id} className="group flex items-center justify-between gap-1 text-xs text-obsidian/70">
              <span className="truncate">{p.name}{p.relationship ? <span className="text-obsidian/35"> · {p.relationship}</span> : null}</span>
              <button
                type="button"
                onClick={() => removePerson(p.id)}
                aria-label={`Remove ${p.name}`}
                className="opacity-0 group-hover:opacity-100 text-obsidian/30 hover:text-rose-500 transition-opacity shrink-0"
              >
                <X size={11} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <form onSubmit={addPerson} className="space-y-1.5">
          <input
            value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" autoFocus
            className="w-full px-2 py-1.5 border border-obsidian/10 bg-white text-xs focus:border-gold outline-none"
          />
          <input
            value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="Relationship (optional)"
            className="w-full px-2 py-1.5 border border-obsidian/10 bg-white text-xs focus:border-gold outline-none"
          />
          <button type="submit" className="w-full py-1.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-semibold transition-colors">
            Add
          </button>
        </form>
      )}
    </div>
  );
}
