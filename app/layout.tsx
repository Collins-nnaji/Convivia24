import './globals.css';
import { Outfit, Cormorant_Garamond } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
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
    '18+ hospitality staffing — Lagos, Abuja, Port Harcourt. Verified workers; same-day mobile-money payouts.',
  applicationName: 'Convivia24',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Convivia24',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/Logo2.png',
    apple: '/Logo2.png',
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
      <body className={`${outfit.variable} ${cormorant.variable} font-sans bg-[#f8f6f2] text-neutral-900 antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
