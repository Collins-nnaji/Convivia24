// Pure ICS (RFC 5545) formatter for the My 24 calendar subscribe feed.

import type { CalendarItem } from '@/lib/calendar/buffers';

function toICSDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** RFC 5545 requires folding lines longer than 75 octets onto a continuation line. */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let rest = line;
  while (rest.length > 75) {
    chunks.push(rest.slice(0, 75));
    rest = ' ' + rest.slice(75);
  }
  chunks.push(rest);
  return chunks.join('\r\n');
}

const PRIORITY_VALUE: Record<CalendarItem['priority'], number> = { high: 1, normal: 5, low: 9 };

export function buildICS(items: CalendarItem[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Convivia24//My 24//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:My 24',
  ];

  for (const item of items) {
    if (item.is_rest_block || item.status !== 'active') continue;
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${item.id}@convivia24.com`);
    lines.push(`DTSTAMP:${toICSDate(new Date().toISOString())}`);
    lines.push(`DTSTART:${toICSDate(item.starts_at)}`);
    lines.push(`DTEND:${toICSDate(item.ends_at)}`);
    lines.push(foldLine(`SUMMARY:${escapeText(item.title)}`));
    if (item.location) lines.push(foldLine(`LOCATION:${escapeText(item.location)}`));
    if (item.notes) lines.push(foldLine(`DESCRIPTION:${escapeText(item.notes)}`));
    lines.push(`PRIORITY:${PRIORITY_VALUE[item.priority]}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
