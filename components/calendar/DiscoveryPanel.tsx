import { Compass } from 'lucide-react';

export default function DiscoveryPanel() {
  return (
    <div className="flex-1 border-b border-obsidian/10 bg-white/50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-obsidian/40 mb-1 flex items-center gap-1">
        <Compass size={11} /> Nearby
      </p>
      <p className="text-xs text-obsidian/45 leading-relaxed">Events & places — coming soon.</p>
    </div>
  );
}
