'use client';

import Link from 'next/link';
import DrinkPlaceholder from '@/components/shop/DrinkPlaceholder';
import DrinkPhoto from '@/components/shop/DrinkPhoto';
import HomeHero from '@/components/home/HomeHero';
import { allEvents, formatEventWhen, isTonight } from '@/lib/events/catalog';
import {
  DRINKS,
  CATEGORIES,
  CATEGORY_LABELS,
  formatNgn,
  type DrinkCategory,
} from '@/lib/drinks/catalog';

const featured = (
  DRINKS.filter((d) => d.featured && (d.image || d.packImages?.length))
).slice(0, 4);

const tonight = allEvents().filter(isTonight).slice(0, 3);

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <section className="bg-white py-16 sm:py-20 border-y border-obsidian/5">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[9px] font-wordmark-sm text-ember mb-2">Recommended</p>
              <h2 className="font-wordmark text-2xl sm:text-3xl text-obsidian">Tonight&apos;s picks</h2>
            </div>
            <Link
              href="/shop"
              className="text-[11px] font-wordmark-sm text-ember hover:text-ember-dark"
            >
              View all →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5 sm:mx-0 sm:px-0">
            {featured.map((p) => (
              <Link
                key={p.slug}
                href={`/shop/${p.slug}`}
                className="shrink-0 w-[160px] sm:w-[180px] group"
              >
                <div className="aspect-[3/4] overflow-hidden relative mb-3 border border-obsidian/10 bg-paper">
                  <DrinkPhoto product={p} className="absolute inset-0 w-full h-full" />
                  {p.deal && (
                    <span className="absolute top-2 left-2 badge-brand text-[8px] font-black uppercase tracking-wider px-2 py-0.5 z-10">
                      Deal
                    </span>
                  )}
                </div>
                <p className="text-xs text-obsidian leading-snug line-clamp-2 font-medium">
                  {p.name}
                </p>
                <p className="text-[11px] text-obsidian/50 mt-0.5">
                  {p.abv}% · {p.volume}
                </p>
                <p className="text-sm font-medium text-obsidian mt-1">{formatNgn(p.priceNgn)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <p className="text-[9px] font-wordmark-sm text-ember mb-2">Explore</p>
          <h2 className="font-wordmark text-2xl sm:text-3xl text-obsidian mb-8">Popular categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {CATEGORIES.map((cat: DrinkCategory) => {
              const cover = DRINKS.find((d) => d.category === cat && (d.image || d.packImages?.length));
              return (
                <Link
                  key={cat}
                  href={`/shop?category=${cat}`}
                  className="group relative aspect-[4/3] overflow-hidden border border-obsidian/10 bg-white hover:border-ember/40 transition-colors"
                >
                  {cover ? (
                    <DrinkPhoto product={cover} className="absolute inset-0 w-full h-full" watermark={false} />
                  ) : (
                    <DrinkPlaceholder
                      category={cat}
                      watermark={false}
                      className="absolute inset-0 w-full h-full"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3 pt-8">
                    <span className="text-sm font-semibold text-white flex items-center gap-1">
                      {CATEGORY_LABELS[cat]}
                      <span className="text-ember group-hover:translate-x-0.5 transition-transform">→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {tonight.length > 0 && (
        <section className="bg-white py-16 sm:py-20 border-t border-obsidian/5">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-[9px] font-wordmark-sm text-ember mb-2">Around you</p>
                <h2 className="font-wordmark text-2xl sm:text-3xl text-obsidian">Tonight</h2>
              </div>
              <Link href="/events" className="text-[11px] font-wordmark-sm text-ember hover:text-ember-dark">
                All events →
              </Link>
            </div>
            <div className="divide-y divide-obsidian/8 border-y border-obsidian/8">
              {tonight.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group flex items-start gap-3 py-4 hover:bg-ember/[0.03] transition-colors"
                >
                  <span className="mt-2 w-2 h-2 rounded-full bg-ember live-beep shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-wordmark-sm text-ember mb-1">
                      {formatEventWhen(event)}
                    </p>
                    <p className="font-wordmark-md text-obsidian group-hover:text-ember transition-colors">
                      {event.title}
                    </p>
                    <p className="text-xs text-obsidian/50 mt-0.5">
                      {event.venue.name} · {event.venue.area}
                    </p>
                  </div>
                  <span className="text-ember/40 group-hover:text-ember transition-colors">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="brand-gradient py-12 sm:py-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-[9px] font-wordmark-sm text-white/60 mb-2">Outlets</p>
            <h2 className="font-wordmark text-xl sm:text-2xl text-white">Wholesale + Convivium Premium</h2>
            <p className="text-sm text-white/70 mt-1 font-light">Restock the room. Convert perks into guest gift cards.</p>
          </div>
          <Link
            href="/partners"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-obsidian text-[11px] font-wordmark-sm shrink-0"
          >
            Partner with us
          </Link>
        </div>
      </section>
    </>
  );
}
