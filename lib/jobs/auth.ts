import { timingSafeEqual } from 'node:crypto';
export function cronAuthorised(req: { headers: { get(name:string):string|null } }): boolean {
  const expected=process.env.CRON_SECRET||'';const given=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'')||'';
  return !!expected&&!!given&&Buffer.byteLength(expected)===Buffer.byteLength(given)&&timingSafeEqual(Buffer.from(expected),Buffer.from(given));
}
