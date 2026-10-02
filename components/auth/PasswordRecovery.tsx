'use client';
import { useState,type FormEvent } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth/client';
export default function PasswordRecovery({token}:{token?:string}){
  const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[message,setMessage]=useState('');const[busy,setBusy]=useState(false);
  async function submit(event:FormEvent){event.preventDefault();setBusy(true);setMessage('');try{
    const result=token?await authClient.resetPassword({token,newPassword:password}):await authClient.requestPasswordReset({email,redirectTo:new URL('/reset-password',window.location.origin).toString()});
    if(result.error)throw new Error(result.error.message||'Could not complete this request.');setMessage(token?'Password updated. You can sign in now.':'If an account exists, a reset link will be sent to that email.');
  }catch(err){setMessage(err instanceof Error?err.message:'Please try again.');}finally{setBusy(false);}}
  return <section className="min-h-[65vh] bg-paper px-5 py-16"><div className="mx-auto max-w-md rounded-xl bg-white p-7"><h1 className="text-2xl font-bold mb-4">{token?'Choose a new password':'Reset your password'}</h1><form onSubmit={submit} className="space-y-4">{token?<label className="block">New password<input className="block w-full rounded border mt-2 p-3" required type="password" minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>:<label className="block">Email<input className="block w-full rounded border mt-2 p-3" required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>}<button className="btn-brand w-full py-3" disabled={busy}>{busy?'Please wait…':token?'Save password':'Send reset link'}</button></form><p className="mt-4 text-sm" role="status">{message}</p><Link className="mt-4 inline-block text-ember" href="/signin">Back to sign in</Link></div></section>;
}
