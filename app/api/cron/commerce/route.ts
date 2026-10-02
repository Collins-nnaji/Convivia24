import {NextRequest,NextResponse} from 'next/server';
import {cronAuthorised} from '@/lib/jobs/auth';
import {runCommerceJobs} from '@/lib/jobs/worker';
import {captureApiError} from '@/lib/sentry';
export async function POST(req:NextRequest){if(!cronAuthorised(req))return NextResponse.json({error:'Unauthorised'},{status:401});try{return NextResponse.json(await runCommerceJobs());}catch(err){captureApiError(err,{route:'cron/commerce'});return NextResponse.json({error:'Commerce worker failed.'},{status:500});}}

export const maxDuration=60;
export const runtime='nodejs';
