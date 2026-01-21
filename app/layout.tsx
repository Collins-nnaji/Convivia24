import './globals.css';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Convivia24 | Premium Personal Driver Service',
  description: 'Hire elite vetted drivers for your personal vehicle. Manage your fleet and bookings with ease.',
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
    <html lang="en">
      <body className={`${outfit.className} bg-slate-50 text-zinc-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
