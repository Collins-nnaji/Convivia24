'use client';
import { useCallback,useEffect,useState,type FormEvent } from 'react';
import { STAFF_ROLES } from '@/lib/admin-permissions';
type Staff={email:string;role:string;active:boolean};
type Audit={id:string;actor:string;action:string;subject:string;created_at:string};
export default function StaffDesk(){
  const [staff,setStaff]=useState<Staff[]>([]);const[audit,setAudit]=useState<Audit[]>([]);const[msg,setMsg]=useState('');const[busy,setBusy]=useState(false);
  const load=useCallback(async()=>{try{const res=await fetch('/api/admin/staff');const data=await res.json();if(!res.ok)throw new Error(data.error);setStaff(data.staff);setAudit(data.audit);}catch(err){setMsg(err instanceof Error?err.message:'Could not load staff.');}},[]);
  useEffect(()=>{void load();},[load]);
  async function update(body:Staff){setBusy(true);try{const res=await fetch('/api/admin/staff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await res.json();if(!res.ok)throw new Error(data.error);await load();setMsg('Staff access updated.');}catch(err){setMsg(err instanceof Error?err.message:'Could not update staff.');}finally{setBusy(false);}}
  function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const data=new FormData(event.currentTarget);void update({email:String(data.get('email')),role:String(data.get('role')),active:true});}
  return <div className="space-y-6"><p role="status">{msg}</p><p className="text-sm">Staff sign in with their own Convivia24 account. Owner allowlist accounts are managed through deployment configuration.</p><form onSubmit={submit} className="flex flex-wrap gap-3"><input className="border rounded px-3 py-2" name="email" type="email" required placeholder="Staff email" aria-label="Staff email"/><select name="role" aria-label="Role" className="border rounded px-3 py-2">{STAFF_ROLES.map(role=><option key={role}>{role}</option>)}</select><button className="btn-brand px-4" disabled={busy}>Grant access</button></form>{staff.map(person=><div className="flex justify-between border-t py-3" key={person.email}><span>{person.email} · {person.role} · {person.active?'active':'revoked'}</span><button disabled={busy} onClick={()=>update({...person,active:!person.active})}>{person.active?'Revoke':'Enable'}</button></div>)}<h3 className="text-lg font-bold">Recent audit history</h3>{audit.map(row=><p className="text-sm border-t py-2" key={row.id}>{new Date(row.created_at).toLocaleString()} · {row.actor} · {row.action} · {row.subject}</p>)}</div>;
}
