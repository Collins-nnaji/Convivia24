'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import StatusBadge from '@/components/StatusBadge';
import { User, Calendar, MapPin, DollarSign, Users, Save, ArrowLeft } from 'lucide-react';

export default function AdminJobDetails() {
  const router = useRouter();
  const params = useParams();
  const { getToken } = useAuth();
  const [job, setJob] = useState(null);
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchJobDetails();
      fetchStaff();
    }
  }, [params.id]);

  const fetchJobDetails = async () => {
    try {
      const token = getToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`/api/bookings/${params.id}`, {
        headers,
      });
      if (response.ok) {
        const data = await response.json();
        setJob(data.booking);
      }
    } catch (error) {
      console.error('Fetch job error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    // This would need a staff API endpoint
    // For now, placeholder
    setStaff([]);
  };

  const handleAssignStaff = async () => {
    if (!selectedStaff) return;
    
    try {
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`/api/bookings/${params.id}/assign`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ staff_id: selectedStaff }),
      });

      if (response.ok) {
        fetchJobDetails();
        setSelectedStaff('');
      }
    } catch (error) {
      console.error('Assign staff error:', error);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`/api/bookings/${params.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchJobDetails();
      }
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>;
  }

  if (!job) {
    return <div className="text-center py-12 text-gray-600">Job not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors font-bold"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic text-black">Job Management</h1>
        <StatusBadge status={job.status} size="large" />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => handleUpdateStatus('scheduled')}
          disabled={job.status !== 'pending'}
          className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 font-bold uppercase tracking-wider text-xs hover:bg-gray-200 hover:border-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
        >
          Mark Scheduled
        </button>
        <button
          onClick={() => handleUpdateStatus('in_progress')}
          disabled={job.status !== 'scheduled'}
          className="px-4 py-2 rounded-xl bg-red-100 border border-red-300 text-red-700 font-bold uppercase tracking-wider text-xs hover:bg-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-100"
        >
          Start Job
        </button>
        <button
          onClick={() => handleUpdateStatus('completed')}
          disabled={job.status !== 'in_progress'}
          className="px-4 py-2 rounded-xl bg-green-100 border border-green-300 text-green-700 font-bold uppercase tracking-wider text-xs hover:bg-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-100"
        >
          Complete Job
        </button>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-tight text-black">Service</h2>
          <p className="text-lg font-bold text-black">{job.service_name}</p>
          <p className="text-sm text-gray-600">{job.business_name}</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-tight text-black">Cost</h2>
          <p className="text-3xl font-black text-red-600">₦{job.total_cost?.toLocaleString()}</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-tight text-black">Schedule</h2>
          <p className="text-sm text-gray-700">
            Start: {job.scheduled_start ? new Date(job.scheduled_start).toLocaleString() : 'Not set'}
          </p>
          <p className="text-sm text-gray-700">
            End: {job.scheduled_end ? new Date(job.scheduled_end).toLocaleString() : 'Not set'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-tight text-black">Location</h2>
          <p className="text-sm text-gray-700">{job.location_address}</p>
        </div>
      </div>

      {/* Assign Staff */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4 shadow-sm">
        <h2 className="text-xl font-black uppercase tracking-tight text-black">Assign Staff</h2>
        <div className="flex gap-4">
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-200 text-black focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
          >
            <option value="">Select staff member...</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name} - {member.email}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssignStaff}
            disabled={!selectedStaff}
            className="px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
          >
            Assign
          </button>
        </div>

        {/* Current Assignments */}
        {job.assignments && job.assignments.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600">Assigned Staff</h3>
            {job.assignments.map((assignment, index) => (
              <div key={index} className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-black">
                    {assignment.staff_first_name} {assignment.staff_last_name}
                  </p>
                  <p className="text-xs text-gray-600">{assignment.staff_email}</p>
                </div>
                <StatusBadge status={assignment.status} size="small" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Special Instructions */}
      {job.special_instructions && (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-tight mb-4 text-black">Special Instructions</h2>
          <p className="text-gray-700">{job.special_instructions}</p>
        </div>
      )}
    </div>
  );
}
