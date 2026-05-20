'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { EVENT_TYPE_META, ACCENT_COLORS, type EventType } from '@/components/convivia24/primitives';

export interface EventSwitcherItem {
  id: string;
  title: string;
  host_name: string;
  event_date: string | null;
  event_type: string;
}

export function EventSwitcher({
  events,
  activeEvent,
  onSelect,
}: {
  events: EventSwitcherItem[];
  activeEvent: EventSwitcherItem;
  onSelect: (eventId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (events.length <= 1) return null;

  const accent = ACCENT_COLORS[activeEvent.event_type as EventType] || '#c0975a';
  const dateStr = activeEvent.event_date
    ? new Date(activeEvent.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : null;

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: 10 }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
          border: `1.5px solid ${open ? accent : 'var(--cv-hairline)'}`,
          background: '#fff',
          textAlign: 'left',
          boxShadow: open ? `0 4px 16px ${accent}22` : 'none',
          transition: 'border-color .15s, box-shadow .15s',
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 99, background: accent, flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--cv-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeEvent.title || activeEvent.host_name}
          </span>
          <span style={{ display: 'block', fontSize: 10.5, color: 'var(--cv-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeEvent.host_name}{dateStr ? ` · ${dateStr}` : ''}
          </span>
        </span>
        <ChevronDown size={14} color="var(--cv-muted)" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 120,
            background: '#fff', borderRadius: 14, border: '1px solid var(--cv-hairline)',
            boxShadow: '0 12px 32px rgba(26,23,20,.14)', overflow: 'hidden',
            maxHeight: 280, overflowY: 'auto',
          }}
        >
          {events.map(ev => {
            const evAccent = ACCENT_COLORS[ev.event_type as EventType] || '#c0975a';
            const evDate = ev.event_date
              ? new Date(ev.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
              : null;
            const selected = ev.id === activeEvent.id;
            return (
              <button
                key={ev.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => { onSelect(ev.id); setOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', border: 'none', borderBottom: '1px solid var(--cv-hairline)',
                  background: selected ? `${evAccent}12` : '#fff',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: 99, background: evAccent, flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--cv-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ev.title || ev.host_name}
                  </span>
                  <span style={{ display: 'block', fontSize: 10, color: 'var(--cv-muted)', marginTop: 2 }}>
                    {EVENT_TYPE_META[ev.event_type as EventType]?.label || ev.event_type}
                    {evDate ? ` · ${evDate}` : ''}
                  </span>
                </span>
                {selected && <Check size={14} color={evAccent} style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
