'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowUp, ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { EASE_OUT, tween } from '@/lib/motion/presets';

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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={tween(0.5)}
          className="mb-6"
        >
          <SectionLabel>AI Concierge</SectionLabel>
          <h1 className="font-display text-3xl sm:text-5xl font-light italic text-obsidian tracking-tight flex items-center gap-3">
            <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <Sparkles className="text-gold-dark" size={32} />
            </motion.span>
            What are you in the mood for?
          </h1>
          <p className="text-obsidian/55 text-sm mt-3">Tell me the vibe, the city, the night — I&apos;ll pull the events that fit.</p>
        </motion.div>

        <div className="flex-1 space-y-5 mb-6">
          {messages.length === 0 && (
            <motion.div
              className="grid sm:grid-cols-2 gap-3"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            >
              {SUGGESTIONS.map((s) => (
                <motion.button
                  key={s}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  onClick={() => ask(s)}
                  className="text-left bg-white border border-obsidian/12 hover:border-gold/50 hover:bg-gold/5 hover:-translate-y-0.5 hover:shadow-soft p-4 text-obsidian/70 text-sm transition-all duration-200 rounded-xl"
                >
                  &ldquo;{s}&rdquo;
                </motion.button>
              ))}
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.32, ease: EASE_OUT }}
                className={m.role === 'user' ? 'flex justify-end' : ''}
              >
                {m.role === 'user' ? (
                  <div className="bg-gold text-obsidian px-4 py-2.5 max-w-[80%] text-sm font-medium rounded-2xl rounded-br-md shadow-soft">
                    {m.text}
                  </div>
                ) : (
                  <div className="max-w-[90%]">
                    <div className="flex items-start gap-2.5">
                      <Sparkles size={16} className="text-gold-dark mt-1 shrink-0" />
                      <p className="text-obsidian/80 text-sm leading-relaxed">{m.text}</p>
                    </div>
                    {m.picks && m.picks.length > 0 && (
                      <div className="mt-4 space-y-2.5 pl-7">
                        {m.picks.map((p, pi) => (
                          <motion.div
                            key={p.slug}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: pi * 0.06, duration: 0.3 }}
                          >
                            <Link href={`/events/${p.slug}`} className="group flex items-center justify-between gap-3 bg-white border border-obsidian/12 hover:border-gold/50 hover:bg-gold/5 hover:-translate-y-0.5 hover:shadow-soft p-4 transition-all duration-200 rounded-xl">
                              <div>
                                <p className="font-display text-lg italic text-obsidian group-hover:text-gold-dark transition-colors">{p.title}</p>
                                <p className="text-obsidian/50 text-xs mt-0.5">{p.why}</p>
                              </div>
                              <ArrowRight size={16} className="text-gold-dark shrink-0 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2.5 text-obsidian/40 text-sm"
            >
              <Sparkles size={16} className="text-gold-dark animate-pulse" />
              Searching the lineup
              <span className="inline-flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1 h-1 rounded-full bg-gold-dark"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </span>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        <motion.form
          onSubmit={(e) => { e.preventDefault(); ask(input); }}
          className="sticky bottom-20 md:bottom-4 flex items-center gap-2 bg-white border border-obsidian/15 shadow-lift focus-within:border-gold focus-within:shadow-glow p-2 pl-4 rounded-2xl transition-shadow duration-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...tween(0.4) }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your perfect night…"
            className="flex-1 bg-transparent border-0 focus:ring-0 text-obsidian text-sm placeholder-obsidian/35 outline-none p-0"
          />
          <motion.button
            type="submit"
            disabled={loading || !input.trim()}
            whileTap={{ scale: 0.92 }}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gold hover:bg-gold-light text-obsidian transition-colors disabled:opacity-40"
          >
            <ArrowUp size={18} />
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
}
