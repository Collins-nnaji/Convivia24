'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, QrCode, Monitor, ChevronRight, TrendingUp, Users, Zap, Globe, Shield, Eye } from 'lucide-react';
import { WordmarkLink } from '@/components/convivia24/primitives';

// ─── Design tokens (matching the cv- system) ─────────────────
const gold = '#c0975a';
const ink  = '#1a1714';
const ivory = '#faf6ee';
const ivory2 = '#f4ede0';
const paper = '#ffffff';
const muted = '#756c5e';
const muted2 = '#a89e8e';
const hairline = 'rgba(26,23,20,.10)';
const hairlineStrong = 'rgba(26,23,20,.20)';

// ─── Section label (eyebrow) ──────────────────────────────────
function SectionLabel({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontSize: 9, fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase',
      color: light ? `rgba(250,246,238,.45)` : gold,
      marginBottom: 16,
    }}>
      <span style={{ width: 14, height: 1, background: 'currentColor', display: 'inline-block', flexShrink: 0 }} />
      {children}
    </div>
  );
}

// ─── Stat block ───────────────────────────────────────────────
function Stat({ value, label, light }: { value: string; label: string; light?: boolean }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic',
        fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1,
        color: light ? ivory : ink, letterSpacing: '-0.02em', marginBottom: 6,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, fontWeight: 500, color: light ? 'rgba(250,246,238,.45)' : muted, lineHeight: 1.4 }}>
        {label}
      </div>
    </div>
  );
}

// ─── Service card ─────────────────────────────────────────────
function ServiceCard({
  number, title, headline, body, icon: Icon, accentColor,
}: {
  number: string; title: string; headline: string; body: string;
  icon: React.ElementType; accentColor: string;
}) {
  return (
    <div style={{
      padding: '36px 32px', borderRadius: 20,
      background: paper, border: `1px solid ${hairline}`,
      display: 'flex', flexDirection: 'column', gap: 20,
      boxShadow: '0 2px 16px rgba(26,23,20,.06)',
      transition: 'box-shadow .2s, transform .2s',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(26,23,20,.12)';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 16px rgba(26,23,20,.06)';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
    }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: accentColor + '14', border: `1px solid ${accentColor}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={accentColor} />
        </div>
        <span style={{
          fontSize: 10, fontWeight: 800, color: muted2, letterSpacing: '0.22em',
          fontFamily: 'var(--font-geist, system-ui)',
        }}>{number}</span>
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: accentColor, marginBottom: 8 }}>
          {title}
        </div>
        <h3 style={{
          fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic',
          fontSize: 'clamp(20px, 2.5vw, 26px)', lineHeight: 1.1,
          color: ink, marginBottom: 12, letterSpacing: '-0.01em',
        }}>
          {headline}
        </h3>
        <p style={{ fontSize: 13.5, lineHeight: 1.65, color: muted }}>
          {body}
        </p>
      </div>
    </div>
  );
}

// ─── Insight card ─────────────────────────────────────────────
function InsightCard({ tag, title, body, accent }: { tag: string; title: string; body: string; accent?: string }) {
  return (
    <div style={{
      padding: '28px 26px', borderRadius: 16,
      border: `1px solid rgba(250,246,238,.10)`,
      background: 'rgba(250,246,238,.04)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '3px 10px', borderRadius: 99,
        background: (accent || gold) + '1a',
        border: `1px solid ${accent || gold}28`,
        fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: accent || gold, alignSelf: 'flex-start',
      }}>
        {tag}
      </div>
      <div style={{
        fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic',
        fontSize: 'clamp(18px, 2vw, 22px)', lineHeight: 1.15, color: ivory,
        letterSpacing: '-0.01em',
      }}>
        {title}
      </div>
      <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'rgba(250,246,238,.45)', margin: 0 }}>
        {body}
      </p>
    </div>
  );
}

// ─── Step block ───────────────────────────────────────────────
function StrategyStep({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: gold + '14', border: `1px solid ${gold}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 900, color: gold, letterSpacing: '0.05em',
      }}>{n}</div>
      <div style={{ paddingTop: 4 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: ink, marginBottom: 5 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: muted, lineHeight: 1.6 }}>{body}</div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────
export function LandingPage() {
  const W = 1200; // content max-width
  const PX = 'clamp(20px, 5vw, 80px)'; // horizontal padding

  return (
    <div style={{
      minHeight: '100dvh',
      background: ivory,
      color: ink,
      fontFamily: 'var(--font-geist, system-ui)',
      overflowX: 'hidden',
    }}>

      {/* ═══════════════════════════════════════════
          NAV
      ═══════════════════════════════════════════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: `1px solid ${hairline}`,
        background: 'rgba(250,246,238,.94)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{
          maxWidth: W, margin: '0 auto',
          padding: `0 ${PX}`,
          height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            <WordmarkLink size={20} />
            <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
              {['Services', 'Insights', 'Strategy', 'Case Studies'].map(label => (
                <a key={label} href={`#${label.toLowerCase().replace(' ', '-')}`} style={{
                  fontSize: 11, fontWeight: 600, color: muted,
                  textDecoration: 'none', letterSpacing: '0.04em',
                  transition: 'color .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = ink)}
                onMouseLeave={e => (e.currentTarget.style.color = muted)}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href="/portal" style={{
              padding: '8px 16px', borderRadius: 99,
              background: 'transparent', color: muted,
              border: `1px solid ${hairlineStrong}`,
              fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
            }}>
              Brand Portal
            </Link>
            <Link href="/inquire" style={{
              padding: '9px 18px', borderRadius: 99,
              background: ink, color: ivory,
              fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 12px rgba(26,23,20,.18)',
            }}>
              Brief Us <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          HERO — dark panel
      ═══════════════════════════════════════════ */}
      <section style={{
        background: ink,
        padding: `clamp(80px, 12vw, 140px) ${PX} clamp(64px, 10vw, 120px)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none',
          backgroundImage: `radial-gradient(circle, ${gold} 1px, transparent 1px)`,
          backgroundSize: '44px 44px',
        }} />
        {/* Glow */}
        <div style={{
          position: 'absolute', top: -120, right: -80, width: 500, height: 500,
          borderRadius: 9999, opacity: 0.06, pointerEvents: 'none',
          background: `radial-gradient(circle, ${gold}, transparent 70%)`,
        }} />

        <div style={{ maxWidth: W, margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(40px, 6vw, 80px)',
            alignItems: 'end',
          }}>
            {/* Left */}
            <div>
              <SectionLabel light>Brand Activation · Experiential Tech</SectionLabel>

              <h1 style={{
                fontFamily: 'var(--font-instrument, serif)',
                fontStyle: 'italic',
                fontSize: 'clamp(44px, 7vw, 88px)',
                lineHeight: 0.9,
                letterSpacing: '-0.025em',
                color: ivory,
                marginBottom: 28,
              }}>
                The operating<br />
                system for<br />
                <em style={{ color: gold }}>brand experience</em><br />
                in Africa.
              </h1>

              <p style={{
                fontSize: 'clamp(14px, 1.6vw, 17px)',
                lineHeight: 1.7,
                color: 'rgba(250,246,238,.55)',
                maxWidth: 480, marginBottom: 36,
              }}>
                Convivia24 powers data-driven brand activations across Africa's premium nightlife,
                hospitality and live events landscape — connecting global beverage and FMCG brands
                with high-value consumers through technology they can measure.
              </p>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/inquire" style={{
                  padding: '14px 28px', borderRadius: 99,
                  background: gold, color: '#fff',
                  fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
                  boxShadow: `0 6px 24px ${gold}4a`,
                }}>
                  Brief us on your next activation <ArrowRight size={12} />
                </Link>
                <a href="#services" style={{
                  padding: '14px 22px', borderRadius: 99,
                  background: 'rgba(250,246,238,.07)', color: 'rgba(250,246,238,.7)',
                  border: '1px solid rgba(250,246,238,.12)',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  See services
                </a>
              </div>
            </div>

            {/* Right — stat block */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
              padding: '40px 36px', borderRadius: 20,
              border: '1px solid rgba(250,246,238,.08)',
              background: 'rgba(250,246,238,.03)',
            }}>
              <Stat value="20+" label="Premium venues activated across Lagos & Abuja" light />
              <Stat value="98%" label="Redemption fraud rate eliminated at client activations" light />
              <Stat value="₦50M+" label="Brand spend managed through the platform" light />
              <Stat value="3s" label="Average QR redemption validation time, door to verified" light />
            </div>
          </div>

          {/* Brand strip */}
          <div style={{
            marginTop: 'clamp(48px, 7vw, 80px)',
            paddingTop: 'clamp(24px, 3vw, 36px)',
            borderTop: '1px solid rgba(250,246,238,.07)',
            display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(250,246,238,.25)', whiteSpace: 'nowrap' }}>
              Built for
            </span>
            {['Spirits Brands', 'Beer Brands', 'FMCG Companies', 'Experiential Agencies', 'Hospitality Groups', 'Event Promoters'].map(b => (
              <span key={b} style={{
                fontSize: 11, fontWeight: 600, color: 'rgba(250,246,238,.30)',
                letterSpacing: '0.04em',
              }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SERVICES
      ═══════════════════════════════════════════ */}
      <section id="services" style={{ padding: `clamp(72px, 10vw, 120px) ${PX}`, background: ivory }}>
        <div style={{ maxWidth: W, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16, alignItems: 'stretch',
            marginBottom: 'clamp(48px, 6vw, 72px)',
          }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <SectionLabel>Core Services</SectionLabel>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <h2 style={{
                fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic',
                fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1,
                letterSpacing: '-0.02em', color: ink, marginBottom: 16,
              }}>
                Three ways we put<br />your brand in the room.
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 4 }}>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: muted, maxWidth: 340 }}>
                Your existing tech infrastructure repurposed for commercial brand marketing — every touchpoint measured and verified.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            <ServiceCard
              number="01"
              icon={Users}
              accentColor="#2a4870"
              title="Brand Guestlists & VIP Experiences"
              headline="Your brand at the door. Every name, every data point."
              body="We manage premium digital guestlists for exclusive brand events — product launches, VIP club takeovers, trade nights. Every guest registers their demographics and preferences before arrival. You walk away with a clean CRM of the exact high-value consumers who attended your event."
            />
            <ServiceCard
              number="02"
              icon={QrCode}
              accentColor="#c0975a"
              title="Redemption Tracking & Promo Validation"
              headline="Fraud-proof drink promotions across any venue."
              body="Run sampling campaigns across 20+ bars simultaneously. Customers scan a table QR code to claim their free drink. Bartenders validate in seconds via our scanner app. You receive a real-time dashboard showing exactly how many redemptions occurred, where, and when — zero double-claims, zero fraud."
            />
            <ServiceCard
              number="03"
              icon={Monitor}
              accentColor="#7c5bff"
              title="Live Brand Screens & Content Experiences"
              headline="Turn every guest into a content creator for your brand."
              body="At sponsored concerts, festivals, or club nights, guests scan a QR code to upload photos holding your product — images broadcast instantly to the venue's projection screens. The brand becomes the experience. You acquire branded UGC content and first-party consumer data simultaneously."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          INSIGHTS — dark panel
      ═══════════════════════════════════════════ */}
      <section id="insights" style={{
        background: ink,
        padding: `clamp(72px, 10vw, 120px) ${PX}`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: -100, left: -60, width: 400, height: 400,
          borderRadius: 9999, opacity: 0.04, pointerEvents: 'none',
          background: `radial-gradient(circle, ${gold}, transparent 70%)`,
        }} />

        <div style={{ maxWidth: W, margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(40px, 6vw, 80px)',
            marginBottom: 'clamp(48px, 6vw, 64px)',
            alignItems: 'end',
          }}>
            <div>
              <SectionLabel light>Market Intelligence</SectionLabel>
              <h2 style={{
                fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic',
                fontSize: 'clamp(32px, 4.5vw, 52px)', lineHeight: 1,
                letterSpacing: '-0.02em', color: ivory, marginBottom: 0,
              }}>
                Africa's premium<br />
                <em style={{ color: gold }}>nightlife market</em><br />
                is underserved.
              </h2>
            </div>
            <div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(250,246,238,.50)', marginBottom: 20 }}>
                Nigeria alone has an estimated ₦2.3 trillion annual consumer spend on beverages
                and nightlife experiences — yet brands have almost no reliable infrastructure for
                on-ground activation data. Convivia24 changes that.
              </p>
              <Link href="/inquire" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 700, color: gold, letterSpacing: '0.12em',
                textTransform: 'uppercase', textDecoration: 'none',
              }}>
                Request a market brief <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            <InsightCard
              tag="Consumer Behaviour"
              title="Lagos nightlife peaks Thursday–Sunday, not just weekends."
              body="Our activation data shows 38% of high-spend consumer touchpoints happen on Thursday evenings in VI, Ikoyi, and Lekki — a window most brands miss entirely."
            />
            <InsightCard
              tag="Redemption Data"
              accent="#7c5bff"
              title="Traditional promo methods lose 22–40% of budget to unverified claims."
              body="Paper vouchers, bartender discretion, and untracked samples mean brands routinely overpay for activations they can't measure. Our QR redemption system eliminates this entirely."
            />
            <InsightCard
              tag="Demographic Insight"
              accent="#e85d4b"
              title="72% of premium venue regulars are aged 24–38 with high disposable income."
              body="The Convivia24 guestlist captures name, age range, occasion type, and spend intent at the point of entry — giving you a first-party CRM your media buy cannot replicate."
            />
            <InsightCard
              tag="Content & UGC"
              accent="#8aa085"
              title="Branded content generated at live events has 4.6× higher engagement."
              body="Spontaneous in-venue photo sharing outperforms planned influencer posts. Our live screen tech turns organic moments into documented, brand-attributed content."
            />
          </div>

          {/* Big stat row */}
          <div style={{
            marginTop: 'clamp(48px, 6vw, 72px)',
            paddingTop: 'clamp(36px, 4vw, 48px)',
            borderTop: '1px solid rgba(250,246,238,.07)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 36,
          }}>
            <Stat value="₦2.3T" label="Estimated annual Nigerian nightlife & beverage consumer spend" light />
            <Stat value="14M+" label="Urban Nigerian adults aged 18–40 in Lagos & Abuja combined" light />
            <Stat value="3,200+" label="Premium bars, clubs, lounges, and event venues in Lagos alone" light />
            <Stat value="73%" label="Of event attendees share branded content when given the right UX" light />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          STRATEGY
      ═══════════════════════════════════════════ */}
      <section id="strategy" style={{ padding: `clamp(72px, 10vw, 120px) ${PX}`, background: ivory2 }}>
        <div style={{ maxWidth: W, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(48px, 7vw, 96px)',
            alignItems: 'start',
          }}>
            {/* Left */}
            <div>
              <SectionLabel>Activation Strategy</SectionLabel>
              <h2 style={{
                fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic',
                fontSize: 'clamp(30px, 4vw, 48px)', lineHeight: 1.02,
                letterSpacing: '-0.02em', color: ink, marginBottom: 20,
              }}>
                Not just tech.<br />
                A strategic<br />
                <em style={{ color: gold }}>deployment partner.</em>
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: muted, marginBottom: 28, maxWidth: 420 }}>
                We don't hand over a dashboard and leave. Convivia24 embeds into your activation
                planning from brief to debrief — configuring the technology around your campaign
                objectives, then surfacing the data that matters to your team.
              </p>
              <Link href="/inquire" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 22px', borderRadius: 99, textDecoration: 'none',
                background: ink, color: ivory,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
              }}>
                Start a brief <ArrowRight size={11} />
              </Link>
            </div>

            {/* Right — steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <StrategyStep
                n="01"
                title="Campaign Brief & Objective Setting"
                body="We receive your activation brief and map every element — target demographic, venue type, redemption mechanic, content goals — into a Convivia24 deployment plan."
              />
              <div style={{ height: 1, background: hairline }} />
              <StrategyStep
                n="02"
                title="Custom Configuration & QR Infrastructure"
                body="Your branded guestlist pages, redemption QR codes, and photo wall screens are configured with your campaign assets. Staff are briefed. Everything is live-tested before the night."
              />
              <div style={{ height: 1, background: hairline }} />
              <StrategyStep
                n="03"
                title="Live Activation & Real-Time Monitoring"
                body="On activation night, our platform runs silently behind the experience. You see real-time check-in rates, redemption counts, and photo uploads from a live dashboard."
              />
              <div style={{ height: 1, background: hairline }} />
              <StrategyStep
                n="04"
                title="Post-Activation Insights Report"
                body="48 hours after your event, you receive a full debrief: consumer demographics, peak engagement windows, redemption geography, content performance, and strategic recommendations for the next activation."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CASE STUDIES (editorial strip)
      ═══════════════════════════════════════════ */}
      <section id="case-studies" style={{ padding: `clamp(72px, 10vw, 120px) ${PX}`, background: ivory }}>
        <div style={{ maxWidth: W, margin: '0 auto' }}>
          <SectionLabel>Case Studies</SectionLabel>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 2,
            marginTop: 24,
          }}>
            {[
              {
                tag: 'Spirits Brand · Victoria Island',
                headline: 'A premium whisky brand validates 1,200 redemptions across 8 venues in one night.',
                outcome: 'Zero duplicate claims. Real-time brand manager dashboard. Full consumer CRM handed over within 24 hours.',
                accent: gold,
              },
              {
                tag: 'Beer Brand · Lekki',
                headline: 'Friday night takeover: 340 guests enter a VIP brand event via digital guestlist.',
                outcome: 'Average guest age: 28. 74% repeat-visit intent. Photo wall generated 280 branded uploads projected live.',
                accent: '#2a4870',
              },
              {
                tag: 'FMCG · Abuja',
                headline: 'Pan-city sampling campaign run across 14 locations with zero POS staff training required.',
                outcome: 'QR-based scan at point of distribution. Budget waste reduced by 34% vs. prior campaign. Full geo-report delivered.',
                accent: '#7c5bff',
              },
            ].map((c, i) => (
              <div key={i} style={{
                padding: '36px 32px',
                background: i === 1 ? ink : paper,
                border: `1px solid ${i === 1 ? 'rgba(250,246,238,.06)' : hairline}`,
                borderRadius: i === 0 ? '16px 0 0 16px' : i === 2 ? '0 16px 16px 0' : 0,
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center',
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: c.accent, gap: 6,
                }}>
                  <span style={{ width: 10, height: 1, background: 'currentColor', display: 'inline-block' }} />
                  {c.tag}
                </div>
                <div style={{
                  fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic',
                  fontSize: 'clamp(18px, 2.2vw, 24px)', lineHeight: 1.15,
                  color: i === 1 ? ivory : ink, letterSpacing: '-0.01em',
                }}>
                  {c.headline}
                </div>
                <div style={{
                  fontSize: 12.5, lineHeight: 1.6,
                  color: i === 1 ? 'rgba(250,246,238,.45)' : muted,
                  paddingTop: 4, borderTop: `1px solid ${i === 1 ? 'rgba(250,246,238,.08)' : hairline}`,
                }}>
                  {c.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY CONVIVIA24
      ═══════════════════════════════════════════ */}
      <section style={{ padding: `clamp(64px, 8vw, 96px) ${PX}`, background: ivory2, borderTop: `1px solid ${hairline}` }}>
        <div style={{ maxWidth: W, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}>
            <div style={{ gridColumn: '1 / -1', marginBottom: 8 }}>
              <SectionLabel>Why Convivia24</SectionLabel>
              <h2 style={{
                fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic',
                fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1,
                letterSpacing: '-0.02em', color: ink,
              }}>
                Built ground-up for<br /><em style={{ color: gold }}>African market realities.</em>
              </h2>
            </div>
            {[
              { icon: Zap,       title: 'Zero training required',       body: 'Bartenders and door staff validate QR codes in under 3 seconds. No app download. No login. Just scan.' },
              { icon: Shield,    title: 'Fraud-proof by design',        body: 'Every redemption is one-time cryptographically signed. Our system has processed 50,000+ scans with 0% duplicate fraud.' },
              { icon: BarChart3, title: 'First-party data only',        body: 'Every data point collected belongs to you. We don\'t resell, aggregate or share your consumer intelligence with competitors.' },
              { icon: Globe,     title: 'Works across all connectivity', body: 'Offline-first architecture means your activation runs flawlessly even in venues with poor mobile data. Results sync when back online.' },
              { icon: Eye,       title: 'Real-time visibility',         body: 'Your campaign dashboard updates live. Know redemption rates, guest arrivals, and photo uploads the moment they happen.' },
              { icon: TrendingUp,title: 'Grows with your campaign',     body: 'One venue to fifty. One city to three. The platform scales horizontally without additional infrastructure cost on your side.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} style={{
                padding: '24px 20px', borderRadius: 14,
                background: paper, border: `1px solid ${hairline}`,
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: gold + '12', border: `1px solid ${gold}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} color={gold} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>{title}</div>
                <div style={{ fontSize: 12, color: muted, lineHeight: 1.6 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA FOOTER — dark panel
      ═══════════════════════════════════════════ */}
      <section style={{
        background: ink,
        padding: `clamp(72px, 10vw, 120px) ${PX}`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -80, right: -40, width: 500, height: 500,
          borderRadius: 9999, opacity: 0.05, pointerEvents: 'none',
          background: `radial-gradient(circle, ${gold}, transparent 70%)`,
        }} />

        <div style={{ maxWidth: W, margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(40px, 6vw, 80px)',
            alignItems: 'center',
          }}>
            <div>
              <img
                src="/Logo2.png"
                alt="Convivia24"
                style={{ height: 36, width: 'auto', opacity: 0.6, marginBottom: 28, display: 'block' }}
                draggable={false}
              />
              <h2 style={{
                fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic',
                fontSize: 'clamp(32px, 5vw, 60px)', lineHeight: 0.95,
                letterSpacing: '-0.025em', color: ivory, marginBottom: 20,
              }}>
                Ready to brief<br />
                <em style={{ color: gold }}>your next activation?</em>
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(250,246,238,.45)', lineHeight: 1.65, maxWidth: 380, marginBottom: 32 }}>
                We work with brand managers, experiential agencies, and hospitality groups across
                Lagos, Abuja, and London. Response within 48 hours.
              </p>
              <Link href="/inquire" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '16px 32px', borderRadius: 99,
                background: gold, color: '#fff',
                fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase',
                textDecoration: 'none',
                boxShadow: `0 8px 32px ${gold}40`,
              }}>
                Start a brief <ArrowRight size={12} />
              </Link>
            </div>

            {/* Contact card */}
            <div style={{
              padding: '36px', borderRadius: 20,
              border: '1px solid rgba(250,246,238,.08)',
              background: 'rgba(250,246,238,.03)',
              display: 'flex', flexDirection: 'column', gap: 24,
            }}>
              {[
                { label: 'Brand Activation Enquiries', value: 'brands@convivia24.com', href: 'mailto:brands@convivia24.com' },
                { label: 'Agency & Partnership Desk', value: 'partnerships@convivia24.com', href: 'mailto:partnerships@convivia24.com' },
                { label: 'Press & Media', value: 'press@convivia24.com', href: 'mailto:press@convivia24.com' },
              ].map(c => (
                <div key={c.label}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(250,246,238,.25)', marginBottom: 5 }}>
                    {c.label}
                  </div>
                  <a href={c.href} style={{
                    fontSize: 14, fontWeight: 600, color: 'rgba(250,246,238,.70)',
                    textDecoration: 'none', letterSpacing: '-0.01em',
                    transition: 'color .15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = ivory)}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,246,238,.70)')}
                  >
                    {c.value}
                  </a>
                </div>
              ))}

              <div style={{ height: 1, background: 'rgba(250,246,238,.06)' }} />

              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(250,246,238,.25)', marginBottom: 8 }}>
                  Offices
                </div>
                <div style={{ fontSize: 12, color: 'rgba(250,246,238,.45)', lineHeight: 1.8 }}>
                  Lagos — Victoria Island<br />
                  Abuja — Maitama<br />
                  London — Shoreditch
                </div>
              </div>
            </div>
          </div>

          {/* Footer links */}
          <div style={{
            marginTop: 'clamp(48px, 6vw, 72px)',
            paddingTop: 24,
            borderTop: '1px solid rgba(250,246,238,.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          }}>
            <span style={{ fontSize: 11, color: 'rgba(250,246,238,.22)', letterSpacing: '0.04em' }}>
              © 2026 Convivia24. All rights reserved.
            </span>
            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
                { label: 'Platform Login', href: '/auth/sign-in' },
                { label: 'Contact', href: '/inquire' },
              ].map(l => (
                <Link key={l.label} href={l.href} style={{
                  fontSize: 11, color: 'rgba(250,246,238,.25)', textDecoration: 'none',
                  transition: 'color .15s', letterSpacing: '0.04em',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(250,246,238,.6)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,246,238,.25)')}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
