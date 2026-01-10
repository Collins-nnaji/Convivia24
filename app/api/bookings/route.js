import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { authenticate, requireRole } from '@/lib/auth';

// GET all bookings (role-based filtering)
export async function GET(request) {
  try {
    const authResult = await authenticate(request);

    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const business_id = searchParams.get('business_id');

    // Check if database is available
    if (!sql) {
      // Return mock data for development
      const mockBookings = [
        {
          id: 'mock-1',
          business_id: 'mock-business-1',
          service_id: 'mock-service-1',
          requested_by: user.id,
          status: 'pending',
          urgency: 'routine',
          scheduled_start: new Date(Date.now() + 86400000).toISOString(),
          scheduled_end: new Date(Date.now() + 86400000 + 14400000).toISOString(),
          location_address: '123 Main Street, Lagos',
          special_instructions: 'Please use eco-friendly cleaning products',
          total_cost: 15000,
          payment_status: 'pending',
          business_name: 'TechCorp Nigeria',
          service_name: 'Routine Commercial Cleaning',
          service_type: 'routine',
          requested_by_email: 'client@techcorp.com',
          requested_by_first_name: 'John',
          requested_by_last_name: 'Doe',
          created_at: new Date().toISOString(),
        },
        {
          id: 'mock-2',
          business_id: 'mock-business-2',
          service_id: 'mock-service-2',
          requested_by: user.id,
          status: 'in_progress',
          urgency: 'urgent',
          scheduled_start: new Date().toISOString(),
          scheduled_end: new Date(Date.now() + 7200000).toISOString(),
          location_address: '456 Business District, Abuja',
          special_instructions: null,
          total_cost: 35000,
          payment_status: 'pending',
          business_name: 'Healthcare Plus',
          service_name: 'Rapid Response & Emergency Cleaning',
          service_type: 'rapid',
          requested_by_email: 'admin@healthcare.com',
          requested_by_first_name: 'Sarah',
          requested_by_last_name: 'Johnson',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'mock-3',
          business_id: 'mock-business-3',
          service_id: 'mock-service-3',
          requested_by: user.id,
          status: 'completed',
          urgency: 'routine',
          scheduled_start: new Date(Date.now() - 172800000).toISOString(),
          scheduled_end: new Date(Date.now() - 172800000 + 28800000).toISOString(),
          actual_start: new Date(Date.now() - 172800000).toISOString(),
          actual_end: new Date(Date.now() - 172800000 + 28800000).toISOString(),
          location_address: '789 Corporate Plaza, Victoria Island',
          special_instructions: 'Deep clean required',
          total_cost: 50000,
          payment_status: 'paid',
          business_name: 'Finance Hub Ltd',
          service_name: 'Deep Cleaning & Sanitation Reset',
          service_type: 'deep',
          requested_by_email: 'facilities@financehub.com',
          requested_by_first_name: 'Michael',
          requested_by_last_name: 'Chen',
          created_at: new Date(Date.now() - 259200000).toISOString(),
        },
      ];

      // Filter mock data based on role
      let filteredBookings = mockBookings;
      if (user.role === 'client') {
        filteredBookings = mockBookings.filter(b => b.business_id === user.business_id);
      } else if (user.role === 'staff' || user.role === 'supervisor') {
        // Staff see assigned jobs
        filteredBookings = mockBookings.slice(0, 2);
      }

      if (status && status !== 'all') {
        filteredBookings = filteredBookings.filter(b => b.status === status);
      }

      return NextResponse.json({ bookings: filteredBookings });
    }

    let bookings;

    if (user.role === 'admin') {
      // Admin sees all bookings
      if (status && business_id) {
        bookings = await sql`
          SELECT 
            b.*,
            bs.name as business_name,
            s.name as service_name,
            s.type as service_type,
            u.email as requested_by_email,
            u.first_name as requested_by_first_name,
            u.last_name as requested_by_last_name
          FROM bookings b
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN services s ON b.service_id = s.id
          LEFT JOIN users u ON b.requested_by = u.id
          WHERE b.status = ${status} AND b.business_id = ${business_id}
          ORDER BY b.created_at DESC
          LIMIT 100
        `;
      } else if (status) {
        bookings = await sql`
          SELECT 
            b.*,
            bs.name as business_name,
            s.name as service_name,
            s.type as service_type,
            u.email as requested_by_email,
            u.first_name as requested_by_first_name,
            u.last_name as requested_by_last_name
          FROM bookings b
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN services s ON b.service_id = s.id
          LEFT JOIN users u ON b.requested_by = u.id
          WHERE b.status = ${status}
          ORDER BY b.created_at DESC
          LIMIT 100
        `;
      } else if (business_id) {
        bookings = await sql`
          SELECT 
            b.*,
            bs.name as business_name,
            s.name as service_name,
            s.type as service_type,
            u.email as requested_by_email,
            u.first_name as requested_by_first_name,
            u.last_name as requested_by_last_name
          FROM bookings b
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN services s ON b.service_id = s.id
          LEFT JOIN users u ON b.requested_by = u.id
          WHERE b.business_id = ${business_id}
          ORDER BY b.created_at DESC
          LIMIT 100
        `;
      } else {
        bookings = await sql`
          SELECT 
            b.*,
            bs.name as business_name,
            s.name as service_name,
            s.type as service_type,
            u.email as requested_by_email,
            u.first_name as requested_by_first_name,
            u.last_name as requested_by_last_name
          FROM bookings b
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN services s ON b.service_id = s.id
          LEFT JOIN users u ON b.requested_by = u.id
          ORDER BY b.created_at DESC
          LIMIT 100
        `;
      }
    } else if (user.role === 'client') {
      // Clients see only their business bookings
      if (status) {
        bookings = await sql`
          SELECT 
            b.*,
            bs.name as business_name,
            s.name as service_name,
            s.type as service_type,
            u.email as requested_by_email,
            u.first_name as requested_by_first_name,
            u.last_name as requested_by_last_name
          FROM bookings b
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN services s ON b.service_id = s.id
          LEFT JOIN users u ON b.requested_by = u.id
          WHERE b.business_id = ${user.business_id} AND b.status = ${status}
          ORDER BY b.created_at DESC
        `;
      } else {
        bookings = await sql`
          SELECT 
            b.*,
            bs.name as business_name,
            s.name as service_name,
            s.type as service_type,
            u.email as requested_by_email,
            u.first_name as requested_by_first_name,
            u.last_name as requested_by_last_name
          FROM bookings b
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN services s ON b.service_id = s.id
          LEFT JOIN users u ON b.requested_by = u.id
          WHERE b.business_id = ${user.business_id}
          ORDER BY b.created_at DESC
        `;
      }
    } else if (user.role === 'staff' || user.role === 'supervisor') {
      // Staff/supervisor see assigned jobs
      if (status) {
        bookings = await sql`
          SELECT DISTINCT
            b.*,
            bs.name as business_name,
            s.name as service_name,
            s.type as service_type,
            sa.status as assignment_status,
            sa.assigned_at
          FROM bookings b
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN services s ON b.service_id = s.id
          LEFT JOIN staff_assignments sa ON b.id = sa.booking_id
          WHERE (sa.staff_id = ${user.id} OR sa.supervisor_id = ${user.id}) AND b.status = ${status}
          ORDER BY b.scheduled_start DESC, b.created_at DESC
        `;
      } else {
        bookings = await sql`
          SELECT DISTINCT
            b.*,
            bs.name as business_name,
            s.name as service_name,
            s.type as service_type,
            sa.status as assignment_status,
            sa.assigned_at
          FROM bookings b
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN services s ON b.service_id = s.id
          LEFT JOIN staff_assignments sa ON b.id = sa.booking_id
          WHERE sa.staff_id = ${user.id} OR sa.supervisor_id = ${user.id}
          ORDER BY b.scheduled_start DESC, b.created_at DESC
        `;
      }
    } else {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST create new booking (clients only)
export async function POST(request) {
  try {
    const authResult = await authenticate(request);

    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    if (user.role !== 'client') {
      return NextResponse.json(
        { error: 'Only clients can create bookings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      service_id,
      urgency = 'routine',
      scheduled_start,
      scheduled_end,
      location_address,
      special_instructions,
      total_cost,
    } = body;

    if (!service_id || !location_address) {
      return NextResponse.json(
        { error: 'Service ID and location address are required' },
        { status: 400 }
      );
    }

    // Verify service exists
    const [service] = await sql`
      SELECT * FROM services WHERE id = ${service_id} AND is_active = true
    `;

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found or inactive' },
        { status: 404 }
      );
    }

    // Calculate cost if not provided
    let finalCost = total_cost || service.base_price;
    if (urgency === 'urgent') {
      finalCost = finalCost * 1.5; // 50% premium
    } else if (urgency === 'emergency') {
      finalCost = finalCost * 2; // 100% premium
    }

    // Create booking
    const [booking] = await sql`
      INSERT INTO bookings (
        business_id, service_id, requested_by, urgency, 
        scheduled_start, scheduled_end, location_address, 
        special_instructions, total_cost, status
      )
      VALUES (
        ${user.business_id},
        ${service_id},
        ${user.id},
        ${urgency},
        ${scheduled_start || null},
        ${scheduled_end || null},
        ${location_address},
        ${special_instructions || null},
        ${finalCost},
        ${urgency === 'emergency' ? 'pending' : 'pending'}
      )
      RETURNING *
    `;

    // Get full booking details
    const [fullBooking] = await sql`
      SELECT 
        b.*,
        bs.name as business_name,
        s.name as service_name,
        s.type as service_type,
        u.email as requested_by_email
      FROM bookings b
      LEFT JOIN businesses bs ON b.business_id = bs.id
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.requested_by = u.id
      WHERE b.id = ${booking.id}
    `;

    return NextResponse.json({ booking: fullBooking }, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
