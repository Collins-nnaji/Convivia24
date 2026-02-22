'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

type Message = {
  id: string;
  sender_role: 'client' | 'admin';
  body: string;
  created_at: string;
  sender_name?: string;
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch('/api/messages');
    if (res.ok) setMessages(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      setBody('');
      await load();
    }
    setSending(false);
  }

  return (
    <div className="p-8 max-w-3xl flex flex-col h-full">
      <div className="mb-6">
        <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3">
          Messages
        </span>
        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">
          Your Team
        </h1>
        <p className="text-zinc-600 text-sm mt-1">Direct line to Convivia24</p>
      </div>

      {/* Thread */}
      <div className="flex-1 bg-white border border-zinc-200 rounded-lg mb-4 overflow-auto max-h-[55vh] p-4 space-y-3 shadow-sm">
        {loading && <p className="text-zinc-500 text-sm text-center py-8">Loading…</p>}
        {!loading && messages.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-8">No messages yet. Say hello.</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_role === 'client' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2.5 text-sm rounded-lg ${
              msg.sender_role === 'client'
                ? 'bg-red-600 text-white'
                : 'bg-zinc-100 text-zinc-800'
            }`}>
              {msg.sender_role === 'admin' && (
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500 mb-1">
                  Convivia24
                </p>
              )}
              <p className="leading-relaxed">{msg.body}</p>
              <p className="text-[10px] opacity-70 mt-1 text-right">
                {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 bg-white border border-zinc-300 text-zinc-900 text-sm px-4 py-3 rounded-lg placeholder-zinc-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-black uppercase tracking-[0.1em]"
        >
          <Send size={14} />
          Send
        </button>
      </form>
    </div>
  );
}
