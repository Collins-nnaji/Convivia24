'use client';

import { useState } from 'react';
import { intentEmoji, intentLabel } from '@/lib/themes';
import { Heart, UserPlus } from 'lucide-react';

interface Guest {
  id: string;
  user_id: string;
  display_name: string;
  headline: string | null;
  avatar_url: string | null;
  intent_badge: string | null;
}

interface Props {
  guests: Guest[];
  currentUserId: string;
  onConnect: (userId: string) => Promise<void>;
}

export default function GuestGrid({ guests, currentUserId, onConnect }: Props) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<Set<string>>(new Set());

  async function handleConnect(userId: string) {
    setConnecting(userId);
    try {
      await onConnect(userId);
      setConnected((s) => new Set(s).add(userId));
    } finally {
      setConnecting(null);
    }
  }

  if (!guests.length) {
    return <p className="text-center opacity-50 py-12 text-sm">Be the first in the lounge — set your profile above.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {guests.filter((g) => g.user_id !== currentUserId).map((g) => (
        <div key={g.id} className="glass-card p-4 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-obsidian/10 flex items-center justify-center text-2xl font-display italic">
            {g.avatar_url ? (
              <img src={g.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              g.display_name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-display text-lg italic leading-tight">{g.display_name}</p>
            {g.headline && <p className="text-xs opacity-55 mt-0.5">{g.headline}</p>}
            {g.intent_badge && (
              <p className="text-[10px] mt-2 uppercase tracking-wider opacity-70">
                {intentEmoji(g.intent_badge)} {intentLabel(g.intent_badge)}
              </p>
            )}
          </div>
          {connected.has(g.user_id) ? (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--event-accent,#c9a84c)]">
              <Heart size={12} /> Resonated
            </span>
          ) : (
            <button
              type="button"
              disabled={connecting === g.user_id}
              onClick={() => handleConnect(g.user_id)}
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] px-3 py-2 bg-[var(--event-accent,#c9a84c)] text-obsidian hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <UserPlus size={12} /> {connecting === g.user_id ? '…' : 'Resonate'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
