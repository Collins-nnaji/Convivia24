'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BedDouble, Flower2, UtensilsCrossed } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const TABS = [
  { id: 'stays', label: 'Stays', icon: BedDouble },
  { id: 'wellness', label: 'Wellness', icon: Flower2 },
  { id: 'dining', label: 'Dining', icon: UtensilsCrossed },
] as const;

type TabId = (typeof TABS)[number]['id'];

/* ── STAYS ── */
const ROOMS = [
  {
    num: '01',
    name: 'The Garden Room',
    tagline: 'City-view rooms. Slow mornings.',
    desc: 'A calm, generous room with a king bed, warm textiles, and floor-to-ceiling glass onto the skyline. A writing desk, a soaking tub, and coffee brought up at sunrise.',
    details: ['King bed · 42m²', 'Skyline views', 'Deep soaking tub', 'Breakfast & spa circuit included'],
    from: '₦180,000',
    image: '/Homepage.png',
  },
  {
    num: '02',
    name: 'The Garden Villa',
    tagline: 'Standalone. Private plunge pool.',
    desc: 'A standalone villa in the resort grounds, wrapped in brick and brass and greenery. Its own walled garden, a heated plunge pool, and total privacy for a couple or a family.',
    details: ['Two bedrooms · 120m²', 'Private heated plunge pool', 'Walled garden & outdoor shower', 'Dedicated host on call'],
    from: '₦560,000',
    image: '/Homepage2.png',
  },
  {
    num: '03',
    name: 'The Reading Suite',
    tagline: 'For long stays and quiet work.',
    desc: 'A one-bedroom suite with a private library-lounge, a long timber table, and a separate bedroom. Built for the guest who stays a week and works between treatments.',
    details: ['King suite · 68m²', 'Private library-lounge', 'Long working table', 'Evening turndown & ritual tray'],
    from: '₦320,000',
    image: '/Convivium.png',
  },
];

const STAY_INCLUDES = [
  { t: 'The wellness circuit', s: 'Every stay includes full daily access to the thermal circuit and pool.' },
  { t: 'Breakfast, slow', s: 'Served on the terrace or in your room, from sunrise until late morning.' },
  { t: 'Turndown ritual', s: 'Nightly, with a botanical sleep tray and the lights set low.' },
  { t: 'A dedicated host', s: 'One person who knows your name and handles everything, start to finish.' },
];

/* ── WELLNESS ── */
const CIRCUIT = [
  { num: '01', t: 'Heated infinity pool', s: 'Open from sunrise until 10pm.' },
  { num: '02', t: 'Cold plunge', s: '11°C — for recovery and clarity.' },
  { num: '03', t: 'Sauna & steam', s: 'Finnish sauna and eucalyptus steam.' },
  { num: '04', t: 'Relaxation deck', s: 'Loungers, herbal tea, and quiet.' },
];

const TREATMENTS = [
  { name: 'The Botanical Massage', dur: '60 / 90 min', desc: 'Cold-pressed oils infused with marula, baobab, and rooibos. Deep, unhurried, grounding.', from: '₦45,000' },
  { name: 'The Convivia Ritual', dur: '120 min', desc: 'Our signature journey — dry-brush, thermal circuit, hot-stone massage, and a scalp treatment to close.', from: '₦95,000' },
  { name: 'The Recovery', dur: '75 min', desc: 'Built for tired bodies. Lymphatic work, targeted deep tissue, and a guided cold plunge.', from: '₦58,000' },
  { name: 'The Couple’s Retreat', dur: '90 min', desc: 'Side-by-side in the garden suite, closing with tea on your own private terrace.', from: '₦120,000' },
];

const MOVEMENT = [
  { time: '7:00', t: 'Sunrise yoga', s: 'On the deck, all levels' },
  { time: '8:30', t: 'Breathwork', s: 'Guided, 45 minutes' },
  { time: '17:30', t: 'Sound bath', s: 'Gong & singing bowls' },
  { time: '18:30', t: 'Restorative yin', s: 'Candlelit, before dinner' },
];

/* ── DINING ── */
const MENU = [
  {
    category: 'Small Plates',
    items: ['Asun Skewers · scotch bonnet glaze', 'Pepper Soup Dumplings · ukpaka dipping sauce', 'Crab Akara · mango avocado, pickled cucumber', 'Puff Puff · truffle honey, aged parmesan'],
  },
  {
    category: 'Mains',
    items: ['Wagyu Suya · suya spice rub, tiger nut salsa', 'Whole Bream · jollof-smoked butter, yam purée', 'Ẹ̀gúsí Risotto · toasted melon seed, parmesan', 'Oha Leaf Pasta · crayfish, crispy garlic'],
  },
  {
    category: 'From the Bar',
    items: ['Convivia Negroni · palm wine-washed gin', 'Lagos Sour · Nigerian rum, tamarind, lime', 'Zobo Smash · hibiscus gin, mint, cucumber', 'The 24 · daily-changing. Ask the bar.'],
  },
];

const PROGRAMMING = [
  { frequency: 'Saturday & Sunday', name: 'Jazz Brunch', desc: 'Live jazz quartet, an extended brunch menu, and the slowest morning you\'ve had all week. 12pm to 5pm.' },
  { frequency: 'Thursday – Saturday', name: 'Late Night', desc: 'The kitchen closes. The bar does not. DJs from 11pm. Bar menu until 2am. The Lounge open until 3am.' },
  { frequency: 'Monthly', name: 'The Convivia Dinner', desc: 'Twelve people. One table. A menu written for the evening — member and guest invitations only.' },
];

export default function StaysPage() {
  const [tab, setTab] = useState<TabId>('stays');

  // Honour hash on load (e.g. /stays#wellness) and hash changes.
  useEffect(() => {
    const applyHash = () => {
      const h = window.location.hash.replace('#', '') as TabId;
      if (TABS.some((t) => t.id === h)) setTab(h);
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  function selectTab(id: TabId) {
    setTab(id);
    if (typeof window !== 'undefined') history.replaceState(null, '', `#${id}`);
  }

  const hero =
    tab === 'wellness'
      ? { img: '/Homepage.png', label: 'The Wellness', title: 'Leave lighter\nthan you arrived.', copy: 'A full-service spa, a thermal circuit, and a daily rhythm of movement — designed as one continuous ritual. Residents enjoy the circuit at no charge.' }
      : tab === 'dining'
      ? { img: '/Homepage.png', label: 'The Table & Lounge', title: 'Farm to table.\nDusk till late.', copy: 'A restaurant built around the resort garden by day, and a candlelit lounge with a daily-changing cocktail by night. Guests dine on the terrace; the lounge opens to all from four.' }
      : { img: '/Homepage.png', label: 'The Resort', title: 'Stay. Restore.\nGather.', copy: 'Rooms, villas, a spa, and a table — one resort, three things done properly. Every stay includes breakfast and full use of the wellness circuit.' };

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[62vh] bg-obsidian flex items-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0">
          {hero.img ? (
            <>
              <img src={hero.img} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/60 to-obsidian/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-obsidian/30" />
            </>
          ) : (
            <>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(150deg, #14110b 0%, #221a0e 35%, #0a0a0a 70%, #1c1810 100%)' }} />
              <div className="absolute -top-24 -right-24 w-[32rem] h-[32rem] rounded-full bg-gold/15 blur-3xl" />
              <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-radial-gradient(circle at 85% 110%, rgba(226,201,126,0.6) 0, rgba(226,201,126,0.6) 1px, transparent 1px, transparent 14px)' }} />
            </>
          )}
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-20 w-full">
          <motion.div key={tab} initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>{hero.label}</SectionLabel></motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-4xl sm:text-6xl md:text-7xl font-light italic tracking-tight text-cream leading-[0.9] mb-6 whitespace-pre-line">
              {hero.title}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-base sm:text-lg text-cream/70 max-w-lg leading-relaxed">
              {hero.copy}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* STICKY TABS */}
      <div className="sticky top-16 z-30 bg-obsidian/95 backdrop-blur-md border-y border-gold/15">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => selectTab(id)}
                className={`relative inline-flex items-center gap-2 px-4 sm:px-6 py-5 text-sm sm:text-[15px] font-bold uppercase tracking-[0.18em] transition-colors whitespace-nowrap ${
                  active ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <Icon size={17} strokeWidth={2} /> {label}
                {active && <motion.span layoutId="tab-underline" className="absolute left-3 right-3 -bottom-px h-0.5 bg-gold" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'stays' && <StaysSection />}
      {tab === 'wellness' && <WellnessSection />}
      {tab === 'dining' && <DiningSection />}

      {/* CTA */}
      <section className="brand-gradient">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-cream mb-2">Plan your escape.</h2>
            <p className="text-cream/70 text-sm">Stay &middot; Restore &middot; Gather &middot; Lagos &middot; Abuja &middot; London</p>
          </div>
          <Link href="/inquire" className="inline-flex items-center gap-2 px-8 py-4 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0">
            Book a Stay <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}

/* ═══════════════ STAYS ═══════════════ */
function StaysSection() {
  return (
    <>
      <section id="stays" className="bg-cream py-20 sm:py-28 scroll-mt-32">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-6">
          {ROOMS.map((room, i) => (
            <motion.div
              key={room.num}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${i % 2 === 1 ? 'lg:[direction:rtl]' : ''}`}
            >
              <motion.div variants={fadeUp} className="relative [direction:ltr]">
                <img src={room.image} alt={room.name} className="w-full aspect-[4/3] object-cover" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gold" />
                <span className="absolute bottom-4 right-5 font-display text-6xl italic text-cream/90 leading-none select-none drop-shadow-lg">{room.num}</span>
              </motion.div>
              <div className="[direction:ltr]">
                <motion.p variants={fadeUp} className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-3">{room.tagline}</motion.p>
                <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl italic text-obsidian tracking-tight mb-4">{room.name}</motion.h2>
                <motion.p variants={fadeUp} className="text-obsidian/60 text-base leading-relaxed mb-6 max-w-md">{room.desc}</motion.p>
                <motion.ul variants={fadeUp} className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-8">
                  {room.details.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-sm text-obsidian/70">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      {d}
                    </li>
                  ))}
                </motion.ul>
                <motion.div variants={fadeUp} className="flex items-center gap-6">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-obsidian/40 block">From</span>
                    <span className="font-display text-2xl italic text-obsidian">{room.from}<span className="text-sm not-italic text-obsidian/40"> / night</span></span>
                  </div>
                  <Link href="/inquire" className="inline-flex items-center gap-2 px-6 py-3 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors">
                    Reserve <ArrowRight size={13} />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-obsidian py-20 sm:py-28 border-t border-gold/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp}><SectionLabel>Every Stay Includes</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight mb-12">
              The details,<br />handled.
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-gold/10">
              {STAY_INCLUDES.map((item) => (
                <motion.div key={item.t} variants={fadeUp} className="bg-obsidian p-8">
                  <h3 className="font-display text-xl italic text-cream mb-3">{item.t}</h3>
                  <p className="text-cream/40 text-sm leading-relaxed">{item.s}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

/* ═══════════════ WELLNESS ═══════════════ */
function WellnessSection() {
  return (
    <>
      <section id="wellness" className="bg-cream py-20 sm:py-28 scroll-mt-32">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp}><SectionLabel variant="light">The Thermal Circuit</SectionLabel></motion.div>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-16">
              <motion.div variants={fadeUp} className="relative">
                <img src="/Homepage.png" alt="The spa at Convivia24" className="w-full aspect-[4/3] object-cover object-[center_70%]" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gold" />
              </motion.div>
              <div>
                <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-obsidian tracking-tight mb-4">
                  Hot, cold,<br />and back again.
                </motion.h2>
                <motion.p variants={fadeUp} className="text-obsidian/60 text-base leading-relaxed mb-8 max-w-md">
                  A guided sequence through heat and cold that leaves the body loose and the mind quiet. Move at your own pace, or let a therapist lead you.
                </motion.p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                  {CIRCUIT.map((c) => (
                    <motion.div key={c.num} variants={fadeUp} className="border-t border-obsidian/10 pt-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-2 block">{c.num}</span>
                      <h3 className="font-display text-xl italic text-obsidian mb-1">{c.t}</h3>
                      <p className="text-obsidian/50 text-sm leading-relaxed">{c.s}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-obsidian py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp}><SectionLabel>Signature Treatments</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight mb-12">
              Rooted in the<br />continent.
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-px bg-gold/10">
              {TREATMENTS.map((tr) => (
                <motion.div key={tr.name} variants={fadeUp} className="bg-obsidian p-8 sm:p-10">
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="font-display text-2xl sm:text-3xl italic text-cream">{tr.name}</h3>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/50 shrink-0">{tr.dur}</span>
                  </div>
                  <p className="text-cream/50 text-sm leading-relaxed mb-6">{tr.desc}</p>
                  <div className="flex items-center justify-between border-t border-gold/10 pt-4">
                    <span className="text-cream/40 text-sm">from <span className="text-cream font-medium">{tr.from}</span></span>
                    <Link href="/inquire" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gold/70 hover:text-gold transition-colors">Book <ArrowRight size={11} /></Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-obsidian pb-20 sm:pb-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp}><SectionLabel>Daily Movement</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight mb-6">
              Open the day.<br />Close the day.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-cream/60 text-base leading-relaxed max-w-md">
              Every day opens and closes with a session on the deck &mdash; free to residents, no booking needed.
              Come to all of them, or none. The point is that they&apos;re there.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="space-y-3">
            {MOVEMENT.map((m) => (
              <motion.div key={m.time} variants={fadeUp} className="flex items-center gap-5 border border-gold/10 hover:border-gold/25 transition-colors px-6 py-5">
                <span className="font-display text-2xl italic text-gold/70 w-14 shrink-0">{m.time}</span>
                <div>
                  <p className="text-cream font-medium">{m.t}</p>
                  <p className="text-cream/40 text-xs mt-0.5">{m.s}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}

/* ═══════════════ DINING ═══════════════ */
function DiningSection() {
  return (
    <>
      <section id="dining" className="bg-obsidian py-20 sm:py-28 scroll-mt-32">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp}><SectionLabel>The Menu</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight mb-12">
              A taste of what<br />is on the table.
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-px bg-gold/10">
              {MENU.map((section) => (
                <motion.div key={section.category} variants={fadeUp} className="bg-obsidian p-8 sm:p-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/50 mb-6">{section.category}</p>
                  <ul className="space-y-4">
                    {section.items.map((item) => {
                      const [name, rest] = item.split(' · ');
                      return (
                        <li key={item} className="border-b border-gold/10 pb-4 last:border-0 last:pb-0">
                          <p className="font-display text-lg italic text-cream leading-snug">{name}</p>
                          {rest && <p className="text-cream/35 text-xs mt-1">{rest}</p>}
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              ))}
            </div>
            <motion.p variants={fadeUp} className="mt-8 text-xs text-cream/30 max-w-md leading-relaxed">
              We serve responsibly. Guests must be 18 or over to be served alcohol.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* IMAGE BREAK — the terrace bar */}
      <section className="relative bg-obsidian">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <img src="/conv1.png" alt="The terrace bar at Convivia24" className="w-full h-[40vh] sm:h-[50vh] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-obsidian/40" />
        </motion.div>
      </section>

      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp}><SectionLabel variant="light">Life at the Table</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-obsidian tracking-tight mb-12">
              A calendar,<br />not just a kitchen.
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-px bg-obsidian/10">
              {PROGRAMMING.map((p) => (
                <motion.div key={p.name} variants={fadeUp} className="bg-cream p-8 sm:p-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-4">{p.frequency}</p>
                  <h3 className="font-display text-2xl sm:text-3xl italic text-obsidian mb-4">{p.name}</h3>
                  <p className="text-obsidian/55 text-sm leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

