'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Check, X, RefreshCw, Loader2, RotateCcw, Wine } from 'lucide-react';

type ValidationState = 'idle' | 'scanning' | 'loading' | 'valid' | 'invalid' | 'already_redeemed' | 'error';

interface ValidResult {
  valid: boolean; reason: string; guest_name?: string; brand_name?: string;
  primary_color?: string; voucher_enabled?: boolean; voucher_label?: string; pass_token?: string;
}

const REASONS: Record<string, string> = {
  NOT_FOUND: 'Pass not found',
  REVOKED: 'Pass has been revoked',
  ALREADY_REDEEMED: 'Already redeemed',
  TOO_EARLY: 'Voucher not valid yet',
  EXPIRED: 'Voucher window has closed',
  NO_VOUCHER: 'No voucher on this campaign',
};

// Simple manual token input for when camera is unavailable
function ManualEntry({ onSubmit, loading }: { onSubmit: (code: string) => void; loading: boolean }) {
  const [value, setValue] = useState('');
  return (
    <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value.trim())}
        placeholder="Paste or type pass token"
        autoFocus
        style={{
          padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,.15)',
          background: 'rgba(255,255,255,.06)', color: '#fff', fontSize: 14, outline: 'none',
          width: '100%', boxSizing: 'border-box', fontFamily: 'monospace',
        }}
      />
      <button
        type="button"
        onClick={() => value && onSubmit(value)}
        disabled={loading || !value}
        style={{
          padding: '14px', borderRadius: 12, border: 'none',
          background: value ? '#c0975a' : 'rgba(255,255,255,.08)',
          color: value ? '#fff' : 'rgba(255,255,255,.3)',
          fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
          cursor: value ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
        {loading ? 'Validating…' : 'Validate pass'}
      </button>
    </div>
  );
}

export function ValidatorApp({ initialCode }: { initialCode: string }) {
  const [state, setState] = useState<ValidationState>(initialCode === 'demo' ? 'idle' : 'loading');
  const [result, setResult] = useState<ValidResult | null>(null);
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  useEffect(() => {
    if (initialCode !== 'demo') {
      validate(initialCode);
    }
  }, [initialCode]);

  async function validate(code: string) {
    setState('loading');
    try {
      const res = await fetch(`/api/validate/${encodeURIComponent(code)}`);
      const data: ValidResult = await res.json();
      setResult(data);
      if (data.valid) setState('valid');
      else if (data.reason === 'ALREADY_REDEEMED') setState('already_redeemed');
      else setState('invalid');
    } catch {
      setState('error');
    }
  }

  async function redeemVoucher() {
    if (!result?.pass_token) return;
    setRedeeming(true);
    try {
      const res = await fetch('/api/guest/redeem', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass_token: result.pass_token }),
      });
      const data = await res.json();
      if (data.valid) setRedeemed(true);
      else { setResult(prev => prev ? { ...prev, reason: data.reason || 'ALREADY_REDEEMED' } : prev); setState('already_redeemed'); }
    } finally { setRedeeming(false); }
  }

  function reset() {
    setState('idle');
    setResult(null);
    setRedeemed(false);
    setRedeeming(false);
  }

  const accentColor = result?.primary_color || '#c0975a';

  // Result screen — FULL SCREEN green or red
  if (state === 'valid' || state === 'invalid' || state === 'already_redeemed') {
    const isGood = state === 'valid';
    const bg = isGood ? '#052e10' : '#2a0a0a';
    const border = isGood ? '#22c55e' : '#ef4444';
    const label = state === 'already_redeemed' ? REASONS.ALREADY_REDEEMED : (isGood ? 'Valid — Issue Entry' : (REASONS[result?.reason || ''] || 'Invalid pass'));

    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: bg, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 24,
        fontFamily: 'var(--font-geist, system-ui)',
        animation: 'cv-fade-up .2s ease both',
      }}>
        {/* Giant icon */}
        <div style={{
          width: 120, height: 120, borderRadius: 9999,
          background: border + '22', border: `3px solid ${border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 60px ${border}40`,
        }}>
          {isGood
            ? <Check size={56} color={border} strokeWidth={2.5} />
            : <X size={56} color={border} strokeWidth={2.5} />}
        </div>

        {/* Label */}
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <div style={{ fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 900, color: border, marginBottom: 8, letterSpacing: '-0.01em' }}>
            {label}
          </div>
          {result?.guest_name && (
            <div style={{ fontSize: 18, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>
              {result.guest_name}
            </div>
          )}
          {result?.brand_name && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {result.brand_name}
            </div>
          )}
        </div>

        {/* Redeem voucher button (for bar use) */}
        {isGood && result?.voucher_enabled && !redeemed && (
          <button type="button" onClick={redeemVoucher} disabled={redeeming} style={{
            padding: '16px 32px', borderRadius: 16, border: 'none',
            background: accentColor, color: '#fff',
            fontSize: 14, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: `0 8px 32px ${accentColor}40`,
          }}>
            {redeeming ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Wine size={18} />}
            {redeeming ? 'Confirming…' : `Issue ${result.voucher_label || 'drink'}`}
          </button>
        )}
        {redeemed && (
          <div style={{ padding: '12px 24px', borderRadius: 99, background: '#22c55e22', border: '1px solid #22c55e44', fontSize: 13, fontWeight: 700, color: '#22c55e' }}>
            ✓ Drink issued & logged
          </div>
        )}

        {/* Reset */}
        <button type="button" onClick={reset} style={{
          marginTop: 8, padding: '12px 24px', borderRadius: 99,
          background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
          color: 'rgba(255,255,255,.6)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 7, letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <RotateCcw size={13} /> Scan next
        </button>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0d0c0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} color="rgba(250,246,238,.4)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // Idle / scanner state
  return (
    <div style={{ minHeight: '100dvh', background: '#0d0c0a', color: '#faf6ee', fontFamily: 'var(--font-geist, system-ui)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c0975a', marginBottom: 4 }}>
          Convivia24
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#faf6ee' }}>Validator</div>
        <div style={{ fontSize: 11, color: 'rgba(250,246,238,.4)', marginTop: 2 }}>Staff validation app · For bartenders & door staff</div>
      </div>

      <div style={{ flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Mode selector */}
        <div style={{ display: 'flex', gap: 2, margin: '0 20px', padding: 4, borderRadius: 10, background: 'rgba(255,255,255,.05)' }}>
          {[{ id: 'manual', label: 'Manual entry', icon: QrCode }].map(m => (
            <button key={m.id} type="button" onClick={() => setMode(m.id as 'camera' | 'manual')} style={{
              flex: 1, padding: '8px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: mode === m.id ? 'rgba(250,246,238,.12)' : 'transparent',
              color: mode === m.id ? '#faf6ee' : 'rgba(250,246,238,.4)',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <m.icon size={12} /> {m.label}
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div style={{ margin: '0 20px', padding: '14px 16px', borderRadius: 12, background: 'rgba(192,151,90,.08)', border: '1px solid rgba(192,151,90,.18)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c0975a', marginBottom: 4 }}>How to validate</div>
          <div style={{ fontSize: 11, color: 'rgba(250,246,238,.5)', lineHeight: 1.6 }}>
            Ask the guest to show their pass QR code. Copy the token from their screen and paste it below, or ask for the code shown under their QR.
          </div>
        </div>

        {/* Manual input */}
        <ManualEntry onSubmit={validate} loading={state === 'loading'} />

        {state === 'error' && (
          <div style={{ margin: '0 20px', padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.20)', fontSize: 12, color: '#f87171', textAlign: 'center' }}>
            Network error. Check your connection and try again.
          </div>
        )}
      </div>

      {/* Status indicators */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: 99, background: '#22c55e', boxShadow: '0 0 6px #22c55e80' }} />
        <span style={{ fontSize: 10, color: 'rgba(250,246,238,.35)', letterSpacing: '0.12em' }}>Validator online · Real-time validation</span>
      </div>
    </div>
  );
}
