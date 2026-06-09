'use client';

import { useEffect, useRef, useState } from 'react';
import { ScanLine, Camera, CameraOff, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useAdmin } from '../layout';

type Result = {
  result: 'admitted' | 'valid' | 'already_used' | 'void' | 'invalid';
  message: string;
  ticket?: { code: string; attendee_name: string | null; ticket_type_name: string | null };
  event?: { title: string };
};

const STYLE: Record<string, { bg: string; icon: typeof CheckCircle2 }> = {
  admitted:     { bg: 'bg-emerald-600', icon: CheckCircle2 },
  valid:        { bg: 'bg-emerald-600', icon: CheckCircle2 },
  already_used: { bg: 'bg-amber-600',   icon: AlertTriangle },
  void:         { bg: 'bg-zinc-700',    icon: XCircle },
  invalid:      { bg: 'bg-red-600',     icon: XCircle },
};

export default function ScanPage() {
  const { secret } = useAdmin();
  const [manual, setManual] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScan = useRef<{ code: string; at: number }>({ code: '', at: 0 });

  async function submit(payload: string) {
    if (!payload.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ payload: payload.trim(), checkin: true, gate: 'Door' }),
      });
      const data = await res.json();
      setResult(data);
      if (navigator.vibrate) navigator.vibrate(data.result === 'admitted' ? 60 : [40, 40, 40]);
    } catch {
      setResult({ result: 'invalid', message: 'Network error — try again.' });
    } finally {
      setBusy(false);
    }
  }

  // Camera QR scanning via BarcodeDetector (progressive enhancement)
  useEffect(() => {
    if (!scanning) return;
    const w = window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> } };
    if (!w.BarcodeDetector) { setCamError('Live camera scanning is not supported on this browser. Use manual entry below.'); setScanning(false); return; }

    let raf = 0;
    let cancelled = false;
    const detector = new w.BarcodeDetector({ formats: ['qr_code', 'code_128'] });

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length) {
              const raw = codes[0].rawValue;
              const now = Date.now();
              if (raw && (raw !== lastScan.current.code || now - lastScan.current.at > 2500)) {
                lastScan.current = { code: raw, at: now };
                submit(raw);
              }
            }
          } catch { /* frame not ready */ }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setCamError('Could not access the camera. Check permissions or use manual entry.');
        setScanning(false);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [scanning]); // eslint-disable-line react-hooks/exhaustive-deps

  const S = result ? STYLE[result.result] : null;

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <ScanLine className="text-[#c9a84c]" size={22} />
        <h1 className="text-2xl font-light italic text-[#f5f0e8]">Door Scanner</h1>
      </div>
      <p className="text-[#f5f0e8]/40 text-sm mb-6">Scan a guest&apos;s QR or type their code to check them in.</p>

      {/* Result banner */}
      {result && S && (
        <div className={`${S.bg} text-white p-5 mb-5 text-center`}>
          <S.icon size={40} className="mx-auto mb-2" />
          <p className="text-lg font-bold uppercase tracking-wider">{result.result.replace('_', ' ')}</p>
          <p className="text-white/90 text-sm mt-1">{result.message}</p>
          {result.ticket && (
            <div className="mt-3 pt-3 border-t border-white/20 text-sm">
              <p className="font-medium">{result.ticket.attendee_name}</p>
              <p className="text-white/70 text-xs">{result.ticket.ticket_type_name} · {result.event?.title}</p>
              <p className="font-mono text-xs text-white/60 mt-1">{result.ticket.code}</p>
            </div>
          )}
        </div>
      )}

      {/* Camera */}
      <div className="border border-[#c9a84c]/20 mb-5">
        <div className="relative bg-black aspect-square flex items-center justify-center overflow-hidden">
          {scanning ? (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              <div className="absolute inset-8 border-2 border-[#c9a84c]/70 pointer-events-none" />
              <div className="absolute inset-x-8 top-1/2 h-px bg-[#c9a84c] animate-pulse" />
            </>
          ) : (
            <div className="text-center text-[#f5f0e8]/30 px-6">
              <Camera size={36} className="mx-auto mb-2" />
              <p className="text-sm">Camera off</p>
            </div>
          )}
        </div>
        <button
          onClick={() => { setCamError(''); setScanning((s) => !s); }}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#c9a84c] text-[#0a0a0a] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#d4b464] transition-colors"
        >
          {scanning ? <><CameraOff size={14} /> Stop camera</> : <><Camera size={14} /> Start camera scan</>}
        </button>
      </div>
      {camError && <p className="text-amber-400/90 text-xs mb-5">{camError}</p>}

      {/* Manual */}
      <form onSubmit={(e) => { e.preventDefault(); submit(manual); setManual(''); }}>
        <label className="text-[9px] font-black uppercase tracking-[0.25em] text-[#c9a84c]/60 block mb-2">Manual check-in</label>
        <div className="flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="CV24-XXXX-XXXX"
            className="flex-1 bg-transparent border border-[#c9a84c]/20 focus:border-[#c9a84c] text-[#f5f0e8] text-sm py-2.5 px-3 font-mono tracking-wider placeholder-[#f5f0e8]/20 outline-none focus:ring-0 uppercase"
          />
          <button type="submit" disabled={busy} className="px-5 bg-[#c9a84c] text-[#0a0a0a] text-[11px] font-black uppercase tracking-[0.15em] hover:bg-[#d4b464] transition-colors disabled:opacity-60">
            {busy ? '…' : 'Check in'}
          </button>
        </div>
      </form>
    </div>
  );
}
