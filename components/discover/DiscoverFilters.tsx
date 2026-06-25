'use client';

import type { LucideIcon } from 'lucide-react';
import { MapPin, CalendarDays, Sparkles, ArrowUpDown, X } from 'lucide-react';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/categories';

export const WHEN_OPTIONS = [
  { value: '', label: 'Any date' },
  { value: 'today', label: 'Today' },
  { value: 'weekend', label: 'This weekend' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];

export const SORT_OPTIONS = [
  { value: 'soonest', label: 'Soonest first' },
  { value: 'featured', label: 'Featured first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

interface CityMeta {
  city: string;
  country: string;
  count: number;
}

interface DiscoverFiltersProps {
  cities: CityMeta[];
  city: string;
  when: string;
  category: string;
  sort: string;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  hasFilters: boolean;
  variant?: 'sidebar' | 'bar';
}

const selectCls =
  'w-full rounded-xl border border-ink/10 bg-surface-elevated text-ink text-sm py-2.5 pl-3 pr-9 focus:border-copper/50 focus:ring-2 focus:ring-copper/15 outline-none appearance-none bg-[length:1rem] bg-[right_0.65rem_center] bg-no-repeat';
const selectBg = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235c5854' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
};

function FilterField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted mb-2">
        <Icon size={12} className="text-copper shrink-0" />
        {label}
      </label>
      {children}
    </div>
  );
}

function ActivePills({
  city,
  when,
  category,
  sort,
  onChange,
}: {
  city: string;
  when: string;
  category: string;
  sort: string;
  onChange: (key: string, value: string) => void;
}) {
  const pills: { key: string; label: string }[] = [];
  if (city) pills.push({ key: 'city', label: city });
  if (when) pills.push({ key: 'when', label: WHEN_OPTIONS.find((w) => w.value === when)?.label ?? when });
  if (category) pills.push({ key: 'category', label: CATEGORY_LABELS[category] ?? category });
  if (sort && sort !== 'soonest') pills.push({ key: 'sort', label: SORT_OPTIONS.find((s) => s.value === sort)?.label ?? sort });

  if (!pills.length) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {pills.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => onChange(p.key, p.key === 'sort' ? 'soonest' : '')}
          className="inline-flex items-center gap-1.5 rounded-full bg-copper/10 text-copper-deep px-3 py-1 text-xs font-semibold hover:bg-copper/15 transition-colors"
        >
          {p.label}
          <X size={12} />
        </button>
      ))}
    </div>
  );
}

export default function DiscoverFilters({
  cities,
  city,
  when,
  category,
  sort,
  onChange,
  onClear,
  hasFilters,
  variant = 'sidebar',
}: DiscoverFiltersProps) {
  const isSidebar = variant === 'sidebar';

  const fields = (
    <>
      <FilterField label="Location" icon={MapPin}>
        <select
          value={city}
          onChange={(e) => onChange('city', e.target.value)}
          className={selectCls}
          style={selectBg}
          aria-label="Filter by city"
        >
          <option value="">Everywhere</option>
          {cities.map((c) => (
            <option key={`${c.city}-${c.country}`} value={c.city}>
              {c.city}, {c.country} ({c.count})
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Date" icon={CalendarDays}>
        <select
          value={when}
          onChange={(e) => onChange('when', e.target.value)}
          className={selectCls}
          style={selectBg}
          aria-label="Filter by date"
        >
          {WHEN_OPTIONS.map((w) => (
            <option key={w.value || 'any'} value={w.value}>{w.label}</option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Category" icon={Sparkles}>
        <select
          value={category}
          onChange={(e) => onChange('category', e.target.value)}
          className={selectCls}
          style={selectBg}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Sort by" icon={ArrowUpDown}>
        <select
          value={sort}
          onChange={(e) => onChange('sort', e.target.value)}
          className={selectCls}
          style={selectBg}
          aria-label="Sort events"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </FilterField>
    </>
  );

  if (isSidebar) {
    return (
      <div className="rounded-2xl border border-ink/8 bg-surface-elevated p-5 shadow-soft space-y-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink">Filters</p>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted hover:text-copper transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="space-y-4">{fields}</div>
        <ActivePills city={city} when={when} category={category} sort={sort} onChange={onChange} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink/8 bg-surface-elevated p-4 shadow-soft space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">Filters</p>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted hover:text-copper transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">{fields}</div>
      <ActivePills city={city} when={when} category={category} sort={sort} onChange={onChange} />
    </div>
  );
}
