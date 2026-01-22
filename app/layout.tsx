import './globals.css';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Convivia24 | Build Speaking Confidence Through Daily Practice',
  description: 'Practice conversations in real-life situations. Build confidence through daily 5-minute sessions with prompts, partner matching, and progress tracking.',
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
