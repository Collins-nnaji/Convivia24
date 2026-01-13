'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import JobCard from '@/components/JobCard';
import StatusBadge from '@/components/StatusBadge';
import { Filter, Search, Plus, Calendar, ArrowUpDown, MapPin, Clock, DollarSign } from 'lucide-react';

export default function ClientJobs() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // recent, scheduled, cost, service
  const [viewMode, setViewMode] = useState('list'); // list, calendar
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterAndSortBookings();
  }, [bookings, statusFilter, sortBy, searchQuery]);

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
          totalSpent: completedBookings.reduce((sum, b) => sum + (b.total_cost || 0), 0),
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
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.service_name?.toLowerCase().includes(query) ||
        b.location_address?.toLowerCase().includes(query) ||
        b.service_type?.toLowerCase().includes(query)
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
        case 'service':
          return (a.service_name || '').localeCompare(b.service_name || '');
        case 'recent':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });
    
    setFilteredBookings(filtered);
  };

  const statuses = ['all', 'pending', 'scheduled', 'in_progress', 'completed', 'cancelled'];
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'scheduled', label: 'Scheduled Date' },
    { value: 'cost', label: 'Highest Cost' },
    { value: 'service', label: 'Service Name' },
  ];

  // Format currency for UK
  const formatCurrency = (amount) => `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  // Group bookings by date for calendar view
  const groupByDate = (bookings) => {
    const grouped = {};
    bookings.forEach(booking => {
      if (booking.scheduled_start) {
        const date = new Date(booking.scheduled_start).toDateString();
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(booking);
      } else {
        const date = 'Unscheduled';
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(booking);
      }
    });
    return grouped;
  };

  const groupedBookings = viewMode === 'calendar' ? groupByDate(filteredBookings) : {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter italic text-black mb-2">
            My Jobs
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">Manage and track your cleaning service bookings</p>
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/client/request')}
          className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 sm:gap-3 uppercase tracking-wider text-xs sm:text-sm shadow-xl"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          Request Service
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Calendar, color: 'blue' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'orange' },
          { label: 'Active', value: stats.active, icon: Clock, color: 'red' },
          { label: 'Completed', value: stats.completed, icon: Calendar, color: 'green' },
          { label: 'Total Spent', value: formatCurrency(stats.totalSpent), icon: DollarSign, color: 'green' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-xl bg-white border border-gray-200 hover:border-red-300 transition-all shadow-md text-center"
          >
            <stat.icon size={20} className={`text-${stat.color}-600 mx-auto mb-2`} />
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">{stat.label}</p>
            <p className="text-lg font-black text-black">{stat.value}</p>
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
            placeholder="Search by service name, location, or type..."
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border-2 border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-md"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Status Filters */}
          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 block">Status</label>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:mx-0 sm:px-0">
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

          {/* Sort & View Mode */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-48">
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

            {/* View Mode Toggle */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 block">View</label>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-xl border-2 font-bold uppercase tracking-wider text-xs transition-all shadow-sm ${
                    viewMode === 'list'
                      ? 'bg-red-100 border-red-300 text-red-700 shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-red-300'
                  }`}
                >
                  List
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-xl border-2 font-bold uppercase tracking-wider text-xs transition-all shadow-sm ${
                    viewMode === 'calendar'
                      ? 'bg-red-100 border-red-300 text-red-700 shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-red-300'
                  }`}
                >
                  <Calendar size={14} className="inline mr-1" />
                  Calendar
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(statusFilter !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Active Filters:</span>
            {statusFilter !== 'all' && (
              <StatusBadge status={statusFilter} size="small" />
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

      {/* Jobs List/Calendar */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your jobs...</p>
        </div>
      ) : filteredBookings.length > 0 ? (
        viewMode === 'list' ? (
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
                  onClick={() => router.push(`/client/jobs/${booking.id}`)} 
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedBookings)
              .sort(([dateA], [dateB]) => {
                if (dateA === 'Unscheduled') return 1;
                if (dateB === 'Unscheduled') return -1;
                return new Date(dateA) - new Date(dateB);
              })
              .map(([date, dateBookings], groupIndex) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-gray-200">
                    <Calendar size={20} className="text-red-600" />
                    <h3 className="text-xl font-black uppercase tracking-tight text-black">
                      {date === 'Unscheduled' ? 'Unscheduled Jobs' : new Date(date).toLocaleDateString('en-NG', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-xs font-black uppercase tracking-wider">
                      {dateBookings.length} {dateBookings.length === 1 ? 'job' : 'jobs'}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {dateBookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                      >
                        <JobCard 
                          job={booking} 
                          index={index} 
                          onClick={() => router.push(`/client/jobs/${booking.id}`)} 
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
          </div>
        )
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-red-100 mx-auto flex items-center justify-center">
            <Calendar size={40} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-black mb-2">No Jobs Found</h3>
            <p className="text-gray-600 font-medium mb-2">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'No bookings yet. Get started by requesting a service!'}
            </p>
          </div>
          {searchQuery || statusFilter !== 'all' ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-black font-black rounded-xl hover:bg-gray-50 hover:border-red-300 transition-all uppercase tracking-wider text-sm shadow-lg"
            >
              Clear Filters
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/client/request')}
              className="px-8 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-wider text-sm shadow-xl flex items-center gap-3 mx-auto"
            >
              <Plus size={20} />
              Request Service
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
}
