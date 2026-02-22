import { getAuth } from '@/lib/auth/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getAuth().getSession();
  return NextResponse.json({ session });
}
