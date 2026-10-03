import { withAudit } from '@/lib/audit/route';
import {NextRequest,NextResponse} from 'next/server';
import {getCurrentUser} from '@/lib/auth/session';
import sql,{apiErrorResponse} from '@/lib/db';
import {launchCity} from '@/lib/delivery/policy';
async function handleGET(){const user=await getCurrentUser();if(!user)return NextResponse.json({error:'Sign in required.'},{status:401});try{const[addresses,preferences]=await Promise.all([sql`SELECT * FROM customer_addresses WHERE user_id=${user.id} ORDER BY created_at DESC`,sql`SELECT * FROM customer_preferences WHERE user_id=${user.id}`]);return NextResponse.json({addresses,preferences:preferences[0]||{marketing_email:false}});}catch(err){const{status,error}=apiErrorResponse(err);return NextResponse.json({error},{status});}}
async function handlePOST(req:NextRequest){const user=await getCurrentUser();if(!user)return NextResponse.json({error:'Sign in required.'},{status:401});try{const body=await req.json();
  if(body.action==='preferences'){await sql`INSERT INTO customer_preferences(user_id,marketing_email) VALUES(${user.id},${body.marketingEmail===true}) ON CONFLICT(user_id) DO UPDATE SET marketing_email=EXCLUDED.marketing_email,updated_at=NOW()`;}
  else if(body.action==='request-deletion'){await sql`INSERT INTO customer_preferences(user_id,deletion_requested_at) VALUES(${user.id},NOW()) ON CONFLICT(user_id) DO UPDATE SET deletion_requested_at=COALESCE(customer_preferences.deletion_requested_at,NOW()),updated_at=NOW()`;}
  else if(body.action==='delete-address'){const id=String(body.id||'');if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:'Valid address ID required.'},{status:400});await sql`DELETE FROM customer_addresses WHERE id=${id}::uuid AND user_id=${user.id}`;}
  else if(body.action==='save-address'){const city=launchCity(body.city);const fullName=String(body.fullName||'').trim().slice(0,120);const phone=String(body.phone||'').replace(/[^\d+]/g,'');const line=String(body.addressLine1||'').trim().slice(0,200);const area=String(body.area||'').trim().slice(0,100);if(!city||!fullName||phone.length<10||!line||!area)return NextResponse.json({error:'Enter a name, valid phone, address, area and supported delivery city.'},{status:400});const[count]=await sql`SELECT COUNT(*)::int AS n FROM customer_addresses WHERE user_id=${user.id}`;if(Number(count.n)>=20)return NextResponse.json({error:'You can save up to 20 addresses.'},{status:400});await sql`INSERT INTO customer_addresses(user_id,label,full_name,phone,address_line1,address_line2,city,area) VALUES(${user.id},${String(body.label||'Delivery').slice(0,80)},${fullName},${phone},${line},${String(body.addressLine2||'').slice(0,200)},${city},${area})`;}
  else return NextResponse.json({error:'Unknown action.'},{status:400});return NextResponse.json({ok:true});
}catch(err){const{status,error}=apiErrorResponse(err);return NextResponse.json({error},{status});}}

export const GET = withAudit('/api/account/settings', handleGET);
export const POST = withAudit('/api/account/settings', handlePOST);
