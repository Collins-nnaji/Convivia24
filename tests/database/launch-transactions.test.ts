import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
let db: PGlite;
const order = () => randomUUID();
async function stock(slug: string) { return (await db.query<{ on_hand: number; reserved: number }>('SELECT on_hand,reserved FROM inventory WHERE slug=$1', [slug])).rows[0]; }
beforeAll(async () => {
  db = new PGlite();
  // Bootstrap dependencies precede legacy additive schema statements.
  await db.exec(readFileSync('lib/db/bootstrap.sql', 'utf8'));
  for (const file of ['schema.sql','venues-migration.sql','ecommerce.sql','suppliers-portal.sql','desk-raffle-giftcards.sql','launch-readiness.sql']) {
    await db.exec(readFileSync('lib/db/' + file, 'utf8'));
  }
}, 30000);
afterAll(async () => { await db?.close(); });
describe('transactional reservations', () => {
  it('reserves once, refuses overselling, and releases only its own units', async () => {
    const slug = 'test-' + randomUUID(); const first = order(); const second = order();
    await db.query('INSERT INTO inventory(slug,name,on_hand,price_ngn) VALUES($1,$1,5,1000)', [slug]);
    const reserve = (id: string, qty: number) => db.query<{ error: string | null }>('SELECT c24_reserve_stock($1,$2::jsonb) AS error', [id, JSON.stringify([{ slug, qty }])]);
    expect((await reserve(first,3)).rows[0].error).toBeNull();
    expect((await reserve(first,3)).rows[0].error).toBeNull();
    expect((await reserve(second,3)).rows[0].error).toMatch(/enough stock/);
    expect((await reserve(second,2)).rows[0].error).toBeNull();
    await db.query('SELECT c24_finish_stock($1,false)', [first]);
    await db.query('SELECT c24_finish_stock($1,false)', [first]);
    expect(await stock(slug)).toEqual({ on_hand:5,reserved:2 });
    await db.query('SELECT c24_finish_stock($1,true)', [second]);
    await db.query('SELECT c24_finish_stock($1,true)', [second]);
    expect(await stock(slug)).toEqual({ on_hand:3,reserved:0 });
  });
  it('rolls back the entire basket when a later line is unavailable', async () => {
    const a='a-'+randomUUID(); const b='b-'+randomUUID();
    await db.query('INSERT INTO inventory(slug,name,on_hand) VALUES($1,$1,2),($2,$2,0)',[a,b]);
    const result=await db.query<{error:string}>('SELECT c24_reserve_stock($1,$2::jsonb) AS error',[order(),JSON.stringify([{slug:a,qty:1},{slug:b,qty:1}])]);
    expect(result.rows[0].error).toMatch(/enough stock/);
    expect(await stock(a)).toEqual({on_hand:2,reserved:0});
  });
});
describe('checkout transaction', () => {
  it('creates once, retains gift credit, and rolls back invalid gift cards', async () => {
    const slug='checkout-'+randomUUID(); const zone=order(); const id=order(); const key=order();
    await db.query('INSERT INTO inventory(slug,name,on_hand,price_ngn) VALUES($1,$1,5,1000)',[slug]);
    await db.query("INSERT INTO delivery_zones(id,city,name,fee_ngn,estimate,active) VALUES($1,'Lagos',$2,100,'Tomorrow',true)",[zone,slug]);
    await db.query("INSERT INTO gift_cards(code,value_ngn,balance_ngn,issued_by) VALUES($1,5000,5000,'test')",[slug.toUpperCase()]);
    const details=JSON.stringify({fullName:'Buyer',phone:'+2348012345678',addressLine1:'Test street',city:'Lagos',deliveryZoneId:zone});
    const items=JSON.stringify([{slug,name:slug,preferTrack:'spirit',unitPrice:1000,qty:1}]); const lines=JSON.stringify([{slug,qty:1}]);
    const create=(requestKey:string,gift:string)=>db.query<{id:string,total_ngn:number,status:string}>('SELECT * FROM c24_create_order($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::jsonb,0,NULL,$8)',[id,'buyer@example.com',requestKey,'same',details,items,lines,gift]);
    expect((await create(key,slug)).rows[0]).toMatchObject({id,total_ngn:0,status:'paid'});
    expect((await create(key,slug)).rows[0].id).toBe(id);
    expect(await stock(slug)).toEqual({on_hand:5,reserved:1});
    const balance=await db.query<{balance_ngn:number}>('SELECT balance_ngn FROM gift_cards WHERE code=$1',[slug.toUpperCase()]);
    expect(balance.rows[0].balance_ngn).toBe(3900);
    await db.query('SELECT c24_release_gift_credit($1)',[id]); await db.query('SELECT c24_release_gift_credit($1)',[id]);
    expect((await db.query<{balance_ngn:number}>('SELECT balance_ngn FROM gift_cards WHERE code=$1',[slug.toUpperCase()])).rows[0].balance_ngn).toBe(5000);
    await expect(db.query('SELECT * FROM c24_create_order($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::jsonb,0,NULL,$8)',[order(),'buyer@example.com',order(),'bad',details,items,lines,'INVALID'])).rejects.toThrow(/Gift card/);
    expect(await stock(slug)).toEqual({on_hand:5,reserved:1});
  });
});
describe('wholesale receipt', () => {
  it('awards inventory and points only after dispatch, once', async () => {
    const outlet=order();const id=order();
    await db.query("INSERT INTO partner_outlets(id,owner_id,venue_name,email) VALUES($1,$2,'Test','test@example.com')",[outlet,order()]);
    await db.query("INSERT INTO partner_wholesale_orders(id,outlet_id,items,total_ngn,points_earned,status) VALUES($1,$2,$3::jsonb,1000,20,'awaiting_payment')",[id,outlet,JSON.stringify([{slug:'test-wholesale',qty:2}])]);
    await expect(db.query('SELECT c24_receive_wholesale($1,$2)',[id,outlet])).rejects.toThrow(/dispatched/);
    await db.query("UPDATE partner_wholesale_orders SET status='dispatched' WHERE id=$1",[id]);
    await db.query('SELECT c24_receive_wholesale($1,$2)',[id,outlet]);await db.query('SELECT c24_receive_wholesale($1,$2)',[id,outlet]);
    expect((await db.query<{points:number}>('SELECT points FROM partner_outlets WHERE id=$1',[outlet])).rows[0].points).toBe(20);
    expect((await db.query<{on_hand:number}>('SELECT on_hand FROM partner_inventory WHERE outlet_id=$1',[outlet])).rows[0].on_hand).toBe(2);
  });
});

async function paidPurchase() {
  const id=order(), slug='fulfil-'+order(), owner='user:'+order();
  await db.query("INSERT INTO loyalty_members(owner_id,email,points,lifetime_points) VALUES($1,'buyer@example.com',0,0)",[owner]);
  await db.query('INSERT INTO inventory(slug,name,on_hand,price_ngn) VALUES($1,$1,5,1000)',[slug]);
  await db.query("INSERT INTO ritual_orders(id,email,full_name,address_line1,subtotal_ngn,total_ngn,delivery_fee_ngn,status,payment_ref,payment_provider,loyalty_owner_id) VALUES($1,'buyer@example.com','Buyer','Street',1000,1100,100,'awaiting_payment',$2,'flutterwave',$3)",[id,'ref-'+id,owner]);
  await db.query("INSERT INTO ritual_order_items(order_id,kit_slug,kit_name,unit_price_ngn,qty,prefer_track) VALUES($1,$2,$2,1000,1,'spirit')",[id,slug]);
  await db.query('SELECT c24_reserve_stock($1,$2::jsonb)',[id,JSON.stringify([{slug,qty:1}])]);
  await db.query('SELECT c24_reconcile_payment($1,$2,$3,1100)',[id,'tx-'+id,'ref-'+id]);
  return {id,slug,owner};
}
describe('payment and fulfilment recovery',()=>{
  it('rejects mismatched payments, records duplicate callbacks once, and never reopens cancellation',async()=>{
    const {id}=await paidPurchase();
    await expect(db.query('SELECT c24_reconcile_payment($1,$2,$3,1200)',[id,'wrong','ref-'+id])).rejects.toThrow(/match/);
    await db.query('SELECT c24_reconcile_payment($1,$2,$3,1100)',[id,'tx-'+id,'ref-'+id]);
    expect((await db.query<{n:number}>('SELECT COUNT(*)::int AS n FROM payment_receipts WHERE order_id=$1',[id])).rows[0].n).toBe(1);
    await db.query("UPDATE ritual_orders SET status='cancelled' WHERE id=$1",[id]);
    expect((await db.query<{status:string}>('SELECT c24_reconcile_payment($1,$2,$3,1100) AS status',[id,'tx-'+id,'ref-'+id])).rows[0].status).toBe('cancelled');
    expect((await db.query<{exception:string}>('SELECT exception FROM payment_receipts WHERE order_id=$1',[id])).rows[0].exception).toMatch(/closed/);
  });
  it('commits delivery, stock, tracking, points and notification once; refunds never restock consumed bottles',async()=>{
    const {id,slug,owner}=await paidPurchase();
    await expect(db.query("SELECT c24_transition_order($1,'paid','cancelled','{}',NULL)",[id])).rejects.toThrow(/Refund paid/);
    await expect(db.query("SELECT c24_transition_order($1,'paid','delivered','{}',NULL)",[id])).rejects.toThrow(/age verification/);
    expect(await stock(slug)).toEqual({on_hand:5,reserved:1});
    const tracking=JSON.stringify({courierName:'Test courier',courierReference:'booking',recipientAgeChecked:true,deliveryProof:'Received by adult'});
    expect((await db.query<{changed:boolean}>("SELECT c24_transition_order($1,'paid','delivered',$2::jsonb,'Delivered') AS changed",[id,tracking])).rows[0].changed).toBe(true);
    expect((await db.query<{changed:boolean}>("SELECT c24_transition_order($1,'paid','delivered','{}',NULL) AS changed",[id])).rows[0].changed).toBe(false);
    expect(await stock(slug)).toEqual({on_hand:4,reserved:0});
    await db.query('SELECT c24_sync_order_points($1)',[id]);
    expect((await db.query<{points:number}>('SELECT points FROM loyalty_members WHERE owner_id=$1',[owner])).rows[0].points).toBe(5);
    expect((await db.query<{n:number}>("SELECT COUNT(*)::int AS n FROM notification_jobs WHERE payload->>'orderId'=$1 AND payload->>'status'='delivered'",[id])).rows[0].n).toBe(1);
    const first=order();await db.query("SELECT c24_request_refund($1,$2,500,'finance','Partial refund')",[first,id]);
    await expect(db.query("SELECT c24_request_refund($1,$2,100,'finance','Duplicate')",[order(),id])).rejects.toThrow(/existing refund/);
    expect((await db.query<{refunded_ngn:number}>('SELECT refunded_ngn FROM ritual_orders WHERE id=$1',[id])).rows[0].refunded_ngn).toBe(0);
    await db.query('SELECT c24_complete_refund($1,$2)',[first,'refund-1']);await db.query('SELECT c24_complete_refund($1,$2)',[first,'refund-1']);
    expect((await db.query<{points:number}>('SELECT points FROM loyalty_members WHERE owner_id=$1',[owner])).rows[0].points).toBe(2);
    const rest=order();await db.query("SELECT c24_request_refund($1,$2,600,'finance','Remaining')",[rest,id]);await db.query('SELECT c24_complete_refund($1,$2)',[rest,'refund-2']);
    expect(await stock(slug)).toEqual({on_hand:4,reserved:0});
    expect((await db.query<{status:string}>('SELECT status FROM ritual_orders WHERE id=$1',[id])).rows[0].status).toBe('refunded');
    expect((await db.query<{points:number}>('SELECT points FROM loyalty_members WHERE owner_id=$1',[owner])).rows[0].points).toBe(0);
  });
  it('reward cancellation refunds points and releases stock exactly once',async()=>{
    const owner='reward:'+order(),slug='reward-'+order();
    await db.query("INSERT INTO loyalty_members(owner_id,email,points,lifetime_points) VALUES($1,'reward@example.com',1000,1000)",[owner]);
    await db.query('INSERT INTO inventory(slug,name,on_hand) VALUES($1,$1,1)',[slug]);
    const [r]=(await db.query<{id:string}>("SELECT * FROM c24_redeem_reward($1,'test','Test','bottle',500,1000,$2,$3,0)",[owner,'code-'+order(),slug])).rows;
    expect(await stock(slug)).toEqual({on_hand:1,reserved:1});
    await expect(db.query("SELECT * FROM c24_redeem_reward($1,'test','Test','bottle',500,1000,$2,$3,0)",[owner,'code-'+order(),slug])).rejects.toThrow(/enough stock/);
    expect((await db.query<{points:number}>('SELECT points FROM loyalty_members WHERE owner_id=$1',[owner])).rows[0].points).toBe(500);
    await db.query("SELECT c24_finish_reward($1,'cancelled','Cancelled')",[r.id]);await db.query("SELECT c24_finish_reward($1,'cancelled','Cancelled')",[r.id]);
    expect(await stock(slug)).toEqual({on_hand:1,reserved:0});
    expect((await db.query<{points:number}>('SELECT points FROM loyalty_members WHERE owner_id=$1',[owner])).rows[0].points).toBe(1000);
  });
  it('can safely reapply the launch migration',async()=>{await db.exec(readFileSync('lib/db/launch-readiness.sql','utf8'));});
  it('preserves signup and circle membership data when reapplying the full schema', async () => {
    const email = `migration-${order()}@example.com`;
    const user = order();
    await db.query('INSERT INTO waitlist(email) VALUES($1)', [email]);
    await db.query('INSERT INTO convivium_members(email) VALUES($1)', [email]);
    await db.query("INSERT INTO circle_members(circle_id,user_id,name) SELECT id,$1,'Member' FROM circles WHERE slug='rooftop-lagos'", [user]);
    for (const file of ['bootstrap.sql', 'schema.sql', 'venues-migration.sql', 'ecommerce.sql', 'suppliers-portal.sql', 'desk-raffle-giftcards.sql', 'launch-readiness.sql']) {
      await db.exec(readFileSync('lib/db/' + file, 'utf8'));
    }
    expect((await db.query('SELECT id FROM waitlist WHERE email=$1', [email])).rows).toHaveLength(1);
    expect((await db.query('SELECT id FROM convivium_members WHERE email=$1', [email])).rows).toHaveLength(1);
    expect((await db.query('SELECT circle_id FROM circle_members WHERE user_id=$1', [user])).rows).toHaveLength(1);
  });
});

describe('manual wholesale stock and refund',()=>{
  it('reserves on payment, consumes on dispatch and never adds dispatched stock on refund',async()=>{
    const outlet=order(),id=order(),slug='wholesale-'+order();
    await db.query("INSERT INTO partner_outlets(id,owner_id,venue_name,email) VALUES($1,$2,'Wholesale','buyer@example.com')",[outlet,order()]);
    await db.query('INSERT INTO inventory(slug,name,on_hand) VALUES($1,$1,5)',[slug]);
    await db.query("INSERT INTO partner_wholesale_orders(id,outlet_id,items,total_ngn,points_earned,status) VALUES($1,$2,$3::jsonb,1000,20,'awaiting_payment')",[id,outlet,JSON.stringify([{slug,qty:2}])]);
    await db.query("SELECT c24_transition_wholesale($1,'awaiting_payment','paid','bank-confirmed')",[id]);
    expect(await stock(slug)).toEqual({on_hand:5,reserved:2});
    await db.query("SELECT c24_transition_wholesale($1,'paid','packed','')",[id]);
    await db.query("SELECT c24_transition_wholesale($1,'packed','dispatched','booking')",[id]);
    expect(await stock(slug)).toEqual({on_hand:3,reserved:0});
    await db.query('SELECT c24_receive_wholesale($1,$2)',[id,outlet]);
    await db.query("SELECT c24_refund_wholesale($1,1000,'bank-return','finance')",[id]);
    await db.query("SELECT c24_refund_wholesale($1,1000,'bank-return','finance')",[id]);
    expect(await stock(slug)).toEqual({on_hand:3,reserved:0});
    expect((await db.query<{points:number}>('SELECT points FROM partner_outlets WHERE id=$1',[outlet])).rows[0].points).toBe(0);
  });
  it('restores a gift-only payment and hold exactly once',async()=>{
    const id=order(),slug='gift-only-'+order();
    await db.query('INSERT INTO inventory(slug,name,on_hand) VALUES($1,$1,2)',[slug]);
    await db.query("INSERT INTO ritual_orders(id,email,full_name,address_line1,subtotal_ngn,total_ngn,status,payment_provider) VALUES($1,'buyer@example.com','Buyer','Street',500,0,'paid','gift_card')",[id]);
    const[card]=(await db.query<{id:string}>("INSERT INTO gift_cards(code,value_ngn,balance_ngn,status,issued_by) VALUES($1,1000,500,'active','test') RETURNING id",[slug])).rows;
    await db.query('INSERT INTO order_gift_card_usage(order_id,gift_card_id,amount_ngn) VALUES($1,$2,500)',[id,card.id]);
    await db.query('SELECT c24_reserve_stock($1,$2::jsonb)',[id,JSON.stringify([{slug,qty:1}])]);
    await db.query("SELECT c24_refund_gift_order($1,'finance','Cancelled')",[id]);await db.query("SELECT c24_refund_gift_order($1,'finance','Cancelled')",[id]);
    expect(await stock(slug)).toEqual({on_hand:2,reserved:0});
    expect((await db.query<{balance_ngn:number}>('SELECT balance_ngn FROM gift_cards WHERE id=$1',[card.id])).rows[0].balance_ngn).toBe(1000);
  });
});
