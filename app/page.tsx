'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Target, Zap } from 'lucide-react';

/* ─── Animated Counter ───────────────────────────────────────────── */
function AnimatedCounter({ target, decimals = 0 }: { target: number; decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const steps = duration / 16;
    const step = target / steps;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{decimals > 0 ? count.toFixed(decimals) : Math.round(count)}</span>;
}

/* ─── Sparkline ──────────────────────────────────────────────────── */
function Sparkline({ data, color = '#b91c1c' }: { data: number[]; color?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 120, h = 40;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');

  return (
    <svg ref={ref} width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <motion.polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={inView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      />
      {inView && (
        <motion.circle
          cx={pts[pts.length - 1].split(',')[0]}
          cy={pts[pts.length - 1].split(',')[1]}
          r="3"
          fill={color}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.4, duration: 0.3 }}
        />
      )}
    </svg>
  );
}

/* ─── Rotating Logo ──────────────────────────────────────────────── */
function RotatingLogo() {
  return (
    <div className="flex items-center justify-center w-full h-full py-6">
      <motion.img
        src="/Logo2.png"
        alt="Convivia24"
        className="w-36 h-36 object-contain"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

/* ─── Donut Ring ─────────────────────────────────────────────────── */
function DonutRing({ pct, color = '#b91c1c', size = 80 }: { pct: number; color?: string; size?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272a" strokeWidth="6" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${circ}`}
        strokeDashoffset={circ}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        animate={inView ? { strokeDashoffset: circ - dash } : {}}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
      />
    </svg>
  );
}

/* ─── Data ───────────────────────────────────────────────────────── */
const pillars = [
  {
    num: '01', label: 'INSIGHTS', headline: 'The Convivia',
    desc: 'We find the life in your data — identifying exactly where your next high-value win is hiding before your competitors see it.',
    bg: 'bg-white', border: 'border-t-4 border-red-700',
    numColor: 'text-zinc-100', textColor: 'text-zinc-900', descColor: 'text-zinc-500',
    icon: Target, iconBg: 'bg-red-50', iconColor: 'text-red-700',
    metric: '+340%', metricLabel: 'avg pipeline velocity',
    spark: [20, 28, 35, 42, 55, 68, 82, 95],
    sparkColor: '#b91c1c',
  },
  {
    num: '02', label: 'PLANNING', headline: 'The Blueprint',
    desc: 'We translate insights into a precision sales architecture — scripts, CRM workflows, and playbooks engineered for repeatability.',
    bg: 'bg-zinc-900', border: 'border-t-4 border-white',
    numColor: 'text-zinc-800', textColor: 'text-white', descColor: 'text-zinc-400',
    icon: TrendingUp, iconBg: 'bg-zinc-800', iconColor: 'text-white',
    metric: '60%', metricLabel: 'shorter sales cycles',
    spark: [50, 47, 43, 40, 36, 32, 28, 22],
    sparkColor: '#ffffff',
  },
  {
    num: '03', label: 'EXECUTION', headline: 'The 24',
    desc: 'Our team manages your full sales cycle around the clock — no lead goes cold, no opportunity goes missed.',
    bg: 'bg-red-700', border: 'border-t-4 border-white',
    numColor: 'text-red-600', textColor: 'text-white', descColor: 'text-red-200',
    icon: Zap, iconBg: 'bg-red-800', iconColor: 'text-white',
    metric: '94%', metricLabel: 'client retention rate',
    spark: [60, 66, 72, 76, 80, 85, 90, 94],
    sparkColor: 'rgba(255,255,255,0.8)',
  },
];

const testimonials = [
  { quote: 'Convivia24 didn\'t just advise us — they managed the entire revenue operation. Pipeline velocity increased 340% in four months.', author: 'D. Okafor', role: 'CEO, TechScale Africa', stat: '340%', statLabel: 'pipeline velocity' },
  { quote: 'We went from 60-day sales cycles to closing deals in under 3 weeks. The systematic approach is unlike anything we\'ve seen.', author: 'S. Adeyemi', role: 'VP Sales, FinServ Partners', stat: '3wk', statLabel: 'avg close time' },
  { quote: 'The always-on model is real. They operate like an extension of our team, but with the precision of a machine.', author: 'J. Ibrahim', role: 'Founder, Retail Chain Co.', stat: '95%', statLabel: 'lead follow-up rate' },
];

const industries = [
  { label: 'B2B Technology', pct: 35, clients: 17 },
  { label: 'Financial Services', pct: 25, clients: 12 },
  { label: 'Retail & Distribution', pct: 20, clients: 9 },
  { label: 'Professional Services', pct: 12, clients: 6 },
  { label: 'Other', pct: 8, clients: 3 },
];

/* ─── Animated Bar ───────────────────────────────────────────────── */
function IndustryBar({ label, pct, clients, idx }: { label: string; pct: number; clients: number; idx: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{label}</span>
        <span className="text-[10px] text-zinc-500">{clients} clients</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-1.5 bg-red-700 rounded-full"
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.1 }}
        />
      </div>
      <div className="text-right">
        <span className="text-[10px] font-black text-red-600">{pct}%</span>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="pt-32 pb-0 px-6 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-red-700/[0.03] pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-0 items-end">

            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="pb-16"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-700 text-white text-[10px] font-semibold uppercase tracking-widest mb-6">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Sales Management Firm
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.88] text-zinc-900 mb-6">
                Revenue<br />
                Doesn't{' '}
                <span className="text-red-700 italic">Sleep.</span>
              </h1>

              <p className="text-base md:text-lg text-zinc-500 leading-relaxed max-w-xl mb-8">
                Convivia24 manages the insights, planning, and execution that transform stagnant pipelines into high-velocity revenue engines.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/briefing"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-red-700 text-white text-sm font-semibold uppercase tracking-wider hover:bg-red-800 transition-colors group"
                >
                  Activate Growth
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/engine"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-zinc-300 text-zinc-700 text-sm font-semibold uppercase tracking-wider hover:border-zinc-900 hover:text-zinc-900 transition-colors"
                >
                  See the Engine
                </Link>
              </div>

              {/* Mini metric row */}
              <div className="flex items-center gap-6 border-t border-zinc-100 pt-6">
                {[
                  { v: '340', suffix: '%', l: 'Pipeline velocity' },
                  { v: '47', suffix: '+', l: 'Active clients' },
                  { v: '94', suffix: '%', l: 'Retention' },
                ].map((m, i) => (
                  <div key={i}>
                    <p className="text-xl font-black text-zinc-900">
                      <AnimatedCounter target={Number(m.v)} />{m.suffix}
                    </p>
                    <p className="text-[9px] uppercase tracking-widest text-zinc-400">{m.l}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Hero data panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block relative self-end"
            >
              <div className="flex flex-col gap-2">
                {/* Top — pipeline meter */}
                <div className="bg-zinc-900 p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-700" />
                  <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-3 pl-3">Pipeline Health — Live</p>
                  <div className="pl-3 space-y-3">
                    {[
                      { label: 'Qualified Leads', pct: 87, val: '87%' },
                      { label: 'Follow-up Rate', pct: 95, val: '95%' },
                      { label: 'Close Velocity', pct: 72, val: '72%' },
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.12 }}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest">{item.label}</span>
                          <span className="text-[9px] font-black text-red-500">{item.val}</span>
                        </div>
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-1 bg-red-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.pct}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.8 + i * 0.12 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Bottom row */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Revenue ticker */}
                  <div className="bg-zinc-900 p-4">
                    <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Revenue Managed YTD</p>
                    <p className="text-2xl font-black text-red-500">
                      ₦<AnimatedCounter target={2} />.1M+
                    </p>
                    <div className="mt-2">
                      <Sparkline data={[40, 55, 62, 78, 90, 105, 118, 130]} color="#ef4444" />
                    </div>
                  </div>
                  {/* Always on badge */}
                  <div className="bg-red-700 p-4 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-20 select-none pointer-events-none">
                      <span className="text-6xl font-black text-white leading-none">24</span>
                    </div>
                    <motion.div
                      className="w-2 h-2 bg-white rounded-full mb-2"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <p className="text-[9px] uppercase tracking-widest text-red-300 mb-0.5">Always On</p>
                    <p className="text-2xl font-black text-white leading-none">24/7</p>
                    <p className="text-[9px] text-red-300 mt-1">Execution cycle</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-zinc-900 py-8 relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-0.5 bg-red-700"
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-800">
            {[
              { value: '24/7', label: 'Management Cycle', isText: true, spark: null },
              { value: 2, suffix: 'M+', label: 'Revenue Managed', prefix: '₦', spark: [30, 45, 60, 78, 95, 118] },
              { value: 47, suffix: '', label: 'Active Clients', prefix: '', spark: [20, 25, 30, 36, 42, 47] },
              { value: 94, suffix: '%', label: 'Client Retention', prefix: '', spark: [85, 87, 89, 91, 92, 94] },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="flex flex-col items-center gap-1 px-6 py-6"
              >
                <p className="text-2xl md:text-3xl font-black text-red-500">
                  {stat.isText ? stat.value : <>{stat.prefix}<AnimatedCounter target={stat.value as number} />{stat.suffix}</>}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 text-center">{stat.label}</p>
                {stat.spark && (
                  <div className="mt-1 opacity-60">
                    <Sparkline data={stat.spark} color="#ef4444" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Revenue Growth Chart ── */}
      <section className="bg-zinc-900 py-14 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-red-500 mb-2">Live Intelligence</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight mb-3">
                  Convivia clients grow<br />
                  <span className="text-red-500">6× faster</span> than the market.
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  The chart shows aggregate managed revenue growth across our active client portfolio compared to the industry benchmark.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Avg revenue uplift', val: '340%', suffix: '' },
                    { label: 'Clients hitting 100%+ growth', val: '68', suffix: '%' },
                    { label: 'Payback period', val: '6', suffix: ' wks' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500">{item.label}</span>
                      <span className="text-lg font-black text-white">{item.val}{item.suffix}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <RotatingLogo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Three Pillars ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-red-700 mb-2">The Lifecycle</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900">
              Three pillars. One engine.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-0">
            {pillars.map((pillar, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.13, duration: 0.5 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className={`relative p-8 ${pillar.bg} ${pillar.border} overflow-hidden cursor-default`}
              >
                <p className={`absolute top-3 right-4 text-7xl font-black ${pillar.numColor} leading-none select-none`}>
                  {pillar.num}
                </p>
                <div className={`w-10 h-10 ${pillar.iconBg} flex items-center justify-center ${pillar.iconColor} mb-5`}>
                  <pillar.icon size={18} />
                </div>
                <p className={`text-[10px] font-semibold uppercase tracking-widest ${pillar.iconColor} mb-2`}>{pillar.label}</p>
                <h3 className={`text-xl font-bold ${pillar.textColor} mb-3`}>{pillar.headline}</h3>
                <p className={`${pillar.descColor} text-sm leading-relaxed mb-5`}>{pillar.desc}</p>

                {/* Micro-metric + sparkline */}
                <div className="border-t border-current/10 pt-4 flex items-end justify-between">
                  <div>
                    <p className={`text-2xl font-black ${pillar.textColor} leading-none`}>{pillar.metric}</p>
                    <p className={`text-[9px] uppercase tracking-widest ${pillar.descColor} mt-1`}>{pillar.metricLabel}</p>
                  </div>
                  <Sparkline data={pillar.spark} color={pillar.sparkColor} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6">
            <Link href="/engine" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-red-700 transition-colors">
              How the engine works <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Industry Breakdown ── */}
      <section className="py-14 px-6 bg-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-red-500 mb-2">Client Portfolio</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4 leading-tight">
                47 clients.<br />
                <span className="text-red-500">6 industries.</span>
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                From high-growth B2B technology firms to complex financial services — we manage revenue at every scale.
              </p>

              {/* Donut metrics */}
              <div className="flex gap-8">
                {[
                  { pct: 94, label: 'Retention', color: '#b91c1c' },
                  { pct: 68, label: 'Hit 2× target', color: '#ffffff' },
                  { pct: 87, label: 'Renew annually', color: '#ef4444' },
                ].map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <DonutRing pct={d.pct} color={d.color} size={72} />
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">{d.pct}%</span>
                    </div>
                    <p className="text-[9px] uppercase tracking-widest text-zinc-500 text-center">{d.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bar breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 pb-3 border-b border-zinc-800">
                Client Mix by Industry
              </p>
              {industries.map((ind, idx) => (
                <IndustryBar key={idx} {...ind} idx={idx} />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 24 Section ── */}
      <section className="bg-zinc-900 py-16 px-6 overflow-hidden relative border-t border-zinc-800">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-[22rem] font-black text-zinc-800 leading-none">24</span>
        </div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Always On</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-none">
              Hours of<br />
              <span className="text-red-500">Relentless</span> Execution.
            </h2>
            <p className="text-zinc-400 text-base max-w-md mx-auto leading-relaxed">
              Growth doesn't punch a clock. Our 24-hour cycle turns global insights into local revenue while you sleep.
            </p>

            {/* 24h progress ring */}
            <div className="flex justify-center gap-10 py-4">
              {[
                { hour: '00–08', label: 'Analytics & Insights', pct: 100 },
                { hour: '08–16', label: 'Outreach & Follow-up', pct: 100 },
                { hour: '16–24', label: 'Closing & Reporting', pct: 100 },
              ].map((phase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="relative">
                    <DonutRing pct={phase.pct} color="#b91c1c" size={60} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap size={12} className="text-red-500" />
                    </div>
                  </div>
                  <p className="text-[9px] font-black text-red-500">{phase.hour}</p>
                  <p className="text-[8px] uppercase tracking-widest text-zinc-500 text-center max-w-[70px]">{phase.label}</p>
                </motion.div>
              ))}
            </div>

            <Link
              href="/briefing"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-red-700 text-white text-sm font-semibold uppercase tracking-wider hover:bg-red-800 transition-colors"
            >
              Start Your Audit
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-red-700 mb-2">Client Results</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900">What clients say.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-6 bg-white border border-zinc-100 shadow-sm hover:shadow-lg hover:border-red-100 transition-all group"
              >
                {/* Stat callout */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl font-black text-red-700 leading-none select-none">&ldquo;</div>
                  <div className="text-right">
                    <p className="text-xl font-black text-red-700 leading-none">{t.stat}</p>
                    <p className="text-[9px] uppercase tracking-widest text-zinc-400 mt-0.5">{t.statLabel}</p>
                  </div>
                </div>
                <p className="text-zinc-600 leading-relaxed mb-5 text-sm">{t.quote}</p>
                <div className="border-t border-zinc-100 pt-4">
                  <p className="text-sm font-semibold text-zinc-900">{t.author}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Signal Strip ── */}
      <section className="px-6 py-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-zinc-100">

            {/* Left — live signal */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="col-span-2 bg-zinc-900 p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-700" />
              <div className="absolute bottom-0 right-0 opacity-5 select-none pointer-events-none">
                <span className="text-[12rem] font-black text-white leading-none">₦</span>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">Live Revenue Signal</p>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Pipeline Managed', val: '₦2.1M+', sub: 'YTD', spark: [40, 55, 70, 88, 105, 120, 130] },
                  { label: 'Deals Accelerated', val: '340%', sub: 'avg velocity uplift', spark: [20, 45, 90, 160, 220, 280, 340] },
                  { label: 'Response Time', val: '<2hrs', sub: 'avg lead response', spark: [12, 10, 8, 6, 4, 3, 2] },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.4 }}
                    className="space-y-1"
                  >
                    <p className="text-[9px] uppercase tracking-widest text-zinc-500">{item.label}</p>
                    <p className="text-2xl font-black text-white leading-none">{item.val}</p>
                    <p className="text-[9px] text-zinc-600">{item.sub}</p>
                    <div className="pt-2">
                      <Sparkline data={item.spark} color="#ef4444" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — intake signal */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-red-700 p-8 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 opacity-10 select-none pointer-events-none">
                <span className="text-[8rem] font-black text-white leading-none">Q1</span>
              </div>
              <div className="relative z-10">
                <motion.div
                  className="w-2 h-2 bg-white rounded-full mb-4"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <p className="text-[9px] uppercase tracking-widest text-red-300 mb-2">Now Accepting</p>
                <p className="text-3xl font-black text-white leading-none mb-1">Q1 '26</p>
                <p className="text-[10px] text-red-200 leading-relaxed">New client applications are open. Limited intake per quarter.</p>
              </div>
              <Link
                href="/briefing"
                className="relative z-10 mt-6 inline-flex items-center gap-2 px-5 py-3 bg-white text-red-700 text-xs font-black uppercase tracking-wider hover:bg-zinc-100 transition-colors group"
              >
                Apply Now
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-zinc-900 p-10 md:p-16 relative overflow-hidden"
          >
            {/* Animated red accent line */}
            <motion.div
              className="absolute top-0 left-0 h-1 bg-red-700"
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-700/10 to-transparent pointer-events-none" />
            {/* Big ghost text */}
            <div className="absolute bottom-0 right-6 opacity-[0.04] select-none pointer-events-none">
              <span className="text-[9rem] font-black text-white leading-none">24</span>
            </div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4"
                >
                  Next Step
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight mb-4"
                >
                  Ready to activate<br />
                  <span className="text-red-500">your growth?</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35 }}
                  className="text-zinc-400 text-sm leading-relaxed mb-8"
                >
                  Request your Sales Health Audit. Our team reviews every submission within 24 hours.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.45 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <Link
                    href="/briefing"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-red-700 text-white text-sm font-semibold uppercase tracking-wider hover:bg-red-800 transition-colors group"
                  >
                    Request Sales Audit
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    href="/performance"
                    className="inline-flex items-center gap-2 px-7 py-3.5 border border-zinc-700 text-zinc-300 text-sm font-semibold uppercase tracking-wider hover:border-zinc-400 hover:text-white transition-colors"
                  >
                    View Performance
                  </Link>
                </motion.div>
              </div>

              {/* Right — commitments */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="space-y-3"
              >
                {[
                  { icon: '⚡', label: '24-hour response', sub: 'Every submission reviewed same day' },
                  { icon: '📋', label: 'Free health assessment', sub: 'Full pipeline diagnostic at no cost' },
                  { icon: '🔒', label: 'No commitment required', sub: 'Review the roadmap before you decide' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-start gap-4 p-4 border border-zinc-800 hover:border-red-700/30 transition-colors"
                  >
                    <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white">{item.label}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
