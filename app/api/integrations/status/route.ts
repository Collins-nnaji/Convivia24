import { NextResponse } from 'next/server';
import { INTEGRATIONS, integrationStatusFromEnv, CATEGORY_LABELS } from '@/lib/integrations/catalog';

export async function GET() {
  const items = INTEGRATIONS.map((item) => ({
    ...item,
    status: integrationStatusFromEnv(item.id),
  }));

  const connected = items.filter((i) => i.status === 'connected').length;
  const ready = items.filter((i) => i.status === 'ready' || i.status === 'beta').length;

  return NextResponse.json({
    integrations: items,
    categories: CATEGORY_LABELS,
    summary: { connected, ready, total: items.length },
  });
}
