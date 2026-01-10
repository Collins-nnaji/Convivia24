'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import StatusBadge from '@/components/StatusBadge';
import { Users, Calendar, CheckCircle, TrendingUp, User } from 'lucide-react';

export default function SupervisorTeam() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      // This would need a team API endpoint
      // For now, we'll show placeholder data
      setTeamMembers([]);
    } catch (error) {
      console.error('Fetch team error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Users size={32} className="text-red-600" />
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black">My Team</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading...</div>
      ) : teamMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="p-6 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-red-300 transition-all shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                  <User size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="font-black text-black">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-xs text-gray-600">{member.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jobs Assigned</span>
                  <span className="font-bold text-black">{member.assigned_jobs || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-bold text-green-700">{member.completed_jobs || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <Users size={48} className="mx-auto text-gray-400 opacity-50" />
          <p className="text-gray-600">No team members found.</p>
          <p className="text-sm text-gray-500">Team management coming soon.</p>
        </div>
      )}
    </div>
  );
}
