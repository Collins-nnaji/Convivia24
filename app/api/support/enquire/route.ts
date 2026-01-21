import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const databaseUrl = process.env.DATABASE_URL;

export async function POST(request: NextRequest) {
  try {
    // Check if database URL is configured
    if (!databaseUrl) {
      console.error('DATABASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Create Neon serverless client
    const sql = neon(databaseUrl);

    // Insert into enquiries table
    const result = await sql`
      INSERT INTO enquiries (name, email, subject, message, status)
      VALUES (${name.trim()}, ${email.trim()}, ${subject.trim()}, ${message.trim()}, 'PENDING')
      RETURNING id, name, email, subject, message, status, "createdAt"
    `;

    if (!result || result.length === 0) {
      throw new Error('Failed to insert enquiry');
    }

    return NextResponse.json(
      { success: true, message: 'Enquiry submitted successfully', data: result[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    // Provide more specific error message for table not found
    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Database table not found. Please ensure the enquiries table exists.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
