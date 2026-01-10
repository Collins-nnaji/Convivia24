'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Users, Search, Mail, Phone, UserPlus, CheckCircle, Clock } from 'lucide-react';

export default function AdminStaff() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      // This would need a staff API endpoint
      // For now, we'll show placeholder
      setStaff([]);
    } catch (error) {
      console.error('Fetch staff error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={32} className="text-red-600" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black">Staff Management</h1>
        </div>
        <button className="px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-wider text-sm flex items-center gap-2 shadow-lg">
          <UserPlus size={20} />
          Add Staff
        </button>
      </div>

      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search staff..."
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading...</div>
      ) : staff.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div key={member.id} className="p-6 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-red-300 transition-all shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                  <Users size={24} className="text-red-600" />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-black uppercase ${member.is_active ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                  {member.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
              <h3 className="text-xl font-black text-black mb-2">
                {member.first_name} {member.last_name}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-red-600" />
                  <span className="text-black">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-red-600" />
                    <span className="text-black">{member.phone}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 text-xs">
                <div>
                  <p className="text-gray-600 mb-1">Jobs</p>
                  <p className="font-black text-black">{member.assigned_jobs || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Completed</p>
                  <p className="font-black text-green-700">{member.completed_jobs || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <Users size={48} className="mx-auto text-gray-400 opacity-50" />
          <p className="text-gray-600">No staff members found.</p>
          <p className="text-sm text-gray-500">Staff management coming soon.</p>
        </div>
      )}
    </div>
  );
}
