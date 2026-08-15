'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, UsersRound } from 'lucide-react';
import {
  addLineToCrew,
  createCrew,
  listCrews,
  type PartyCrew,
  formatNgn,
  crewSubtotal,
} from '@/lib/crews/store';
import { getDrinkBySlug } from '@/lib/drinks/catalog';

function CrewsHome() {
  const router = useRouter();
  const params = useSearchParams();
  const fromCircle = params.get('from') || '';
  const venuePrefill = params.get('venue') || '';
  const addSlug = params.get('add') || '';

  const [crews, setCrews] = useState<PartyCrew[]>([]);
  const [name, setName] = useState(fromCircle ? `${fromCircle} tonight` : '');
  const [venue, setVenue] = useState(venuePrefill);
  const [targetTime, setTargetTime] = useState('Tonight 9pm');
  const [hostName, setHostName] = useState('');

  useEffect(() => {
    setCrews(listCrews());
  }, []);

  function onCreate(e: FormEvent) {
    e.preventDefault();
    const crew = createCrew({ name, venue, targetTime, hostName });
    if (addSlug) {
      const product = getDrinkBySlug(addSlug);
      if (product) {
        addLineToCrew(crew.id, {
          slug: product.slug,
          name: product.name,
          priceNgn: product.priceNgn,
          addedBy: hostName || 'Host',
          qty: 1,
        });
      }
    }
    router.push(`/crews/${crew.id}`);
  }

  const inputClass =
    'w-full bg-transparent border-0 border-b border-obsidian/20 focus:border-ember focus:ring-0 text-sm py-2.5 px-0';

  return (
    <div>
      <div className="relative h-44 sm:h-52 overflow-hidden">
        <img src="/Convivium3.png" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-obsidian/50 to-obsidian/40" />
        <div className="absolute bottom-0 inset-x-0 max-w-6xl mx-auto px-5 sm:px-8 pb-6">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-2">Party Crews</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Shared drops for tonight</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p className="text-sm text-obsidian/50 max-w-lg leading-relaxed mb-10">
          Create a crew, invite friends to add bottles, see the equal-split hint, then lock and checkout once.
        </p>

        <div className="grid lg:grid-cols-2 gap-10">
          <form
            onSubmit={onCreate}
            className="bg-white border border-obsidian/8 p-6 sm:p-8 space-y-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <UsersRound size={18} className="text-ember" />
              <h2 className="font-bold text-obsidian">Start a Crew</h2>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                Crew name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Birthday booth · Beach pack"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                Venue / place
              </label>
              <input
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className={inputClass}
                placeholder="Lounge name or party address"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                  Target time
                </label>
                <input
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className={inputClass}
                  placeholder="Tonight 9pm"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                  Your name (host)
                </label>
                <input
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className={inputClass}
                  placeholder="Ada"
                />
              </div>
            </div>
            {addSlug && (
              <p className="text-xs text-ember">
                Will add <strong>{getDrinkBySlug(addSlug)?.name || addSlug}</strong> when you create.
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
            >
              Create Crew
            </button>
          </form>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-obsidian/40 mb-4">Your crews</h2>
            {crews.length === 0 ? (
              <div className="bg-white border border-dashed border-obsidian/15 p-8 text-center">
                <p className="text-sm text-obsidian/45 mb-3">No crews yet — create one for tonight.</p>
                <Link href="/circles" className="text-[11px] font-black uppercase tracking-[0.14em] text-ember">
                  Find a Circle first →
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {crews.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/crews/${c.id}`}
                      className="flex items-center justify-between gap-4 bg-white border border-obsidian/8 p-4 hover:border-ember/40 transition-colors shadow-sm"
                    >
                      <div>
                        <p className="font-semibold text-obsidian">{c.name}</p>
                        <p className="text-xs text-obsidian/45 mt-0.5">
                          {c.venue} · {c.targetTime}
                          {c.locked ? ' · Locked' : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{formatNgn(crewSubtotal(c))}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] text-ember font-black uppercase tracking-wider mt-1">
                          Open <ArrowRight size={12} />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CrewsPage() {
  return (
    <section className="bg-paper min-h-[70vh]">
      <Suspense fallback={<div className="px-5 py-20 text-sm text-obsidian/40">Loading…</div>}>
        <CrewsHome />
      </Suspense>
    </section>
  );
}
