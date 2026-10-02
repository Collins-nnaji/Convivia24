import {beforeEach,describe,expect,it,vi} from 'vitest';
import {NextRequest} from 'next/server';
const mocks=vi.hoisted(()=>({user:vi.fn(),sql:vi.fn(),age:vi.fn(),init:vi.fn()}));
vi.mock('@/lib/auth/session',()=>({getCurrentUser:mocks.user}));
vi.mock('@/lib/db',()=>({default:mocks.sql,apiErrorResponse:()=>({status:500,error:'Error'})}));
vi.mock('@/lib/age-gate',()=>({AGE_GATE_COOKIE:'age',verifyAgeToken:mocks.age}));
vi.mock('@/lib/redis',()=>({rateLimit:async()=>({ok:true}),clientIp:()=> 'test'}));
vi.mock('@/lib/payments/flutterwave',()=>({flutterwaveSecret:()=> 'test-provider-key',initializeFlutterwavePayment:mocks.init}));
import {POST} from '@/app/api/stripe/checkout/route';
const orderId='11111111-1111-4111-8111-111111111111';
const request=()=>new NextRequest('https://convivia24.example/api/stripe/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId})});
beforeEach(()=>{vi.clearAllMocks();mocks.age.mockResolvedValue(true);mocks.user.mockResolvedValue({id:'buyer',email:'buyer@example.com'});mocks.sql.mockResolvedValue([]);});
describe('checkout payment authorization',()=>{
  it('rejects bypassing the server age declaration',async()=>{mocks.age.mockResolvedValue(false);expect((await POST(request())).status).toBe(403);expect(mocks.sql).not.toHaveBeenCalled();expect(mocks.init).not.toHaveBeenCalled();});
  it('requires a signed-in buyer',async()=>{mocks.user.mockResolvedValue(null);expect((await POST(request())).status).toBe(401);expect(mocks.init).not.toHaveBeenCalled();});
  it('does not expose or charge another account’s order',async()=>{expect((await POST(request())).status).toBe(404);expect(mocks.sql.mock.calls[0]).toContain('buyer@example.com');expect(mocks.init).not.toHaveBeenCalled();});
  it('does not initiate payment for a closed order',async()=>{mocks.sql.mockResolvedValue([{id:orderId,status:'cancelled'}]);expect((await POST(request())).status).toBe(400);expect(mocks.init).not.toHaveBeenCalled();});
  it('does not charge an already delivered order again',async()=>{mocks.sql.mockResolvedValue([{id:orderId,status:'delivered'}]);const res=await POST(request());expect(res.status).toBe(200);expect(await res.json()).toMatchObject({alreadyPaid:true});expect(mocks.init).not.toHaveBeenCalled();});
});
