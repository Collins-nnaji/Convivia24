'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar, Mail, MessageCircle, MapPin, CreditCard, Smartphone,
  CheckCircle2, Clock, Sparkles, Plug,
} from 'lucide-react';
import type { IntegrationDef, IntegrationStatus } from '@/lib/integrations/catalog';

const ICONS = {
  calendar: Calendar,
  mail: Mail,
  message: MessageCircle,
  map: MapPin,
  credit: CreditCard,
  smartphone: Smartphone,
};

const STATUS_STYLES: Record<IntegrationStatus, { label: string; className: string }> = {
  connected: { label: 'Connected', className: 'bg-emerald-500/10 text-emerald-700' },
  ready: { label: 'Ready to use', className: 'bg-copper/10 text-copper-deep' },
  beta: { label: 'Beta', className: 'bg-amber-500/10 text-amber-800' },
  coming_soon: { label: 'Coming soon', className: 'bg-ink/5 text-ink-muted' },
};

interface IntegrationCardProps {
  integration: IntegrationDef;
  status?: IntegrationStatus;
  onConnect?: () => void;
}

export default function IntegrationCard({ integration, status, onConnect }: IntegrationCardProps) {
  const Icon = ICONS[integration.icon];
  const resolvedStatus = status ?? integration.status;
  const badge = STATUS_STYLES[resolvedStatus];

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="glass-card p-5 sm:p-6 flex flex-col h-full hover:shadow-lift transition-shadow duration-300 h-full"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-copper/10 text-copper">
          <Icon size={22} />
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>
          {badge.label}
        </span>
      </div>
      <h3 className="font-display text-xl italic text-ink mb-1">{integration.name}</h3>
      <p className="text-sm text-ink-muted mb-4">{integration.tagline}</p>
      <ul className="space-y-2 mb-5 flex-1">
        {integration.benefits.map((b) => (
          <li key={b} className="flex items-start gap-2 text-xs text-ink-muted leading-relaxed">
            <CheckCircle2 size={13} className="text-copper shrink-0 mt-0.5" />
            {b}
          </li>
        ))}
      </ul>
      {integration.envKeys && integration.envKeys.length > 0 && (
        <p className="text-[10px] text-ink-muted/70 mb-4 font-mono">
          Env: {integration.envKeys.join(', ')}
        </p>
      )}
      {resolvedStatus === 'coming_soon' ? (
        <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink/10 bg-surface-sunken px-4 py-2.5 text-xs font-semibold text-ink-muted">
          <Clock size={14} /> Coming soon
        </span>
      ) : (
        <button
          type="button"
          onClick={onConnect}
          className="btn-secondary w-full text-xs"
        >
          <Plug size={14} />
          {integration.connectLabel || 'Connect'}
        </button>
      )}
    </motion.article>
  );
}

export function IntegrationStrip() {
  return (
    <div className="flex flex-wrap gap-2">
      {['Google Calendar', 'Gmail', 'WhatsApp', 'Maps'].map((name) => (
        <span key={name} className="inline-flex items-center gap-1.5 rounded-full bg-surface-elevated border border-ink/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
          <Sparkles size={11} className="text-copper" /> {name}
        </span>
      ))}
    </div>
  );
}

export function IntegrationQuickLink({
  href,
  label,
  icon: Icon,
  external = true,
}: {
  href: string;
  label: string;
  icon: typeof Calendar;
  external?: boolean;
}) {
  const cls = 'inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-surface-elevated px-3.5 py-2.5 text-xs font-semibold text-ink hover:border-copper/40 hover:text-copper-deep transition-colors';
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        <Icon size={15} className="text-copper" /> {label}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      <Icon size={15} className="text-copper" /> {label}
    </Link>
  );
}
