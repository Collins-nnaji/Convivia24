'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Check, Activity, Database, Layout, Target, Sparkles } from 'lucide-react';

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

/* ─── Sparkline ──────────────────────────────────────────────────── */
function Sparkline({ data, color = '#b91c1c', w = 80, h = 28 }: {
  data: number[]; color?: string; w?: number; h?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const max = Math.max(...data); const min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg ref={ref} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <motion.polyline
        points={pts} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={inView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1.3, ease: 'easeOut' }}
      />
    </svg>
  );
}

/* ─── Animated bar ───────────────────────────────────────────────── */
function MetricBar({ pct, label, delay = 0, dark = false }: {
  pct: number; label: string; delay?: number; dark?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="space-y-1">
      <div className="flex items-center justify-between">
        <span className={`text-xs uppercase tracking-widest ${dark ? 'text-zinc-500' : 'text-zinc-500'}`}>{label}</span>
        <span className={`text-xs font-black text-red-600`}>{pct}%</span>
      </div>
      <div className={`h-1 w-full rounded-full ${dark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
        <motion.div
          className="h-1 rounded-full bg-red-700"
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  );
}

/* ─── SVG illustrations (inline, no external fetch) ─────────────── */

// Revenue Audit — abstract magnifying lens over a bar chart
const AuditIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 140 100" fill="none">
    {/* bar chart */}
    <rect x="10" y="60" width="14" height="32" fill="#27272a" rx="1" />
    <rect x="30" y="44" width="14" height="48" fill="#3f3f46" rx="1" />
    <rect x="50" y="28" width="14" height="64" fill="#52525b" rx="1" />
    <rect x="70" y="14" width="14" height="78" fill="#b91c1c" opacity="0.8" rx="1" />
    {/* trend line */}
    <polyline points="17,60 37,44 57,28 77,14" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* magnifier */}
    <circle cx="110" cy="38" r="22" stroke="#71717a" strokeWidth="3" fill="none" />
    <circle cx="110" cy="38" r="14" stroke="#b91c1c" strokeWidth="1.5" fill="rgba(185,28,28,0.06)" />
    <line x1="127" y1="55" x2="138" y2="66" stroke="#71717a" strokeWidth="3" strokeLinecap="round" />
    {/* inner chart lines */}
    <line x1="100" y1="42" x2="120" y2="42" stroke="#3f3f46" strokeWidth="1" />
    <line x1="103" y1="36" x2="117" y2="36" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Pipeline Management — funnel shape with flow dots
const PipelineIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 140 100" fill="none">
    {/* funnel stages */}
    <rect x="10" y="12" width="120" height="16" fill="#3f3f46" rx="2" />
    <rect x="22" y="34" width="96" height="14" fill="#52525b" rx="2" />
    <rect x="36" y="54" width="68" height="13" fill="#71717a" rx="2" />
    <rect x="50" y="73" width="40" height="12" fill="#b91c1c" opacity="0.9" rx="2" />
    {/* labels */}
    <text x="70" y="24" textAnchor="middle" fill="#a1a1aa" fontSize="7" fontWeight="600">LEADS</text>
    <text x="70" y="45" textAnchor="middle" fill="#a1a1aa" fontSize="7" fontWeight="600">QUALIFIED</text>
    <text x="70" y="64" textAnchor="middle" fill="#d4d4d8" fontSize="7" fontWeight="600">ENGAGED</text>
    <text x="70" y="83" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">CLOSED</text>
    {/* animated dot hint */}
    <circle cx="138" cy="20" r="3" fill="#b91c1c" opacity="0.6" />
    <circle cx="138" cy="41" r="3" fill="#b91c1c" opacity="0.8" />
    <circle cx="138" cy="61" r="3" fill="#b91c1c" />
  </svg>
);

// Sales Architecture — blueprint grid with nodes
const ArchitectureIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 140 100" fill="none">
    {/* grid */}
    {[0, 20, 40, 60, 80, 100].map(x => (
      <line key={`v${x}`} x1={x + 10} y1="8" x2={x + 10} y2="92" stroke="#27272a" strokeWidth="0.5" />
    ))}
    {[0, 20, 40, 60, 80].map(y => (
      <line key={`h${y}`} x1="10" y1={y + 8} x2="130" y2={y + 8} stroke="#27272a" strokeWidth="0.5" />
    ))}
    {/* nodes */}
    <circle cx="30" cy="28" r="7" fill="#b91c1c" />
    <circle cx="70" cy="48" r="7" fill="#3f3f46" stroke="#b91c1c" strokeWidth="1.5" />
    <circle cx="110" cy="28" r="7" fill="#3f3f46" stroke="#71717a" strokeWidth="1" />
    <circle cx="50" cy="72" r="7" fill="#3f3f46" stroke="#71717a" strokeWidth="1" />
    <circle cx="90" cy="72" r="7" fill="#3f3f46" stroke="#b91c1c" strokeWidth="1.5" />
    {/* connections */}
    <line x1="37" y1="28" x2="63" y2="44" stroke="#b91c1c" strokeWidth="1.5" />
    <line x1="77" y1="44" x2="103" y2="28" stroke="#52525b" strokeWidth="1" />
    <line x1="63" y1="53" x2="55" y2="66" stroke="#52525b" strokeWidth="1" />
    <line x1="77" y1="53" x2="85" y2="66" stroke="#b91c1c" strokeWidth="1.5" />
    {/* label */}
    <text x="30" y="31" textAnchor="middle" fill="white" fontSize="6" fontWeight="700">ICP</text>
    <text x="70" y="51" textAnchor="middle" fill="white" fontSize="6" fontWeight="700">CRM</text>
    <text x="110" y="31" textAnchor="middle" fill="#a1a1aa" fontSize="6">PLAY</text>
    <text x="50" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="6">SCRIPT</text>
    <text x="90" y="75" textAnchor="middle" fill="white" fontSize="6" fontWeight="700">CLOSE</text>
  </svg>
);

// Strategic Insights — data radar / target
const InsightsIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 140 100" fill="none">
    {/* concentric circles */}
    <circle cx="70" cy="50" r="42" stroke="#27272a" strokeWidth="1" />
    <circle cx="70" cy="50" r="30" stroke="#3f3f46" strokeWidth="1" />
    <circle cx="70" cy="50" r="18" stroke="#52525b" strokeWidth="1" />
    <circle cx="70" cy="50" r="7" fill="#b91c1c" />
    {/* crosshair */}
    <line x1="70" y1="8" x2="70" y2="92" stroke="#3f3f46" strokeWidth="0.75" />
    <line x1="28" y1="50" x2="112" y2="50" stroke="#3f3f46" strokeWidth="0.75" />
    {/* data points */}
    <circle cx="90" cy="25" r="4" fill="#b91c1c" opacity="0.9" />
    <circle cx="48" cy="38" r="3" fill="#71717a" />
    <circle cx="102" cy="62" r="3.5" fill="#b91c1c" opacity="0.6" />
    <circle cx="55" cy="70" r="3" fill="#71717a" />
    {/* signal arc */}
    <path d="M 95 18 A 40 40 0 0 1 115 58" stroke="#b91c1c" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
    {/* label */}
    <text x="92" y="20" fill="#b91c1c" fontSize="6" fontWeight="700">HIGH VALUE</text>
  </svg>
);

/* ─── Services data ──────────────────────────────────────────────── */
const services = [
  {
    icon: Activity,
    num: '01',
    name: 'Revenue Audit',
    tagline: 'Know exactly where revenue is leaking.',
    description: 'A structured, data-led assessment of your entire sales operation — pipeline health, conversion rates, CRM integrity, and competitive positioning. In 5 business days, we hand you the ledger no consultant has shown you.',
    deliverables: ['Pipeline health scorecard', 'Revenue gap analysis', 'Priority action roadmap'],
    metric: '5', metricSuffix: 'd', metricLabel: 'delivery time',
    metric2: '100', metricSuffix2: '%', metricLabel2: 'clients proceed to engagement',
    spark: [20, 35, 55, 80, 100],
    bars: [
      { label: 'Pipeline visibility gained', pct: 94 },
      { label: 'Revenue gaps surfaced', pct: 87 },
    ],
    Illustration: AuditIllustration,
    bg: 'bg-white', textColor: 'text-zinc-900', descColor: 'text-zinc-600',
    accent: 'text-red-700', border: 'border-zinc-200',
    dark: false,
  },
  {
    icon: Database,
    num: '02',
    name: 'Pipeline Management',
    tagline: 'Full-cycle sales execution. Around the clock.',
    description: 'We become your managed sales function — handling outreach, follow-up, objection resolution, and closing coordination on a 24-hour cycle. No lead goes cold. No opportunity goes missed.',
    deliverables: ['24/7 outreach & follow-up', 'Objection handling & deal acceleration', 'Weekly pipeline reports & reviews'],
    metric: '340', metricSuffix: '%', metricLabel: 'avg velocity uplift',
    metric2: '95', metricSuffix2: '%', metricLabel2: 'lead follow-up rate',
    spark: [15, 40, 80, 150, 240, 340],
    bars: [
      { label: 'Follow-up consistency', pct: 95 },
      { label: 'Pipeline conversion', pct: 72 },
    ],
    Illustration: PipelineIllustration,
    bg: 'bg-white', textColor: 'text-zinc-900', descColor: 'text-zinc-600',
    accent: 'text-red-700', border: 'border-zinc-100',
    dark: false,
  },
  {
    icon: Layout,
    num: '03',
    name: 'Sales Architecture',
    tagline: 'Build the machine that sells without you.',
    description: 'We design and build your complete sales infrastructure — CRM configuration, multi-touch cadence architecture, team playbooks, and lead scoring models — engineered for velocity and repeatability.',
    deliverables: ['CRM setup & workflow automation', 'Sales scripts & cadence design', 'Team playbook & accountability framework'],
    metric: '14', metricSuffix: 'd', metricLabel: 'avg time to launch',
    metric2: '92', metricSuffix2: '%', metricLabel2: 'CRM automation rate',
    spark: [10, 25, 45, 65, 82, 92],
    bars: [
      { label: 'Process repeatability', pct: 92 },
      { label: 'Team adoption rate', pct: 88 },
    ],
    Illustration: ArchitectureIllustration,
    bg: 'bg-white', textColor: 'text-zinc-900', descColor: 'text-zinc-600',
    accent: 'text-red-700', border: 'border-zinc-200',
    dark: false,
  },
  {
    icon: Target,
    num: '04',
    name: 'Strategic Insights',
    tagline: 'See the market before your competitors do.',
    description: 'We surface the intelligence that drives the right conversations — ICP mapping, account scoring, competitive positioning, and pipeline signal monitoring. Stop guessing. Start targeting.',
    deliverables: ['Ideal Customer Profile (ICP) mapping', 'Account scoring & prioritisation', 'Competitive landscape intelligence'],
    metric: '3.4', metricSuffix: '×', metricLabel: 'more opportunities surfaced',
    metric2: '87', metricSuffix2: '%', metricLabel2: 'ICP match rate',
    spark: [20, 38, 55, 70, 82, 87],
    bars: [
      { label: 'Signal-to-close accuracy', pct: 84 },
      { label: 'Account targeting precision', pct: 87 },
    ],
    Illustration: InsightsIllustration,
    bg: 'bg-white', textColor: 'text-zinc-900', descColor: 'text-zinc-600',
    accent: 'text-red-700', border: 'border-zinc-100',
    dark: false,
  },
];

/* ─── FAQ data ───────────────────────────────────────────────────── */
const faqs = [
  {
    q: 'Do you replace our sales team?',
    a: 'No. We augment or manage alongside your existing people. We handle the systematic layer — outreach, CRM, cadence, reporting — so your team can focus on high-value human closes.',
  },
  {
    q: 'How quickly do results appear?',
    a: 'Pipeline improvements typically show within 30–45 days of engagement. Revenue closes follow at 60–90 days depending on your cycle length. Our fastest client saw a close in week three.',
  },
  {
    q: 'What size of business is this for?',
    a: 'We work with B2B companies generating ₦300K–₦10M in annual revenue who are ready to move from ad hoc sales to a managed, structured approach.',
  },
  {
    q: 'Is there a minimum commitment?',
    a: 'The Revenue Audit is a standalone engagement. Retained management requires a 3-month minimum — enough time for the full Insights → Planning → Execution cycle to mature.',
  },
  {
    q: 'How do you measure success?',
    a: 'Pipeline velocity, close rate, average deal size, and cycle length. We establish baseline metrics in week one and report against them every week. You see every number.',
  },
];

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
        <p className="text-base text-zinc-600 leading-relaxed pb-5">{a}</p>
      </motion.div>
    </motion.div>
  );
}

type PageMode = 'whatWeDo' | 'engine';

/* ─── Page ───────────────────────────────────────────────────────── */
export default function WhatWeDoPage({ mode = 'whatWeDo' }: { mode?: PageMode }) {
  const isEngine = mode === 'engine';
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-6 bg-white relative overflow-hidden border-b border-zinc-200">
        {/* background grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#18181b" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 text-xs font-semibold uppercase tracking-widest mb-6">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                {isEngine ? 'Method + Services' : 'Services'}
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.88] text-zinc-900 mb-6">
                {isEngine ? (
                  <>
                    The <span className="text-red-700 italic">Engine</span><br />
                    + What We Do.
                  </>
                ) : (
                  <>
                    What We <span className="text-red-700 italic">Do.</span>
                  </>
                )}
              </h1>
              <p className="text-lg md:text-xl text-zinc-600 leading-relaxed max-w-lg mb-8">
                {isEngine
                  ? 'Three operating pillars + four managed services. We show the model, then execute it for you.'
                  : 'Four managed services. One outcome — a revenue engine that runs without you having to push it.'}
              </p>
              <div className="flex gap-3">
                <Link href="/briefing" className="inline-flex items-center gap-2 px-7 py-3.5 bg-red-700 text-white text-sm font-semibold uppercase tracking-wider hover:bg-red-800 transition-colors group">
                  Start with an Audit
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/intel" className="inline-flex items-center gap-2 px-7 py-3.5 border border-zinc-300 text-zinc-700 text-sm font-semibold uppercase tracking-wider hover:border-zinc-900 hover:text-zinc-900 transition-colors">
                  See Results
                </Link>
              </div>
            </motion.div>

            {/* Stats column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:flex flex-col gap-4"
            >
              {[
                { val: 4, suffix: '', label: 'Core services', sub: 'Audit → Architecture → Pipeline → Intelligence' },
                { val: 47, suffix: '+', label: 'Active managed clients', sub: '6 industries, 3 continents' },
                { val: 340, suffix: '%', label: 'Avg pipeline velocity uplift', sub: 'Across managed engagements' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-white border border-zinc-200 px-6 py-5 flex items-center justify-between gap-6"
                >
                  <div>
                    <p className="text-3xl font-black text-red-700 leading-none">
                      <AnimatedCounter target={s.val} suffix={s.suffix} />
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-700 mt-1">{s.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{s.sub}</p>
                  </div>
                  <Sparkline
                    data={i === 0 ? [1, 2, 3, 4] : i === 1 ? [20, 28, 35, 40, 47] : [30, 80, 160, 240, 340]}
                    color="#ef4444" w={80} h={30}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Engine framework (engine page only) ── */}
      {isEngine && (
        <section className="py-16 px-6 bg-white border-b border-zinc-200">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-700 mb-2">Framework</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900">How the engine runs.</h2>
              <p className="text-base md:text-lg text-zinc-600 mt-3 max-w-3xl mx-auto">
                The model is Insights → Planning → Execution. The services below are how we operate each pillar.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  label: 'Insights',
                  title: 'The Convivia',
                  desc: 'We find high-value opportunities in your pipeline and market signals.',
                  cls: 'bg-white border-zinc-200 text-zinc-900',
                },
                {
                  label: 'Planning',
                  title: 'The Blueprint',
                  desc: 'We convert those insights into CRM workflows, scripts, and repeatable playbooks.',
                  cls: 'bg-zinc-900 border-zinc-800 text-white',
                },
                {
                  label: 'Execution',
                  title: 'The 24',
                  desc: 'We run outreach, follow-up, and deal progression in a continuous operating cycle.',
                  cls: 'bg-white border-zinc-200 text-zinc-900',
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`border p-7 ${item.cls}`}
                >
                  <p className={`text-xs uppercase tracking-widest font-semibold mb-2 ${idx === 1 ? 'text-red-400' : 'text-red-700'}`}>
                    {item.label}
                  </p>
                  <h3 className="text-2xl font-black tracking-tight mb-3">{item.title}</h3>
                  <p className={`text-base leading-relaxed ${idx === 1 ? 'text-zinc-300' : 'text-zinc-600'}`}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Services ── */}
      {services.map((svc, idx) => (
        <section key={idx} className={`py-16 px-6 ${svc.bg} border-b ${svc.border}`}>
          <div className="max-w-6xl mx-auto">
            <div className={`grid lg:grid-cols-2 gap-12 items-start ${idx % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>

              {/* Text block */}
              <motion.div
                initial={{ opacity: 0, x: idx % 2 === 1 ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`space-y-6 ${idx % 2 === 1 ? 'lg:col-start-2' : ''}`}
              >
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest ${svc.accent} mb-2`}>
                    {svc.num} — Service
                  </p>
                  <h2 className={`text-4xl md:text-5xl font-black tracking-tighter ${svc.textColor} leading-tight mb-1 flex items-center gap-3`}>
                    <span className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
                      <svc.icon size={20} />
                    </span>
                    {svc.name}
                  </h2>
                  <p className={`text-base italic ${svc.descColor}`}>{svc.tagline}</p>
                </div>

                <p className={`text-base leading-relaxed ${svc.descColor}`}>{svc.description}</p>

                {/* Deliverables */}
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${svc.descColor}`}>Deliverables</p>
                  <ul className="space-y-2">
                    {svc.deliverables.map((d, dIdx) => (
                      <li key={dIdx} className={`flex items-center gap-3 text-base ${svc.dark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        <Check size={14} className="text-red-700 flex-shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metric bars */}
                <div className={`space-y-3 border-t pt-5 ${svc.dark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                  {svc.bars.map((bar, bIdx) => (
                    <MetricBar key={bIdx} label={bar.label} pct={bar.pct} delay={bIdx * 0.12} dark={svc.dark} />
                  ))}
                </div>

                <Link
                  href="/briefing"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-500 transition-colors group"
                >
                  Start with this service <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>

              {/* Visual block */}
              <motion.div
                initial={{ opacity: 0, x: idx % 2 === 1 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -4 }}
                className={idx % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}
              >
                {/* Illustration card */}
                <div className={`border ${svc.border} p-6 space-y-5`}>
                  {/* SVG illustration */}
                  <div className="w-full h-28 bg-zinc-50 flex items-center justify-center">
                    <div className="w-full h-full p-4">
                      <svc.Illustration />
                    </div>
                  </div>

                  {/* Two metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 border border-zinc-100 bg-zinc-50">
                      <p className={`text-2xl font-black leading-none ${svc.accent}`}>
                        {svc.metric}{svc.metricSuffix}
                      </p>
                      <p className={`text-xs uppercase tracking-widest mt-1 ${svc.descColor}`}>{svc.metricLabel}</p>
                    </div>
                    <div className="p-4 border border-zinc-100 bg-zinc-50">
                      <p className={`text-2xl font-black leading-none ${svc.accent}`}>
                        <AnimatedCounter target={parseFloat(svc.metric2)} suffix={svc.metricSuffix2} />
                      </p>
                      <p className={`text-xs uppercase tracking-widest mt-1 ${svc.descColor}`}>{svc.metricLabel2}</p>
                    </div>
                  </div>

                  {/* Sparkline strip */}
                  <div className="border-t pt-4 flex items-center justify-between border-zinc-100">
                    <p className={`text-xs uppercase tracking-widest ${svc.descColor}`}>Performance trend</p>
                    <Sparkline data={svc.spark} color="#b91c1c" w={100} h={28} />
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>
      ))}

      {/* ── How It Works ── */}
      <section className="py-16 px-6 bg-white border-b border-zinc-200 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(220,38,38,0.04) 0px, rgba(220,38,38,0.04) 1px, transparent 1px, transparent 72px)' }}
        />
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-700 mb-2">Process</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900">
              How an engagement works.
            </h2>
            <p className="text-base md:text-lg text-zinc-600 max-w-2xl mx-auto mt-3">
              A clear path from diagnosis to execution, with measurable outputs at each stage.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 relative z-10">
            {[
              {
                step: '01', title: 'Revenue Audit', duration: 'Days 1–5',
                desc: 'We assess your full sales operation and deliver a priority roadmap — pipeline gaps, ICP blind spots, and where the money is.',
                output: 'Action Roadmap',
              },
              {
                step: '02', title: 'Architecture', duration: 'Days 6–20',
                desc: 'We build your sales infrastructure — CRM, cadences, scripts, playbooks — everything needed to launch a managed operation.',
                output: 'Sales Blueprint',
              },
              {
                step: '03', title: 'Execution', duration: 'Month 2 onwards',
                desc: 'We run the engine. Daily outreach, follow-up, pipeline reviews, and continuous optimisation — while you focus on the business.',
                output: 'Closed Revenue',
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
                className="relative p-8 bg-white/85 backdrop-blur-sm shadow-lg shadow-zinc-200/70 hover:shadow-xl transition-all"
              >
                <div className="absolute top-0 left-0 h-1 w-full bg-red-700/70" />
                {/* connector arrow */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-5 z-10 -translate-y-1/2">
                    <ArrowRight size={20} className="text-red-700" />
                  </div>
                )}
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-1">{step.duration}</p>
                <p className="text-5xl font-black text-zinc-200 leading-none mb-4 select-none">{step.step}</p>
                <h3 className="text-2xl font-black text-zinc-900 mb-3 flex items-center gap-2">
                  <Sparkles size={18} className="text-red-700" />
                  {step.title}
                </h3>
                <p className="text-base text-zinc-600 leading-relaxed mb-5">{step.desc}</p>
                <div className="bg-red-50 px-3 py-2 inline-block">
                  <p className="text-xs font-semibold uppercase tracking-widest text-red-600">Output</p>
                  <p className="text-sm font-bold text-zinc-900">{step.output}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Engagement Models ── */}
      <section className="py-16 px-6 bg-white border-b border-zinc-100">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-700 mb-2">Engagement Models</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900">
              Two ways to engage.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Project */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="border-2 border-zinc-100 p-8 hover:border-red-100 transition-colors"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Project-Based</p>
              <h3 className="text-2xl font-black text-zinc-900 mb-4">Single Service Engagement</h3>
              <p className="text-base text-zinc-600 leading-relaxed mb-6">
                Commission one service — typically the Revenue Audit or Sales Architecture build — with a defined scope, timeline, and output. Ideal for firms ready to diagnose before committing to management.
              </p>
              <ul className="space-y-2 mb-6">
                {['Fixed scope & price', 'Clear deliverables & timeline', 'No long-term commitment', 'Option to upgrade to retained'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-base text-zinc-700">
                    <div className="w-1 h-1 rounded-full bg-zinc-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/briefing" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-red-700 transition-colors group">
                Start with the Audit <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>

            {/* Retained */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="border-2 border-red-700 p-8 bg-red-50 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 bg-red-700 px-3 py-1">
                <p className="text-xs font-black uppercase tracking-widest text-white">Most Popular</p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-4">Retained Management</p>
              <h3 className="text-2xl font-black text-zinc-900 mb-4">Full Managed Service</h3>
              <p className="text-base text-zinc-700 leading-relaxed mb-6">
                We become your sales management function — running all four services in an integrated, 24-hour cycle. Pricing is tied to performance milestones, not billable hours. You pay for results.
              </p>
              <ul className="space-y-2 mb-6">
                {['All four services integrated', '24/7 pipeline management', 'Weekly performance reporting', 'Performance-linked pricing', '3-month minimum term'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-base text-zinc-700">
                    <Check size={14} className="text-red-700 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/briefing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-700 text-white text-sm font-semibold uppercase tracking-wider hover:bg-red-800 transition-colors group"
              >
                Apply for Management
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-700 mb-2">FAQ</p>
            <h2 className="text-3xl font-black tracking-tighter text-zinc-900">Common questions.</h2>
          </div>
          <div>
            {faqs.map((faq, idx) => (
              <FaqItem key={idx} q={faq.q} a={faq.a} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Band ── */}
      <section className="bg-red-700 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-red-300 mb-2">Ready to start?</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-2 leading-tight">
                Every engagement starts<br />with one audit.
              </h2>
              <p className="text-red-200 text-base max-w-md">
                5 business days. A clear roadmap. No commitment required to proceed.
              </p>
            </div>
            <Link
              href="/briefing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-700 text-sm font-black uppercase tracking-wider hover:bg-zinc-100 transition-colors group whitespace-nowrap"
            >
              Request Your Audit
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
