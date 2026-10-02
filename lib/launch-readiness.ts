export type ReadinessCheck={name:string;ok:boolean;detail:string};
export function readinessFailureMessage(err: unknown): string {
  const code = err && typeof err === 'object' && 'code' in err ? err.code : undefined;
  if (code === '42P01' || code === '42703' || code === '42883') {
    return 'The database used by this app is missing required schema. Run npm run db:migrate with the DATABASE_URL used by this deployment, then refresh checks.';
  }
  if (code === '42501') {
    return 'The app database role cannot read the readiness tables. Check its database permissions.';
  }
  return 'Readiness checks could not reach or query the app database. Check the deployment DATABASE_URL and server logs for the underlying error.';
}
export function configurationChecks(env:Record<string,string|undefined>):ReadinessCheck[]{
  const required=['DATABASE_URL','NEON_AUTH_BASE_URL','CONVIVIA_ADMIN_EMAILS','RESEND_API_KEY','RESEND_FROM','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','CRON_SECRET'];
  const details: Record<string, string> = {
    DATABASE_URL: 'Connect this deployment to the migrated application database.',
    NEON_AUTH_BASE_URL: 'Set the authentication service URL so customers and staff can sign in.',
    CONVIVIA_ADMIN_EMAILS: 'Set the owner account emails that can access the admin desk.',
    RESEND_API_KEY: 'Configure the email service for customer notifications.',
    RESEND_FROM: 'Set a verified sender address for order and support notifications.',
    UPSTASH_REDIS_REST_URL: 'Configure the Redis endpoint used for rate limits.',
    UPSTASH_REDIS_REST_TOKEN: 'Set the access token for the configured Redis endpoint.',
    CRON_SECRET: 'Set the secret used to authorize scheduled payment and notification jobs.',
  };
  const checks=required.map(name=>({name,ok:!!env[name]?.trim(),detail:details[name]}));
  checks.push({name:'NEON_AUTH_COOKIE_SECRET',ok:(env.NEON_AUTH_COOKIE_SECRET?.length||0)>=32,detail:'Must contain at least 32 characters.'});
  checks.push({name:'Payment configuration',ok:!!(env.FLUTTERWAVE_SECRET_KEY&&env.FLUTTERWAVE_SECRET_HASH)||env.ALLOW_MANUAL_PAYMENTS==='true',detail:'Flutterwave needs both credentials; manual payments must be enabled explicitly.'});
  checks.push({name:'Public HTTPS origin',ok:!!env.NEXT_PUBLIC_APP_URL?.startsWith('https://'),detail:'Set the actual deployed HTTPS origin.'});
  checks.push({name:'Events enabled',ok:env.NEXT_PUBLIC_EVENTS_ENABLED==='true',detail:'Required for the agreed full-platform launch.'});
  return checks;
}
