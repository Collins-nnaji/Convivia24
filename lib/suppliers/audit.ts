import sql from '@/lib/db';

/**
 * Every change to a supplier's shelf, quotes, orders or access — whoever made it.
 *
 * The portal and the admin desk both write here, so the desk's activity feed is the single place
 * to answer "who set Hennessy to 0 on Tuesday". Best-effort: a logging failure never blocks the
 * change it describes.
 */

export type SupplierActor = 'supplier' | 'admin' | 'system';

export type SupplierAuditAction =
  | 'stock.set'
  | 'stock.remove'
  | 'cost.set'
  | 'cost.remove'
  | 'order.status'
  | 'order.tracking'
  | 'order.routed'
  | 'profile.update'
  | 'portal.login'
  | 'portal.key_issued'
  | 'portal.key_revoked'
  | 'portal.enabled'
  | 'portal.disabled';

export type SupplierAuditEntry = {
  id: string;
  supplierId: string;
  supplierName: string;
  actor: SupplierActor;
  actorLabel: string | null;
  action: SupplierAuditAction;
  skuSlug: string | null;
  orderId: string | null;
  detail: Record<string, unknown>;
  createdAt: string;
};

export async function logSupplierAction(input: {
  supplierId: string;
  actor: SupplierActor;
  actorLabel?: string | null;
  action: SupplierAuditAction;
  skuSlug?: string | null;
  orderId?: string | null;
  detail?: Record<string, unknown>;
}): Promise<void> {
  try {
    await sql`
      INSERT INTO supplier_audit_log (supplier_id, actor, actor_label, action, sku_slug, order_id, detail)
      VALUES (
        ${input.supplierId}::uuid,
        ${input.actor},
        ${input.actorLabel || null},
        ${input.action},
        ${input.skuSlug || null},
        ${input.orderId || null},
        ${JSON.stringify(input.detail || {})}::jsonb
      )
    `;
  } catch {
    /* audit is best-effort */
  }
}

function mapEntry(r: Record<string, unknown>): SupplierAuditEntry {
  return {
    id: String(r.id),
    supplierId: String(r.supplier_id),
    supplierName: String(r.supplier_name || ''),
    actor: r.actor as SupplierActor,
    actorLabel: (r.actor_label as string) || null,
    action: r.action as SupplierAuditAction,
    skuSlug: (r.sku_slug as string) || null,
    orderId: (r.order_id as string) || null,
    detail: (r.detail && typeof r.detail === 'object' ? r.detail : {}) as Record<string, unknown>,
    createdAt: String(r.created_at),
  };
}

/** Newest first. Pass a supplier id to scope, or nothing for the desk-wide feed. */
export async function listSupplierAudit(opts: { supplierId?: string; limit?: number } = {}): Promise<SupplierAuditEntry[]> {
  const limit = Math.min(500, Math.max(1, opts.limit ?? 100));
  const rows = opts.supplierId
    ? await sql`
        SELECT a.*, s.name AS supplier_name
        FROM supplier_audit_log a JOIN suppliers s ON s.id = a.supplier_id
        WHERE a.supplier_id = ${opts.supplierId}::uuid
        ORDER BY a.created_at DESC LIMIT ${limit}
      `
    : await sql`
        SELECT a.*, s.name AS supplier_name
        FROM supplier_audit_log a JOIN suppliers s ON s.id = a.supplier_id
        ORDER BY a.created_at DESC LIMIT ${limit}
      `;
  return rows.map(mapEntry);
}

/** One line of prose per entry, for feeds and emails. */
export function describeAudit(e: SupplierAuditEntry): string {
  const d = e.detail;
  const sku = e.skuSlug ? ` ${String(d.skuName || e.skuSlug)}` : '';
  const order = e.orderId ? ` order ${e.orderId.slice(0, 8).toUpperCase()}` : '';
  switch (e.action) {
    case 'stock.set':
      return `set${sku} stock ${d.from ?? '?'} → ${d.to ?? '?'}`;
    case 'stock.remove':
      return `removed${sku} from their shelf`;
    case 'cost.set':
      return `quoted${sku} at ₦${Number(d.to ?? 0).toLocaleString()}${d.from != null ? ` (was ₦${Number(d.from).toLocaleString()})` : ''}`;
    case 'cost.remove':
      return `withdrew their quote for${sku}`;
    case 'order.status':
      return `moved${order} ${d.from ?? ''} → ${d.to ?? ''}`;
    case 'order.tracking':
      return `updated tracking on${order}`;
    case 'order.routed':
      return `was routed${order}`;
    case 'profile.update':
      return 'updated contact details';
    case 'portal.login':
      return 'signed in to the portal';
    case 'portal.key_issued':
      return 'had a new access key issued';
    case 'portal.key_revoked':
      return 'had their access key revoked';
    case 'portal.enabled':
      return 'portal enabled';
    case 'portal.disabled':
      return 'portal disabled';
    default:
      return e.action;
  }
}
