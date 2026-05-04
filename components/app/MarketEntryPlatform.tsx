'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  ClipboardList,
  Loader2,
  MapPin,
  Megaphone,
  Plus,
  Target,
  UploadCloud,
} from 'lucide-react';

type Tab = 'overview' | 'sprints' | 'insights' | 'activations' | 'profile';

type Sprint = {
  id: string;
  title: string;
  product_name: string;
  market: string;
  category?: string;
  stage: string;
  goal?: string;
  audience?: string;
  budget?: string;
  asset_url?: string;
  status: string;
  created_at?: string;
};

type Insight = {
  id: string;
  title: string;
  market: string;
  insight_type: string;
  summary: string;
  recommendation?: string;
  confidence: number;
  sprint_title?: string;
};

type Activation = {
  id: string;
  title: string;
  city: string;
  channel: string;
  venue?: string;
  activation_date?: string;
  target_leads: number;
  actual_leads: number;
  status: string;
  sprint_title?: string;
};

type ClientProfile = {
  company?: string;
  role?: string;
  website?: string;
  product_category?: string;
  target_markets?: string[];
  launch_goal?: string;
  budget_range?: string;
  logo_url?: string;
};

const tabs: { id: Tab; label: string; Icon: any }[] = [
  { id: 'overview', label: 'Command', Icon: BarChart3 },
  { id: 'sprints', label: 'Sprints', Icon: Target },
  { id: 'insights', label: 'Insights', Icon: ClipboardList },
  { id: 'activations', label: 'Activations', Icon: Megaphone },
  { id: 'profile', label: 'Profile', Icon: Building2 },
];

const stageLabels: Record<string, string> = {
  idea: 'Market idea',
  research: 'Research',
  testing: 'Consumer test',
  activation: 'Activation',
  report: 'Reporting',
  complete: 'Complete',
};

const stageOrder = ['idea', 'research', 'testing', 'activation', 'report', 'complete'];

const field =
  'w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand/50 focus:ring-4 focus:ring-brand/10';

const label = 'mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-ink/35';

async function getJson(url: string) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

async function postJson(url: string, body: unknown, method = 'POST') {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function StatCard({ label, value, sub, Icon }: { label: string; value: string | number; sub: string; Icon: any }) {
  return (
    <div className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-faint text-brand">
          <Icon size={19} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/25">{label}</span>
      </div>
      <p className="font-display text-4xl italic text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink/40">{sub}</p>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[28px] border border-dashed border-black/10 bg-white p-8 text-center">
      <p className="font-display text-2xl italic text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink/45">{body}</p>
    </div>
  );
}

function AssetUpload({ onUploaded, currentUrl }: { onUploaded: (url: string) => void; currentUrl?: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      onUploaded(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <label className="flex cursor-pointer items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-faint text-brand">
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">{currentUrl ? 'Asset uploaded' : 'Upload asset'}</span>
          <span className="block truncate text-xs text-ink/35">{currentUrl || 'Logo, pack shot, deck image, or activation visual'}</span>
        </span>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
      </label>
      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function MarketEntryPlatform({ initialUser }: { initialUser?: any }) {
  const [active, setActive] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [profile, setProfile] = useState<ClientProfile>({
    company: initialUser?.company || 'Convivia Client',
    role: initialUser?.role || 'Founder',
    product_category: 'Healthy drinks',
    target_markets: ['Nigeria'],
  });
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [activations, setActivations] = useState<Activation[]>([]);

  const [sprintForm, setSprintForm] = useState({
    title: '24-day Nigeria launch sprint',
    product_name: '',
    market: 'Nigeria',
    category: 'Healthy drinks',
    stage: 'research',
    goal: '',
    audience: '',
    budget: '',
    asset_url: '',
  });
  const [insightForm, setInsightForm] = useState({
    title: '',
    market: 'Nigeria',
    insight_type: 'consumer',
    summary: '',
    recommendation: '',
    confidence: 75,
    sprint_id: '',
  });
  const [activationForm, setActivationForm] = useState({
    title: '',
    city: 'Lagos',
    channel: 'sampling',
    venue: '',
    activation_date: '',
    target_leads: 100,
    sprint_id: '',
    notes: '',
  });
  const [saving, setSaving] = useState('');

  const metrics = useMemo(() => {
    const activeSprints = sprints.filter((s) => s.status === 'active').length;
    const planned = activations.filter((a) => a.status === 'planned' || a.status === 'live').length;
    const leads = activations.reduce((sum, a) => sum + Number(a.actual_leads || 0), 0);
    const avgConfidence = insights.length
      ? Math.round(insights.reduce((sum, i) => sum + Number(i.confidence || 0), 0) / insights.length)
      : 0;
    return { activeSprints, planned, leads, avgConfidence };
  }, [sprints, insights, activations]);

  useEffect(() => {
    refreshAll();
  }, []);

  async function refreshAll() {
    setLoading(true);
    setNotice('');
    try {
      const [profileData, sprintData, insightData, activationData] = await Promise.all([
        getJson('/api/client/profile'),
        getJson('/api/market/sprints'),
        getJson('/api/market/insights'),
        getJson('/api/market/activations'),
      ]);
      setProfile((p) => ({ ...p, ...(profileData.profile || {}) }));
      setSprints(sprintData.sprints || []);
      setInsights(insightData.insights || []);
      setActivations(activationData.activations || []);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not load platform data.');
    } finally {
      setLoading(false);
    }
  }

  async function createSprint() {
    setSaving('sprint');
    setNotice('');
    try {
      const data = await postJson('/api/market/sprints', sprintForm);
      setSprints((items) => [data.sprint, ...items]);
      setSprintForm((f) => ({ ...f, product_name: '', goal: '', audience: '', budget: '', asset_url: '' }));
      setNotice('Market sprint created.');
      setActive('sprints');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not create sprint.');
    } finally {
      setSaving('');
    }
  }

  async function createInsight() {
    setSaving('insight');
    setNotice('');
    try {
      const data = await postJson('/api/market/insights', insightForm);
      setInsights((items) => [data.insight, ...items]);
      setInsightForm((f) => ({ ...f, title: '', summary: '', recommendation: '' }));
      setNotice('Insight saved.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not save insight.');
    } finally {
      setSaving('');
    }
  }

  async function createActivation() {
    setSaving('activation');
    setNotice('');
    try {
      const data = await postJson('/api/market/activations', activationForm);
      setActivations((items) => [data.activation, ...items]);
      setActivationForm((f) => ({ ...f, title: '', venue: '', activation_date: '', notes: '' }));
      setNotice('Activation planned.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not plan activation.');
    } finally {
      setSaving('');
    }
  }

  async function saveProfile() {
    setSaving('profile');
    setNotice('');
    try {
      const data = await postJson('/api/client/profile', profile, 'PATCH');
      setProfile(data.profile);
      setNotice('Client profile saved.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not save profile.');
    } finally {
      setSaving('');
    }
  }

  return (
    <div className="flex h-full bg-surface-50 text-ink">
      <aside className="hidden w-72 shrink-0 border-r border-black/[0.06] bg-ink p-6 text-white lg:flex lg:flex-col">
        <img src="/convivia24.png" alt="Convivia24" className="h-8 w-fit brightness-0 invert" />
        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.32em] text-brand">Market Entry OS</p>
        <h1 className="mt-3 font-display text-4xl italic leading-none">Africa launch command.</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/45">
          Market intelligence, consumer testing, and brand activation for companies entering African markets.
        </p>
        <nav className="mt-10 space-y-2">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                active === id ? 'bg-brand text-white' : 'text-white/45 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">24-day sprint</p>
          <p className="mt-2 text-sm text-white/60">From signal to market plan in one focused cycle.</p>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/90 px-5 py-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-brand">Convivia24</p>
              <h2 className="font-display text-3xl italic text-ink md:text-4xl">{tabs.find((t) => t.id === active)?.label}</h2>
            </div>
            <button
              onClick={() => setActive('sprints')}
              className="hidden items-center gap-2 rounded-full bg-brand px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-[0_8px_30px_rgba(232,24,26,0.25)] md:flex"
            >
              <Plus size={14} />
              New Sprint
            </button>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-widest ${
                  active === id ? 'border-brand bg-brand text-white' : 'border-black/10 bg-white text-ink/45'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8">
          {notice && (
            <div className="mb-5 rounded-2xl border border-brand/15 bg-brand-faint px-4 py-3 text-sm text-brand-dark">
              {notice}
            </div>
          )}
          {loading ? (
            <div className="flex h-80 items-center justify-center">
              <Loader2 className="animate-spin text-brand" size={32} />
            </div>
          ) : (
            <>
              {active === 'overview' && (
                <div className="space-y-6">
                  <section className="rounded-[36px] bg-ink p-6 text-white md:p-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.32em] text-brand">Market intelligence + activation</p>
                    <h1 className="mt-4 max-w-3xl font-display text-5xl italic leading-none md:text-7xl">
                      Test, launch, and learn in Africa.
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/50">
                      Build a 24-day sprint, capture local insights, plan activations, and keep client assets in one place.
                    </p>
                  </section>

                  <div className="grid gap-4 md:grid-cols-4">
                    <StatCard label="Sprints" value={metrics.activeSprints} sub="active launch cycles" Icon={Target} />
                    <StatCard label="Insights" value={insights.length} sub={`${metrics.avgConfidence}% avg confidence`} Icon={BarChart3} />
                    <StatCard label="Activations" value={metrics.planned} sub="planned or live" Icon={Megaphone} />
                    <StatCard label="Leads" value={metrics.leads} sub="captured from activations" Icon={Activity} />
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
                      <p className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-ink/35">Recent sprints</p>
                      {sprints.length ? (
                        <div className="space-y-3">
                          {sprints.slice(0, 4).map((sprint) => (
                            <div key={sprint.id} className="flex items-center justify-between rounded-2xl bg-surface-100 p-4">
                              <div>
                                <p className="font-semibold text-ink">{sprint.title}</p>
                                <p className="text-xs text-ink/40">{sprint.product_name} - {sprint.market}</p>
                              </div>
                              <span className="rounded-full bg-brand-faint px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand">
                                {stageLabels[sprint.stage] || sprint.stage}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState title="No sprints yet." body="Create your first market entry sprint for a product, city, or consumer segment." />
                      )}
                    </div>

                    <div className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
                      <p className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-ink/35">Client profile</p>
                      <div className="flex items-center gap-4">
                        {profile.logo_url ? (
                          <img src={profile.logo_url} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-faint text-brand">
                            <Building2 size={24} />
                          </div>
                        )}
                        <div>
                          <p className="font-display text-2xl italic text-ink">{profile.company || 'Add company'}</p>
                          <p className="text-sm text-ink/40">{profile.product_category || 'Product category'} - {(profile.target_markets || []).join(', ') || 'Target markets'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {active === 'sprints' && (
                <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                  <section className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
                    <p className="mb-5 text-[10px] font-black uppercase tracking-[0.24em] text-ink/35">Create 24-day sprint</p>
                    <div className="space-y-4">
                      <input className={field} placeholder="Sprint title" value={sprintForm.title} onChange={(e) => setSprintForm({ ...sprintForm, title: e.target.value })} />
                      <input className={field} placeholder="Product / brand name" value={sprintForm.product_name} onChange={(e) => setSprintForm({ ...sprintForm, product_name: e.target.value })} />
                      <div className="grid grid-cols-2 gap-3">
                        <input className={field} placeholder="Market" value={sprintForm.market} onChange={(e) => setSprintForm({ ...sprintForm, market: e.target.value })} />
                        <input className={field} placeholder="Category" value={sprintForm.category} onChange={(e) => setSprintForm({ ...sprintForm, category: e.target.value })} />
                      </div>
                      <select className={field} value={sprintForm.stage} onChange={(e) => setSprintForm({ ...sprintForm, stage: e.target.value })}>
                        {stageOrder.map((stage) => <option key={stage} value={stage}>{stageLabels[stage]}</option>)}
                      </select>
                      <textarea className={field} rows={3} placeholder="Launch goal" value={sprintForm.goal} onChange={(e) => setSprintForm({ ...sprintForm, goal: e.target.value })} />
                      <textarea className={field} rows={2} placeholder="Target audience" value={sprintForm.audience} onChange={(e) => setSprintForm({ ...sprintForm, audience: e.target.value })} />
                      <input className={field} placeholder="Budget range" value={sprintForm.budget} onChange={(e) => setSprintForm({ ...sprintForm, budget: e.target.value })} />
                      <AssetUpload currentUrl={sprintForm.asset_url} onUploaded={(url) => setSprintForm({ ...sprintForm, asset_url: url })} />
                      <button onClick={createSprint} disabled={saving === 'sprint'} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 text-[12px] font-black uppercase tracking-[0.18em] text-white disabled:opacity-50">
                        {saving === 'sprint' ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        Create Sprint
                      </button>
                    </div>
                  </section>

                  <section className="space-y-4">
                    {sprints.length ? sprints.map((sprint) => (
                      <article key={sprint.id} className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand">{sprint.market}</p>
                            <h3 className="mt-2 font-display text-3xl italic text-ink">{sprint.title}</h3>
                            <p className="mt-1 text-sm text-ink/45">{sprint.product_name} - {sprint.category || 'General market entry'}</p>
                          </div>
                          <span className="w-fit rounded-full bg-ink px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white">{stageLabels[sprint.stage] || sprint.stage}</span>
                        </div>
                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                          <p className="rounded-2xl bg-surface-100 p-4 text-sm text-ink/55"><b className="block text-ink">Goal</b>{sprint.goal || 'Define launch goal'}</p>
                          <p className="rounded-2xl bg-surface-100 p-4 text-sm text-ink/55"><b className="block text-ink">Audience</b>{sprint.audience || 'Define audience'}</p>
                          <p className="rounded-2xl bg-surface-100 p-4 text-sm text-ink/55"><b className="block text-ink">Budget</b>{sprint.budget || 'Not set'}</p>
                        </div>
                      </article>
                    )) : <EmptyState title="Create your first sprint." body="Use sprints to package research, testing, activation, and reporting around a clear market entry goal." />}
                  </section>
                </div>
              )}

              {active === 'insights' && (
                <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                  <section className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
                    <p className="mb-5 text-[10px] font-black uppercase tracking-[0.24em] text-ink/35">Add market insight</p>
                    <div className="space-y-4">
                      <select className={field} value={insightForm.sprint_id} onChange={(e) => setInsightForm({ ...insightForm, sprint_id: e.target.value })}>
                        <option value="">No sprint / general insight</option>
                        {sprints.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                      </select>
                      <input className={field} placeholder="Insight title" value={insightForm.title} onChange={(e) => setInsightForm({ ...insightForm, title: e.target.value })} />
                      <div className="grid grid-cols-2 gap-3">
                        <input className={field} placeholder="Market" value={insightForm.market} onChange={(e) => setInsightForm({ ...insightForm, market: e.target.value })} />
                        <select className={field} value={insightForm.insight_type} onChange={(e) => setInsightForm({ ...insightForm, insight_type: e.target.value })}>
                          {['consumer','pricing','competitor','channel','culture','risk'].map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </div>
                      <textarea className={field} rows={4} placeholder="What did we learn?" value={insightForm.summary} onChange={(e) => setInsightForm({ ...insightForm, summary: e.target.value })} />
                      <textarea className={field} rows={3} placeholder="Recommended next action" value={insightForm.recommendation} onChange={(e) => setInsightForm({ ...insightForm, recommendation: e.target.value })} />
                      <label className={label}>Confidence: {insightForm.confidence}%</label>
                      <input type="range" min="10" max="100" value={insightForm.confidence} onChange={(e) => setInsightForm({ ...insightForm, confidence: Number(e.target.value) })} className="w-full accent-brand" />
                      <button onClick={createInsight} disabled={saving === 'insight'} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 text-[12px] font-black uppercase tracking-[0.18em] text-white disabled:opacity-50">
                        {saving === 'insight' ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        Save Insight
                      </button>
                    </div>
                  </section>

                  <section className="grid gap-4 md:grid-cols-2">
                    {insights.length ? insights.map((insight) => (
                      <article key={insight.id} className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="rounded-full bg-brand-faint px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand">{insight.insight_type}</span>
                          <span className="font-display text-2xl italic text-ink">{insight.confidence}%</span>
                        </div>
                        <h3 className="font-display text-2xl italic text-ink">{insight.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-ink/50">{insight.summary}</p>
                        {insight.recommendation && <p className="mt-4 rounded-2xl bg-surface-100 p-4 text-sm text-ink/55"><b className="text-ink">Next action: </b>{insight.recommendation}</p>}
                      </article>
                    )) : <EmptyState title="No insights yet." body="Capture consumer, pricing, channel, and cultural signals as your sprint progresses." />}
                  </section>
                </div>
              )}

              {active === 'activations' && (
                <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                  <section className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
                    <p className="mb-5 text-[10px] font-black uppercase tracking-[0.24em] text-ink/35">Plan brand activation</p>
                    <div className="space-y-4">
                      <select className={field} value={activationForm.sprint_id} onChange={(e) => setActivationForm({ ...activationForm, sprint_id: e.target.value })}>
                        <option value="">No sprint / general activation</option>
                        {sprints.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                      </select>
                      <input className={field} placeholder="Activation title" value={activationForm.title} onChange={(e) => setActivationForm({ ...activationForm, title: e.target.value })} />
                      <div className="grid grid-cols-2 gap-3">
                        <input className={field} placeholder="City" value={activationForm.city} onChange={(e) => setActivationForm({ ...activationForm, city: e.target.value })} />
                        <input className={field} placeholder="Channel" value={activationForm.channel} onChange={(e) => setActivationForm({ ...activationForm, channel: e.target.value })} />
                      </div>
                      <input className={field} placeholder="Venue / location" value={activationForm.venue} onChange={(e) => setActivationForm({ ...activationForm, venue: e.target.value })} />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="date" className={field} value={activationForm.activation_date} onChange={(e) => setActivationForm({ ...activationForm, activation_date: e.target.value })} />
                        <input type="number" className={field} value={activationForm.target_leads} onChange={(e) => setActivationForm({ ...activationForm, target_leads: Number(e.target.value) })} />
                      </div>
                      <textarea className={field} rows={3} placeholder="Notes" value={activationForm.notes} onChange={(e) => setActivationForm({ ...activationForm, notes: e.target.value })} />
                      <button onClick={createActivation} disabled={saving === 'activation'} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 text-[12px] font-black uppercase tracking-[0.18em] text-white disabled:opacity-50">
                        {saving === 'activation' ? <Loader2 size={16} className="animate-spin" /> : <CalendarDays size={16} />}
                        Plan Activation
                      </button>
                    </div>
                  </section>

                  <section className="space-y-4">
                    {activations.length ? activations.map((activation) => (
                      <article key={activation.id} className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-display text-3xl italic text-ink">{activation.title}</h3>
                            <p className="mt-1 flex items-center gap-2 text-sm text-ink/45"><MapPin size={14} />{activation.city}{activation.venue ? ` - ${activation.venue}` : ''}</p>
                          </div>
                          <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">{activation.status}</span>
                        </div>
                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                          <p className="rounded-2xl bg-surface-100 p-4 text-sm text-ink/55"><b className="block text-ink">Channel</b>{activation.channel}</p>
                          <p className="rounded-2xl bg-surface-100 p-4 text-sm text-ink/55"><b className="block text-ink">Date</b>{activation.activation_date || 'TBC'}</p>
                          <p className="rounded-2xl bg-surface-100 p-4 text-sm text-ink/55"><b className="block text-ink">Leads</b>{activation.actual_leads || 0}/{activation.target_leads || 0}</p>
                        </div>
                      </article>
                    )) : <EmptyState title="No activations yet." body="Plan sampling, retail visits, influencer drops, campus tests, office trials, or pop-up events." />}
                  </section>
                </div>
              )}

              {active === 'profile' && (
                <section className="mx-auto max-w-3xl rounded-[32px] border border-black/[0.06] bg-white p-6 shadow-sm md:p-8">
                  <div className="mb-6 flex items-center gap-4">
                    {profile.logo_url ? (
                      <img src={profile.logo_url} alt="" className="h-20 w-20 rounded-3xl object-cover" />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-faint text-brand">
                        <Building2 size={28} />
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand">Client profile</p>
                      <h3 className="font-display text-4xl italic text-ink">{profile.company || 'Your company'}</h3>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div><label className={label}>Company</label><input className={field} value={profile.company || ''} onChange={(e) => setProfile({ ...profile, company: e.target.value })} /></div>
                    <div><label className={label}>Your role</label><input className={field} value={profile.role || ''} onChange={(e) => setProfile({ ...profile, role: e.target.value })} /></div>
                    <div><label className={label}>Website</label><input className={field} value={profile.website || ''} onChange={(e) => setProfile({ ...profile, website: e.target.value })} /></div>
                    <div><label className={label}>Product category</label><input className={field} value={profile.product_category || ''} onChange={(e) => setProfile({ ...profile, product_category: e.target.value })} /></div>
                    <div><label className={label}>Target markets</label><input className={field} value={(profile.target_markets || []).join(', ')} onChange={(e) => setProfile({ ...profile, target_markets: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} /></div>
                    <div><label className={label}>Budget range</label><input className={field} value={profile.budget_range || ''} onChange={(e) => setProfile({ ...profile, budget_range: e.target.value })} /></div>
                    <div className="md:col-span-2"><label className={label}>Launch goal</label><textarea className={field} rows={3} value={profile.launch_goal || ''} onChange={(e) => setProfile({ ...profile, launch_goal: e.target.value })} /></div>
                    <div className="md:col-span-2"><AssetUpload currentUrl={profile.logo_url} onUploaded={(url) => setProfile({ ...profile, logo_url: url })} /></div>
                  </div>
                  <button onClick={saveProfile} disabled={saving === 'profile'} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 text-[12px] font-black uppercase tracking-[0.18em] text-white disabled:opacity-50">
                    {saving === 'profile' ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Save Client Profile
                  </button>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
