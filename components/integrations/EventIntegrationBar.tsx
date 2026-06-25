'use client';

import { Calendar, Download, MapPin, MessageCircle, Mail } from 'lucide-react';
import {
  googleCalendarUrl,
  googleMapsUrl,
  whatsAppShareUrl,
  gmailComposeUrl,
  downloadIcs,
} from '@/lib/integrations/links';
import { absoluteUrl } from '@/lib/url';
import { IntegrationQuickLink } from '@/components/integrations/IntegrationCard';

interface EventIntegrationBarProps {
  title: string;
  slug: string;
  starts_at: string;
  ends_at?: string | null;
  venue?: string | null;
  city?: string;
  address?: string | null;
  description?: string | null;
  compact?: boolean;
}

export default function EventIntegrationBar({
  title,
  slug,
  starts_at,
  ends_at,
  venue,
  city,
  address,
  description,
  compact = false,
}: EventIntegrationBarProps) {
  const eventUrl = absoluteUrl(`/events/${slug}`);
  const calInput = {
    title,
    starts_at,
    ends_at,
    venue,
    city,
    description,
    url: eventUrl,
  };

  const mapsLink = googleMapsUrl(venue, city, address);
  const waText = `I'm going to ${title}${city ? ` in ${city}` : ''}. ${eventUrl}`;
  const mailSubject = `Going to ${title}`;
  const mailBody = `Thought you might like this:\n\n${title}\n${eventUrl}`;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        <IntegrationQuickLink href={googleCalendarUrl(calInput)} label="Google Cal" icon={Calendar} />
        <button
          type="button"
          onClick={() => downloadIcs(calInput, `${slug}.ics`)}
          className="inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-surface-elevated px-3.5 py-2.5 text-xs font-semibold text-ink hover:border-copper/40 transition-colors"
        >
          <Download size={15} className="text-copper" /> .ics
        </button>
        <IntegrationQuickLink href={mapsLink} label="Maps" icon={MapPin} />
        <IntegrationQuickLink href={whatsAppShareUrl(waText)} label="WhatsApp" icon={MessageCircle} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink/8 bg-surface-sunken/60 p-4 sm:p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper-deep mb-3">Add to your plans</p>
      <div className="flex flex-wrap gap-2">
        <IntegrationQuickLink href={googleCalendarUrl(calInput)} label="Google Calendar" icon={Calendar} />
        <button
          type="button"
          onClick={() => downloadIcs(calInput, `${slug}.ics`)}
          className="inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-surface-elevated px-3.5 py-2.5 text-xs font-semibold text-ink hover:border-copper/40 hover:text-copper-deep transition-colors"
        >
          <Download size={15} className="text-copper" /> Apple / Outlook (.ics)
        </button>
        <IntegrationQuickLink href={mapsLink} label="Open in Maps" icon={MapPin} />
        <IntegrationQuickLink href={whatsAppShareUrl(waText)} label="Share on WhatsApp" icon={MessageCircle} />
        <IntegrationQuickLink href={gmailComposeUrl(mailSubject, mailBody)} label="Email a friend" icon={Mail} />
      </div>
    </div>
  );
}
