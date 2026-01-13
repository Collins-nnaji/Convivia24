import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      service_category, // 'cleaning', 'security', 'drivers', 'both', or combinations
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
      licenses, // Security licenses or driver licenses
      license_number, // SIA license number
      license_expiry, // License expiry date
      sia_licensed,
      background_check,
      dbs_check,
      references,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      notes,
      // Driver-specific fields
      drivers_license_number,
      drivers_license_expiry,
      vehicle_owned,
      vehicle_type,
      years_driving_experience
    } = body;

    // Validation
    const validCategories = ['cleaning', 'security', 'drivers', 'both', 'cleaning,security', 'cleaning,drivers', 'security,drivers', 'all'];
    if (!service_category || !validCategories.includes(service_category)) {
      return NextResponse.json(
        { error: 'Service category is required. Valid options: cleaning, security, drivers, both, or combinations' },
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
    if (service_category === 'security' || service_category === 'both' || service_category?.includes('security')) {
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

    // Driver-specific validation
    if (service_category === 'drivers' || service_category?.includes('drivers')) {
      if (!drivers_license_number || !drivers_license_expiry) {
        return NextResponse.json(
          { error: 'Driver license number and expiry date are required for driver professionals' },
          { status: 400 }
        );
      }
      if (!years_driving_experience) {
        return NextResponse.json(
          { error: 'Years of driving experience is required' },
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
    let userRole = 'staff';
    if (service_category === 'security' || service_category?.includes('security')) {
      userRole = 'security_staff';
    } else if (service_category === 'drivers' || service_category?.includes('drivers')) {
      userRole = 'staff'; // Drivers use 'staff' role for now, can be extended later
    }

    // Create user with appropriate role and vetting_status = 'pending'
    const [user] = await sql`
      INSERT INTO users (
        email, password_hash, role, service_category, first_name, last_name, phone,
        postcode, city, county, country,
        service_areas, availability, experience_years, certifications, licenses,
        vetting_status, background_check_completed, dbs_check_completed, sia_licensed,
        license_number, license_expiry,
        drivers_license_number, drivers_license_expiry, vehicle_owned, vehicle_type, years_driving_experience,
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
        ${drivers_license_number || null},
        ${drivers_license_expiry ? new Date(drivers_license_expiry) : null},
        ${vehicle_owned || false},
        ${vehicle_type || null},
        ${years_driving_experience ? parseInt(years_driving_experience) : null},
        ${JSON.stringify(references || [])},
        ${emergency_contact_name || null},
        ${emergency_contact_phone || null},
        ${emergency_contact_relationship || null},
        ${notes || null}
      )
      RETURNING id, email, role, service_category, first_name, last_name, vetting_status, created_at
    `;

    let serviceType = 'professional';
    if (service_category === 'cleaning') {
      serviceType = 'cleaning professional';
    } else if (service_category === 'security') {
      serviceType = 'security professional';
    } else if (service_category === 'drivers') {
      serviceType = 'driver professional';
    } else if (service_category === 'both') {
      serviceType = 'cleaning and security professional';
    } else if (service_category?.includes('drivers')) {
      serviceType = 'driver professional';
      if (service_category?.includes('cleaning')) serviceType += ' and cleaning professional';
      if (service_category?.includes('security')) serviceType += ' and security professional';
    } else {
      serviceType = 'multi-service professional';
    }

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
