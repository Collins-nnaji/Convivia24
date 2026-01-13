-- Additional Tables for Convivia24 Cleaning, Security & Drivers Platform
-- Run this after the main schema.sql

-- Security Incidents & Events Log
CREATE TABLE IF NOT EXISTS security_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('theft', 'vandalism', 'trespassing', 'disturbance', 'medical', 'fire', 'other')),
  severity VARCHAR(20) NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  location_address TEXT,
  occurred_at TIMESTAMP NOT NULL,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  action_taken TEXT,
  police_notified BOOLEAN DEFAULT false,
  police_reference VARCHAR(100),
  photos TEXT[], -- Array of photo URLs
  witnesses JSONB, -- Array of witness information
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_security_incidents_booking_id ON security_incidents(booking_id);
CREATE INDEX idx_security_incidents_staff_id ON security_incidents(staff_id);
CREATE INDEX idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX idx_security_incidents_occurred_at ON security_incidents(occurred_at);

-- Security Patrol Routes
CREATE TABLE IF NOT EXISTS security_patrol_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  route_path JSONB, -- Array of coordinates/checkpoints
  estimated_duration_minutes INTEGER,
  frequency VARCHAR(50), -- 'hourly', 'daily', 'weekly', etc.
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_security_patrol_routes_assigned_to ON security_patrol_routes(assigned_to);
CREATE INDEX idx_security_patrol_routes_is_active ON security_patrol_routes(is_active);

-- Security Patrol Logs
CREATE TABLE IF NOT EXISTS security_patrol_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES security_patrol_routes(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  checkpoints JSONB, -- Array of checkpoint data with timestamps
  observations TEXT,
  issues_found BOOLEAN DEFAULT false,
  issues_description TEXT,
  photos TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_security_patrol_logs_route_id ON security_patrol_logs(route_id);
CREATE INDEX idx_security_patrol_logs_staff_id ON security_patrol_logs(staff_id);
CREATE INDEX idx_security_patrol_logs_started_at ON security_patrol_logs(started_at);

-- Cleaning Checklists & Templates
CREATE TABLE IF NOT EXISTS cleaning_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  service_type VARCHAR(50), -- 'routine', 'deep', 'compliance', etc.
  items JSONB NOT NULL, -- Array of checklist items with descriptions
  estimated_duration_minutes INTEGER,
  is_template BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cleaning_checklists_service_type ON cleaning_checklists(service_type);
CREATE INDEX idx_cleaning_checklists_is_template ON cleaning_checklists(is_template);

-- Service Bundles/Packages
CREATE TABLE IF NOT EXISTS service_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  bundle_type VARCHAR(50) NOT NULL CHECK (bundle_type IN ('event', 'estate', 'residential', 'commercial', 'custom')),
  service_ids UUID[] NOT NULL, -- Array of service IDs included in bundle
  base_price DECIMAL(10, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0, -- Discount applied to bundle
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_bundles_bundle_type ON service_bundles(bundle_type);
CREATE INDEX idx_service_bundles_is_active ON service_bundles(is_active);

-- Reviews & Ratings
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  staff_id UUID REFERENCES users(id) ON DELETE SET NULL, -- If reviewing a specific staff member
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  service_category VARCHAR(20) CHECK (service_category IN ('cleaning', 'security', 'drivers', 'both', 'cleaning,security', 'cleaning,drivers', 'security,drivers', 'all')),
  photos TEXT[], -- Photos attached to review
  is_verified BOOLEAN DEFAULT false, -- Verified purchase
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_staff_id ON reviews(staff_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_service_category ON reviews(service_category);

-- Equipment & Assets
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('cleaning', 'security', 'general')),
  equipment_type VARCHAR(100), -- 'vacuum', 'camera', 'radio', etc.
  serial_number VARCHAR(100),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  location VARCHAR(255),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
  purchase_date DATE,
  warranty_expiry DATE,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_assigned_to ON equipment(assigned_to);
CREATE INDEX idx_equipment_status ON equipment(status);

-- Training Records
CREATE TABLE IF NOT EXISTS training_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  training_type VARCHAR(100) NOT NULL, -- 'SIA License', 'DBS Check', 'Health & Safety', etc.
  training_provider VARCHAR(255),
  certificate_number VARCHAR(100),
  completed_date DATE NOT NULL,
  expiry_date DATE,
  is_valid BOOLEAN DEFAULT true,
  certificate_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_training_records_staff_id ON training_records(staff_id);
CREATE INDEX idx_training_records_training_type ON training_records(training_type);
CREATE INDEX idx_training_records_expiry_date ON training_records(expiry_date);
CREATE INDEX idx_training_records_is_valid ON training_records(is_valid);

-- Shift Schedules (for security staff)
CREATE TABLE IF NOT EXISTS shift_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shift_type VARCHAR(50) NOT NULL CHECK (shift_type IN ('day', 'night', 'overnight', 'weekend', 'event')),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location_address TEXT,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shift_schedules_staff_id ON shift_schedules(staff_id);
CREATE INDEX idx_shift_schedules_start_time ON shift_schedules(start_time);
CREATE INDEX idx_shift_schedules_status ON shift_schedules(status);
CREATE INDEX idx_shift_schedules_booking_id ON shift_schedules(booking_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'booking_assigned', 'booking_completed', 'payment_received', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_entity_type VARCHAR(50), -- 'booking', 'invoice', 'review', etc.
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  action_url VARCHAR(500), -- URL to navigate when notification is clicked
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Triggers for updated_at
CREATE TRIGGER update_security_incidents_updated_at BEFORE UPDATE ON security_incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_patrol_routes_updated_at BEFORE UPDATE ON security_patrol_routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cleaning_checklists_updated_at BEFORE UPDATE ON cleaning_checklists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_bundles_updated_at BEFORE UPDATE ON service_bundles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_records_updated_at BEFORE UPDATE ON training_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shift_schedules_updated_at BEFORE UPDATE ON shift_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vehicles Table (for driver services)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER,
  color VARCHAR(50),
  plate_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('sedan', 'suv', 'van', 'truck', 'motorcycle', 'luxury', 'bus')),
  capacity INTEGER, -- Number of passengers
  fuel_type VARCHAR(20) CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid')),
  insurance_provider VARCHAR(255),
  insurance_policy_number VARCHAR(100),
  insurance_expiry DATE,
  registration_expiry DATE,
  roadworthiness_expiry DATE,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  photos TEXT[], -- Array of vehicle photo URLs
  documents JSONB, -- Insurance, registration, roadworthiness documents
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX idx_vehicles_vehicle_type ON vehicles(vehicle_type);
CREATE INDEX idx_vehicles_is_active ON vehicles(is_active);
CREATE INDEX idx_vehicles_is_verified ON vehicles(is_verified);

-- Driver Trip Logs
CREATE TABLE IF NOT EXISTS driver_trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  trip_type VARCHAR(50) NOT NULL CHECK (trip_type IN ('short_term', 'long_term', 'event', 'chauffeur', 'corporate', 'emergency')),
  start_location TEXT NOT NULL,
  end_location TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  distance_km DECIMAL(8, 2),
  duration_minutes INTEGER,
  fare DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  client_feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_driver_trips_booking_id ON driver_trips(booking_id);
CREATE INDEX idx_driver_trips_driver_id ON driver_trips(driver_id);
CREATE INDEX idx_driver_trips_vehicle_id ON driver_trips(vehicle_id);
CREATE INDEX idx_driver_trips_status ON driver_trips(status);
CREATE INDEX idx_driver_trips_start_time ON driver_trips(start_time);

-- Triggers for new tables
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_trips_updated_at BEFORE UPDATE ON driver_trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
