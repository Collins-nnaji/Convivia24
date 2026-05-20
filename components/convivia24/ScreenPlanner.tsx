'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  CalendarDays, Sparkles, Send, Loader2, Plus, Trash2, Check, Clock,
  CheckCircle, ChevronRight, ListChecks, Target, X, ArrowLeft,
} from 'lucide-react';
import { Eyebrow, Chip, Btn, Card, Dial, Bar, type EventType, ACCENT_COLORS } from '@/components/convivia24/primitives';

const DOCK_PAD = 'calc(92px + env(safe-area-inset-bottom, 0px))';

interface CvEvent {
  id: string;
  host_name: string;
  event_type: string;
  event_date: string | null;
  event_time: string | null;
  city: string | null;
  capacity: number;
}

interface ScheduleItem {
  id: string;
  time_label: string;
  title: string;
  subtitle: string | null;
}

type PlannerPanel = 'timeline' | 'ai';

interface Milestone {
  id: string;
  label: string;
  weeksOut: number;
  tasks: string[];
}

const RUN_PRESETS = [
  { time: '16:00', title: 'Guest arrival', sub: 'Welcome drinks · registration' },
  { time: '17:00', title: 'Ceremony or main program', sub: 'All guests seated' },
  { time: '18:00', title: 'Cocktails', sub: 'Canapés · live music' },
  { time: '19:30', title: 'Dinner service', sub: 'Assigned seating' },
  { time: '21:00', title: 'Speeches & toasts', sub: '~20 minutes' },
  { time: '22:30', title: 'Dancing', sub: 'DJ · open floor' },
];

function buildMilestones(eventType: string): Milestone[] {
  const base: Milestone[] = [
    { id: 'w12', label: '12 weeks out', weeksOut: 12, tasks: ['Set budget', 'Book venue', 'Draft guest list'] },
    { id: 'w8', label: '8 weeks out', weeksOut: 8, tasks: ['Book catering', 'Send save-the-dates', 'Book photo/video'] },
    { id: 'w4', label: '4 weeks out', weeksOut: 4, tasks: ['Finalize menu', 'Confirm vendors', 'Seating plan draft'] },
    { id: 'w1', label: '1 week out', weeksOut: 1, tasks: ['Confirm RSVPs', 'Brief vendors', 'Run of show locked'] },
    { id: 'day', label: 'Event day', weeksOut: 0, tasks: ['Vendor call sheet', 'Door team briefed', 'Emergency contacts shared'] },
  ];
  if (eventType === 'corporate') {
    base[1].tasks = ['AV & staging', 'Invite delegates', 'Book catering'];
  }
  if (eventType === 'birthday') {
    base[0].tasks = ['Pick venue', 'Theme & decor', 'Guest list'];
  }
  return base;
}

function tasksStorageKey(eventId: string) {
  return `cv-planner-tasks-${eventId}`;
}

export function ScreenPlanner({
  event, onToast, onBack, eventSwitcher,
}: {
  event: CvEvent;
  onToast: (msg: string) => void;
  onBack?: () => void;
  eventSwitcher?: React.ReactNode;
}) {
  const [panel, setPanel] = useState<PlannerPanel>('timeline');
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTime, setNewTime] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newSub, setNewSub] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>('w8');
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [thread, setThread] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const accent = ACCENT_COLORS[(event.event_type || 'wedding') as EventType] || '#c0975a';
  const milestones = useMemo(() => buildMilestones(event.event_type), [event.event_type]);

  const eventDate = event.event_date ? new Date(event.event_date + 'T12:00:00') : null;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const daysUntil = eventDate
    ? Math.max(0, Math.ceil((eventDate.getTime() - today.getTime()) / 86400000))
    : null;
  const weeksUntil = daysUntil !== null ? Math.ceil(daysUntil / 7) : null;
  const progress = daysUntil !== null && eventDate
    ? Math.min(1, Math.max(0, 1 - daysUntil / Math.max(daysUntil + 30, 90)))
    : 0;

  const loadSchedule = useCallback(async () => {
    setLoadingSchedule(true);
    try {
      const res = await fetch(`/api/convivia24/schedule?eventId=${event.id}`, { credentials: 'include', cache: 'no-store' });
      if (res.ok) setItems((await res.json()).items || []);
    } finally {
      setLoadingSchedule(false);
    }
  }, [event.id]);

  useEffect(() => { loadSchedule(); }, [loadSchedule]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(tasksStorageKey(event.id));
      if (raw) setCheckedTasks(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [event.id]);

  useEffect(() => {
    try {
      localStorage.setItem(tasksStorageKey(event.id), JSON.stringify(checkedTasks));
    } catch { /* ignore */ }
  }, [checkedTasks, event.id]);

  useEffect(() => {
    if (panel === 'ai' && thread.length === 0) {
      setThread([{
        role: 'assistant',
        text: `I'm your planner for ${event.host_name}.${event.event_date ? ` ${new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}${event.city ? ` in ${event.city}` : ''}.\n\nAsk for timelines, checklists, vendor outreach, or a day-of run sheet.`,
      }]);
    }
  }, [panel, event, thread.length]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [thread, aiBusy]);

  const taskKey = (mId: string, task: string) => `${mId}::${task}`;

  const completedTaskCount = Object.values(checkedTasks).filter(Boolean).length;
  const totalTasks = milestones.reduce((n, m) => n + m.tasks.length, 0);
  const taskProgress = totalTasks ? completedTaskCount / totalTasks : 0;

  async function addScheduleItem(time: string, title: string, sub: string) {
    if (!time.trim() || !title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/convivia24/schedule', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          time_label: time.trim(),
          title: title.trim(),
          subtitle: sub.trim() || null,
          sort_order: items.length,
        }),
      });
      if (res.ok) {
        setNewTime(''); setNewTitle(''); setNewSub(''); setShowAdd(false);
        loadSchedule();
        onToast('Added to run of show');
      }
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(id: string) {
    await fetch(`/api/convivia24/schedule?id=${id}&eventId=${event.id}`, { method: 'DELETE', credentials: 'include' });
    setItems(prev => prev.filter(i => i.id !== id));
    onToast('Removed');
  }

  async function addPreset(p: { time: string; title: string; sub: string }) {
    await addScheduleItem(p.time, p.title, p.sub);
  }

  async function askAi(prompt: string) {
    if (!prompt.trim() || aiBusy) return;
    const userMsg = { role: 'user' as const, text: prompt };
    const nextThread = [...thread, userMsg];
    setThread(nextThread);
    setAiInput('');
    setAiBusy(true);
    try {
      const res = await fetch('/api/convivia24/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextThread.map(m => ({ role: m.role, content: m.text })),
          event_context: `${event.event_type} · ${event.host_name} · ${event.capacity} guests · ${event.event_date || 'date TBC'}${event.city ? ` · ${event.city}` : ''}`,
        }),
      });
      const data = await res.json();
      setThread(prev => [...prev, { role: 'assistant', text: data.reply || 'Try again in a moment.' }]);
    } catch {
      setThread(prev => [...prev, { role: 'assistant', text: 'Planner is offline. Try again.' }]);
    } finally {
      setAiBusy(false);
    }
  }

  const AI_PROMPTS = [
    { l: '12-week plan', q: `Give me a 12-week countdown for a ${event.capacity}-person ${event.event_type}${event.city ? ` in ${event.city}` : ''}. Bullet points only.` },
    { l: 'Day-of run sheet', q: `Build a detailed day-of timeline for ${event.host_name}${event.event_time ? ` starting ${event.event_time}` : ''}. Use times like 17:00.` },
    { l: 'Vendor checklist', q: `Which vendors should I book and by when for this ${event.event_type}?` },
    { l: 'Guest comms', q: `Draft a short message to guests who have not RSVP'd yet. Warm, no exclamation marks.` },
    { l: 'Rain plan B', q: `Suggest a plan B if weather is bad${event.city ? ` in ${event.city}` : ''} on event day.` },
    { l: 'Budget tips', q: `Where to save vs splurge for a ${event.capacity}-guest ${event.event_type}?` },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--cv-ivory)' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, zIndex: 20,
        padding: '12px 14px 10px',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        background: 'rgba(250,246,238,.94)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--cv-hairline)',
      }}>
        {eventSwitcher}
        <p style={{ fontSize: 11, color: 'var(--cv-muted)', margin: '0 0 10px', lineHeight: 1.4 }}>
          Timeline and AI planning for this event. Use ← back to return to Event home.
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Eyebrow muted>Planner</Eyebrow>
            <h1 style={{
              fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic',
              fontSize: 'clamp(22px, 5vw, 26px)', lineHeight: 1.05, marginTop: 4, color: 'var(--cv-ink)',
            }}>
              {event.host_name}
            </h1>
          </div>
          {onBack && (
            <button type="button" onClick={onBack} aria-label="Back" style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              border: '1px solid var(--cv-hairline)', background: 'var(--cv-paper)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <ArrowLeft size={16} color="var(--cv-muted)" />
            </button>
          )}
        </div>

        <div style={{
          display: 'flex', marginTop: 12, background: 'var(--cv-paper)',
          borderRadius: 12, padding: 4, border: '1px solid var(--cv-hairline)',
        }}>
          {([
            { id: 'timeline' as PlannerPanel, label: 'Timeline', Icon: CalendarDays },
            { id: 'ai' as PlannerPanel, label: 'AI planner', Icon: Sparkles },
          ]).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPanel(id)}
              style={{
                flex: 1, minHeight: 44, border: 'none', borderRadius: 9, cursor: 'pointer',
                background: panel === id ? 'var(--cv-ink)' : 'transparent',
                color: panel === id ? 'var(--cv-ivory)' : 'var(--cv-muted)',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <Icon size={14} strokeWidth={panel === id ? 2.2 : 1.5} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {panel === 'timeline' ? (
        <div className="cv-scrollbar" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 14px', paddingBottom: DOCK_PAD }}>

          {/* Countdown hero */}
          <Card style={{ padding: 18, marginBottom: 12, background: `linear-gradient(145deg, ${accent}12, var(--cv-paper))` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {eventDate ? (
                <Dial value={progress} size={72} stroke={5}>
                  <span style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 22, color: accent, fontVariantNumeric: 'tabular-nums' }}>
                    {daysUntil}
                  </span>
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cv-muted)' }}>days</span>
                </Dial>
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: 99, border: `2px dashed ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarDays size={24} color={accent} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                {eventDate ? (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cv-muted-2)' }}>Event date</div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4, lineHeight: 1.3 }}>
                      {eventDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    {event.event_time && <div style={{ fontSize: 12, color: 'var(--cv-muted)', marginTop: 4 }}>Starts {event.event_time}</div>}
                    {weeksUntil !== null && weeksUntil > 0 && (
                      <div style={{ fontSize: 11, color: accent, marginTop: 6, fontWeight: 600 }}>~{weeksUntil} week{weeksUntil !== 1 ? 's' : ''} to go</div>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--cv-muted)', lineHeight: 1.45, margin: 0 }}>
                    Add your event date in <strong>Edit</strong> to unlock countdown and milestone tracking.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Milestone checklist */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Eyebrow muted>Planning checklist</Eyebrow>
              <span style={{ fontSize: 10, fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums' }}>
                {completedTaskCount}/{totalTasks}
              </span>
            </div>
            <Bar value={taskProgress} accent height={6} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {milestones.map(m => {
                const isPast = weeksUntil !== null && weeksUntil <= m.weeksOut;
                const isCurrent = weeksUntil !== null && weeksUntil <= m.weeksOut && weeksUntil > (milestones[milestones.indexOf(m) + 1]?.weeksOut ?? -1);
                const open = expandedMilestone === m.id;
                const doneCount = m.tasks.filter(t => checkedTasks[taskKey(m.id, t)]).length;
                return (
                  <Card key={m.id} style={{ padding: 0, overflow: 'hidden', border: isCurrent ? `1px solid ${accent}55` : undefined }}>
                    <button
                      type="button"
                      onClick={() => setExpandedMilestone(open ? null : m.id)}
                      style={{
                        width: '100%', padding: '14px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 12, minHeight: 56, textAlign: 'left',
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 99, flexShrink: 0,
                        background: isPast ? `${accent}22` : 'var(--cv-ivory-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {doneCount === m.tasks.length ? (
                          <CheckCircle size={16} color={accent} />
                        ) : isCurrent ? (
                          <Target size={16} color={accent} />
                        ) : (
                          <Clock size={16} color="var(--cv-muted-2)" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cv-ink)' }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--cv-muted)', marginTop: 2 }}>{doneCount} of {m.tasks.length} done</div>
                      </div>
                      <ChevronRight size={16} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .2s', color: 'var(--cv-muted-2)' }} />
                    </button>
                    {open && (
                      <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {m.tasks.map(task => {
                          const key = taskKey(m.id, task);
                          const on = !!checkedTasks[key];
                          return (
                            <button
                              key={task}
                              type="button"
                              onClick={() => setCheckedTasks(prev => ({ ...prev, [key]: !prev[key] }))}
                              style={{
                                width: '100%', minHeight: 48, padding: '10px 12px', borderRadius: 10,
                                border: `1px solid ${on ? accent + '44' : 'var(--cv-hairline)'}`,
                                background: on ? `${accent}10` : 'var(--cv-ivory-2)',
                                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left',
                              }}
                            >
                              <span style={{
                                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                                border: `2px solid ${on ? accent : 'var(--cv-hairline)'}`,
                                background: on ? accent : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                {on && <Check size={12} color="#fff" strokeWidth={3} />}
                              </span>
                              <span style={{
                                fontSize: 13, color: on ? 'var(--cv-muted)' : 'var(--cv-ink)',
                                textDecoration: on ? 'line-through' : 'none', lineHeight: 1.35,
                              }}>
                                {task}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Run of show */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Eyebrow muted>Run of show</Eyebrow>
              <button
                type="button"
                onClick={() => setShowAdd(v => !v)}
                style={{
                  minHeight: 36, padding: '0 12px', borderRadius: 99, border: '1px solid var(--cv-hairline)',
                  background: 'var(--cv-paper)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: accent,
                }}
              >
                {showAdd ? <X size={12} /> : <Plus size={12} />}
                {showAdd ? 'Close' : 'Add'}
              </button>
            </div>

            <p style={{ fontSize: 11.5, color: 'var(--cv-muted)', marginBottom: 10, lineHeight: 1.45 }}>
              Syncs with <strong>Activities</strong> on event day — door scanner and live dashboard.
            </p>

            {showAdd && (
              <Card style={{ padding: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(72px, 28%) 1fr', gap: 8 }}>
                    <input className="cv-input" placeholder="19:30" value={newTime} onChange={e => setNewTime(e.target.value)} inputMode="numeric" style={{ minHeight: 48, fontSize: 16 }} />
                    <input className="cv-input" placeholder="What happens" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ minHeight: 48, fontSize: 16 }} />
                  </div>
                  <input className="cv-input" placeholder="Notes (optional)" value={newSub} onChange={e => setNewSub(e.target.value)} style={{ minHeight: 44 }} />
                  <Btn fullWidth onClick={() => addScheduleItem(newTime, newTitle, newSub)} disabled={saving || !newTime.trim() || !newTitle.trim()} style={{ minHeight: 48 }}>
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={13} /> Add to timeline</>}
                  </Btn>
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--cv-muted-2)', marginBottom: 8 }}>Quick add</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {RUN_PRESETS.map(p => (
                      <Chip key={p.title} onClick={() => addPreset(p)} style={{ minHeight: 36 }}>{p.time} · {p.title}</Chip>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {loadingSchedule ? (
              <div style={{ padding: 32, display: 'flex', justifyContent: 'center' }}><Loader2 size={22} className="animate-spin" color={accent} /></div>
            ) : items.length === 0 ? (
              <Card tinted style={{ padding: 24, textAlign: 'center' }}>
                <ListChecks size={28} color="var(--cv-muted-2)" style={{ margin: '0 auto 10px' }} />
                <p style={{ fontSize: 13, color: 'var(--cv-muted)', lineHeight: 1.5 }}>No activities yet. Use quick-add or ask the AI planner for a run sheet.</p>
                <Btn variant="ghost" style={{ marginTop: 12 }} onClick={() => { setPanel('ai'); askAi(`Build a day-of timeline for ${event.host_name}.`); }}>
                  <Sparkles size={12} /> Generate with AI
                </Btn>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {items.map((r, i) => (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex', gap: 12, alignItems: 'stretch',
                      padding: '14px 0',
                      borderBottom: i < items.length - 1 ? '1px solid var(--cv-hairline)' : 'none',
                    }}
                  >
                    <div style={{
                      width: 52, flexShrink: 0, fontSize: 13, fontWeight: 800,
                      fontVariantNumeric: 'tabular-nums', color: accent,
                      fontFamily: 'var(--font-geist-mono, monospace)', paddingTop: 2,
                    }}>
                      {r.time_label}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{r.title}</div>
                      {r.subtitle && <div style={{ fontSize: 12, color: 'var(--cv-muted)', marginTop: 4, lineHeight: 1.4 }}>{r.subtitle}</div>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(r.id)}
                      aria-label="Remove"
                      style={{
                        width: 44, height: 44, flexShrink: 0, border: 'none', borderRadius: 10,
                        background: 'var(--cv-ivory-2)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={15} color="var(--cv-muted-2)" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* AI panel — full height chat */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div
            ref={chatScrollRef}
            className="cv-scrollbar"
            style={{
              flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
              padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            {thread.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: 'min(92%, 340px)',
                  padding: '12px 14px',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                  background: m.role === 'user' ? 'var(--cv-ink)' : 'var(--cv-paper)',
                  color: m.role === 'user' ? 'var(--cv-ivory)' : 'var(--cv-ink)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--cv-hairline)',
                  fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {m.role === 'assistant' && i > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Sparkles size={12} color={accent} />
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: accent }}>Planner</span>
                  </div>
                )}
                {m.text}
              </div>
            ))}
            {aiBusy && (
              <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: 14, background: 'var(--cv-paper)', border: '1px solid var(--cv-hairline)', display: 'flex', gap: 6 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--cv-muted-2)', animation: `cv-pulse-dot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt grid */}
          <div style={{ flexShrink: 0, padding: '8px 14px 0', borderTop: '1px solid var(--cv-hairline)', background: 'rgba(250,246,238,.9)' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8,
              maxHeight: 120, overflowY: 'auto',
            }} className="cv-scrollbar">
              {AI_PROMPTS.map(p => (
                <button
                  key={p.l}
                  type="button"
                  onClick={() => askAi(p.q)}
                  disabled={aiBusy}
                  style={{
                    minHeight: 44, padding: '10px 12px', borderRadius: 12, textAlign: 'left',
                    border: '1px solid var(--cv-hairline)', background: 'var(--cv-paper)',
                    fontSize: 11, fontWeight: 600, color: 'var(--cv-ink)', cursor: 'pointer',
                    display: 'flex', alignItems: 'flex-start', gap: 6, lineHeight: 1.3,
                  }}
                >
                  <Sparkles size={11} color={accent} style={{ flexShrink: 0, marginTop: 2 }} />
                  {p.l}
                </button>
              ))}
            </div>
          </div>

          {/* Fixed composer */}
          <div style={{
            flexShrink: 0, padding: '10px 14px',
            paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
            marginBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
            background: 'var(--cv-ivory)', borderTop: '1px solid var(--cv-hairline)',
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                className="cv-input"
                rows={1}
                placeholder="Ask anything about your event…"
                value={aiInput}
                onChange={e => {
                  setAiInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    askAi(aiInput);
                  }
                }}
                style={{
                  flex: 1, minHeight: 48, maxHeight: 120, resize: 'none',
                  fontSize: 16, lineHeight: 1.4, paddingTop: 12, paddingBottom: 12,
                }}
              />
              <button
                type="button"
                onClick={() => askAi(aiInput)}
                disabled={aiBusy || !aiInput.trim()}
                style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  border: 'none', background: aiInput.trim() ? accent : 'var(--cv-hairline)',
                  color: '#fff', cursor: aiInput.trim() && !aiBusy ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: aiBusy ? 0.6 : 1,
                }}
              >
                {aiBusy ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
