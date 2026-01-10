'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth-context';

export function ClientProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
