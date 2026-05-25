import type { Viewport } from 'next';
import { ActivationLandingPage } from '@/components/activation/LandingPage';

export const metadata = {
  title: 'Convivia24 · FMCG brand activation',
  description:
    'Guest passes, sampling, photo wall, and live ROI for FMCG brands — from brief to 1M+ consumer reach.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#f8f6f2',
};

export default function HomePage() {
  return <ActivationLandingPage />;
}
