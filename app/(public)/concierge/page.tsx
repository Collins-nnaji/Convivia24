'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowUp, ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

interface Pick { slug: string; title: string; why: string }
interface Msg { role: 'user' | 'ai'; text: string; picks?: Pick[] }

const SUGGESTIONS = [
  'Something fun near me this weekend',
  'A chilled night out, not too loud',
  'Live Amapiano or Afrobeats anywhere',
  'A classy event to take a date',
];

export default function ConciergePage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  async function ask(text: string) {
    const query = text.trim();
    if (!query || loading) return;
    setMessages((m) => [...m, { role: 'user', text: query }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'ai', text: data.reply || 'Here are a few ideas.', picks: data.picks ?? [] }]);
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: 'I had trouble reaching the events list. Try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-paper min-h-screen">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14 flex flex-col min-h-screen">
        <div className="mb-6">
          <SectionLabel>AI Concierge</SectionLabel>
          <h1 className="font-display text-3xl sm:text-5xl font-light italic text-obsidian tracking-tight flex items-center gap-3">
            <Sparkles className="text-gold-dark" size={32} /> What are you in the mood for?
          </h1>
          <p className="text-obsidian/55 text-sm mt-3">Tell me the vibe, the city, the night — I&apos;ll pull the events that fit.</p>
        </div>

        {/* Conversation */}
        <div className="flex-1 space-y-5 mb-6">
          {messages.length === 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => ask(s)} className="text-left bg-white border border-obsidian/12 hover:border-gold/50 hover:bg-gold/5 p-4 text-obsidian/70 text-sm transition-colors">
                  &ldquo;{s}&rdquo;
                </button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
              {m.role === 'user' ? (
                <div className="bg-gold text-obsidian px-4 py-2.5 max-w-[80%] text-sm font-medium">{m.text}</div>
              ) : (
                <div className="max-w-[90%]">
                  <div className="flex items-start gap-2.5">
                    <Sparkles size={16} className="text-gold-dark mt-1 shrink-0" />
                    <p className="text-obsidian/80 text-sm leading-relaxed">{m.text}</p>
                  </div>
                  {m.picks && m.picks.length > 0 && (
                    <div className="mt-4 space-y-2.5 pl-7">
                      {m.picks.map((p) => (
                        <Link key={p.slug} href={`/events/${p.slug}`} className="group flex items-center justify-between gap-3 bg-white border border-obsidian/12 hover:border-gold/50 hover:bg-gold/5 p-4 transition-colors">
                          <div>
                            <p className="font-display text-lg italic text-obsidian group-hover:text-gold-dark transition-colors">{p.title}</p>
                            <p className="text-obsidian/50 text-xs mt-0.5">{p.why}</p>
                          </div>
                          <ArrowRight size={16} className="text-gold-dark shrink-0 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 text-obsidian/40 text-sm">
              <Sparkles size={16} className="text-gold-dark animate-pulse" /> Searching the lineup…
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="sticky bottom-20 md:bottom-4 flex items-center gap-2 bg-white border border-obsidian/15 shadow-lg focus-within:border-gold p-2 pl-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your perfect night…"
            className="flex-1 bg-transparent border-0 focus:ring-0 text-obsidian text-sm placeholder-obsidian/35 outline-none p-0"
          />
          <button type="submit" disabled={loading || !input.trim()} className="w-9 h-9 flex items-center justify-center bg-gold hover:bg-gold-light text-obsidian transition-colors disabled:opacity-40">
            <ArrowUp size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}
