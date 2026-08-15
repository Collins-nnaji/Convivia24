export type CrewLine = {
  slug: string;
  name: string;
  priceNgn: number;
  qty: number;
  addedBy: string;
};

export type PartyCrew = {
  id: string;
  name: string;
  venue: string;
  targetTime: string;
  hostName: string;
  memberCount: number;
  locked: boolean;
  lines: CrewLine[];
  createdAt: string;
};

const STORAGE_KEY = 'convivia_party_crews';

export function formatNgn(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function crewSubtotal(crew: PartyCrew): number {
  return crew.lines.reduce((n, l) => n + l.priceNgn * l.qty, 0);
}

export function equalSplit(crew: PartyCrew): number {
  const members = Math.max(1, crew.memberCount);
  return Math.ceil(crewSubtotal(crew) / members);
}

function loadAll(): PartyCrew[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PartyCrew[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(crews: PartyCrew[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(crews));
}

export function listCrews(): PartyCrew[] {
  return loadAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCrew(id: string): PartyCrew | undefined {
  return loadAll().find((c) => c.id === id);
}

export function createCrew(input: {
  name: string;
  venue: string;
  targetTime: string;
  hostName: string;
}): PartyCrew {
  const crew: PartyCrew = {
    id: `crew_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name: input.name.trim() || 'Tonight',
    venue: input.venue.trim() || 'TBD',
    targetTime: input.targetTime.trim() || 'Tonight',
    hostName: input.hostName.trim() || 'Host',
    memberCount: 1,
    locked: false,
    lines: [],
    createdAt: new Date().toISOString(),
  };
  const all = loadAll();
  all.push(crew);
  saveAll(all);
  return crew;
}

export function updateCrew(id: string, patch: Partial<PartyCrew>): PartyCrew | undefined {
  const all = loadAll();
  const idx = all.findIndex((c) => c.id === id);
  if (idx < 0) return undefined;
  all[idx] = { ...all[idx], ...patch, id: all[idx].id };
  saveAll(all);
  return all[idx];
}

export function addLineToCrew(
  id: string,
  line: Omit<CrewLine, 'qty'> & { qty?: number }
): PartyCrew | undefined {
  const crew = getCrew(id);
  if (!crew || crew.locked) return undefined;
  const qty = Math.max(1, Math.min(24, line.qty || 1));
  const existing = crew.lines.find((l) => l.slug === line.slug);
  const lines = existing
    ? crew.lines.map((l) =>
        l.slug === line.slug
          ? { ...l, qty: Math.min(24, l.qty + qty), priceNgn: line.priceNgn, name: line.name }
          : l
      )
    : [...crew.lines, { ...line, qty, addedBy: line.addedBy || 'Guest' }];
  return updateCrew(id, { lines });
}

export function setCrewLineQty(id: string, slug: string, qty: number): PartyCrew | undefined {
  const crew = getCrew(id);
  if (!crew || crew.locked) return undefined;
  const lines =
    qty <= 0 ? crew.lines.filter((l) => l.slug !== slug) : crew.lines.map((l) => (l.slug === slug ? { ...l, qty } : l));
  return updateCrew(id, { lines });
}

export function inviteUrl(crewId: string): string {
  if (typeof window === 'undefined') return `/crews/${crewId}`;
  return `${window.location.origin}/crews/${crewId}`;
}
