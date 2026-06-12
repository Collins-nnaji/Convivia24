import { NextRequest, NextResponse } from 'next/server';
import { ticketQrSvg } from '@/lib/tickets/qr';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  try {
    const svg = await ticketQrSvg(code.toUpperCase());
    return new NextResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  } catch {
    return NextResponse.json({ error: 'Could not render QR.' }, { status: 500 });
  }
}
