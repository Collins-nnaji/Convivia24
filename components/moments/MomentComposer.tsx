'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import Sheet from '@/components/ui/Sheet';
import { toast } from '@/components/ui/Toast';
import { compressImage, putPhoto } from '@/lib/moments/photos';
import { addMoment } from '@/lib/moments/store';
import { newId } from '@/lib/meetup/store';
import { VENUES } from '@/lib/dining/venues';

/**
 * Posting a moment. A photo is optional — plenty of the best ones are a line of
 * text — but it is the first thing offered, because that is what people reach
 * for when they have just put a fork down.
 */
export default function MomentComposer({
  open,
  onClose,
  meetupId,
  venueSlug,
  people = [],
}: {
  open: boolean;
  onClose: () => void;
  meetupId?: string;
  venueSlug?: string;
  /** Names to offer as "who was there". */
  people?: string[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [place, setPlace] = useState(venueSlug ?? '');
  const [preview, setPreview] = useState<string>();
  const [pending, setPending] = useState<{ blob: Blob; ratio: number }>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setPlace(venueSlug ?? '');
  }, [open, venueSlug]);

  // The preview is an object URL over the compressed blob; release it when it
  // is replaced or the sheet closes.
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function onPick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const { blob, width, height } = await compressImage(file);
      if (preview) URL.revokeObjectURL(preview);
      setPending({ blob, ratio: width / height });
      setPreview(URL.createObjectURL(blob));
    } catch {
      toast('That photo would not open', 'error');
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(undefined);
    setPending(undefined);
    setCaption('');
    setSelected([]);
  }

  async function post() {
    if (!caption.trim() && !pending) {
      toast('Add a photo or a line about it');
      return;
    }
    setBusy(true);
    try {
      let photoId: string | undefined;
      if (pending) {
        photoId = newId('ph');
        await putPhoto(photoId, pending.blob);
      }
      addMoment({
        meetupId,
        venueSlug: place || undefined,
        caption: caption.trim(),
        people: selected,
        photoId,
        photoRatio: pending?.ratio,
      });
      reset();
      onClose();
      toast('Moment saved');
    } catch {
      toast('Could not save that moment', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="What happened?"
      subtitle="A photo, a line, and who was there."
      footer={
        <button
          type="button"
          onClick={post}
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gold active:bg-gold-light disabled:opacity-50 text-obsidian text-[11px] font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-transform"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : null}
          {busy ? 'Saving' : 'Post the moment'}
        </button>
      }
    >
      {/* Photo */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          void onPick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {preview ? (
        <div className="relative mb-5">
          <img src={preview} alt="" className="w-full max-h-72 object-cover" />
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(preview);
              setPreview(undefined);
              setPending(undefined);
            }}
            aria-label="Remove photo"
            className="absolute top-2 right-2 p-2 bg-obsidian/80 text-cream active:scale-90 transition-transform"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="w-full mb-5 py-8 border border-dashed border-obsidian/25 flex flex-col items-center gap-2 text-obsidian/45 active:bg-obsidian/[0.03] active:scale-[0.99] transition-all"
        >
          {busy ? <Loader2 size={22} className="animate-spin" /> : <Camera size={22} />}
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            {busy ? 'Working' : 'Add a photo'}
          </span>
        </button>
      )}

      {/* Caption */}
      <label className="block mb-5">
        <span className="block text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-2">
          Say something about it
        </span>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          placeholder="The pepper soup dumplings did not survive ten minutes."
          className="w-full bg-cream border border-obsidian/15 focus:border-gold text-obsidian placeholder:text-obsidian/25 px-4 py-3 outline-none focus:ring-0 transition-colors resize-none"
        />
      </label>

      {/* Who was there */}
      {people.length > 0 && (
        <div className="mb-5">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-2.5">
            Who was there
          </p>
          <div className="flex flex-wrap gap-2">
            {people.map((name) => {
              const on = selected.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() =>
                    setSelected((prev) => (on ? prev.filter((n) => n !== name) : [...prev, name]))
                  }
                  aria-pressed={on}
                  className={`px-3 py-2 border text-xs active:scale-95 transition-all ${
                    on ? 'bg-obsidian border-obsidian text-cream' : 'border-obsidian/20 text-obsidian/55'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Place — only asked when the moment is not already tied to a meetup */}
      {!meetupId && (
        <label className="block">
          <span className="block text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-2">
            Where
          </span>
          <select
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            className="w-full bg-cream border border-obsidian/15 focus:border-gold text-obsidian px-4 py-3 outline-none focus:ring-0 transition-colors"
          >
            <option value="">Somewhere else</option>
            {VENUES.map((v) => (
              <option key={v.slug} value={v.slug}>
                {v.name} · {v.area}
              </option>
            ))}
          </select>
        </label>
      )}
    </Sheet>
  );
}
