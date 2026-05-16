'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Instagram,
  Loader2,
  MapPin,
  Play,
  Share2,
  Sparkles,
  Star,
  TimerReset,
  Users,
} from 'lucide-react';

type Media = { id: string; url: string; media_type: 'photo' | 'video'; caption: string | null; sort_order: number };
type Shift = { id: string; title: string; event_time: string; location: string; area: string | null; current_guests: number; max_guests: number; ticket_price: number | null };
type Vendor = {
  id: string; slug: string; business_name: string; business_type: string | null;
  description: string | null; full_address: string | null; instagram_handle: string | null;
  logo_url: string | null; cover_url: string | null; city_name: string; media: Media[];
};
type VendorStats = {
  total_shifts: number;
  total_applications: number;
  trusted_matches: number;
  completed_shifts: number;
};

function formatShiftDate(value: string) {
  return new Date(value).toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function cleanInstagram(handle: string | null) {
  return handle?.replace('@', '').trim() || '';
}

export default function VendorPublicPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://convivia24.com/v/${slug}`;

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/vendor/${encodeURIComponent(slug)}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Not found');
        setVendor(d.vendor);
        setShifts(d.shifts || []);
        setStats(d.stats || null);
      })
      .catch((e) => setErr(e.message || 'Vendor not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const copyLink = () => {
    navigator.clipboard?.writeText(pageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: vendor?.business_name || 'Convivia24 outlet',
        text: vendor?.description || 'View this verified hospitality outlet on Convivia24.',
        url: pageUrl,
      }).catch(() => {});
    } else {
      copyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f7f4]">
        <Loader2 size={32} className="text-red-700 animate-spin" />
      </div>
    );
  }

  if (err || !vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f9f7f4] px-4 text-center">
        <p className="font-display text-2xl italic text-neutral-800">Vendor not found.</p>
        <p className="text-neutral-500 text-sm">{err}</p>
        <Link href="/" className="text-red-700 font-semibold text-sm underline">Back to Convivia24</Link>
      </div>
    );
  }

  const photos = vendor.media.filter((m) => m.media_type === 'photo');
  const videos = vendor.media.filter((m) => m.media_type === 'video');
  const featuredPhotos = photos.slice(0, 5);
  const firstShift = shifts[0];
  const primaryApplyHref = firstShift ? `/?apply=${firstShift.id}` : '/';
  const instagram = cleanInstagram(vendor.instagram_handle);
  const mediaCount = photos.length + videos.length;
  const totalOpenSlots = shifts.reduce(
    (sum, shift) => sum + Math.max(0, Number(shift.max_guests || 0) - Number(shift.current_guests || 0)),
    0,
  );
  const heroBackground = vendor.cover_url || photos[0]?.url || '';
  const statSummary = {
    totalShifts: Number(stats?.total_shifts || shifts.length || 0),
    totalApplications: Number(stats?.total_applications || 0),
    trustedMatches: Number(stats?.trusted_matches || 0),
    completedShifts: Number(stats?.completed_shifts || 0),
  };
  const profileStrength = Math.min(
    100,
    [
      vendor.description,
      vendor.full_address,
      vendor.logo_url,
      vendor.cover_url || photos[0]?.url,
      instagram,
      shifts.length > 0,
      mediaCount > 0,
    ].filter(Boolean).length * 15,
  );

  return (
    <div className="min-h-screen bg-[#f8f6f2] pb-24 text-neutral-900">
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        {heroBackground ? (
          <img src={heroBackground} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(185,28,28,0.45),transparent_28%),linear-gradient(135deg,rgba(10,10,10,0.92),rgba(69,10,10,0.82))]" />

        <div className="relative mx-auto flex min-h-[560px] w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/85 backdrop-blur hover:bg-white/15"
            >
              Convivia24
            </Link>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={shareLink}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur hover:bg-white/25"
              >
                {copied ? <Check size={14} /> : <Share2 size={14} />}
                {copied ? 'Copied' : 'Share'}
              </button>
              <button
                type="button"
                onClick={copyLink}
                aria-label="Copy outlet page link"
                className="inline-flex min-h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur hover:bg-white/25"
              >
                <Copy size={15} />
              </button>
            </div>
          </div>

          <div className="grid flex-1 items-end gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="max-w-3xl">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/35 bg-emerald-400/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-50">
                  <BadgeCheck size={13} /> Verified outlet
                </span>
                {vendor.business_type ? (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/80">
                    {vendor.business_type}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/80">
                  <MapPin size={12} /> {vendor.city_name}
                </span>
              </div>

              <div className="mb-5 flex items-end gap-4">
                {vendor.logo_url ? (
                  <img
                    src={vendor.logo_url}
                    alt={`${vendor.business_name} logo`}
                    className="h-24 w-24 shrink-0 rounded-[28px] border-4 border-white object-cover shadow-2xl sm:h-28 sm:w-28"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] border-4 border-white bg-red-900 text-4xl font-black shadow-2xl sm:h-28 sm:w-28">
                    {vendor.business_name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-red-100">Outlet profile</p>
                  <h1 className="font-display text-4xl italic leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                    {vendor.business_name}
                  </h1>
                </div>
              </div>

              <p className="max-w-2xl text-lg leading-8 text-white/85 sm:text-xl">
                {vendor.description ||
                  'A verified hospitality outlet on Convivia24, sharing open shifts, venue details, and visual proof of the workplace.'}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={primaryApplyHref}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 py-3 text-[11px] font-black uppercase tracking-widest text-red-800 shadow-xl shadow-black/20 hover:bg-red-50"
                >
                  {shifts.length > 0 ? 'Apply for a shift' : 'View app'}
                  <ChevronRight size={15} />
                </Link>
                {instagram ? (
                  <a
                    href={`https://instagram.com/${instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur hover:bg-white/15"
                  >
                    <Instagram size={15} /> Instagram
                  </a>
                ) : null}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/15 bg-white/12 p-5 backdrop-blur-2xl shadow-2xl shadow-black/20">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-100">Live page summary</p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-white/12 p-3">
                  <p className="text-2xl font-black">{statSummary.totalShifts}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-white/65">Posted</p>
                </div>
                <div className="rounded-2xl bg-white/12 p-3">
                  <p className="text-2xl font-black">{statSummary.totalApplications}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-white/65">Applies</p>
                </div>
                <div className="rounded-2xl bg-white/12 p-3">
                  <p className="text-2xl font-black">{Math.max(totalOpenSlots, statSummary.trustedMatches, 0)}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-white/65">
                    {totalOpenSlots > 0 ? 'Slots' : 'Matches'}
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-black/20 p-3">
                <div className="flex items-center justify-between gap-3 text-xs text-white/75">
                  <span className="font-bold">Profile strength</span>
                  <span>{profileStrength}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-emerald-300" style={{ width: `${profileStrength}%` }} />
                </div>
              </div>
              <ul className="mt-5 space-y-2">
                {[
                  'Approved Convivia24 outlet',
                  vendor.full_address ? 'Address visible to applicants' : 'Location verified by city',
                  shifts.length > 0 ? `${shifts.length} active shift${shifts.length === 1 ? '' : 's'}` : 'Ready for staffing',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-5 text-white/80">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-200" size={16} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700">
              <Sparkles size={20} />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-600">Why this outlet</p>
              <h2 className="mt-2 font-display text-2xl italic sm:text-3xl">A clearer first impression for workers.</h2>
              <p className="mt-3 text-[15px] leading-7 text-neutral-600">
                {vendor.description ||
                  `${vendor.business_name} uses Convivia24 to show workers where they will be working, what roles are open, and how to apply with confidence.`}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <Star className="text-amber-500" size={18} />
              <p className="mt-3 text-sm font-bold">Verified before public</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">Outlet profile is approved before workers see it.</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <Users className="text-red-700" size={18} />
              <p className="mt-3 text-sm font-bold">Built for staffing</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">Open shifts sit beside the outlet brand story.</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <Share2 className="text-neutral-700" size={18} />
              <p className="mt-3 text-sm font-bold">Easy to share</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">One public page for Instagram, WhatsApp, and worker referrals.</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-[13px] text-neutral-600">
            {vendor.full_address ? (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-red-700/70" />
                {vendor.full_address}
              </span>
            ) : null}
            {instagram ? (
              <a
                href={`https://instagram.com/${instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-red-700 font-semibold hover:underline"
              >
                <Instagram size={13} />
                @{instagram}
              </a>
            ) : null}
          </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-neutral-200 bg-neutral-950 shadow-sm">
            <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-56 bg-red-950">
                {heroBackground ? (
                  <img src={heroBackground} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-100">Workplace preview</p>
                  <p className="mt-2 text-2xl font-black leading-tight">{vendor.business_name}</p>
                </div>
              </div>
              <div className="p-5 text-white sm:p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-200">What workers can expect</p>
                <h2 className="mt-2 font-display text-2xl italic sm:text-3xl">Clear shift details before they apply.</h2>
                <div className="mt-5 grid gap-3">
                  {[
                    {
                      title: 'Location confidence',
                      body: vendor.full_address ? 'Workers can see the venue address before applying.' : `Workers can see this outlet is based in ${vendor.city_name}.`,
                      icon: MapPin,
                    },
                    {
                      title: 'Fast application',
                      body: 'Applicants can send phone, payout details, and a short note from the shift card.',
                      icon: TimerReset,
                    },
                    {
                      title: 'Trusted staffing flow',
                      body: `${statSummary.trustedMatches} trusted match${statSummary.trustedMatches === 1 ? '' : 'es'} recorded for this outlet so far.`,
                      icon: BadgeCheck,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-red-100">
                            <Icon size={17} />
                          </span>
                          <div>
                            <p className="text-sm font-black">{item.title}</p>
                            <p className="mt-1 text-sm leading-6 text-white/68">{item.body}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

        {shifts.length > 0 ? (
          <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-600">Now hiring</p>
                <h2 className="mt-2 font-display text-2xl italic sm:text-3xl">Open shifts</h2>
              </div>
              <Link href="/" className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-700 hover:underline">
                Browse all <ChevronRight size={12} />
              </Link>
            </div>

            <div className="mt-5 grid gap-3">
              {shifts.map((s) => {
                const openSlots = Math.max(0, Number(s.max_guests || 0) - Number(s.current_guests || 0));
                return (
                  <article key={s.id} className="rounded-3xl border border-neutral-200 bg-[#fbfaf8] p-4 transition hover:border-red-200 hover:bg-red-50/30">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-lg font-black text-neutral-950">{s.title}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-600">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-neutral-200">
                            <CalendarDays size={13} className="text-red-700" />
                            {formatShiftDate(s.event_time)}
                          </span>
                          {s.location ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-neutral-200">
                              <MapPin size={13} className="text-red-700" />
                              {s.location}
                              {s.area ? ` · ${s.area}` : ''}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                        <div className="text-left sm:text-right">
                          {s.ticket_price ? (
                            <p className="text-sm font-black text-emerald-800">₦{s.ticket_price.toLocaleString()}</p>
                          ) : (
                            <p className="text-sm font-black text-neutral-700">Pay listed in app</p>
                          )}
                          <p className="mt-1 text-[11px] text-neutral-500">
                            {openSlots} open slot{openSlots === 1 ? '' : 's'}
                          </p>
                        </div>
                        <Link
                          href={`/?apply=${s.id}`}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-red-700 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-800"
                        >
                          Apply <ArrowUpRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="rounded-[28px] border border-dashed border-neutral-300 bg-white p-5 text-center shadow-sm sm:p-7">
            <Clock className="mx-auto text-neutral-400" size={24} />
            <h2 className="mt-3 font-display text-2xl italic">No open shifts right now.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              This outlet page is live for brand visibility. New shifts will appear here when the outlet posts them.
            </p>
          </section>
        )}

        {featuredPhotos.length > 0 ? (
          <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-600">Inside the outlet</p>
                <h2 className="mt-2 font-display text-2xl italic sm:text-3xl">Gallery</h2>
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                {photos.length} photo{photos.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {featuredPhotos.map((m, index) => (
                <figure
                  key={m.id}
                  className={`group relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 ${
                    index === 0 ? 'col-span-2 row-span-2 aspect-square sm:aspect-auto' : 'aspect-square'
                  }`}
                >
                  <img
                    src={m.url}
                    alt={m.caption || `${vendor.business_name} photo`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {m.caption ? (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-xs text-white">
                      {m.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {videos.length > 0 ? (
          <section className="rounded-[28px] border border-neutral-200 bg-neutral-950 p-5 text-white shadow-sm sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-200">Video proof</p>
            <h2 className="mt-2 font-display text-2xl italic sm:text-3xl">See the space before applying.</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {videos.map((m) => (
                <div key={m.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <div className="relative">
                    <video src={m.url} controls className="aspect-video w-full object-contain" />
                    <Play className="pointer-events-none absolute left-3 top-3 text-white/60" size={18} />
                  </div>
                  {m.caption ? <p className="px-3 py-2 text-xs text-white/70">{m.caption}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-600">Outlet proof</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-neutral-50 p-3">
                <p className="text-xl font-black">{statSummary.completedShifts}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Completed</p>
              </div>
              <div className="rounded-2xl bg-neutral-50 p-3">
                <p className="text-xl font-black">{mediaCount}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Media</p>
              </div>
            </div>
            <button
              type="button"
              onClick={shareLink}
              className="mt-4 inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-800 hover:border-red-300"
            >
              {copied ? <Check size={14} className="text-emerald-700" /> : <Share2 size={14} />}
              {copied ? 'Link copied' : 'Share this outlet'}
            </button>
          </section>

          <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-600">Outlet details</p>
            <div className="mt-4 space-y-3 text-sm text-neutral-600">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 shrink-0 text-red-700" size={16} />
                <span>{vendor.full_address || vendor.city_name}</span>
              </p>
              {instagram ? (
                <a
                  href={`https://instagram.com/${instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-semibold text-red-700 hover:underline"
                >
                  <Instagram size={16} /> @{instagram}
                </a>
              ) : null}
            </div>
          </section>

          <section className="rounded-[28px] border border-red-100 bg-red-700 p-5 text-white shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-100">For workers</p>
            <h2 className="mt-2 font-display text-2xl italic">Want to work here?</h2>
            <p className="mt-2 text-sm leading-6 text-red-50">
              Apply with your phone, payout details, and a short note. The outlet can review your profile inside Convivia24.
            </p>
            <Link
              href={primaryApplyHref}
              className="mt-5 inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-800 hover:bg-red-50"
            >
              {shifts.length > 0 ? 'Apply now' : 'Open Convivia24'} <ChevronRight size={14} />
            </Link>
          </section>

          <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-neutral-400">Powered by</p>
            <Link href="/" className="mt-3 block">
              <img src="/brand/convivia24-wordmark.svg" alt="Convivia24" className="h-10 object-contain" />
            </Link>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Verified hospitality staffing for restaurants, lounges, hotels, and event teams.
            </p>
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/92 p-3 shadow-[0_-12px_40px_rgba(0,0,0,0.10)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black">{vendor.business_name}</p>
            <p className="text-[11px] text-neutral-500">
              {shifts.length > 0 ? `${shifts.length} open shift${shifts.length === 1 ? '' : 's'}` : 'Verified outlet page'}
            </p>
          </div>
          <Link
            href={primaryApplyHref}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-red-700 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white"
          >
            {shifts.length > 0 ? 'Apply' : 'Open'}
          </Link>
        </div>
      </div>
    </div>
  );
}
