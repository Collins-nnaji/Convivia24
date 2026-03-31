// import { neonAuthMiddleware } from '@neondatabase/auth/next/server';
import { NextRequest, NextResponse } from 'next/server';

// Temporarily disable auth blocker to allow development of all pages
export default function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Matches everything for now
    '/:path*',
  ],
};
