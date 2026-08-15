'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Users } from 'lucide-react';
import { CIRCLE_POSTS, CIRCLES, VIBE_LABELS, type CircleVibe } from '@/lib/circles/seeds';

const JOINED_KEY = 'convivia_joined_circles';
const LIKED_KEY = 'convivia_liked_posts';

function loadSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

export default function CirclesFeed() {
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [vibeFilter, setVibeFilter] = useState<CircleVibe | 'all'>('all');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setJoined(loadSet(JOINED_KEY));
    setLiked(loadSet(LIKED_KEY));
    setHydrated(true);
  }, []);

  function toggleJoin(id: string) {
    setJoined((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSet(JOINED_KEY, next);
      return next;
    });
  }

  function toggleLike(id: string) {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSet(LIKED_KEY, next);
      return next;
    });
  }

  const posts =
    vibeFilter === 'all'
      ? CIRCLE_POSTS
      : CIRCLE_POSTS.filter((p) => p.vibe.includes(vibeFilter));

  const vibes = Object.keys(VIBE_LABELS) as CircleVibe[];

  return (
    <div>
      <div className="relative h-44 sm:h-52 overflow-hidden">
        <img src="/The Spaces.png" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-obsidian/50 to-obsidian/40" />
        <div className="absolute bottom-0 inset-x-0 max-w-6xl mx-auto px-5 sm:px-8 pb-6">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-2">Community</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Circles</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p className="text-sm text-obsidian/50 max-w-lg leading-relaxed mb-10">
          Hangouts for like-minded outdoor people — beach, rooftop, trail, then the afterparty. Join a Circle,
          then spin a Party Crew for the drinks.
        </p>

        <div className="mb-12">
          <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-obsidian/40 mb-4">Join a Circle</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {CIRCLES.map((c) => {
              const isJoined = hydrated && joined.has(c.id);
              return (
                <div
                  key={c.id}
                  className="flex items-start justify-between gap-4 bg-white border border-obsidian/8 p-4 shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-obsidian flex items-center gap-1.5">
                      <Users size={14} className="text-ember" />
                      {c.name}
                    </p>
                    <p className="text-xs text-obsidian/45 mt-1">{c.blurb}</p>
                    <p className="text-[10px] text-obsidian/30 mt-1.5">{c.members} members</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleJoin(c.id)}
                    className={`shrink-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] transition-colors ${
                      isJoined
                        ? 'bg-obsidian text-white'
                        : 'border border-ember text-ember hover:bg-ember hover:text-white'
                    }`}
                  >
                    {isJoined ? 'Joined' : 'Join'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8">
          <button
            type="button"
            onClick={() => setVibeFilter('all')}
            className={`shrink-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] ${
              vibeFilter === 'all' ? 'bg-obsidian text-white' : 'bg-white border border-obsidian/10 text-obsidian/45'
            }`}
          >
            All vibes
          </button>
          {vibes.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVibeFilter(v)}
              className={`shrink-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] ${
                vibeFilter === v ? 'bg-obsidian text-white' : 'bg-white border border-obsidian/10 text-obsidian/45'
              }`}
            >
              {VIBE_LABELS[v]}
            </button>
          ))}
        </div>

        <div className="space-y-6 max-w-2xl">
          {posts.map((post) => {
            const isLiked = hydrated && liked.has(post.id);
            const likeCount = post.likes + (isLiked ? 1 : 0);
            return (
              <article key={post.id} className="bg-white border border-obsidian/8 overflow-hidden shadow-sm">
                <div className="relative aspect-[16/9] sm:aspect-[2/1]">
                  <img src={post.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-white font-semibold text-sm">{post.circleName}</p>
                      <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {post.place} · {post.area}
                      </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/80 bg-black/40 px-2 py-1">
                      {post.meetupAt}
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.vibe.map((v) => (
                      <span
                        key={v}
                        className="text-[9px] font-black uppercase tracking-[0.12em] text-ember bg-ember/8 px-2 py-0.5"
                      >
                        {VIBE_LABELS[v]}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-obsidian/75 leading-relaxed mb-3">
                    <span className="font-semibold text-obsidian">{post.author}</span> — {post.body}
                  </p>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleLike(post.id)}
                      className={`inline-flex items-center gap-1.5 text-xs ${
                        isLiked ? 'text-ember' : 'text-obsidian/40 hover:text-ember'
                      }`}
                    >
                      <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
                      {likeCount}
                    </button>
                    <Link
                      href={`/crews?from=${encodeURIComponent(post.circleName)}&venue=${encodeURIComponent(post.place)}`}
                      className="text-[10px] font-black uppercase tracking-[0.12em] text-ember hover:text-ember-dark"
                    >
                      Start a Crew for this →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
