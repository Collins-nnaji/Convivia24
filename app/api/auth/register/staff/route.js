import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      service_category, // 'cleaning', 'security', or 'both'
      email, 
      password, 
      first_name, 
      last_name, 
      phone,
      postcode,
      city,
      county,
      country,
      service_areas,
      availability,
      experience_years,
      certifications,
      licenses, // Security licenses
      license_number, // SIA license number
      license_expiry, // License expiry date
      sia_licensed,
      background_check,
      dbs_check,
      references,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      notes
    } = body;

    // Validation
    if (!service_category || !['cleaning', 'security', 'both'].includes(service_category)) {
      return NextResponse.json(
        { error: 'Service category (cleaning, security, or both) is required' },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!first_name || !last_name || !phone) {
      return NextResponse.json(
        { error: 'First name, last name, and phone are required' },
        { status: 400 }
      );
    }

    if (!postcode || !city || !county || !service_areas || service_areas.length === 0) {
      return NextResponse.json(
        { error: 'Area/Location, city, state, and at least one service area are required' },
        { status: 400 }
      );
    }

    // Security-specific validation
    if (service_category === 'security' || service_category === 'both') {
      if (!sia_licensed || !license_number || !licenses || licenses.length === 0) {
        return NextResponse.json(
          { error: 'Security license information is required for security professionals' },
          { status: 400 }
        );
      }
      if (!license_expiry) {
        return NextResponse.json(
          { error: 'License expiry date is required' },
          { status: 400 }
        );
      }
    }

    // Cleaning-specific validation
    if (service_category === 'cleaning' || service_category === 'both') {
      if (!dbs_check) {
        return NextResponse.json(
          { error: 'Background check consent is required for cleaning professionals' },
          { status: 400 }
        );
      }
    }

    if (!background_check) {
      return NextResponse.json(
        { error: 'Background check consent is required' },
        { status: 400 }
      );
    }

    if (!references || references.length === 0 || !references[0]?.name || !references[0]?.phone) {
      return NextResponse.json(
        { error: 'At least one complete reference is required' },
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

    // Determine role based on service category
    const userRole = service_category === 'security' ? 'security_staff' : 'staff';

    // Create user with appropriate role and vetting_status = 'pending'
    const [user] = await sql`
      INSERT INTO users (
        email, password_hash, role, service_category, first_name, last_name, phone,
        postcode, city, county, country,
        service_areas, availability, experience_years, certifications, licenses,
        vetting_status, background_check_completed, dbs_check_completed, sia_licensed,
        license_number, license_expiry,
        references_data, emergency_contact_name, emergency_contact_phone,
        emergency_contact_relationship, application_notes
      )
      VALUES (
        ${email},
        ${passwordHash},
        ${userRole},
        ${service_category},
        ${first_name},
        ${last_name},
        ${phone},
        ${postcode},
        ${city},
        ${county || null},
        ${country || 'Nigeria'},
        ${JSON.stringify(service_areas)}::text[],
        ${JSON.stringify(availability)},
        ${experience_years ? parseInt(experience_years) : null},
        ${JSON.stringify(certifications || [])}::text[],
        ${JSON.stringify(licenses || [])}::text[],
        'pending',
        ${background_check || false},
        ${dbs_check || false},
        ${sia_licensed || false},
        ${license_number || null},
        ${license_expiry ? new Date(license_expiry) : null},
        ${JSON.stringify(references || [])},
        ${emergency_contact_name || null},
        ${emergency_contact_phone || null},
        ${emergency_contact_relationship || null},
        ${notes || null}
      )
      RETURNING id, email, role, service_category, first_name, last_name, vetting_status, created_at
    `;

    const serviceType = service_category === 'cleaning' 
      ? 'cleaning professional'
      : service_category === 'security'
      ? 'security professional'
      : 'cleaning and security professional';

    return NextResponse.json(
      {
        success: true,
        message: `Application submitted successfully as a ${serviceType}. You will be notified once your application is reviewed.`,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          service_category: user.service_category,
          first_name: user.first_name,
          last_name: user.last_name,
          vetting_status: user.vetting_status,
        },
        next_steps: [
          'Your application has been submitted for review',
          'Our team will verify your information and references',
          service_category === 'cleaning' || service_category === 'both'
            ? 'A comprehensive background check will be conducted if approved'
            : 'Your Security license will be verified',
          'You will receive an email notification with the result',
          'Once approved, you can start receiving job assignments in your selected service areas'
        ]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Staff registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
