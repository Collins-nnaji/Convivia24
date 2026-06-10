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
  title: 'Convivia24 | Discover Events. Buy Tickets. Go.',
  description: 'The AI-powered events and ticketing platform for parties, concerts and culture. Discover events, buy tickets with QR + barcode entry, and sell out your next event. Lagos · Abuja · London.',
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
        {children}
      </body>
    </html>
  );
}
