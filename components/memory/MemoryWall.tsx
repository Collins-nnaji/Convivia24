'use client';

import { useState } from 'react';
import { Camera, Sparkles } from 'lucide-react';

interface Post {
  id: string;
  author_name: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  reactions: Record<string, number>;
}

const REACTIONS = ['🔥', '✨', '🥂', '💫', '❤️'];

interface Props {
  posts: Post[];
  unlocked: boolean;
  canPost: boolean;
  onUpload: (url: string, caption?: string) => Promise<void>;
  onReact: (postId: string, emoji: string) => Promise<void>;
}

export default function MemoryWall({ posts, unlocked, canPost, onUpload, onReact }: Props) {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setUploading(true);
    try {
      await onUpload(url.trim(), caption.trim() || undefined);
      setUrl('');
      setCaption('');
    } finally {
      setUploading(false);
    }
  }

  if (!unlocked) {
    return (
      <div className="glass-card p-12 text-center">
        <Sparkles className="mx-auto mb-4 opacity-40" size={32} />
        <p className="font-display text-2xl italic mb-2">Memory wall unlocks after the event</p>
        <p className="text-sm opacity-55">Come back the morning after — the visual roll opens for all attendees.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {canPost && (
        <form onSubmit={handleUpload} className="glass-card p-6 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-50 flex items-center gap-2">
            <Camera size={14} /> Add to the roll
          </p>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste an image URL from your camera roll"
            className="w-full bg-transparent border-b border-current/20 py-2 text-sm outline-none placeholder:opacity-40"
          />
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="w-full bg-transparent border-b border-current/20 py-2 text-sm outline-none placeholder:opacity-40"
          />
          <button
            type="submit"
            disabled={uploading || !url.trim()}
            className="text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2.5 bg-[var(--event-accent,#c9a84c)] text-obsidian disabled:opacity-50"
          >
            {uploading ? 'Adding…' : 'Drop on the wall'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {posts.map((p) => (
          <div key={p.id} className="glass-card overflow-hidden group">
            <div className="aspect-square relative">
              <img src={p.media_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold truncate">{p.author_name}</p>
              {p.caption && <p className="text-xs opacity-55 mt-1 line-clamp-2">{p.caption}</p>}
              <div className="flex flex-wrap gap-1 mt-2">
                {REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => onReact(p.id, emoji)}
                    className="text-xs px-1.5 py-0.5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    {emoji} {(p.reactions?.[emoji] ?? 0) > 0 ? p.reactions[emoji] : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!posts.length && (
        <p className="text-center opacity-50 py-8 text-sm">No memories yet — be the first to drop a photo.</p>
      )}
    </div>
  );
}
