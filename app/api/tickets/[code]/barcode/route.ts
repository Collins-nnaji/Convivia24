import { NextRequest, NextResponse } from 'next/server';
import { code128Svg } from '@/lib/tickets/barcode';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const svg = code128Svg(code.toUpperCase(), { height: 64, moduleWidth: 2 });
  return new NextResponse(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}
