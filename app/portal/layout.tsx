import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brand Partner Portal — Convivia24',
  description: 'Convivia24 Brand Activation Platform',
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
