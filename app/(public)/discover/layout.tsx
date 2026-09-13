import DiscoverShell from '@/components/discover/DiscoverShell';

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return <DiscoverShell>{children}</DiscoverShell>;
}
