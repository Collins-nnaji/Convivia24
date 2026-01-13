import './globals.css';
import { ClientProviders } from '@/components/ClientProviders';

export const metadata = {
  title: 'Convivia 24 — Clean. Secure. On demand. | Nigeria',
  description: 'On-demand platform for cleanliness, safety, and mobility across Nigeria—connecting homes, businesses, and communities with trusted cleaning, security, and driver professionals in minutes.',
  keywords: 'cleaning services Nigeria, security services Nigeria, driver services Nigeria, on-demand cleaning Lagos, licensed security Nigeria, professional drivers Lagos, event security, home security Lagos, estate security Abuja, commercial cleaning, property management Nigeria, trusted professionals, vetted staff, driver hire Nigeria',
  openGraph: {
    title: 'Convivia 24 — Clean. Secure. Drive. On demand. | Nigeria',
    description: 'Complete property care platform for Nigeria: cleaning, security, and driver services in one place. Vetted professionals, licensed security, verified drivers, 24/7 availability across all major cities.',
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

