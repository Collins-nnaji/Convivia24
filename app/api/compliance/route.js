import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/auth';

// POST create compliance log (supervisor/admin only)
export async function POST(request) {
  try {
    const requireSupervisorOrAdmin = requireRole('supervisor', 'admin');
    const authResult = await requireSupervisorOrAdmin(request);

    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const {
      booking_id,
      checklist_items,
      photos,
      sign_off,
      signature_url,
      non_compliance_notes,
    } = body;

    if (!booking_id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Verify booking exists
    const [booking] = await sql`
      SELECT * FROM bookings WHERE id = ${booking_id}
    `;

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Create compliance log
    const [complianceLog] = await sql`
      INSERT INTO compliance_logs (
        booking_id,
        checked_by,
        checklist_items,
        photos,
        sign_off,
        signature_url,
        non_compliance_notes,
        verified_at
      )
      VALUES (
        ${booking_id},
        ${authResult.user.id},
        ${checklist_items ? JSON.stringify(checklist_items) : null},
        ${photos ? photos : []},
        ${sign_off || false},
        ${signature_url || null},
        ${non_compliance_notes || null},
        ${sign_off ? new Date().toISOString() : null}
      )
      RETURNING *
    `;

    // Parse JSON fields
    if (complianceLog.checklist_items && typeof complianceLog.checklist_items === 'string') {
      complianceLog.checklist_items = JSON.parse(complianceLog.checklist_items);
    }

    // If signed off, update booking status to completed
    if (sign_off && booking.status !== 'completed') {
      await sql`
        UPDATE bookings
        SET status = 'completed', actual_end = CURRENT_TIMESTAMP
        WHERE id = ${booking_id}
      `;

      // Generate invoice
      const invoiceNumber = `INV-${Date.now()}-${booking_id.substring(0, 8)}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms

      await sql`
        INSERT INTO invoices (
          booking_id,
          business_id,
          invoice_number,
          amount,
          tax,
          total,
          due_date,
          status
        )
        VALUES (
          ${booking_id},
          ${booking.business_id},
          ${invoiceNumber},
          ${booking.total_cost},
          ${booking.total_cost * 0.075}, -- 7.5% VAT (adjust as needed)
          ${booking.total_cost * 1.075},
          ${dueDate.toISOString().split('T')[0]},
          'sent'
        )
      `;
    }

    return NextResponse.json({ compliance_log: complianceLog }, { status: 201 });
  } catch (error) {
    console.error('Create compliance log error:', error);
    return NextResponse.json(
      { error: 'Failed to create compliance log' },
      { status: 500 }
    );
  }
}

// GET compliance logs (filtered by role)
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
    
    if (!['admin', 'supervisor', 'client'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const booking_id = searchParams.get('booking_id');

    // Check if database is available
    if (!sql) {
      // Return mock compliance logs
      const mockLogs = [
        {
          id: 'mock-log-1',
          booking_id: booking_id || 'mock-3',
          checked_by: 'mock-supervisor-1',
          checked_by_first_name: 'Supervisor',
          checked_by_last_name: 'User',
          checked_by_email: 'supervisor@convivia24.com',
          checklist_items: [
            { id: 1, text: 'All floors swept and mopped', completed: true },
            { id: 2, text: 'Restrooms cleaned and sanitized', completed: true },
            { id: 3, text: 'Trash bins emptied', completed: true },
            { id: 4, text: 'High-touch surfaces disinfected', completed: true },
            { id: 5, text: 'Windows and glass surfaces cleaned', completed: true },
            { id: 6, text: 'Furniture dusted and arranged', completed: true },
          ],
          photos: [],
          sign_off: true,
          verified_at: new Date(Date.now() - 86400000).toISOString(),
          booking_status: 'completed',
          business_name: 'Finance Hub Ltd',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      let filteredLogs = mockLogs;
      if (booking_id) {
        filteredLogs = filteredLogs.filter(l => l.booking_id === booking_id);
      }
      if (user.role === 'client') {
        // Clients see only their business logs
        filteredLogs = filteredLogs.filter(l => l.business_id === user.business_id);
      }

      return NextResponse.json({ compliance_logs: filteredLogs });
    }

    let complianceLogs;

    if (user.role === 'admin' || user.role === 'supervisor') {
      if (booking_id) {
        complianceLogs = await sql`
          SELECT 
            cl.*,
            b.id as booking_id,
            b.status as booking_status,
            bs.name as business_name,
            u.email as checked_by_email,
            u.first_name as checked_by_first_name,
            u.last_name as checked_by_last_name
          FROM compliance_logs cl
          LEFT JOIN bookings b ON cl.booking_id = b.id
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN users u ON cl.checked_by = u.id
          WHERE cl.booking_id = ${booking_id}
          ORDER BY cl.created_at DESC
          LIMIT 100
        `;
      } else {
        complianceLogs = await sql`
          SELECT 
            cl.*,
            b.id as booking_id,
            b.status as booking_status,
            bs.name as business_name,
            u.email as checked_by_email,
            u.first_name as checked_by_first_name,
            u.last_name as checked_by_last_name
          FROM compliance_logs cl
          LEFT JOIN bookings b ON cl.booking_id = b.id
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN users u ON cl.checked_by = u.id
          ORDER BY cl.created_at DESC
          LIMIT 100
        `;
      }
    } else if (user.role === 'client') {
      if (booking_id) {
        complianceLogs = await sql`
          SELECT 
            cl.*,
            b.id as booking_id,
            b.status as booking_status,
            bs.name as business_name,
            u.email as checked_by_email
          FROM compliance_logs cl
          LEFT JOIN bookings b ON cl.booking_id = b.id
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN users u ON cl.checked_by = u.id
          WHERE b.business_id = ${user.business_id} AND cl.booking_id = ${booking_id}
          ORDER BY cl.created_at DESC
        `;
      } else {
        complianceLogs = await sql`
          SELECT 
            cl.*,
            b.id as booking_id,
            b.status as booking_status,
            bs.name as business_name,
            u.email as checked_by_email
          FROM compliance_logs cl
          LEFT JOIN bookings b ON cl.booking_id = b.id
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN users u ON cl.checked_by = u.id
          WHERE b.business_id = ${user.business_id}
          ORDER BY cl.created_at DESC
        `;
      }
    }

    // Parse JSON fields
    complianceLogs.forEach(log => {
      if (log.checklist_items && typeof log.checklist_items === 'string') {
        log.checklist_items = JSON.parse(log.checklist_items);
      }
    });

    return NextResponse.json({ compliance_logs: complianceLogs });
  } catch (error) {
    console.error('Get compliance logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance logs' },
      { status: 500 }
    );
  }
}
