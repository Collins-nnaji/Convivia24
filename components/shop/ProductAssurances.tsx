import { Headset, QrCode, ShieldCheck, Truck } from 'lucide-react';

/**
 * The four promises repeated at the foot of the product page. Every claim here
 * has to be one the shop actually operates — delivery reach, checkout
 * security, the authenticity scan, and support. Nothing about free delivery
 * thresholds or a returns window until those policies exist in the terms.
 */
const ITEMS = [
  { icon: Truck, label: 'Nationwide delivery', detail: 'Across Nigeria' },
  { icon: ShieldCheck, label: 'Secure payments', detail: 'Encrypted checkout' },
  { icon: QrCode, label: 'Scan to verify', detail: 'Every order, checkable' },
  { icon: Headset, label: 'Dedicated support', detail: "We're here to help" },
];

export default function ProductAssurances({ className = '' }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 ${className}`}>
      {ITEMS.map(({ icon: Icon, label, detail }) => (
        <li key={label} className="flex items-center gap-3">
          <Icon size={20} className="text-ember shrink-0" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-tight">{label}</span>
            <span className="block text-[12px] text-obsidian/45 mt-0.5">{detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
