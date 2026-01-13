'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import JobCard from '@/components/JobCard';
import StatusBadge from '@/components/StatusBadge';
import { Search, Filter, Plus, Download, ArrowUpDown, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';

export default function AdminJobs() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // recent, scheduled, cost, client
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterAndSortBookings();
  }, [bookings, statusFilter, urgencyFilter, sortBy, searchQuery]);

  const fetchBookings = async () => {
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
        const allBookings = data.bookings || [];
        setBookings(allBookings);
        
        // Calculate stats
        const completedBookings = allBookings.filter(b => b.status === 'completed');
        setStats({
          total: allBookings.length,
          pending: allBookings.filter(b => b.status === 'pending').length,
          active: allBookings.filter(b => b.status === 'in_progress' || b.status === 'scheduled').length,
          completed: completedBookings.length,
          revenue: completedBookings.reduce((sum, b) => sum + (b.total_cost || 0), 0),
        });
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortBookings = () => {
    let filtered = [...bookings];
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    // Urgency filter
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(b => b.urgency === urgencyFilter);
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.service_name?.toLowerCase().includes(query) ||
        b.business_name?.toLowerCase().includes(query) ||
        b.location_address?.toLowerCase().includes(query) ||
        b.requested_by_email?.toLowerCase().includes(query)
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'scheduled':
          const aDate = a.scheduled_start ? new Date(a.scheduled_start) : new Date(0);
          const bDate = b.scheduled_start ? new Date(b.scheduled_start) : new Date(0);
          return aDate - bDate;
        case 'cost':
          return (b.total_cost || 0) - (a.total_cost || 0);
        case 'client':
          return (a.business_name || '').localeCompare(b.business_name || '');
        case 'recent':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });
    
    setFilteredBookings(filtered);
  };

  const statuses = ['all', 'pending', 'scheduled', 'in_progress', 'completed', 'cancelled'];
  const urgencies = ['all', 'routine', 'urgent', 'emergency'];
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'scheduled', label: 'Scheduled Date' },
    { value: 'cost', label: 'Highest Cost' },
    { value: 'client', label: 'Client Name' },
  ];

  // Format currency for UK
  const formatCurrency = (amount) => `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter italic text-black mb-2">
            All Jobs
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">Manage and track all cleaning service bookings</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full sm:w-auto px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 font-black rounded-xl hover:bg-gray-50 hover:border-red-300 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider shadow-md"
        >
          <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
          Export
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: TrendingUp, color: 'blue' },
          { label: 'Pending', value: stats.pending, icon: Calendar, color: 'orange' },
          { label: 'Active', value: stats.active, icon: Users, color: 'red' },
          { label: 'Completed', value: stats.completed, icon: TrendingUp, color: 'green' },
          { label: 'Revenue', value: formatCurrency(stats.revenue), icon: DollarSign, color: 'green' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 sm:p-4 rounded-xl bg-white border border-gray-200 hover:border-red-300 transition-all shadow-md text-center"
          >
            <stat.icon size={18} className={`sm:w-5 sm:h-5 text-${stat.color}-600 mx-auto mb-1 sm:mb-2`} />
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">{stat.label}</p>
            <p className="text-base sm:text-lg font-black text-black">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by service, client, location, or email..."
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border-2 border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-md"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Status Filters */}
          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 block">Status</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {statuses.map(status => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl border-2 font-bold uppercase tracking-wider text-xs whitespace-nowrap transition-all shadow-sm ${
                    statusFilter === status
                      ? 'bg-red-100 border-red-300 text-red-700 shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-red-300'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ')}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Urgency Filters */}
          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 block">Urgency</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {urgencies.map(urgency => (
                <motion.button
                  key={urgency}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUrgencyFilter(urgency)}
                  className={`px-4 py-2 rounded-xl border-2 font-bold uppercase tracking-wider text-xs whitespace-nowrap transition-all shadow-sm ${
                    urgencyFilter === urgency
                      ? 'bg-orange-100 border-orange-300 text-orange-700 shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-orange-300'
                  }`}
                >
                  {urgency === 'all' ? 'All' : urgency}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="md:w-48">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 block">Sort By</label>
            <div className="relative">
              <ArrowUpDown size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-black font-bold text-sm uppercase tracking-wider focus:outline-none focus:border-red-500 transition-all shadow-sm appearance-none cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(statusFilter !== 'all' || urgencyFilter !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Active Filters:</span>
            {statusFilter !== 'all' && (
              <StatusBadge status={statusFilter} size="small" />
            )}
            {urgencyFilter !== 'all' && (
              <span className="px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
                {urgencyFilter}
              </span>
            )}
            {searchQuery && (
              <span className="px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold">
                "{searchQuery}"
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setStatusFilter('all');
                setUrgencyFilter('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 transition-colors"
            >
              Clear All
            </motion.button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold uppercase tracking-wider text-gray-600">
          Showing {filteredBookings.length} {filteredBookings.length === 1 ? 'job' : 'jobs'}
          {filteredBookings.length !== bookings.length && ` of ${bookings.length} total`}
        </p>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading jobs...</p>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
            >
              <JobCard 
                job={booking} 
                index={index} 
                onClick={() => router.push(`/admin/jobs/${booking.id}`)} 
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 p-8 rounded-2xl bg-gray-50 border-2 border-gray-200 space-y-4"
        >
          <Filter size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-black uppercase tracking-tight text-black mb-2">No Jobs Found</h3>
          <p className="text-gray-600 font-medium mb-4">
            {searchQuery || statusFilter !== 'all' || urgencyFilter !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'No bookings have been created yet.'}
          </p>
          {(searchQuery || statusFilter !== 'all' || urgencyFilter !== 'all') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setStatusFilter('all');
                setUrgencyFilter('all');
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-wider text-sm shadow-lg"
            >
              Clear Filters
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
}
