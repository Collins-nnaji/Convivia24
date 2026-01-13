'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import JobCard from '@/components/JobCard';
import StatusBadge from '@/components/StatusBadge';
import { Calendar, Clock, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

export default function StaffDashboard() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [todayJobs, setTodayJobs] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, in_progress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch jobs in dev mode even without user
    fetchAssignedJobs();
  }, [user]);

  const fetchAssignedJobs = async () => {
    try {
      const token = getToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/bookings', {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        const jobs = data.bookings || [];
        setBookings(jobs);
        
        // Filter today's jobs
        const today = new Date().toDateString();
        const todayFiltered = jobs.filter(job => {
          if (!job.scheduled_start) return false;
          const jobDate = new Date(job.scheduled_start).toDateString();
          return jobDate === today;
        });
        setTodayJobs(todayFiltered);
        
        // Calculate stats
        setStats({
          total: jobs.length,
          today: todayFiltered.length,
          in_progress: jobs.filter(j => j.status === 'in_progress').length,
          completed: jobs.filter(j => j.status === 'completed').length,
        });
      }
    } catch (error) {
      console.error('Fetch jobs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Jobs', value: stats.total, icon: Calendar, color: 'blue' },
    { label: "Today's Jobs", value: stats.today, icon: Clock, color: 'yellow' },
    { label: 'In Progress', value: stats.in_progress, icon: CheckCircle, color: 'purple' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'green' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter italic mb-2 text-black">My Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Welcome, {user?.first_name || user?.email?.split('@')[0] || 'Staff Member'}</p>
      </div>

      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-red-300 transition-all shadow-sm"
          >
            <stat.icon size={18} className="sm:w-5 sm:h-5 text-red-600 mb-2 sm:mb-3" />
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">{stat.label}</p>
            <p className="text-lg sm:text-xl md:text-2xl font-black text-black">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Today's Jobs */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight italic text-black">Today's Jobs</h2>
          <button
            onClick={() => router.push('/staff/jobs')}
            className="text-sm font-bold uppercase tracking-wider text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
          >
            View All
            <ArrowRight size={16} />
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading...</div>
        ) : todayJobs.length > 0 ? (
          <div className="space-y-4">
            {todayJobs.map((job, index) => (
              <JobCard key={job.id} job={job} index={index} onClick={() => router.push(`/staff/jobs/${job.id}`)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p>No jobs scheduled for today.</p>
            <p className="text-sm text-gray-500 mt-2">Check back later or view all jobs.</p>
          </div>
        )}
      </div>
    </div>
  );
}
