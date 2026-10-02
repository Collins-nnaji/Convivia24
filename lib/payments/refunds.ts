import sql from '@/lib/db';
import {verifyFlutterwavePayment} from './flutterwave';
/** An unrelated refund of the same amount must never settle this order's ledger. */
export async function refundBelongsToOrder(orderId:string,transactionId:string):Promise<boolean>{
  if(!/^\d+$/.test(transactionId))return false;
  const[receipt]=await sql`SELECT order_id FROM payment_receipts WHERE transaction_id=${transactionId}`;
  if(receipt)return String(receipt.order_id)===orderId;
  // Historical payments can predate the callback ledger; verify their original reference.
  const[order]=await sql`SELECT payment_ref FROM ritual_orders WHERE id=${orderId}::uuid AND payment_provider='flutterwave'`;
  if(!order?.payment_ref)return false;
  const payment=await verifyFlutterwavePayment({txRef:String(order.payment_ref)});
  return String(payment?.id)===transactionId && payment?.tx_ref===order.payment_ref;
}
