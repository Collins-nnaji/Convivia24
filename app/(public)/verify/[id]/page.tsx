import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import sql, { DatabaseUnavailableError } from '@/lib/db';
import { isValidOrderId, verifyCode } from '@/lib/verify';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Verify authenticity',
  description:
    'Confirm a bottle or order was genuinely supplied through Convivia24. Lagos nightlife commerce · 18+.',
  robots: { index: false, follow: true },
};

type VerifyRow = {
  id: string;
  status: string;
  created_at: string;
  items: { name: string; qty: number }[];
};

async function getOrder(id: string): Promise<VerifyRow | null> {
  try {
    const rows = await sql`
      SELECT
        o.id,
        o.status,
        o.created_at,
        COALESCE(
          json_agg(json_build_object('name', i.kit_name, 'qty', i.qty) ORDER BY i.created_at)
            FILTER (WHERE i.id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM ritual_orders o
      LEFT JOIN ritual_order_items i ON i.order_id = o.id
      WHERE o.id = ${id}
      GROUP BY o.id
      LIMIT 1
    `;
    return (rows[0] as unknown as VerifyRow) || null;
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) return null;
    throw err;
  }
}

const SHIPPED_STATUSES = new Set([
  'paid',
  'processing',
  'packed',
  'out_for_delivery',
  'delivered',
  'fulfilled',
  'refunded',
]);

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-paper min-h-[70vh] flex items-center">
      <div className="max-w-md mx-auto px-5 sm:px-8 py-14 w-full text-center">{children}</div>
    </section>
  );
}

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isValidOrderId(id)) {
    return (
      <Shell>
        <ShieldQuestion size={40} className="mx-auto text-obsidian/30 mb-4" />
        <h1 className="font-wordmark text-2xl text-obsidian mb-2">Invalid code</h1>
        <p className="text-sm text-obsidian/55 mb-6">
          That code isn&apos;t a Convivia24 authenticity code. If it came off a bottle label, please
          contact us — it may not be genuine.
        </p>
        <Link href="/shop" className="inline-block px-5 py-2.5 btn-brand text-[11px] font-wordmark-sm">
          Shop drinks
        </Link>
      </Shell>
    );
  }

  const order = await getOrder(id);

  if (!order || !SHIPPED_STATUSES.has(order.status)) {
    return (
      <Shell>
        <ShieldAlert size={40} className="mx-auto text-ember mb-4" />
        <h1 className="font-wordmark text-2xl text-obsidian mb-2">Not verified</h1>
        <p className="text-sm text-obsidian/55 mb-6">
          We couldn&apos;t confirm this code against a fulfilled Convivia24 order. If you scanned this
          off a bottle, please don&apos;t consume it — reach out to us with a photo of the label so we
          can look into it.
        </p>
        <a
          href="mailto:hello@convivia24.com"
          className="inline-block px-5 py-2.5 border border-obsidian/15 text-obsidian text-[11px] font-wordmark-sm hover:border-ember hover:text-ember"
        >
          Report this code
        </a>
      </Shell>
    );
  }

  return (
    <Shell>
      <ShieldCheck size={44} className="mx-auto text-emerald-600 mb-4" />
      <p className="text-[10px] font-wordmark-sm text-emerald-700 mb-1">Verified genuine</p>
      <h1 className="font-wordmark text-2xl sm:text-3xl text-obsidian mb-3">
        Supplied by Convivia24
      </h1>
      <p className="text-sm text-obsidian/55 mb-6">
        This order was placed and fulfilled directly through Convivia24. We supply only original,
        sealed stock — never parallel or counterfeit imports.
      </p>

      <div className="bg-white border border-obsidian/8 shadow-sm p-5 text-left mb-6">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-obsidian/6">
          <span className="text-[10px] font-wordmark-sm text-obsidian/40">Authenticity code</span>
          <span className="text-sm font-mono font-semibold text-obsidian">{verifyCode(order.id)}</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-wordmark-sm text-obsidian/40">Order date</span>
          <span className="text-sm text-obsidian/70">
            {new Date(order.created_at).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
          </span>
        </div>
        {order.items?.length > 0 && (
          <ul className="space-y-1 pt-1">
            {order.items.map((item, i) => (
              <li key={i} className="text-sm text-obsidian/70 flex justify-between gap-3">
                <span className="truncate">{item.name}</span>
                <span className="text-obsidian/40 shrink-0">×{item.qty}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link href="/shop" className="inline-block px-5 py-2.5 btn-brand text-[11px] font-wordmark-sm">
        Shop drinks
      </Link>
    </Shell>
  );
}
