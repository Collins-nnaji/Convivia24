import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      phone,
      business_name,
      business_address,
      business_city,
      business_state,
      business_postal_code,
      business_country,
      business_industry,
      business_size,
      contact_person
    } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!business_name || !business_address) {
      return NextResponse.json(
        { error: 'Business name and address are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create business first
    const [business] = await sql`
      INSERT INTO businesses (
        name, address, city, state, postal_code, country,
        contact_person, phone, email, industry, size
      )
      VALUES (
        ${business_name},
        ${business_address},
        ${business_city || null},
        ${business_state || null},
        ${business_postal_code || null},
        ${business_country || 'Nigeria'},
        ${contact_person || `${first_name} ${last_name}`.trim()},
        ${phone || null},
        ${email},
        ${business_industry || null},
        ${business_size || null}
      )
      RETURNING id, name, email
    `;

    // Create user with client role
    const [user] = await sql`
      INSERT INTO users (
        email, password_hash, role, business_id, first_name, last_name, phone
      )
      VALUES (
        ${email},
        ${passwordHash},
        'client',
        ${business.id},
        ${first_name || null},
        ${last_name || null},
        ${phone || null}
      )
      RETURNING id, email, role, business_id, first_name, last_name
    `;

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      business_id: user.business_id,
    });

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          business_id: user.business_id,
        },
        business: {
          id: business.id,
          name: business.name,
          email: business.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
