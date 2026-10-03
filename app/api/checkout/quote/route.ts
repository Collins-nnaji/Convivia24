import { withAudit } from '@/lib/audit/route';
import {NextRequest,NextResponse} from 'next/server';
import {getCurrentUser} from '@/lib/auth/session';
import sql,{apiErrorResponse} from '@/lib/db';
import {resolveSellableProduct,getInventory} from '@/lib/inventory';
import {claimMember,resolveMemberOwner,loyaltyDiscountNgn} from '@/lib/loyalty/members';
import {rateLimit} from '@/lib/redis';
async function handlePOST(req:NextRequest){const user=await getCurrentUser();if(!user)return NextResponse.json({error:'Sign in required.'},{status:401});try{
  if(!(await rateLimit('checkout-quote:'+user.id,60,60)).ok)return NextResponse.json({error:'Please try again shortly.'},{status:429});
  const body=await req.json();const items=body.items;
  if(!Array.isArray(items)||!items.length||items.length>100||items.some(item=>!item||typeof item.slug!=='string'||!Number.isInteger(item.qty)||item.qty<1||item.qty>24))return NextResponse.json({error:'Invalid basket.'},{status:400});
  const zoneId=String(body.deliveryZoneId||'');if(!/^[0-9a-f-]{36}$/i.test(zoneId))return NextResponse.json({error:'Choose a delivery zone.'},{status:400});
  const[zone]=await sql`SELECT city,fee_ngn,estimate FROM delivery_zones WHERE id=${zoneId}::uuid AND active`;if(!zone)return NextResponse.json({error:'This delivery zone is unavailable.'},{status:409});
  const lines=[];let subtotal=0;const grouped=new Map<string,number>();for(const item of items)grouped.set(item.slug,(grouped.get(item.slug)||0)+item.qty);
  for(const[slug,qty]of grouped){const product=await resolveSellableProduct(slug);const inv=await getInventory(slug);if(!product||qty>24||qty<(inv?.min_order_qty||1)|| (inv?.track_stock&&inv.available<qty))return NextResponse.json({error:'A product is unavailable or its quantity needs updating.'},{status:409});lines.push({...product,qty});subtotal+=product.priceNgn*qty;}
  const owner=await resolveMemberOwner();const member=owner?await claimMember(owner,{email:user.email,name:user.name||undefined}):null;const discount=loyaltyDiscountNgn(subtotal,member);let gift=0;
  if(body.giftCardCode){const[card]=await sql`SELECT balance_ngn FROM gift_cards WHERE code=${String(body.giftCardCode).trim().toUpperCase()} AND status='active' AND balance_ngn>0 AND (expires_at IS NULL OR expires_at>NOW())`;if(!card)return NextResponse.json({error:'Gift card is invalid, expired or spent.'},{status:400});gift=Math.min(Number(card.balance_ngn),subtotal-discount.ngn+Number(zone.fee_ngn));}
  return NextResponse.json({lines,subtotalNgn:subtotal,loyaltyDiscountNgn:discount.ngn,deliveryFeeNgn:Number(zone.fee_ngn),giftCardAppliedNgn:gift,totalNgn:subtotal-discount.ngn+Number(zone.fee_ngn)-gift,estimate:zone.estimate});
}catch(err){const{status,error}=apiErrorResponse(err,'Could not calculate checkout total.');return NextResponse.json({error},{status});}}

export const POST = withAudit('/api/checkout/quote', handlePOST);
