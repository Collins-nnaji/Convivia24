'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import JobCard from '@/components/JobCard';
import { Search, Filter } from 'lucide-react';

export default function StaffJobs() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [bookings, statusFilter]);

  const fetchJobs = async () => {
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
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Fetch jobs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    const filtered = statusFilter === 'all' 
      ? bookings 
      : bookings.filter(b => b.status === statusFilter);
    setFilteredBookings(filtered);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black">My Jobs</h1>

      {/* Mobile-Friendly Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'assigned', 'accepted', 'started', 'completed'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl border font-bold uppercase tracking-wider text-xs whitespace-nowrap transition-all shadow-sm ${
              statusFilter === status
                ? 'bg-red-100 border-red-300 text-red-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-red-300'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading...</div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((job, index) => (
            <JobCard key={job.id} job={job} index={index} onClick={() => router.push(`/staff/jobs/${job.id}`)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-600">No jobs found.</div>
      )}
    </div>
  );
}
