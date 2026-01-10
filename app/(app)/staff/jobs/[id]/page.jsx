'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ComplianceChecklist from '@/components/ComplianceChecklist';
import StatusBadge from '@/components/StatusBadge';
import { Calendar, MapPin, DollarSign, Clock, ArrowLeft, Save, CheckCircle, Camera } from 'lucide-react';

export default function StaffJobDetails() {
  const router = useRouter();
  const params = useParams();
  const { getToken } = useAuth();
  const [job, setJob] = useState(null);
  const [checklist, setChecklist] = useState({ items: [], photos: [] });
  const [status, setStatus] = useState('assigned');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchJobDetails();
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
        setStatus(data.booking?.assignment_status || 'assigned');
        
        // Load existing compliance log if available
        if (data.booking?.compliance_logs && data.booking.compliance_logs.length > 0) {
          const latestLog = data.booking.compliance_logs[0];
          setChecklist({
            items: latestLog.checklist_items || [],
            photos: latestLog.photos || [],
          });
        }
      }
    } catch (error) {
      console.error('Fetch job error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
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
        body: JSON.stringify({ 
          status: newStatus === 'accepted' ? 'scheduled' : newStatus === 'started' ? 'in_progress' : job.status,
          ...(newStatus === 'started' && { actual_start: new Date().toISOString() }),
          ...(newStatus === 'completed' && { actual_end: new Date().toISOString() }),
        }),
      });

      if (response.ok) {
        setStatus(newStatus);
        fetchJobDetails();
      }
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const handleChecklistUpdate = (data) => {
    setChecklist(data);
  };

  const handleSaveChecklist = async () => {
    setSaving(true);
    try {
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await fetch('/api/compliance', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          booking_id: params.id,
          checklist_items: checklist.items,
          photos: checklist.photos.map(p => p.url || p),
          sign_off: false,
        }),
      });
      
      // Update job status if checklist is complete
      const allCompleted = checklist.items.every(item => item.completed || (typeof item === 'object' ? item.completed : false));
      if (allCompleted && checklist.items.length > 0) {
        handleStatusUpdate('completed');
      }
    } catch (error) {
      console.error('Save checklist error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>;
  }

  if (!job) {
    return <div className="text-center py-12 text-gray-600">Job not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 md:pb-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors font-bold"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Status Actions - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row gap-3">
        {status === 'assigned' && (
          <button
            onClick={() => handleStatusUpdate('accepted')}
            className="px-6 py-3 bg-gray-600 text-white font-black rounded-xl hover:bg-gray-700 transition-all uppercase tracking-wider text-sm"
          >
            Accept Job
          </button>
        )}
        {(status === 'accepted' || status === 'assigned') && (
          <button
            onClick={() => handleStatusUpdate('started')}
            className="px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-wider text-sm"
          >
            Start Job
          </button>
        )}
        {status === 'started' && (
          <button
            onClick={() => handleStatusUpdate('completed')}
            className="px-6 py-3 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-all uppercase tracking-wider text-sm"
          >
            Complete Job
          </button>
        )}
        <StatusBadge status={job.status} size="default" />
      </div>

      {/* Job Info - Mobile Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="p-4 md:p-6 rounded-2xl bg-white border border-gray-200 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-black">Service</h2>
          <p className="text-base md:text-lg font-bold text-black">{job.service_name}</p>
          <p className="text-sm text-gray-600">{job.business_name}</p>
        </div>

        <div className="p-4 md:p-6 rounded-2xl bg-white border border-gray-200 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-black">Schedule</h2>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar size={16} className="text-red-600" />
            <span className="text-black">{job.scheduled_start ? new Date(job.scheduled_start).toLocaleString() : 'Not set'}</span>
          </div>
        </div>

        <div className="p-4 md:p-6 rounded-2xl bg-white border border-gray-200 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-black">Location</h2>
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <MapPin size={16} className="text-red-600 mt-1 flex-shrink-0" />
            <span className="text-black">{job.location_address}</span>
          </div>
        </div>

        <div className="p-4 md:p-6 rounded-2xl bg-white border border-gray-200 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-black">Cost</h2>
          <p className="text-2xl md:text-3xl font-black text-red-600">₦{job.total_cost?.toLocaleString()}</p>
        </div>
      </div>

      {/* Special Instructions */}
      {job.special_instructions && (
        <div className="p-4 md:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h2 className="text-lg md:text-xl font-black uppercase tracking-tight mb-3 text-black">Special Instructions</h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">{job.special_instructions}</p>
        </div>
      )}

      {/* Compliance Checklist - Mobile Optimized */}
      {status === 'started' || status === 'completed' ? (
        <div className="p-4 md:p-6 rounded-2xl bg-white border border-gray-200 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-black">Compliance Checklist</h2>
            {status === 'started' && (
              <button
                onClick={handleSaveChecklist}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-all uppercase tracking-wider text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
          <ComplianceChecklist
            items={checklist.items}
            photos={checklist.photos}
            onUpdate={handleChecklistUpdate}
            readOnly={status === 'completed'}
            serviceType={job.service_type}
          />
        </div>
      ) : (
        <div className="p-4 md:p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center text-gray-600 shadow-sm">
          <p>Start the job to access the compliance checklist.</p>
        </div>
      )}
    </div>
  );
}
