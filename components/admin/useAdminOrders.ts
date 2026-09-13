'use client';

import { useCallback, useState } from 'react';
import type { OrderStatus } from '@/lib/commerce/status';
import { readError, type AdminOrder } from './types';

/**
 * The orders list is shared by the Orders and Sourcing tabs, so it lives one level up and is
 * loaded on first use rather than on mount.
 */
export function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) {
        setError(await readError(res, 'Could not load orders.'));
        return;
      }
      const data = await res.json();
      setError('');
      setOrders(data.orders || []);
      setStatuses(data.statuses || []);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Optimistic local edit after a successful PATCH — avoids a full reload per click. */
  const patchOrder = useCallback((id: string, patch: Partial<AdminOrder>) => {
    setOrders((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const removeOrder = useCallback((id: string) => {
    setOrders((rows) => rows.filter((r) => r.id !== id));
  }, []);

  return { orders, statuses, error, setError, loaded, loading, reload, patchOrder, removeOrder };
}
