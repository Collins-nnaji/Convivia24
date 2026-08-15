import CirclesFeed from '@/components/circles/CirclesFeed';

export const metadata = {
  title: 'Circles | Convivia24',
  description: 'Community hangouts for outdoor crews — beach, rooftop, trail, afterparty.',
};

export default function CirclesPage() {
  return (
    <section className="bg-paper min-h-[70vh]">
      <CirclesFeed />
    </section>
  );
}
