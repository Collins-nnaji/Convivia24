import { withAudit } from '@/lib/audit/route';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import sql, { apiErrorResponse } from '@/lib/db';
import { adminEmails } from '@/lib/admin-emails';
import { STAFF_ROLES } from '@/lib/admin-permissions';
async function handleGET() {
  const gate = await requireAdmin('owner'); if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try { const staff = await sql`SELECT * FROM admin_staff ORDER BY email`; const audit = await sql`SELECT * FROM admin_audit ORDER BY created_at DESC LIMIT 100`; return NextResponse.json({ staff,audit,accessEmails:adminEmails() }); }
  catch (err) { const { status,error } = apiErrorResponse(err); return NextResponse.json({ error },{ status }); }
}
async function handlePOST(req: NextRequest) {
  const gate = await requireAdmin('owner'); if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try { const body = await req.json(); const email = String(body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !STAFF_ROLES.includes(body.role)) return NextResponse.json({ error:'Valid email and staff role required.' },{status:400});
    await sql`INSERT INTO admin_staff(email,role,active) VALUES(${email},${body.role},${body.active === true}) ON CONFLICT(email) DO UPDATE SET role=EXCLUDED.role,active=EXCLUDED.active,updated_at=NOW()`;
    await sql`INSERT INTO admin_audit(actor,action,subject,detail) VALUES(${gate.actor},'staff.update',${email},${JSON.stringify({role:body.role,active:body.active===true})}::jsonb)`;
    return NextResponse.json({ok:true});
  } catch(err) {const {status,error}=apiErrorResponse(err);return NextResponse.json({error},{status});}
}

export const GET = withAudit('/api/admin/staff', handleGET);
export const POST = withAudit('/api/admin/staff', handlePOST);
