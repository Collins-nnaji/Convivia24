'use client';

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Check,
  ChevronLeft,
  CreditCard,
  Lock,
  MapPin,
  Pencil,
  QrCode,
  ShieldCheck,
  Star,
  Tag,
  Truck,
  Wine,
} from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import DrinkPhoto from '@/components/shop/DrinkPhoto';
import { findSellable } from '@/lib/catalog/sellable';
import { formatNgn } from '@/lib/drinks/catalog';
import { pointsFromSpend } from '@/lib/loyalty/program';
import { isEnrolled } from '@/lib/loyalty/store';
import { MIN_ORDER_BOTTLES, bottlesShort, orderBottleCount } from '@/lib/commerce/minimum-order';

const PENDING_ORDER_KEY = 'convivia_pending_order';

/**
 * Three steps, but only the first two happen here — payment is taken by the
 * provider on their own page, so the third is shown as where you are going
 * rather than a form we pretend to own.
 */
const STEPS = ['Delivery', 'Review', 'Payment'] as const;

type Details = {
  fullName: string;
  email: string;
  phone: string;
  deliveryMode: 'address' | 'venue';
  venueName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  area: string;
  notes: string;
};

const EMPTY_DETAILS: Details = {
  fullName: '',
  email: '',
  phone: '',
  deliveryMode: 'address',
  venueName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  area: '',
  notes: '',
};

function CheckoutForm() {
  const { lines, subtotalNgn, refreshPrices } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const eventId = searchParams.get('event') || '';
  const venuePrefill = searchParams.get('venue') || '';
  const areaPrefill = searchParams.get('area') || '';

  const [step, setStep] = useState<0 | 1>(0);
  const [details, setDetails] = useState<Details>({
    ...EMPTY_DETAILS,
    deliveryMode: venuePrefill ? 'venue' : 'address',
    venueName: venuePrefill,
    area: areaPrefill,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [enrolled, setEnrolled] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState('');

  const bottles = orderBottleCount(lines);
  const short = bottlesShort(lines);

  const discountNgn = Math.round((subtotalNgn * discountPct) / 100);
  const payableNgn = Math.max(0, subtotalNgn - discountNgn);
  const pointsEarned = useMemo(() => pointsFromSpend(payableNgn), [payableNgn]);

  useEffect(() => {
    refreshPrices();
  }, [refreshPrices]);

  useEffect(() => {
    setEnrolled(isEnrolled());
    fetch('/api/loyalty/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setDiscountPct(Number(data?.standing?.discountPct) || 0))
      .catch(() => {});
  }, []);

  function set<K extends keyof Details>(key: K, value: Details[K]) {
    setDetails((prev) => ({ ...prev, [key]: value }));
  }

  function submitDetails(e: FormEvent) {
    e.preventDefault();
    setError('');
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function placeOrder() {
    if (lines.length === 0) return;
    if (short > 0) {
      setError(`Minimum order is ${MIN_ORDER_BOTTLES} bottles. You have ${bottles} — add ${short} more.`);
      return;
    }
    setLoading(true);
    setError('');

    const payload = {
      ...details,
      eventId: eventId || undefined,
      giftCardCode: giftCardCode.trim() || undefined,
      items: lines.map((l) => ({ slug: l.slug, qty: l.qty })),
    };

    let orderId: string | null = null;

    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setError(orderData.error || 'Could not create order.');
        return;
      }

      orderId = orderData.orderId as string;
      sessionStorage.setItem(PENDING_ORDER_KEY, orderId);
      sessionStorage.setItem(
        'convivia_loyalty_apply',
        JSON.stringify({ subtotalNgn, discountNgn: orderData.loyaltyDiscountNgn ?? 0 })
      );

      const payRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) {
        await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        sessionStorage.removeItem(PENDING_ORDER_KEY);
        setError(payData.error || 'Payment could not start. Your cart is intact — try again.');
        return;
      }

      if (payData.redirectUrl) {
        window.location.href = payData.redirectUrl;
        return;
      }
      router.push(`/checkout/success?order=${orderId}`);
    } catch {
      if (orderId) {
        await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        }).catch(() => {});
        sessionStorage.removeItem(PENDING_ORDER_KEY);
      }
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (lines.length === 0) {
    return (
      <Shell>
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/shop" className="text-[11px] font-black uppercase tracking-[0.2em] text-ember">
          Shop drinks →
        </Link>
      </Shell>
    );
  }

  if (short > 0) {
    return (
      <Shell>
        <h1 className="text-3xl font-bold mb-3">
          Add {short} more bottle{short === 1 ? '' : 's'}
        </h1>
        <p className="text-sm text-obsidian/55 mb-6 leading-relaxed max-w-lg">
          Minimum order is {MIN_ORDER_BOTTLES} bottles and your cart has {bottles}. Mix anything you like —
          bottles, packs and mixers all count.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/shop" className="text-[11px] font-black uppercase tracking-[0.2em] text-ember">
            Shop drinks →
          </Link>
          <Link href="/cart" className="text-[11px] font-black uppercase tracking-[0.2em] text-obsidian/40">
            Back to cart
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="font-logo font-black uppercase tracking-tight text-3xl sm:text-4xl brand-text">
              Checkout
            </h1>
            <p className="text-obsidian/50 mt-2 text-sm">
              Complete your order by providing your details.
            </p>
            {eventId && (
              <p className="mt-2 text-[12px] text-obsidian/45">
                Dropping to event <span className="font-mono text-ember">{eventId}</span>
              </p>
            )}
          </div>
          <Stepper current={step} />
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start mt-8">
          <div className="min-w-0 space-y-6">
            {step === 0 ? (
              <DeliveryStep
                details={details}
                onChange={set}
                onSubmit={submitDetails}
                error={error}
              />
            ) : (
              <ReviewStep
                details={details}
                giftCardCode={giftCardCode}
                onGiftCard={setGiftCardCode}
                onEdit={() => setStep(0)}
                onPlace={placeOrder}
                loading={loading}
                payableNgn={payableNgn}
                error={error}
              />
            )}

            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-5 sm:p-6 bg-white border border-obsidian/8">
              <Assurance icon={Wine} label="100% authentic" detail="Original products only" />
              <Assurance icon={Lock} label="Secure checkout" detail="Your data is protected" />
              <Assurance icon={Truck} label="Nationwide delivery" detail="Across Nigeria" />
              <Assurance icon={QrCode} label="Scan to verify" detail="Every order, checkable" />
            </ul>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="bg-white border border-obsidian/8">
              <div className="px-5 py-4 border-b border-obsidian/8 flex items-center justify-between gap-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
                  Order summary
                </h2>
                <Link
                  href="/cart"
                  className="text-[11px] font-black uppercase tracking-[0.1em] text-ember hover:underline"
                >
                  Edit cart
                </Link>
              </div>

              <ul className="divide-y divide-obsidian/6">
                {lines.map((l) => {
                  const product = findSellable(l.slug);
                  return (
                    <li key={l.slug} className="px-5 py-3.5 flex items-center gap-3">
                      <span className="relative w-11 h-14 shrink-0 bg-white border border-obsidian/8 overflow-hidden">
                        <DrinkPhoto
                          product={product ?? { name: l.name, category: 'spirits' }}
                          className="absolute inset-0 w-full h-full"
                          watermark={false}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold truncate">{l.name}</span>
                        <span className="block text-[11px] text-obsidian/40 mt-0.5">
                          {product?.volume} · Qty {l.qty}
                        </span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums shrink-0">
                        {formatNgn(l.priceNgn * l.qty)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <dl className="px-5 py-4 border-t border-obsidian/8 space-y-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-obsidian/50">Subtotal</dt>
                  <dd className="tabular-nums">{formatNgn(subtotalNgn)}</dd>
                </div>
                {discountNgn > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-obsidian/50">Guest Card {discountPct}%</dt>
                    <dd className="text-ember tabular-nums">−{formatNgn(discountNgn)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 text-[12px]">
                  <dt className="text-obsidian/40">Delivery</dt>
                  <dd className="text-obsidian/50">Quoted after your address</dd>
                </div>
                {giftCardCode.trim() && (
                  <div className="flex justify-between gap-4 text-[12px]">
                    <dt className="text-obsidian/40">Gift card</dt>
                    <dd className="text-obsidian/50">Applied at payment</dd>
                  </div>
                )}
              </dl>

              <div className="px-5 pb-4 flex justify-between items-baseline gap-4">
                <span className="font-semibold">Total</span>
                <span className="font-logo font-black text-2xl tabular-nums">{formatNgn(payableNgn)}</span>
              </div>

              {pointsEarned > 0 && (
                <p className="px-5 pb-4 inline-flex items-center gap-1.5 text-[12px] text-obsidian/50">
                  You&apos;ll earn
                  <span className="inline-flex items-center gap-1 font-bold text-ember tabular-nums">
                    <Star size={12} className="fill-ember" /> {pointsEarned.toLocaleString()} pts
                  </span>
                </p>
              )}

              <div className="px-5 py-4 border-t border-obsidian/8 bg-paper/60 flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[12px] text-obsidian/50 leading-relaxed">
                  <span className="font-semibold text-obsidian/70">Secure &amp; safe.</span> Card details are
                  taken by our payment provider — they never touch Convivia24.
                </p>
              </div>

              {!enrolled && (
                <div className="px-5 py-3.5 border-t border-obsidian/8">
                  <Link
                    href="/guest-card"
                    className="text-[10px] font-black uppercase tracking-[0.14em] text-ember"
                  >
                    Activate Guest Card for perks →
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-paper min-h-[60vh]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">{children}</div>
    </section>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                  done
                    ? 'bg-ember text-white'
                    : active
                      ? 'bg-obsidian text-white'
                      : 'bg-obsidian/8 text-obsidian/35'
                }`}
              >
                {done ? <Check size={13} /> : i + 1}
              </span>
              <span
                className={`text-[11px] font-black uppercase tracking-[0.1em] hidden sm:inline ${
                  active ? 'text-obsidian' : 'text-obsidian/35'
                }`}
              >
                {label}
              </span>
            </span>
            {i < STEPS.length - 1 && <span className="w-6 sm:w-10 h-px bg-obsidian/12" />}
          </li>
        );
      })}
    </ol>
  );
}

const inputClass =
  'w-full border border-obsidian/12 focus:border-ember focus:ring-0 text-sm py-2.5 px-3 bg-white placeholder-obsidian/25';

function Field({
  label,
  children,
  optional = false,
}: {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-obsidian/60 block mb-1.5">
        {label} {optional && <span className="text-obsidian/30 font-normal">(optional)</span>}
      </span>
      {children}
    </label>
  );
}

function DeliveryStep({
  details,
  onChange,
  onSubmit,
  error,
}: {
  details: Details;
  onChange: <K extends keyof Details>(key: K, value: Details[K]) => void;
  onSubmit: (e: FormEvent) => void;
  error: string;
}) {
  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={onSubmit}
      className="bg-white border border-obsidian/8"
    >
      <div className="px-5 sm:px-6 py-4 border-b border-obsidian/8 flex items-center gap-2.5">
        <Truck size={17} className="text-ember" />
        <h2 className="font-bold">Delivery information</h2>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex gap-2">
          {(['address', 'venue'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange('deliveryMode', mode)}
              className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] transition-colors ${
                details.deliveryMode === mode
                  ? 'bg-obsidian text-white'
                  : 'bg-white border border-obsidian/12 text-obsidian/45 hover:border-obsidian/30'
              }`}
            >
              {mode === 'address' ? 'Home / party address' : 'Club / lounge'}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <input
              required
              value={details.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              className={inputClass}
              placeholder="Enter your full name"
            />
          </Field>
          <Field label="Phone number">
            <input
              required
              type="tel"
              value={details.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              className={inputClass}
              placeholder="+234…"
            />
          </Field>
        </div>

        <Field label="Email address">
          <input
            required
            type="email"
            value={details.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={inputClass}
            placeholder="you@email.com"
          />
        </Field>

        {details.deliveryMode === 'venue' ? (
          <Field label="Venue / lounge name">
            <input
              required
              value={details.venueName}
              onChange={(e) => onChange('venueName', e.target.value)}
              className={inputClass}
              placeholder="e.g. Lumen Lounge, Harbour House"
            />
          </Field>
        ) : (
          <Field label="Delivery address">
            <input
              required
              value={details.addressLine1}
              onChange={(e) => onChange('addressLine1', e.target.value)}
              className={inputClass}
              placeholder="House / apartment, street"
            />
          </Field>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="City">
            <input
              required
              value={details.city}
              onChange={(e) => onChange('city', e.target.value)}
              className={inputClass}
              placeholder="Lagos, Abuja, Port Harcourt…"
            />
          </Field>
          <Field label="Area / neighbourhood">
            <input
              required
              value={details.area}
              onChange={(e) => onChange('area', e.target.value)}
              className={inputClass}
              placeholder="e.g. VI, Maitama, GRA…"
            />
          </Field>
        </div>

        <Field label="Landmark" optional>
          <input
            value={details.addressLine2}
            onChange={(e) => onChange('addressLine2', e.target.value)}
            className={inputClass}
            placeholder="e.g. Opposite GTBank, beside Ikeja Mall"
          />
        </Field>

        <Field label="Order notes" optional>
          <textarea
            rows={3}
            value={details.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            className={inputClass}
            placeholder="Gate codes, preferred delivery window…"
          />
        </Field>

        {error && <p className="text-sm text-ember">{error}</p>}

        <p className="text-[12px] text-obsidian/45 leading-relaxed">
          By ordering you confirm you are 18+ if alcohol is included. We may ask for ID at delivery.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="submit"
            className="px-7 py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
          >
            Continue to review
          </button>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/40 hover:text-ember"
          >
            <ChevronLeft size={14} /> Back to cart
          </Link>
        </div>
      </div>
    </motion.form>
  );
}

function ReviewStep({
  details,
  giftCardCode,
  onGiftCard,
  onEdit,
  onPlace,
  loading,
  payableNgn,
  error,
}: {
  details: Details;
  giftCardCode: string;
  onGiftCard: (v: string) => void;
  onEdit: () => void;
  onPlace: () => void;
  loading: boolean;
  payableNgn: number;
  error: string;
}) {
  const where =
    details.deliveryMode === 'venue'
      ? details.venueName
      : [details.addressLine1, details.addressLine2].filter(Boolean).join(', ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="bg-white border border-obsidian/8">
        <div className="px-5 sm:px-6 py-4 border-b border-obsidian/8 flex items-center justify-between gap-4">
          <span className="flex items-center gap-2.5">
            <MapPin size={17} className="text-ember" />
            <h2 className="font-bold">Delivering to</h2>
          </span>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-obsidian/45 hover:text-ember transition-colors"
          >
            <Pencil size={12} /> Edit
          </button>
        </div>

        <dl className="p-5 sm:p-6 grid sm:grid-cols-2 gap-x-6 gap-y-3.5 text-sm">
          <Summary label="Name" value={details.fullName} />
          <Summary label="Phone" value={details.phone} />
          <Summary label="Email" value={details.email} />
          <Summary label={details.deliveryMode === 'venue' ? 'Venue' : 'Address'} value={where} />
          <Summary label="City" value={details.city} />
          <Summary label="Area" value={details.area} />
          {details.notes && <Summary label="Notes" value={details.notes} />}
        </dl>
      </div>

      <div className="bg-white border border-obsidian/8">
        <div className="px-5 sm:px-6 py-4 border-b border-obsidian/8 flex items-center gap-2.5">
          <Tag size={17} className="text-ember" />
          <h2 className="font-bold">Gift card</h2>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex gap-2 max-w-sm">
            <input
              value={giftCardCode}
              onChange={(e) => onGiftCard(e.target.value)}
              className={inputClass}
              placeholder="CV24-XXXX-XXXX"
            />
          </div>
          <p className="text-[12px] text-obsidian/45 mt-2.5 leading-relaxed">
            The code is checked when the order is placed, and its value comes off the total before payment.
          </p>
        </div>
      </div>

      <div className="bg-white border border-obsidian/8 p-5 sm:p-6">
        {error && <p className="text-sm text-ember mb-4">{error}</p>}

        <button
          type="button"
          onClick={onPlace}
          disabled={loading}
          className="w-full py-4 btn-brand text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          <CreditCard size={15} />
          {loading ? 'Placing order…' : `Continue to payment · ${formatNgn(payableNgn)}`}
        </button>

        <p className="text-[12px] text-obsidian/45 mt-3 text-center leading-relaxed">
          You&apos;ll be taken to our payment provider to pay securely. Your cart stays intact if anything
          goes wrong.
        </p>

        <button
          type="button"
          onClick={onEdit}
          className="w-full mt-4 inline-flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/40 hover:text-ember"
        >
          <ChevronLeft size={14} /> Back to delivery
        </button>
      </div>
    </motion.div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold text-obsidian/40">{label}</dt>
      <dd className="text-obsidian/75 mt-0.5 break-words">{value || '—'}</dd>
    </div>
  );
}

function Assurance({
  icon: Icon,
  label,
  detail,
}: {
  icon: typeof Truck;
  label: string;
  detail: string;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon size={18} className="text-ember shrink-0 mt-0.5" />
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold leading-tight">{label}</span>
        <span className="block text-[11px] text-obsidian/45 mt-0.5">{detail}</span>
      </span>
    </li>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] bg-paper" />}>
      <CheckoutForm />
    </Suspense>
  );
}
