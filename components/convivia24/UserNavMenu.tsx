'use client';

import { useState, type MouseEvent } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';

export function UserNavMenu({
  userName,
  onSignOut,
  signingOut,
}: {
  userName: string;
  onSignOut: (e: MouseEvent) => void | Promise<void>;
  signingOut?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const initial = userName.trim().charAt(0).toUpperCase() || '?';
  const isEmail = userName.includes('@');
  const displayLabel = isEmail
    ? userName.split('@')[0].slice(0, 14)
    : userName.split(' ')[0].slice(0, 14);

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        title={userName}
        onClick={() => setOpen((o) => !o)}
        style={{
          height: 34,
          borderRadius: 9999,
          background: open ? 'rgba(26,23,20,.10)' : 'rgba(26,23,20,.06)',
          border: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 10px 0 4px',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background .15s',
        }}
      >
        {/* Avatar circle */}
        <div style={{
          width: 26, height: 26, borderRadius: 9999,
          background: 'var(--cv-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 11, letterSpacing: '0.02em',
          flexShrink: 0,
        }}>
          {initial}
        </div>
        {/* Email/name label */}
        <span style={{
          fontSize: 11.5, fontWeight: 600, color: 'var(--cv-ink)',
          maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {displayLabel}
        </span>
        <ChevronDown size={12} color="var(--cv-muted-2)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
      </button>

      {open ? (
        <>
          <div
            role="presentation"
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 140 }}
          />
          <div
            style={{
              position: 'absolute',
              top: 40,
              right: 0,
              zIndex: 150,
              minWidth: 200,
              background: '#fff',
              border: '1px solid rgba(26,23,20,.08)',
              borderRadius: 14,
              boxShadow: '0 12px 36px rgba(26,23,20,.14)',
              padding: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* User info header */}
            <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid rgba(26,23,20,.06)', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9999,
                  background: 'var(--cv-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0,
                }}>
                  {initial}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cv-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {userName}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--cv-muted-2)', marginTop: 1 }}>Signed in</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                setOpen(false);
                void onSignOut(e);
              }}
              disabled={signingOut}
              style={{
                background: 'none',
                border: 'none',
                cursor: signingOut ? 'wait' : 'pointer',
                textAlign: 'left',
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                color: signingOut ? 'var(--cv-muted-2)' : '#c0392b',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: signingOut ? 0.6 : 1,
                width: '100%',
              }}
            >
              <LogOut size={13} /> {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
