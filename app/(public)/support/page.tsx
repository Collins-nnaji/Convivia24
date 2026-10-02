import SupportPanel from '@/components/account/SupportPanel';
export default async function Page({searchParams}:{searchParams:Promise<{order?:string}>}){const params=await searchParams;return <section className="mx-auto max-w-2xl px-5 py-12"><h1 className="text-3xl font-bold mb-5">Customer support</h1><SupportPanel orderId={params.order}/></section>;}
