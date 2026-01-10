-- Verification Script: Check if all tables exist
-- Run this after running schema.sql to verify table creation

-- List all tables in the public schema
SELECT 
    table_name,
    table_type
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY 
    table_name;

-- Count tables
SELECT 
    COUNT(*) as total_tables
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
    AND table_type = 'BASE TABLE';

-- Check specific tables we expect
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'businesses') THEN '✓ businesses exists'
        ELSE '✗ businesses MISSING'
    END as businesses_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN '✓ users exists'
        ELSE '✗ users MISSING'
    END as users_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services') THEN '✓ services exists'
        ELSE '✗ services MISSING'
    END as services_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN '✓ bookings exists'
        ELSE '✗ bookings MISSING'
    END as bookings_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_assignments') THEN '✓ staff_assignments exists'
        ELSE '✗ staff_assignments MISSING'
    END as staff_assignments_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'compliance_logs') THEN '✓ compliance_logs exists'
        ELSE '✗ compliance_logs MISSING'
    END as compliance_logs_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN '✓ invoices exists'
        ELSE '✗ invoices MISSING'
    END as invoices_status;
