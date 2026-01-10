'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import JobCard from '@/components/JobCard';
import { Search, Filter, ClipboardCheck } from 'lucide-react';

export default function SupervisorJobs() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [pendingChecks, setPendingChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

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
        const jobs = data.bookings || [];
        setBookings(jobs);
        // Filter jobs that need quality checks (completed but not signed off)
        const pending = jobs.filter(job => 
          job.status === 'completed' && 
          (!job.compliance_logs || job.compliance_logs.length === 0 || !job.compliance_logs[0]?.sign_off)
        );
        setPendingChecks(pending);
      }
    } catch (error) {
      console.error('Fetch jobs error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <ClipboardCheck size={32} className="text-green-600" />
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black">Quality Checks</h1>
      </div>

      {/* Pending Checks */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight italic text-black">Pending Quality Checks</h2>
        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading...</div>
        ) : pendingChecks.length > 0 ? (
          <div className="space-y-4">
            {pendingChecks.map((job, index) => (
              <JobCard key={job.id} job={job} index={index} onClick={() => router.push(`/supervisor/jobs/${job.id}`)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p>No jobs pending quality checks.</p>
          </div>
        )}
      </div>

      {/* All Team Jobs */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight italic text-black">All Team Jobs</h2>
        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading...</div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.slice(0, 10).map((job, index) => (
              <JobCard key={job.id} job={job} index={index} onClick={() => router.push(`/supervisor/jobs/${job.id}`)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">No jobs found.</div>
        )}
      </div>
    </div>
  );
}
