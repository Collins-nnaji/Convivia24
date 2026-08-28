import type { Metadata } from 'next';
import ContactPage from '@/components/partners/ContactPage';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Convivia24 — email support, outlet wholesale enquiries, and brand distribution enquiries. Nationwide drinks supply across Nigeria. Adults 18+.',
  alternates: { canonical: absoluteUrl('/contact') },
  openGraph: {
    title: 'Contact | Convivia24',
    description: 'Get in touch — orders, outlets, and brand partnerships.',
    url: absoluteUrl('/contact'),
  },
};

export default function Page() {
  return <ContactPage />;
}
