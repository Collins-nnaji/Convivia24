'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EventThemeShell from '@/components/event/EventThemeShell';
import MemoryWall from '@/components/memory/MemoryWall';
import { useUser } from '@/components/auth/AuthProvider';

interface Post {
  id: string;
  author_name: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  reactions: Record<string, number>;
}

export default function MemoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [eventMeta, setEventMeta] = useState<Record<string, string> | null>(null);
  const [title, setTitle] = useState('');

  function load() {
    fetch(`/api/events/${slug}/memory`)
      .then((r) => r.json())
      .then((d) => {
        setPosts(d.posts ?? []);
        setUnlocked(d.unlocked);
        setTitle(d.event?.title ?? '');
      });
    fetch(`/api/events/${slug}`).then((r) => r.json()).then((d) => setEventMeta(d.event));
  }

  useEffect(() => { load(); }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onUpload(url: string, caption?: string) {
    await fetch(`/api/events/${slug}/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_url: url, caption }),
    });
    load();
  }

  async function onReact(postId: string, emoji: string) {
    await fetch(`/api/events/${slug}/memory`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, emoji }),
    });
    load();
  }

  return (
    <EventThemeShell event={eventMeta ?? {}}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 -mt-8">
        <Link href={`/events/${slug}`} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 hover:opacity-100 mb-6">
          <ArrowLeft size={12} /> {title || 'Event'}
        </Link>

        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--event-accent,#c9a84c)] mb-2">Shared memory wall</p>
          <h1 className="font-display text-4xl sm:text-5xl italic leading-tight">The night, preserved.</h1>
          <p className="opacity-55 mt-3 max-w-xl text-sm">A collaborative visual roll — drop your captures, react with emojis, keep the community alive after curtains drop.</p>
        </div>

        <MemoryWall
          posts={posts}
          unlocked={unlocked}
          canPost={!!user}
          onUpload={onUpload}
          onReact={onReact}
        />
      </div>
    </EventThemeShell>
  );
}
