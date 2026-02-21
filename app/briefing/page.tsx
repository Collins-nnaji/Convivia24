'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string };

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: "Hi — I'm your AI Revenue Advisor. Ask me about pipeline health, sales audits, or how we can help. What's on your mind?",
};

export default function BriefingPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [inquiryId, setInquiryId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streamingContent]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setStreamingContent('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          inquiryId: inquiryId ?? undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed: ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamedText = '';
      const DATA_MARKER = '\x00DATA:';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const idx = buffer.indexOf(DATA_MARKER);
          if (idx !== -1) {
            streamedText += buffer.slice(0, idx);
            const jsonStr = buffer.slice(idx + DATA_MARKER.length).trim();
            try {
              const data = JSON.parse(jsonStr);
              if (data.inquiryId) setInquiryId(data.inquiryId);
            } catch {
              // ignore
            }
            buffer = '';
            break;
          }
          streamedText += buffer;
          buffer = '';
          setStreamingContent(streamedText);
        }
        if (buffer) {
          const idx = buffer.indexOf(DATA_MARKER);
          if (idx !== -1) {
            streamedText += buffer.slice(0, idx);
            try {
              const data = JSON.parse(buffer.slice(idx + DATA_MARKER.length).trim());
              if (data.inquiryId) setInquiryId(data.inquiryId);
            } catch {
              // ignore
            }
          } else {
            streamedText += buffer;
          }
          setStreamingContent(streamedText);
        }
      }

      const finalText = streamedText.trim();
      if (finalText) setMessages((prev) => [...prev, { role: 'assistant', content: finalText }]);
      setStreamingContent('');
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, something went wrong. ${err instanceof Error ? err.message : 'Please try again.'}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const displayMessages = streamingContent
    ? [...messages, { role: 'assistant' as const, content: streamingContent }]
    : messages;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <section className="pt-28 pb-6 px-4 md:px-6 border-b border-zinc-100">
        <div className="max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-semibold uppercase tracking-widest text-red-700 mb-2"
          >
            Live chat
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900"
          >
            AI Revenue Advisor
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-zinc-500 mt-1"
          >
            Chat with our AI agent. Your conversation is saved so we can follow up.
          </motion.p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 md:px-6 py-6">
        <div
          ref={listRef}
          className="min-h-[320px] max-h-[55vh] overflow-y-auto space-y-4 pb-4"
        >
          <AnimatePresence initial={false}>
            {displayMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-zinc-800 text-white' : 'bg-red-700 text-white'
                  }`}
                >
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-900 border border-zinc-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  {msg.role === 'assistant' && i === displayMessages.length - 1 && loading && (
                    <span className="inline-block w-2 h-4 ml-0.5 bg-red-600 animate-pulse" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-3 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            Send
          </button>
        </form>

        {inquiryId && (
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-3">
            Conversation saved. We’ll follow up if you shared your details.
          </p>
        )}
      </section>
    </div>
  );
}
