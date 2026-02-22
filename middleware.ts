import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Don't block /admin in middleware – let the server layout handle auth.
  // That way you're never sent to sign-in again when already logged in (no cookie name mismatch).
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
