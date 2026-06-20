'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Send, Plus, Check } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useUser } from '@/components/auth/AuthProvider';

interface Message { id?: string; role: 'user' | 'assistant'; content: string }
interface SuggestedTask { title: string; starts_at: string; ends_at: string; priority: 'low' | 'normal' | 'high' }

export default function CompanionPage() {
  const { user, loading: authLoading } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedTask[]>([]);
  const [addedTitles, setAddedTitles] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/companion');
    const data = await res.json();
    setMessages(data.messages || []);
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, suggestions]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSuggestions([]);
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setSending(true);
    try {
      const res = await fetch('/api/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.reply || "I'm here." }]);
      setSuggestions(data.suggested_tasks || []);
    } finally {
      setSending(false);
    }
  }

  async function addSuggestion(t: SuggestedTask) {
    await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t),
    });
    setAddedTitles((s) => new Set(s).add(t.title));
  }

  if (!authLoading && !user) {
    return (
      <section className="zen-ribbon-bg min-h-[70vh] flex items-center justify-center px-6 text-center">
        <div>
          <p className="font-display text-3xl italic text-obsidian mb-4">Sign in to talk to your companion.</p>
          <Link href="/signin?next=/companion" className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors">
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="zen-ribbon-bg min-h-[90vh] -mt-16 pt-16 flex flex-col">
      <div className="max-w-2xl w-full mx-auto px-5 sm:px-8 pt-12 pb-4 shrink-0">
        <SectionLabel>Companion</SectionLabel>
        <h1 className="font-display text-3xl sm:text-5xl font-light italic text-obsidian tracking-tight">Just us.</h1>
        <p className="text-obsidian/50 text-sm mt-2">It remembers what matters to you, and helps plan around it.</p>
      </div>

      <div className="flex-1 overflow-y-auto max-w-2xl w-full mx-auto px-5 sm:px-8 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-obsidian/40 text-sm italic font-display text-lg pt-10 text-center">Tell me what&rsquo;s on your mind, or what kind of day you want tomorrow.</p>
        )}
        {messages.map((m, i) => (
          <div key={m.id ?? i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-obsidian text-cream' : 'bg-white/80 border border-gold/20 text-obsidian'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {sending && <p className="text-obsidian/40 text-xs italic">thinking…</p>}

        {suggestions.length > 0 && (
          <div className="space-y-2 pt-2">
            {suggestions.map((t) => {
              const added = addedTitles.has(t.title);
              return (
                <div key={t.title} className="flex items-center justify-between gap-3 p-3 border border-champagne/30 bg-champagne/5">
                  <div>
                    <p className="font-display italic text-obsidian">{t.title}</p>
                    <p className="text-[11px] text-obsidian/50">{new Date(t.starts_at).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <button
                    onClick={() => addSuggestion(t)}
                    disabled={added}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] bg-gold hover:bg-gold-light disabled:bg-obsidian/10 disabled:text-obsidian/40 text-obsidian transition-colors"
                  >
                    {added ? <><Check size={12} /> Added</> : <><Plus size={12} /> Add to My 24</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="max-w-2xl w-full mx-auto px-5 sm:px-8 py-5 flex gap-3 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Talk to me…"
          className="flex-1 px-4 py-3 border border-obsidian/15 bg-white text-sm focus:border-gold outline-none"
        />
        <button type="submit" disabled={sending} className="px-5 py-3 bg-gold hover:bg-gold-light disabled:opacity-50 text-obsidian transition-colors">
          <Send size={16} />
        </button>
      </form>
    </section>
  );
}
