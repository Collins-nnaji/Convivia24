import './globals.css';
import { Outfit } from 'next/font/google';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} bg-white text-zinc-900 antialiased selection:bg-red-700 selection:text-white`} suppressHydrationWarning>
        <Navigation />
        <div className="relative z-0">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
