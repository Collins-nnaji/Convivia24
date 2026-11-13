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
        className="flex-1 px-5 py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.15em]"
      >
        {pending ? 'Entering…' : 'Yes — enter'}
      </button>
      <a
        href="https://www.google.com"
        className="flex-1 text-center px-5 py-3.5 border border-obsidian/15 text-obsidian/60 hover:text-obsidian text-[11px] font-black uppercase tracking-[0.15em]"
      >
        No
      </a>
    </div>
  );
}
