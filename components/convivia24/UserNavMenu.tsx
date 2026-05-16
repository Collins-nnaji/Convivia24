'use client';

import { useState, type MouseEvent } from 'react';
import { LogOut } from 'lucide-react';

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

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        title={userName}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 32,
          height: 32,
          borderRadius: 9999,
          background: open ? 'var(--cv-ink)' : 'var(--cv-accent-soft, rgba(192,151,90,.12))',
          border: '1px solid var(--cv-accent-line, rgba(192,151,90,.25))',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: open ? 'var(--cv-ivory)' : 'var(--cv-ink)',
          fontFamily: 'var(--font-geist, system-ui)',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.04em',
          flexShrink: 0,
          transition: 'background .15s',
        }}
      >
        {initial}
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
              top: 38,
              right: 0,
              zIndex: 150,
              minWidth: 160,
              background: 'var(--cv-ivory)',
              border: '1px solid var(--cv-hairline)',
              borderRadius: 12,
              boxShadow: '0 8px 28px rgba(26,23,20,.14)',
              padding: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div
              style={{
                padding: '8px 10px 6px',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--cv-muted-2)',
                borderBottom: '1px solid var(--cv-hairline)',
                marginBottom: 4,
              }}
            >
              {userName}
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
                padding: '8px 10px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--cv-ink)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: signingOut ? 0.6 : 1,
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
