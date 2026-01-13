'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import StatusBadge from '@/components/StatusBadge';
import { Receipt, Calendar, DollarSign, Download, Filter } from 'lucide-react';

export default function ClientInvoices() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, statusFilter]);

  const fetchInvoices = async () => {
    try {
      const token = getToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/invoices', {
        headers,
      });
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Fetch invoices error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    const filtered = statusFilter === 'all' 
      ? invoices 
      : invoices.filter(i => i.status === statusFilter);
    setFilteredInvoices(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black">Invoices</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:mx-0 sm:px-0">
        {['all', 'draft', 'sent', 'paid', 'overdue'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 sm:px-4 py-2 rounded-xl border font-bold uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap transition-all shadow-sm ${
              statusFilter === status
                ? 'bg-red-100 border-red-300 text-red-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-red-300'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading...</div>
      ) : filteredInvoices.length > 0 ? (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-red-300 transition-all cursor-pointer shadow-sm"
              onClick={() => router.push(`/client/jobs/${invoice.booking_id}`)}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                <div className="flex-1 space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Receipt size={20} className="sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-base sm:text-lg font-black text-black truncate">{invoice.invoice_number}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{invoice.service_name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Amount</p>
                      <p className="text-black font-bold">₦{invoice.amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Total</p>
                      <p className="text-red-600 font-bold">₦{invoice.total?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Due Date</p>
                      <p className="text-gray-700">{formatDate(invoice.due_date)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Created</p>
                      <p className="text-gray-700">{formatDate(invoice.created_at)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={invoice.status} size="default" />
                  {invoice.status === 'paid' && invoice.paid_at && (
                    <p className="text-xs text-gray-600">Paid: {formatDate(invoice.paid_at)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <p className="text-gray-600">No invoices found.</p>
        </div>
      )}
    </div>
  );
}
