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
  title: 'Convivia24 | Gather. Share. Remember.',
  description: 'An app for eating and drinking with people. Find an open table with a seat spare, keep the night in photos, and let the bill work itself out — everyone knows their number before the food arrives.',
  applicationName: 'Convivia24',
  appleWebApp: {
    capable: true,
    title: 'Convivia24',
    statusBarStyle: 'black-translucent' as const,
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: '/apple-icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  // The app draws into the notch and the home-indicator area itself.
  viewportFit: 'cover' as const,
  // Locked out of zoom-on-input-focus without disabling pinch zoom entirely.
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
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
