-- Cleanup script: Drop old tables from previous platform
-- Run this before creating new schema

-- Drop tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS experiences CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any sequences related to these tables
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
DROP SEQUENCE IF EXISTS experiences_id_seq CASCADE;
DROP SEQUENCE IF EXISTS favorites_id_seq CASCADE;

-- Drop any views that might reference these tables
DROP VIEW IF EXISTS user_experiences CASCADE;
DROP VIEW IF EXISTS user_favorites CASCADE;

-- Drop any functions/triggers that might reference these tables
DROP FUNCTION IF EXISTS update_users_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_experiences_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_favorites_updated_at() CASCADE;

-- Verify tables are dropped (this will show any remaining)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Users table still exists';
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'experiences') THEN
        RAISE EXCEPTION 'Experiences table still exists';
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'favorites') THEN
        RAISE EXCEPTION 'Favorites table still exists';
    END IF;
    RAISE NOTICE 'All old tables successfully dropped';
END $$;
