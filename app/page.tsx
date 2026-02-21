'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Target, Zap } from 'lucide-react';

/* Animated Counter */
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

/* Rotating Logo */
function RotatingLogo() {
  return (
    <div className="flex items-start justify-center w-full h-full pt-1 pb-2">
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

/* Data */
const pillars = [
  {
    num: '01', label: 'INSIGHTS', headline: 'The Convivia',
    desc: 'We find the life in your data — identifying exactly where your next high-value win is hiding before your competitors see it.',
    bg: 'bg-white', border: 'border-t-4 border-red-700',
    numColor: 'text-zinc-300', textColor: 'text-zinc-900', descColor: 'text-zinc-500',
    icon: Target, iconBg: 'bg-red-50', iconColor: 'text-red-700',
    metric: '+340%', metricLabel: 'avg pipeline velocity',
  },
  {
    num: '02', label: 'PLANNING', headline: 'The Blueprint',
    desc: 'We translate insights into a precision sales architecture — scripts, CRM workflows, and playbooks engineered for repeatability.',
    bg: 'bg-white', border: 'border-t-4 border-zinc-900',
    numColor: 'text-zinc-300', textColor: 'text-zinc-900', descColor: 'text-zinc-500',
    icon: TrendingUp, iconBg: 'bg-zinc-900', iconColor: 'text-white',
    metric: '60%', metricLabel: 'shorter sales cycles',
  },
  {
    num: '03', label: 'EXECUTION', headline: 'The 24',
    desc: 'Our team manages your full sales cycle around the clock — no lead goes cold, no opportunity goes missed.',
    bg: 'bg-white', border: 'border-t-4 border-red-700',
    numColor: 'text-zinc-300', textColor: 'text-zinc-900', descColor: 'text-zinc-500',
    icon: Zap, iconBg: 'bg-red-700', iconColor: 'text-white',
    metric: '94%', metricLabel: 'client retention rate',
  },
];

/* Page */
export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden relative">

      {/* Hero */}
      <section className="pt-32 pb-0 px-6 bg-white relative overflow-hidden border-b border-red-200">
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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-700 text-white text-xs font-semibold uppercase tracking-widest mb-6">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Sales Management Firm
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-zinc-900 mb-6 whitespace-nowrap">
                Revenue Doesn't <span className="text-red-700 italic">Sleep.</span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-500 leading-relaxed max-w-xl mb-8">
                Convivia24 runs an always-on revenue cycle — insights, planning, and execution — turning stagnant pipelines into high-velocity growth, 24 hours a day.
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
                  href="/collective"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-zinc-300 text-zinc-700 text-sm font-semibold uppercase tracking-wider hover:border-zinc-900 hover:text-zinc-900 transition-colors"
                >
                  See What We Do
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
                    <p className="text-2xl font-black text-zinc-900">
                      <AnimatedCounter target={Number(m.v)} />{m.suffix}
                    </p>
                    <p className="text-xs uppercase tracking-widest text-zinc-500">{m.l}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Hero logo panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block relative justify-self-end self-start -mt-6"
            >
              <div className="p-6">
                <RotatingLogo />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700 text-center mt-2 mb-4">
                  Always On - 24 Hour Cycle
                </p>
                <div className="space-y-4 pt-6">
                  {[
                    'Clear pipeline diagnostics before execution begins.',
                    'A repeatable sales blueprint tailored to your team.',
                    '24-hour operating rhythm for consistent follow-through.',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-red-700" />
                      <p className="text-sm text-zinc-700 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-16 px-6 bg-white border-t border-red-200 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(220,38,38,0.06) 0px, rgba(220,38,38,0.06) 1px, transparent 1px, transparent 56px)' }}
        />
        <TrendingUp className="absolute -right-4 top-10 h-24 w-24 text-red-200/40 pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-700 mb-2">The Lifecycle</p>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-zinc-900">
              Three pillars. One engine.
            </h2>
            <p className="mt-3 max-w-2xl text-base text-zinc-600 leading-relaxed">
              We diagnose what blocks growth, build your revenue system, and run execution continuously so your team can focus on closing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((pillar, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.13, duration: 0.5 }}
                className="relative pl-6 pr-2 py-3 border-l-2 border-red-700/50"
              >
                <p className={`absolute top-0 right-0 text-6xl font-black ${pillar.numColor} leading-none select-none`}>
                  {pillar.num}
                </p>
                <div className={`w-10 h-10 ${pillar.iconBg} flex items-center justify-center ${pillar.iconColor} mb-5`}>
                  <pillar.icon size={18} />
                </div>
                <p className={`text-xs font-semibold uppercase tracking-widest ${pillar.iconColor} mb-2`}>{pillar.label}</p>
                <h3 className={`text-2xl font-bold ${pillar.textColor} mb-3`}>{pillar.headline}</h3>
                <p className={`${pillar.descColor} text-base leading-relaxed mb-6`}>{pillar.desc}</p>
                <div className="pt-4">
                  <p className={`text-2xl font-black ${pillar.textColor} leading-none`}>{pillar.metric}</p>
                  <p className={`text-xs uppercase tracking-widest ${pillar.descColor} mt-1`}>{pillar.metricLabel}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6">
            <Link href="/collective" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-red-700 transition-colors">
              Explore services <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* Industry Breakdown */}
      <section className="py-14 px-6 bg-white border-t border-red-200 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(220,38,38,0.05) 0px, rgba(220,38,38,0.05) 1px, transparent 1px, transparent 64px)' }}
        />
        <TrendingUp className="absolute left-6 top-8 h-20 w-20 text-red-200/40 pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-red-700 mb-2">Client Portfolio</p>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-zinc-900 mb-4 leading-tight">
              47 clients. 6 industries.
            </h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-8 max-w-3xl">
              We support high-growth B2B technology, financial services, retail, and professional services teams with one goal:
              predictable revenue growth backed by clear execution.
            </p>

            <div className="grid md:grid-cols-3 gap-6 border-t border-red-200 pt-6">
              {[
                { value: '94%', label: 'Retention rate' },
                { value: '68%', label: 'Hit 2x target' },
                { value: '87%', label: 'Renew annually' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="py-2"
                >
                  <p className="text-3xl font-black text-zinc-900">{item.value}</p>
                  <p className="text-sm text-zinc-600 mt-2">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 24 Section */}
      <section className="bg-white py-16 px-6 border-t border-red-200 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(220,38,38,0.05) 0px, rgba(220,38,38,0.05) 1px, transparent 1px, transparent 52px)' }}
        />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Always On</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 leading-none">
              Hours of <span className="text-red-700">Relentless</span> Execution.
            </h2>
            <p className="text-base text-zinc-600 max-w-2xl leading-relaxed">
              Growth does not pause at end of day. Our team runs one continuous cycle from insight to outreach to close reporting.
            </p>

            <div className="grid md:grid-cols-3 gap-6 border-t border-red-200 pt-6">
              {[
                { hour: '00-08', label: 'Analytics and Insights' },
                { hour: '08-16', label: 'Outreach and Follow-up' },
                { hour: '16-24', label: 'Closing and Reporting' },
              ].map((phase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative py-2"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.6 }}
                    className="h-[2px] bg-red-600/70 mb-3"
                  />
                  <p className="text-lg font-black text-red-700">{phase.hour}</p>
                  <p className="text-base text-zinc-700 mt-1">{phase.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-16 bg-white border-t border-red-200 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(220,38,38,0.05) 0px, rgba(220,38,38,0.05) 1px, transparent 1px, transparent 60px)' }}
        />
        <TrendingUp className="absolute right-6 top-10 h-24 w-24 text-red-200/40 pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm p-10 md:p-16 relative overflow-hidden shadow-xl shadow-zinc-200/70"
          >
            {/* Animated red accent line */}
            <motion.div
              className="absolute top-0 left-0 h-1 bg-red-700"
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-700/8 to-transparent pointer-events-none" />
            {/* Big ghost text */}
            <div className="absolute bottom-0 right-6 opacity-[0.05] select-none pointer-events-none">
              <span className="text-[9rem] font-black text-zinc-900 leading-none">24</span>
            </div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4"
                >
                  Next Step
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-4xl md:text-6xl font-black tracking-tight text-zinc-900 leading-tight mb-4"
                >
                  Ready to activate<br />
                  <span className="text-red-700">your growth?</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35 }}
                  className="text-zinc-600 text-sm leading-relaxed mb-8"
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
                    href="/intel"
                    className="inline-flex items-center gap-2 px-7 py-3.5 border border-zinc-300 text-zinc-700 text-sm font-semibold uppercase tracking-wider hover:border-zinc-900 hover:text-zinc-900 transition-colors"
                  >
                    View Intel
                  </Link>
                </motion.div>
              </div>

              {/* Right commitments */}
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
                    className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all"
                  >
                    <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{item.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{item.sub}</p>
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
