export type ReadinessCheck={name:string;ok:boolean;detail:string};
export function configurationChecks(env:Record<string,string|undefined>):ReadinessCheck[]{
  const required=['DATABASE_URL','NEON_AUTH_BASE_URL','CONVIVIA_ADMIN_EMAILS','RESEND_API_KEY','RESEND_FROM','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','CRON_SECRET'];
  const checks=required.map(name=>({name,ok:!!env[name]?.trim(),detail:'Required for launch.'}));
  checks.push({name:'NEON_AUTH_COOKIE_SECRET',ok:(env.NEON_AUTH_COOKIE_SECRET?.length||0)>=32,detail:'Must contain at least 32 characters.'});
  checks.push({name:'Payment configuration',ok:!!(env.FLUTTERWAVE_SECRET_KEY&&env.FLUTTERWAVE_SECRET_HASH)||env.ALLOW_MANUAL_PAYMENTS==='true',detail:'Flutterwave needs both credentials; manual payments must be enabled explicitly.'});
  checks.push({name:'Public HTTPS origin',ok:!!env.NEXT_PUBLIC_APP_URL?.startsWith('https://'),detail:'Set the actual deployed HTTPS origin.'});
  checks.push({name:'Events enabled',ok:env.NEXT_PUBLIC_EVENTS_ENABLED==='true',detail:'Required for the agreed full-platform launch.'});
  return checks;
}
