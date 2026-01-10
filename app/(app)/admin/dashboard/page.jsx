'use client';

import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import JobCard from '@/components/JobCard';
import StatusBadge from '@/components/StatusBadge';
import { 
  TrendingUp, Users, Briefcase, DollarSign, 
  Clock, AlertCircle, ArrowRight, Calendar,
  Activity, CheckCircle2, XCircle, Zap,
  BarChart3, FileText, Filter, Download,
  Eye, Settings, UserPlus, Building2,
  Target, Award, Timer
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    pendingJobs: 0,
    scheduledJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    cancelledJobs: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalClients: 0,
    totalStaff: 0,
    avgResponseTime: 0,
    completionRate: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [urgentBookings, setUrgentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // week, month, quarter, year

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const token = getToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Fetch all bookings
      const bookingsRes = await fetch('/api/bookings', {
        headers,
      });
      
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const bookings = bookingsData.bookings || [];
        
        // Calculate time-based revenue
        const now = new Date();
        const timeFilter = {
          week: 7,
          month: 30,
          quarter: 90,
          year: 365,
        }[timeRange] || 30;
        
        const dateThreshold = new Date(now.setDate(now.getDate() - timeFilter));
        const recentBookings = bookings.filter(b => new Date(b.created_at) >= dateThreshold);
        const monthlyRevenue = recentBookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.total_cost || 0), 0);
        
        const completedCount = bookings.filter(b => b.status === 'completed').length;
        const completionRate = bookings.length > 0 
          ? Math.round((completedCount / bookings.length) * 100) 
          : 0;
        
        setStats({
          totalJobs: bookings.length,
          pendingJobs: bookings.filter(b => b.status === 'pending').length,
          scheduledJobs: bookings.filter(b => b.status === 'scheduled').length,
          activeJobs: bookings.filter(b => b.status === 'in_progress' || b.status === 'scheduled').length,
          completedJobs: completedCount,
          cancelledJobs: bookings.filter(b => b.status === 'cancelled').length,
          totalRevenue: bookings
            .filter(b => b.status === 'completed')
            .reduce((sum, b) => sum + (b.total_cost || 0), 0),
          monthlyRevenue: monthlyRevenue,
          totalClients: new Set(bookings.map(b => b.business_id)).size,
          totalStaff: 12, // Mock - would come from API
          avgResponseTime: 2.5, // Mock hours
          completionRate: completionRate,
        });
        
        // Sort by created date, most recent first
        const sortedBookings = [...bookings].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        setRecentBookings(sortedBookings.slice(0, 5));
        setUrgentBookings(
          bookings
            .filter(b => b.urgency === 'urgent' || b.urgency === 'emergency')
            .sort((a, b) => new Date(a.scheduled_start || a.created_at) - new Date(b.scheduled_start || b.created_at))
            .slice(0, 3)
        );
      }
    } catch (error) {
      console.error('Fetch dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency for Nigeria (NGN)
  const formatCurrency = (amount) => `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const primaryStats = [
    { 
      label: 'Total Jobs', 
      value: stats.totalJobs, 
      icon: Briefcase, 
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      trend: '+12%',
      trendUp: true
    },
    { 
      label: 'Active Jobs', 
      value: stats.activeJobs, 
      icon: Activity, 
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      subtitle: `${stats.pendingJobs} pending`
    },
    { 
      label: 'Total Revenue', 
      value: formatCurrency(stats.totalRevenue), 
      icon: DollarSign, 
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      subtitle: formatCurrency(stats.monthlyRevenue) + ' this ' + timeRange
    },
    { 
      label: 'Clients', 
      value: stats.totalClients, 
      icon: Users, 
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      iconColor: 'text-purple-600',
      trend: '+5',
      trendUp: true
    },
  ];

  const secondaryStats = [
    { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: Target, color: 'green' },
    { label: 'Avg Response', value: `${stats.avgResponseTime}hrs`, icon: Timer, color: 'blue' },
    { label: 'Staff Active', value: stats.totalStaff, icon: UserPlus, color: 'orange' },
    { label: 'Cancelled', value: stats.cancelledJobs, icon: XCircle, color: 'red' },
  ];

  const quickActions = [
    { label: 'View All Jobs', icon: Briefcase, path: '/admin/jobs', color: 'red' },
    { label: 'Manage Clients', icon: Building2, path: '/admin/clients', color: 'blue' },
    { label: 'Manage Staff', icon: Users, path: '/admin/staff', color: 'green' },
    { label: 'View Reports', icon: BarChart3, path: '/admin/compliance', color: 'purple' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter italic text-black mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 font-medium">Platform overview and analytics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-black font-bold text-sm uppercase tracking-wider focus:outline-none focus:border-red-500 transition-all"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 font-black rounded-xl hover:bg-gray-50 hover:border-red-300 transition-all flex items-center gap-2 text-sm uppercase tracking-wider"
          >
            <Download size={18} />
            Export
          </motion.button>
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
              {stat.trend && (
                <div className={`flex items-center gap-1 text-xs font-black uppercase tracking-wider ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp size={12} className={stat.trendUp ? '' : 'rotate-180'} />
                  {stat.trend}
                </div>
              )}
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-black mb-1">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-xs text-gray-500 font-medium mt-1">{stat.subtitle}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Secondary Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {secondaryStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
              className="p-4 rounded-xl bg-white border border-gray-200 hover:border-red-300 transition-all shadow-md text-center"
            >
              <stat.icon size={20} className={`text-${stat.color}-600 mx-auto mb-2`} />
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">{stat.label}</p>
              <p className="text-xl font-black text-black">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-black uppercase tracking-tight text-black">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{ x: 4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(action.path)}
                className={`w-full p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-${action.color}-300 transition-all shadow-md hover:shadow-lg flex items-center gap-3 group`}
              >
                <div className={`w-10 h-10 rounded-lg bg-${action.color}-50 flex items-center justify-center group-hover:bg-${action.color}-100 transition-colors`}>
                  <action.icon size={20} className={`text-${action.color}-600`} />
                </div>
                <span className="flex-1 text-left text-sm font-black uppercase tracking-tight text-black group-hover:text-red-600 transition-colors">
                  {action.label}
                </span>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-red-600 transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Urgent Jobs Alert */}
      {urgentBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-orange-50 border-2 border-orange-300 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={24} className="text-orange-600" />
            <h2 className="text-xl font-black uppercase tracking-tight text-orange-700">
              Urgent Jobs ({urgentBookings.length})
            </h2>
          </div>
          <div className="space-y-3">
            {urgentBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                onClick={() => router.push(`/admin/jobs/${booking.id}`)}
                className="p-4 rounded-xl bg-white border border-orange-200 hover:border-orange-400 cursor-pointer transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-black text-black">{booking.service_name}</h3>
                      <StatusBadge status={booking.status} size="small" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{booking.business_name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {booking.scheduled_start 
                        ? `Scheduled: ${new Date(booking.scheduled_start).toLocaleDateString()}`
                        : 'Pending scheduling'}
                    </p>
                  </div>
                  <ArrowRight size={20} className="text-orange-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Bookings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tight italic text-black">Recent Bookings</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/admin/jobs')}
            className="text-sm font-bold uppercase tracking-wider text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
          >
            View All Jobs
            <ArrowRight size={16} />
          </motion.button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-600">
            <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-medium">Loading dashboard data...</p>
          </div>
        ) : recentBookings.length > 0 ? (
          <div className="space-y-4">
            {recentBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
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
          <div className="text-center py-12 p-6 rounded-2xl bg-gray-50 border-2 border-gray-200">
            <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium mb-2">No bookings yet</p>
            <p className="text-sm text-gray-500">Bookings will appear here once clients start requesting services.</p>
          </div>
        )}
      </div>
    </div>
  );
}
