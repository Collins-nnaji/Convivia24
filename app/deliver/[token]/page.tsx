import type { Metadata } from 'next';
import RiderDelivery from './RiderDelivery';

export const metadata: Metadata = {
  title: 'Delivery | Convivia24',
  robots: { index: false, follow: false },
};

export default async function DeliverPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <RiderDelivery token={token} />;
}
