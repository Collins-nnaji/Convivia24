import './globals.css';
import { Outfit, Cormorant_Garamond } from 'next/font/google';
import AuthProvider from '@/components/auth/AuthProvider';

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
  title: 'Convivia24 | The Experiential Event Platform',
  description: 'Curated social gatherings — from business salons to supper clubs and nightlife. Approval guestlists, digital lounges, broadcast hub, and shared memory walls.',
  icons: {
    icon: '/Logo2.png',
  }
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
      <body className={`${outfit.variable} ${cormorant.variable} font-sans bg-paper text-obsidian antialiased`} suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
