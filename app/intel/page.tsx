'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  TrendingUp,
  BarChart3,
  Briefcase,
  Database,
  Activity,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

function AnimatedBar({ before, after, dark = false }: { before: number; after: number; dark?: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="space-y-2.5">
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-semibold uppercase tracking-widest w-12 flex-shrink-0 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          Before
        </span>
        <div className={`flex-1 h-1.5 rounded-full ${dark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
          <motion.div
            className={`h-1.5 rounded-full ${dark ? 'bg-zinc-600' : 'bg-zinc-300'}`}
            initial={{ width: '0%' }}
            animate={inView ? { width: `${before}%` } : { width: '0%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <span className={`text-xs font-semibold w-8 text-right ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>{before}%</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest w-12 flex-shrink-0 text-red-600">After</span>
        <div className={`flex-1 h-1.5 rounded-full ${dark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
          <motion.div
            className="h-1.5 rounded-full bg-red-600"
            initial={{ width: '0%' }}
            animate={inView ? { width: `${after}%` } : { width: '0%' }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
        <span className="text-xs font-semibold text-red-600 w-8 text-right">{after}%</span>
      </div>
    </div>
  );
}

function ColumnChart({ data, dark = false }: { data: { label: string; before: number; after: number }[]; dark?: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const max = Math.max(...data.flatMap((d) => [d.before, d.after]));
  const chartH = 120;

  return (
    <div ref={ref} className="w-full">
      <div className="flex items-end justify-around gap-3" style={{ height: chartH }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center gap-1" style={{ height: chartH - 20 }}>
              <div className="flex-1 flex flex-col justify-end">
                <motion.div
                  className={`w-full rounded-t-sm ${dark ? 'bg-zinc-700' : 'bg-zinc-200'}`}
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${(d.before / max) * (chartH - 20)}px` } : {}}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.08 }}
                />
              </div>
              <div className="flex-1 flex flex-col justify-end">
                <motion.div
                  className="w-full rounded-t-sm bg-red-600"
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${(d.after / max) * (chartH - 20)}px` } : {}}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.08 + 0.2 }}
                />
              </div>
            </div>
            <p className={`text-[9px] uppercase tracking-widest text-center ${dark ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {d.label.split(' ').slice(0, 2).join(' ')}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className={`w-3 h-2 rounded-sm ${dark ? 'bg-zinc-700' : 'bg-zinc-200'}`} />
          <span className={`text-[10px] uppercase tracking-widest ${dark ? 'text-zinc-600' : 'text-zinc-400'}`}>Before</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-red-600" />
          <span className={`text-[10px] uppercase tracking-widest ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>After Convivia24</span>
        </div>
      </div>
    </div>
  );
}

function TimelineChart() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const quarters = ["Q1'24", "Q2'24", "Q3'24", "Q4'24", "Q1'25", "Q2'25", "Q3'25", "Q4'25"];
  const portfolio = [100, 128, 156, 192, 248, 310, 389, 470];
  const benchmark = [100, 103, 107, 111, 116, 120, 125, 130];
  const maxVal = 500;
  const chartH = 150;
  const barW = 28;
  const gap = 12;
  const chartW = quarters.length * (barW + gap);
  const linePoints = benchmark
    .map((v, i) => {
      const x = i * (barW + gap) + barW / 2;
      const y = chartH - (v / maxVal) * chartH;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div ref={ref} className="w-full">
      <svg viewBox={`0 0 ${chartW} ${chartH + 24}`} className="w-full overflow-visible" style={{ height: 190 }}>
        {[100, 200, 300, 400].map((tick) => {
          const y = chartH - (tick / maxVal) * chartH;
          return <line key={tick} x1="0" y1={y} x2={chartW} y2={y} stroke="#27272a" strokeWidth="0.8" />;
        })}
        {portfolio.map((v, i) => {
          const h = (v / maxVal) * chartH;
          return (
            <motion.rect
              key={quarters[i]}
              x={i * (barW + gap)}
              y={chartH - h}
              width={barW}
              height={inView ? h : 0}
              fill="url(#barGradIntel)"
              rx="3"
              initial={{ height: 0, y: chartH }}
              animate={inView ? { height: h, y: chartH - h } : {}}
              transition={{ duration: 0.7, delay: i * 0.08 }}
            />
          );
        })}
        <defs>
          <linearGradient id="barGradIntel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
        </defs>
        <motion.polyline
          points={linePoints}
          fill="none"
          stroke="#d4d4d8"
          strokeWidth="2"
          strokeDasharray="4 3"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.4 }}
        />
        {quarters.map((q, i) => (
          <text key={q} x={i * (barW + gap) + barW / 2} y={chartH + 14} textAnchor="middle" fill="#71717a" fontSize="7">
            {q}
          </text>
        ))}
      </svg>
      <div className="flex flex-wrap items-center gap-5 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-600" />
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Portfolio Growth</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 border-t border-dashed border-zinc-600" />
          <span className="text-[10px] uppercase tracking-widest text-zinc-600">Industry Benchmark</span>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-red-500 font-semibold">Current: 470 index</div>
      </div>
    </div>
  );
}

const reports = [
  {
    id: 'benchmark',
    icon: Activity,
    title: 'Revenue Benchmark Brief',
    subtitle: 'Quarterly snapshot',
    desc: 'Fast benchmark pack for pipeline velocity, close time, and follow-up quality by sector.',
    format: 'PDF + XLS',
    delivery: '48 hours',
    audience: 'Founders and sales leads',
    price: '$149',
    tag: 'Most popular',
    features: ['Sector benchmark tables', 'Executive summary', 'Action checklist'],
  },
  {
    id: 'pulse',
    icon: TrendingUp,
    title: 'Nigerian Sales Pulse',
    subtitle: 'Monthly',
    desc: 'Market pulse on demand trends, buyer behavior shifts, and deal-cycle movement across Nigeria.',
    format: 'PDF',
    delivery: 'Instant',
    audience: 'Operators and analysts',
    price: '$79',
    tag: null,
    features: ['Trend charts', 'Short commentary', 'Monthly update'],
  },
  {
    id: 'deepdive',
    icon: Database,
    title: 'Industry Deep Dive',
    subtitle: 'Custom',
    desc: 'Focused vertical analysis for one sector or region, with competitive and GTM implications.',
    format: 'PDF + XLS',
    delivery: '3-5 days',
    audience: 'Strategy and growth teams',
    price: '$249',
    tag: null,
    features: ['One-sector focus', 'Competitor map', 'GTM recommendations'],
  },
  {
    id: 'health-index',
    icon: BarChart3,
    title: 'The Convivia Sales Health Index',
    subtitle: 'Annual',
    desc: 'Annual scorecard of sales maturity across key sectors. Best starting point for market context.',
    format: 'PDF',
    delivery: 'Instant',
    audience: 'General business audience',
    price: 'Free',
    tag: 'Lead magnet',
    features: ['Sector index scores', 'Method summary', 'Yearly release'],
  },
  {
    id: 'investor',
    icon: Briefcase,
    title: 'Investor Deal-Flow Brief',
    subtitle: 'Quarterly',
    desc: 'Quarterly intelligence for VC and PE teams on portfolio revenue quality and pipeline strength.',
    format: 'PDF + XLS',
    delivery: '72 hours',
    audience: 'VC and PE teams',
    price: '$399',
    tag: null,
    features: ['Portfolio trend tracking', 'Risk flags', 'Investment-grade summary'],
  },
];

const audiences = [
  'Lagos and Abuja business communities — Endeavor Nigeria, tech hubs',
  'Founders and CEOs who want insight without full Convivia engagement',
  'Private equity and VC firms with Nigerian / West African portfolio companies',
  'Multinationals expanding into Nigeria needing ground-level sales intelligence',
  'Business schools and MBA programmes as case study material',
];

const caseStudies = [
  {
    name: 'Global Tech Co.',
    industry: 'B2B Technology',
    quote: 'Convivia24 helped us rebuild pipeline execution from scratch and triple close speed in one half-year.',
    challenge:
      'Stagnant pipeline with a 180-day average sales cycle and a conversion rate of just 4%. No CRM process, no cadence, no visibility into deal stages.',
    results: [
      { label: 'Pipeline Velocity', before: 15, after: 72 },
      { label: 'Conversion Rate', before: 4, after: 31 },
    ],
    stat: '340%',
    statLabel: 'Revenue increase in 6 months',
    dark: false,
    timeline: [
      { month: 'Month 1', action: 'Insights audit and ICP mapping' },
      { month: 'Month 2', action: 'CRM rebuild and playbook launch' },
      { month: 'Month 3', action: 'Full outbound cadence activated' },
      { month: 'Month 6', action: '340% revenue uplift confirmed' },
    ],
  },
  {
    name: 'Retail Chain Ltd.',
    industry: 'Retail and Distribution',
    quote: 'From inconsistent follow-up to a clear system. We now close faster and lose fewer warm leads.',
    challenge:
      'A 12-person sales team with no shared playbook, inconsistent follow-up, and high churn on warm leads. Losing deals to smaller, more responsive competitors.',
    results: [
      { label: 'Lead Follow-Up Rate', before: 22, after: 95 },
      { label: 'Deal Close Rate', before: 18, after: 61 },
    ],
    stat: '60%',
    statLabel: 'Reduction in sales cycle length',
    dark: true,
    timeline: [
      { month: 'Week 1', action: 'Pipeline health diagnostic' },
      { month: 'Week 3', action: 'Cadence and follow-up system deployed' },
      { month: 'Month 2', action: 'Close rate exceeds 50%' },
      { month: 'Month 4', action: '60% cycle reduction confirmed' },
    ],
  },
  {
    name: 'FinServ Partners',
    industry: 'Financial Services',
    quote: 'Account prioritization and intelligence-led outreach gave us predictable qualified meetings every month.',
    challenge:
      'High-value prospects were going cold due to lack of structured outreach. No data on which accounts to prioritise or when to engage.',
    results: [
      { label: 'Account Engagement Rate', before: 8, after: 67 },
      { label: 'Qualified Meetings Booked', before: 11, after: 84 },
    ],
    stat: '₦2.1M',
    statLabel: 'New revenue in year one',
    dark: false,
    timeline: [
      { month: 'Month 1', action: 'ICP scoring and account tiering' },
      { month: 'Month 2', action: 'Intelligence-led outreach live' },
      { month: 'Month 5', action: 'Qualified pipeline hits ₦3M' },
      { month: 'Month 12', action: '₦2.1M closed and recognised' },
    ],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function IntelPage() {
  const [openCase, setOpenCase] = useState<number>(0);

  return (
    <div className="min-h-screen bg-zinc-50 overflow-x-hidden">
      <section className="relative pt-20 pb-14 sm:pt-24 sm:pb-20 px-4 sm:px-6 border-b border-zinc-200 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.12),transparent_45%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Reports and Intelligence
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-zinc-900 mb-5">
                Convivia <span className="text-red-700 italic">Intel</span>
              </h1>
              <p className="text-lg sm:text-xl text-zinc-600 max-w-2xl mb-5 leading-relaxed">
                We manage revenue for 47 clients across 6 industries and convert operating data into decisive sales intelligence.
              </p>
              <p className="text-sm text-zinc-500 max-w-xl mb-7">Not public data. Live portfolio intelligence.</p>
              <div className="inline-flex flex-wrap items-center gap-2 px-4 py-3 bg-zinc-900 text-zinc-100 rounded-lg text-sm">
                <span className="font-semibold text-white">Differentiator:</span>
                <span>Data informed by active management of ₦2M+ in annual revenue across 47 clients.</span>
              </div>
              <div className="mt-7 grid grid-cols-3 gap-3 max-w-md">
                {[
                  { label: 'Growth', value: '470%' },
                  { label: 'Managed Clients', value: '47' },
                  { label: 'Industries', value: '6' },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-lg border border-zinc-200 bg-white px-3 py-3">
                    <p className="text-lg font-black text-zinc-900">{kpi.value}</p>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">{kpi.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-zinc-200 bg-zinc-950 p-6 shadow-xl shadow-zinc-900/10"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Portfolio Revenue Index (Base 100)</p>
                <TrendingUp size={14} className="text-zinc-600" />
              </div>
              <TimelineChart />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700 mb-3"
          >
            Report Catalog
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 mb-3"
          >
            Report types and pricing.
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-zinc-600 text-lg mb-10 max-w-3xl"
          >
            Built like a research catalog: clear scope, clear delivery times, and simpler pricing in USD.
          </motion.p>
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 rounded-xl bg-zinc-50 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 border border-zinc-200 mb-4">
            <div className="col-span-4">Report</div>
            <div className="col-span-2">Format</div>
            <div className="col-span-2">Delivery</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2 text-right">Action</div>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="space-y-4"
          >
            {reports.map((r) => {
              const Icon = r.icon;
              return (
                <motion.article
                  key={r.id}
                  variants={item}
                  className="group relative border border-zinc-200 rounded-2xl p-5 sm:p-6 hover:border-red-300 hover:shadow-lg hover:shadow-red-100/40 transition-all duration-200 bg-white overflow-hidden"
                >
                  <div className="grid md:grid-cols-12 gap-4 md:items-center">
                    <div className="md:col-span-4 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                          <Icon className="text-red-700 w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold text-zinc-900 leading-tight">{r.title}</h3>
                          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mt-1">{r.subtitle}</p>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-600 leading-relaxed">{r.desc}</p>
                      <ul className="flex flex-wrap gap-2 mt-3">
                        {r.features.map((f, i) => (
                          <li key={i} className="inline-flex items-center text-xs text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-md">
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1 md:hidden">Format</p>
                      <p className="text-sm font-semibold text-zinc-800">{r.format}</p>
                      <p className="text-xs text-zinc-500 mt-1">{r.audience}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1 md:hidden">Delivery</p>
                      <p className="text-sm font-semibold text-zinc-800">{r.delivery}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1 md:hidden">Price</p>
                      <p className="text-2xl font-black text-red-700 leading-none">{r.price}</p>
                      {r.tag && <p className="text-xs text-red-700 font-semibold mt-1">{r.tag}</p>}
                    </div>
                    <div className="md:col-span-2 md:text-right">
                      <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1 md:hidden">Action</p>
                      <Link
                        href="/briefing"
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                          r.price === 'Free'
                            ? 'bg-red-700/80 backdrop-blur-md border border-red-600/40 text-white hover:bg-red-700'
                            : 'bg-white/70 backdrop-blur-md border border-zinc-300 text-zinc-900 hover:border-red-300'
                        }`}
                      >
                        {r.price === 'Free' ? 'Download' : 'Buy report'}
                        <ArrowRight size={14} />
                      </Link>
                      <p className="text-[11px] text-zinc-500 mt-2">USD pricing • VAT excluded</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-100">
                    <p className="text-xs text-zinc-500">
                      Need a tailored version? <span className="font-semibold text-zinc-700">Custom scope available.</span>
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2"
          >
            Performance Testimonials
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-zinc-600 text-sm mb-8"
          >
            Open each testimonial to see full challenge context plus the same charts and before/after metrics from the Performance page.
          </motion.p>
          <div className="space-y-4">
            {caseStudies.map((cs, idx) => {
              const isOpen = openCase === idx;
              return (
                <article key={cs.name} className="border border-zinc-200 rounded-xl bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenCase(isOpen ? -1 : idx)}
                    className="w-full text-left px-5 sm:px-6 py-5 flex items-start justify-between gap-4 hover:bg-zinc-50 transition-colors"
                  >
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-red-700 mb-1">{cs.industry}</p>
                      <h3 className="text-lg font-bold text-zinc-900">{cs.name}</h3>
                      <p className="text-sm text-zinc-600 mt-1">{cs.quote}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pt-1">
                      <span className="text-sm font-black text-red-700">{cs.stat}</span>
                      <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className={`px-5 sm:px-6 pb-6 border-t ${cs.dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
                      <div className="grid lg:grid-cols-2 gap-8 pt-6">
                        <div className="space-y-5">
                          <div>
                            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${cs.dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              The Challenge
                            </p>
                            <p className={`text-sm leading-relaxed ${cs.dark ? 'text-zinc-400' : 'text-zinc-600'}`}>{cs.challenge}</p>
                          </div>
                          <div className="border-l-4 border-red-700 pl-4">
                            <p className="text-3xl font-black text-red-600 leading-none">{cs.stat}</p>
                            <p className={`text-xs font-medium mt-1 ${cs.dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{cs.statLabel}</p>
                          </div>
                          <div>
                            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-3 ${cs.dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              Engagement Timeline
                            </p>
                            <div className="relative pl-4 border-l-2 border-red-700/30 space-y-4">
                              {cs.timeline.map((event, eIdx) => (
                                <div key={eIdx} className="relative">
                                  <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-red-700" />
                                  <p className="text-[9px] font-black uppercase tracking-widest mb-0.5 text-red-600">{event.month}</p>
                                  <p className={`text-xs ${cs.dark ? 'text-zinc-400' : 'text-zinc-600'}`}>{event.action}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className={`p-6 border ${cs.dark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-5 ${cs.dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              Before → After Convivia24
                            </p>
                            {cs.results.map((result, rIdx) => (
                              <div key={rIdx} className="space-y-2 mb-4">
                                <p className={`text-xs font-semibold ${cs.dark ? 'text-zinc-300' : 'text-zinc-700'}`}>{result.label}</p>
                                <AnimatedBar before={result.before} after={result.after} dark={cs.dark} />
                              </div>
                            ))}
                          </div>
                          <div className={`p-6 border ${cs.dark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-4 ${cs.dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              Metric Comparison
                            </p>
                            <ColumnChart data={cs.results} dark={cs.dark} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2"
          >
            Who we sell to
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-zinc-600 text-sm mb-8"
          >
            Lagos and Abuja business communities, founders, investors, and global teams entering the market.
          </motion.p>
          <ul className="grid sm:grid-cols-2 gap-3">
            {audiences.map((a, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-2 text-sm text-zinc-700"
              >
                <span className="text-red-600 mt-0.5 font-bold">·</span>
                <span>{a}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-zinc-900 relative overflow-hidden border-t border-zinc-800">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-700" />
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Every report is a pipeline for your business</h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-10">
            Someone buys the Nigerian Sales Pulse, sees their business underperforming the benchmarks, and books a Sales Health Audit.
            The report pays for itself twice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/briefing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-700 text-white text-sm font-semibold uppercase tracking-wider hover:bg-red-600 transition-colors rounded"
            >
              Enquire or request a report
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-zinc-600 text-zinc-300 text-sm font-semibold hover:border-zinc-500 hover:text-white transition-colors rounded"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
