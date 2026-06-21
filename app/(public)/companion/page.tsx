'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Plus, Check, PanelLeft, X } from 'lucide-react';
import { useUser } from '@/components/auth/AuthProvider';
import CompanionDashboard, { type Dashboard, type ScheduleBlock } from '@/components/companion/CompanionDashboard';
import CompanionSidebar, { type Conversation } from '@/components/companion/CompanionSidebar';

interface Message { id?: string; role: 'user' | 'assistant'; content: string }
interface SuggestedTask { title: string; starts_at: string; ends_at: string; priority: 'low' | 'normal' | 'high' }

export default function CompanionPage() {
  const { user, loading: authLoading } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedTask[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [addedTitles, setAddedTitles] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refreshConversations = useCallback(async (): Promise<Conversation[]> => {
    const res = await fetch('/api/companion/conversations');
    if (!res.ok) return [];
    const data = await res.json();
    const list: Conversation[] = data.conversations || [];
    setConversations(list);
    return list;
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    setSuggestions([]);
    setDashboard(null);
    const res = await fetch(`/api/companion?conversation=${id}`);
    const data = await res.json();
    setMessages(data.messages || []);
  }, []);

  // On sign-in, load chats and open the most recent one (or a fresh chat).
  useEffect(() => {
    if (!user) return;
    (async () => {
      const list = await refreshConversations();
      if (list.length > 0) {
        setActiveId(list[0].id);
        await loadMessages(list[0].id);
      } else {
        setActiveId(null);
        setMessages([]);
      }
    })();
  }, [user, refreshConversations, loadMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, suggestions, dashboard, sending]);

  function newChat() {
    setActiveId(null);
    setMessages([]);
    setDashboard(null);
    setSuggestions([]);
    setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function selectConversation(id: string) {
    if (id === activeId) { setSidebarOpen(false); return; }
    setActiveId(id);
    setSidebarOpen(false);
    await loadMessages(id);
  }

  async function deleteConversation(id: string) {
    await fetch(`/api/companion/conversations/${id}`, { method: 'DELETE' });
    const list = await refreshConversations();
    if (id === activeId) {
      if (list.length > 0) { setActiveId(list[0].id); await loadMessages(list[0].id); }
      else newChat();
    }
  }

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
        body: JSON.stringify({ message: text, conversation_id: activeId }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.reply || "I'm here." }]);
      setSuggestions(data.suggested_tasks || []);
      // Keep the living plan visible; only replace it when a new one comes back.
      setDashboard((prev) => data.dashboard ?? prev);
      if (data.conversation_id && data.conversation_id !== activeId) setActiveId(data.conversation_id);
      refreshConversations();
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

  async function addSchedule(blocks: ScheduleBlock[]) {
    await Promise.all(blocks.map((b) => fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: b.title, starts_at: b.starts_at, ends_at: b.ends_at, priority: b.priority }),
    })));
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
    <section className="zen-ribbon-bg min-h-[calc(100dvh-4rem)] -mt-16 pt-16 flex">
      {/* Histories — desktop rail */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-obsidian/10 min-h-0">
        <CompanionSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          onNew={newChat}
          onDelete={deleteConversation}
        />
      </aside>

      {/* Histories — mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-obsidian/30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'tween', duration: 0.2 }}
              className="fixed top-16 bottom-0 left-0 z-50 w-72 border-r border-obsidian/10 shadow-xl md:hidden"
            >
              <CompanionSidebar
                conversations={conversations}
                activeId={activeId}
                onSelect={selectConversation}
                onNew={newChat}
                onDelete={deleteConversation}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="shrink-0 flex items-center gap-3 px-4 sm:px-6 pt-5 pb-3 border-b border-obsidian/10">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open chats"
            className="md:hidden p-1.5 -ml-1 text-obsidian/50 hover:text-obsidian transition-colors"
          >
            <PanelLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-light italic text-obsidian tracking-tight truncate">
              {activeId ? (conversations.find((c) => c.id === activeId)?.title || 'Companion') : 'New chat'}
            </h1>
            <p className="hidden sm:block text-obsidian/45 text-xs mt-0.5">A running conversation — I remember the whole thread and keep refining your plan.</p>
          </div>
          <button
            type="button"
            onClick={newChat}
            className="ml-auto md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 border border-obsidian/15 hover:border-gold text-obsidian/70 text-[11px] font-semibold transition-colors"
          >
            <Plus size={13} /> New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl w-full mx-auto px-5 sm:px-8 py-5 space-y-4">
            {messages.length === 0 && !sending && (
              <p className="text-obsidian/40 text-sm italic font-display text-lg pt-10 text-center">
                Dump your plans, tasks and worries here — &ldquo;Here&rsquo;s everything on my plate this week…&rdquo; — and I&rsquo;ll sort what to focus on, what can wait, and what to drop, asking questions as we go.
              </p>
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

            {dashboard && <CompanionDashboard dashboard={dashboard} onAddSchedule={addSchedule} />}

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
        </div>

        <form onSubmit={send} className="shrink-0 border-t border-obsidian/10 bg-white/60">
          <div className="max-w-3xl w-full mx-auto px-5 sm:px-8 py-4 flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Talk to me…"
              className="flex-1 px-4 py-3 border border-obsidian/15 bg-white text-sm focus:border-gold outline-none"
            />
            <button type="submit" disabled={sending} className="px-5 py-3 bg-gold hover:bg-gold-light disabled:opacity-50 text-obsidian transition-colors">
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
