import {test,expect} from '@playwright/test';
import {createHmac} from 'node:crypto';
const user={id:'buyer-1',email:'buyer@example.com',name:'Test Buyer',image:null,emailVerified:true};
async function enter(page:import('@playwright/test').Page,signedIn=false){
  const expiry=Date.now()+3600000;const sig=createHmac('sha256','browser-test-secret-that-is-at-least-32-characters').update(String(expiry)).digest('hex');
  await page.context().addCookies([{name:'convivia_age_verified',value:`${expiry}.${sig}`,domain:'localhost',path:'/'}]);
  await page.route('**/api/**',async route=>{
    const url=new URL(route.request().url());const path=url.pathname;
    if(path==='/api/auth/get-session')return route.fulfill({json:signedIn?{session:{id:'session',userId:user.id,expiresAt:new Date(Date.now()+3600000).toISOString()},user}:null});
    if(path==='/api/auth/me')return route.fulfill({json:{user:signedIn?user:null,authConfigured:true}});
    if(path==='/api/cart')return route.fulfill({json:route.request().method()==='GET'?{items:[]}:{ok:true}});
    if(path==='/api/delivery')return route.fulfill({json:{zones:[{id:'11111111-1111-4111-8111-111111111111',city:'Lagos',name:'Test zone',feeNgn:1500,estimate:'Next day'}]}});
    if(path==='/api/checkout/quote')return route.fulfill({json:{subtotalNgn:42000,loyaltyDiscountNgn:0,giftCardAppliedNgn:0,deliveryFeeNgn:1500,totalNgn:43500}});
    if(path==='/api/admin/summary')return route.fulfill({json:{staffRole:'owner',todayOrders:0,todayRevenueNgn:0}});
    if(path==='/api/admin/delivery')return route.fulfill({json:{zones:[],providers:[]}});
    if(path==='/api/shop/catalog')return route.fulfill({json:{products:[]}});
    if(path==='/api/shop/availability')return route.fulfill({json:{availability:{}}});
    if(path==='/api/shop/reviews')return route.fulfill({json:{reviews:[],average:0,count:0}});
    if(path==='/api/shop/product-info')return route.fulfill({json:{}});
    return route.fulfill({json:{standing:{discountPct:0,points:0},entries:[],rounds:[],events:[],items:[]}});
  });
}
test('age gate protects the storefront',async({page})=>{await page.goto('/shop');await expect(page).toHaveURL(/age-check/);await expect(page.getByRole('button',{name:'Yes — enter'})).toBeVisible();});
test('password recovery and support are discoverable',async({page})=>{await enter(page);await page.goto('/signin');await expect(page.getByRole('link',{name:'Forgot password?'})).toBeVisible();await page.getByRole('link',{name:'Forgot password?'}).click();await expect(page.getByRole('heading',{name:'Reset your password'})).toBeVisible();await expect(page.getByRole('link',{name:'Delivery & returns'})).toBeVisible();});
test('checkout shows enabled city zones and delivery fee before payment',async({page})=>{
  await enter(page,true);await page.addInitScript(()=>localStorage.setItem('convivia_drinks_cart',JSON.stringify([{slug:'jameson-original',name:'Jameson',priceNgn:10000,qty:1}])));
  await page.goto('/checkout');await expect(page.getByText('Delivery information',{exact:true})).toBeVisible();
  await expect(page.getByLabel('City', {exact:true}).locator('option')).toHaveText(['Choose a delivery city', 'Lagos']);
  await page.getByLabel('City',{exact:true}).selectOption('Lagos');await page.getByLabel('Delivery zone',{exact:true}).selectOption('11111111-1111-4111-8111-111111111111');
  await expect(page.getByText('₦1,500',{exact:true})).toBeVisible();
});
test('admin delivery configuration explains disabled checkout and allows providers',async({page})=>{await enter(page,true);await page.goto('/admin#delivery');await expect(page.getByRole('heading',{name:'Delivery zones'})).toBeVisible();await expect(page.getByLabel('Provider name')).toBeVisible();await expect(page.getByText(/No zones configured/)).toBeVisible();});

test('admin sections show useful empty states and support error recovery', async ({ page }) => {
  await enter(page, true);
  await page.route('**/api/admin/support', route => route.fulfill({ json: { tickets: [], deletions: [] } }));
  await page.route('**/api/admin/refunds', route => route.fulfill({ json: { refunds: [], exceptions: [], jobs: [], overdue: [] } }));
  await page.route('**/api/admin/staff', route => route.fulfill({ json: { staff: [], audit: [] } }));
  await page.route('**/api/admin/operations', route => route.fulfill({ json: { outlets: [], wholesale: [], rewards: [] } }));
  await page.route('**/api/admin/readiness', route => route.fulfill({ json: { targetDate: '2026-11-01', ready: false, checks: [{ name: 'Delivery coverage', ok: false, detail: 'Enable a validated delivery zone.' }] } }));
  await page.goto('/admin#readiness');
  await expect(page.getByRole('heading', { name: 'Operational rehearsals' })).toBeVisible();
  await page.getByRole('link', { name: 'Open delivery' }).click();
  await expect(page.getByRole('heading', { name: 'Delivery zones' })).toBeVisible();
  for (const [tab, heading] of [['refunds', 'Refund requests'], ['support', 'Customer requests'], ['staff', 'Grant staff access'], ['operations', 'Partner approvals']]) {
    await page.goto(`/admin#${tab}`);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Refresh', exact: true })).toBeVisible();
  }
  await page.route('**/api/admin/support', route => route.fulfill({ status: 500, json: { error: 'Support database unavailable.' } }));
  await page.goto('/admin#support');
  await expect(page.getByRole('alert').filter({ hasText: 'Support database unavailable.' })).toBeVisible();
  await expect(page.getByText('No support requests yet.', { exact: false })).not.toBeVisible();
  await page.route('**/api/admin/support', route => route.fulfill({ json: { tickets: [], deletions: [] } }));
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.getByText('No support requests yet.', { exact: false })).toBeVisible();
});

test('admin delivery edit saves the selected zone instead of creating another', async ({ page }) => {
  await enter(page, true);
  const zone = { id: '11111111-1111-4111-8111-111111111111', city: 'Lagos', name: 'Victoria Island', fee_ngn: 1500, estimate: 'Same day', active: true };
  let saved: Record<string, unknown> | null = null;
  await page.route('**/api/admin/delivery', async route => {
    if (route.request().method() === 'POST') { saved = route.request().postDataJSON(); return route.fulfill({ json: { saved: zone } }); }
    return route.fulfill({ json: { zones: [zone], providers: [] } });
  });
  await page.goto('/admin#delivery');
  await page.getByRole('button', { name: 'Edit zone', exact: true }).click();
  await page.getByLabel('Zone name', { exact: true }).fill('Victoria Island South');
  await page.getByLabel('Delivery fee in naira').fill('2500');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Delivery settings saved.');
  expect(saved).toMatchObject({ id: zone.id, name: 'Victoria Island South', feeNgn: '2500', active: true });
});

test('support reply saves the selected ticket and status', async ({ page }) => {
  await enter(page, true);
  const ticket = { id: '11111111-1111-4111-8111-111111111111', email: 'customer@example.com', order_id: null, category: 'delivery', message: 'Where is my order?', staff_reply: null, status: 'open' };
  let saved: Record<string, unknown> | null = null;
  await page.route('**/api/admin/support', route => {
    if (route.request().method() === 'POST') { saved = route.request().postDataJSON(); return route.fulfill({ json: { ok: true } }); }
    return route.fulfill({ json: { tickets: [ticket], deletions: [] } });
  });
  await page.goto('/admin#support');
  await page.getByLabel('Reply to customer').fill('Your courier will arrive this afternoon.');
  await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('in_progress');
  await page.getByRole('button', { name: 'Save reply', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Reply and request status saved.');
  expect(saved).toMatchObject({ id: ticket.id, reply: 'Your courier will arrive this afternoon.', status: 'in_progress' });
});

test('refund references stay attached to their own records', async ({ page }) => {
  await enter(page, true);
  const refunds = [1, 2].map(n => ({ id: `${n}1111111-1111-4111-8111-111111111111`, order_id: `${n}2222222-2222-4222-8222-222222222222`, amount_ngn: n * 1000, provider: 'flutterwave', provider_reference: null, reason: 'Return', status: 'pending' }));
  let saved: Record<string, unknown> | null = null;
  await page.route('**/api/admin/refunds', route => {
    if (route.request().method() === 'POST') { saved = route.request().postDataJSON(); return route.fulfill({ json: { ok: true } }); }
    return route.fulfill({ json: { refunds, jobs: [], exceptions: [], overdue: [] } });
  });
  await page.goto('/admin#refunds');
  await page.getByLabel('Provider refund ID').nth(1).fill('refund-second');
  await expect(page.getByRole('button', { name: 'Verify completion' }).nth(0)).toBeDisabled();
  await page.getByRole('button', { name: 'Verify completion' }).nth(1).click();
  await expect(page.getByRole('status')).toContainText('Refund completion verified.');
  expect(saved).toMatchObject({ id: refunds[1].id, reference: 'refund-second', action: 'reconcile' });
});

test('partner operations hides finance and approval actions from operations staff', async ({ page }) => {
  await enter(page, true);
  await page.route('**/api/admin/summary', route => route.fulfill({ json: { staffRole: 'operations', todayOrders: 0, todayRevenueNgn: 0 } }));
  await page.route('**/api/admin/operations', route => route.fulfill({ json: {
    outlets: [{ id: 'partner', venue_name: 'Partner venue', approval_status: 'pending' }],
    wholesale: [{ id: 'purchase', venue_name: 'Partner venue', total_ngn: 10000, status: 'awaiting_payment' }],
    rewards: [{ id: 'reward', reward_name: 'Reward bottle', code: 'REWARD-1', status: 'issued' }],
  } }));
  await page.goto('/admin#operations');
  await expect(page.getByRole('heading', { name: 'Partner approvals', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve partner', exact: true })).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirm payment', exact: true })).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel order', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirm fulfilled', exact: true })).toBeDisabled();
  await page.getByLabel('Fulfillment or cancellation note').fill('Collected by customer');
  await expect(page.getByRole('button', { name: 'Confirm fulfilled', exact: true })).toBeEnabled();
});

const analyticsFixture = {
  period: '30d', range: { from: '2026-10-01T00:00:00Z', to: '2026-10-02T12:00:00Z', label: 'Last 30 days' },
  commerce: { orders: 3, revenueNgn: 30000, aovNgn: 10000, refundedNgn: 0, byStatus: [{ status: 'paid', count: 3 }], trend: [{ day: '2026-10-01', orders: 1, revenueNgn: 10000 }, { day: '2026-10-02', orders: 2, revenueNgn: 20000 }], topSkus: [{ sku: 'drink', name: 'Test drink', qty: 3, revenueNgn: 30000 }] },
  engagement: { triviaEntries: 2, triviaWins: 1, brandEnquiries: 0, restockAlerts: 1, productReviews: 2 },
  loyalty: { members: 4, pointsOutstanding: 200, pointsLiabilityNgn: 100, pointsAwardedInPeriod: 20 },
  inventory: { activeSkus: 2, lowStock: 1, onHandUnits: 25 },
  api: { configured: true, totalHits: 100, totalBlocked: 5, routes: [{ route: 'orders:create', hits: 100, blocked: 5 }], days: [{ day: '2026-10-01', hits: 100, blocked: 5 }] },
  systems: { redis: true, ai: false, blob: true, flutterwave: true },
};
test('analytics charts expose exact values and tables work across views', async ({ page }) => {
  await enter(page, true);
  await page.route('**/api/admin/analytics?*', route => route.fulfill({ json: analyticsFixture }));
  await page.goto('/admin#analytics');
  await expect(page.getByRole('table', { name: 'Daily commerce values' })).toContainText('₦20,000');
  await page.screenshot({ path: `/tmp/convivia-admin-analytics-${page.viewportSize()?.width}.png`, fullPage: true });
  await page.getByRole('button', { name: '2026-10-01: ₦10,000', exact: true }).focus();
  await expect(page.getByRole('group', { name: /Net revenue chart/ })).toBeVisible();
  await page.getByRole('combobox', { name: 'Chart measure', exact: true }).selectOption('orders');
  await expect(page.getByRole('button', { name: '2026-10-02: 2', exact: true })).toBeVisible();
  await page.getByRole('group', { name: /Collected orders chart/ }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `/tmp/convivia-admin-chart-${page.viewportSize()?.width}.png` });
  await page.getByRole('button', { name: 'Commerce', exact: true }).click();
  await expect(page.getByRole('table', { name: 'Top products' })).toContainText('Test drink');
  await page.getByRole('button', { name: 'API usage', exact: true }).click();
  await expect(page.getByRole('table', { name: 'API route usage' })).toContainText('5.0%');
  await page.getByRole('button', { name: 'Engagement', exact: true }).click();
  await expect(page.getByRole('table', { name: 'Customer engagement values' })).toContainText('Product reviews');
});

test('adding another courier stays in delivery settings and saves its contact', async ({ page }) => {
  await enter(page, true);
  const providers: Record<string, unknown>[] = []; let saved: Record<string, unknown> | null = null;
  await page.route('**/api/admin/delivery', route => {
    if (route.request().method() === 'POST') {
      saved = route.request().postDataJSON(); providers.push({ id: 'courier-new', name: saved?.name, contact: saved?.contact, active: true });
      return route.fulfill({ json: { saved: providers[0] } });
    }
    return route.fulfill({ json: { zones: [], providers } });
  });
  await page.goto('/admin#delivery');
  await page.getByRole('button', { name: 'Add courier', exact: true }).click();
  await expect(page).toHaveURL(/#delivery$/);
  await page.getByLabel('Provider name').fill('Second courier');
  await page.getByLabel('Provider contact').fill('08012345678');
  await page.getByRole('button', { name: 'Add courier provider', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Delivery settings saved.');
  await expect(page.getByText('Second courier · Enabled')).toBeVisible();
  expect(saved).toMatchObject({ kind: 'provider', name: 'Second courier', contact: '08012345678', active: true });
});

test('partner onboarding displays the full submitted venue details', async ({ page }) => {
  await enter(page, true);
  await page.route('**/api/admin/operations', route => route.fulfill({ json: { outlets: [{ id: 'venue', venue_name: 'New partner', email: 'venue@example.com', contact: '08055555555', area: 'Victoria Island', venue_kind: 'lounge', seats: 80, target_margin_pct: 72, approval_status: 'pending', created_at: '2026-10-01T12:00:00Z' }], wholesale: [], rewards: [] } }));
  await page.goto('/admin#operations');
  await expect(page.getByText('Onboarding details', { exact: true })).toBeVisible();
  await expect(page.getByText('08055555555', { exact: true })).toBeVisible();
  await expect(page.getByText('Victoria Island', { exact: true })).toBeVisible();
  await expect(page.getByText('80', { exact: true })).toBeVisible();
});

test('malformed admin records show a recoverable error instead of a crashed page', async ({ page }) => {
  await enter(page, true);
  await page.route('**/api/admin/staff', route => route.fulfill({ json: { staff: null, audit: [] } }));
  await page.goto('/admin#staff');
  await expect(page.getByRole('alert').filter({ hasText: 'incomplete records' })).toBeVisible();
  await page.route('**/api/admin/staff', route => route.fulfill({ json: { staff: [], audit: [] } }));
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Grant staff access' })).toBeVisible();
});

test('analytics ignores a late response from the previous reporting period', async ({ page }) => {
  await enter(page, true);
  await page.route('**/api/admin/analytics?*', async route => {
    const period = new URL(route.request().url()).searchParams.get('period');
    if (period === '30d') await new Promise(resolve => setTimeout(resolve, 800));
    return route.fulfill({ json: { ...analyticsFixture, period, range: { ...analyticsFixture.range, label: period === '7d' ? 'Last 7 days' : 'Last 30 days' } } });
  });
  await page.goto('/admin#analytics');
  const slow = page.waitForResponse(response => response.url().includes('/api/admin/analytics?period=30d'));
  await page.getByRole('combobox', { name: 'Reporting period', exact: true }).selectOption('7d');
  await expect(page.getByText(/Last 7 days ·/)).toBeVisible();
  await slow;
  await expect(page.getByText(/Last 30 days ·/)).not.toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Reporting period', exact: true })).toHaveValue('7d');
});

test('admin summary failure shows retry instead of assuming owner access', async ({ page }) => {
  await enter(page, true);
  await page.route('**/api/admin/summary', route => route.fulfill({ status: 500, json: { error: 'Desk database unavailable.' } }));
  await page.goto('/admin#staff');
  await expect(page.getByRole('alert').filter({ hasText: 'Desk database unavailable.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Grant staff access' })).not.toBeVisible();
  await page.route('**/api/admin/summary', route => route.fulfill({ json: { staffRole: 'owner', todayOrders: 0, todayRevenueNgn: 0 } }));
  await page.route('**/api/admin/staff', route => route.fulfill({ json: { staff: [], audit: [] } }));
  await page.getByRole('button', { name: 'Retry opening desk' }).click();
  await expect(page.getByRole('heading', { name: 'Grant staff access' })).toBeVisible();
});

test('bookmarked owner-only sections stay protected for operations staff', async ({ page }) => {
  await enter(page, true);
  await page.route('**/api/admin/summary', route => route.fulfill({ json: { staffRole: 'operations', todayOrders: 0, todayRevenueNgn: 0 } }));
  await page.goto('/admin#staff');
  await expect(page.getByRole('alert').filter({ hasText: 'Your staff role does not have access' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Grant staff access' })).not.toBeVisible();
});
