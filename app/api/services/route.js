import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { authenticate } from '@/lib/auth';

// GET all services (public, but can filter by type)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('is_active') !== 'false';

    const category = searchParams.get('category');

    // Check if database is available
    if (!sql) {
      // Return mock services data with categories (Cleaning & Security)
      const mockServices = [
        // Cleaning Services
        {
          id: 'mock-service-1',
          name: 'Home Cleaning',
          category: 'cleaning',
          type: 'routine',
          description: 'Routine home cleaning including floors, bathrooms, and common areas',
          base_price: 120,
          pricing_model: 'fixed',
          duration_hours: 3.0,
          frequency_options: '["weekly", "bi-weekly", "monthly"]',
          requires_licensing: false,
          requires_certification: false,
          is_active: true,
        },
        {
          id: 'mock-service-2',
          name: 'Deep Cleaning & Disinfection',
          category: 'cleaning',
          type: 'deep',
          description: 'Comprehensive deep cleaning with fumigation and high-touch sanitation',
          base_price: 350,
          pricing_model: 'fixed',
          duration_hours: 6.0,
          frequency_options: '["quarterly", "one-time"]',
          requires_licensing: false,
          requires_certification: true,
          is_active: true,
        },
        {
          id: 'mock-service-3',
          name: 'Emergency Cleaning Response',
          category: 'cleaning',
          type: 'rapid',
          description: 'Same-day response for emergencies like spills, overflows, and biohazards',
          base_price: 180,
          pricing_model: 'hourly',
          duration_hours: 2.0,
          frequency_options: '[]',
          requires_licensing: false,
          requires_certification: false,
          is_active: true,
        },
        // Security Services
        {
          id: 'mock-service-4',
          name: 'Event Security',
          category: 'security',
          type: 'event',
          description: 'Licensed security guards for events, parties, and gatherings',
          base_price: 25,
          pricing_model: 'hourly',
          duration_hours: 4.0,
          frequency_options: '[]',
          requires_licensing: true,
          requires_certification: true,
          is_active: true,
        },
        // Bundle Packages
        {
          id: 'mock-service-7',
          name: 'Clean + Secure Event Package',
          category: 'bundle',
          type: 'event',
          description: 'Complete event solution: venue cleaning + security guards. Save 15%.',
          base_price: 800,
          pricing_model: 'event',
          duration_hours: 8.0,
          frequency_options: '[]',
          requires_licensing: true,
          requires_certification: false,
          is_active: true,
        },
      ];

      let filteredServices = mockServices;
      if (category && category !== 'all') {
        filteredServices = filteredServices.filter(s => s.category === category);
      }
      if (type) {
        filteredServices = filteredServices.filter(s => s.type === type);
      }
      if (isActive) {
        filteredServices = filteredServices.filter(s => s.is_active);
      }

      return NextResponse.json({ services: filteredServices });
    }

    let query = sql`
      SELECT * FROM services
      WHERE ${isActive ? sql`is_active = true` : sql`1=1`}
      ${category && category !== 'all' ? sql`AND category = ${category}` : sql``}
      ${type ? sql`AND type = ${type}` : sql``}
      ORDER BY category, type, name
    `;

    const services = await query;

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Get services error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST create new service (admin only)
export async function POST(request) {
  try {
    const authResult = await authenticate(request);
    
    if (authResult.error || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      category,
      type,
      description,
      base_price,
      pricing_model,
      duration_hours,
      frequency_options,
      requires_licensing,
      requires_certification,
    } = body;

    if (!name || !category || !type || !base_price) {
      return NextResponse.json(
        { error: 'Name, category, type, and base_price are required' },
        { status: 400 }
      );
    }

    if (!['cleaning', 'security', 'bundle'].includes(category)) {
      return NextResponse.json(
        { error: 'Category must be cleaning, security, or bundle' },
        { status: 400 }
      );
    }

    const [service] = await sql`
      INSERT INTO services (
        name, category, type, description, base_price, pricing_model, duration_hours, 
        frequency_options, requires_licensing, requires_certification
      )
      VALUES (
        ${name},
        ${category},
        ${type},
        ${description || null},
        ${base_price},
        ${pricing_model || 'fixed'},
        ${duration_hours || null},
        ${frequency_options ? JSON.stringify(frequency_options) : null},
        ${requires_licensing || false},
        ${requires_certification || false}
      )
      RETURNING *
    `;

    if (service.frequency_options && typeof service.frequency_options === 'string') {
      service.frequency_options = JSON.parse(service.frequency_options);
    }

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
