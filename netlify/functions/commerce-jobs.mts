import type {Config} from '@netlify/functions';
export default async function handler(){
  const base=process.env.URL||process.env.NEXT_PUBLIC_APP_URL;
  const secret=process.env.CRON_SECRET;
  if(!base||!secret)throw new Error('Commerce scheduler requires app URL and CRON_SECRET.');
  const res=await fetch(`${base.replace(/\/$/,'')}/api/cron/commerce`,{method:'POST',headers:{Authorization:`Bearer ${secret}`},signal:AbortSignal.timeout(55000)});
  if(!res.ok)throw new Error(`Commerce worker returned ${res.status}`);
}
export const config:Config={schedule:'*/5 * * * *'};
