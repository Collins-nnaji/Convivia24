'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Building, Search, Mail, Phone, MapPin, Plus } from 'lucide-react';

export default function AdminClients() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      // This would need a clients API endpoint
      // For now, we'll show placeholder
      setClients([]);
    } catch (error) {
      console.error('Fetch clients error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building size={32} className="text-red-600" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black">Clients</h1>
        </div>
        <button className="px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-wider text-sm flex items-center gap-2 shadow-lg">
          <Plus size={20} />
          Add Client
        </button>
      </div>

      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clients..."
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading...</div>
      ) : clients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="p-6 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-red-300 transition-all cursor-pointer shadow-sm" onClick={() => router.push(`/admin/clients/${client.id}`)}>
              <div className="flex items-start justify-between mb-4">
                <Building size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-black text-black mb-2">{client.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-red-600" />
                  <span className="text-black">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-red-600" />
                    <span className="text-black">{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 text-red-600" />
                    <span className="line-clamp-2 text-black">{client.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <Building size={48} className="mx-auto text-gray-400 opacity-50" />
          <p className="text-gray-600">No clients found.</p>
          <p className="text-sm text-gray-500">Client management coming soon.</p>
        </div>
      )}
    </div>
  );
}
