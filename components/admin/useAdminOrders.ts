'use client';

import { useCallback, useRef, useState } from 'react';
import type { OrderStatus } from '@/lib/commerce/status';
import { readError, type AdminOrder } from './types';

export type OrderFilters = { from?: string | null; to?: string | null; status?: OrderStatus | 'all'; q?: string };

const PAGE = 100;

/**
 * The orders list is shared by the Orders and Sourcing tabs, so it lives one level up. Filtering
 * and paging happen on the server — the client only ever holds the page(s) it has asked for.
 */
export function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const filtersRef = useRef<OrderFilters>({});

  const fetchPage = useCallback(async (filters: OrderFilters, offset: number) => {
    const qs = new URLSearchParams();
    if (filters.from) qs.set('from', filters.from);
    if (filters.to) qs.set('to', filters.to);
    if (filters.status && filters.status !== 'all') qs.set('status', filters.status);
    if (filters.q?.trim()) qs.set('q', filters.q.trim());
    qs.set('limit', String(PAGE));
    qs.set('offset', String(offset));
    const res = await fetch(`/api/admin/orders?${qs}`);
    if (!res.ok) throw new Error(await readError(res, 'Could not load orders.'));
    return res.json();
  }, []);

  /** Loads the first page for a filter set (or the last one used). */
  const reload = useCallback(
    async (filters?: OrderFilters) => {
      if (filters) filtersRef.current = filters;
      setLoading(true);
      try {
        const data = await fetchPage(filtersRef.current, 0);
        setError('');
        setOrders(data.orders || []);
        setStatuses(data.statuses || []);
        setTotal(Number(data.total ?? 0));
        setLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load orders.');
      } finally {
        setLoading(false);
      }
    },
    [fetchPage]
  );

  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPage(filtersRef.current, orders.length);
      setOrders((rows) => [...rows, ...(data.orders || [])]);
      setTotal(Number(data.total ?? 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load more.');
    } finally {
      setLoading(false);
    }
  }, [fetchPage, orders.length]);

  /** Optimistic local edit after a successful PATCH — avoids a full reload per click. */
  const patchOrder = useCallback((id: string, patch: Partial<AdminOrder>) => {
    setOrders((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const removeOrder = useCallback((id: string) => {
    setOrders((rows) => rows.filter((r) => r.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  }, []);

  return { orders, statuses, error, setError, loaded, loading, total, hasMore: orders.length < total, reload, loadMore, patchOrder, removeOrder };
}
