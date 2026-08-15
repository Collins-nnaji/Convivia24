import './globals.css';
import { Outfit } from 'next/font/google';
import AuthProvider from '@/components/auth/AuthProvider';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata = {
  title: 'Convivia24 | Drinks to the party, club & lounge',
  description:
    'Drink ordering and delivery for parties, clubs, and lounges in Lagos. Circles for outdoor crews. Party Crews for shared drops. Age 18+.',
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
      <body className={`${outfit.variable} font-sans bg-paper text-obsidian antialiased`} suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
