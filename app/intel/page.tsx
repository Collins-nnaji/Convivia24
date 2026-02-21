'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileBarChart, TrendingUp, Building2, BarChart3, Briefcase, ArrowRight, Check, Sparkles } from 'lucide-react';

const reports = [
  {
    id: 'benchmark',
    icon: BarChart3,
    title: 'Convivia Revenue Benchmark Report',
    subtitle: 'Flagship — Quarterly',
    desc: 'Aggregate anonymized data from our client portfolio: pipeline velocity benchmarks, close time averages, follow-up rates. See how high-performing sales operations look by industry.',
    price: '£300 – £800',
    tag: 'Most popular',
    features: ['Pipeline velocity by industry', 'Close time averages', 'Follow-up rate benchmarks'],
  },
  {
    id: 'pulse',
    icon: TrendingUp,
    title: 'The Nigerian Sales Pulse',
    subtitle: 'Monthly or Quarterly',
    desc: 'State-of-the-market report on B2B sales trends in Nigeria — deal cycles, sector activity, buyer behaviour shifts, pipeline health across industries.',
    price: '£150 – £400',
    tag: null,
    features: ['Deal cycle trends', 'Sector activity', 'Buyer behaviour shifts'],
  },
  {
    id: 'deepdive',
    icon: Building2,
    title: 'Industry Deep-Dives',
    subtitle: 'On demand',
    desc: 'Vertical-specific reports: "The B2B Tech Sales Landscape in West Africa 2025" or "Financial Services Revenue Trends: Nigeria & Ghana."',
    price: '£500 – £2,000',
    tag: null,
    features: ['Single vertical focus', 'Nigeria & West Africa', 'Competitive positioning'],
  },
  {
    id: 'health-index',
    icon: FileBarChart,
    title: 'The Convivia Sales Health Index',
    subtitle: 'Annual',
    desc: 'Scores the sales maturity of Nigerian businesses across sectors. Free to distribute — brand building that drives inbound pipeline for our managed services.',
    price: 'Free',
    tag: 'Lead magnet',
    features: ['Sector maturity scores', 'Annual release', 'Brand & lead gen'],
  },
  {
    id: 'investor',
    icon: Briefcase,
    title: 'Investor-Facing Deal Flow Reports',
    subtitle: 'Quarterly',
    desc: 'Briefs for VCs and PE firms on revenue performance trends across portfolio types. Intelligence for investment decisions.',
    price: '£1,000 – £3,000',
    tag: null,
    features: ['Portfolio revenue trends', 'Quarterly briefs', 'Investment-grade data'],
  },
];

const audiences = [
  'Lagos and Abuja business communities — Endeavor Nigeria, tech hubs',
  'Founders and CEOs who want insight without full Convivia engagement',
  'Private equity and VC firms with Nigerian / West African portfolio companies',
  'Multinationals expanding into Nigeria needing ground-level sales intelligence',
  'Business schools and MBA programmes as case study material',
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function IntelPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative pt-20 pb-14 sm:pt-24 sm:pb-20 px-4 sm:px-6 border-b border-zinc-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-50/40 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-semibold mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Reports & Intelligence
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-zinc-900 mb-5"
          >
            Convivia <span className="text-red-700 italic">Intel</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto mb-6 leading-relaxed"
          >
            We manage revenue for 47 clients across 6 industries — we see patterns nobody else sees.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-sm text-zinc-500 max-w-xl mx-auto mb-8"
          >
            Not public data. Live portfolio intelligence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-zinc-100 rounded-lg text-sm"
          >
            <span className="font-semibold text-white">Differentiator:</span>
            <span>Data informed by active management of ₦2M+ in annual revenue across 47 clients.</span>
          </motion.div>
        </div>
      </section>

      {/* Report cards */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2"
          >
            Report types
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-zinc-600 text-sm mb-10"
          >
            Premium intelligence you can’t get from public data.
          </motion.p>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="space-y-5"
          >
            {reports.map((r) => {
              const Icon = r.icon;
              return (
                <motion.article
                  key={r.id}
                  variants={item}
                  className="group border border-zinc-200 rounded-xl p-6 sm:p-8 hover:border-red-200 hover:shadow-lg hover:shadow-red-50/50 transition-all duration-200 bg-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <Icon className="text-red-700 w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-zinc-900">{r.title}</h3>
                        {r.tag && (
                          <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-red-700 text-white rounded-md">
                            {r.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">{r.subtitle}</p>
                      <p className="text-sm text-zinc-600 leading-relaxed mb-4">{r.desc}</p>
                      {r.features && r.features.length > 0 && (
                        <ul className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
                          {r.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-xs text-zinc-500">
                              <Check className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="text-sm font-bold text-red-700">{r.price}</p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Who buys */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-4xl mx-auto">
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

      {/* Upsell CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-zinc-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-700" />
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
            Every report is a pipeline for your business
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-10">
            Someone buys the Nigerian Sales Pulse, sees their business underperforming the benchmarks, and books a Sales Health Audit. The report pays for itself twice.
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
