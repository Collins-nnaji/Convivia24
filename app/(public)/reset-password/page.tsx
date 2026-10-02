import PasswordRecovery from '@/components/auth/PasswordRecovery';
import Link from 'next/link';
export default async function Page({searchParams}:{searchParams:Promise<{token?:string;error?:string}>}){const params=await searchParams;if(!params.token||params.error)return <section className="px-5 py-16 text-center"><h1 className="text-2xl font-bold">Reset link is invalid or expired</h1><Link href="/forgot-password" className="text-ember mt-4 inline-block">Request a new link</Link></section>;return <PasswordRecovery token={params.token}/>;}
