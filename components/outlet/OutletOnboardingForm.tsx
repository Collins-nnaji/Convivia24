'use client';

import { useCallback, useEffect, useState } from 'react';
import { Building2, Loader2, Send, ShieldCheck } from 'lucide-react';

type City = { id: string; name: string };
type Application = {
  id: string;
  city_id: string;
  business_name: string;
  business_type: string | null;
  street_address: string;
  phone: string;
  cac_number: string | null;
  contact_email: string | null;
  status: string;
  verification_notes: string | null;
  admin_notes: string | null;
};

export function OutletOnboardingForm({
  initialApplication,
  onUpdated,
}: {
  initialApplication?: Application | null;
  onUpdated?: () => void;
}) {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  const [cityId, setCityId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');

  const hydrate = useCallback((app: Application | null | undefined) => {
    if (!app) return;
    setCityId(app.city_id || '');
    setBusinessName(app.business_name || '');
    setBusinessType(app.business_type || '');
    setStreetAddress(app.street_address || '');
    setPhone(app.phone || '');
    setCacNumber(app.cac_number || '');
    setContactEmail(app.contact_email || '');
    setVerificationNotes(app.verification_notes || '');
  }, []);

  useEffect(() => {
    hydrate(initialApplication ?? null);
  }, [initialApplication, hydrate]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/cities')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !Array.isArray(d.cities)) return;
        setCities(d.cities.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!cities.length || cityId) return;
    setCityId(cities[0].id);
  }, [cities, cityId]);

  const status = initialApplication?.status;

  const saveDraft = async (): Promise<boolean> => {
    setSaving(true);
    setNotice('');
    try {
      const res = await fetch('/api/outlet-application', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          city_id: cityId,
          business_name: businessName,
          business_type: businessType,
          street_address: streetAddress,
          phone,
          cac_number: cacNumber || null,
          contact_email: contactEmail || null,
          verification_notes: verificationNotes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setNotice('Saved.');
      onUpdated?.();
      return true;
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not save.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const submitForReview = async () => {
    setSubmitting(true);
    setNotice('');
    try {
      const ok = await saveDraft();
      if (!ok) return;
      const res = await fetch('/api/outlet-application/submit', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submit failed');
      setNotice('Submitted. Ops reviews CAC; you’ll hear when you can post.');
      onUpdated?.();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not submit.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-neutral-500 text-sm py-4">
        <Loader2 size={18} className="animate-spin text-red-700" /> Loading form…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50/80 to-white p-5 md:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-900">
          <Building2 size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-900">Outlet onboarding</p>
          <h3 className="font-display text-xl italic text-neutral-900 mt-0.5">Register your venue</h3>
          <p className="text-[13px] text-neutral-600 mt-1 leading-snug">
            City filters the board; address on file for shifts. Submit → CAC check → admin approval to publish.
          </p>
        </div>
      </div>

      {status === 'approved' ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-emerald-900 text-sm">
          <ShieldCheck size={18} /> Approved — you can post shifts.
        </div>
      ) : status === 'submitted' || status === 'under_review' ? (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-amber-950 text-sm">
          Application <strong>{status === 'under_review' ? 'under review' : 'submitted'}</strong>. Publishing shifts stays paused until approval.
        </div>
      ) : status === 'rejected' ? (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-red-900 text-sm">
          Not approved yet
          {initialApplication?.admin_notes ? `: ${initialApplication.admin_notes}` : '.'} Update details and save again.
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">City (filter)</span>
          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Business type</span>
          <input
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            placeholder="e.g. Restaurant, hotel, lounge"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Registered business name</span>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="As on CAC"
          className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Outlet street address</span>
        <input
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          placeholder="Full address — not shown on the public city filter"
          className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Phone (operations)</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234…"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">CAC registration number</span>
          <input
            value={cacNumber}
            onChange={(e) => setCacNumber(e.target.value)}
            placeholder="RC number"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Contact email (billing / notices)</span>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Notes for verification (optional)</span>
        <textarea
          value={verificationNotes}
          onChange={(e) => setVerificationNotes(e.target.value)}
          rows={2}
          placeholder="Trading name if different, director contact, etc."
          className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm resize-none"
        />
      </label>

      {notice ? <p className="text-sm text-neutral-600">{notice}</p> : null}

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="button"
          disabled={saving}
          onClick={saveDraft}
          className="inline-flex items-center justify-center rounded-full bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
          Save draft
        </button>
        <button
          type="button"
          disabled={submitting || status === 'approved'}
          onClick={submitForReview}
          className="inline-flex items-center justify-center rounded-full bg-teal-700 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 hover:bg-teal-800 disabled:opacity-50 gap-2"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Submit for verification
        </button>
      </div>
    </div>
  );
}
