'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, ChevronDown, Check,
  Activity, Database, Layout, Target, Network, Zap,
} from 'lucide-react';

/* ─── Animated Counter ───────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let v = 0;
    const step = target / (1600 / 16);
    const t = setInterval(() => {
      v += step;
      if (v >= target) { setCount(target); clearInterval(t); }
      else setCount(v);
    }, 16);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{Math.round(count)}{suffix}</span>;
}

/* ─── Animated bar ───────────────────────────────────────────────── */
function MetricBar({ pct, label, delay = 0 }: { pct: number; label: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-zinc-500">{label}</span>
        <span className="text-xs font-black text-red-700">{pct}%</span>
      </div>
      <div className="h-1 w-full bg-zinc-100">
        <motion.div
          className="h-1 bg-red-700"
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  );
}

/* ─── FAQ Accordion ──────────────────────────────────────────────── */
function FaqItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.06 }}
      className="border-b border-zinc-100"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
      >
        <span className="text-base font-bold text-zinc-900 group-hover:text-red-700 transition-colors">{q}</span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-zinc-400 transition-transform duration-300 ${open ? 'rotate-180 text-red-700' : ''}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <p className="text-sm text-zinc-600 leading-relaxed pb-5">{a}</p>
      </motion.div>
    </motion.div>
  );
}

/* ─── Services data ──────────────────────────────────────────────── */
const services = [
  {
    icon: Activity,
    num: '01',
    name: 'Revenue Audit',
    tagline: 'Find the leaks before you patch anything.',
    description: 'Most struggling sales teams don\'t have a motivation problem — they have a clarity problem. We run a structured, data-led assessment of your full sales operation: pipeline health, conversion rates, CRM integrity, team performance, and competitive positioning. In 5 business days, you have a clear picture of exactly what\'s blocking revenue growth.',
    deliverables: ['Pipeline health scorecard', 'Revenue gap analysis with priority ranking', 'Actionable 90-day roadmap', 'ICP and targeting blind spot report'],
    metric: '5', metricSuffix: 'd', metricLabel: 'delivery time',
    metric2: '100', metricSuffix2: '%', metricLabel2: 'of clients uncover at least 3 critical gaps',
    bars: [
      { label: 'Pipeline visibility gained', pct: 94 },
      { label: 'Revenue gaps surfaced', pct: 87 },
    ],
    dark: false,
  },
  {
    icon: Network,
    num: '02',
    name: 'Network & Introductions',
    tagline: 'The right door opened once beats 1,000 cold emails.',
    description: 'After auditing your sales situation, we connect you to a private network of qualified buyers, strategic partners, and decision-makers across our client ecosystem. These aren\'t cold contacts — they\'re warm, context-rich introductions made because we manage business on both sides of the conversation. Your next deal is one introduction away.',
    deliverables: ['Curated introductions to qualified buyers', 'Partner and channel development connections', 'Decision-maker access across Lagos, Abuja & London', 'Ongoing relationship facilitation'],
    metric: '3.2', metricSuffix: '×', metricLabel: 'more qualified meetings vs cold outreach',
    metric2: '89', metricSuffix2: '%', metricLabel2: 'of introductions lead to a meaningful meeting',
    bars: [
      { label: 'Introduction to meeting rate', pct: 89 },
      { label: 'Meeting to opportunity conversion', pct: 71 },
    ],
    dark: false,
  },
  {
    icon: Database,
    num: '03',
    name: 'Pipeline Management',
    tagline: 'Full-cycle sales execution, 24 hours a day.',
    description: 'Struggling to grow sales volumes? Deals sitting idle? Warm leads going cold because nobody followed up? We become your managed sales function — handling outreach, follow-up, objection resolution, and closing coordination in a continuous 24-hour cycle. No lead goes cold. No opportunity dies from inaction.',
    deliverables: ['24/7 outreach & structured follow-up cadences', 'Objection handling and deal acceleration', 'Weekly pipeline reviews and performance reports', 'CRM hygiene and deal stage management'],
    metric: '340', metricSuffix: '%', metricLabel: 'avg pipeline velocity uplift',
    metric2: '95', metricSuffix2: '%', metricLabel2: 'lead follow-up consistency rate',
    bars: [
      { label: 'Follow-up consistency', pct: 95 },
      { label: 'Pipeline-to-close conversion', pct: 72 },
    ],
    dark: false,
  },
  {
    icon: Layout,
    num: '04',
    name: 'Sales Architecture',
    tagline: 'Build the system that sells without you pushing it.',
    description: 'No documented playbook. No consistent process. Team performing differently every month. We design and build your complete sales infrastructure — CRM configuration, multi-touch cadence sequences, scripts, playbooks, and lead scoring — so the machine runs with or without any single person driving it.',
    deliverables: ['CRM setup, configuration & workflow automation', 'Sales scripts, email sequences & cadence design', 'Team playbook with accountability framework', 'Lead scoring model and pipeline stage definitions'],
    metric: '14', metricSuffix: 'd', metricLabel: 'average time to launch',
    metric2: '92', metricSuffix2: '%', metricLabel2: 'CRM automation rate post-build',
    bars: [
      { label: 'Process repeatability score', pct: 92 },
      { label: 'Team adoption rate', pct: 88 },
    ],
    dark: false,
  },
  {
    icon: Target,
    num: '05',
    name: 'Strategic Intelligence',
    tagline: 'Stop guessing. Start targeting.',
    description: 'We surface the intelligence that powers the right conversations — ICP mapping, account tiering, competitive positioning, and live pipeline signal monitoring. When you know exactly which accounts to prioritise and why they\'ll buy, every conversation becomes a better-qualified opportunity.',
    deliverables: ['Ideal Customer Profile (ICP) mapping & scoring', 'Account tiering and prioritisation framework', 'Competitive landscape and positioning analysis', 'Pipeline signal monitoring and alert system'],
    metric: '3.4', metricSuffix: '×', metricLabel: 'more high-value opportunities surfaced',
    metric2: '87', metricSuffix2: '%', metricLabel2: 'ICP match rate on closed deals',
    bars: [
      { label: 'Signal-to-close accuracy', pct: 84 },
      { label: 'Account targeting precision', pct: 87 },
    ],
    dark: false,
  },
];

const faqs = [
  {
    q: 'We have a sales team already. Do you replace them?',
    a: 'No. We augment and manage alongside your existing people. We handle the systematic layer — outreach cadences, CRM, pipeline management, and reporting — so your team focuses on high-value human closes. Think of us as the engine that keeps the machine moving between your team\'s conversations.',
  },
  {
    q: 'Our pipeline is stale. Can you actually revive it?',
    a: 'Yes — and it\'s often where we find the fastest wins. Stale leads are usually not dead; they\'re just poorly followed up. We run structured re-engagement sequences with new angles, and typically surface 2–4 closable deals within the first 30 days from leads clients had written off.',
  },
  {
    q: 'How does the network introductions service work?',
    a: 'After your Revenue Audit, we identify the types of buyers, partners, or decision-makers that match your ideal customer profile. We then make warm, context-aware introductions from our active client network — you show up to a meeting where both sides have been briefed. No cold calling required.',
  },
  {
    q: 'How quickly will we see results?',
    a: 'Pipeline improvement signals typically appear within 30–45 days. Revenue closes follow at 60–90 days depending on your cycle length. Our fastest client recorded a close in week three. We set baseline metrics in week one and report against them every week — you see every number.',
  },
  {
    q: 'What size of business does this work for?',
    a: 'We work with B2B companies generating ₦300K–₦10M+ in annual revenue who are ready to move from ad hoc sales to a managed, structured approach. We have clients at pre-revenue stage building their first sales system, and established firms replacing underperforming functions.',
  },
  {
    q: 'Is there a long-term commitment?',
    a: 'The Revenue Audit is a standalone 5-day engagement with no obligation to continue. Retained pipeline management requires a 3-month minimum — enough time for the full Insights → Planning → Execution cycle to produce measurable results. After that, most clients stay because the numbers speak.',
  },
];

/* ─── Page ───────────────────────────────────────────────────────── */
export default function WhatWeDoPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="pt-24 pb-0 px-6 bg-white relative overflow-hidden border-b border-zinc-200">
        {/* Grid bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(185,28,28,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(185,28,28,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '56px 56px',
          }}
        />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-red-700/[0.06] to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-end min-h-[60vh]">

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="pb-16"
            >
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-700 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-7"
              >
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                5 Services · Always On
              </motion.div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-zinc-900 mb-6">
                What We <span className="text-red-700 italic">Do.</span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-500 leading-relaxed max-w-xl mb-4">
                If your sales are stuck — volumes not growing, pipeline stalling, deals dying from inaction — this is exactly where we start.
              </p>
              <p className="text-lg md:text-xl text-zinc-900 font-semibold leading-relaxed max-w-xl mb-9">
                We audit, we connect you to the right people, and we run your pipeline 24 hours a day until the numbers move.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link
                  href="/audit"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-red-700 text-white text-sm font-black uppercase tracking-[0.15em] hover:bg-red-800 transition-colors group"
                >
                  Start with a Free Audit
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/intel"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-zinc-200 text-zinc-700 text-sm font-black uppercase tracking-[0.15em] hover:border-zinc-900 hover:text-zinc-900 transition-colors"
                >
                  See Results
                </Link>
              </div>

              {/* Mini metrics */}
              <div className="flex items-center gap-8 border-t-2 border-red-700/10 pt-7">
                {[
                  { target: 5, suffix: '', label: 'Core services' },
                  { target: 47, suffix: '+', label: 'Active clients' },
                  { target: 340, suffix: '%', label: 'Avg pipeline uplift' },
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

            {/* Right — service index */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block self-end pb-0"
            >
              <div className="border border-zinc-200 divide-y divide-zinc-100 bg-white shadow-lg shadow-zinc-200/50">
                <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-200">
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">Service Index</p>
                </div>
                {services.map((svc, i) => {
                  const Icon = svc.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="flex items-center gap-4 px-5 py-3.5 group hover:bg-red-700/[0.03] transition-colors"
                    >
                      <div className="w-7 h-7 bg-red-700/10 flex items-center justify-center flex-shrink-0 group-hover:bg-red-700 transition-colors">
                        <Icon size={13} className="text-red-700 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400">{svc.num}</p>
                        <p className="text-sm font-bold text-zinc-900 leading-tight">{svc.name}</p>
                      </div>
                      <ArrowRight size={11} className="text-zinc-300 ml-auto group-hover:text-red-700 transition-colors" />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────── */}
      {services.map((svc, idx) => {
        const Icon = svc.icon;
        const isEven = idx % 2 === 0;
        return (
          <section
            key={idx}
            className={`py-20 px-6 border-b border-zinc-200 relative overflow-hidden ${
              idx === 1 ? 'bg-zinc-900' : idx === 3 ? 'bg-zinc-50' : 'bg-white'
            }`}
          >
            {/* Section accent */}
            {idx === 1 && <div className="absolute top-0 left-0 w-full h-1 bg-red-700" />}

            {/* Background grid for alternating sections */}
            {idx !== 1 && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: isEven
                    ? 'repeating-linear-gradient(0deg, rgba(185,28,28,0.025) 0px, rgba(185,28,28,0.025) 1px, transparent 1px, transparent 64px)'
                    : 'repeating-linear-gradient(90deg, rgba(185,28,28,0.025) 0px, rgba(185,28,28,0.025) 1px, transparent 1px, transparent 64px)',
                }}
              />
            )}

            <div className="max-w-6xl mx-auto relative z-10">
              <div className={`grid lg:grid-cols-2 gap-14 items-start ${!isEven ? 'lg:grid-flow-dense' : ''}`}>

                {/* ── Text ── */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`space-y-7 ${!isEven ? 'lg:col-start-2' : ''}`}
                >
                  {/* Number + label */}
                  <div className="flex items-center gap-3">
                    <span className={`text-5xl font-black leading-none select-none ${idx === 1 ? 'text-zinc-800' : 'text-zinc-100'}`}>
                      {svc.num}
                    </span>
                    <div className={`h-px flex-1 ${idx === 1 ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                    <div className={`w-9 h-9 flex items-center justify-center ${idx === 1 ? 'bg-red-700' : 'bg-red-700/10'}`}>
                      <Icon size={16} className={idx === 1 ? 'text-white' : 'text-red-700'} />
                    </div>
                  </div>

                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${idx === 1 ? 'text-red-400' : 'text-red-700'}`}>
                      Service {svc.num}
                    </p>
                    <h2 className={`text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-2 ${idx === 1 ? 'text-white' : 'text-zinc-900'}`}>
                      {svc.name}
                    </h2>
                    <p className={`text-base italic font-medium ${idx === 1 ? 'text-red-400' : 'text-red-700'}`}>
                      &ldquo;{svc.tagline}&rdquo;
                    </p>
                  </div>

                  <p className={`text-base leading-relaxed ${idx === 1 ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {svc.description}
                  </p>

                  {/* Deliverables */}
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${idx === 1 ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      What&apos;s included
                    </p>
                    <ul className="space-y-2.5">
                      {svc.deliverables.map((d, dIdx) => (
                        <li key={dIdx} className={`flex items-start gap-3 text-sm ${idx === 1 ? 'text-zinc-300' : 'text-zinc-700'}`}>
                          <div className="w-4 h-4 bg-red-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check size={9} className="text-white" />
                          </div>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bars */}
                  <div className={`space-y-4 border-t pt-6 ${idx === 1 ? 'border-zinc-800' : 'border-zinc-100'}`}>
                    {svc.bars.map((bar, bIdx) => (
                      <MetricBar key={bIdx} label={bar.label} pct={bar.pct} delay={bIdx * 0.12} />
                    ))}
                  </div>

                  <Link
                    href="/audit"
                    className={`inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] transition-colors group ${
                      idx === 1 ? 'text-red-400 hover:text-red-300' : 'text-red-700 hover:text-red-600'
                    }`}
                  >
                    Start here
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </motion.div>

                {/* ── Visual card ── */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}
                >
                  <div className={`border p-8 space-y-8 ${idx === 1 ? 'border-zinc-800 bg-zinc-800/50' : idx === 3 ? 'border-zinc-200 bg-white' : 'border-zinc-200 bg-zinc-50'}`}>
                    {/* Icon large */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-red-700 flex items-center justify-center">
                        <Icon size={30} className="text-white" />
                      </div>
                      <div>
                        <p className={`text-3xl font-black leading-none ${idx === 1 ? 'text-white' : 'text-zinc-900'}`}>
                          {svc.metric}{svc.metricSuffix}
                        </p>
                        <p className={`text-[10px] uppercase tracking-widest mt-1 ${idx === 1 ? 'text-zinc-500' : 'text-zinc-500'}`}>
                          {svc.metricLabel}
                        </p>
                      </div>
                    </div>

                    {/* Second metric */}
                    <div className={`p-5 border ${idx === 1 ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${idx === 1 ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Key Result
                      </p>
                      <p className="text-3xl font-black text-red-700 leading-none">
                        <AnimatedCounter target={parseFloat(svc.metric2)} suffix={svc.metricSuffix2} />
                      </p>
                      <p className={`text-xs mt-2 leading-snug ${idx === 1 ? 'text-zinc-500' : 'text-zinc-500'}`}>
                        {svc.metricLabel2}
                      </p>
                    </div>

                    {/* Tagline card */}
                    <div className="bg-red-700 p-5">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-red-300 mb-2">Our Promise</p>
                      <p className="text-white font-bold text-sm leading-relaxed">&ldquo;{svc.tagline}&rdquo;</p>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>
          </section>
        );
      })}

      {/* ── How an Engagement Works ───────────────────────────────── */}
      <section className="py-20 px-6 bg-zinc-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-700" />
        <div className="absolute -right-8 top-0 bottom-0 flex items-center pointer-events-none select-none opacity-[0.04]">
          <span className="text-[20rem] font-black text-white leading-none">3</span>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 mb-3">Process</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight">
              How an engagement<br />
              <span className="text-red-500 italic">actually works.</span>
            </h2>
            <p className="text-zinc-400 text-base max-w-2xl mx-auto mt-4 leading-relaxed">
              Clear phases, clear outputs, clear accountability. You know exactly what happens next at every stage.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-px bg-zinc-800">
            {[
              {
                step: '01', title: 'Revenue Audit', duration: 'Days 1–5',
                icon: Activity,
                desc: 'We assess your full sales operation and surface exactly where revenue is leaking and why. You receive a prioritised action roadmap with quick wins and strategic fixes.',
                output: 'Actionable Roadmap',
              },
              {
                step: '02', title: 'Architecture & Network', duration: 'Days 6–21',
                icon: Zap,
                desc: 'We build your sales infrastructure — CRM, playbooks, scripts, cadences. Simultaneously, we make the first network introductions based on your ICP.',
                output: 'Sales Blueprint + Introductions',
              },
              {
                step: '03', title: 'Execution', duration: 'Month 2 onwards',
                icon: Database,
                desc: 'We run the full pipeline cycle — outreach, follow-up, engagement, close — on a 24-hour operating rhythm. You focus on the business. We close the deals.',
                output: 'Closed Revenue',
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.12 }}
                  className="relative bg-zinc-900 p-8 group hover:bg-zinc-800/80 transition-colors"
                >
                  {/* animated top line */}
                  <motion.div
                    className="absolute top-0 left-0 h-0.5 bg-red-700"
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + idx * 0.15, duration: 0.7 }}
                  />

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-red-700 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">{step.duration}</p>
                      <p className="text-xl font-black text-white leading-tight">{step.title}</p>
                    </div>
                    <span className="ml-auto text-5xl font-black text-zinc-800 leading-none select-none group-hover:text-zinc-700 transition-colors">
                      {step.step}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">{step.desc}</p>

                  <div className="border border-zinc-800 bg-zinc-800/50 px-4 py-3 group-hover:border-red-700/30 transition-colors">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500 mb-1">Output</p>
                    <p className="text-sm font-bold text-zinc-300">{step.output}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Engagement Models ─────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-700 mb-3">Engagement Models</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900">Two ways to work with us.</h2>
            <p className="text-zinc-500 text-base mt-3 max-w-xl leading-relaxed">
              Start with a single service to prove the model. Or come in with a retained engagement and let us run the full cycle.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Project */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="border-2 border-zinc-100 p-8 hover:border-zinc-300 transition-colors"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Project-Based</p>
              <h3 className="text-2xl font-black text-zinc-900 mb-3">Single Service Engagement</h3>
              <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                Commission one service — typically starting with the Revenue Audit — with a defined scope, fixed timeline, and clear output. Ideal if you want to understand the problem before committing to management.
              </p>
              <ul className="space-y-2.5 mb-8">
                {['Fixed scope and clear deliverables', 'No long-term commitment required', 'Results in 5–14 days depending on service', 'Option to upgrade to retained at any time'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-700">
                    <div className="w-1 h-1 rounded-full bg-zinc-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/audit"
                className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-zinc-700 hover:text-red-700 transition-colors group"
              >
                Start with the free audit
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>

            {/* Retained */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="border-2 border-zinc-900 p-8 bg-zinc-900 relative overflow-hidden"
            >
              <motion.div
                className="absolute top-0 left-0 h-1 bg-red-700"
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
              <div className="absolute top-5 right-5 bg-red-700 px-3 py-1">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Most Popular</p>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-4">Retained Management</p>
              <h3 className="text-2xl font-black text-white mb-3">Full Managed Service</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                We become your sales management function — running all five services in an integrated, 24-hour cycle. Pricing is tied to performance milestones, not billable hours. You pay for results, not effort.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  'All five services running in parallel',
                  '24/7 pipeline management and execution',
                  'Network introductions included from day one',
                  'Weekly performance reporting with full visibility',
                  'Performance-linked pricing — you pay for results',
                  '3-month minimum to prove the model',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                    <div className="w-4 h-4 bg-red-700 flex items-center justify-center flex-shrink-0">
                      <Check size={9} className="text-white" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/briefing"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-red-700 text-white text-sm font-black uppercase tracking-[0.12em] hover:bg-red-600 transition-colors group"
              >
                Apply for Retained Management
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-700 mb-3">FAQ</p>
            <h2 className="text-4xl font-black tracking-tighter text-zinc-900">Common questions.</h2>
          </motion.div>
          <div>
            {faqs.map((faq, idx) => (
              <FaqItem key={idx} q={faq.q} a={faq.a} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Band ──────────────────────────────────────────────── */}
      <section className="bg-red-700 py-20 px-6 relative overflow-hidden">
        <div className="absolute -right-8 top-0 bottom-0 flex items-center pointer-events-none select-none opacity-[0.08]">
          <span className="text-[20rem] font-black text-white leading-none">24</span>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-300 mb-3">Start Now</p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-3 leading-tight">
                Every engagement starts<br />with one free audit.
              </h2>
              <p className="text-red-200 text-base max-w-md leading-relaxed">
                5 business days. A personalised roadmap. Zero cost. No commitment to continue — but most do.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/audit"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-700 text-sm font-black uppercase tracking-[0.15em] hover:bg-zinc-100 transition-colors group whitespace-nowrap"
              >
                Get Free Sales Audit
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/briefing"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-red-600/40 text-white text-sm font-black uppercase tracking-[0.15em] hover:border-white/60 transition-colors whitespace-nowrap"
              >
                Talk to the Team
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
