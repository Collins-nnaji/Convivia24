'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ComplianceChecklist from '@/components/ComplianceChecklist';
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft, CheckCircle, X, Save, AlertCircle } from 'lucide-react';

export default function SupervisorJobCheck() {
  const router = useRouter();
  const params = useParams();
  const { getToken } = useAuth();
  const [job, setJob] = useState(null);
  const [checklist, setChecklist] = useState({ items: [], photos: [] });
  const [signOff, setSignOff] = useState(false);
  const [nonComplianceNotes, setNonComplianceNotes] = useState('');
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
        
        // Load existing compliance log if available
        if (data.booking?.compliance_logs && data.booking.compliance_logs.length > 0) {
          const latestLog = data.booking.compliance_logs[0];
          setChecklist({
            items: latestLog.checklist_items || [],
            photos: latestLog.photos || [],
          });
          setSignOff(latestLog.sign_off || false);
          setNonComplianceNotes(latestLog.non_compliance_notes || '');
        }
      }
    } catch (error) {
      console.error('Fetch job error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistUpdate = (data) => {
    setChecklist(data);
  };

  const handleSaveCompliance = async () => {
    setSaving(true);
    try {
      const token = getToken();
      const allCompleted = checklist.items.every(item => 
        typeof item === 'object' ? item.completed : true
      );

      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          booking_id: params.id,
          checklist_items: checklist.items,
          photos: checklist.photos.map(p => p.url || p),
          sign_off: signOff && allCompleted,
          non_compliance_notes: nonComplianceNotes || null,
        }),
      });

      if (response.ok) {
        router.push('/supervisor/jobs');
      }
    } catch (error) {
      console.error('Save compliance error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  if (!job) {
    return <div className="text-center py-12 text-gray-400">Job not found</div>;
  }

  const allCompleted = checklist.items.every(item => 
    typeof item === 'object' ? item.completed : true
  );

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
        <h1 className="text-4xl font-black uppercase tracking-tighter italic text-black">Quality Check</h1>
        <StatusBadge status={job.status} size="large" />
      </div>

      {/* Job Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Service</p>
          <p className="text-lg font-bold text-black">{job.service_name}</p>
          <p className="text-sm text-gray-600">{job.business_name}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Location</p>
          <p className="text-sm text-gray-700">{job.location_address}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Completed</p>
          <p className="text-sm text-gray-700">
            {job.actual_end ? new Date(job.actual_end).toLocaleString() : 'Pending'}
          </p>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-6 shadow-sm">
        <h2 className="text-2xl font-black uppercase tracking-tight text-black">Compliance Verification</h2>
        <ComplianceChecklist
          items={checklist.items}
          photos={checklist.photos}
          onUpdate={handleChecklistUpdate}
          readOnly={false}
          serviceType={job.service_type}
        />
      </div>

      {/* Non-Compliance Notes */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4 shadow-sm">
        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-black">
          <AlertCircle size={20} className="text-orange-600" />
          Non-Compliance Notes (Optional)
        </h2>
        <textarea
          value={nonComplianceNotes}
          onChange={(e) => setNonComplianceNotes(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
          placeholder="Document any non-compliance issues or concerns..."
        />
      </div>

      {/* Sign Off */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4 shadow-sm">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            id="signOff"
            checked={signOff}
            onChange={(e) => setSignOff(e.target.checked)}
            disabled={!allCompleted}
            className="w-5 h-5 rounded border-gray-300 bg-white text-green-600 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label htmlFor="signOff" className={`font-bold uppercase tracking-wider ${signOff ? 'text-green-700' : 'text-gray-600'}`}>
            Sign Off - All requirements met
          </label>
        </div>
        {!allCompleted && (
          <p className="text-sm text-gray-600">Complete all checklist items to enable sign-off.</p>
        )}
      </div>

      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSaveCompliance}
          disabled={saving || (!signOff && !allCompleted)}
          className="flex-1 px-6 py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-all uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 flex items-center justify-center gap-3"
        >
          {saving ? 'Saving...' : 'Save Compliance Check'}
          <Save size={20} />
        </button>
        <button
          onClick={() => router.back()}
          className="px-6 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:border-red-300 hover:text-red-600 transition-all uppercase tracking-wider text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
