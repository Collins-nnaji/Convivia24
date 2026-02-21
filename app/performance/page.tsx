'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';

/* ─── Animated horizontal bar ───────────────────────────────────── */
function AnimatedBar({ before, after, dark = false }: { before: number; after: number; dark?: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="space-y-2.5">
      <div className="flex items-center gap-3">
        <span className={`text-[9px] font-semibold uppercase tracking-widest w-12 flex-shrink-0 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>Before</span>
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
        <span className="text-[9px] font-semibold uppercase tracking-widest w-12 flex-shrink-0 text-red-600">After</span>
        <div className={`flex-1 h-1.5 rounded-full ${dark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
          <motion.div
            className="h-1.5 rounded-full bg-red-600"
            initial={{ width: '0%' }}
            animate={inView ? { width: `${after}%` } : { width: '0%' }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
        <span className="text-xs font-semibold text-red-600 w-8 text-right">{after}%</span>
      </div>
    </div>
  );
}

/* ─── Column Chart ───────────────────────────────────────────────── */
function ColumnChart({ data, dark = false }: {
  data: { label: string; before: number; after: number }[];
  dark?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const max = Math.max(...data.flatMap(d => [d.before, d.after]));
  const chartH = 120;

  return (
    <div ref={ref} className="w-full">
      <div className="flex items-end justify-around gap-3" style={{ height: chartH }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center gap-1" style={{ height: chartH - 20 }}>
              {/* Before */}
              <div className="flex-1 flex flex-col justify-end">
                <motion.div
                  className={`w-full rounded-t-sm ${dark ? 'bg-zinc-700' : 'bg-zinc-200'}`}
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${(d.before / max) * (chartH - 20)}px` } : {}}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.08 }}
                />
              </div>
              {/* After */}
              <div className="flex-1 flex flex-col justify-end">
                <motion.div
                  className="w-full rounded-t-sm bg-red-600"
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${(d.after / max) * (chartH - 20)}px` } : {}}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.08 + 0.2 }}
                />
              </div>
            </div>
            <p className={`text-[8px] uppercase tracking-widest text-center ${dark ? 'text-zinc-600' : 'text-zinc-400'}`} style={{ fontSize: 7 }}>
              {d.label.split(' ').slice(0, 2).join(' ')}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className={`w-3 h-2 rounded-sm ${dark ? 'bg-zinc-700' : 'bg-zinc-200'}`} />
          <span className={`text-[9px] uppercase tracking-widest ${dark ? 'text-zinc-600' : 'text-zinc-400'}`}>Before</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-red-600" />
          <span className={`text-[9px] uppercase tracking-widest ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>After Convivia24</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Timeline Line Chart ────────────────────────────────────────── */
function TimelineChart() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const quarters = ["Q1'24", "Q2'24", "Q3'24", "Q4'24", "Q1'25", "Q2'25", "Q3'25", "Q4'25"];
  const portfolio  = [100, 128, 156, 192, 248, 310, 389, 470];
  const benchmark  = [100, 103, 107, 111, 116, 120, 125, 130];

  // Fixed viewBox dimensions — no % inside SVG coordinates
  const VW = 400; const VH = 130;
  const PAD_L = 28; const PAD_R = 8; const PAD_T = 8; const PAD_B = 4;
  const plotW = VW - PAD_L - PAD_R;
  const plotH = VH - PAD_T - PAD_B;
  const maxVal = 500;

  const toX = (i: number) => PAD_L + (i / (quarters.length - 1)) * plotW;
  const toY = (v: number) => PAD_T + plotH - (v / maxVal) * plotH;

  const portfolioPts  = portfolio.map((v, i)  => `${toX(i)},${toY(v)}`).join(' ');
  const benchmarkPts  = benchmark.map((v, i)  => `${toX(i)},${toY(v)}`).join(' ');

  const areaPath = [
    `M ${toX(0)} ${toY(portfolio[0])}`,
    ...portfolio.map((v, i) => `L ${toX(i)} ${toY(v)}`),
    `L ${toX(portfolio.length - 1)} ${PAD_T + plotH}`,
    `L ${toX(0)} ${PAD_T + plotH}`,
    'Z',
  ].join(' ');

  // Y-axis labels at fixed values
  const yTicks = [100, 200, 300, 400, 470];

  return (
    <div ref={ref} className="w-full">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full overflow-visible"
        style={{ height: 160 }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b91c1c" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#b91c1c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map(tick => (
          <line
            key={tick}
            x1={PAD_L} y1={toY(tick)}
            x2={VW - PAD_R} y2={toY(tick)}
            stroke="#27272a" strokeWidth="0.75"
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map(tick => (
          <text
            key={`yl-${tick}`}
            x={PAD_L - 4} y={toY(tick) + 3}
            textAnchor="end"
            fill="#52525b"
            fontSize="7"
          >
            {tick}
          </text>
        ))}

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="url(#perfGrad)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        />

        {/* Benchmark dashed line */}
        <motion.polyline
          points={benchmarkPts}
          fill="none"
          stroke="#52525b"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* Portfolio line */}
        <motion.polyline
          points={portfolioPts}
          fill="none"
          stroke="#b91c1c"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.6, ease: 'easeOut', delay: 0.2 }}
        />

        {/* End dot */}
        <motion.circle
          cx={toX(portfolio.length - 1)}
          cy={toY(portfolio[portfolio.length - 1])}
          r="4"
          fill="#b91c1c"
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ delay: 1.8, duration: 0.3 }}
        />

        {/* X-axis quarter labels — every other one */}
        {quarters.map((q, i) => i % 2 === 0 && (
          <text
            key={q}
            x={toX(i)}
            y={VH}
            textAnchor="middle"
            fill="#52525b"
            fontSize="7"
          >
            {q}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-red-700" />
          <span className="text-[9px] uppercase tracking-widest text-zinc-500">Portfolio Revenue Index</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 border-t border-dashed border-zinc-600" />
          <span className="text-[9px] uppercase tracking-widest text-zinc-600">Industry Benchmark</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Animated Counter ───────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let v = 0;
    const step = target / (1800 / 16);
    const t = setInterval(() => {
      v += step;
      if (v >= target) { setCount(target); clearInterval(t); }
      else setCount(v);
    }, 16);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{Math.round(count)}{suffix}</span>;
}

import { useEffect } from 'react';

const caseStudies = [
  {
    name: 'Global Tech Co.', industry: 'B2B Technology',
    challenge: 'Stagnant pipeline with a 180-day average sales cycle and a conversion rate of just 4%. No CRM process, no cadence, no visibility into deal stages.',
    results: [{ label: 'Pipeline Velocity', before: 15, after: 72 }, { label: 'Conversion Rate', before: 4, after: 31 }],
    stat: '340%', statLabel: 'Revenue increase in 6 months', dark: false,
    timeline: [
      { month: 'Month 1', action: 'Insights audit & ICP mapping' },
      { month: 'Month 2', action: 'CRM rebuild & playbook launch' },
      { month: 'Month 3', action: 'Full outbound cadence activated' },
      { month: 'Month 6', action: '340% revenue uplift confirmed' },
    ],
  },
  {
    name: 'Retail Chain Ltd.', industry: 'Retail & Distribution',
    challenge: 'A 12-person sales team with no shared playbook, inconsistent follow-up, and high churn on warm leads. Losing deals to smaller, more responsive competitors.',
    results: [{ label: 'Lead Follow-Up Rate', before: 22, after: 95 }, { label: 'Deal Close Rate', before: 18, after: 61 }],
    stat: '60%', statLabel: 'Reduction in sales cycle length', dark: true,
    timeline: [
      { month: 'Week 1', action: 'Pipeline health diagnostic' },
      { month: 'Week 3', action: 'Cadence & follow-up system deployed' },
      { month: 'Month 2', action: 'Close rate exceeds 50%' },
      { month: 'Month 4', action: '60% cycle reduction confirmed' },
    ],
  },
  {
    name: 'FinServ Partners', industry: 'Financial Services',
    challenge: 'High-value prospects were going cold due to lack of structured outreach. No data on which accounts to prioritise or when to engage.',
    results: [{ label: 'Account Engagement Rate', before: 8, after: 67 }, { label: 'Qualified Meetings Booked', before: 11, after: 84 }],
    stat: '₦2.1M', statLabel: 'New revenue in year one', dark: false,
    timeline: [
      { month: 'Month 1', action: 'ICP scoring & account tiering' },
      { month: 'Month 2', action: 'Intelligence-led outreach live' },
      { month: 'Month 5', action: 'Qualified pipeline hits ₦3M' },
      { month: 'Month 12', action: '₦2.1M closed & recognised' },
    ],
  },
];

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 bg-zinc-900 relative overflow-hidden">
        {/* Animated red underline */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-red-700"
          initial={{ width: 0 }}
          animate={{ width: '40%' }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
        />
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[10px] font-semibold uppercase tracking-widest text-red-500 mb-3"
              >
                Results
              </motion.p>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.88] mb-4">
                The Performance<br />
                <span className="text-red-500 italic">Ledger</span>
              </h1>
              <p className="text-base text-zinc-400 max-w-xl leading-relaxed">
                Agencies show portfolios. Management companies show ledgers. Here are the numbers.
              </p>
            </motion.div>
            {/* Quick stat column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:flex flex-col gap-1"
            >
              {[
                { label: 'Portfolio CAGR', val: '97%' },
                { label: 'Industry CAGR', val: '8%' },
                { label: 'Outperformance', val: '12×' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center justify-between border-b border-zinc-800 py-3"
                >
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">{item.label}</span>
                  <span className="text-lg font-black text-red-500">{item.val}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="bg-white py-12 px-6 border-b border-zinc-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
            {[
              { value: 340, suffix: '%', label: 'Average pipeline velocity increase', desc: 'Across all active client engagements', spark: [20, 40, 80, 140, 200, 260, 340] },
              { value: 60, suffix: '%', label: 'Average sales cycle reduction', desc: 'From initial engagement to first managed close', spark: [100, 90, 80, 70, 60] },
              { value: 47, suffix: '', label: 'Clients under active management', desc: 'Across 6 industries in 3 countries', spark: [10, 18, 25, 33, 40, 47] },
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center text-center px-6 py-10 gap-2"
              >
                <p className="text-5xl md:text-6xl font-black text-red-700 leading-none">
                  <AnimatedCounter target={metric.value} suffix={metric.suffix} />
                </p>
                <p className="text-sm font-semibold text-zinc-900">{metric.label}</p>
                <p className="text-xs text-zinc-400">{metric.desc}</p>
                {/* Mini sparkline */}
                <svg width="80" height="28" viewBox="0 0 80 28" className="mt-2 opacity-60">
                  {(() => {
                    const max = Math.max(...metric.spark);
                    const min = Math.min(...metric.spark);
                    const pts = metric.spark.map((v, i) => {
                      const x = (i / (metric.spark.length - 1)) * 80;
                      const y = 28 - ((v - min) / (max - min || 1)) * 28;
                      return `${x},${y}`;
                    }).join(' ');
                    return (
                      <motion.polyline
                        points={pts}
                        fill="none" stroke="#b91c1c" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: idx * 0.1 + 0.3 }}
                      />
                    );
                  })()}
                </svg>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Timeline Chart */}
      <section className="bg-zinc-900 py-14 px-6 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-red-500 mb-2">Portfolio Performance</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4 leading-tight">
                470% growth.<br /><span className="text-red-500">8 quarters.</span>
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                The aggregate revenue index of all Convivia-managed client portfolios since Q1 2024, benchmarked against the industry average.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Portfolio CAGR', val: '97%' },
                  { label: 'Industry CAGR', val: '8%' },
                  { label: 'Outperformance', val: '12×' },
                  { label: 'Managed quarters', val: '8' },
                ].map((item, i) => (
                  <div key={i} className="border border-zinc-800 p-4">
                    <p className="text-xl font-black text-red-500 leading-none">{item.val}</p>
                    <p className="text-[9px] uppercase tracking-widest text-zinc-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Revenue Index (Base 100)</p>
                <TrendingUp size={14} className="text-zinc-600" />
              </div>
              <TimelineChart />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      {caseStudies.map((cs, idx) => (
        <section key={idx} className={`py-14 px-6 ${cs.dark ? 'bg-zinc-900' : 'bg-white'} border-b ${cs.dark ? 'border-zinc-800' : 'border-zinc-100'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-start">

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-5"
              >
                <div>
                  <span className={`inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-widest mb-3 ${
                    cs.dark ? 'bg-zinc-800 text-zinc-400' : 'bg-red-50 text-red-700'
                  }`}>
                    {cs.industry}
                  </span>
                  <h2 className={`text-2xl md:text-3xl font-black tracking-tight leading-tight ${cs.dark ? 'text-white' : 'text-zinc-900'}`}>
                    {cs.name}
                  </h2>
                </div>

                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${cs.dark ? 'text-zinc-500' : 'text-zinc-400'}`}>The Challenge</p>
                  <p className={`text-sm leading-relaxed ${cs.dark ? 'text-zinc-400' : 'text-zinc-600'}`}>{cs.challenge}</p>
                </div>

                <div className="border-l-4 border-red-700 pl-4">
                  <p className="text-4xl font-black text-red-600 leading-none">{cs.stat}</p>
                  <p className={`text-xs font-medium mt-1 ${cs.dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{cs.statLabel}</p>
                </div>

                {/* Engagement timeline */}
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-widest mb-3 ${cs.dark ? 'text-zinc-500' : 'text-zinc-400'}`}>Engagement Timeline</p>
                  <div className="relative pl-4 border-l-2 border-red-700/30 space-y-4">
                    {cs.timeline.map((event, eIdx) => (
                      <motion.div
                        key={eIdx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: eIdx * 0.1 }}
                        className="relative"
                      >
                        <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-red-700" />
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 text-red-600`}>{event.month}</p>
                        <p className={`text-xs ${cs.dark ? 'text-zinc-400' : 'text-zinc-600'}`}>{event.action}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
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

                {/* Column chart */}
                <div className={`p-6 border ${cs.dark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                  <p className={`text-[10px] font-semibold uppercase tracking-widest mb-4 ${cs.dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Metric Comparison
                  </p>
                  <ColumnChart data={cs.results} dark={cs.dark} />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* Manifesto */}
      <section className="bg-red-700 py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <motion.span
            className="text-[18rem] font-black text-red-800/40 leading-none"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            ₦
          </motion.span>
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-3">
              Results speak. We manage.
            </h2>
            <p className="text-red-200 text-sm max-w-md mx-auto leading-relaxed mb-8">
              No retainers for decks. No fees for frameworks. Only payment for outcomes you can measure.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { val: '340%', label: 'Pipeline velocity' },
                { val: '94%', label: 'Client retention' },
                { val: '24/7', label: 'Execution cycle' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="text-center"
                >
                  <p className="text-3xl font-black text-white leading-none">{stat.val}</p>
                  <p className="text-[9px] uppercase tracking-widest text-red-300 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-14 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-red-700 mb-2">Get Your Numbers</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 mb-2">
              What could your ledger look like?
            </h2>
            <p className="text-sm text-zinc-500">We'll benchmark your pipeline against our managed client average.</p>
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
