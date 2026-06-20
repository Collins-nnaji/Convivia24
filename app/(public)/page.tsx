'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Wind, Sparkles, MessageCircle, CalendarHeart } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useUser } from '@/components/auth/AuthProvider';

const STEPS = [
  { icon: CalendarHeart, title: 'Live your day', desc: 'Add what matters — tasks, gatherings, the people in them. One soft, scrollable ribbon for your whole 24.' },
  { icon: Wind, title: 'Breathe between things', desc: 'Back-to-back plans automatically get a quiet 15-minute rest block between them. No setup, no thinking.' },
  { icon: Sparkles, title: 'Destress with one tap', desc: 'When a day gets heavy, ask for a calmer version. Low-priority things move themselves — you stay in control.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' as const } },
};

export default function HomePage() {
  const { user, loading } = useUser();
  const primaryHref = user ? '/my24' : '/signin?next=/my24';
  const primaryLabel = user ? 'Open My 24' : 'Get started';

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[78vh] sm:min-h-[90vh] bg-paper flex items-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-gold/15 blur-3xl animate-blob" />
          <div className="absolute top-1/3 -left-32 w-[24rem] h-[24rem] rounded-full bg-champagne/10 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 right-1/4 w-[20rem] h-[20rem] rounded-full bg-cream-dark/40 blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-28 w-full">
          <div className="max-w-2xl">
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
              <motion.div variants={fadeUp}>
                <SectionLabel>The Mindful Calendar</SectionLabel>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light italic tracking-tight text-obsidian leading-[0.9] mb-6 sm:mb-8"
              >
                Take back<br />your 24.
              </motion.h1>

              <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4 sm:mb-6">
                <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark">Lower your stress · Optimize your hours · Love your day</span>
              </motion.div>

              <motion.p variants={fadeUp} className="text-base sm:text-lg text-obsidian/65 max-w-lg leading-relaxed mb-8 sm:mb-10">
                You don&rsquo;t need more time in a day; you need a better 24 hours. Convivia24 is the
                calendar that protects your peace of mind — auto-buffering your back-to-back days and
                helping you destress with one tap.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href={loading ? '#' : primaryHref}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
                >
                  {primaryLabel} <ArrowRight size={14} />
                </Link>
                <Link
                  href="/companion"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-obsidian/25 text-obsidian text-[11px] font-black uppercase tracking-[0.2em] hover:border-gold hover:bg-white transition-colors"
                >
                  <MessageCircle size={13} /> Meet your Companion
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="bg-cream py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionLabel variant="light">How it works</SectionLabel>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-obsidian tracking-tight mb-12">
            A calmer way to keep<br />the day together.
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <div key={s.title} className="bg-white border border-obsidian/10 p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-display text-5xl italic text-gold/30">{String(i + 1).padStart(2, '0')}</span>
                  <s.icon className="text-gold-dark" size={22} />
                </div>
                <h3 className="font-display text-2xl italic text-obsidian mb-3">{s.title}</h3>
                <p className="text-obsidian/55 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPANION BREAK ═══ */}
      <section className="relative bg-obsidian">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/3 w-[26rem] h-[26rem] rounded-full bg-gold/10 blur-3xl animate-blob" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 sm:py-28 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3">Companion</p>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl italic text-white mb-5">&ldquo;What kind of day do you want tomorrow?&rdquo;</h2>
          <p className="text-white/55 text-base leading-relaxed mb-8 max-w-xl mx-auto">
            A learning companion that remembers what matters to you — and helps you plan around it,
            one conversation at a time.
          </p>
          <Link href="/companion" className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors">
            <Sparkles size={14} /> Talk to your Companion
          </Link>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">Your day deserves room to breathe.</h2>
            <p className="text-obsidian/60 text-sm">Lower your stress · Optimize your hours · Love your day</p>
          </div>
          <Link href={loading ? '#' : primaryHref} className="inline-flex items-center gap-2 px-8 py-4 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0">
            {primaryLabel} <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
