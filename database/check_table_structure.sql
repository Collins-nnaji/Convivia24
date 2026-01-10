-- Check Table Structure and Relationships
-- Run this to verify table columns and foreign key relationships

-- Check businesses table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name = 'businesses'
ORDER BY 
    ordinal_position;

-- Check users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name = 'users'
ORDER BY 
    ordinal_position;

-- Check foreign key relationships
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Check indexes
SELECT
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
ORDER BY
    tablename, indexname;

-- Count records in each table (to see if seed data was inserted)
SELECT 
    'businesses' as table_name, COUNT(*) as row_count FROM businesses
UNION ALL
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 
    'services' as table_name, COUNT(*) as row_count FROM services
UNION ALL
SELECT 
    'bookings' as table_name, COUNT(*) as row_count FROM bookings
UNION ALL
SELECT 
    'staff_assignments' as table_name, COUNT(*) as row_count FROM staff_assignments
UNION ALL
SELECT 
    'compliance_logs' as table_name, COUNT(*) as row_count FROM compliance_logs
UNION ALL
SELECT 
    'invoices' as table_name, COUNT(*) as row_count FROM invoices
UNION ALL
SELECT 
    'security_incidents' as table_name, COUNT(*) as row_count FROM security_incidents
UNION ALL
SELECT 
    'security_patrol_routes' as table_name, COUNT(*) as row_count FROM security_patrol_routes
UNION ALL
SELECT 
    'security_patrol_logs' as table_name, COUNT(*) as row_count FROM security_patrol_logs
UNION ALL
SELECT 
    'cleaning_checklists' as table_name, COUNT(*) as row_count FROM cleaning_checklists
UNION ALL
SELECT 
    'service_bundles' as table_name, COUNT(*) as row_count FROM service_bundles
UNION ALL
SELECT 
    'reviews' as table_name, COUNT(*) as row_count FROM reviews
UNION ALL
SELECT 
    'equipment' as table_name, COUNT(*) as row_count FROM equipment
UNION ALL
SELECT 
    'training_records' as table_name, COUNT(*) as row_count FROM training_records
UNION ALL
SELECT 
    'shift_schedules' as table_name, COUNT(*) as row_count FROM shift_schedules
UNION ALL
SELECT 
    'notifications' as table_name, COUNT(*) as row_count FROM notifications
ORDER BY table_name;

-- Check if services seed data was inserted
SELECT 
    name,
    category,
    type,
    base_price,
    pricing_model,
    is_active
FROM 
    services
ORDER BY 
    category, type, name;
