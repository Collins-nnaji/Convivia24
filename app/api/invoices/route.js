import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { authenticate } from '@/lib/auth';

// GET invoices (role-based filtering)
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
      // Return mock invoice data
      const mockInvoices = [
        {
          id: 'mock-invoice-1',
          booking_id: 'mock-3',
          business_id: 'mock-business-3',
          invoice_number: 'INV-2024-001',
          amount: 50000,
          tax: 3750,
          total: 53750,
          due_date: new Date(Date.now() + 2592000000).toISOString().split('T')[0],
          status: 'paid',
          paid_at: new Date(Date.now() - 172800000).toISOString(),
          booking_status: 'completed',
          service_name: 'Deep Cleaning & Sanitation Reset',
          business_name: 'Finance Hub Ltd',
          created_at: new Date(Date.now() - 259200000).toISOString(),
        },
        {
          id: 'mock-invoice-2',
          booking_id: 'mock-1',
          business_id: 'mock-business-1',
          invoice_number: 'INV-2024-002',
          amount: 15000,
          tax: 1125,
          total: 16125,
          due_date: new Date(Date.now() + 2592000000).toISOString().split('T')[0],
          status: 'sent',
          paid_at: null,
          booking_status: 'pending',
          service_name: 'Routine Commercial Cleaning',
          business_name: 'TechCorp Nigeria',
          created_at: new Date().toISOString(),
        },
      ];

      let filteredInvoices = mockInvoices;
      if (user.role === 'client') {
        filteredInvoices = filteredInvoices.filter(i => i.business_id === user.business_id);
      }
      if (status && status !== 'all') {
        filteredInvoices = filteredInvoices.filter(i => i.status === status);
      }

      return NextResponse.json({ invoices: filteredInvoices });
    }

    let query;

    if (user.role === 'admin') {
      query = sql`
        SELECT 
          i.*,
          b.id as booking_id,
          b.status as booking_status,
          b.service_id,
          bs.name as business_name,
          s.name as service_name
        FROM invoices i
        LEFT JOIN bookings b ON i.booking_id = b.id
        LEFT JOIN businesses bs ON i.business_id = bs.id
        LEFT JOIN services s ON b.service_id = s.id
        WHERE 1=1
        ${status ? sql`AND i.status = ${status}` : sql``}
        ${business_id ? sql`AND i.business_id = ${business_id}` : sql``}
        ORDER BY i.created_at DESC
        LIMIT 100
      `;
    } else if (user.role === 'client') {
      query = sql`
        SELECT 
          i.*,
          b.id as booking_id,
          b.status as booking_status,
          b.service_id,
          bs.name as business_name,
          s.name as service_name
        FROM invoices i
        LEFT JOIN bookings b ON i.booking_id = b.id
        LEFT JOIN businesses bs ON i.business_id = bs.id
        LEFT JOIN services s ON b.service_id = s.id
        WHERE i.business_id = ${user.business_id}
        ${status ? sql`AND i.status = ${status}` : sql``}
        ORDER BY i.created_at DESC
      `;
    } else {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const invoices = await query;

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// PATCH update invoice status (admin only, for marking as paid)
export async function PATCH(request) {
  try {
    const authResult = await authenticate(request);

    if (authResult.error || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, status, paid_at } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Invoice ID and status are required' },
        { status: 400 }
      );
    }

    const [invoice] = await sql`
      UPDATE invoices
      SET 
        status = ${status},
        paid_at = ${status === 'paid' ? (paid_at || new Date().toISOString()) : null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Update invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}
