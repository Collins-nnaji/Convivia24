'use client';
export default function PrintReceipt(){return <button onClick={()=>window.print()} className="btn-brand px-4 py-2 print:hidden">Print / save PDF</button>;}
