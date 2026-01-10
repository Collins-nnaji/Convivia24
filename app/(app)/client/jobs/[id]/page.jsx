'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import StatusBadge from '@/components/StatusBadge';
import ComplianceChecklist from '@/components/ComplianceChecklist';
import { Calendar, MapPin, DollarSign, User, Phone, Mail, Clock, AlertCircle } from 'lucide-react';

export default function JobDetails() {
  const router = useRouter();
  const params = useParams();
  const { getToken } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (error) {
      console.error('Fetch job error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>;
  }

  if (!job) {
    return <div className="text-center py-12 text-gray-600">Job not found</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 font-bold"
        >
          ← Back
        </button>
        <StatusBadge status={job.status} size="large" />
      </div>

      {/* Job Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4 shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-4">Service Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Service</p>
              <p className="text-lg font-bold text-black">{job.service_name}</p>
              <p className="text-sm text-gray-600 capitalize">{job.service_type}</p>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <AlertCircle size={16} className="text-orange-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Urgency</p>
                <p className="text-sm font-medium capitalize">{job.urgency}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4 shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-4">Schedule</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar size={16} className="text-red-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Start</p>
                <p className="text-sm font-medium text-black">{formatDate(job.scheduled_start)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Clock size={16} className="text-red-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">End</p>
                <p className="text-sm font-medium text-black">{formatDate(job.scheduled_end || job.scheduled_start)}</p>
              </div>
            </div>
            {job.actual_start && (
              <div className="flex items-center gap-3 text-gray-700">
                <Clock size={16} className="text-green-600" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Actual Start</p>
                  <p className="text-sm font-medium text-black">{formatDate(job.actual_start)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4 shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-4">Location</h2>
          <div className="flex items-start gap-3 text-gray-700">
            <MapPin size={16} className="text-red-600 mt-1" />
            <p className="text-sm font-medium text-black">{job.location_address}</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4 shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-4">Cost</h2>
          <div className="flex items-center gap-3 text-black">
            <DollarSign size={24} className="text-red-600" />
            <p className="text-3xl font-black">₦{job.total_cost?.toLocaleString() || '0'}</p>
          </div>
          <p className="text-xs text-gray-600">Payment Status: <StatusBadge status={job.payment_status || 'pending'} size="small" /></p>
        </div>
      </div>

      {/* Staff Assignments */}
      {job.assignments && job.assignments.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4 shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-4">Assigned Staff</h2>
          <div className="space-y-3">
            {job.assignments.map((assignment, index) => (
              <div key={index} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-black">
                    {assignment.staff_first_name} {assignment.staff_last_name}
                  </p>
                  <StatusBadge status={assignment.status} size="small" />
                </div>
                <p className="text-sm text-gray-600">{assignment.staff_email}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Instructions */}
      {job.special_instructions && (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-4">Special Instructions</h2>
          <p className="text-gray-700 leading-relaxed">{job.special_instructions}</p>
        </div>
      )}

      {/* Compliance Logs */}
      {job.compliance_logs && job.compliance_logs.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-6 shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-tight text-black">Compliance Verification</h2>
          {job.compliance_logs.map((log, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Checked by {log.checked_by_first_name} {log.checked_by_last_name}
                </p>
                <p className="text-xs text-gray-500">{formatDate(log.verified_at || log.created_at)}</p>
              </div>
              <ComplianceChecklist
                items={log.checklist_items || []}
                photos={log.photos || []}
                readOnly={true}
              />
              {log.sign_off && (
                <div className="p-4 rounded-xl bg-green-100 border border-green-300">
                  <p className="text-sm font-bold text-green-700">✓ Signed Off</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Invoice Link */}
      {job.invoice && (
        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-1">Invoice</p>
              <p className="text-lg font-black text-black">{job.invoice.invoice_number}</p>
              <p className="text-sm text-gray-600">Status: <StatusBadge status={job.invoice.status} size="small" /></p>
            </div>
            <button
              onClick={() => router.push('/client/invoices')}
              className="px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-wider text-sm"
            >
              View Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
