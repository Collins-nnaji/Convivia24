'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type Client = { id: string; name: string };

export function ListingsFilters({
  clients,
  currentClientId,
  currentStatus,
}: {
  clients: Client[];
  currentClientId: string | null;
  currentStatus: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statuses = [
    { value: '', label: 'All statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'price_agreed', label: 'Price agreed' },
    { value: 'listed', label: 'Listed' },
    { value: 'sold', label: 'Sold' },
    { value: 'withdrawn', label: 'Withdrawn' },
  ];

  function updateFilter(key: 'client_id' | 'status', value: string) {
    const next = new URLSearchParams(searchParams?.toString() ?? '');
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/admin/listings?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="filter-client" className="text-xs font-bold uppercase text-zinc-500">
          Client
        </label>
        <select
          id="filter-client"
          value={currentClientId ?? ''}
          onChange={(e) => updateFilter('client_id', e.target.value)}
          className="bg-white border border-zinc-300 text-zinc-900 text-sm px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
        >
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="filter-status" className="text-xs font-bold uppercase text-zinc-500">
          Status
        </label>
        <select
          id="filter-status"
          value={currentStatus ?? ''}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="bg-white border border-zinc-300 text-zinc-900 text-sm px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
        >
          {statuses.map((s) => (
            <option key={s.value || 'all'} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
