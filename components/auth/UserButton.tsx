'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth/use-session';
import { authClient } from '@/lib/auth/client';
import { LogOut, User, ChevronDown } from 'lucide-react';

/**
 * User menu button (avatar/email + dropdown with account & sign out).
 * Neon quickstart-style UserButton.
 */
export function UserButton() {
  const { user, loading } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  async function handleSignOut() {
    setOpen(false);
    await authClient.signOut({ fetchOptions: { credentials: 'include' } } as any);
    window.location.href = '/';
  }

  if (loading || !user) return null;

  const displayName = user.name || user.email || 'Account';
  const initial = (displayName.charAt(0) || '?').toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {user.image ? (
          <img
            src={user.image}
            alt=""
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <span className="w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">
            {initial}
          </span>
        )}
        <span className="hidden sm:inline text-[13px] font-medium max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 py-1 w-52 bg-white border border-zinc-200 rounded-lg shadow-lg z-50"
          role="menu"
        >
          <div className="px-3 py-2 border-b border-zinc-100">
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            onClick={() => setOpen(false)}
          >
            <User className="w-4 h-4" />
            Dashboard
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
