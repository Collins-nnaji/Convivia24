'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Target, Zap, Users, Network, BarChart2, CheckCircle } from 'lucide-react';

/* ── Animated Counter ─────────────────────────────────────────── */
function AnimatedCounter({ target, decimals = 0, prefix = '', suffix = '' }: { target: number; decimals?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const steps = duration / 16;
    const step = target / steps;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? count.toFixed(decimals) : Math.round(count)}{suffix}
    </span>
  );
}

/* ── Ticker Tape ──────────────────────────────────────────────── */
const TICKER_ITEMS = [
  'Revenue Doesn\'t Sleep',
  'Pipeline Managed 24/7',
  'Always On · Always Closing',
  'Your Network Is Your Net Worth — We Unlock It',
  'Cold Leads Become Closed Deals',
  'Pipeline Health · Sales Architecture · Execution',
  'We Connect You to the Right People',
  '47 Clients · 6 Industries · Zero Excuses',
];

function TickerTape() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-y border-red-700/20 bg-red-700 py-2.5">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-8 text-[11px] font-black uppercase tracking-[0.18em] text-white/90">
            {item}
            <span className="text-white/40">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Rotating Logo ────────────────────────────────────────────── */
function RotatingLogo() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ring pulse */}
      <motion.div
        className="absolute w-48 h-48 rounded-full border border-red-700/20"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.1, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-36 h-36 rounded-full border border-red-700/30"
        animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.05, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      <motion.img
        src="/Logo2.png"
        alt="Convivia24"
        className="w-28 h-28 object-contain relative z-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
      />
      {/* Always On badge */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-red-700 text-white text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap shadow-lg">
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        Always On
      </div>
    </div>
  );
}

/* ── Data ─────────────────────────────────────────────────────── */
const pillars = [
  {
    num: '01', label: 'DIAGNOSE', headline: 'The Sales Audit',
    desc: 'We expose exactly where your pipeline leaks, why deals stall, and which prospects are worth pursuing. No guesswork.',
    icon: Target, iconBg: 'bg-red-700', iconColor: 'text-white',
    metric: '+340%', metricLabel: 'avg pipeline velocity',
    tag: 'We find what\'s broken',
  },
  {
    num: '02', label: 'CONNECT', headline: 'The Network',
    desc: 'After auditing, we connect you to a vetted network of buyers, partners, and decision-makers — people your competition can\'t reach.',
    icon: Network, iconBg: 'bg-zinc-900', iconColor: 'text-white',
    metric: '3.2×', metricLabel: 'more qualified introductions',
    tag: 'We open the right doors',
  },
  {
    num: '03', label: 'EXECUTE', headline: 'The 24 Cycle',
    desc: 'We manage your full pipeline 24 hours a day — outreach, follow-up, and close — so no lead goes cold and no opportunity goes missed.',
    icon: Zap, iconBg: 'bg-red-700', iconColor: 'text-white',
    metric: '94%', metricLabel: 'client retention rate',
    tag: 'We run it around the clock',
  },
];

const painPoints = [
  { icon: '📉', label: 'Sales cycles that never seem to close', fix: 'We cut cycle time by 60% average' },
  { icon: '🧊', label: 'Cold leads that just sit in your CRM', fix: 'We revive and qualify your pipeline' },
  { icon: '🚪', label: 'No access to the right decision-makers', fix: 'We connect you through our network' },
  { icon: '🔁', label: 'Inconsistent follow-up killing warm deals', fix: 'We run structured 24h cadences' },
  { icon: '📊', label: 'No visibility into pipeline health', fix: 'We give you live diagnostics' },
  { icon: '📋', label: 'Team without a repeatable sales playbook', fix: 'We build one — then run it for you' },
];

const proofStats = [
  { value: 340, suffix: '%', label: 'Pipeline velocity increase', icon: TrendingUp },
  { value: 47, suffix: '+', label: 'Clients actively managed', icon: Users },
  { value: 94, suffix: '%', label: 'Client retention rate', icon: CheckCircle },
  { value: 60, suffix: '%', label: 'Shorter sales cycles', icon: BarChart2 },
];

/* ── Page ─────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="pt-24 pb-0 px-6 bg-white relative overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(185,28,28,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(185,28,28,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />
        {/* Red corner wash */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-red-700/[0.06] to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-center min-h-[78vh]">

            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="pb-16 lg:pb-24"
            >
              {/* Live badge */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-700 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-7"
              >
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Sales Management · Always On
              </motion.div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-zinc-900 mb-6">
                Your Pipeline<br />
                <span className="text-red-700 italic">Doesn&apos;t Rest.</span><br />
                <span className="text-zinc-400">Neither Do We.</span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-500 leading-relaxed max-w-xl mb-4">
                Struggling to grow sales volumes, manage your pipeline, or reach the right buyers?
              </p>
              <p className="text-lg md:text-xl text-zinc-900 font-semibold leading-relaxed max-w-xl mb-9">
                We audit your sales operation, connect you to our network of decision-makers, and manage your revenue cycle 24 hours a day — until results show up.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link
                  href="/audit"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-red-700 text-white text-sm font-black uppercase tracking-[0.15em] hover:bg-red-800 transition-colors group"
                >
                  Get Your Free Sales Audit
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/collective"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-zinc-200 text-zinc-700 text-sm font-black uppercase tracking-[0.15em] hover:border-zinc-900 hover:text-zinc-900 transition-colors"
                >
                  See How We Work
                </Link>
              </div>

              {/* Mini metric row */}
              <div className="flex items-center gap-8 border-t-2 border-red-700/10 pt-7">
                {[
                  { target: 340, suffix: '%', label: 'Pipeline velocity' },
                  { target: 47, suffix: '+', label: 'Active clients' },
                  { target: 94, suffix: '%', label: 'Retention rate' },
                ].map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <p className="text-3xl font-black text-zinc-900 leading-none">
                      <AnimatedCounter target={m.target} suffix={m.suffix} />
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 mt-1">{m.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — rotating logo panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="hidden lg:flex flex-col items-center gap-8 self-center pb-16"
            >
              <RotatingLogo />

              <div className="w-full space-y-3 mt-2">
                {[
                  'Clear pipeline diagnostics before anything else',
                  'Connected to buyers through our private network',
                  '24-hour operating rhythm from audit to close',
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.12 }}
                    className="flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-100"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-red-700 flex-shrink-0" />
                    <p className="text-sm text-zinc-700 leading-snug">{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Ticker Tape ───────────────────────────────────────── */}
      <TickerTape />

      {/* ── Pain Points (Who We Help) ─────────────────────────── */}
      <section className="py-20 px-6 bg-zinc-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-700" />
        {/* Ghost text */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none select-none opacity-[0.03]">
          <span className="text-[18rem] font-black text-white leading-none">?</span>
        </div>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 mb-3">Sound Familiar?</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight">
              If your sales are<br />
              <span className="text-red-500 italic">stuck</span> — we know why.
            </h2>
            <p className="text-zinc-400 text-base max-w-2xl mt-4 leading-relaxed">
              Every company we&apos;ve worked with faced at least one of these. Most faced all of them. Here&apos;s what we fix — and how.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {painPoints.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group p-5 border border-zinc-800 hover:border-red-700/50 transition-all duration-200 bg-zinc-900 hover:bg-zinc-800/60"
              >
                <span className="text-2xl mb-3 block">{p.icon}</span>
                <p className="text-sm font-semibold text-zinc-300 mb-2 leading-snug">{p.label}</p>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-700 flex-shrink-0" />
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider">{p.fix}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-10"
          >
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 px-8 py-4 bg-red-700 text-white text-sm font-black uppercase tracking-[0.15em] hover:bg-red-600 transition-colors group"
            >
              Start with a Free Audit
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Three Pillars ─────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-t border-red-200 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(185,28,28,0.035) 0px, rgba(185,28,28,0.035) 1px, transparent 1px, transparent 60px)'
          }}
        />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-700 mb-3">How We Work</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 leading-tight">
              Audit. Connect. Execute.<br />
              <span className="text-red-700 italic">24 hours a day.</span>
            </h2>
            <p className="text-zinc-500 text-base max-w-2xl mt-4 leading-relaxed">
              We don&apos;t just give you a report. We plug into your operation — connecting you to our network, building your sales system, and running execution continuously.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-0 border border-zinc-200">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15, duration: 0.5 }}
                  className={`p-8 relative ${idx < 2 ? 'border-r border-zinc-200' : ''} group hover:bg-red-700/[0.02] transition-colors`}
                >
                  {/* Number watermark */}
                  <p className="absolute top-4 right-5 text-7xl font-black text-zinc-100 leading-none select-none group-hover:text-red-700/10 transition-colors">
                    {pillar.num}
                  </p>
                  {/* Top accent line */}
                  <motion.div
                    className="absolute top-0 left-0 h-1 bg-red-700"
                    initial={{ width: 0 }}
                    whileInView={{ width: idx === 0 ? '100%' : '0%' }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.2, duration: 0.6 }}
                  />
                  <motion.div
                    className="absolute top-0 left-0 h-1 bg-red-700"
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.2, duration: 0.6 }}
                  />

                  <div className={`w-12 h-12 ${pillar.iconBg} flex items-center justify-center ${pillar.iconColor} mb-6 relative z-10`}>
                    <Icon size={22} />
                  </div>

                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-700 mb-2 relative z-10">{pillar.label}</p>
                  <h3 className="text-2xl font-black text-zinc-900 mb-3 relative z-10">{pillar.headline}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-6 relative z-10">{pillar.desc}</p>

                  {/* Tag */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-700 text-[10px] font-black uppercase tracking-[0.15em] mb-6 relative z-10">
                    <span className="w-1 h-1 rounded-full bg-red-700" />
                    {pillar.tag}
                  </div>

                  <div className="border-t border-zinc-100 pt-5 relative z-10">
                    <p className="text-3xl font-black text-zinc-900 leading-none">{pillar.metric}</p>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 mt-1">{pillar.metricLabel}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Link href="/collective" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-red-700 transition-colors">
              Full methodology <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Proof Numbers ─────────────────────────────────────── */}
      <section className="py-20 px-6 bg-zinc-50 border-t border-red-200 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-700 mb-3">The Numbers</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900">
              Results that speak<br />for themselves.
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200">
            {proofStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 flex flex-col gap-4"
                >
                  <div className="w-10 h-10 bg-red-700/10 flex items-center justify-center">
                    <Icon size={18} className="text-red-700" />
                  </div>
                  <div>
                    <p className="text-4xl font-black text-zinc-900 leading-none">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mt-2">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 24-Hour Cycle ─────────────────────────────────────── */}
      <section className="py-20 px-6 bg-zinc-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-700" />
        {/* Ghost 24 */}
        <div className="absolute -right-8 top-0 bottom-0 flex items-center pointer-events-none select-none opacity-[0.04]">
          <span className="text-[22rem] font-black text-white leading-none">24</span>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 mb-3">Always On</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight mb-5">
                While you sleep,<br />
                <span className="text-red-500 italic">we&apos;re closing.</span>
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed mb-8 max-w-lg">
                Revenue doesn&apos;t pause at 5pm. Our team runs a continuous three-phase cycle — analytics, outreach, and close — every single day. No cold leads. No missed follow-ups. No excuses.
              </p>
              <p className="text-white font-black text-lg mb-2">
                &ldquo;We&apos;re the sales team that never clocks out.&rdquo;
              </p>
              <p className="text-zinc-600 text-sm">— Convivia24 Operating Principle</p>
            </motion.div>

            <div className="space-y-0">
              {[
                { hour: '00 — 08', phase: 'Analytics & Insights', desc: 'Pipeline reviewed. Data scored. Opportunities ranked. You wake up to a prioritised hit-list.' },
                { hour: '08 — 16', phase: 'Outreach & Follow-Up', desc: 'Active outreach, warm-up sequences, and structured follow-up cadences across your entire pipeline.' },
                { hour: '16 — 24', phase: 'Closing & Reporting', desc: 'Deals pushed to close. Day-end reporting delivered. Network introductions logged. Cycle repeats.' },
              ].map((phase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="border-b border-zinc-800 last:border-0 py-7 pl-6 border-l-2 border-l-red-700"
                >
                  <p className="text-2xl font-black text-red-500 leading-none mb-1">{phase.hour}</p>
                  <p className="text-base font-black text-white mb-2">{phase.phase}</p>
                  <p className="text-sm text-zinc-500 leading-relaxed">{phase.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Network Section ───────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-t border-red-200 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(185,28,28,0.04) 0px, rgba(185,28,28,0.04) 1px, transparent 1px, transparent 64px)'
          }}
        />
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — network visual */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Network dot grid */}
              <div className="relative h-64 bg-zinc-900 p-8 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(circle, rgba(185,28,28,0.15) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }} />
                {/* Animated connection lines */}
                {[
                  { x1: '20%', y1: '30%', x2: '50%', y2: '50%', delay: 0 },
                  { x1: '80%', y1: '20%', x2: '50%', y2: '50%', delay: 0.3 },
                  { x1: '70%', y1: '75%', x2: '50%', y2: '50%', delay: 0.6 },
                  { x1: '15%', y1: '70%', x2: '50%', y2: '50%', delay: 0.9 },
                ].map((line, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-0 left-0 w-full h-full"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: line.delay, duration: 0.5 }}
                  >
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <motion.line
                        x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                        stroke="rgba(185,28,28,0.5)" strokeWidth="0.5"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: line.delay + 0.2, duration: 0.8 }}
                      />
                    </svg>
                  </motion.div>
                ))}
                {/* Center node */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-10 h-10 bg-red-700 flex items-center justify-center"
                  >
                    <Network size={18} className="text-white" />
                  </motion.div>
                </div>
                {/* Outer nodes */}
                {[
                  { top: '25%', left: '15%', label: 'Buyers' },
                  { top: '15%', left: '75%', label: 'Partners' },
                  { top: '68%', left: '65%', label: 'Decision-Makers' },
                  { top: '65%', left: '10%', label: 'Investors' },
                ].map((node, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.2, type: 'spring' }}
                    className="absolute"
                    style={{ top: node.top, left: node.left }}
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <p className="text-[8px] text-zinc-400 font-semibold uppercase tracking-wider mt-1 whitespace-nowrap">{node.label}</p>
                  </motion.div>
                ))}
                <p className="absolute bottom-4 right-4 text-[9px] text-zinc-600 font-semibold uppercase tracking-widest">Convivia Network</p>
              </div>
            </motion.div>

            {/* Right — copy */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-700 mb-3">The Network Advantage</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 leading-tight mb-5">
                Your next deal is<br />
                <span className="text-red-700 italic">one introduction away.</span>
              </h2>
              <p className="text-zinc-500 text-base leading-relaxed mb-6">
                After auditing your sales operation, we don&apos;t just hand you a roadmap. We open doors. Convivia24 connects clients to a private network of vetted buyers, partners, and decision-makers across multiple industries and markets.
              </p>
              <p className="text-zinc-900 font-semibold text-base leading-relaxed mb-8">
                No cold outreach. No spray-and-pray. The right people, at the right time, with context on your business.
              </p>
              <div className="space-y-3">
                {[
                  'Network across Lagos, Abuja, and London markets',
                  'Warm introductions to qualified decision-makers',
                  'Partner and channel development support',
                  '3.2× more qualified introductions vs cold outreach',
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-4 h-4 bg-red-700 flex items-center justify-center flex-shrink-0">
                      <ArrowRight size={9} className="text-white" />
                    </div>
                    <p className="text-sm text-zinc-700">{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 47 Clients / Industries ───────────────────────────── */}
      <section className="py-20 px-6 bg-zinc-50 border-t border-red-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-700 mb-3">Client Portfolio</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 leading-tight mb-5">
                <AnimatedCounter target={47} suffix="+" /> clients.<br />
                <AnimatedCounter target={6} /> industries.<br />
                <span className="text-red-700 italic">One standard.</span>
              </h2>
              <p className="text-zinc-500 text-base leading-relaxed max-w-xl">
                We support B2B technology, financial services, retail, professional services, and fast-growing operators across West Africa and the UK. Every client gets the same obsessive, around-the-clock approach.
              </p>
            </motion.div>

            <div className="grid grid-cols-3 gap-px bg-zinc-200">
              {[
                { value: 94, suffix: '%', label: 'Retention rate' },
                { value: 68, suffix: '%', label: 'Hit 2× target' },
                { value: 87, suffix: '%', label: 'Renew annually' },
                { value: 60, suffix: '%', label: 'Shorter sales cycles' },
                { value: 340, suffix: '%', label: 'Avg pipeline velocity' },
                { value: 24, suffix: 'h', label: 'Audit response time' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white p-5 flex flex-col justify-between"
                >
                  <p className="text-2xl font-black text-zinc-900 leading-none">
                    <AnimatedCounter target={item.value} suffix={item.suffix} />
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-2">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-t border-red-200 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(185,28,28,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(185,28,28,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-zinc-900 p-10 md:p-16 overflow-hidden"
          >
            {/* Animated red top line */}
            <motion.div
              className="absolute top-0 left-0 h-1 bg-red-700"
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-red-700/10 to-transparent pointer-events-none" />
            {/* Ghost 24 */}
            <div className="absolute bottom-0 right-8 opacity-[0.05] select-none pointer-events-none">
              <span className="text-[10rem] font-black text-white leading-none">24</span>
            </div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400 mb-4">Next Step</p>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight mb-5">
                  Stop leaving<br />
                  <span className="text-red-500 italic">revenue on the table.</span>
                </h2>
                <p className="text-zinc-400 text-base leading-relaxed mb-8">
                  Request your free Sales Health Audit. Our team reviews every submission within 24 hours and delivers a personalised revenue roadmap — at zero cost to you.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/audit"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-red-700 text-white text-sm font-black uppercase tracking-[0.15em] hover:bg-red-600 transition-colors group"
                  >
                    Get Free Sales Audit
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/intel"
                    className="inline-flex items-center gap-2 px-8 py-4 border border-zinc-700 text-zinc-300 text-sm font-black uppercase tracking-[0.15em] hover:border-zinc-500 hover:text-white transition-colors"
                  >
                    View Intel
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { icon: '⚡', label: '24-hour response guarantee', sub: 'Every audit submission reviewed same day — no exceptions' },
                  { icon: '🔗', label: 'Network introductions included', sub: 'Connect to buyers and decision-makers after your audit' },
                  { icon: '📋', label: 'Full pipeline diagnostic, free', sub: 'Know exactly what to fix before spending a penny' },
                  { icon: '🔒', label: 'Zero commitment required', sub: 'Review your roadmap. Decide with full information.' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-4 p-4 border border-zinc-800 hover:border-red-700/40 transition-colors bg-zinc-900/50"
                  >
                    <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white">{item.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
