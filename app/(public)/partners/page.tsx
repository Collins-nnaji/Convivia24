import { redirect } from 'next/navigation';

/** Legacy URL — contact page holds outlet + brand enquiry forms. */
export default function PartnersPage() {
  redirect('/contact');
}
