'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { User, Mail, Phone, Calendar, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function StaffProfile() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    inProgressJobs: 0,
    pendingJobs: 0,
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
      const response = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const jobs = data.bookings || [];
        setStats({
          totalJobs: jobs.length,
          completedJobs: jobs.filter(j => j.status === 'completed').length,
          inProgressJobs: jobs.filter(j => j.status === 'in_progress').length,
          pendingJobs: jobs.filter(j => j.status === 'pending' || j.status === 'scheduled').length,
        });
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 md:pb-8">
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black">My Profile</h1>

      {/* Personal Info */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-6 shadow-sm">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-black">
          <User size={24} className="text-red-600" />
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">First Name</p>
            <p className="text-lg font-bold text-black">{user?.first_name || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Last Name</p>
            <p className="text-lg font-bold text-black">{user?.last_name || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-2">
              <Mail size={14} className="text-red-600" />
              Email
            </p>
            <p className="text-lg font-bold text-black">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-2">
              <Phone size={14} className="text-red-600" />
              Phone
            </p>
            <p className="text-lg font-bold text-black">{user?.phone || 'Not set'}</p>
          </div>
          {user?.last_login && (
            <div className="md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-2">
                <Calendar size={14} className="text-red-600" />
                Last Login
              </p>
              <p className="text-lg font-bold text-black">
                {new Date(user.last_login).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Stats */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-6 shadow-sm">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-black">
          <TrendingUp size={24} className="text-green-600" />
          Performance Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Total Jobs</p>
            <p className="text-2xl font-black text-black">{stats.totalJobs}</p>
          </div>
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 flex items-center gap-1">
              <CheckCircle size={12} className="text-green-600" />
              Completed
            </p>
            <p className="text-2xl font-black text-green-700">{stats.completedJobs}</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 flex items-center gap-1">
              <Clock size={12} className="text-red-600" />
              In Progress
            </p>
            <p className="text-2xl font-black text-red-700">{stats.inProgressJobs}</p>
          </div>
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Pending</p>
            <p className="text-2xl font-black text-orange-700">{stats.pendingJobs}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
