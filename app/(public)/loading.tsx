export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-paper">
      <div className="flex items-center gap-3 text-obsidian/40">
        <span className="w-4 h-4 border-2 border-obsidian/20 border-t-ember rounded-full animate-spin" />
        <span className="text-[11px] font-black uppercase tracking-[0.16em]">Loading</span>
      </div>
    </div>
  );
}
