-- Chat inquiries: one row per live-chat session, full conversation stored as JSONB.
-- Run this on your Neon DB (e.g. in SQL Editor) so /api/chat and /api/inquiries/save work.

CREATE TABLE IF NOT EXISTS "chat_inquiries" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT,
  "email" TEXT,
  "subject" TEXT,
  "messages" JSONB NOT NULL DEFAULT '[]',
  "status" TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_inquiries_email ON "chat_inquiries"("email");
CREATE INDEX IF NOT EXISTS idx_chat_inquiries_status ON "chat_inquiries"("status");
CREATE INDEX IF NOT EXISTS idx_chat_inquiries_createdAt ON "chat_inquiries"("createdAt");
