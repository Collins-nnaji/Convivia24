'use client';

import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import JobCard from '@/components/JobCard';
import StatusBadge from '@/components/StatusBadge';
import { 
  Plus, Calendar, DollarSign, TrendingUp, 
  Clock, AlertCircle, ArrowRight, CheckCircle2,
  BarChart3, Target, Zap, Star,
  MapPin, Phone, Mail, FileText
} from 'lucide-react';

export default function ClientDashboard() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    scheduled: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    totalCost: 0,
    monthlyCost: 0,
    avgJobCost: 0,
    upcomingJobs: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [urgentBookings, setUrgentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [user]);

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
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const monthlyBookings = allBookings.filter(b => 
          new Date(b.created_at) >= thisMonth && b.status === 'completed'
        );
        
        const completedBookings = allBookings.filter(b => b.status === 'completed');
        const avgCost = completedBookings.length > 0
          ? completedBookings.reduce((sum, b) => sum + (b.total_cost || 0), 0) / completedBookings.length
          : 0;
        
        const upcoming = allBookings.filter(b => 
          (b.status === 'scheduled' || b.status === 'in_progress') &&
          b.scheduled_start &&
          new Date(b.scheduled_start) >= now
        );
        
        const stats = {
          total: allBookings.length,
          pending: allBookings.filter(b => b.status === 'pending').length,
          scheduled: allBookings.filter(b => b.status === 'scheduled').length,
          in_progress: allBookings.filter(b => b.status === 'in_progress').length,
          completed: completedBookings.length,
          cancelled: allBookings.filter(b => b.status === 'cancelled').length,
          totalCost: completedBookings.reduce((sum, b) => sum + (b.total_cost || 0), 0),
          monthlyCost: monthlyBookings.reduce((sum, b) => sum + (b.total_cost || 0), 0),
          avgJobCost: avgCost,
          upcomingJobs: upcoming.length,
          monthlyJobsCount: monthlyBookings.length,
        };
        setStats(stats);
        
        // Sort bookings
        const sortedBookings = [...allBookings].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setRecentBookings(sortedBookings.slice(0, 5));
        
        setUpcomingBookings(
          upcoming
            .sort((a, b) => new Date(a.scheduled_start) - new Date(b.scheduled_start))
            .slice(0, 3)
        );
        
        setUrgentBookings(
          allBookings
            .filter(b => b.urgency === 'urgent' || b.urgency === 'emergency')
            .sort((a, b) => new Date(a.scheduled_start || a.created_at) - new Date(b.scheduled_start || b.created_at))
            .slice(0, 3)
        );
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency for Nigeria (NGN)
  const formatCurrency = (amount) => `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const primaryStats = [
    { 
      label: 'Total Jobs', 
      value: stats.total, 
      icon: Calendar, 
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      subtitle: `${stats.completed} completed`
    },
    { 
      label: 'Active Jobs', 
      value: stats.in_progress + stats.scheduled, 
      icon: TrendingUp, 
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      subtitle: `${stats.pending} pending`
    },
    { 
      label: 'Total Spent', 
      value: formatCurrency(stats.totalCost), 
      icon: DollarSign, 
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      subtitle: formatCurrency(stats.monthlyCost) + ' this month'
    },
    { 
      label: 'Upcoming', 
      value: stats.upcomingJobs, 
      icon: Clock, 
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600',
      subtitle: 'Scheduled jobs'
    },
  ];

  const quickActions = [
    { label: 'Request Service', icon: Plus, path: '/client/request', color: 'red', primary: true },
    { label: 'View All Jobs', icon: Calendar, path: '/client/jobs', color: 'blue' },
    { label: 'View Invoices', icon: FileText, path: '/client/invoices', color: 'green' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter italic text-black mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 font-medium">
            Welcome back, <span className="font-black text-black">{user?.first_name || user?.email?.split('@')[0] || 'Guest User'}</span>
          </p>
          {user?.business_name && (
            <p className="text-sm text-gray-500 mt-1 font-medium">{user.business_name}</p>
          )}
        </div>
        <div className="flex gap-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(action.path)}
              className={`px-6 py-4 font-black rounded-xl transition-all flex items-center gap-3 uppercase tracking-wider text-sm shadow-lg ${
                action.primary
                  ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-xl'
                  : 'bg-white border-2 border-gray-200 text-black hover:border-red-300 hover:bg-gray-50'
              }`}
            >
              <action.icon size={20} />
              {action.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {primaryStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`p-6 rounded-2xl bg-white border-2 ${stat.borderColor} hover:border-red-300 transition-all shadow-lg hover:shadow-xl cursor-pointer`}
            onClick={() => stat.path && router.push(stat.path)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.iconColor} shadow-md`}>
                <stat.icon size={24} />
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-black mb-1">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-xs text-gray-500 font-medium mt-1">{stat.subtitle}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats & Spending Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Secondary Stats */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl bg-white border border-gray-200 hover:border-red-300 transition-all shadow-md text-center"
          >
            <Target size={20} className="text-green-600 mx-auto mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Avg Job Cost</p>
            <p className="text-xl font-black text-black">{formatCurrency(stats.avgJobCost)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
            className="p-4 rounded-xl bg-white border border-gray-200 hover:border-red-300 transition-all shadow-md text-center"
          >
            <CheckCircle2 size={20} className="text-blue-600 mx-auto mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Completed</p>
            <p className="text-xl font-black text-black">{stats.completed}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-xl bg-white border border-gray-200 hover:border-red-300 transition-all shadow-md text-center"
          >
            <BarChart3 size={20} className="text-purple-600 mx-auto mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">This Month</p>
            <p className="text-xl font-black text-black">{stats.monthlyJobsCount || 0}</p>
          </motion.div>
        </div>

        {/* Spending Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-md">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-black">Spending Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-white border border-gray-200">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">This Month</p>
              <p className="text-xl font-black text-black">{formatCurrency(stats.monthlyCost)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-gray-200">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">All Time</p>
              <p className="text-xl font-black text-black">{formatCurrency(stats.totalCost)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-gray-200">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Average</p>
              <p className="text-xl font-black text-black">{formatCurrency(stats.avgJobCost)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upcoming Jobs */}
      {upcomingBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <Clock size={24} className="text-blue-600" />
            <h2 className="text-2xl font-black uppercase tracking-tight italic text-black">
              Upcoming Jobs ({upcomingBookings.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                onClick={() => router.push(`/client/jobs/${booking.id}`)}
                className="p-5 rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all shadow-md hover:shadow-xl group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-black text-black mb-1 group-hover:text-blue-600 transition-colors">
                      {booking.service_name}
                    </h3>
                    <p className="text-xs text-gray-600 font-medium">{booking.service_type}</p>
                  </div>
                  <StatusBadge status={booking.status} size="small" />
                </div>
                {booking.scheduled_start && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <Calendar size={14} className="text-blue-600" />
                    <span className="font-medium">
                      {new Date(booking.scheduled_start).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                {booking.location_address && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                    <MapPin size={12} className="text-gray-500" />
                    <span className="truncate">{booking.location_address}</span>
                  </div>
                )}
                {booking.total_cost > 0 && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Cost</span>
                    <span className="text-sm font-black text-green-600">{formatCurrency(booking.total_cost)}</span>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={16} className="text-blue-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Urgent Jobs */}
      {urgentBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-2xl bg-orange-50 border-2 border-orange-300 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={24} className="text-orange-600" />
            <h2 className="text-xl font-black uppercase tracking-tight text-orange-700">
              Urgent Requests ({urgentBookings.length})
            </h2>
          </div>
          <div className="space-y-3">
            {urgentBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                onClick={() => router.push(`/client/jobs/${booking.id}`)}
                className="p-4 rounded-xl bg-white border border-orange-200 hover:border-orange-400 cursor-pointer transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-black text-black">{booking.service_name}</h3>
                      <StatusBadge status={booking.status} size="small" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">
                      {booking.urgency?.toUpperCase() || 'URGENT'} • {booking.business_name || 'Your Business'}
                    </p>
                  </div>
                  <ArrowRight size={20} className="text-orange-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Jobs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tight italic text-black">Recent Jobs</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/client/jobs')}
            className="text-sm font-bold uppercase tracking-wider text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
          >
            View All Jobs
            <ArrowRight size={16} />
          </motion.button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-600">
            <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-medium">Loading your jobs...</p>
          </div>
        ) : recentBookings.length > 0 ? (
          <div className="space-y-4">
            {recentBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.05 }}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-16 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-red-100 mx-auto flex items-center justify-center">
              <Calendar size={40} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-black mb-2">No Jobs Yet</h3>
              <p className="text-gray-600 font-medium mb-2">Get started by requesting your first cleaning service!</p>
              <p className="text-sm text-gray-500">We're here to help keep your facility spotless.</p>
            </div>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/client/request')}
              className="px-8 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-wider text-sm shadow-xl flex items-center gap-3 mx-auto"
            >
              <Plus size={20} />
              Request Your First Service
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
