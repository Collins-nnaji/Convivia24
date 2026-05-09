import './globals.css';
import { Plus_Jakarta_Sans, Cormorant_Garamond } from 'next/font/google';
import { NativeAppBridge } from '@/components/app/NativeAppBridge';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
});

export const metadata = {
  title: 'Convivia24 | Hospitality staffing',
  description:
    '18+ hospitality staffing in Lagos, Abuja, and Port Harcourt. Verified workers, open shifts, and same-day mobile-money payouts.',
  applicationName: 'Convivia24',
  manifest: '/manifest.json',
  metadataBase: new URL('https://app.convivia24.com'),
  appleWebApp: {
    capable: true,
    title: 'Convivia24',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-maskable.svg', type: 'image/svg+xml' },
    ],
    apple: '/icons/icon-maskable.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f8f6f2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${cormorant.variable} font-sans bg-[#f8f6f2] text-neutral-900 antialiased`}
        suppressHydrationWarning
      >
        <NativeAppBridge />
        {children}
      </body>
    </html>
  );
}
