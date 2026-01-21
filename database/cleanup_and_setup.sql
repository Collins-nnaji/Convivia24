-- SQL to clean up the database and set up support-only tables
-- This script drops all tables from the database and creates only an enquiries table for support requests.

-- 1. Drop all existing tables (in reverse dependency order to avoid foreign key issues)
DROP TABLE IF EXISTS "bookings" CASCADE;
DROP TABLE IF EXISTS "businesses" CASCADE;
DROP TABLE IF EXISTS "cleaning_checklists" CASCADE;
DROP TABLE IF EXISTS "compliance_logs" CASCADE;
DROP TABLE IF EXISTS "equipment" CASCADE;
DROP TABLE IF EXISTS "invoices" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "reviews" CASCADE;
DROP TABLE IF EXISTS "security_incidents" CASCADE;
DROP TABLE IF EXISTS "security_patrol_logs" CASCADE;
DROP TABLE IF EXISTS "security_patrol_routes" CASCADE;
DROP TABLE IF EXISTS "service_bundles" CASCADE;
DROP TABLE IF EXISTS "services" CASCADE;
DROP TABLE IF EXISTS "shift_schedules" CASCADE;
DROP TABLE IF EXISTS "staff_assignments" CASCADE;
DROP TABLE IF EXISTS "training_records" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- 2. Create the Enquiries table for the Support page
CREATE TABLE IF NOT EXISTS "enquiries" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_enquiries_email ON "enquiries"("email");
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON "enquiries"("status");
CREATE INDEX IF NOT EXISTS idx_enquiries_createdAt ON "enquiries"("createdAt");
