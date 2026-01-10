'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import StatusBadge from '@/components/StatusBadge';
import { ShieldCheck, Search, Filter, Calendar, CheckCircle, AlertCircle, Download } from 'lucide-react';

export default function AdminCompliance() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [complianceLogs, setComplianceLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplianceLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [complianceLogs, statusFilter, searchQuery]);

  const fetchComplianceLogs = async () => {
    try {
      const token = getToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/compliance', {
        headers,
      });
      if (response.ok) {
        const data = await response.json();
        setComplianceLogs(data.compliance_logs || []);
      }
    } catch (error) {
      console.error('Fetch compliance logs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = complianceLogs;
    
    if (statusFilter === 'signed_off') {
      filtered = filtered.filter(log => log.sign_off);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(log => !log.sign_off);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.booking_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredLogs(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck size={32} className="text-green-600" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black">Compliance Reports</h1>
        </div>
        <button className="px-6 py-3 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-all uppercase tracking-wider text-sm flex items-center gap-2 shadow-lg">
          <Download size={20} />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search compliance logs..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'signed_off', 'pending'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl border font-bold uppercase tracking-wider text-xs whitespace-nowrap transition-all shadow-sm ${
                statusFilter === status
                  ? 'bg-green-100 border-green-300 text-green-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-green-300'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Compliance Logs */}
      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading...</div>
      ) : filteredLogs.length > 0 ? (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-6 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-green-300 transition-all cursor-pointer shadow-sm"
              onClick={() => router.push(`/admin/jobs/${log.booking_id}`)}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={24} className={log.sign_off ? 'text-green-600' : 'text-orange-600'} />
                    <div>
                      <h3 className="text-lg font-black text-black">{log.business_name || 'Business'}</h3>
                      <p className="text-sm text-gray-600">Booking ID: {log.booking_id?.substring(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Checked By</p>
                      <p className="text-black font-medium">
                        {log.checked_by_first_name} {log.checked_by_last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Verified At</p>
                      <p className="text-gray-700">{formatDate(log.verified_at || log.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Photos</p>
                      <p className="text-black font-medium">{log.photos?.length || 0} photos</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Checklist Items</p>
                      <p className="text-black font-medium">
                        {log.checklist_items?.filter(item => item?.completed || (typeof item === 'object' ? item.completed : false)).length || 0} / {log.checklist_items?.length || 0}
                      </p>
                    </div>
                  </div>
                  {log.non_compliance_notes && (
                    <div className="p-3 rounded-xl bg-orange-100 border border-orange-300">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle size={16} className="text-orange-600" />
                        <p className="text-xs font-bold uppercase tracking-wider text-orange-700">Non-Compliance Notes</p>
                      </div>
                      <p className="text-sm text-gray-700">{log.non_compliance_notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <StatusBadge status={log.sign_off ? 'completed' : 'pending'} size="default" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <ShieldCheck size={48} className="mx-auto text-gray-400 opacity-50" />
          <p className="text-gray-600">No compliance logs found.</p>
        </div>
      )}
    </div>
  );
}
