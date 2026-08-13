'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import Sheet from '@/components/ui/Sheet';
import { formatNaira } from '@/lib/dining/venues';
import { saveProfile, useProfile } from '@/lib/meetup/store';

const BUDGETS = [10000, 20000, 35000, 50000];

/**
 * Asked once, the first time someone opens the meetup side of the app: what to
 * call you, and what you usually spend. Both get pre-filled into every meetup
 * you create afterwards, so the budget — the thing that makes the split useful
 * — is set by default instead of skipped.
 */
export default function OnboardingSheet() {
  const pathname = usePathname();
  const profile = useProfile();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [budget, setBudget] = useState<number | undefined>();

  // Never on the join screen: someone arriving from an invite link is already
  // being asked who they are, by a page that has their name in front of them.
  const inApp = pathname.startsWith('/meetups') && pathname !== '/meetups/join';

  useEffect(() => {
    if (inApp && !profile.onboarded) {
      const t = setTimeout(() => setOpen(true), 450);
      return () => clearTimeout(t);
    }
  }, [inApp, profile.onboarded]);

  function finish(e?: FormEvent) {
    e?.preventDefault();
    saveProfile({ name: name.trim() || 'You', defaultBudget: budget, onboarded: true });
    setOpen(false);
  }

  return (
    <Sheet
      open={open}
      onClose={() => {
        saveProfile({ onboarded: true });
        setOpen(false);
      }}
      title="Before you sit down"
      subtitle="Two answers, and every meetup you make is pre-filled."
      footer={
        <button
          type="button"
          onClick={() => finish()}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gold active:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-transform"
        >
          That&apos;s me <ArrowRight size={14} />
        </button>
      }
    >
      <form onSubmit={finish} className="space-y-8">
        <div>
          <label htmlFor="onboard-name" className="block text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-2">
            What should we call you?
          </label>
          <input
            id="onboard-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="given-name"
            className="w-full bg-cream border border-obsidian/15 focus:border-gold text-obsidian placeholder:text-obsidian/25 text-base px-4 py-3.5 outline-none focus:ring-0 transition-colors"
          />
        </div>

        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-2">
            What do you usually spend on a night out?
          </p>
          <p className="text-obsidian/40 text-xs mb-3">
            Optional. It becomes your default budget, and we flag you when an order goes past it.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {BUDGETS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBudget(budget === b ? undefined : b)}
                aria-pressed={budget === b}
                className={`px-4 py-3.5 border text-sm font-medium tabular-nums active:scale-[0.97] transition-all ${
                  budget === b
                    ? 'bg-obsidian border-obsidian text-cream'
                    : 'bg-cream border-obsidian/15 text-obsidian/60'
                }`}
              >
                {formatNaira(b)}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Sheet>
  );
}
