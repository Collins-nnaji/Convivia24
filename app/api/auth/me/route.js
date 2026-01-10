import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request) {
  try {
    const authResult = await authenticate(request);

    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = authResult.user;

    // Get user with business info
    const users = await sql`
      SELECT 
        u.id, 
        u.email, 
        u.role, 
        u.business_id,
        u.first_name,
        u.last_name,
        u.phone,
        u.last_login,
        u.created_at,
        b.name as business_name,
        b.address as business_address,
        b.city as business_city,
        b.state as business_state,
        b.postal_code as business_postal_code,
        b.country as business_country,
        b.contact_person,
        b.industry,
        b.size
      FROM users u
      LEFT JOIN businesses b ON u.business_id = b.id
      WHERE u.id = ${id}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        last_login: user.last_login,
        created_at: user.created_at,
        business: user.business_id ? {
          id: user.business_id,
          name: user.business_name,
          address: user.business_address,
          city: user.business_city,
          state: user.business_state,
          postal_code: user.business_postal_code,
          country: user.business_country,
          contact_person: user.contact_person,
          industry: user.industry,
          size: user.size,
        } : null,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
