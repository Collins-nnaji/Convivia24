import {
  BadgeCheck,
  CheckCircle2,
  LineChart,
  ShieldCheck,
  Users,
} from 'lucide-react';

type Slide = {
  kicker: string;
  title: string;
  body: string;
  takeaway?: string;
  theme?: 'dark' | 'light' | 'red';
  accent?: React.ReactNode;
};

const projections = [
  ['Year 1', '120 vendors', '9,600 shifts', '₦132M revenue', 'Lagos proof of repeat usage'],
  ['Year 2', '420 vendors', '42,000 shifts', '₦624M revenue', 'Abuja + Port Harcourt expansion'],
  ['Year 3', '1,150 vendors', '155,000 shifts', '₦2.34B revenue', 'Enterprise and payments layer'],
];

const slides: Slide[] = [
  {
    kicker: 'Convivia24 deck',
    title: 'Own the rails for hospitality labor.',
    body:
      'Convivia24 is building the trust, matching, and payments layer between hospitality operators and flexible workers, starting with high-frequency shifts in Lagos.',
    takeaway: 'The opportunity is not another jobs app. It is operating infrastructure for hospitality labor.',
    theme: 'dark',
    accent: (
      <div className="grid gap-3">
        {[
          ['Supply', 'Verified hospitality workers'],
          ['Demand', 'Restaurants, lounges, hotels, events'],
          ['Revenue', 'Subscription + shift fee + enterprise'],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-[28px] border border-white/12 bg-white/12 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-white/58">{label}</p>
            <p className="mt-3 text-2xl font-black leading-tight text-white">{value}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    kicker: 'Deal memo',
    title: '30% for the right strategic partner.',
    body:
      'The offer is a 30% strategic partner allocation for capital, hospitality distribution, operator relationships, governance, and execution support. Founder retains 70% and continues product and market leadership.',
    takeaway: 'The 30% is priced for a partner who can materially accelerate speed, trust, and distribution.',
    theme: 'red',
    accent: (
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['Offer', '30% strategic partner allocation'],
          ['Partner brings', 'Capital, distribution, operator network, operating discipline'],
          ['Founder retains', '70%, brand, product leadership, market execution'],
          ['Structure', 'Equity, strategic JV, or phased investment with counsel'],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-[32px] bg-white/12 p-6">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-red-100">{label}</p>
            <p className="mt-3 text-2xl font-black leading-tight text-white">{value}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    kicker: 'Problem',
    title: 'Hospitality staffing is urgent, fragmented, and trust-heavy.',
    body:
      'Operators need reliable staff for same-week and same-day demand, but the workflow still lives in WhatsApp, referrals, and manual follow-up. Workers also lack a trusted place to find real shifts and prove readiness.',
    takeaway: 'The pain is frequent, urgent, and expensive enough to support repeat platform usage.',
    accent: (
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ['Too slow', 'Job boards are not built for urgent shifts.'],
          ['Too informal', 'WhatsApp is fast but hard to verify, track, and scale.'],
          ['Too risky', 'No-shows, fake profiles, and weak payout readiness hurt operators.'],
        ].map(([title, body]) => (
          <ProofCard key={title} title={title} body={body} />
        ))}
      </div>
    ),
  },
  {
    kicker: 'Solution',
    title: 'A verified shift marketplace with trust built into the workflow.',
    body:
      'Convivia24 connects worker profiles, outlet verification, public outlet pages, shift applications, applicant ranking, payout readiness, and admin controls in one mobile-first product.',
    takeaway: 'The product connects both sides of the marketplace and adds the trust layer missing from chat groups.',
    accent: (
      <div className="grid gap-4 md:grid-cols-2">
        {[
          [BadgeCheck, 'Verified outlets'],
          [Users, 'Worker applications'],
          [ShieldCheck, 'Admin trust layer'],
          [LineChart, 'Smart ranking'],
        ].map(([Icon, label]) => {
          const LucideIcon = Icon as typeof BadgeCheck;
          return (
            <div key={String(label)} className="min-w-0 rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm">
              <LucideIcon className="text-red-700" size={34} />
              <p className="mt-5 text-2xl font-black leading-tight">{label as string}</p>
            </div>
          );
        })}
      </div>
    ),
  },
  {
    kicker: 'Product proof',
    title: 'This is already more than a pitch.',
    body:
      'The product now has a worker app, outlet console, public outlet marketing pages, admin controls, applicant ranking, mobile-ready UI, and app-store preparation through Capacitor.',
    takeaway: 'The next risk to solve is distribution, not whether the workflow can be built.',
    accent: (
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['Staff app', 'Workers discover shifts, apply, reuse payout details, and build profile readiness.'],
          ['Outlet console', 'Vendors post shifts, manage profile pages, and review ranked applicants.'],
          ['Public outlet pages', 'Each outlet gets a shareable marketing and staffing funnel.'],
          ['Admin layer', 'Admins approve outlets, manage admin access, and protect platform quality.'],
        ].map(([title, body]) => (
          <ProofCard key={title} title={title} body={body} />
        ))}
      </div>
    ),
  },
  {
    kicker: 'Market entry',
    title: 'Win Lagos hospitality first, then expand city by city.',
    body:
      'The wedge is dense, repeat, urgent demand: restaurants, lounges, hotels, event venues, and nightlife operators that need flexible hospitality workers every week.',
    takeaway: 'A dense Lagos wedge can create liquidity before the company expands city by city.',
    accent: (
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['Beachhead', 'Lagos operators with recurring staffing pressure'],
          ['Reachable first market', '1,000+ serious hospitality outlets across Lagos and nearby cities'],
          ['Expansion', 'Abuja, Port Harcourt, Accra, Nairobi, Johannesburg, London diaspora hospitality'],
          ['Why it compounds', 'Each shift improves worker history, outlet demand data, and matching quality'],
        ].map(([title, body]) => (
          <ProofCard key={title} title={title} body={body} />
        ))}
      </div>
    ),
  },
  {
    kicker: 'Moat',
    title: 'The defensibility is workflow data plus local trust.',
    body:
      'The more shifts, applications, ratings, outlet pages, payout-ready workers, and admin decisions the platform processes, the harder it becomes for a generic job board or chat group to copy.',
    takeaway: 'The moat is not code alone. It is local trust, verified history, and workflow data.',
    theme: 'dark',
    accent: (
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['Outlet marketing pages', 'Every outlet page becomes a staffing and brand funnel.'],
          ['Worker trust graph', 'Verification, applications, certifications, ratings, payout readiness.'],
          ['Admin control layer', 'Approvals, safety review, platform admin roles, and auditability.'],
          ['Matching intelligence', 'Applicant ranking gets better as shift history grows.'],
        ].map(([title, body]) => (
          <DarkCard key={title} title={title} body={body} />
        ))}
      </div>
    ),
  },
  {
    kicker: 'Business model',
    title: 'Multiple revenue lines from one staffing workflow.',
    body:
      'The model starts with vendor subscriptions and filled-shift fees, then adds premium outlet plans, enterprise accounts, payout services, compliance, and workforce analytics.',
    takeaway: 'Revenue can compound because the same workflow supports SaaS, transaction, and enterprise lines.',
    accent: (
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['Vendor subscription', '₦45k/mo'],
          ['Filled shift fee', '₦1.5k/shift'],
          ['Premium outlet', '₦100k+/mo'],
          ['Enterprise', 'Custom'],
        ].map(([title, value]) => (
          <div key={title} className="min-w-0 rounded-[32px] border border-amber-200 bg-[#fffaf0] p-6">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-red-700">{title}</p>
            <p className="mt-5 text-4xl font-black">{value}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    kicker: 'Revenue projection',
    title: 'Illustrative 3-year path to ₦2.34B revenue.',
    body:
      'Base assumptions: average ₦45k monthly vendor subscription, ₦1.5k filled-shift fee, 60% Year 1 gross margin improving with automation and repeat vendor usage.',
    takeaway: 'The base case is built on measurable drivers: active vendors, posted shifts, and filled-shift monetization.',
    accent: (
      <div className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm">
        {projections.map((row) => (
          <div key={row[0]} className="grid gap-3 border-b border-neutral-200 p-5 text-lg last:border-b-0 lg:grid-cols-[0.75fr_1fr_1fr_1.05fr_1.3fr]">
            {row.map((cell, index) => (
              <span key={cell} className={index === 0 || index === 3 ? 'font-black text-red-700' : 'text-neutral-700'}>
                {cell}
              </span>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    kicker: 'Use of funds',
    title: 'Capital goes into product, growth, trust, and runway.',
    body:
      'The first funding plan should prove repeat usage in Lagos, raise worker quality, build operator confidence, and prepare the company for city expansion.',
    takeaway: 'Capital is directed toward the bottlenecks that make marketplaces work: supply, demand, trust, and retention.',
    accent: (
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['35%', 'Product and engineering'],
          ['30%', 'Growth and outlet sales'],
          ['20%', 'Operations and verification'],
          ['15%', 'Legal, finance, reserve'],
        ].map(([percent, label]) => (
          <div key={label} className="min-w-0 rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-5xl font-black text-red-700">{percent}</p>
            <p className="mt-4 text-base font-black uppercase tracking-widest text-neutral-600">{label}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    kicker: 'Execution plan',
    title: 'The first 24 months are about density, trust, and repeat usage.',
    body:
      'The operating plan is simple: win a dense Lagos wedge, prove the unit economics, expand to priority cities, and sell enterprise hospitality groups once quality is repeatable.',
    takeaway: 'The plan avoids spreading too thin early and focuses first on density and repeat behavior.',
    accent: (
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['0-90 days', 'Close partner, finish app-store readiness, onboard first serious outlets.'],
          ['3-6 months', '2,500 verified workers, 300 monthly posted shifts, repeat vendor usage.'],
          ['6-12 months', 'Own Lagos micro-shifts; launch Abuja and Port Harcourt pilots.'],
          ['12-24 months', 'Enterprise groups, automated matching, higher-margin vendor plans.'],
        ].map(([period, plan]) => (
          <ProofCard key={period} title={period} body={plan} />
        ))}
      </div>
    ),
  },
  {
    kicker: 'Close',
    title: 'Partner with Convivia24 for 30%.',
    body:
      'We want a serious partner who brings capital, hospitality relationships, payments or staffing expertise, governance, and disciplined execution support. The objective is to make Convivia24 the default staffing rail for African hospitality operators.',
    takeaway: 'The ask is clear: 30% for a partner who can help turn a built product into the category leader.',
    theme: 'red',
    accent: (
      <div className="grid gap-4 md:grid-cols-2">
        <DarkCard title="Ideal partner" body="Hospitality operator group, payments company, staffing operator, venture partner, or strategic angel with distribution." />
        <DarkCard title="Loom close" body="Show product, explain trust layer, walk through unit economics, and ask what the partner can unlock in 90 days." />
      </div>
    ),
  },
];

function ProofCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-w-0 rounded-[32px] border border-neutral-200 bg-gradient-to-br from-white to-red-50/35 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-700 text-white">
        <CheckCircle2 size={28} />
      </div>
      <p className="mt-5 text-2xl font-black leading-tight text-neutral-950">{title}</p>
      <p className="mt-3 text-lg leading-8 text-neutral-600">{body}</p>
    </div>
  );
}

function DarkCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-w-0 rounded-[32px] border border-white/12 bg-gradient-to-br from-white/16 to-white/6 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
      <p className="text-2xl font-black leading-tight text-white">{title}</p>
      <p className="mt-3 text-lg leading-8 text-white/74">{body}</p>
    </div>
  );
}

export function InvestorDeckSlides() {
  return (
    <main className="bg-[#f8f6f2] text-neutral-950">
      {slides.map((slide, index) => {
        const isCover = index === 0;
        const isDark = slide.theme === 'dark' || slide.theme === 'red';

        return (
          <section
            key={`${slide.kicker}-${slide.title}`}
            className={`relative isolate flex min-h-screen overflow-hidden print:min-h-screen print:break-after-page ${
              slide.theme === 'red'
                ? 'bg-red-800 text-white'
                : isDark
                  ? 'bg-neutral-950 text-white'
                  : 'bg-[#f8f6f2] text-neutral-950'
            }`}
          >
            <div className="pointer-events-none absolute inset-0 opacity-80">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(185,28,28,0.28),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(201,168,76,0.18),transparent_24%)]" />
            </div>

            <div className={`pointer-events-none absolute right-8 top-14 hidden select-none font-black leading-none opacity-[0.055] lg:block ${
              isDark ? 'text-white' : 'text-neutral-950'
            } text-[18rem]`}>
              {index + 1}
            </div>

            <div className={`relative mx-auto grid w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8 ${
              isCover ? 'gap-6 py-7 print:py-6' : 'gap-10 py-12 print:py-10'
            }`}>
              <div className={`grid items-center ${isCover ? 'gap-5 lg:grid-cols-[1.18fr_0.82fr]' : 'gap-8 lg:grid-cols-[0.95fr_1.05fr]'}`}>
                <div className="min-w-0">
                  <p className={`${isCover ? 'text-sm' : 'text-xs'} font-black uppercase tracking-[0.3em] ${isDark ? 'text-red-100' : 'text-red-700'}`}>
                    {slide.kicker}
                  </p>
                  <h1 className={`mt-4 font-display italic font-bold leading-[0.86] tracking-tight ${
                    isCover ? 'text-5xl sm:text-7xl lg:text-[7.8rem]' : 'text-5xl sm:text-7xl lg:text-8xl'
                  }`}>
                    {slide.title}
                  </h1>
                  <p className={`max-w-4xl ${isCover ? 'mt-5 text-xl leading-8 sm:text-2xl sm:leading-9' : 'mt-7 text-xl leading-9 sm:text-2xl sm:leading-10'} ${isDark ? 'text-white/80' : 'text-neutral-600'}`}>
                    {slide.body}
                  </p>
                  {slide.takeaway ? (
                    <div className={`${isCover ? 'mt-5 rounded-[24px] p-4' : 'mt-7 rounded-[28px] p-5'} border shadow-sm ${
                      isDark
                        ? 'border-white/12 bg-white/10 text-white'
                        : 'border-red-100 bg-white text-neutral-950'
                    }`}>
                      <p className={`text-[10px] font-black uppercase tracking-[0.28em] ${isDark ? 'text-red-100' : 'text-red-700'}`}>
                        Investor takeaway
                      </p>
                      <p className={`mt-2 font-black ${isCover ? 'text-lg leading-7' : 'text-xl leading-8'} ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                        {slide.takeaway}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className={`min-w-0 rounded-[40px] border p-4 shadow-[0_24px_80px_rgba(0,0,0,0.14)] [overflow-wrap:anywhere] ${
                  isDark ? 'border-white/10 bg-white/10' : 'border-neutral-200 bg-white/70'
                }`}>
                  {slide.accent}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </main>
  );
}
