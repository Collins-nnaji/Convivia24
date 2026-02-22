'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

type Msg = { id: string; sender_role: string; body: string; created_at: string; sender_name?: string };

export default function AdminClientMessages({ clientId, initialMessages }: { clientId: string; initialMessages: Msg[] }) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, clientId }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setBody('');
    }
    setSending(false);
  }

  return (
    <div className="flex flex-col">
      <div className="overflow-auto max-h-56 p-4 space-y-2">
        {messages.length === 0 && <p className="text-zinc-500 text-sm text-center py-4">No messages</p>}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 text-sm rounded ${msg.sender_role === 'admin' ? 'bg-red-600 text-white' : 'bg-zinc-100 text-zinc-900'}`}>
              {msg.sender_role === 'client' && (
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500 mb-0.5">{msg.sender_name || 'Client'}</p>
              )}
              {msg.body}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 p-4 border-t border-zinc-200">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Reply to client…"
          className="flex-1 bg-white border border-zinc-300 text-zinc-900 text-sm px-3 py-2 rounded placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
        />
        <button type="submit" disabled={sending || !body.trim()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50">
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
