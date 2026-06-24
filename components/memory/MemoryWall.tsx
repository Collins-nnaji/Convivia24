'use client';

import { useCallback, useRef, useState } from 'react';
import { Camera, Sparkles, Upload } from 'lucide-react';

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
  eventSlug: string;
  onUpload: (data: { media_url: string; blob_name?: string; media_type?: string; caption?: string }) => Promise<void>;
  onReact: (postId: string, emoji: string) => Promise<void>;
}

export default function MemoryWall({ posts, unlocked, canPost, eventSlug, onUpload, onReact }: Props) {
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('purpose', 'memory-wall');
      const res = await fetch(`/api/events/${eventSlug}/media`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');

      await onUpload({
        media_url: data.url,
        blob_name: data.blob_name,
        media_type: data.media_type,
        caption: caption.trim() || undefined,
      });
      setCaption('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }, [caption, eventSlug, onUpload]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
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
        <div className="glass-card p-6 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-50 flex items-center gap-2">
            <Camera size={14} /> Add to the roll
          </p>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-sm p-10 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-[var(--event-accent,#c9a84c)] bg-white/10' : 'border-current/20 hover:border-current/40'
            }`}
          >
            <Upload className="mx-auto mb-3 opacity-40" size={28} />
            <p className="text-sm font-semibold">Drag & drop from your camera roll</p>
            <p className="text-xs opacity-50 mt-1">Photos or short videos · up to 10MB images / 50MB video</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/quicktime,video/webm"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ''; }}
            />
          </div>

          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="w-full bg-transparent border-b border-current/20 py-2 text-sm outline-none placeholder:opacity-40"
          />

          {error && <p className="text-red-500 text-xs">{error}</p>}
          {uploading && (
            <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">Uploading to Azure…</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {posts.map((p) => (
          <div key={p.id} className="glass-card overflow-hidden group">
            <div className="aspect-square relative bg-black/20">
              {p.media_type === 'video' ? (
                <video src={p.media_url} className="w-full h-full object-cover" controls playsInline />
              ) : (
                <img src={p.media_url} alt="" className="w-full h-full object-cover" />
              )}
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
