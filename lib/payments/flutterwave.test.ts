import {describe,it,expect} from 'vitest';
import {flutterwavePaid,refundCompleted} from './flutterwave';
describe('verified payment matching',()=>{
  const paid={id:123,tx_ref:'order-reference',amount:42000,currency:'NGN',status:'successful'};
  it('accepts only the exact charge and stored reference',()=>{expect(flutterwavePaid(paid,42000,'order-reference')).toBe(true);});
  it.each([{currency:'USD'},{amount:42001},{amount:41999},{tx_ref:'another-order'},{status:'pending'},{status:'failed'}])('rejects provider mismatch %j',patch=>{expect(flutterwavePaid({...paid,...patch},42000,'order-reference')).toBe(false);});
  it('never treats a missing verification or invalid charge as paid',()=>{expect(flutterwavePaid(null,42000,'order-reference')).toBe(false);expect(flutterwavePaid(paid,NaN,'order-reference')).toBe(false);expect(flutterwavePaid({...paid,amount:0},0,'order-reference')).toBe(false);});
  it('distinguishes an accepted refund from completed return of funds',()=>{expect(refundCompleted('pending')).toBe(false);expect(refundCompleted('processing')).toBe(false);expect(refundCompleted('completed-bank-transfer')).toBe(true);});
});
