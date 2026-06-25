import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isAdminRequest } from '@/lib/auth/session';
import { VENDOR_CATEGORIES } from '@/lib/vendors';

interface VendorBody {
  business_name?: string;
  category?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  instagram?: string;
  city?: string;
  country?: string;
  description?: string;
  services?: string[] | string;
  price_from?: number | string;
  currency?: string;
  logo_url?: string;
}

function clean(v?: string | null): string | null {
  const t = (v ?? '').trim();
  return t ? t : null;
}

/** Admin-only: browse the vendor directory. Supports status/category/city/q filters. */
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const q = searchParams.get('q');

    const rows = await sql`
      SELECT * FROM vendors
      WHERE (${status ?? null}::text IS NULL OR status = ${status ?? null})
        AND (${category ?? null}::text IS NULL OR category = ${category ?? null})
        AND (${city ?? null}::text IS NULL OR city ILIKE ${'%' + (city ?? '') + '%'})
        AND (${q ?? null}::text IS NULL
             OR business_name ILIKE ${'%' + (q ?? '') + '%'}
             OR description ILIKE ${'%' + (q ?? '') + '%'})
      ORDER BY is_featured DESC, created_at DESC
      LIMIT 300
    `;

    // Lightweight counts for the status tabs.
    const counts = await sql`SELECT status, COUNT(*)::int AS n FROM vendors GROUP BY status`;
    const byStatus: Record<string, number> = {};
    for (const r of counts) byStatus[String(r.status)] = Number(r.n);

    return NextResponse.json({ vendors: rows, counts: byStatus });
  } catch (err) {
    console.error('[GET /api/vendors]', err);
    return NextResponse.json({ error: 'Failed to load vendors.' }, { status: 500 });
  }
}

/** Public: vendor self-onboarding. Lands as a pending application for review. */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VendorBody;

    const businessName = clean(body.business_name);
    const email = clean(body.email);
    if (!businessName || !email) {
      return NextResponse.json(
        { error: 'Business name and a contact email are required.' },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured.' }, { status: 500 });
    }

    const category = VENDOR_CATEGORIES.includes(body.category as never) ? body.category! : 'other';
    const services = Array.isArray(body.services)
      ? body.services.map((s) => String(s).trim()).filter(Boolean)
      : clean(typeof body.services === 'string' ? body.services : null)
        ? String(body.services).split(',').map((s) => s.trim()).filter(Boolean)
        : null;
    const priceFrom = body.price_from != null && body.price_from !== ''
      ? Number(body.price_from)
      : null;

    const rows = await sql`
      INSERT INTO vendors (
        business_name, category, contact_name, email, phone, whatsapp,
        website, instagram, city, country, description, services,
        price_from, currency, logo_url
      ) VALUES (
        ${businessName}, ${category}, ${clean(body.contact_name)}, ${email},
        ${clean(body.phone)}, ${clean(body.whatsapp)}, ${clean(body.website)},
        ${clean(body.instagram)}, ${clean(body.city)}, ${clean(body.country)},
        ${clean(body.description)}, ${services}, ${Number.isFinite(priceFrom) ? priceFrom : null},
        ${clean(body.currency) ?? 'NGN'}, ${clean(body.logo_url)}
      )
      RETURNING id, created_at
    `;

    return NextResponse.json({
      ok: true,
      id: rows[0]?.id,
      message: 'Thanks! Your listing has been submitted for review. Approved vendors appear in the organiser directory.',
    });
  } catch (err) {
    console.error('[POST /api/vendors]', err);
    return NextResponse.json({ error: 'Could not submit your listing. Please try again.' }, { status: 500 });
  }
}
