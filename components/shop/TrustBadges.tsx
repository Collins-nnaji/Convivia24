import { Zap, ShieldCheck, QrCode } from 'lucide-react';

const ITEMS = [
  { icon: Zap, label: 'Fast delivery', detail: 'Lagos · ~90 mins' },
  { icon: ShieldCheck, label: '100% original', detail: 'No parallel imports' },
  { icon: QrCode, label: 'Scan to verify', detail: 'Every order, checkable' },
];

export default function TrustBadges({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-6 gap-y-2 ${className}`}>
      {ITEMS.map(({ icon: Icon, label, detail }) => (
        <li key={label} className="flex items-center gap-2 text-obsidian/70">
          <Icon size={15} className="text-ember shrink-0" />
          <span className="text-[11px] leading-tight">
            <span className="font-semibold text-obsidian">{label}</span>{' '}
            <span className="text-obsidian/45">{detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
