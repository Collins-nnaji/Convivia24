'use client';

import { useState } from 'react';

/** Submit/decline pair. The form posts natively, so this only adds a pending state once hydrated. */
export default function AgeConfirmButtons() {
  const [pending, setPending] = useState(false);
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        type="submit"
        onClick={(e) => {
          // Let the native submit run first, then mark pending so a double tap can't resubmit.
          if (pending) { e.preventDefault(); return; }
          setTimeout(() => setPending(true), 0);
        }}
        aria-busy={pending}
        className="flex-1 rounded-full bg-obsidian px-5 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-ember disabled:opacity-60"
      >
        {pending ? 'Entering…' : 'Yes — enter'}
      </button>
      <a
        href="https://www.google.com"
        className="flex-1 rounded-full border border-obsidian/20 px-5 py-3.5 text-center text-xs font-bold uppercase tracking-[0.12em] text-obsidian/70 transition hover:border-obsidian hover:text-obsidian"
      >
        No
      </a>
    </div>
  );
}
