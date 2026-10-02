import type {Metadata} from 'next';
import {notFound,redirect} from 'next/navigation';
import Link from 'next/link';
import sql from '@/lib/db';
import {getCurrentUser} from '@/lib/auth/session';
import {formatNgn} from '@/lib/drinks/catalog';
import PrintReceipt from '@/components/orders/PrintReceipt';
export const metadata:Metadata={title:'Order receipt',robots:{index:false,follow:false}};
export default async function Receipt({params}:{params:Promise<{id:string}>}){
  const{id}=await params;
  if(!/^[0-9a-f-]{36}$/i.test(id))notFound();
  const user=await getCurrentUser();
  if(!user)redirect(`/signin?next=${encodeURIComponent(`/orders/${id}/receipt`)}`);
  const[order]=await sql`SELECT * FROM ritual_orders WHERE id=${id}::uuid AND LOWER(email)=${user.email.toLowerCase()}`;
  if(!order)notFound();
  const items=await sql`SELECT kit_name,qty,unit_price_ngn FROM ritual_order_items WHERE order_id=${id}::uuid ORDER BY created_at`;
  return <section className="mx-auto max-w-3xl px-5 py-10 bg-white text-obsidian"><div className="flex justify-between gap-3 mb-8 print:hidden"><Link href={`/orders/${id}`} className="text-ember">Back to order</Link><PrintReceipt/></div><h1 className="text-3xl font-bold">Convivia24 order receipt</h1><p className="my-3 text-sm">{id} · {new Date(String(order.created_at)).toLocaleDateString('en-NG')} · {String(order.status).replaceAll('_',' ')}</p><p>{String(order.full_name)} · {String(order.email)}</p><p className="text-sm mb-8">{[order.address_line1,order.address_line2,order.area,order.city].filter(Boolean).join(', ')}</p><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3">Item</th><th>Qty</th><th>Amount</th></tr></thead><tbody>{items.map((item,index)=><tr key={index} className="border-b"><td className="py-3">{String(item.kit_name)}</td><td>{Number(item.qty)}</td><td>{formatNgn(Number(item.qty)*Number(item.unit_price_ngn))}</td></tr>)}</tbody></table><dl className="my-6 space-y-2">{[['Subtotal',order.subtotal_ngn],['Guest Card discount',-Number(order.loyalty_discount_ngn||0)],['Delivery',order.delivery_fee_ngn],['Gift credit',-Number(order.gift_card_discount_ngn||0)],['Cash total',order.total_ngn],['Cash refunded',order.refunded_ngn]].map(([name,value])=><div className="flex justify-between" key={String(name)}><dt>{String(name)}</dt><dd>{formatNgn(Number(value||0))}</dd></div>)}</dl><p className="text-sm">Payment reference: {String(order.payment_ref||order.payment_provider||'Awaiting payment')}</p><p className="text-sm mt-4">This receipt records the order and its current payment status. For billing or refund questions, contact support@convivia24.com.</p></section>;
}
