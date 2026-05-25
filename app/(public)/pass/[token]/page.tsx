import { GuestPassView } from '@/components/guest/GuestPassView';

export default function GuestPassPage({ params }: { params: { token: string } }) {
  return <GuestPassView campaignSlug={params.token} />;
}
