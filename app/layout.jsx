import './globals.css';
import { ClientProviders } from '@/components/ClientProviders';

export const metadata = {
  title: 'Convivia 24 — Clean. Secure. On demand. | Nigeria',
  description: 'On-demand platform for cleanliness, safety, and property care across Nigeria—connecting homes, businesses, and communities with trusted cleaning and security professionals in minutes.',
  keywords: 'cleaning services Nigeria, security services Nigeria, on-demand cleaning Lagos, licensed security Nigeria, event security, home security Lagos, estate security Abuja, commercial cleaning, property management Nigeria, trusted professionals, vetted staff',
  openGraph: {
    title: 'Convivia 24 — Clean. Secure. On demand. | Nigeria',
    description: 'Complete property care platform for Nigeria: cleaning and security services in one place. Vetted professionals, licensed security, 24/7 availability across all major cities.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/Logo2.png" />
        <link rel="shortcut icon" href="/Logo2.png" />
      </head>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

