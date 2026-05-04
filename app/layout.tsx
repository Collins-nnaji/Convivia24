import './globals.css';
import { Plus_Jakarta_Sans, Cormorant_Garamond } from 'next/font/google';

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
  title: 'Convivia24 | Healthy living is better together.',
  description: 'Behaviour change sticks in community. Track your Daily 24, build your squad, and make healthy living feel like a celebration — not a punishment.',
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
      <body className={`${jakarta.variable} ${cormorant.variable} font-sans bg-white text-ink antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
