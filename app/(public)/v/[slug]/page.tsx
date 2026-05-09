'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, MapPin, Instagram, Share2, Copy, Check,
  Clock, Users, ChevronRight, Play,
} from 'lucide-react';

type Media = { id: string; url: string; media_type: 'photo' | 'video'; caption: string | null; sort_order: number };
type Shift = { id: string; title: string; event_time: string; location: string; area: string | null; current_guests: number; max_guests: number; ticket_price: number | null };
type Vendor = {
  id: string; slug: string; business_name: string; business_type: string | null;
  description: string | null; full_address: string | null; instagram_handle: string | null;
  logo_url: string | null; cover_url: string | null; city_name: string; media: Media[];
};

export default function VendorPublicPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://app.convivia24.com/v/${slug}`;

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/vendor/${encodeURIComponent(slug)}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Not found');
        setVendor(d.vendor);
        setShifts(d.shifts || []);
      })
      .catch((e) => setErr(e.message || 'Vendor not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const copyLink = () => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({ title: vendor?.business_name || 'Vendor', url: pageUrl }).catch(() => {});
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

  return (
    <div className="min-h-screen bg-[#f9f7f4] pb-20">
      {/* Cover */}
      <div className="relative h-52 sm:h-72 bg-gradient-to-br from-neutral-900 to-red-950 overflow-hidden">
        {vendor.cover_url ? (
          <img src={vendor.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            {vendor.logo_url ? (
              <img src={vendor.logo_url} alt="" className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white object-cover shadow-xl shrink-0" />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white bg-neutral-800 flex items-center justify-center shrink-0 shadow-xl">
                <span className="text-white text-2xl font-black">{vendor.business_name.charAt(0)}</span>
              </div>
            )}
            <div className="mb-1">
              <h1 className="text-white font-display text-2xl sm:text-3xl italic leading-tight drop-shadow">{vendor.business_name}</h1>
              <p className="text-white/80 text-sm flex items-center gap-1.5 mt-0.5">
                <MapPin size={13} /> {vendor.city_name}
                {vendor.business_type ? <span className="ml-1 text-white/60">· {vendor.business_type}</span> : null}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 mb-1">
            <button
              type="button"
              onClick={shareLink}
              className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 hover:bg-white/30"
            >
              {copied ? <Check size={13} /> : <Share2 size={13} />}
              {copied ? 'Copied' : 'Share'}
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 hover:bg-white/30"
            >
              <Copy size={13} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* About */}
        <section className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-600">About</p>
          {vendor.description ? (
            <p className="text-neutral-700 text-[15px] leading-relaxed">{vendor.description}</p>
          ) : (
            <p className="text-neutral-400 text-sm italic">No description added yet.</p>
          )}
          <div className="flex flex-wrap gap-4 text-[13px] text-neutral-600 pt-1">
            {vendor.full_address ? (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-red-700/70" />
                {vendor.full_address}
              </span>
            ) : null}
            {vendor.instagram_handle ? (
              <a
                href={`https://instagram.com/${vendor.instagram_handle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-red-700 font-semibold hover:underline"
              >
                <Instagram size={13} />
                @{vendor.instagram_handle.replace('@', '')}
              </a>
            ) : null}
          </div>
        </section>

        {/* Open shifts */}
        {shifts.length > 0 ? (
          <section className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-600">Open shifts</p>
            <div className="space-y-2">
              {shifts.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-900 text-sm">{s.title}</p>
                    <p className="text-[12px] text-neutral-500 mt-0.5 flex items-center gap-2">
                      <Clock size={11} /> {new Date(s.event_time).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {s.location ? <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1"><MapPin size={10} />{s.location}{s.area ? ` · ${s.area}` : ''}</p> : null}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {s.ticket_price ? <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">₦{s.ticket_price.toLocaleString()}</span> : null}
                    <span className="text-[10px] text-neutral-500 flex items-center gap-1"><Users size={10} />{s.current_guests}/{s.max_guests}</span>
                    <Link href={`/?apply=${s.id}`} className="text-[9px] font-black uppercase tracking-widest text-white bg-red-700 px-2.5 py-1.5 rounded-lg">Apply</Link>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/" className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-700 hover:underline">
              All shifts on Convivia24 <ChevronRight size={12} />
            </Link>
          </section>
        ) : null}

        {/* Photo gallery */}
        {photos.length > 0 ? (
          <section className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-600">Gallery</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {photos.map((m) => (
                <div key={m.id} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
                  <img src={m.url} alt={m.caption || ''} className="absolute inset-0 w-full h-full object-cover" />
                  {m.caption ? (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                      <p className="text-white text-[10px] truncate">{m.caption}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Videos */}
        {videos.length > 0 ? (
          <section className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-600">Videos</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {videos.map((m) => (
                <div key={m.id} className="rounded-xl border border-neutral-200 bg-neutral-900 overflow-hidden">
                  <video src={m.url} controls className="w-full aspect-video object-contain" />
                  {m.caption ? <p className="text-white/70 text-[11px] px-3 py-2">{m.caption}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* CTA footer */}
        <section className="rounded-2xl border border-red-200/50 bg-white p-5 text-center space-y-3 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-neutral-500">Powered by</p>
          <Link href="/" className="block">
            <img src="/convivia24.png" alt="Convivia24" className="h-8 mx-auto object-contain" />
          </Link>
          <p className="text-neutral-600 text-sm">Find verified hospitality workers in Lagos, Abuja &amp; Port Harcourt.</p>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-red-700 text-white text-[10px] font-black uppercase tracking-[0.15em] px-6 py-3 hover:bg-red-800">
            Open Convivia24 <ChevronRight size={13} />
          </Link>
        </section>
      </div>
    </div>
  );
}
