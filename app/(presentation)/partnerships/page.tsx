'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    title: 'Partnership Proposal',
    subtitle: 'Convivia24 × Your Venue',
    body: 'We are building the premier network for African business — and we want your venue to be part of it. This proposal outlines how we can fill your space with the right people, create new revenue, and position you at the centre of where deals get done.',
    gain: 'Access to a curated community of operators, founders, and executives. Premium positioning. New revenue with zero marketing spend.',
  },
  {
    title: 'Who We Are',
    subtitle: 'Where African business is done.',
    body: 'Convivia24 is a luxury hotel and members club built for the people shaping African business. Our community includes operators scaling across the continent, diaspora returnees building at home, international executives engaging Africa, founders closing rounds, and creative directors shaping culture. Every person in our network is here because they are building, closing, or celebrating something.',
    gain: 'Association with a premium brand. High-value, high-intent footfall. A network that drives repeat business and referrals.',
  },
  {
    title: 'The Opportunity',
    subtitle: 'Convivium at [Your Venue]',
    body: 'We propose a partnership where Convivia24 curates and fills your space with our community. You provide the venue, F&B, and operations. We bring the brand, the guest list, the programming, and the marketing. No cold outreach. No empty rooms. Just the right people, at the right table.',
    gain: 'A new revenue stream with minimal effort. We fill the room. You host. When the room is full, we both win.',
  },
  {
    title: 'The Table',
    subtitle: 'Curated dinners at your restaurant or hotel F&B.',
    body: 'Monthly dinners for 12–24 guests. Convivia24 handles curation, invitations, and programming. Your venue handles the space, menu, and service. These are not generic networking events — they are carefully composed tables where introductions turn into partnerships.',
    gain: 'Guaranteed covers. Premium positioning. Repeat exposure to decision-makers who book private events and corporate dinners. Word-of-mouth among the people who matter.',
  },
  {
    title: 'Deal Rooms',
    subtitle: 'Meeting rooms by the day.',
    body: 'Private meeting rooms for founders closing deals, teams in town for a week, or executives needing a professional address. Named after African cities — Lagos, Accra, Nairobi, Kigali. We send the right people. You provide the space. Simple.',
    gain: 'Higher utilisation of underused meeting spaces. A new segment: business travellers who value curation over generic hotel rooms. Recurring bookings from a network that travels.',
  },
  {
    title: 'The Gathering',
    subtitle: 'Quarterly summits and events.',
    body: 'Half-day or full-day events: founder summits, investor dinners, industry roundtables. Ballroom or event space. We programme, promote, and fill. You host. These events become landmarks in the calendar — and your venue becomes the place where they happen.',
    gain: 'High-profile events that elevate your venue. Media coverage. Social proof. A long-term relationship with a community that is only growing.',
  },
  {
    title: 'The Model',
    subtitle: 'Revenue share or fixed fee. Your choice.',
    body: 'Flexible structure: revenue share per event, or a fixed fee per booking. We align incentives — when the room is full, we both win. No upfront investment. No long-term lock-in. We propose a pilot: one dinner or one half-day event. If it works, we scale together.',
    gain: 'Predictable incremental revenue. Zero risk. Low effort. High upside. A partner who is invested in filling your space.',
  },
  {
    title: 'Next Steps',
    subtitle: 'Let\'s run a pilot.',
    body: 'We propose one dinner or one half-day event at your venue. If it works, we scale. Lagos first. Abuja and London to follow. Your venue becomes the Convivia24 address in your city — the place where African business convenes.',
    gain: 'First-mover advantage. Your venue becomes synonymous with the network. As we grow across the continent, you grow with us.',
  },
  {
    title: 'Let\'s Talk',
    subtitle: 'Partnerships & Press',
    body: 'Reach out via our inquiry form. Select "Partnerships & Press" and tell us about your venue. We read every message personally and respond within 48 hours. Let\'s set a place at the table — together.',
    gain: 'A partnership that grows with you. Where African business is done — at your table.',
  },
];

function LogoMonochrome({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const h = size === 'lg' ? 'h-8' : size === 'sm' ? 'h-5' : 'h-6';
  return (
    <img
      src="/convivia24.png"
      alt="Convivia24"
      className={`${h} w-auto object-contain ${className}`}
      style={{ filter: 'brightness(0) invert(1) opacity(0.9)' }}
    />
  );
}

export default function PartnershipsPage() {
  const [slide, setSlide] = useState(0);
  const total = SLIDES.length;

  const goNext = useCallback(() => {
    setSlide((s) => (s < total - 1 ? s + 1 : s));
  }, [total]);

  const goPrev = useCallback(() => {
    setSlide((s) => (s > 0 ? s - 1 : s));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  const s = SLIDES[slide];

  return (
    <section className="min-h-screen bg-obsidian">
      {/* Fixed header with logo */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 py-4 bg-obsidian/90 backdrop-blur-sm border-b border-gold/10">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <LogoMonochrome />
        </Link>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cream/40">
          {slide + 1} / {total}
        </span>
      </div>

      {/* Slide content */}
      <div className="min-h-screen flex flex-col pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-20 w-full"
          >
            {/* Slide number */}
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/50 mb-6">
              {String(slide + 1).padStart(2, '0')}
            </p>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light italic text-cream tracking-tight mb-5">
              {s.title}
            </h1>
            <p className="text-gold/90 text-xl sm:text-2xl md:text-3xl mb-12 font-medium">
              {s.subtitle}
            </p>

            {/* Body */}
            <p className="text-cream/80 text-lg sm:text-xl md:text-2xl leading-relaxed mb-14 max-w-4xl">
              {s.body}
            </p>

            {/* What venues stand to gain */}
            <div className="mt-auto pt-10 border-t border-gold/20">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60 mb-4">
                What you gain
              </p>
              <p className="text-cream/90 text-base sm:text-lg md:text-xl leading-relaxed max-w-4xl">
                {s.gain}
              </p>
            </div>

            {/* Logo at bottom of slide */}
            <div className="mt-14 flex items-center gap-4">
              <LogoMonochrome size="lg" className="opacity-70" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cream/40">
                Lagos · Abuja · London
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-5 sm:px-8 py-5 bg-obsidian/95 backdrop-blur-sm border-t border-gold/10">
        <button
          type="button"
          onClick={goPrev}
          disabled={slide === 0}
          className="flex items-center gap-2 text-cream/50 hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === slide ? 'bg-gold' : 'bg-cream/20 hover:bg-cream/40'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={slide === total - 1}
          className="flex items-center gap-2 text-cream/50 hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>

      {/* CTA on last slide */}
      {slide === total - 1 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
          <Link
            href="/inquire"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
          >
            Get in touch
          </Link>
        </div>
      )}
    </section>
  );
}
