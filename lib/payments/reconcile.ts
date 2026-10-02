import sql from '@/lib/db';
import { flutterwavePaid, type FlwVerifyData } from './flutterwave';
import { approveReferralForOrder } from '@/lib/referrals/repo';
/** The provider result must first match the stored reference, currency, and exact amount. */
export async function reconcilePayment(orderId: string,data: FlwVerifyData|null):Promise<{status:string;verified:boolean}|null>{
  const[order]=await sql`SELECT id,status,payment_ref,total_ngn FROM ritual_orders WHERE id=${orderId}::uuid`;
  if(!order||!data?.id||!flutterwavePaid(data,Number(order.total_ngn),String(order.payment_ref||'')))return null;
  const[result]=await sql`SELECT c24_reconcile_payment(${orderId}::uuid,${String(data.id)},${data.tx_ref!},${Number(data.amount)}::integer) AS status`;
  const status=String(result.status);const verified=['paid','processing','packed','out_for_delivery','delivered','fulfilled'].includes(status);
  if(verified)await approveReferralForOrder(orderId);
  return {status,verified};
}
