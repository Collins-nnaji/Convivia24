-- One-time fix: set role = 'admin' for the two allowed admin emails (any case)
-- Run this in your Neon SQL editor if the Admin panel still doesn't show after the code fix.

UPDATE app_users
SET role = 'admin'
WHERE LOWER(TRIM(email)) IN (
  'collinsnnaji1@gmail.com',
  'speak2tojo@gmail.com'
);

-- Optional: normalize email to lowercase so future lookups match
-- UPDATE app_users SET email = LOWER(TRIM(email)) WHERE LOWER(TRIM(email)) IN ('collinsnnaji1@gmail.com', 'speak2tojo@gmail.com');
