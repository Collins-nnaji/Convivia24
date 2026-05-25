import type { InsightPost } from './types';

export const INSIGHT_POSTS: InsightPost[] = [
  {
    slug: 'roi-dies-in-the-parking-lot',
    title: 'Why your activation ROI dies in the parking lot',
    dek: 'The gap between “samples handed out” and “samples accounted for” is where most FMCG budgets quietly evaporate.',
    category: 'field',
    tags: ['ROI', 'Sampling', 'Field ops'],
    publishedAt: '2025-04-02',
    readMinutes: 7,
    featured: true,
    issue: '014',
    author: { name: 'Amaka N.', role: 'Head of Field Operations' },
    accent: 'from-neutral-900 via-neutral-800 to-amber-950',
    accentMuted: 'from-amber-100/80 to-[#f8f6f2]',
    blocks: [
      {
        type: 'p',
        text: 'Every brand manager has seen the slide: impressions up, samples out, smiles in photos. Then procurement asks the only question that matters — what did we prove? — and the room goes quiet.',
      },
      {
        type: 'quote',
        text: 'If redemption isn’t tied to identity at the moment of handoff, you’re funding generosity, not growth.',
        attribution: 'Convivia24 field playbook',
      },
      {
        type: 'h2',
        text: 'The three leaks nobody audits',
      },
      {
        type: 'list',
        items: [
          'Duplicate redemptions from the same device across stands.',
          'Agents issuing samples without a verified guest pass check-in.',
          'End-of-day counts that don’t reconcile with live scan data.',
        ],
      },
      {
        type: 'stat',
        value: '98%',
        label: 'Redemption accuracy when passes + limits are enforced at scan',
      },
      {
        type: 'p',
        text: 'The fix isn’t more supervisors — it’s a single source of truth at the stand. Branded QR passes, per-phone limits, and a dashboard that updates before the mall closes. When ops can see leakage in real time, finance stops treating field activations as a black box.',
      },
      {
        type: 'callout',
        title: 'Field truth',
        body: 'Brands that close the loop in under 24 hours repeat the same cities twice as fast — because procurement trusts the numbers.',
      },
    ],
  },
  {
    slug: 'ninety-second-guest-pass',
    title: 'The 90-second rule of guest passes',
    dek: 'How long it takes a curious shopper to decide whether your pass feels like spam — or like VIP access.',
    category: 'activation',
    tags: ['Guest passes', 'UX', 'Conversion'],
    publishedAt: '2025-03-18',
    readMinutes: 5,
    featured: true,
    issue: '013',
    author: { name: 'David O.', role: 'Product & Activation' },
    accent: 'from-gold-dark via-gold to-amber-600',
    accentMuted: 'from-gold/15 to-[#f8f6f2]',
    blocks: [
      {
        type: 'p',
        text: 'We timed 200 pass issuances across three Lagos malls. The median “trust decision” — will I tap this? — happened at 94 seconds. Not on your landing page. At the stand, on a cracked phone screen, with music and mall noise in the background.',
      },
      {
        type: 'h2',
        text: 'What wins in 90 seconds',
      },
      {
        type: 'list',
        items: [
          'Your logo, not a generic “event” icon.',
          'One sentence: what they get, not what you’re collecting.',
          'A progress bar that shows “2 taps to sample” — not a form wall.',
        ],
      },
      {
        type: 'p',
        text: 'Passes that looked like tickets (gold edge, serif headline, clear expiry) converted 41% higher than passes that looked like survey links. NDPR consent still matters — but it belongs after value is obvious, not before.',
      },
      {
        type: 'quote',
        text: 'Treat the pass like a product sample, not a legal document. Compliance can be layered; curiosity cannot be recovered.',
      },
    ],
  },
  {
    slug: 'twelve-thousand-scans-lagos',
    title: 'What 12,000 scans taught us about Lagos mall sampling',
    dek: 'Peak hours, stand placement, and the surprising hour when redemption beats footfall.',
    category: 'data',
    tags: ['Lagos', 'Malls', 'Analytics'],
    publishedAt: '2025-03-05',
    readMinutes: 8,
    featured: false,
    issue: '012',
    author: { name: 'Chioma E.', role: 'Insights & Analytics' },
    accent: 'from-emerald-900 via-teal-900 to-neutral-900',
    accentMuted: 'from-emerald-50 to-[#f8f6f2]',
    blocks: [
      {
        type: 'p',
        text: 'Aggregated across six beverage and personal-care activations in Q1, one pattern dominated: check-ins clustered around food court adjacency, not main atrium visibility. Brands paid for foot traffic; shoppers converted where they already slowed down.',
      },
      {
        type: 'stat',
        value: '17:40',
        label: 'Average peak redemption window (not opening hour)',
      },
      {
        type: 'h2',
        text: 'Three data cuts worth requesting',
      },
      {
        type: 'list',
        items: [
          'Redemptions per stand hour — not just per day.',
          'New vs returning devices (loyalty signal).',
          'Photo uploads per 100 redemptions (UGC health).',
        ],
      },
      {
        type: 'p',
        text: 'When stands moved 15 metres toward exit corridors, same-day redemptions rose 12% without extra staff. The insight isn’t “busier is better” — it’s “intent-rich micro-zones beat loud visibility.”',
      },
      {
        type: 'callout',
        title: 'Dashboard habit',
        body: 'Teams that review live data at hour 3 adjust stand scripts by hour 5. Teams that wait for PDFs adjust next quarter — if they activate again.',
      },
    ],
  },
  {
    slug: 'ugc-without-apology-tour',
    title: 'UGC without the apology tour',
    dek: 'Moderation workflows that keep legal calm and marketing loud.',
    category: 'brand',
    tags: ['UGC', 'Compliance', 'Photo wall'],
    publishedAt: '2025-02-20',
    readMinutes: 6,
    featured: false,
    issue: '011',
    author: { name: 'Tunde A.', role: 'Brand Safety' },
    accent: 'from-violet-950 via-purple-900 to-neutral-900',
    accentMuted: 'from-violet-50 to-[#f8f6f2]',
    blocks: [
      {
        type: 'p',
        text: 'The worst brand moment isn’t a bad photo — it’s a bad photo live for four hours because nobody knew it was public. Moderation isn’t censorship; it’s a publish queue with teeth.',
      },
      {
        type: 'h2',
        text: 'The 4-eye wall',
      },
      {
        type: 'list',
        items: [
          'Field upload → on-site queue (agent can’t publish).',
          'Brand reviewer approves in app — timestamped.',
          'Only then does it hit the public photo wall.',
          'Auto-expire after campaign end.',
        ],
      },
      {
        type: 'quote',
        text: 'Speed to social is a vanity metric. Speed to safe is a repeat-buy metric.',
      },
      {
        type: 'p',
        text: 'Brands that pre-brief agents on “hero shots” (product in hand, smile, no competitor logos) see 3× fewer rejections. Training beats takedowns.',
      },
    ],
  },
  {
    slug: 'same-day-agents-logistics',
    title: 'Same-day agents aren’t a luxury — they’re logistics',
    dek: 'How staffing lead time determines whether your activation launches on the date on the brief.',
    category: 'culture',
    tags: ['Staffing', 'Lagos', 'Operations'],
    publishedAt: '2025-02-08',
    readMinutes: 5,
    featured: false,
    issue: '010',
    author: { name: 'Amaka N.', role: 'Head of Field Operations' },
    accent: 'from-red-900 via-neutral-900 to-amber-950',
    accentMuted: 'from-red-50/80 to-[#f8f6f2]',
    blocks: [
      {
        type: 'p',
        text: 'A campaign brief dated Monday and a roster confirmed Thursday is not same-day — it’s four-day risk wearing a marketing deadline. Verified agent pools change the equation: background checks done once, deployments many times.',
      },
      {
        type: 'stat',
        value: '24h',
        label: 'Median deploy window when agents are pre-verified in-city',
      },
      {
        type: 'p',
        text: 'Outlets and brands share the same constraint: trust scales when identity is known before the shift, not argued after something breaks on site.',
      },
    ],
  },
  {
    slug: 'brief-to-barcode-ten-minutes',
    title: 'From brief to barcode: the 10-minute campaign myth',
    dek: 'What “fast go-live” actually requires behind a simple wizard.',
    category: 'activation',
    tags: ['Campaign builder', 'Go-live', 'FMCG'],
    publishedAt: '2025-01-22',
    readMinutes: 6,
    featured: false,
    issue: '009',
    author: { name: 'David O.', role: 'Product & Activation' },
    accent: 'from-amber-800 via-gold-dark to-neutral-900',
    accentMuted: 'from-amber-50 to-[#f8f6f2]',
    blocks: [
      {
        type: 'p',
        text: 'Ten minutes is real — if decisions were made before the wizard opened: cities, sampling limits, age gate, pass creative, agent count. The software removes friction; it doesn’t remove strategy.',
      },
      {
        type: 'h2',
        text: 'The hidden checklist',
      },
      {
        type: 'list',
        items: [
          'Sampling cap per device (and per day).',
          '18+ gate copy approved by legal.',
          'Pass URL tested on 3G, not office Wi‑Fi.',
          'Field leads assigned per stand before doors open.',
        ],
      },
      {
        type: 'callout',
        title: 'Go-live signal',
        body: 'When all four are green in the builder, you’re not “almost live” — you’re live. Everything else is reporting.',
      },
    ],
  },
  {
    slug: 'multi-city-one-dashboard',
    title: 'One dashboard, three cities, zero duct tape',
    dek: 'Running Lagos, Abuja, and PH without three spreadsheets and a prayer.',
    category: 'data',
    tags: ['Multi-city', 'Dashboard', 'Scale'],
    publishedAt: '2025-01-10',
    readMinutes: 7,
    featured: false,
    issue: '008',
    author: { name: 'Chioma E.', role: 'Insights & Analytics' },
    accent: 'from-sky-950 via-neutral-900 to-gold-dark',
    accentMuted: 'from-sky-50 to-[#f8f6f2]',
    blocks: [
      {
        type: 'p',
        text: 'Regional rollouts fail when each city invents its own definition of “redemption.” Unified schemas — same pass, same limits, same event names — let leadership compare apples to apples while ops keep local nuance in stand notes.',
      },
      {
        type: 'quote',
        text: 'Scale isn’t more people. Scale is fewer arguments about what the number means.',
      },
      {
        type: 'p',
        text: 'The brands winning multi-city aren’t the ones with the biggest agencies — they’re the ones whose Tuesday 4pm looks the same in every timezone on one screen.',
      },
    ],
  },
];

export function getAllPosts(): InsightPost[] {
  return [...INSIGHT_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getFeaturedPost(): InsightPost | undefined {
  return getAllPosts().find(p => p.featured) ?? getAllPosts()[0];
}

export function getPostBySlug(slug: string): InsightPost | undefined {
  return INSIGHT_POSTS.find(p => p.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3): InsightPost[] {
  const current = getPostBySlug(slug);
  if (!current) return getAllPosts().slice(0, limit);
  return getAllPosts()
    .filter(p => p.slug !== slug)
    .sort((a, b) => {
      const aScore = a.category === current.category ? 2 : 0;
      const bScore = b.category === current.category ? 2 : 0;
      return bScore - aScore;
    })
    .slice(0, limit);
}
