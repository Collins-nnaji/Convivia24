'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
  useReducedMotion,
  useMotionValueEvent,
  type Variants,
} from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  QrCode,
  Camera,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Users,
  TrendingUp,
  MapPin,
  Star,
  Shield,
  Zap,
  Clock,
  Target,
  Rocket,
  Globe,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { BRAND_LOGO_SRC } from '@/lib/brand';

const easeOut = [0.16, 1, 0.3, 1] as const;

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: easeOut } },
};

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 36, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, letterSpacing: '0.4em' }}
      whileInView={{ opacity: 1, letterSpacing: '0.3em' }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: easeOut }}
      className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-3"
    >
      {children}
    </motion.p>
  );
}

// ─── data ─────────────────────────────────────────────────────────────────────

const GROWTH_STAGES = [
  {
    icon: Target,
    phase: 'Phase 1',
    title: 'Conceive',
    body: 'Define campaign goals, sampling targets, and audience segments. Our campaign builder takes you from brief to live in under 10 minutes.',
    stat: '< 10 min setup',
  },
  {
    icon: Rocket,
    phase: 'Phase 2',
    title: 'Launch',
    body: 'Issue branded digital guest passes, activate verified field agents, and go live across multiple cities simultaneously. Zero print. Zero chaos.',
    stat: 'Same-day go-live',
  },
  {
    icon: BarChart3,
    phase: 'Phase 3',
    title: 'Measure',
    body: 'Every check-in, redemption, and sample scan hits your real-time dashboard. See ROI while the activation is running — not weeks later.',
    stat: 'Live dashboard',
  },
  {
    icon: Globe,
    phase: 'Phase 4',
    title: 'Scale',
    body: 'Replicate winning campaigns across Lagos, Abuja, and Port Harcourt. Each activation builds your audience for the next.',
    stat: '3 cities · 1M+ reach',
  },
];

const FEATURES = [
  { icon: QrCode, tag: 'Guest Passes', title: 'Branded QR check-in', body: 'Issue digital passes guests keep. Clubs, malls, festivals — one scan shows exactly who showed up and when.' },
  { icon: BarChart3, tag: 'Live ROI', title: 'Real-time dashboard', body: 'Check-ins, redemptions, and sample scans in one screen. See activation ROI before the event ends.' },
  { icon: Camera, tag: 'Photo Wall', title: 'Moderated UGC', body: 'Field agents upload guest photos on-site. Moderate before anything goes public — brand stays clean.' },
  { icon: Sparkles, tag: 'FMCG-Ready', title: 'Compliance built in', body: 'Sampling limits, 18+ gates, NDPR-friendly consent. Your legal team signs off on day one.' },
  { icon: Users, tag: 'Field Staffing', title: 'Verified activators', body: 'Background-checked agents across Lagos, Abuja, and PH. Hire same day, pay instantly.' },
  { icon: TrendingUp, tag: 'Insights', title: 'Post-campaign reports', body: 'Downloadable PDF with reach, engagement, and sampling data your procurement team can present upstairs.' },
];

const COMMITMENTS = [
  { icon: Target, title: 'We build your campaign strategy', body: 'Our specialists work with your team on audience segments, sampling budgets, and city rollout plans before a single naira is spent.' },
  { icon: Users, title: 'We deploy verified field agents', body: 'Background-checked, trained activators across Lagos, Abuja, and PH. Same-day deployment. You approve who represents your brand.' },
  { icon: Zap, title: 'We give you live ROI — not a debrief', body: 'Real-time dashboard with check-ins, redemptions, and sample counts. Know your ROI while the activation is still running.' },
  { icon: Shield, title: 'We handle compliance', body: 'NDPR consent flows, 18+ sampling gates, and limit enforcement built in. Your legal team signs off in hours, not weeks.' },
  { icon: BarChart3, title: 'We deliver boardroom-ready reports', body: 'Post-campaign PDF with reach, redemption rates, UGC gallery, and demographics — ready for your quarterly brand review.' },
  { icon: Globe, title: 'We scale with your ambition', body: 'From one mall pop-up to simultaneous activations across 3 cities and 1M+ consumer touchpoints — built for both.' },
];

const STATS = [
  { value: '12K+', label: 'Activations tracked' },
  { value: '98%', label: 'Redemption accuracy' },
  { value: '1M+', label: 'Consumer touchpoints' },
  { value: '24h', label: 'Agent deployment' },
];

const TRUST = [
  { icon: Shield, label: 'NDPR-compliant' },
  { icon: Zap, label: 'Real-time data' },
  { icon: Clock, label: 'Same-day deployment' },
  { icon: CheckCircle2, label: 'No credit card' },
];

const TICKER = [
  'Brand Activation', 'Field Staffing', 'Live ROI', 'Guest Passes',
  'UGC Moderation', 'FMCG Compliance', 'QR Check-In', '1M+ Reach',
];

const INQUIRY_TYPES = [
  'FMCG brand activation',
  'Sampling campaign',
  'Multi-city rollout',
  'Partnerships',
  'Press / Media',
  'Other',
];

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Insights', href: '/insights' },
  { label: 'For brands', href: '#for-brands' },
  { label: 'Contact', href: '#contact' },
];

// ─── sub-components ───────────────────────────────────────────────────────────

function Ticker() {
  const doubled = [...TICKER, ...TICKER];
  return (
    <div className="overflow-hidden py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-dark select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
      <motion.div
        className="flex gap-10 whitespace-nowrap w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/95"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 inline-block animate-landing-shine" />
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function StatBlock({ value, label, delay }: { value: string; label: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: easeOut }}
      className="group flex flex-col items-center text-center px-4 py-12
                 border-r border-neutral-200/80 last:border-r-0
                 hover:bg-gold/[0.04] transition-colors duration-500"
    >
      <span className="font-display text-5xl sm:text-6xl font-bold leading-none tracking-tight text-neutral-900
                       group-hover:text-gold-dark transition-colors duration-500">
        {value}
      </span>
      <span className="mt-3 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
        {label}
      </span>
    </motion.div>
  );
}

function FeatureCard({
  icon: Icon,
  tag,
  title,
  body,
  index,
}: {
  icon: typeof QrCode;
  tag: string;
  title: string;
  body: string;
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.06, ease: easeOut }}
      whileHover={{ y: -4 }}
      className="landing-card-shine bg-white p-8 h-full group
                 border border-neutral-100/80
                 hover:border-gold/25 hover:shadow-[0_20px_50px_-12px_rgba(201,168,76,0.15)]
                 transition-[border-color,box-shadow] duration-400"
    >
      <motion.div
        className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#f5f0e8] to-[#ede5d4]
                   flex items-center justify-center mb-6
                   group-hover:from-gold/20 group-hover:to-gold/5 transition-all duration-400"
        whileHover={{ rotate: [0, -6, 6, 0], scale: 1.05 }}
        transition={{ duration: 0.45 }}
      >
        <Icon size={20} className="text-gold-dark" />
      </motion.div>
      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-400 mb-2">{tag}</p>
      <h3 className="font-bold text-neutral-900 text-base mb-3 leading-snug">{title}</h3>
      <p className="text-sm text-neutral-500 leading-relaxed">{body}</p>
    </motion.div>
  );
}

function HeroBackground({ reduceMotion }: { reduceMotion: boolean }) {
  const { scrollYProgress } = useScroll();
  const logoY = useTransform(scrollYProgress, [0, 0.4], ['0%', '10%']);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#f8f6f2]">
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2
                   w-[900px] h-[600px]
                   bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.13)_0%,transparent_65%)]"
      />

      <motion.div
        style={{ y: reduceMotion ? 0 : logoY }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <motion.img
          src={BRAND_LOGO_SRC}
          alt=""
          draggable={false}
          className="w-[min(88vw,520px)] max-h-[42vh] object-contain opacity-[0.09] select-none"
          animate={reduceMotion ? undefined : { y: [0, -10, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <div className="absolute inset-0 landing-hero-mesh pointer-events-none" />

      {!reduceMotion && (
        <>
          <motion.div
            className="absolute top-[18%] right-[8%] w-48 h-48 sm:w-64 sm:h-64 rounded-full
                       bg-gold/20 blur-3xl pointer-events-none"
            animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.12, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[22%] left-[5%] w-36 h-36 sm:w-52 sm:h-52 rounded-full
                       bg-red-700/8 blur-3xl pointer-events-none"
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </>
      )}
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export function ActivationLandingPage() {
  const heroRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroContentY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.15]);

  const { scrollY } = useScroll();
  const navShadow = useTransform(scrollY, [0, 60], [0, 1]);
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, 'change', v => setScrolled(v > 24));

  const [mobileOpen, setMobileOpen] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [inquiryType, setInquiryType] = useState('');
  const [message, setMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || undefined,
          inquiry_type: inquiryType || 'FMCG brand activation',
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Something went wrong.');
        return;
      }
      setFormSuccess(true);
    } catch {
      setFormError('Unable to send. Please try again.');
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="bg-[#f8f6f2] text-neutral-900 overflow-x-hidden">

      {/* ══════════════════════════ NAV ══════════════════════════════════════ */}
      <motion.header
        style={{ boxShadow: useTransform(navShadow, [0, 1], ['0 0 0 transparent', '0 8px 32px rgba(0,0,0,0.06)']) }}
        className={`fixed top-0 inset-x-0 z-50 h-[3.75rem] flex items-center justify-between
                    px-5 sm:px-10 transition-[background,border-color] duration-500
                    ${scrolled
            ? 'bg-[#f8f6f2]/95 backdrop-blur-xl border-b border-neutral-200/70'
            : 'bg-[#f8f6f2]/40 backdrop-blur-md border-b border-transparent'
          }`}
      >
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <BrandLogo alt="Convivia24" className="h-7 w-auto drop-shadow-sm" />
        </motion.div>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link, i) => (
            <motion.a
              key={link.href}
              href={link.href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.45, ease: easeOut }}
              className="px-4 py-2 text-[11px] font-bold text-neutral-600 hover:text-neutral-900
                         uppercase tracking-widest transition-colors rounded-full
                         hover:bg-neutral-900/5"
            >
              {link.label}
            </motion.a>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.28, duration: 0.45, ease: easeOut }}
            className="flex items-center gap-2 ml-3 pl-3 border-l border-neutral-300/60"
          >
            <Link
              href="/auth/sign-in"
              className="px-4 py-2.5 text-[11px] font-bold text-neutral-600 hover:text-neutral-900
                         uppercase tracking-widest transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-5 py-2.5 rounded-full bg-neutral-900 text-white text-[11px] font-black
                         uppercase tracking-widest hover:bg-neutral-800 transition-all duration-300
                         hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.35)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign up
            </Link>
          </motion.div>
        </nav>

        <button
          type="button"
          className="md:hidden p-2.5 rounded-xl text-neutral-900 hover:bg-neutral-900/5 transition-colors"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Menu"
          aria-expanded={mobileOpen}
        >
          <div className="flex flex-col gap-[5px] w-5">
            <span className={`block h-0.5 bg-current origin-center transition-all duration-300 ${mobileOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block h-0.5 bg-current origin-center transition-all duration-300 ${mobileOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </div>
        </button>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: easeOut }}
            className="fixed top-[3.75rem] inset-x-0 z-40 overflow-hidden md:hidden
                       bg-[#f8f6f2]/98 backdrop-blur-xl border-b border-neutral-200/80"
          >
            <div className="px-6 py-6 flex flex-col gap-1">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="py-3 text-sm font-bold text-neutral-700 border-b border-neutral-100 last:border-0"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-2">
                <Link href="/auth/sign-in" className="py-3 text-sm font-bold text-neutral-700" onClick={() => setMobileOpen(false)}>
                  Sign in
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="py-3.5 rounded-xl bg-neutral-900 text-white text-sm font-black text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════ HERO ══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex flex-col items-center justify-center
                   overflow-hidden pt-[3.75rem]"
      >
        <HeroBackground reduceMotion={!!reduceMotion} />

        <div className="pointer-events-none absolute inset-0 flex items-end justify-center overflow-hidden select-none z-[1]">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="font-display text-[clamp(4rem,16vw,14rem)] font-bold leading-[0.85]
                       text-neutral-900/[0.04] whitespace-nowrap tracking-tighter pb-[8vh]"
          >
            CONVIVIA24
          </motion.span>
        </div>

        <motion.div
          style={{ y: reduceMotion ? 0 : heroContentY, opacity: reduceMotion ? 1 : heroOpacity }}
          className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center flex flex-col items-center"
        >
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center"
          >
            <motion.span
              variants={fadeUpItem}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full
                         border border-gold/35 bg-white/60 backdrop-blur-md
                         shadow-[0_4px_24px_-4px_rgba(201,168,76,0.25)]
                         text-[10px] font-black uppercase tracking-[0.28em] text-gold-dark mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-gold opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
              </span>
              From conception to 1M+ customer reach
            </motion.span>

            <motion.h1
              variants={fadeUpItem}
              className="font-display text-[clamp(2.75rem,7vw,6.25rem)] font-bold leading-[1.02]
                         tracking-tight text-neutral-900 text-balance"
            >
              Activate your brand.
              <br />
              <span className="relative inline-block mt-1">
                <em className="not-italic text-gold">Prove</em>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.55, duration: 0.9, ease: easeOut }}
                />
              </span>{' '}
              every naira.
            </motion.h1>

            <motion.p
              variants={fadeUpItem}
              className="mt-7 text-base sm:text-xl text-neutral-600 leading-relaxed max-w-2xl text-balance"
            >
              Convivia24 takes FMCG brands from a blank campaign brief to verified field agents,
              live check-in data, and a 1&nbsp;million-consumer footprint — on one platform.
            </motion.p>

            <motion.div variants={fadeUpItem} className="mt-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full
                           bg-neutral-900 text-white text-[12px] font-black uppercase tracking-widest
                           shadow-[0_12px_40px_-8px_rgba(0,0,0,0.45)] hover:bg-neutral-800
                           transition-colors duration-300"
              >
                Grow your brand <ArrowRight size={14} />
              </motion.a>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full
                             border-2 border-neutral-300/80 bg-white/50 backdrop-blur-sm
                             text-[12px] font-black uppercase tracking-widest text-neutral-800
                             hover:border-gold/50 hover:bg-white transition-all duration-300"
                >
                  Sign up
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeUpItem}
              className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-3
                         px-6 py-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60
                         shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]"
            >
              {TRUST.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-2 text-[10px] font-semibold text-neutral-500">
                  <Icon size={12} className="text-gold shrink-0" />
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.a
          href="#platform"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1
                     text-neutral-400 hover:text-gold-dark transition-colors"
          aria-label="Scroll to explore"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.35em]">Explore</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
            <ChevronDown size={22} />
          </motion.div>
        </motion.a>
      </section>

      <Ticker />

      {/* ══════════════════════════ STATS ═════════════════════════════════════ */}
      <section className="relative py-2 px-5 sm:px-8 -mt-6 z-20">
        <div className="max-w-5xl mx-auto rounded-3xl bg-white/90 backdrop-blur-xl
                        border border-neutral-200/80 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.12)]
                        overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <StatBlock key={s.label} {...s} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ GROWTH ARC ════════════════════════════════ */}
      <section className="bg-[#f8f6f2] py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-20">
            <SectionLabel>The growth arc</SectionLabel>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-neutral-900 leading-tight text-balance">
              Conception to
              <br />
              <span className="bg-gradient-to-r from-gold-dark via-gold to-gold-dark bg-clip-text text-transparent">
                1 million customers.
              </span>
            </h2>
            <p className="mt-5 text-neutral-500 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
              Every brand activation has four phases. We built the platform that powers all of them.
            </p>
          </FadeUp>

          <div className="relative">
            <motion.div
              className="hidden lg:block absolute top-[3.5rem] left-[12.5%] right-[12.5%] h-0.5 origin-left bg-gradient-to-r from-gold/20 via-gold to-gold/20"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: easeOut, delay: 0.2 }}
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {GROWTH_STAGES.map(({ icon: Icon, phase, title, body, stat }, i) => (
                <FadeUp key={title} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className="flex flex-col h-full p-6 rounded-3xl bg-white/60 border border-neutral-100/80
                               hover:bg-white hover:shadow-[0_20px_50px_-16px_rgba(201,168,76,0.12)]
                               transition-shadow duration-400"
                  >
                    <motion.div
                      className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-[#f5f0e8]
                                 border-2 border-gold/25 flex items-center justify-center mb-6
                                 shadow-[0_0_0_8px_#f8f6f2]"
                      whileHover={{ scale: 1.08, borderColor: 'rgba(201,168,76,0.5)' }}
                    >
                      <Icon size={22} className="text-gold-dark" />
                    </motion.div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold-dark mb-1">{phase}</p>
                    <h3 className="font-display text-2xl font-bold text-neutral-900 mb-3">{title}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed flex-1">{body}</p>
                    <div className="mt-5 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full
                                    bg-gold/10 text-[10px] font-black uppercase tracking-widest text-gold-dark self-start">
                      {stat}
                    </div>
                  </motion.div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ BOLD STATEMENT ════════════════════════════ */}
      <section className="bg-neutral-900 py-20 sm:py-28 px-5 sm:px-8 overflow-hidden relative">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(201,168,76,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.06) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <motion.div
          className="pointer-events-none absolute -top-32 right-0 w-[500px] h-[500px] rounded-full
                     bg-gold/10 blur-[100px]"
          animate={reduceMotion ? undefined : { opacity: [0.3, 0.55, 0.3], x: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <FadeUp className="relative z-10 max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-14">
            <div className="flex-1 text-center lg:text-left">
              <SectionLabel>
                <span className="text-gold">The Convivia24 difference</span>
              </SectionLabel>
              <p className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white leading-[1.1] text-balance">
                Most agencies give you a recap on slide 47.
                <br />
                <em className="not-italic text-gold">We give you the data while the activation is still running.</em>
              </p>
            </div>
            <motion.ul
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              className="flex-shrink-0 flex flex-col gap-4 w-full lg:w-64"
            >
              {[
                'Live check-in dashboard',
                'Redemption tracking',
                'UGC photo wall',
                'Compliance audit trail',
                'Post-event PDF report',
              ].map(item => (
                <motion.li key={item} variants={fadeUpItem} className="flex items-center gap-3">
                  <CheckCircle2 size={15} className="text-gold shrink-0" />
                  <span className="text-sm text-white/75 font-medium">{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </FadeUp>
      </section>

      {/* ══════════════════════════ PLATFORM FEATURES ══════════════════════════ */}
      <section id="platform" className="bg-white py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <SectionLabel>Platform</SectionLabel>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-neutral-900">
              Everything in one place
            </h2>
            <p className="mt-4 text-neutral-500 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
              Campaign setup, field ops, UGC, compliance, and reporting — no duct tape.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-3xl overflow-hidden">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ FOR BRANDS ══════════════════════════════════ */}
      <section id="for-brands" className="bg-[#f8f6f2] py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <SectionLabel>For brands</SectionLabel>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-neutral-900 leading-tight text-balance">
              Six things we promise
              <br />
              every brand we work with.
            </h2>
            <p className="mt-5 text-neutral-500 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
              We&apos;re not a vendor. We&apos;re an activation partner — and we put our commitments in writing.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMMITMENTS.map(({ icon: Icon, title, body }, i) => (
              <FadeUp key={title} delay={i * 0.07}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                  className="landing-card-shine bg-white rounded-3xl p-8 h-full border border-neutral-100/90
                             shadow-[0_4px_24px_rgba(0,0,0,0.04)]
                             hover:shadow-[0_24px_48px_-12px_rgba(201,168,76,0.18)]
                             hover:border-gold/20 transition-[box-shadow,border-color] duration-400 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f5f0e8] to-white
                                  flex items-center justify-center mb-6 border border-gold/10
                                  group-hover:border-gold/30 transition-colors">
                    <Icon size={22} className="text-gold-dark" />
                  </div>
                  <h3 className="font-bold text-neutral-900 text-base mb-3 leading-snug">{title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{body}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ STAFFING ══════════════════════════════════ */}
      <section id="staffing" className="bg-neutral-900 py-24 sm:py-32 px-5 sm:px-8 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(201,168,76,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.05) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="pointer-events-none absolute top-0 right-0 w-[420px] h-[420px]
                        bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.14)_0%,transparent_60%)]" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-4">Hospitality staffing</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
                Nigeria&apos;s fastest
                <br />
                <em className="not-italic text-gold">hospitality hire.</em>
              </h2>
              <p className="text-white/55 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                Waiters, bartenders, kitchen staff, and events crew — verified, background-checked,
                and available same day. Outlets post a shift and workers apply within minutes.
              </p>
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full
                           bg-gold text-white text-[12px] font-black uppercase tracking-widest
                           shadow-[0_12px_36px_-8px_rgba(201,168,76,0.5)] hover:bg-gold-light transition-colors"
              >
                Get in touch <ArrowRight size={14} />
              </motion.a>
            </FadeUp>

            <FadeUp delay={0.12}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { role: 'Waiters & Servers', cities: 'Lagos · Abuja · PH', icon: Users },
                  { role: 'Bartenders', cities: 'Lagos · Abuja · PH', icon: Sparkles },
                  { role: 'Kitchen Staff', cities: 'Lagos · Abuja · PH', icon: Zap },
                  { role: 'Events Crew', cities: 'Lagos · Abuja · PH', icon: Star },
                ].map(({ role, cities, icon: Icon }, i) => (
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: easeOut }}
                    whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    className="bg-white/[0.06] rounded-2xl border border-white/[0.08] p-5 backdrop-blur-sm"
                  >
                    <Icon size={18} className="text-gold mb-3" />
                    <p className="font-bold text-white text-sm leading-snug mb-1">{role}</p>
                    <p className="text-[10px] text-white/45 font-medium">{cities}</p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-5">
                {[
                  { v: 'Same-day hire', i: Zap },
                  { v: 'Same-day payout', i: CheckCircle2 },
                  { v: 'Background-checked', i: Shield },
                ].map(({ v, i: Icon }) => (
                  <span key={v} className="flex items-center gap-2 text-[11px] font-semibold text-white/45">
                    <Icon size={11} className="text-gold" />
                    {v}
                  </span>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ CITIES ════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-gold-dark via-gold to-gold py-16 px-5 sm:px-8 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          animate={reduceMotion ? undefined : { x: [0, 12, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <FadeUp>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-2">Active markets</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">3 cities. 1M+ consumers.</h2>
          </FadeUp>
          <FadeUp delay={0.1} className="flex flex-wrap gap-8">
            {['Lagos', 'Abuja', 'Port Harcourt'].map((city, i) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: easeOut }}
                className="flex items-center gap-2.5"
              >
                <MapPin size={16} className="text-white/80" />
                <span className="text-lg font-bold text-white">{city}</span>
              </motion.div>
            ))}
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════ TESTIMONIALS ══════════════════════════════ */}
      <section className="bg-white py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-14">
            <SectionLabel>Brand results</SectionLabel>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-neutral-900">Proof in the field</h2>
          </FadeUp>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                quote:
                  "We ran a sampling activation at three Lagos malls simultaneously. The dashboard showed us real-time numbers — we'd never had visibility like that before.",
                name: 'Adaeze O.',
                role: 'Brand Manager, FMCG',
              },
              {
                quote:
                  'The 18+ gate and consent flow saved us from a compliance headache. Our legal team approved in 24 hours. That never happens with other agencies.',
                name: 'Tunde A.',
                role: 'Trade Marketing Lead',
              },
            ].map(({ quote, name, role }, i) => (
              <FadeUp key={name} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-[#f8f6f2] rounded-3xl p-8 sm:p-10 h-full border border-neutral-100
                             hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.08)] transition-shadow duration-400"
                >
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={14} className="text-gold fill-gold" />
                    ))}
                  </div>
                  <p className="text-neutral-700 leading-relaxed text-[15px] sm:text-base mb-6">&ldquo;{quote}&rdquo;</p>
                  <div className="border-t border-neutral-200/80 pt-5">
                    <p className="font-bold text-neutral-900 text-sm">{name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{role}</p>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ CONTACT ══════════════════════════════════ */}
      <section id="contact" className="bg-[#f8f6f2] py-24 sm:py-32 px-5 sm:px-8 border-t border-neutral-200/60">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-16 items-start">
            <div className="lg:sticky lg:top-28">
              <FadeUp>
                <SectionLabel>Get in touch</SectionLabel>
                <h2 className="font-display text-4xl sm:text-5xl font-bold text-neutral-900 leading-tight mb-6">
                  Let&apos;s build your
                  <br />
                  next big
                  <br />
                  <span className="text-gold">activation.</span>
                </h2>
                <p className="text-neutral-500 text-base sm:text-lg leading-relaxed mb-10 max-w-sm">
                  Tell us about your brand, campaign goals, and timeline.
                  We&apos;ll come back with a tailored activation strategy within 48 hours.
                </p>

                <div className="space-y-5 mb-10">
                  {[
                    { n: '01', t: 'Your inquiry is reviewed by a human specialist.' },
                    { n: '02', t: 'We respond with a tailored brief within 48h.' },
                    { n: '03', t: 'We align on strategy, cities, and timeline.' },
                    { n: '04', t: 'We go live — and you watch ROI in real time.' },
                  ].map(({ n, t }, i) => (
                    <motion.div
                      key={n}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.45, ease: easeOut }}
                      className="flex items-start gap-4"
                    >
                      <span className="text-[10px] font-black text-gold shrink-0 mt-0.5 tabular-nums">{n}</span>
                      <p className="text-sm text-neutral-600">{t}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-gold opacity-50 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400">
                    Lagos · Abuja · Port Harcourt
                  </span>
                </div>
              </FadeUp>
            </div>

            <FadeUp delay={0.15}>
              <AnimatePresence mode="wait">
                {formSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.45, ease: easeOut }}
                    className="bg-white rounded-3xl border border-neutral-100 p-12 text-center
                               shadow-[0_8px_40px_-8px_rgba(201,168,76,0.2)]"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle2 size={28} className="text-gold" />
                    </motion.div>
                    <h3 className="font-display text-3xl font-bold text-neutral-900 mb-3">We&apos;ll be in touch.</h3>
                    <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
                      Received — a specialist will reply with a tailored activation brief within 48 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormSuccess(false)}
                      className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gold hover:text-gold-dark transition-colors"
                    >
                      Send another <ArrowRight size={12} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-white rounded-3xl border border-neutral-100 p-8 sm:p-10
                               shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]"
                  >
                    <motion.div
                      className="h-1 w-20 bg-gradient-to-r from-gold-dark via-gold to-gold-light rounded-full mb-8"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: easeOut }}
                      style={{ transformOrigin: 'left' }}
                    />

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 block mb-2">
                            Your name
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            placeholder="Full name"
                            className="w-full bg-[#f8f6f2] border border-neutral-200 rounded-xl px-4 py-3.5
                                       text-sm text-neutral-900 placeholder-neutral-400
                                       focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 block mb-2">
                            Company
                          </label>
                          <input
                            type="text"
                            value={company}
                            onChange={e => setCompany(e.target.value)}
                            placeholder="Brand or agency"
                            className="w-full bg-[#f8f6f2] border border-neutral-200 rounded-xl px-4 py-3.5
                                       text-sm text-neutral-900 placeholder-neutral-400
                                       focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 block mb-2">
                          Work email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          placeholder="you@brand.com"
                          className="w-full bg-[#f8f6f2] border border-neutral-200 rounded-xl px-4 py-3.5
                                     text-sm text-neutral-900 placeholder-neutral-400
                                     focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 block mb-2">
                          What are you looking for?
                        </label>
                        <select
                          value={inquiryType}
                          onChange={e => setInquiryType(e.target.value)}
                          required
                          className="w-full bg-[#f8f6f2] border border-neutral-200 rounded-xl px-4 py-3.5
                                     text-sm text-neutral-900
                                     focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition appearance-none"
                        >
                          <option value="">Select a topic</option>
                          {INQUIRY_TYPES.map(t => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 block mb-2">
                          Tell us about your goals
                        </label>
                        <textarea
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          required
                          rows={5}
                          placeholder="Campaign goals, target audience, cities, timeline…"
                          className="w-full bg-[#f8f6f2] border border-neutral-200 rounded-xl px-4 py-3.5
                                     text-sm text-neutral-900 placeholder-neutral-400
                                     focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition resize-none"
                        />
                      </div>

                      {formError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-600 text-xs font-medium"
                        >
                          {formError}
                        </motion.p>
                      )}

                      <motion.button
                        type="submit"
                        disabled={formLoading}
                        whileHover={formLoading ? undefined : { scale: 1.01 }}
                        whileTap={formLoading ? undefined : { scale: 0.98 }}
                        className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl
                                   bg-neutral-900 text-white text-[12px] font-black uppercase tracking-widest
                                   hover:bg-neutral-800 transition-colors disabled:opacity-60
                                   shadow-[0_8px_28px_-8px_rgba(0,0,0,0.35)]"
                      >
                        {formLoading ? 'Sending…' : (
                          <>
                            <span>Send inquiry</span>
                            <ArrowRight size={13} />
                          </>
                        )}
                      </motion.button>

                      <p className="text-center text-[10px] text-neutral-400 uppercase tracking-widest">
                        48h response · no obligation
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ FOOTER ════════════════════════════════════ */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-neutral-950 px-5 sm:px-10 py-12 border-t border-white/5"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <BrandLogo alt="Convivia24" className="h-7 w-auto brightness-0 invert opacity-50 hover:opacity-70 transition-opacity" />
          <div className="flex flex-wrap justify-center gap-6 text-[11px] text-white/35">
            <Link href="/auth/sign-in" className="hover:text-white/80 transition-colors">
              Sign in
            </Link>
            <Link href="/auth/sign-up" className="hover:text-white/80 transition-colors">
              Sign up
            </Link>
            <a href="mailto:support@convivia24.com" className="hover:text-white/80 transition-colors">
              Contact
            </a>
          </div>
          <p className="text-[10px] text-white/25">© 2025 Convivia24</p>
        </div>
      </motion.footer>
    </div>
  );
}
