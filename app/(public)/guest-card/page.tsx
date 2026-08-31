import GuestCardPanel from '@/components/loyalty/GuestCardPanel';

export default function CardPage() {
  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="relative overflow-hidden border-b border-obsidian/8">
        <div className="absolute inset-0 brand-gradient opacity-[0.08]" />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-12 pb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ember mb-3">Loyalty</p>
          <h1 className="font-logo font-black tracking-tight uppercase text-3xl sm:text-4xl text-obsidian">
            Guest Card
          </h1>
          <p className="text-base text-obsidian/55 mt-3 max-w-lg">
            Perks at partner rooms, shop discounts, and gift cards issued from outlet Convivium desks.
          </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <GuestCardPanel />
      </div>
    </section>
  );
}
