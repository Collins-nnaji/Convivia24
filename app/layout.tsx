import './globals.css';
import { NativeAppBridge } from '@/components/app/NativeAppBridge';

export const metadata = {
  title: 'Convivia24 — Throw it. Plan it. Remember it.',
  description:
    'Party planning, invite design, guest management, and day-of check-in — one tool for the whole life of a gathering. Weddings, birthdays, club nights, and more.',
  applicationName: 'Convivia24',
  manifest: '/manifest.json',
  metadataBase: new URL('https://app.convivia24.com'),
  appleWebApp: {
    capable: true,
    title: 'Convivia24',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [{ url: '/Logo2.png', type: 'image/png' }],
    apple: '/Logo2.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#faf6ee',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-[var(--cv-ivory)] text-[var(--cv-ink)] antialiased"
        suppressHydrationWarning
      >
        <NativeAppBridge />
        {children}
      </body>
    </html>
  );
}
