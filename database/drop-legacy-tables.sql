-- One-time cleanup: tables present in Neon but unused by the app (no references in codebase).
-- Apply in Neon SQL Editor, or run the two DROP statements from a local script using DATABASE_URL.

DROP TABLE IF EXISTS chat_inquiries CASCADE;
DROP TABLE IF EXISTS support_enquiries CASCADE;
