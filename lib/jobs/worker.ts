import { randomUUID } from 'node:crypto';
import sql from '@/lib/db';
import { verifyFlutterwavePayment, fetchFlutterwaveRefund, refundCompleted } from '@/lib/payments/flutterwave';
import { refundBelongsToOrder } from '@/lib/payments/refunds';
import { reconcilePayment } from '@/lib/payments/reconcile';
import { releaseOrderResources } from '@/lib/commerce/fulfillment';
import { deliverOrderStatus } from '@/lib/commerce/notify';
import { reconcileOrderPoints } from '@/lib/loyalty/members';
export async function runCommerceJobs(){
  const deadline=Date.now()+45000;
  let expired=0,paid=0,notifications=0,refunds=0;
  const awaiting=await sql`SELECT id,status,payment_provider,payment_ref FROM ritual_orders
    WHERE status IN ('pending','awaiting_payment') AND payment_expires_at<NOW() ORDER BY payment_expires_at LIMIT 30`;
  for(const order of awaiting){
    if(Date.now()>deadline-21000)break;
    if(order.payment_provider==='flutterwave'){
      const data=await verifyFlutterwavePayment({txRef:String(order.payment_ref)});
      if(!data)continue; // Provider outage is not evidence that an order is unpaid.
      if(['successful','completed'].includes(String(data.status))){if((await reconcilePayment(String(order.id),data))?.verified)paid++;continue;}
    }
    const[result]=await sql`SELECT c24_transition_order(${order.id}::uuid,${order.status},'cancelled','{}'::jsonb,'Payment window expired') AS changed`;
    if(result.changed)expired++;
  }
  // Retry stock/card cleanup after a crash between cancellation and release.
  const cleanup=await sql`SELECT DISTINCT o.id FROM ritual_orders o LEFT JOIN order_stock_reservations r ON r.order_id=o.id
    LEFT JOIN order_gift_card_usage g ON g.order_id=o.id WHERE o.status IN ('cancelled','refunded') AND (r.state='reserved' OR g.restored=false) LIMIT 30`;
  for(const order of cleanup)await releaseOrderResources(String(order.id));
  const pending=await sql`SELECT id,order_id,provider_reference,amount_ngn FROM order_refunds WHERE status='pending' AND provider='flutterwave' AND provider_reference IS NOT NULL LIMIT 20`;
  for(const refund of pending){
    if(Date.now()>deadline-21000)break;
    try{const result=await fetchFlutterwaveRefund(String(refund.provider_reference));if(!result||result.amount!==Number(refund.amount_ngn)||!await refundBelongsToOrder(String(refund.order_id),result.transactionId))continue;
      if(refundCompleted(result.status)){await sql`SELECT c24_complete_refund(${refund.id}::uuid,${refund.provider_reference})`;await reconcileOrderPoints(String(refund.order_id));refunds++;}
      else if(result.status==='failed')await sql`UPDATE order_refunds SET status='failed',updated_at=NOW() WHERE id=${refund.id}::uuid AND status='pending'`;
    }catch{/* Leave for retry and the exception desk. */}
  }
  if(Date.now()>deadline-21000)return {expired,paid,notifications,refunds};
  const lease=randomUUID();
  const jobs=await sql`UPDATE notification_jobs SET status='processing',attempts=attempts+1,lease=${lease}::uuid,available_at=NOW()+INTERVAL '5 minutes'
    WHERE id IN(SELECT id FROM notification_jobs WHERE (status='pending' OR status='processing') AND available_at<=NOW() AND attempts<8 ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 20) RETURNING *`;
  for(const job of jobs){
    if(Date.now()>deadline-21000){await sql`UPDATE notification_jobs SET status='pending',attempts=GREATEST(0,attempts-1),lease=NULL,available_at=NOW() WHERE id=${job.id}::uuid AND lease=${lease}::uuid`;continue;}
    try{const payload=job.payload as {orderId:string;status:Parameters<typeof deliverOrderStatus>[1]};
      await deliverOrderStatus(payload.orderId,payload.status,null,String(job.id));
      await sql`UPDATE notification_jobs SET status='sent',lease=NULL,last_error=NULL WHERE id=${job.id}::uuid AND lease=${lease}::uuid`;notifications++;
    }catch(err){await sql`UPDATE notification_jobs SET status=CASE WHEN attempts>=8 THEN 'failed' ELSE 'pending' END,
      available_at=NOW()+INTERVAL '5 minutes',lease=NULL,last_error=${err instanceof Error?err.message.slice(0,300):'Notification failed'} WHERE id=${job.id}::uuid AND lease=${lease}::uuid`;}
  }
  return {expired,paid,notifications,refunds};
}
