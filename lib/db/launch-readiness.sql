-- Apply after the existing schema. Functions run within one PostgreSQL transaction.
CREATE TABLE IF NOT EXISTS order_stock_reservations (
  order_id uuid NOT NULL,
  slug text NOT NULL REFERENCES inventory(slug),
  qty integer NOT NULL CHECK (qty > 0),
  supplier_id uuid REFERENCES suppliers(id),
  state text NOT NULL DEFAULT 'reserved' CHECK (state IN ('reserved','released','consumed')),
  PRIMARY KEY (order_id, slug)
);

CREATE OR REPLACE FUNCTION c24_reserve_stock(p_order uuid, p_lines jsonb)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE item record; inv inventory%ROWTYPE; existing order_stock_reservations%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_order::text, 0));
  FOR item IN SELECT value->>'slug' AS slug, SUM((value->>'qty')::integer)::integer AS qty
    FROM jsonb_array_elements(p_lines) GROUP BY value->>'slug' ORDER BY value->>'slug'
  LOOP
    IF item.qty <= 0 THEN RAISE EXCEPTION 'Invalid stock quantity'; END IF;
    SELECT * INTO existing FROM order_stock_reservations WHERE order_id = p_order AND slug = item.slug;
    IF FOUND THEN
      IF existing.qty <> item.qty OR existing.state <> 'reserved' THEN RAISE EXCEPTION 'Reservation changed'; END IF;
      CONTINUE;
    END IF;
    SELECT * INTO inv FROM inventory WHERE slug = item.slug FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Product % has no managed stock', item.slug; END IF;
    IF NOT inv.active THEN RAISE EXCEPTION 'Product % is unavailable', inv.name; END IF;
    IF NOT inv.track_stock THEN CONTINUE; END IF;
    IF inv.on_hand - inv.reserved < item.qty THEN RAISE EXCEPTION '% does not have enough stock', inv.name; END IF;
    UPDATE inventory SET reserved = reserved + item.qty, updated_at = NOW() WHERE slug = item.slug;
    INSERT INTO order_stock_reservations(order_id, slug, qty) VALUES(p_order, item.slug, item.qty);
    INSERT INTO inventory_movements(slug, delta_reserved, reason, order_id, actor, note)
      VALUES(item.slug, item.qty, 'reserve', p_order, 'system', 'Order reservation');
  END LOOP;
  RETURN NULL;
EXCEPTION WHEN raise_exception THEN
  RETURN SQLERRM;
END;
$$;

CREATE OR REPLACE FUNCTION c24_assign_supplier(p_order uuid, p_supplier uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE item record;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_order::text, 0));
  PERFORM 1 FROM ritual_orders WHERE id = p_order AND status NOT IN ('cancelled','refunded','delivered','fulfilled') FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order cannot be assigned'; END IF;
  FOR item IN SELECT * FROM order_stock_reservations WHERE order_id = p_order AND state = 'reserved' ORDER BY slug FOR UPDATE
  LOOP
    IF item.supplier_id IS NOT DISTINCT FROM p_supplier THEN CONTINUE; END IF;
    IF p_supplier IS NOT NULL THEN
      UPDATE supplier_stock SET reserved = reserved + item.qty, updated_at = NOW()
        WHERE supplier_id = p_supplier AND slug = item.slug AND on_hand - reserved >= item.qty;
      IF NOT FOUND THEN RAISE EXCEPTION 'Supplier cannot fill %', item.slug; END IF;
    END IF;
    IF item.supplier_id IS NOT NULL THEN
      UPDATE supplier_stock SET reserved = reserved - item.qty, updated_at = NOW()
        WHERE supplier_id = item.supplier_id AND slug = item.slug;
    END IF;
    UPDATE order_stock_reservations SET supplier_id = p_supplier WHERE order_id = p_order AND slug = item.slug;
  END LOOP;
  UPDATE ritual_orders SET routed_supplier_id = p_supplier, updated_at = NOW() WHERE id = p_order;
END;
$$;

CREATE OR REPLACE FUNCTION c24_finish_stock(p_order uuid, p_consume boolean)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE item record;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_order::text, 0));
  FOR item IN SELECT * FROM order_stock_reservations WHERE order_id = p_order AND state = 'reserved' ORDER BY slug FOR UPDATE
  LOOP
    UPDATE inventory SET reserved = reserved - item.qty,
      on_hand = on_hand - CASE WHEN p_consume THEN item.qty ELSE 0 END, updated_at = NOW()
      WHERE slug = item.slug;
    IF item.supplier_id IS NOT NULL THEN
      UPDATE supplier_stock SET reserved = reserved - item.qty,
        on_hand = on_hand - CASE WHEN p_consume THEN item.qty ELSE 0 END, updated_at = NOW()
        WHERE supplier_id = item.supplier_id AND slug = item.slug;
    END IF;
    UPDATE order_stock_reservations SET state = CASE WHEN p_consume THEN 'consumed' ELSE 'released' END
      WHERE order_id = p_order AND slug = item.slug;
    INSERT INTO inventory_movements(slug, delta_on_hand, delta_reserved, reason, order_id, actor, note)
      VALUES(item.slug, CASE WHEN p_consume THEN -item.qty ELSE 0 END, -item.qty,
        CASE WHEN p_consume THEN 'fulfill' ELSE 'release' END, p_order, 'system', 'Reservation completed');
  END LOOP;
  IF p_consume THEN UPDATE ritual_orders SET stock_consumed = true WHERE id = p_order; END IF;
END;
$$;

-- Existing outstanding orders must be reconciled before switching to the reservation ledger.
-- Never infer supplier reservations or subtract stock automatically from incomplete historical records.
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS delivery_fee_ngn integer NOT NULL DEFAULT 0 CHECK (delivery_fee_ngn >= 0);
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS delivery_zone_id uuid;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS courier_reference text;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS tracking_url text;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS delivery_proof text;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS recipient_age_checked boolean NOT NULL DEFAULT false;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS courier_cost_ngn integer CHECK (courier_cost_ngn >= 0);

CREATE TABLE IF NOT EXISTS delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL CHECK (city IN ('Lagos','Abuja','Port Harcourt')),
  name text NOT NULL,
  fee_ngn integer NOT NULL CHECK (fee_ngn >= 0),
  estimate text NOT NULL,
  active boolean NOT NULL DEFAULT false,
  UNIQUE(city, name)
);
CREATE TABLE IF NOT EXISTS delivery_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  contact text,
  active boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor text NOT NULL,
  action text NOT NULL,
  subject text,
  detail jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE partner_outlets ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending'
  CHECK (approval_status IN ('pending','approved','suspended'));
ALTER TABLE partner_wholesale_orders ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'legacy_completed'
  CHECK (status IN ('legacy_completed','awaiting_payment','paid','packed','dispatched','delivered','cancelled','refunded'));
ALTER TABLE partner_wholesale_orders ALTER COLUMN status SET DEFAULT 'awaiting_payment';
ALTER TABLE partner_wholesale_orders ADD COLUMN IF NOT EXISTS payment_reference text;
ALTER TABLE partner_wholesale_orders ADD COLUMN IF NOT EXISTS tracking_reference text;
ALTER TABLE partner_wholesale_orders ADD COLUMN IF NOT EXISTS received_at timestamptz;
ALTER TABLE partner_wholesale_orders ADD COLUMN IF NOT EXISTS points_awarded boolean NOT NULL DEFAULT false;
ALTER TABLE reward_redemptions ADD COLUMN IF NOT EXISTS inventory_slug text;
ALTER TABLE reward_redemptions ADD COLUMN IF NOT EXISTS fulfillment_note text;

CREATE OR REPLACE FUNCTION c24_receive_wholesale(p_order uuid, p_outlet uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE purchase partner_wholesale_orders%ROWTYPE; item jsonb;
BEGIN
  SELECT * INTO purchase FROM partner_wholesale_orders WHERE id = p_order AND outlet_id = p_outlet FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF purchase.status = 'delivered' THEN RETURN; END IF;
  IF purchase.status <> 'dispatched' THEN RAISE EXCEPTION 'Only a dispatched order can be received'; END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(purchase.items) LOOP
    INSERT INTO partner_inventory(outlet_id, slug, on_hand) VALUES(p_outlet, item->>'slug', (item->>'qty')::integer)
      ON CONFLICT(outlet_id,slug) DO UPDATE SET on_hand = partner_inventory.on_hand + EXCLUDED.on_hand, updated_at = NOW();
  END LOOP;
  UPDATE partner_outlets SET points = points + purchase.points_earned, lifetime_points = lifetime_points + purchase.points_earned
    WHERE id = p_outlet;
  UPDATE partner_wholesale_orders SET status = 'delivered', received_at = NOW(), points_awarded = true WHERE id = p_order;
END;
$$;

CREATE OR REPLACE FUNCTION c24_redeem_reward(p_owner text, p_reward text, p_name text, p_category text,
  p_points integer, p_value integer, p_code text, p_slug text, p_tier integer)
RETURNS reward_redemptions LANGUAGE plpgsql AS $$
DECLARE redemption reward_redemptions%ROWTYPE; reserve_error text;
BEGIN
  UPDATE loyalty_members SET points = points - p_points, updated_at = NOW()
    WHERE owner_id = p_owner AND points >= p_points AND lifetime_points >= p_tier;
  IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient points or tier'; END IF;
  INSERT INTO reward_redemptions(owner_id,reward_id,reward_name,category,points_spent,value_ngn,code,inventory_slug)
    VALUES(p_owner,p_reward,p_name,p_category,p_points,p_value,p_code,p_slug) RETURNING * INTO redemption;
  IF p_slug IS NOT NULL THEN
    reserve_error := c24_reserve_stock(redemption.id, jsonb_build_array(jsonb_build_object('slug',p_slug,'qty',1)));
    IF reserve_error IS NOT NULL THEN RAISE EXCEPTION '%', reserve_error; END IF;
  END IF;
  RETURN redemption;
END;
$$;

CREATE OR REPLACE FUNCTION c24_finish_reward(p_id uuid, p_status text, p_note text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE redemption reward_redemptions%ROWTYPE;
BEGIN
  IF p_status NOT IN ('fulfilled','cancelled') THEN RAISE EXCEPTION 'Invalid reward status'; END IF;
  SELECT * INTO redemption FROM reward_redemptions WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Reward not found'; END IF;
  IF redemption.status = p_status THEN RETURN; END IF;
  IF redemption.status <> 'issued' THEN RAISE EXCEPTION 'Reward is already closed'; END IF;
  PERFORM c24_finish_stock(p_id, p_status = 'fulfilled');
  IF p_status = 'cancelled' THEN
    UPDATE loyalty_members SET points = points + redemption.points_spent, updated_at = NOW() WHERE owner_id = redemption.owner_id;
  END IF;
  UPDATE reward_redemptions SET status = p_status, fulfillment_note = p_note, updated_at = NOW() WHERE id = p_id;
END;
$$;

ALTER TABLE gift_cards ADD COLUMN IF NOT EXISTS balance_ngn integer;
UPDATE gift_cards SET balance_ngn = CASE WHEN status = 'redeemed' THEN 0 ELSE value_ngn END WHERE balance_ngn IS NULL;
ALTER TABLE gift_cards ALTER COLUMN balance_ngn SET NOT NULL;
ALTER TABLE gift_cards DROP CONSTRAINT IF EXISTS gift_cards_balance_ngn_check;
ALTER TABLE gift_cards ADD CONSTRAINT gift_cards_balance_ngn_check CHECK (balance_ngn >= 0 AND balance_ngn <= value_ngn);
ALTER TABLE gift_cards ALTER COLUMN balance_ngn SET DEFAULT 0;
CREATE TABLE IF NOT EXISTS order_gift_card_usage (
  order_id uuid PRIMARY KEY REFERENCES ritual_orders(id),
  gift_card_id uuid NOT NULL REFERENCES gift_cards(id),
  amount_ngn integer NOT NULL CHECK (amount_ngn > 0),
  restored boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS checkout_requests (
  owner_email text NOT NULL,
  request_key uuid NOT NULL,
  fingerprint text NOT NULL,
  order_id uuid NOT NULL REFERENCES ritual_orders(id),
  PRIMARY KEY(owner_email, request_key)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_flw_reference_unique ON ritual_orders(payment_ref)
  WHERE payment_provider = 'flutterwave' AND payment_ref IS NOT NULL;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS payment_expires_at timestamptz;

CREATE OR REPLACE FUNCTION c24_create_order(p_id uuid, p_email text, p_key uuid, p_fingerprint text,
  p_details jsonb, p_items jsonb, p_stock jsonb, p_discount integer, p_owner text, p_gift text)
RETURNS ritual_orders LANGUAGE plpgsql AS $$
DECLARE prior checkout_requests%ROWTYPE; purchase ritual_orders%ROWTYPE;
  zone delivery_zones%ROWTYPE; item jsonb; subtotal integer; stock_error text;
  card gift_cards%ROWTYPE; applied integer := 0;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_email || p_key::text, 0));
  SELECT * INTO prior FROM checkout_requests WHERE owner_email = p_email AND request_key = p_key;
  IF FOUND THEN
    IF prior.fingerprint <> p_fingerprint THEN RAISE EXCEPTION 'Checkout request changed; start a new checkout'; END IF;
    SELECT * INTO purchase FROM ritual_orders WHERE id = prior.order_id;
    RETURN purchase;
  END IF;
  SELECT * INTO zone FROM delivery_zones WHERE id = (p_details->>'deliveryZoneId')::uuid AND active FOR SHARE;
  IF NOT FOUND OR LOWER(zone.city) <> LOWER(p_details->>'city') THEN RAISE EXCEPTION 'Unsupported delivery zone'; END IF;
  SELECT SUM((value->>'unitPrice')::integer * (value->>'qty')::integer)::integer INTO subtotal FROM jsonb_array_elements(p_items);
  IF subtotal IS NULL OR subtotal <= 0 OR p_discount < 0 OR p_discount > subtotal THEN RAISE EXCEPTION 'Invalid order total'; END IF;
  INSERT INTO ritual_orders(id,email,full_name,phone,address_line1,address_line2,city,area,notes,
    subtotal_ngn,loyalty_discount_ngn,total_ngn,loyalty_owner_id,delivery_fee_ngn,delivery_zone_id,status,payment_expires_at)
    VALUES(p_id,p_email,p_details->>'fullName',p_details->>'phone',p_details->>'addressLine1',p_details->>'addressLine2',
      zone.city,p_details->>'area',p_details->>'notes',subtotal,p_discount,subtotal-p_discount+zone.fee_ngn,p_owner,zone.fee_ngn,zone.id,
      'pending',NOW()+INTERVAL '30 minutes') RETURNING * INTO purchase;
  FOR item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO ritual_order_items(order_id,kit_slug,kit_name,prefer_track,unit_price_ngn,qty)
      VALUES(p_id,item->>'slug',item->>'name',item->>'preferTrack',(item->>'unitPrice')::integer,(item->>'qty')::integer);
  END LOOP;
  stock_error := c24_reserve_stock(p_id,p_stock);
  IF stock_error IS NOT NULL THEN RAISE EXCEPTION '%',stock_error; END IF;
  IF p_gift <> '' THEN
    SELECT * INTO card FROM gift_cards WHERE code = UPPER(TRIM(p_gift)) AND status = 'active'
      AND balance_ngn > 0 AND (expires_at IS NULL OR expires_at > NOW()) FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Gift card is invalid, expired or spent'; END IF;
    applied := LEAST(card.balance_ngn,purchase.total_ngn);
    UPDATE gift_cards SET balance_ngn = balance_ngn - applied,
      status = CASE WHEN balance_ngn = applied THEN 'redeemed' ELSE 'active' END,
      redeemed_order_id = p_id, redeemed_at = NOW() WHERE id = card.id;
    INSERT INTO order_gift_card_usage(order_id,gift_card_id,amount_ngn) VALUES(p_id,card.id,applied);
    UPDATE ritual_orders SET gift_card_id = card.id,gift_card_discount_ngn = applied,total_ngn = total_ngn-applied WHERE id = p_id;
  END IF;
  IF p_details ? 'expectedTotalNgn' AND (SELECT total_ngn FROM ritual_orders WHERE id=p_id) <> (p_details->>'expectedTotalNgn')::integer THEN RAISE EXCEPTION 'Checkout total changed; review before paying'; END IF;
  UPDATE ritual_orders SET status = CASE WHEN total_ngn = 0 THEN 'paid' ELSE 'pending' END,
    payment_provider = CASE WHEN total_ngn = 0 THEN 'gift_card' ELSE NULL END WHERE id = p_id RETURNING * INTO purchase;
  INSERT INTO checkout_requests(owner_email,request_key,fingerprint,order_id) VALUES(p_email,p_key,p_fingerprint,p_id);
  RETURN purchase;
END;
$$;

CREATE OR REPLACE FUNCTION c24_release_gift_credit(p_order uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE usage order_gift_card_usage%ROWTYPE;
BEGIN
  SELECT * INTO usage FROM order_gift_card_usage WHERE order_id = p_order FOR UPDATE;
  IF FOUND THEN
    IF usage.restored THEN RETURN; END IF;
    UPDATE gift_cards SET balance_ngn = LEAST(value_ngn,balance_ngn + usage.amount_ngn),
      status = CASE WHEN status = 'void' THEN 'void' ELSE 'active' END WHERE id = usage.gift_card_id;
    UPDATE order_gift_card_usage SET restored = true WHERE order_id = p_order;
  ELSE
    UPDATE gift_cards SET status = 'active',balance_ngn = value_ngn,redeemed_order_id = NULL,redeemed_at = NULL
      WHERE redeemed_order_id = p_order AND status = 'redeemed';
  END IF;
END;
$$;
CREATE TABLE IF NOT EXISTS admin_staff (
  email text PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('owner','operations','finance','content')),
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id text NOT NULL,
  label text NOT NULL, full_name text NOT NULL, phone text NOT NULL,
  address_line1 text NOT NULL, address_line2 text, city text NOT NULL,
  area text NOT NULL, created_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_owner ON customer_addresses(user_id);
CREATE TABLE IF NOT EXISTS customer_preferences (
  user_id text PRIMARY KEY, marketing_email boolean NOT NULL DEFAULT false,
  deletion_requested_at timestamptz, updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id text NOT NULL,
  email text NOT NULL, order_id uuid REFERENCES ritual_orders(id),
  category text NOT NULL CHECK (category IN ('damaged','incorrect','missing','undelivered','account','other')),
  message text NOT NULL, staff_reply text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved')),
  created_at timestamptz NOT NULL DEFAULT NOW(), updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_support_tickets_owner ON support_tickets(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS payment_receipts (
  transaction_id text PRIMARY KEY, order_id uuid NOT NULL REFERENCES ritual_orders(id),
  reference text NOT NULL, amount_ngn integer NOT NULL,
  exception text, created_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS notification_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL,
  payload jsonb NOT NULL, status text NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','processing','sent','failed')),
  attempts integer NOT NULL DEFAULT 0, available_at timestamptz NOT NULL DEFAULT NOW(),
  lease uuid, last_error text, created_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION c24_queue_order_notice() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'paid') OR (TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO notification_jobs(kind,payload) VALUES('order-status',jsonb_build_object('orderId',NEW.id,'status',NEW.status));
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS c24_order_notice ON ritual_orders;
CREATE TRIGGER c24_order_notice AFTER INSERT OR UPDATE OF status ON ritual_orders FOR EACH ROW EXECUTE FUNCTION c24_queue_order_notice();

CREATE OR REPLACE FUNCTION c24_reconcile_payment(p_order uuid,p_transaction text,p_reference text,p_amount integer)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE purchase ritual_orders%ROWTYPE; receipt payment_receipts%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_order::text,0));
  SELECT * INTO purchase FROM ritual_orders WHERE id=p_order FOR UPDATE;
  IF NOT FOUND OR purchase.payment_ref IS DISTINCT FROM p_reference OR purchase.total_ngn IS DISTINCT FROM p_amount THEN RAISE EXCEPTION 'Payment does not match order'; END IF;
  INSERT INTO payment_receipts(transaction_id,order_id,reference,amount_ngn) VALUES(p_transaction,p_order,p_reference,p_amount)
    ON CONFLICT(transaction_id) DO NOTHING;
  SELECT * INTO receipt FROM payment_receipts WHERE transaction_id=p_transaction;
  IF receipt.order_id <> p_order THEN RAISE EXCEPTION 'Payment belongs to another order'; END IF;
  IF purchase.status IN ('cancelled','refunded') THEN
    UPDATE payment_receipts SET exception='Payment received for a closed order; staff reconciliation required' WHERE transaction_id=p_transaction;
    RETURN purchase.status;
  END IF;
  IF purchase.status='awaiting_payment' THEN
    UPDATE ritual_orders SET status='paid',updated_at=NOW() WHERE id=p_order;
    INSERT INTO order_events(order_id,status,note) VALUES(p_order,'paid','Payment verified') ON CONFLICT(order_id,status) DO NOTHING;
    RETURN 'paid';
  END IF;
  RETURN purchase.status;
END;
$$;

CREATE TABLE IF NOT EXISTS order_refunds (
  id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES ritual_orders(id),
  amount_ngn integer NOT NULL CHECK(amount_ngn>0),
  status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','pending','completed','failed')),
  provider text NOT NULL, provider_reference text, reason text, actor text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(), updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_refund_active ON order_refunds(order_id) WHERE status IN ('requested','pending');
CREATE OR REPLACE FUNCTION c24_request_refund(p_id uuid,p_order uuid,p_amount integer,p_actor text,p_reason text)
RETURNS order_refunds LANGUAGE plpgsql AS $$
DECLARE purchase ritual_orders%ROWTYPE; refund order_refunds%ROWTYPE;
BEGIN
  SELECT * INTO purchase FROM ritual_orders WHERE id=p_order FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  SELECT * INTO refund FROM order_refunds WHERE id=p_id;
  IF FOUND THEN
    IF refund.order_id<>p_order OR refund.amount_ngn<>p_amount THEN RAISE EXCEPTION 'Refund request changed'; END IF;
    RETURN refund;
  END IF;
  IF purchase.status NOT IN ('paid','processing','packed','out_for_delivery','delivered','fulfilled') THEN RAISE EXCEPTION 'Order cannot be refunded'; END IF;
  IF p_amount<=0 OR p_amount>purchase.total_ngn-purchase.refunded_ngn THEN RAISE EXCEPTION 'Refund exceeds remaining payment'; END IF;
  IF EXISTS(SELECT 1 FROM order_refunds WHERE order_id=p_order AND status IN ('requested','pending')) THEN RAISE EXCEPTION 'An existing refund needs reconciliation'; END IF;
  INSERT INTO order_refunds(id,order_id,amount_ngn,provider,reason,actor) VALUES(p_id,p_order,p_amount,COALESCE(purchase.payment_provider,'manual'),p_reason,p_actor) RETURNING * INTO refund;
  RETURN refund;
END;
$$;
CREATE OR REPLACE FUNCTION c24_complete_refund(p_id uuid,p_reference text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE refund order_refunds%ROWTYPE; purchase ritual_orders%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended((SELECT order_id::text FROM order_refunds WHERE id=p_id),0));
  -- Always lock order before refund, matching the request path.
  SELECT * INTO purchase FROM ritual_orders WHERE id=(SELECT order_id FROM order_refunds WHERE id=p_id) FOR UPDATE;
  SELECT * INTO refund FROM order_refunds WHERE id=p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Refund not found'; END IF;
  IF refund.status='completed' THEN RETURN; END IF;
  IF refund.status='failed' THEN RAISE EXCEPTION 'Failed refund cannot be completed'; END IF;
  UPDATE order_refunds SET status='completed',provider_reference=p_reference,updated_at=NOW() WHERE id=p_id;
  UPDATE ritual_orders SET refunded_ngn=refunded_ngn+refund.amount_ngn,refund_ref=p_reference,
    status=CASE WHEN refunded_ngn+refund.amount_ngn>=total_ngn THEN 'refunded' ELSE status END,updated_at=NOW()
    WHERE id=refund.order_id;
  UPDATE referral_attributions SET order_total_ngn=GREATEST(0,purchase.total_ngn-purchase.delivery_fee_ngn-purchase.refunded_ngn-refund.amount_ngn),commission_ngn=ROUND(GREATEST(0,purchase.total_ngn-purchase.delivery_fee_ngn-purchase.refunded_ngn-refund.amount_ngn)*commission_pct/100.0) WHERE order_id=refund.order_id AND status IN ('pending','approved');
  IF purchase.refunded_ngn+refund.amount_ngn>=purchase.total_ngn THEN
    PERFORM c24_finish_stock(refund.order_id,false);
    PERFORM c24_release_gift_credit(refund.order_id);
    UPDATE referral_attributions SET status='void',commission_ngn=0 WHERE order_id=refund.order_id AND status IN ('pending','approved');
  END IF;
  INSERT INTO order_events(order_id,status,note) SELECT id,status,'Refund completed: '||refund.amount_ngn||' NGN' FROM ritual_orders WHERE id=refund.order_id ON CONFLICT(order_id,status) DO UPDATE SET note=EXCLUDED.note;
  PERFORM c24_sync_order_points(refund.order_id);
END;
$$;

-- Backfill only recorded outstanding holds; discrepancies remain visible in readiness checks.
INSERT INTO order_stock_reservations(order_id,slug,qty,supplier_id)
SELECT m.order_id,m.slug,SUM(m.delta_reserved)::integer,o.routed_supplier_id
FROM inventory_movements m JOIN ritual_orders o ON o.id=m.order_id JOIN inventory i ON i.slug=m.slug
WHERE o.status IN ('pending','awaiting_payment','paid','processing','packed','out_for_delivery')
GROUP BY m.order_id,m.slug,o.routed_supplier_id HAVING SUM(m.delta_reserved)>0
ON CONFLICT(order_id,slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS schema_migrations (
  name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Compute and settle the order's loyalty receipt with its balance in one transaction.
CREATE OR REPLACE FUNCTION c24_sync_order_points(p_order uuid) RETURNS void LANGUAGE plpgsql AS $$
DECLARE purchase ritual_orders%ROWTYPE; desired integer:=0; base_points numeric; list_total numeric; charged numeric; delta integer;
BEGIN
  SELECT * INTO purchase FROM ritual_orders WHERE id=p_order FOR UPDATE;
  IF NOT FOUND OR purchase.loyalty_owner_id IS NULL THEN RETURN; END IF;
  IF purchase.status NOT IN ('delivered','fulfilled','cancelled','refunded') THEN RETURN; END IF;
  PERFORM 1 FROM loyalty_members WHERE owner_id=purchase.loyalty_owner_id FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  IF purchase.status IN ('delivered','fulfilled') THEN
    SELECT SUM(FLOOR(unit_price_ngn*qty/100.0 * CASE WHEN unit_price_ngn<35000 THEN 0.5 WHEN unit_price_ngn<80000 THEN 0.8 WHEN unit_price_ngn<200000 THEN 1.0 ELSE 1.2 END)),SUM(unit_price_ngn*qty)
      INTO base_points,list_total FROM ritual_order_items WHERE order_id=p_order;
    charged:=GREATEST(0,purchase.total_ngn-COALESCE(purchase.delivery_fee_ngn,0)-COALESCE(purchase.refunded_ngn,0));
    desired:=CASE WHEN COALESCE(list_total,0)>0 THEN FLOOR(COALESCE(base_points,0)*LEAST(1,charged/list_total)) ELSE FLOOR(charged/100.0*0.8) END;
  END IF;
  delta:=desired-COALESCE(purchase.loyalty_points_awarded,0);
  IF delta=0 THEN RETURN; END IF;
  UPDATE loyalty_members SET points=GREATEST(0,points+delta),lifetime_points=GREATEST(0,lifetime_points+delta),updated_at=NOW() WHERE owner_id=purchase.loyalty_owner_id;
  UPDATE ritual_orders SET loyalty_points_awarded=desired WHERE id=p_order;
END;
$$;

-- All fulfilment side effects commit with the status and its queued notification.
CREATE OR REPLACE FUNCTION c24_transition_order(p_order uuid,p_from text,p_to text,p_tracking jsonb,p_note text)
RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE purchase ritual_orders%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_order::text,0));
  SELECT * INTO purchase FROM ritual_orders WHERE id=p_order FOR UPDATE;
  IF NOT FOUND OR purchase.status<>p_from THEN RETURN false; END IF;
  IF p_to='cancelled' AND purchase.status NOT IN ('pending','awaiting_payment') THEN RAISE EXCEPTION 'Refund paid orders instead of cancelling them'; END IF;
  UPDATE ritual_orders SET status=p_to,
    courier_name=CASE WHEN p_tracking ? 'courierName' THEN p_tracking->>'courierName' ELSE courier_name END,
    courier_reference=CASE WHEN p_tracking ? 'courierReference' THEN p_tracking->>'courierReference' ELSE courier_reference END,
    tracking_url=CASE WHEN p_tracking ? 'trackingUrl' THEN p_tracking->>'trackingUrl' ELSE tracking_url END,
    delivery_proof=CASE WHEN p_tracking ? 'deliveryProof' THEN p_tracking->>'deliveryProof' ELSE delivery_proof END,
    recipient_age_checked=CASE WHEN p_tracking ? 'recipientAgeChecked' THEN (p_tracking->>'recipientAgeChecked')::boolean ELSE recipient_age_checked END,
    courier_cost_ngn=CASE WHEN p_tracking ? 'courierCostNgn' THEN (p_tracking->>'courierCostNgn')::integer ELSE courier_cost_ngn END,
    rider_phone=CASE WHEN p_tracking ? 'riderPhone' THEN p_tracking->>'riderPhone' ELSE rider_phone END,
    tracking_note=CASE WHEN p_tracking ? 'trackingNote' THEN p_tracking->>'trackingNote' ELSE tracking_note END,
    eta_at=CASE WHEN p_tracking ? 'etaAt' THEN (p_tracking->>'etaAt')::timestamptz ELSE eta_at END,updated_at=NOW()
    WHERE id=p_order;
  IF p_to IN ('delivered','fulfilled') THEN
    IF NOT EXISTS(SELECT 1 FROM ritual_orders WHERE id=p_order AND recipient_age_checked AND NULLIF(TRIM(delivery_proof),'') IS NOT NULL) THEN RAISE EXCEPTION 'Record recipient age verification and delivery receipt before marking delivered'; END IF;
    PERFORM c24_finish_stock(p_order,true);
    UPDATE ritual_orders SET stock_consumed=true WHERE id=p_order;
  ELSIF p_to='cancelled' THEN
    PERFORM c24_finish_stock(p_order,false);
    PERFORM c24_release_gift_credit(p_order);
    UPDATE referral_attributions SET status='void',commission_ngn=0 WHERE order_id=p_order AND status IN ('pending','approved');
  END IF;
  INSERT INTO order_events(order_id,status,note) VALUES(p_order,p_to,p_note) ON CONFLICT(order_id,status) DO NOTHING;
  PERFORM c24_sync_order_points(p_order);
  IF p_tracking ? 'actor' THEN INSERT INTO admin_audit(actor,action,subject,detail) VALUES(p_tracking->>'actor','order.status',p_order::text,jsonb_build_object('from',p_from,'to',p_to,'note',p_note)); END IF;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION c24_refund_gift_order(p_order uuid,p_actor text,p_reason text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE purchase ritual_orders%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_order::text,0));
  SELECT * INTO purchase FROM ritual_orders WHERE id=p_order FOR UPDATE;
  IF NOT FOUND OR purchase.total_ngn<>0 OR purchase.payment_provider<>'gift_card' THEN RAISE EXCEPTION 'Order was not paid entirely with gift credit'; END IF;
  IF purchase.status='refunded' THEN RETURN; END IF;
  IF purchase.status NOT IN ('paid','processing','packed','out_for_delivery','delivered','fulfilled') THEN RAISE EXCEPTION 'Order cannot be refunded'; END IF;
  PERFORM c24_finish_stock(p_order,false);
  PERFORM c24_release_gift_credit(p_order);
  UPDATE ritual_orders SET status='refunded',updated_at=NOW() WHERE id=p_order;
  PERFORM c24_sync_order_points(p_order);
  UPDATE referral_attributions SET status='void',commission_ngn=0 WHERE order_id=p_order AND status IN ('pending','approved');
  INSERT INTO order_events(order_id,status,note) VALUES(p_order,'refunded','Gift credit returned') ON CONFLICT(order_id,status) DO NOTHING;
  INSERT INTO admin_audit(actor,action,subject,detail) VALUES(p_actor,'order.gift-refund',p_order::text,jsonb_build_object('reason',p_reason));
END;
$$;

ALTER TABLE partner_wholesale_orders ADD COLUMN IF NOT EXISTS refunded_ngn integer NOT NULL DEFAULT 0;
ALTER TABLE partner_wholesale_orders ADD COLUMN IF NOT EXISTS refund_reference text;
CREATE OR REPLACE FUNCTION c24_refund_wholesale(p_id uuid,p_amount integer,p_reference text,p_actor text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE purchase partner_wholesale_orders%ROWTYPE; points_to_reverse integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_id::text,0));
  SELECT * INTO purchase FROM partner_wholesale_orders WHERE id=p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wholesale order not found'; END IF;
  IF purchase.status='refunded' AND purchase.refund_reference=p_reference THEN RETURN; END IF;
  IF purchase.status NOT IN ('paid','packed','dispatched','delivered') THEN RAISE EXCEPTION 'Only paid wholesale orders can be refunded'; END IF;
  IF p_amount<>purchase.total_ngn OR NULLIF(TRIM(p_reference),'') IS NULL THEN RAISE EXCEPTION 'Full wholesale refund and bank evidence required'; END IF;
  PERFORM c24_finish_stock(p_id,false);
  -- Stock already received belongs to the outlet. Returns require a physical count adjustment.
  IF purchase.points_awarded THEN
    points_to_reverse:=purchase.points_earned;
    UPDATE partner_outlets SET points=GREATEST(0,points-points_to_reverse),lifetime_points=GREATEST(0,lifetime_points-points_to_reverse) WHERE id=purchase.outlet_id;
  END IF;
  UPDATE partner_wholesale_orders SET status='refunded',refunded_ngn=p_amount,refund_reference=p_reference WHERE id=p_id;
  INSERT INTO admin_audit(actor,action,subject,detail) VALUES(p_actor,'wholesale.refunded',p_id::text,jsonb_build_object('amountNgn',p_amount,'reference',p_reference));
END;
$$;

ALTER TABLE payment_receipts ADD COLUMN IF NOT EXISTS resolution_reference text;
ALTER TABLE payment_receipts ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

CREATE OR REPLACE FUNCTION c24_transition_wholesale(p_id uuid,p_from text,p_to text,p_reference text)
RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE purchase partner_wholesale_orders%ROWTYPE; reserve_error text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_id::text,0));
  SELECT * INTO purchase FROM partner_wholesale_orders WHERE id=p_id FOR UPDATE;
  IF NOT FOUND OR purchase.status<>p_from THEN RETURN false; END IF;
  IF NOT ((p_from='awaiting_payment' AND p_to='paid') OR (p_from='paid' AND p_to='packed') OR (p_from='packed' AND p_to='dispatched')) THEN RAISE EXCEPTION 'Invalid wholesale transition'; END IF;
  IF p_to IN ('paid','dispatched') AND NULLIF(TRIM(p_reference),'') IS NULL THEN RAISE EXCEPTION 'Payment or dispatch reference required'; END IF;
  IF p_to='paid' THEN
    reserve_error:=c24_reserve_stock(p_id,purchase.items);
    IF reserve_error IS NOT NULL THEN RAISE EXCEPTION '%',reserve_error; END IF;
  ELSIF p_to='dispatched' THEN
    PERFORM c24_finish_stock(p_id,true);
  END IF;
  UPDATE partner_wholesale_orders SET status=p_to,
    payment_reference=CASE WHEN p_to='paid' THEN p_reference ELSE payment_reference END,
    tracking_reference=CASE WHEN p_to='dispatched' THEN p_reference ELSE tracking_reference END WHERE id=p_id;
  RETURN true;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_refund_provider_reference ON order_refunds(provider_reference) WHERE provider='flutterwave' AND provider_reference IS NOT NULL;
