import {NextResponse} from 'next/server';
import sql from '@/lib/db';
export async function GET(){try{await sql`SELECT 1`;return NextResponse.json({status:'ok'},{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({status:'unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}}
