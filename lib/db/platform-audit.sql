-- Platform-wide activity. Auth credentials and request bodies are never stored here.
CREATE TABLE IF NOT EXISTS platform_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id text,
  actor_email text,
  actor_name text,
  category text NOT NULL CHECK (category IN ('auth','navigation','api')),
  action text NOT NULL,
  subject text,
  method text,
  status integer,
  duration_ms integer,
  event_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS platform_audit_time ON platform_audit(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS platform_audit_actor ON platform_audit(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS platform_audit_category ON platform_audit(category, created_at DESC);
CREATE TABLE IF NOT EXISTS platform_user_activity (
  user_id text PRIMARY KEY,
  email text NOT NULL,
  name text,
  first_seen_at timestamptz NOT NULL DEFAULT NOW(),
  last_seen_at timestamptz NOT NULL DEFAULT NOW(),
  last_path text
);
CREATE INDEX IF NOT EXISTS platform_user_activity_seen ON platform_user_activity(last_seen_at DESC);

-- Existing detailed ledgers remain the source of truth for recorded business changes.
CREATE OR REPLACE VIEW platform_audit_feed AS
SELECT 'platform:' || id::text AS id, actor_id, actor_email, actor_name, category,
  action, subject, method, status, duration_ms, '{}'::jsonb AS detail, created_at
FROM platform_audit
UNION ALL
SELECT 'admin:' || id::text, actor, NULL::text, NULL::text, 'admin',
  action, subject, NULL::text, NULL::integer, NULL::integer, detail, created_at
FROM admin_audit
UNION ALL
SELECT 'supplier:' || a.id::text, NULL::text, a.actor_label, NULL::text, 'supplier',
  a.action, COALESCE(a.sku_slug, a.order_id::text, s.name), NULL::text, NULL::integer, NULL::integer,
  a.detail || jsonb_build_object('supplier', s.name, 'actorKind', a.actor), a.created_at
FROM supplier_audit_log a LEFT JOIN suppliers s ON s.id = a.supplier_id
UNION ALL
SELECT 'inventory:' || id::text, NULL::text, actor_label, NULL::text, 'drinks',
  'inventory.' || reason, slug, NULL::text, NULL::integer, NULL::integer,
  jsonb_build_object('note', note, 'onHandChange', delta_on_hand, 'reservedChange', delta_reserved, 'actorKind', actor), created_at
FROM inventory_movements;
