'use client';

import { useRef, useState } from 'react';
import { ScanFace, Check, Loader2, Camera } from 'lucide-react';

/** Optional Face Check-in enrollment: capture a selfie tied to an order. */
export default function FaceEnroll({ reference, enrolled }: { reference: string; enrolled: boolean }) {
  const [done, setDone] = useState(enrolled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true); setError('');
    try {
      const fd = new FormData();
      fd.append('reference', reference);
      fd.append('file', file);
      const res = await fetch('/api/face/enroll', { method: 'POST', body: fd });
      const d = await res.json();
      if (!res.ok) { setError(d.error || 'Could not enroll. Try a clearer photo.'); return; }
      setDone(true);
    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
        <Check size={18} className="text-emerald-600 shrink-0" />
        <p className="text-emerald-800 text-sm">Face Check-in enabled — breeze through the door, no QR needed.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-obsidian/12 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <ScanFace size={20} className="text-gold-dark shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-display text-lg italic text-obsidian leading-tight">Skip the queue with Face Check-in</p>
          <p className="text-obsidian/55 text-sm mt-1 mb-3">Add a quick selfie and the door team can verify you by face — optional and private to this event.</p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2.5 transition-colors disabled:opacity-60"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />} {busy ? 'Checking photo…' : 'Add a selfie'}
          </button>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
          />
        </div>
      </div>
    </div>
  );
}
