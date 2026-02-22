import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getAppUser } from '@/lib/auth/session';
import { canAccessAdmin } from '@/lib/auth/access';
import sql from '@/lib/db';

async function getClientForUser(userId: string): Promise<string | null> {
  const rows = await sql`
    SELECT c.id FROM clients c
    JOIN client_users cu ON cu.client_id = c.id
    WHERE cu.user_id = ${userId}
    LIMIT 1
  `;
  const row = rows[0];
  return row ? String(row.id) : null;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const appUser = await getAppUser({
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name,
    image: session.user.image,
  });

  const [listing] = await sql`
    SELECT l.*, c.name as client_name
    FROM listings l
    JOIN clients c ON c.id = l.client_id
    WHERE l.id = ${id}
  `;
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (!canAccessAdmin(appUser)) {
    const clientId = await getClientForUser(appUser.id);
    if (clientId !== String(listing.client_id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.json(listing);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const appUser = await getAppUser({
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name,
    image: session.user.image,
  });

  const [existing] = await sql`SELECT * FROM listings WHERE id = ${id}`;
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();

  if (canAccessAdmin(appUser)) {
    // Admin: set agreed price/commission, status (price_agreed | listed | sold), sale_value, sold_at
    if (body.agreed_price !== undefined) {
      const val = body.agreed_price == null ? null : Number(body.agreed_price);
      await sql`UPDATE listings SET agreed_price = ${val}, updated_at = NOW() WHERE id = ${id}`;
    }
    if (body.agreed_commission_pct !== undefined) {
      const val = body.agreed_commission_pct == null ? null : Number(body.agreed_commission_pct);
      await sql`UPDATE listings SET agreed_commission_pct = ${val}, updated_at = NOW() WHERE id = ${id}`;
    }
    if (body.status !== undefined) {
      const status = String(body.status);
      const allowed = ['draft', 'submitted', 'price_agreed', 'listed', 'sold', 'withdrawn'];
      if (!allowed.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      await sql`UPDATE listings SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
      if (status === 'sold') {
        await sql`UPDATE listings SET sold_at = NOW() WHERE id = ${id}`;
        if (body.sale_value !== undefined) {
          await sql`UPDATE listings SET sale_value = ${Number(body.sale_value)} WHERE id = ${id}`;
        }
      }
    }
    const [updated] = await sql`SELECT * FROM listings WHERE id = ${id}`;
    return NextResponse.json(updated ?? existing);
  }

  // Client: allow submit (draft -> submitted) or update draft fields
  const clientId = await getClientForUser(appUser.id);
  if (clientId !== String(existing.client_id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (body.action === 'submit' && String(existing.status) === 'draft') {
    const [updated] = await sql`
      UPDATE listings SET status = 'submitted', updated_at = NOW() WHERE id = ${id} RETURNING *
    `;
    return NextResponse.json(updated ?? existing);
  }

  // Update draft: title, description, asking_price, currency, commission_pct
  if (String(existing.status) === 'draft') {
    const title = body.title !== undefined ? String(body.title).trim() : undefined;
    const description = body.description !== undefined ? (body.description?.trim() || null) : undefined;
    const asking_price = body.asking_price !== undefined ? (body.asking_price == null || body.asking_price === '' ? null : Number(body.asking_price)) : undefined;
    const currency = body.currency !== undefined ? (body.currency?.trim() || 'GBP') : undefined;
    const commission_pct = body.commission_pct !== undefined ? (body.commission_pct == null || body.commission_pct === '' ? null : Number(body.commission_pct)) : undefined;
    if (title !== undefined) {
      if (!title) return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
      await sql`UPDATE listings SET title = ${title}, updated_at = NOW() WHERE id = ${id}`;
    }
    if (description !== undefined) await sql`UPDATE listings SET description = ${description}, updated_at = NOW() WHERE id = ${id}`;
    if (asking_price !== undefined) await sql`UPDATE listings SET asking_price = ${asking_price}, updated_at = NOW() WHERE id = ${id}`;
    if (currency !== undefined) await sql`UPDATE listings SET currency = ${currency}, updated_at = NOW() WHERE id = ${id}`;
    if (commission_pct !== undefined) await sql`UPDATE listings SET commission_pct = ${commission_pct}, updated_at = NOW() WHERE id = ${id}`;
    const [updated] = await sql`SELECT * FROM listings WHERE id = ${id}`;
    return NextResponse.json(updated ?? existing);
  }

  return NextResponse.json(
    { error: 'Only "submit" action is allowed for draft listings; only drafts can be edited.' },
    { status: 400 }
  );
}
