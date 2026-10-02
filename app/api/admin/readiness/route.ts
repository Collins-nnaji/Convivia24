import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin';
import sql,{apiErrorResponse} from '@/lib/db';
import {configurationChecks} from '@/lib/launch-readiness';
import {LAUNCH_CITIES} from '@/lib/delivery/policy';
export async function GET(){const gate=await requireAdmin('owner');if(gate.ok===false)return NextResponse.json({error:gate.error},{status:gate.status});try{
  const checks=configurationChecks(process.env);
  const[zones,providers,stock,supplierStock,jobs,exceptions,events]=await Promise.all([
    sql`SELECT DISTINCT city FROM delivery_zones WHERE active`,sql`SELECT COUNT(*)::int AS n FROM delivery_providers WHERE active`,
    sql`SELECT i.slug,i.reserved,COALESCE(SUM(r.qty),0)::int AS ledger FROM inventory i LEFT JOIN order_stock_reservations r ON r.slug=i.slug AND r.state='reserved' GROUP BY i.slug HAVING i.reserved<>COALESCE(SUM(r.qty),0)`,
    sql`SELECT s.supplier_id,s.slug,s.reserved,COALESCE(SUM(r.qty),0)::int AS ledger FROM supplier_stock s LEFT JOIN order_stock_reservations r ON r.supplier_id=s.supplier_id AND r.slug=s.slug AND r.state='reserved' GROUP BY s.supplier_id,s.slug HAVING s.reserved<>COALESCE(SUM(r.qty),0)`,
    sql`SELECT COUNT(*)::int AS n FROM notification_jobs WHERE status='failed' OR (status IN ('pending','processing') AND created_at<NOW()-INTERVAL '30 minutes')`,
    sql`SELECT COUNT(*)::int AS n FROM payment_receipts WHERE exception IS NOT NULL`,
    sql`SELECT COUNT(*)::int AS n FROM night_events WHERE published AND ends_at>NOW()`]);
  for(const city of LAUNCH_CITIES)checks.push({name:city+' delivery',ok:zones.some(zone=>zone.city===city),detail:'At least one validated zone must be enabled.'});
  checks.push({name:'Courier providers',ok:Number(providers[0].n)>0,detail:'Configure at least one enabled provider.'},{name:'Stock ledger reconciliation',ok:stock.length===0&&supplierStock.length===0,detail:`${stock.length} inventory and ${supplierStock.length} supplier mismatches.`},{name:'Notification delivery',ok:Number(jobs[0].n)===0,detail:'No failed or overdue messages.'},{name:'Payment exceptions',ok:Number(exceptions[0].n)===0,detail:'Resolve payments received on closed orders.'},{name:'Live events',ok:Number(events[0].n)>0,detail:'Publish real future event listings.'});
  return NextResponse.json({targetDate:'2026-11-01',ready:checks.every(check=>check.ok),checks,stockMismatches:stock,supplierStockMismatches:supplierStock});
}catch(err){const{status,error}=apiErrorResponse(err,'Readiness checks failed. Apply migrations first.');return NextResponse.json({error},{status});}}
