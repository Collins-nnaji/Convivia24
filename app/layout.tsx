import './globals.css';
import { Montserrat, Outfit } from 'next/font/google';
import AuthProvider from '@/components/auth/AuthProvider';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
});

export const metadata = {
  title: 'Convivia24 | Drinks to the party, club & lounge',
  description:
    'Lagos drinks to the party, club, and lounge. Events around you, Guest Card perks, partner wholesale. Age 18+.',
  icons: {
    icon: '/Logo2.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${montserrat.variable} font-sans bg-paper text-obsidian antialiased`} suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
