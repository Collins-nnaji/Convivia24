'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { User, Building, Mail, Phone, MapPin, Save, ArrowLeft } from 'lucide-react';

export default function ClientProfile() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessData, setBusinessData] = useState(null);

  useEffect(() => {
    if (user) {
      fetchBusinessData();
    }
  }, [user]);

  const fetchBusinessData = async () => {
    try {
      const token = getToken();
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBusinessData(data.user.business);
      }
    } catch (error) {
      console.error('Fetch business error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors font-bold"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black">Profile</h1>

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
        </div>
      </div>

      {/* Business Info */}
      {businessData && (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-6 shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-black">
            <Building size={24} className="text-green-600" />
            Business Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Business Name</p>
              <p className="text-lg font-bold text-black">{businessData.name}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-2">
                <MapPin size={14} className="text-red-600" />
                Address
              </p>
              <p className="text-lg font-bold text-black">{businessData.address || 'Not set'}</p>
              {(businessData.city || businessData.state) && (
                <p className="text-sm text-gray-600 mt-1">
                  {[businessData.city, businessData.state].filter(Boolean).join(', ')}
                  {businessData.postal_code && ` ${businessData.postal_code}`}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Industry</p>
              <p className="text-lg font-bold text-black">{businessData.industry || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Size</p>
              <p className="text-lg font-bold text-black capitalize">{businessData.size || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Contact Person</p>
              <p className="text-lg font-bold text-black">{businessData.contact_person || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-2">
                <Mail size={14} className="text-red-600" />
                Business Email
              </p>
              <p className="text-lg font-bold text-black">{businessData.email || 'Not set'}</p>
            </div>
            {businessData.special_requirements && (
              <div className="md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Special Requirements</p>
                <p className="text-sm text-gray-700 leading-relaxed">{businessData.special_requirements}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
