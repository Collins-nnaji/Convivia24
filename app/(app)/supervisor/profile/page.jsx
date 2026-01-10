'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { User, Mail, Phone, Calendar, ClipboardCheck, Users, CheckCircle } from 'lucide-react';

export default function SupervisorProfile() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [stats, setStats] = useState({
    totalChecks: 0,
    completedChecks: 0,
    pendingChecks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const token = getToken();
      const response = await fetch('/api/compliance', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const logs = data.compliance_logs || [];
        setStats({
          totalChecks: logs.length,
          completedChecks: logs.filter(l => l.sign_off).length,
          pendingChecks: logs.filter(l => !l.sign_off).length,
        });
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black">Supervisor Profile</h1>

      {/* Personal Info */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-6 shadow-sm">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-black">
          <User size={24} className="text-red-600" />
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Name</p>
            <p className="text-lg font-bold text-black">
              {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email?.split('@')[0]}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-2">
              <Mail size={14} className="text-red-600" />
              Email
            </p>
            <p className="text-lg font-bold text-black">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Quality Check Stats */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-6 shadow-sm">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-black">
          <ClipboardCheck size={24} className="text-green-600" />
          Quality Check Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Total Checks</p>
            <p className="text-2xl font-black text-black">{stats.totalChecks}</p>
          </div>
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 flex items-center gap-1">
              <CheckCircle size={12} className="text-green-600" />
              Completed
            </p>
            <p className="text-2xl font-black text-green-700">{stats.completedChecks}</p>
          </div>
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Pending</p>
            <p className="text-2xl font-black text-orange-700">{stats.pendingChecks}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
