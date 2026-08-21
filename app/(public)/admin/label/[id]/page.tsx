import { notFound } from 'next/navigation';
import { isAdmin } from '@/lib/admin';
import { isValidOrderId, verifyUrl, verifyCode } from '@/lib/verify';
import AuthenticityQr from '@/components/verify/AuthenticityQr';
import PrintButton from '@/components/admin/PrintButton';

export const metadata = { title: 'Authenticity label | Convivia24' };

export default async function AdminLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await isAdmin())) notFound();
  if (!isValidOrderId(id)) notFound();

  return (
    <section className="bg-white min-h-screen flex flex-col items-center py-10 px-5 print:py-0">
      <div className="w-[260px] border-2 border-obsidian p-4 text-center print:border-black">
        <p className="font-wordmark text-lg text-obsidian mb-0.5">CONVIVIA24</p>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-ember mb-3">
          Verified original
        </p>
        <div className="flex justify-center mb-3">
          <AuthenticityQr value={verifyUrl(id)} size={140} />
        </div>
        <p className="text-sm font-mono font-bold text-obsidian">{verifyCode(id)}</p>
        <p className="text-[9px] text-obsidian/50 mt-1">Scan to verify at convivia24.com/verify</p>
      </div>

      <p className="text-xs text-obsidian/50 mt-6 print:hidden max-w-xs text-center">
        Stick this on the bottle or carton before it leaves packing. Scanning it confirms the order was
        genuinely supplied by Convivia24.
      </p>
      <PrintButton />
    </section>
  );
}
