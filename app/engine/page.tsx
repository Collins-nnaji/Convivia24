'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Database, Layout, Activity, ChevronRight } from 'lucide-react';

/* ─── Animated funnel bar ────────────────────────────────────────── */
function FunnelBar({ label, value, pct, color = 'bg-red-700', dark = true, delay = 0 }: {
  label: string; value: string; pct: number; color?: string; dark?: boolean; delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={`text-[9px] uppercase tracking-widest font-semibold ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>{label}</span>
        <span className={`text-sm font-black ${dark ? 'text-white' : 'text-zinc-900'}`}>{value}</span>
      </div>
      <div className={`h-2 w-full rounded-full ${dark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
        <motion.div
          className={`h-2 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  );
}

/* ─── Pipeline flow animation ────────────────────────────────────── */
function PipelineFlow() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const stages = [
    { label: 'Raw Leads', count: 500, color: '#52525b' },
    { label: 'Qualified', count: 200, color: '#78716c' },
    { label: 'Engaged', count: 100, color: '#b45309' },
    { label: 'Proposed', count: 55, color: '#dc2626' },
    { label: 'Closed', count: 31, color: '#b91c1c' },
  ];
  const max = stages[0].count;

  return (
    <div ref={ref} className="space-y-2">
      {stages.map((stage, i) => {
        const widthPct = (stage.count / max) * 100;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[9px] text-zinc-500 w-16 flex-shrink-0 text-right">{stage.label}</span>
            <div className="flex-1 bg-zinc-800 rounded-sm h-6 relative overflow-hidden">
              <motion.div
                className="h-full rounded-sm flex items-center pl-2"
                style={{ backgroundColor: stage.color }}
                initial={{ width: 0 }}
                animate={inView ? { width: `${widthPct}%` } : {}}
                transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.15 }}
              >
                <motion.span
                  className="text-[9px] font-black text-white whitespace-nowrap"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: i * 0.15 + 0.6 }}
                >
                  {stage.count}
                </motion.span>
              </motion.div>
            </div>
          </div>
        );
      })}
      <p className="text-[8px] text-zinc-600 uppercase tracking-widest mt-2 pl-20">Managed pipeline — illustrative</p>
    </div>
  );
}

/* ─── Cycle clock ────────────────────────────────────────────────── */
function CycleClock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const segments = [
    { label: 'Insights', hours: 8, color: '#52525b', start: 0 },
    { label: 'Outreach', hours: 8, color: '#b91c1c', start: 120 },
    { label: 'Closing', hours: 8, color: '#7f1d1d', start: 240 },
  ];
  const r = 50, cx = 60, cy = 60;
  const circ = 2 * Math.PI * r;

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#27272a" strokeWidth="14" />
        {segments.map((seg, i) => {
          const dashLen = (seg.hours / 24) * circ;
          const offset = circ - (seg.start / 360) * circ;
          return (
            <motion.circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="14"
              strokeDasharray={`${dashLen} ${circ - dashLen}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: i * 0.3, duration: 0.5 }}
            />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" className="font-black" fill="white" fontSize="16" fontWeight="900">24</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#71717a" fontSize="7" fontWeight="600" letterSpacing="1">HRS</text>
      </svg>
      <div className="flex gap-4">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const phases = [
  {
    num: '01', label: 'INSIGHTS', title: 'The Convivia',
    subtitle: 'Finding the life in your data.',
    description: 'Every market has a pulse. Most companies can\'t hear it. Our Insights process digs deep into your pipeline, CRM data, and market signals to identify exactly where high-value opportunities are hiding — before your competitors see them.',
    points: ['Pipeline health analysis & scoring', 'Ideal Customer Profile (ICP) refinement', 'Competitive landscape mapping', 'Revenue gap identification', 'High-value account targeting'],
    bg: 'bg-white', textColor: 'text-zinc-900', descColor: 'text-zinc-500', pointColor: 'text-zinc-600',
    labelColor: 'text-red-700', sectionBorder: 'border-b border-zinc-100',
    input: 'RAW PIPELINE DATA', output: 'TARGET ACCOUNT LIST',
    boxBorder: 'border-zinc-200', outputBorder: 'border-red-700', outputText: 'text-red-700',
    icon: Database, iconBg: 'bg-red-50', iconColor: 'text-red-700',
    metrics: [
      { label: 'Signals analysed', value: '200+', pct: 100 },
      { label: 'Avg ICP match rate', value: '87%', pct: 87 },
      { label: 'Opportunities surfaced', value: '3.4×', pct: 70 },
    ],
    dark: false,
  },
  {
    num: '02', label: 'PLANNING', title: 'The Blueprint',
    subtitle: 'Architecting your revenue machine.',
    description: 'Insights without architecture are wasted. We translate data into a precision sales blueprint — covering messaging, cadences, CRM workflows, and team playbooks, all engineered for velocity and repeatability.',
    points: ['Sales script & messaging development', 'CRM setup & workflow automation', 'Multi-touch cadence architecture', 'Lead scoring model design', 'Team roles & accountability framework'],
    bg: 'bg-zinc-900', textColor: 'text-white', descColor: 'text-zinc-400', pointColor: 'text-zinc-300',
    labelColor: 'text-red-400', sectionBorder: '',
    input: 'INSIGHTS & ICP DATA', output: 'SALES ARCHITECTURE',
    boxBorder: 'border-zinc-700', outputBorder: 'border-white', outputText: 'text-white',
    icon: Layout, iconBg: 'bg-zinc-800', iconColor: 'text-zinc-300',
    metrics: [
      { label: 'Playbook components', value: '40+', pct: 80 },
      { label: 'CRM automation rate', value: '92%', pct: 92 },
      { label: 'Time to launch', value: '14d', pct: 50 },
    ],
    dark: true,
  },
  {
    num: '03', label: 'EXECUTION', title: 'The 24',
    subtitle: 'Managing the revenue engine, around the clock.',
    description: 'This is where strategy becomes revenue. Our execution team manages the full sales lifecycle — outreach, follow-up, objection handling, closing coordination — on a 24-hour cycle so no lead ever goes cold.',
    points: ['Outbound prospecting & outreach management', 'Lead nurturing & follow-up sequencing', 'Objection handling & deal acceleration', 'Pipeline reporting & weekly reviews', 'Continuous optimisation based on live data'],
    bg: 'bg-white', textColor: 'text-zinc-900', descColor: 'text-zinc-500', pointColor: 'text-zinc-600',
    labelColor: 'text-red-700', sectionBorder: 'border-t border-zinc-100',
    input: 'SALES BLUEPRINT', output: 'CLOSED REVENUE',
    boxBorder: 'border-zinc-200', outputBorder: 'border-red-700', outputText: 'text-red-700',
    icon: Activity, iconBg: 'bg-red-50', iconColor: 'text-red-700',
    metrics: [
      { label: 'Follow-up rate', value: '95%', pct: 95 },
      { label: 'Avg response time', value: '<2h', pct: 85 },
      { label: 'Close rate uplift', value: '3.4×', pct: 70 },
    ],
    dark: false,
  },
];

export default function EnginePage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 bg-white border-b border-zinc-100 relative overflow-hidden">
        {/* animated accent line */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-red-700"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
        />
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-[10px] font-semibold uppercase tracking-widest text-red-700 mb-3"
              >
                Methodology
              </motion.p>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 leading-[0.88] mb-4">
                The <span className="text-red-700 italic">Engine</span>
              </h1>
              <p className="text-base text-zinc-500 max-w-xl leading-relaxed">
                How we manage your complete revenue lifecycle — from raw data to closed deals — through three interlocking phases.
              </p>
            </motion.div>
            {/* Stacked phase labels */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="hidden lg:flex flex-col gap-2"
            >
              {[
                { num: '01', label: 'Insights', color: 'border-red-700 text-red-700' },
                { num: '02', label: 'Planning', color: 'border-zinc-300 text-zinc-500' },
                { num: '03', label: 'Execution', color: 'border-zinc-300 text-zinc-500' },
              ].map((phase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.12 }}
                  className={`flex items-center gap-4 px-5 py-3 border-l-2 ${phase.color}`}
                >
                  <span className="text-xs font-black opacity-40">{phase.num}</span>
                  <span className="text-sm font-bold uppercase tracking-widest">{phase.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section className="bg-zinc-900 py-6 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 md:gap-0">
            {['INSIGHTS', 'PLANNING', 'EXECUTION', 'REVENUE'].map((step, idx) => (
              <React.Fragment key={step}>
                <div className={`px-4 py-2 border text-[10px] font-semibold uppercase tracking-widest ${
                  step === 'REVENUE' ? 'border-red-700 text-red-500' : 'border-zinc-700 text-zinc-400'
                }`}>
                  {step}
                </div>
                {idx < 3 && <div className="hidden md:block w-6 h-px bg-red-700 mx-1" />}
                {idx < 3 && <div className="md:hidden text-zinc-600 text-xs">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline Funnel + Clock */}
      <section className="bg-zinc-900 py-14 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-red-500 mb-2">Pipeline Intelligence</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-4 leading-tight">
                A managed pipeline<br /><span className="text-red-500">converts 6× better.</span>
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Without management, the average B2B funnel loses 94% of leads before a proposal. Our 24-hour execution cycle keeps momentum at every stage.
              </p>
              <PipelineFlow />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-6"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 self-start">The 24-Hour Execution Cycle</p>
              <CycleClock />
              <div className="w-full space-y-3">
                {[
                  { time: '00:00–08:00', task: 'Analytics, insights & pipeline scoring', bg: 'bg-zinc-800' },
                  { time: '08:00–16:00', task: 'Outreach, follow-up & meeting management', bg: 'bg-red-700/20 border border-red-700/30' },
                  { time: '16:00–24:00', task: 'Closing coordination & daily reporting', bg: 'bg-zinc-800' },
                ].map((block, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 }}
                    className={`flex items-center gap-4 px-4 py-3 ${block.bg}`}
                  >
                    <span className="text-[9px] font-black text-red-500 w-24 flex-shrink-0">{block.time}</span>
                    <span className="text-[10px] text-zinc-300">{block.task}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Phase Sections */}
      {phases.map((phase, idx) => (
        <section key={idx} className={`py-16 px-6 ${phase.bg} ${phase.sectionBorder}`}>
          <div className="max-w-6xl mx-auto">
            <div className={`grid lg:grid-cols-2 gap-12 items-start ${idx === 1 ? 'lg:grid-flow-dense' : ''}`}>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, x: idx === 1 ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`space-y-6 ${idx === 1 ? 'lg:col-start-2' : ''}`}
              >
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-widest ${phase.labelColor} mb-2`}>
                    Phase {phase.num} — {phase.label}
                  </p>
                  <h2 className={`text-3xl md:text-4xl font-black tracking-tight ${phase.textColor} leading-tight mb-2`}>
                    {phase.title}
                  </h2>
                  <p className={`text-sm ${phase.descColor} italic`}>{phase.subtitle}</p>
                </div>

                <p className={`${phase.descColor} text-sm leading-relaxed`}>{phase.description}</p>

                <ul className="space-y-2.5">
                  {phase.points.map((point, pIdx) => (
                    <li key={pIdx} className={`flex items-center gap-3 text-sm ${phase.pointColor}`}>
                      <div className="w-1 h-1 rounded-full flex-shrink-0 bg-red-700" />
                      {point}
                    </li>
                  ))}
                </ul>

                {/* Phase metrics */}
                <div className={`border-t pt-5 space-y-3 ${phase.dark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                  <p className={`text-[9px] uppercase tracking-widest font-semibold ${phase.descColor}`}>Phase Metrics</p>
                  {phase.metrics.map((m, mIdx) => (
                    <FunnelBar
                      key={mIdx}
                      label={m.label}
                      value={m.value}
                      pct={m.pct}
                      color="bg-red-700"
                      dark={phase.dark}
                      delay={mIdx * 0.1}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Diagram */}
              <motion.div
                initial={{ opacity: 0, x: idx === 1 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={idx === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}
              >
                <div className={`border ${phase.boxBorder} p-6 space-y-5`}>
                  <div className={`border ${phase.boxBorder} p-4`}>
                    <p className={`text-[9px] font-semibold uppercase tracking-widest ${phase.descColor} mb-1.5`}>Input</p>
                    <p className={`text-base font-bold tracking-tight ${phase.textColor}`}>{phase.input}</p>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 flex items-center justify-center ${phase.iconBg}`}>
                      <phase.icon size={16} className={phase.iconColor} />
                    </div>
                    <div className="w-px h-5 bg-red-700" />
                    <p className={`text-[9px] font-semibold uppercase tracking-widest ${phase.labelColor}`}>{phase.label}</p>
                  </div>

                  <div className={`border-2 ${phase.outputBorder} p-4`}>
                    <p className={`text-[9px] font-semibold uppercase tracking-widest ${phase.outputText} mb-1.5`}>Output</p>
                    <p className={`text-base font-bold tracking-tight ${phase.textColor}`}>{phase.output}</p>
                  </div>

                  {/* Animated progress indicators */}
                  <div className={`border-t pt-4 ${phase.dark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                    <p className={`text-[9px] uppercase tracking-widest font-semibold mb-3 ${phase.descColor}`}>Live Activity</p>
                    <div className="space-y-2">
                      {['Analysing signals', 'Scoring accounts', 'Generating output'].map((act, aIdx) => (
                        <motion.div
                          key={aIdx}
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: aIdx * 0.2 + 0.4 }}
                          className="flex items-center gap-2"
                        >
                          <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-red-600"
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: aIdx * 0.5 }}
                          />
                          <span className={`text-[9px] ${phase.descColor}`}>{act}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="bg-zinc-900 py-14 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
              Ready to start <span className="text-red-500">the engine?</span>
            </h2>
            <p className="text-zinc-400 text-sm">Request your audit and we'll show you exactly where it needs to fire.</p>
          </div>
          <Link
            href="/briefing"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-red-700 text-white text-sm font-semibold uppercase tracking-wider hover:bg-red-800 transition-colors group whitespace-nowrap"
          >
            Request Sales Audit
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

    </div>
  );
}
