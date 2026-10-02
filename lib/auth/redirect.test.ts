import {describe,it,expect} from 'vitest';
import {safeReturnPath} from './redirect';
describe('authentication return URLs',()=>{
  it.each(['https://evil.example','//evil.example','/\\evil.example','/\n/evil.example','javascript:alert(1)'])('rejects external or ambiguous path %j',path=>{expect(safeReturnPath(path,'/my-account')).toBe('/my-account');});
  it('preserves the intended local checkout and query',()=>{expect(safeReturnPath('/checkout?event=test')).toBe('/checkout?event=test');});
});
