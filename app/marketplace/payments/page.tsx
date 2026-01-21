'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Plus, Download, ChevronRight, 
  CheckCircle2, Clock, ShieldCheck, Wallet,
  History, Building2
} from 'lucide-react';

const mockCards = [
  { id: 1, type: 'Visa', last4: '4242', expiry: '12/26', isDefault: true },
  { id: 2, type: 'Mastercard', last4: '8812', expiry: '09/25', isDefault: false },
];

const mockInvoices = [
  { id: 'INV-001', date: 'Oct 24, 2024', amount: '₦24,500', status: 'PAID' },
  { id: 'INV-002', date: 'Oct 20, 2024', amount: '₦32,000', status: 'PAID' },
  { id: 'INV-003', date: 'Oct 15, 2024', amount: '₦18,750', status: 'PAID' },
];

export default function PaymentsPage() {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter">Payments & Billing</h1>
        <p className="text-zinc-500 font-medium text-sm">Manage your payment methods and download invoices.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* Payment Methods */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest italic flex items-center gap-2">
                <CreditCard size={16} className="text-red-700" />
                Saved Cards
              </h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-red-700 hover:text-red-800 flex items-center gap-1">
                <Plus size={14} /> Add New
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {mockCards.map((card) => (
                <div key={card.id} className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    {card.isDefault && (
                      <span className="text-[8px] font-black uppercase tracking-widest bg-zinc-900 text-white px-2 py-1 rounded-full">Default</span>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center">
                      <Wallet size={20} className="text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">•••• •••• •••• {card.last4}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Expires {card.expiry}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Billing History */}
          <section className="space-y-6">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest italic border-b border-zinc-100 pb-4 flex items-center gap-2">
              <History size={16} className="text-red-700" />
              Invoice History
            </h3>
            <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Invoice</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {mockInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-zinc-900">{invoice.id}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-zinc-500">{invoice.date}</td>
                      <td className="px-6 py-4 text-xs font-bold text-zinc-900">{invoice.amount}</td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 text-green-700 text-[8px] font-black uppercase tracking-widest">
                          <CheckCircle2 size={10} /> {invoice.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-red-700 transition-all">
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Corporate Billing Scaffold */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-zinc-900 text-white space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Building2 size={80} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight italic">Business Account?</h3>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Enable corporate billing to manage team trips, set monthly spending limits, and receive consolidated VAT invoices.
            </p>
            <button className="w-full py-4 rounded-2xl bg-red-700 text-white text-xs font-black uppercase tracking-widest hover:bg-red-800 transition-all">
              Upgrade to Business
            </button>
          </div>

          <div className="p-8 rounded-3xl border border-zinc-200 bg-white space-y-4 shadow-sm">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Wallet Balance</h4>
            <p className="text-3xl font-black text-zinc-900 tracking-tighter">₦0.00</p>
            <button className="w-full py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all">
              Top Up Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
