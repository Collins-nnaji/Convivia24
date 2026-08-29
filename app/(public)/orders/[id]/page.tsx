import type { Metadata } from 'next';
import OrderTracking from '@/components/orders/OrderTracking';

export const metadata: Metadata = {
  title: 'Track your order',
  description: 'Follow your Convivia24 order from paid to delivered.',
  robots: { index: false },
};

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderTracking orderId={id} />;
}
