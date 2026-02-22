'use client';

import { createAuthClient } from '@neondatabase/auth/next';

// Reads NEXT_PUBLIC_NEON_AUTH_BASE_URL automatically
export const authClient = createAuthClient();
