import './globals.css';
import { Outfit } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Convivia24 | Revenue Management, Redefined.',
  description: 'Convivia24 manages the insights, planning, and execution that transform stagnant pipelines into high-velocity revenue engines.',
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
      <body className={`${outfit.className} bg-white text-zinc-900 antialiased selection:bg-red-700 selection:text-white`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
