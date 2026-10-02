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
  await page.getByLabel('City',{exact:true}).selectOption('Lagos');await page.getByLabel('Delivery zone',{exact:true}).selectOption('11111111-1111-4111-8111-111111111111');
  await expect(page.getByText('₦1,500',{exact:true})).toBeVisible();
});
test('admin delivery configuration explains disabled checkout and allows providers',async({page})=>{await enter(page,true);await page.goto('/admin#delivery');await expect(page.getByRole('heading',{name:'Delivery zones'})).toBeVisible();await expect(page.getByLabel('Provider name')).toBeVisible();await expect(page.getByText(/No zones configured/)).toBeVisible();});
