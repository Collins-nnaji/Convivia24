'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ServiceCard from '@/components/ServiceCard';
import { List, Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function AdminServices() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Fetch services error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <List size={32} className="text-red-600" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black">Service Catalog</h1>
        </div>
        <button className="px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-wider text-sm flex items-center gap-2 shadow-lg">
          <Plus size={20} />
          Add Service
        </button>
      </div>

      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search services..."
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading...</div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <div key={service.id} className="relative group">
              <ServiceCard service={service} index={index} />
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white shadow-lg">
                  <Edit size={16} />
                </button>
                <button className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <List size={48} className="mx-auto text-gray-400 opacity-50" />
          <p className="text-gray-600">No services found.</p>
        </div>
      )}
    </div>
  );
}
