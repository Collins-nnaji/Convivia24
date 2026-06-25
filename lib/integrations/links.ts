export interface CalendarEventInput {
  title: string;
  starts_at: string;
  ends_at?: string | null;
  venue?: string | null;
  city?: string | null;
  description?: string | null;
  url?: string;
}

function toGCalDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function googleCalendarUrl(event: CalendarEventInput): string {
  const start = new Date(event.starts_at);
  const end = event.ends_at ? new Date(event.ends_at) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toGCalDate(start)}/${toGCalDate(end)}`,
    details: [event.description, event.url].filter(Boolean).join('\n\n'),
    location: [event.venue, event.city].filter(Boolean).join(', '),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function googleMapsUrl(venue?: string | null, city?: string | null, address?: string | null): string {
  const query = [venue, address, city].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function whatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function gmailComposeUrl(subject: string, body: string): string {
  const params = new URLSearchParams({ su: subject, body });
  return `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
}

export function buildIcsBlob(event: CalendarEventInput & { uid?: string }): Blob {
  const start = new Date(event.starts_at);
  const end = event.ends_at ? new Date(event.ends_at) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = event.uid || `convivia24-${Date.now()}@convivia24.app`;
  const location = [event.venue, event.city].filter(Boolean).join(', ');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Convivia24//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${event.title.replace(/\n/g, ' ')}`,
    location ? `LOCATION:${location.replace(/\n/g, ' ')}` : '',
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
    event.url ? `URL:${event.url}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  return new Blob([ics], { type: 'text/calendar;charset=utf-8' });
}

export function downloadIcs(event: CalendarEventInput, filename = 'event.ics') {
  const blob = buildIcsBlob(event);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
