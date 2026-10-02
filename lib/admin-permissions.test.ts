import {describe,it,expect} from 'vitest';
import {hasAdminPermission} from './admin-permissions';
describe('staff boundaries',()=>{
  it('restricts operations financial and staff mutations',()=>{expect(hasAdminPermission('operations','orders')).toBe(true);expect(hasAdminPermission('operations','finance')).toBe(false);expect(hasAdminPermission('operations','owner')).toBe(false);});
  it('restricts finance inventory and editorial mutations',()=>{expect(hasAdminPermission('finance','finance')).toBe(true);expect(hasAdminPermission('finance','inventory')).toBe(false);expect(hasAdminPermission('finance','content')).toBe(false);});
  it('restricts content commerce mutations',()=>{expect(hasAdminPermission('content','content')).toBe(true);expect(hasAdminPermission('content','orders')).toBe(false);expect(hasAdminPermission('content','operations')).toBe(false);});
});
