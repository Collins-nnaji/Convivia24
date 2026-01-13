-- Convivia 24 Cleaning Services Platform Database Schema
-- Neon PostgreSQL
-- Note: Run database/cleanup_old_tables.sql first to drop old tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses table (client companies) - MUST BE CREATED FIRST (no dependencies)
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Nigeria',
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  industry VARCHAR(100),
  size VARCHAR(50), -- e.g., 'small', 'medium', 'large'
  preferred_hours TEXT, -- JSON array of preferred time slots
  special_requirements TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_businesses_name ON businesses(name);
CREATE INDEX idx_businesses_email ON businesses(email);
CREATE INDEX idx_businesses_is_active ON businesses(is_active);

-- Users table (authentication + role management) - DEPENDS ON businesses
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'staff', 'security_staff', 'supervisor', 'admin')),
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  -- Staff-specific fields (for staff/security_staff roles)
  service_category VARCHAR(20) CHECK (service_category IN ('cleaning', 'security', 'drivers', 'both', 'cleaning,security', 'cleaning,drivers', 'security,drivers', 'all')), -- What service they provide
  postcode VARCHAR(20),
  city VARCHAR(100),
  county VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Nigeria',
  service_areas TEXT[], -- Array of areas they can work in
  availability JSONB, -- Weekly availability schedule
  experience_years INTEGER,
  certifications TEXT[], -- Array of certifications
  licenses TEXT[], -- Security licenses (SIA, etc.) or Driver licenses
  vetting_status VARCHAR(20) DEFAULT 'pending' CHECK (vetting_status IN ('pending', 'approved', 'rejected', 'on_hold')),
  vetting_notes TEXT,
  background_check_completed BOOLEAN DEFAULT false,
  background_check_date TIMESTAMP,
  dbs_check_completed BOOLEAN DEFAULT false, -- DBS check for cleaning staff
  sia_licensed BOOLEAN DEFAULT false, -- SIA license for security staff
  license_number VARCHAR(100), -- License number for security staff or driver's license
  license_expiry DATE, -- License expiry date
  -- Driver-specific fields
  drivers_license_number VARCHAR(100), -- Driver's license number
  drivers_license_expiry DATE, -- Driver's license expiry
  vehicle_owned BOOLEAN DEFAULT false, -- Does driver own a vehicle
  vehicle_type VARCHAR(50), -- 'sedan', 'suv', 'van', 'truck', 'motorcycle'
  years_driving_experience INTEGER, -- Years of driving experience
  references_data JSONB, -- Array of references
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(100),
  application_notes TEXT,
  incident_history JSONB, -- Incident reporting for security staff
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_business_id ON users(business_id);
CREATE INDEX idx_users_vetting_status ON users(vetting_status);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_users_postcode ON users(postcode);

-- Services table (service catalog - Cleaning, Security & Drivers)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('cleaning', 'security', 'drivers', 'bundle')), -- Vertical: cleaning, security, drivers, or bundle
  type VARCHAR(50) NOT NULL, -- Service type within category (no check constraint - flexible)
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  pricing_model VARCHAR(20) CHECK (pricing_model IN ('hourly', 'fixed', 'per_sqm', 'daily', 'monthly', 'event')),
  duration_hours DECIMAL(4, 2), -- Expected duration
  frequency_options TEXT, -- JSON array of frequency options
  requires_licensing BOOLEAN DEFAULT false, -- For security services
  requires_certification BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_type ON services(type);
CREATE INDEX idx_services_is_active ON services(is_active);

-- Bookings table (service requests/jobs)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  urgency VARCHAR(20) NOT NULL DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergency')),
  priority INTEGER DEFAULT 0, -- 0 = normal, higher = more priority
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP,
  actual_start TIMESTAMP,
  actual_end TIMESTAMP,
  location_address TEXT NOT NULL,
  special_instructions TEXT,
  total_cost DECIMAL(10, 2) DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_business_id ON bookings(business_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_urgency ON bookings(urgency);
CREATE INDEX idx_bookings_scheduled_start ON bookings(scheduled_start);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Staff assignments table (job allocation)
CREATE TABLE IF NOT EXISTS staff_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'started', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_assignments_booking_id ON staff_assignments(booking_id);
CREATE INDEX idx_staff_assignments_staff_id ON staff_assignments(staff_id);
CREATE INDEX idx_staff_assignments_status ON staff_assignments(status);
CREATE INDEX idx_staff_assignments_supervisor_id ON staff_assignments(supervisor_id);

-- Compliance logs table (quality checks & verification)
CREATE TABLE IF NOT EXISTS compliance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  checked_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  checklist_items JSONB, -- JSON array of checklist items with status
  photos TEXT[], -- Array of photo URLs
  sign_off BOOLEAN DEFAULT false,
  signature_url VARCHAR(500),
  verified_at TIMESTAMP,
  non_compliance_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_compliance_logs_booking_id ON compliance_logs(booking_id);
CREATE INDEX idx_compliance_logs_checked_by ON compliance_logs(checked_by);
CREATE INDEX idx_compliance_logs_sign_off ON compliance_logs(sign_off);

-- Invoices table (billing)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_booking_id ON invoices(booking_id);
CREATE INDEX idx_invoices_business_id ON invoices(business_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_assignments_updated_at BEFORE UPDATE ON staff_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_logs_updated_at BEFORE UPDATE ON compliance_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed initial services data - Cleaning, Security & Drivers (Nigeria-focused pricing in NGN)
-- Cleaning Services
INSERT INTO services (name, category, type, description, base_price, pricing_model, duration_hours, frequency_options, requires_licensing, requires_certification) VALUES
  ('Home Cleaning', 'cleaning', 'routine', 'Routine home cleaning including floors, bathrooms, and common areas. Instant pricing: ₦15,000–₦50,000 based on property size.', 15000, 'fixed', 3.0, '["weekly", "bi-weekly", "monthly"]', false, false),
  ('Commercial Office Cleaning', 'cleaning', 'routine', 'Daily/weekly office cleaning including floors, restrooms, and common areas. Perfect for businesses.', 25000, 'fixed', 4.0, '["daily", "weekly", "bi-weekly", "monthly"]', false, false),
  ('Deep Cleaning & Disinfection', 'cleaning', 'deep', 'Comprehensive deep cleaning with fumigation and high-touch sanitation. End-of-tenancy speciality. ₦50,000–₦350,000.', 50000, 'fixed', 6.0, '["quarterly", "one-time"]', false, true),
  ('Estate Sanitation', 'cleaning', 'compliance', 'Regular sanitation for gated communities and estates. Compliance-ready with audit trails. Monthly retainers available.', 80000, 'monthly', 8.0, '["monthly", "quarterly"]', false, true),
  ('Emergency Cleaning Response', 'cleaning', 'rapid', 'Same-day response for emergencies like spills, overflows, and biohazards. ₦20,000–₦100,000.', 20000, 'hourly', 2.0, '[]', false, false),
  ('Night & After-Hours Cleaning', 'cleaning', 'night', 'Overnight cleaning services with silent protocols. Perfect for businesses that operate 24/7.', 30000, 'hourly', 4.0, '["daily", "weekly", "one-time"]', false, false)
ON CONFLICT DO NOTHING;

-- Security Services
INSERT INTO services (name, category, type, description, base_price, pricing_model, duration_hours, frequency_options, requires_licensing, requires_certification) VALUES
  ('Event Security', 'security', 'event', 'Licensed security guards for events, parties, and gatherings. Hourly rates from ₦3,000/hr per guard. Minimum 4 hours.', 3000, 'hourly', 4.0, '[]', true, true),
  ('Office & Night Guards', 'security', 'commercial', 'Dedicated security for offices, warehouses, and commercial properties. Monthly retainers from ₦300,000/month.', 300000, 'monthly', 168.0, '["monthly"]', true, true),
  ('Estate Patrols', 'security', 'estate', 'Regular patrols for gated communities and estates. Mobile security teams. Monthly contracts. ₦400,000–₦1,000,000/month.', 400000, 'monthly', 730.0, '["monthly"]', true, true)
ON CONFLICT DO NOTHING;

-- Driver Services (Nigeria-focused pricing in NGN)
INSERT INTO services (name, category, type, description, base_price, pricing_model, duration_hours, frequency_options, requires_licensing, requires_certification) VALUES
  ('Short-Term Driver Hire', 'drivers', 'short_term', 'Professional drivers for daily, weekly, or monthly assignments. Perfect for business trips, events, or temporary needs. ₦5,000–₦15,000/day.', 5000, 'daily', 8.0, '["daily", "weekly", "monthly"]', true, true),
  ('Long-Term Driver Hire', 'drivers', 'long_term', 'Dedicated drivers for extended periods (3+ months). Ideal for executives, families, or businesses. Monthly retainers from ₦120,000/month.', 120000, 'monthly', 240.0, '["monthly", "quarterly", "yearly"]', true, true),
  ('Event Driver Service', 'drivers', 'event', 'Professional drivers for events, weddings, corporate functions. Hourly or per-event pricing. ₦3,000–₦8,000/hour.', 3000, 'hourly', 4.0, '[]', true, true),
  ('Chauffeur Service', 'drivers', 'premium', 'Premium chauffeur service with luxury vehicles. Perfect for VIP transport, airport transfers, and special occasions. ₦8,000–₦20,000/trip.', 8000, 'fixed', 2.0, '[]', true, true),
  ('Corporate Fleet Driver', 'drivers', 'corporate', 'Professional drivers for corporate fleets. Background-checked, uniformed, and reliable. Monthly contracts available.', 150000, 'monthly', 200.0, '["monthly"]', true, true),
  ('Emergency Driver Service', 'drivers', 'emergency', 'On-demand driver service for urgent needs. Available 24/7. Same-day booking. ₦10,000–₦25,000/day.', 10000, 'daily', 8.0, '[]', true, false)
ON CONFLICT DO NOTHING;

-- Bundle Packages (Improved - combining all three services)
INSERT INTO services (name, category, type, description, base_price, pricing_model, duration_hours, frequency_options, requires_licensing, requires_certification) VALUES
  ('Clean + Secure Event Package', 'bundle', 'event', 'Complete event solution: venue cleaning + security guards. Perfect for weddings, corporate events, and parties. Save 15%.', 100000, 'event', 8.0, '[]', true, false),
  ('Estate Complete Care Package', 'bundle', 'estate', 'Full estate management: cleaning, security patrols, and driver services. Monthly retainers. Save 20%.', 800000, 'monthly', 730.0, '["monthly"]', true, false),
  ('Corporate Office Complete', 'bundle', 'corporate', 'All-in-one office solution: daily cleaning, security guards, and corporate drivers. Perfect for businesses. Save 18%.', 500000, 'monthly', 730.0, '["monthly"]', true, false),
  ('Event Premium Package', 'bundle', 'premium_event', 'Ultimate event package: cleaning, security, and chauffeur service. Perfect for high-end events. Save 25%.', 250000, 'event', 12.0, '[]', true, false),
  ('Move-In Complete Package', 'bundle', 'residential', 'Complete move-in solution: deep cleaning, security setup, and driver assistance. One-time package. Save 20%.', 200000, 'fixed', 8.0, '[]', true, false)
ON CONFLICT DO NOTHING;
