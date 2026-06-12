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
  title: 'Convivia24 | Come to the Table.',
  description: 'A luxury hotel and members club for African business. Lagos. Abuja. London.',
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
      <body className={`${outfit.variable} ${cormorant.variable} font-sans bg-obsidian text-cream antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
