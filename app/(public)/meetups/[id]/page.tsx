'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, ChevronLeft, MapPin, Share2, Trash2, Users } from 'lucide-react';
import MenuPicker from '@/components/meetup/MenuPicker';
import OrderList from '@/components/meetup/OrderList';
import SplitTable from '@/components/meetup/SplitTable';
import YourShare from '@/components/meetup/YourShare';
import PeopleSheet from '@/components/meetup/PeopleSheet';
import PersonChip from '@/components/meetup/PersonChip';
import MomentCard from '@/components/moments/MomentCard';
import MomentComposer from '@/components/moments/MomentComposer';
import { useMomentsFor, type Moment } from '@/lib/moments/store';
import { toast } from '@/components/ui/Toast';
import { getVenue, formatNaira, type MenuItem } from '@/lib/dining/venues';
import { computeBill } from '@/lib/split/compute';
import { shareMeetup } from '@/lib/meetup/share';
import {
  addAttendee,
  addLine,
  deleteMeetup,
  removeAttendee,
  removeLine,
  setLinePayers,
  setLineQty,
  setTip,
  setYou,
  updateAttendee,
  useContacts,
  useMeetup,
} from '@/lib/meetup/store';

const TIPS = [0, 5, 10, 15];
type Pane = 'menu' | 'order' | 'split' | 'moments';

export default function MeetupPage() {
  const router = useRouter();
  const id = String(useParams().id);
  const meetup = useMeetup(id);
  const contacts = useContacts();

  const [mounted, setMounted] = useState(false);
  const [pane, setPane] = useState<Pane>('menu');
  const [ordering, setOrdering] = useState<string[]>([]);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [composing, setComposing] = useState(false);
  const moments = useMomentsFor(id);

  useEffect(() => setMounted(true), []);

  // Keep the "ordering for" selection valid as the table changes.
  useEffect(() => {
    if (!meetup) return;
    setOrdering((prev) => {
      const valid = prev.filter((pid) => meetup.attendees.some((a) => a.id === pid));
      if (valid.length > 0) return valid;
      const first = meetup.youId ?? meetup.attendees[0]?.id;
      return first ? [first] : [];
    });
  }, [meetup]);

  const venue = meetup ? getVenue(meetup.venueSlug) : undefined;

  const bill = useMemo(
    () => (meetup && venue ? computeBill(venue, meetup.attendees, meetup.lines, { tipPct: meetup.tipPct }) : null),
    [meetup, venue],
  );

  const countFor = useCallback(
    (itemId: string) =>
      meetup ? meetup.lines.filter((l) => l.itemId === itemId).reduce((n, l) => n + l.qty, 0) : 0,
    [meetup],
  );

  const onAdd = useCallback(
    (item: MenuItem) => {
      if (!meetup || ordering.length === 0) return;
      addLine(meetup.id, item.id, ordering);
      toast(
        ordering.length === meetup.attendees.length
          ? `${item.name} — for the table`
          : `${item.name} — ${ordering.length === 1 ? meetup.attendees.find((a) => a.id === ordering[0])?.name : `${ordering.length} people`}`,
      );
    },
    [meetup, ordering],
  );

  if (!mounted) return <div className="bg-paper min-h-screen" />;

  if (!meetup || !venue) {
    return (
      <div className="bg-paper min-h-screen px-5 py-24 text-center">
        <p className="font-display text-4xl italic text-obsidian mb-3">This meetup isn&apos;t here.</p>
        <p className="text-obsidian/50 text-sm mb-8 max-w-sm mx-auto">
          Meetups live on the device that created them. If someone sent you this one, ask them for
          the share link instead.
        </p>
        <Link
          href="/meetups"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-obsidian text-cream text-[11px] font-black uppercase tracking-[0.2em]"
        >
          <ChevronLeft size={14} /> All meetups
        </Link>
      </div>
    );
  }

  const when = new Date(`${meetup.date}T${meetup.time || '00:00'}`);
  const dateLabel = Number.isNaN(when.getTime())
    ? meetup.date
    : when.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  const wholeTable = ordering.length === meetup.attendees.length && meetup.attendees.length > 0;
  const orderCount = meetup.lines.reduce((n, l) => n + l.qty, 0);

  async function onShare() {
    const result = await shareMeetup(meetup!);
    if (result === 'copied') toast('Link copied — paste it to the table');
    else if (result === 'failed') toast('Could not share the link', 'error');
  }

  function onDelete() {
    if (!window.confirm(`Delete "${meetup!.title}"? This cannot be undone.`)) return;
    deleteMeetup(meetup!.id);
    router.push('/meetups');
  }

  const PANES: Array<{ id: Pane; label: string; count?: number }> = [
    { id: 'menu', label: 'Menu' },
    { id: 'order', label: 'Order', count: orderCount },
    { id: 'split', label: 'Split' },
    { id: 'moments', label: 'Moments', count: moments.length },
  ];

  return (
    <div className="bg-paper min-h-screen">
      {/* ═══ APP BAR ═══ */}
      {/* Sticky on a phone, where it is the only navigation. On desktop the
          marketing header is already pinned, so this one scrolls away. */}
      <header className="sticky md:static top-0 z-40 bg-obsidian pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto px-2 md:px-8 h-14 flex items-center gap-1">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? router.back() : router.push('/meetups'))}
            aria-label="Back"
            className="p-2.5 text-cream/80 active:text-gold active:scale-90 transition-all"
          >
            <ChevronLeft size={24} strokeWidth={2.2} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl md:text-2xl italic text-cream leading-none truncate">
              {meetup.title}
            </h1>
            <p className="text-[10px] text-cream/40 truncate mt-0.5">
              {venue.name} &middot; {dateLabel}
              {meetup.time && ` · ${meetup.time}`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPeopleOpen(true)}
            aria-label="The table"
            className="relative p-2.5 text-cream/70 active:text-gold active:scale-90 transition-all"
          >
            <Users size={20} />
            <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 grid place-items-center rounded-full bg-gold text-obsidian text-[8px] font-black tabular-nums">
              {meetup.attendees.length}
            </span>
          </button>
          <button
            type="button"
            onClick={onShare}
            aria-label="Share this meetup"
            className="p-2.5 text-cream/70 active:text-gold active:scale-90 transition-all"
          >
            <Share2 size={19} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete this meetup"
            className="p-2.5 mr-1 text-cream/40 active:text-red-400 active:scale-90 transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {/* ═══ YOUR SHARE ═══ */}
      {bill && (
        <div className="sticky top-14 z-30 md:static">
          <YourShare bill={bill} youId={meetup.youId} onPickYou={() => setPeopleOpen(true)} />
        </div>
      )}

      {/* ═══ ORDERING FOR ═══ */}
      <div className="sticky top-[6.5rem] md:top-16 z-30 bg-paper/95 backdrop-blur-md border-b border-obsidian/10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40 shrink-0">
            For
          </span>
          {meetup.attendees.map((a) => (
            <PersonChip
              key={a.id}
              person={a}
              selected={ordering.includes(a.id)}
              size="sm"
              onClick={() =>
                setOrdering((prev) =>
                  prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id],
                )
              }
            />
          ))}
          <button
            type="button"
            onClick={() =>
              setOrdering(
                wholeTable
                  ? ([meetup.youId ?? meetup.attendees[0]?.id].filter(Boolean) as string[])
                  : meetup.attendees.map((a) => a.id),
              )
            }
            className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] border shrink-0 active:scale-95 transition-all ${
              wholeTable ? 'bg-gold border-gold text-obsidian' : 'border-gold/50 text-gold-dark'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* ═══ SEGMENTED CONTROL (phone) ═══ */}
      <div className="lg:hidden sticky top-[9.25rem] z-20 bg-paper border-b border-obsidian/10">
        <div className="grid grid-cols-4">
          {PANES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPane(p.id)}
              aria-current={pane === p.id ? 'true' : undefined}
              className="relative py-3 text-[10px] font-black uppercase tracking-[0.1em] active:scale-95 transition-transform"
            >
              <span className={pane === p.id ? 'text-obsidian' : 'text-obsidian/35'}>
                {p.label}
                {p.count ? <span className="text-gold-dark ml-1.5 tabular-nums">{p.count}</span> : null}
              </span>
              {pane === p.id && (
                <motion.span
                  layoutId="pane-underline"
                  className="absolute bottom-0 inset-x-3 h-0.5 bg-gold"
                  transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ PHONE PANES ═══ */}
      <div className="lg:hidden px-4 pt-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pane}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
          >
            {pane === 'menu' && (
              <MenuPicker venue={venue} disabled={ordering.length === 0} countFor={countFor} onAdd={onAdd} />
            )}

            {pane === 'order' && (
              <OrderList
                venue={venue}
                attendees={meetup.attendees}
                lines={meetup.lines}
                onQty={(lineId, qty) => setLineQty(meetup.id, lineId, qty)}
                onPayers={(lineId, payerIds) => setLinePayers(meetup.id, lineId, payerIds)}
                onRemove={(lineId) => removeLine(meetup.id, lineId)}
              />
            )}

            {pane === 'split' && bill && (
              <>
                <TipRow tipPct={meetup.tipPct} onTip={(t) => setTip(meetup.id, t)} />
                <div className="bg-cream border border-obsidian/10 p-5">
                  <SplitTable bill={bill} />
                </div>
                <p className="text-obsidian/35 text-[11px] leading-relaxed mt-4">
                  Includes {venue.serviceChargePct}% service and {venue.vatPct}% VAT, charged on each
                  person&apos;s own share. Convivia24 does not take payment — settle at the till.
                </p>
                <button
                  type="button"
                  onClick={onShare}
                  className="w-full mt-5 inline-flex items-center justify-center gap-2 px-6 py-4 border border-obsidian/20 text-obsidian text-[11px] font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-transform"
                >
                  <Share2 size={14} /> Send the split to the table
                </button>
              </>
            )}

            {pane === 'moments' && (
              <MomentsPane
                moments={moments}
                onCompose={() => setComposing(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden lg:grid max-w-6xl mx-auto px-8 py-12 grid-cols-[1fr_380px] gap-14 items-start">
        <section>
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <h2 className="font-display text-4xl italic text-obsidian leading-none">The menu</h2>
            <Link
              href={`/places/${venue.slug}`}
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/35 hover:text-gold-dark transition-colors"
            >
              <MapPin size={11} /> About {venue.name}
            </Link>
          </div>
          {ordering.length === 0 && (
            <p className="mb-5 p-4 border border-gold/40 bg-gold/10 text-obsidian/70 text-sm">
              Pick who you are ordering for first — tap a name above.
            </p>
          )}
          <MenuPicker venue={venue} disabled={ordering.length === 0} countFor={countFor} onAdd={onAdd} />

          <div className="mt-14 pt-10 border-t border-obsidian/10">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="font-display text-4xl italic text-obsidian leading-none">Moments</h2>
              <button
                type="button"
                onClick={() => setComposing(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-obsidian hover:bg-obsidian-50 text-cream text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
              >
                <Camera size={13} /> Post a moment
              </button>
            </div>
            <MomentsPane moments={moments} onCompose={() => setComposing(true)} />
          </div>
        </section>

        <aside className="sticky top-32 space-y-8">
          <section>
            <h2 className="font-display text-2xl italic text-obsidian mb-4">The order</h2>
            <OrderList
              venue={venue}
              attendees={meetup.attendees}
              lines={meetup.lines}
              onQty={(lineId, qty) => setLineQty(meetup.id, lineId, qty)}
              onPayers={(lineId, payerIds) => setLinePayers(meetup.id, lineId, payerIds)}
              onRemove={(lineId) => removeLine(meetup.id, lineId)}
            />
          </section>

          <section>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="font-display text-2xl italic text-obsidian">The split</h2>
              <TipRow tipPct={meetup.tipPct} onTip={(t) => setTip(meetup.id, t)} inline />
            </div>
            {bill && (
              <div className="bg-cream border border-obsidian/10 p-5">
                <SplitTable bill={bill} />
              </div>
            )}
            <p className="text-obsidian/35 text-[11px] leading-relaxed mt-4">
              Includes {venue.serviceChargePct}% service and {venue.vatPct}% VAT, charged on each
              person&apos;s own share. Convivia24 does not take payment — settle at the till.
            </p>
          </section>
        </aside>
      </div>

      {/* ═══ RUNNING TOTAL (phone) ═══ */}
      {bill && (
        <motion.button
          type="button"
          onClick={() => setPane(pane === 'split' ? 'menu' : 'split')}
          initial={false}
          className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-obsidian border-t border-gold/25 px-5 py-3 flex items-center justify-between gap-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] active:bg-obsidian-100 transition-colors"
        >
          <span className="text-left">
            <span className="block text-[9px] font-black uppercase tracking-[0.25em] text-cream/35 mb-0.5">
              The bill &middot; {orderCount} item{orderCount === 1 ? '' : 's'}
            </span>
            <span className="block font-display text-xl italic text-cream leading-none tabular-nums">
              {formatNaira(bill.total)}
            </span>
          </span>
          <span className="text-right">
            <span className="block text-[9px] font-black uppercase tracking-[0.25em] text-cream/35 mb-0.5">
              {pane === 'split' ? 'Back to menu' : 'Even split'}
            </span>
            <span className="block font-display text-xl italic text-gold leading-none tabular-nums">
              {pane === 'split' ? '↑' : formatNaira(bill.evenSplit)}
            </span>
          </span>
        </motion.button>
      )}

      <PeopleSheet
        open={peopleOpen}
        onClose={() => setPeopleOpen(false)}
        attendees={meetup.attendees}
        youId={meetup.youId}
        contacts={contacts}
        onAdd={(name, budget) => addAttendee(meetup.id, name, budget)}
        onUpdate={(pid, patch) => updateAttendee(meetup.id, pid, patch)}
        onRemove={(pid) => removeAttendee(meetup.id, pid)}
        onSetYou={(pid) => setYou(meetup.id, meetup.youId === pid ? undefined : pid)}
      />

      <MomentComposer
        open={composing}
        onClose={() => setComposing(false)}
        meetupId={meetup.id}
        venueSlug={venue.slug}
        people={meetup.attendees.map((a) => a.name)}
      />
    </div>
  );
}

/** The night as it is remembered, rather than as it is being paid for. */
function MomentsPane({ moments, onCompose }: { moments: Moment[]; onCompose: () => void }) {
  if (moments.length === 0) {
    return (
      <div className="border border-dashed border-obsidian/20 p-8 text-center">
        <p className="font-display text-2xl italic text-obsidian mb-2">Nothing kept yet.</p>
        <p className="text-obsidian/45 text-sm max-w-xs mx-auto mb-6">
          When the food lands, take a picture. This is the part you will still want in a year.
        </p>
        <button
          type="button"
          onClick={onCompose}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-gold active:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-transform"
        >
          <Camera size={14} /> Post a moment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onCompose}
        className="lg:hidden w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-obsidian/20 text-obsidian text-[11px] font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-transform"
      >
        <Camera size={14} /> Post a moment
      </button>
      <AnimatePresence initial={false}>
        {moments.map((m) => (
          <MomentCard key={m.id} moment={m} onDelete={() => undefined} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function TipRow({
  tipPct,
  onTip,
  inline = false,
}: {
  tipPct: number;
  onTip: (t: number) => void;
  inline?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${inline ? '' : 'mb-4 justify-between'}`}>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40">Tip</span>
      <div className="flex gap-px bg-obsidian/10 border border-obsidian/15">
        {TIPS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTip(t)}
            className={`px-3 py-1.5 text-[10px] font-black tabular-nums active:scale-95 transition-all ${
              tipPct === t ? 'bg-obsidian text-cream' : 'bg-cream text-obsidian/45'
            }`}
          >
            {t}%
          </button>
        ))}
      </div>
    </div>
  );
}
