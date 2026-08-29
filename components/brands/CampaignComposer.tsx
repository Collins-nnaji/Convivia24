'use client';

import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';

type TaskDraft = { id: string; title: string; detail: string; points: number };

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const inputClass =
  'w-full border border-obsidian/12 focus:border-ember focus:ring-0 text-sm py-2.5 px-3 bg-white placeholder-obsidian/25';

/**
 * Campaign authoring for a brand that manages its page.
 *
 * A campaign saves as a draft unless "publish" is ticked — nothing appears on
 * the public site until the brand says so.
 */
export default function CampaignComposer({
  brandName,
  onClose,
  onSaved,
}: {
  brandName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [tagline, setTagline] = useState('');
  const [blurb, setBlurb] = useState('');
  const [rewardPoints, setRewardPoints] = useState(1000);
  const [topReward, setTopReward] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [published, setPublished] = useState(false);
  const [tasks, setTasks] = useState<TaskDraft[]>([
    { id: 'task-1', title: '', detail: '', points: 100 },
  ]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function setTask(index: number, patch: Partial<TaskDraft>) {
    setTasks((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/brands/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug || slugify(title),
          title,
          tagline,
          blurb,
          rewardPoints,
          topReward,
          endsAt: endsAt ? new Date(endsAt).toISOString() : null,
          published,
          tasks: tasks.filter((t) => t.title.trim()),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not save the campaign.');
        return;
      }
      onSaved();
    } catch {
      setError('Could not save the campaign.');
    } finally {
      setSending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-obsidian/55 backdrop-blur-[2px]" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="New campaign"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="relative w-full sm:max-w-2xl bg-white shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-obsidian/8 px-6 py-4 flex items-center justify-between gap-4 z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ember">{brandName}</p>
            <h2 className="text-lg font-bold mt-0.5">New campaign</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-obsidian/35 hover:text-obsidian">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          <label className="block">
            <span className="text-[11px] font-semibold text-obsidian/60 block mb-1.5">Title</span>
            <input
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className={inputClass}
              placeholder="VSOP Masterclass Challenge"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold text-obsidian/60 block mb-1.5">
              URL slug <span className="text-obsidian/30 font-normal">(lowercase, dashes)</span>
            </span>
            <input
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              className={`${inputClass} font-mono`}
              placeholder="vsop-masterclass"
            />
            <span className="block text-[11px] text-obsidian/35 mt-1.5">
              Lives at /campaigns/{slug || 'your-slug'}
            </span>
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold text-obsidian/60 block mb-1.5">Tagline</span>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className={inputClass}
              placeholder="Share your knowledge. Showcase your taste."
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold text-obsidian/60 block mb-1.5">Description</span>
            <textarea
              rows={3}
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              className={inputClass}
              placeholder="What the campaign asks people to do, and why."
            />
          </label>

          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-[11px] font-semibold text-obsidian/60 block mb-1.5">Points on offer</span>
              <input
                type="number"
                min={0}
                value={rewardPoints}
                onChange={(e) => setRewardPoints(Number(e.target.value) || 0)}
                className={inputClass}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[11px] font-semibold text-obsidian/60 block mb-1.5">Top reward</span>
              <input
                value={topReward}
                onChange={(e) => setTopReward(e.target.value)}
                className={inputClass}
                placeholder="VSOP gift set"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-[11px] font-semibold text-obsidian/60 block mb-1.5">
              Ends <span className="text-obsidian/30 font-normal">(optional)</span>
            </span>
            <input
              type="date"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className={inputClass}
            />
          </label>

          <div>
            <div className="flex items-center justify-between gap-4 mb-2.5">
              <span className="text-[11px] font-semibold text-obsidian/60">Tasks</span>
              <button
                type="button"
                onClick={() =>
                  setTasks((prev) => [
                    ...prev,
                    { id: `task-${prev.length + 1}`, title: '', detail: '', points: 100 },
                  ])
                }
                className="text-[11px] font-black uppercase tracking-[0.1em] text-ember inline-flex items-center gap-1"
              >
                <Plus size={12} /> Add task
              </button>
            </div>

            <ul className="space-y-3">
              {tasks.map((task, i) => (
                <li key={task.id} className="border border-obsidian/10 p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-ember/8 text-ember text-[11px] font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <input
                      value={task.title}
                      onChange={(e) => setTask(i, { title: e.target.value })}
                      className={inputClass}
                      placeholder="Task title"
                    />
                    <input
                      type="number"
                      min={0}
                      value={task.points}
                      onChange={(e) => setTask(i, { points: Number(e.target.value) || 0 })}
                      className={`${inputClass} w-24 shrink-0`}
                      aria-label="Task points"
                    />
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setTasks((prev) => prev.filter((_, j) => j !== i))}
                        aria-label="Remove task"
                        className="text-obsidian/25 hover:text-ember shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <input
                    value={task.detail}
                    onChange={(e) => setTask(i, { detail: e.target.value })}
                    className={`${inputClass} mt-2.5`}
                    placeholder="What the participant actually does"
                  />
                </li>
              ))}
            </ul>
          </div>

          <label className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="mt-0.5 text-ember focus:ring-ember/30 border-obsidian/20"
            />
            <span className="text-sm text-obsidian/65 leading-relaxed">
              Publish now.{' '}
              <span className="text-obsidian/40">
                Leave this off to save a draft — drafts are not visible on the site.
              </span>
            </span>
          </label>

          {error && <p className="text-sm text-ember">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={sending}
              className="flex-1 py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-50"
            >
              {sending ? 'Saving…' : published ? 'Publish campaign' : 'Save draft'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 border border-obsidian/15 text-[11px] font-black uppercase tracking-[0.12em]"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
