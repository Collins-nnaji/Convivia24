import './globals.css';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import AuthProvider from '@/components/auth/AuthProvider';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-fraunces',
});

export const metadata = {
  title: 'Convivia24 | The Experiential Event Platform',
  description: 'Curated social gatherings — from business salons to supper clubs and nightlife. Approval guestlists, digital lounges, broadcast hub, and shared memory walls.',
  icons: { icon: '/Logo2.png' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${fraunces.variable} font-sans bg-surface text-ink antialiased`} suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
