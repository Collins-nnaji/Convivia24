import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Users, CalendarPlus, Ticket, QrCode, PlusCircle, 
  TrendingUp, DollarSign, MapPin, Clock, Settings, Eye, 
  Edit, Trash2, Download, Filter, Search, Bell, Star,
  CheckCircle, XCircle, AlertCircle, MoreVertical,
  Calendar, Phone, Mail, Instagram, Facebook, Twitter
} from 'lucide-react';

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  // Mock data
  const events = [
    {
      id: 'e1',
      title: 'Sunset Live Concert',
      date: '2024-02-15',
      time: '8:00 PM',
      venue: 'Skyline Arena, Lagos',
      status: 'upcoming',
      ticketsSold: 324,
      totalTickets: 500,
      revenue: 3240000,
      checkIns: 287,
      category: 'Music',
      image: '/api/placeholder/400/200'
    },
    {
      id: 'e2',
      title: 'Nightlife Experience',
      date: '2024-02-10',
      time: '10:00 PM',
      venue: 'Velvet Lounge, Abuja',
      status: 'completed',
      ticketsSold: 210,
      totalTickets: 300,
      revenue: 2100000,
      checkIns: 190,
      category: 'Nightlife',
      image: '/api/placeholder/400/200'
    },
    {
      id: 'e3',
      title: 'Business Networking Mixer',
      date: '2024-02-20',
      time: '6:00 PM',
      venue: 'Innovation Hub, Lagos',
      status: 'upcoming',
      ticketsSold: 45,
      totalTickets: 100,
      revenue: 450000,
      checkIns: 0,
      category: 'Business',
      image: '/api/placeholder/400/200'
    }
  ];

  const attendees = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@email.com', ticket: 'VIP', status: 'checked-in', checkInTime: '7:45 PM' },
    { id: 2, name: 'Michael Chen', email: 'michael@email.com', ticket: 'Regular', status: 'checked-in', checkInTime: '8:02 PM' },
    { id: 3, name: 'Emma Davis', email: 'emma@email.com', ticket: 'VIP', status: 'not-checked-in' },
    { id: 4, name: 'David Wilson', email: 'david@email.com', ticket: 'Regular', status: 'checked-in', checkInTime: '7:58 PM' }
  ];

  const analytics = {
    totalRevenue: events.reduce((sum, e) => sum + e.revenue, 0),
    totalTickets: events.reduce((sum, e) => sum + e.ticketsSold, 0),
    totalEvents: events.length,
    avgAttendance: Math.round(events.reduce((sum, e) => sum + e.checkIns, 0) / events.length),
    upcomingEvents: events.filter(e => e.status === 'upcoming').length,
    completedEvents: events.filter(e => e.status === 'completed').length
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={16} /> },
    { id: 'attendees', label: 'Attendees', icon: <Users size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCheckInStatusColor = (status) => {
    switch (status) {
      case 'checked-in': return 'bg-green-100 text-green-700';
      case 'not-checked-in': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Organizer Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your events and track performance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell size={20} />
              </button>
              <button 
                onClick={() => setShowCreateEvent(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-2"
              >
                <PlusCircle size={16} />
                Create Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-green-600" size={20} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-600">
                    <TrendingUp size={14} />
                    <span className="ml-1">+12.5% from last month</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Tickets Sold</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.totalTickets}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Ticket className="text-blue-600" size={20} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-blue-600">
                    <TrendingUp size={14} />
                    <span className="ml-1">+8.2% from last month</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Active Events</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.upcomingEvents}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="text-purple-600" size={20} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-purple-600">
                    <span>{analytics.completedEvents} completed this month</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Avg Attendance</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.avgAttendance}%</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="text-orange-600" size={20} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-orange-600">
                    <CheckCircle size={14} />
                    <span className="ml-1">Excellent engagement</span>
                  </div>
                </div>
              </div>

              {/* Recent Events */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {events.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Calendar size={20} className="text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            <p className="text-sm text-gray-500">{event.date} • {event.venue}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{event.ticketsSold} tickets</p>
                            <p className="text-sm text-gray-500">{formatCurrency(event.revenue)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Events Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
                  <p className="text-gray-500">Manage and track all your events</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search events..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter size={16} />
                  </button>
                </div>
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-red-500 to-red-600 relative">
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-bold">{event.title}</h3>
                        <p className="text-sm opacity-90">{event.category}</p>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={14} />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={14} />
                          <span>{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Ticket size={14} />
                          <span>{event.ticketsSold}/{event.totalTickets}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Ticket Sales</span>
                          <span className="font-medium">{Math.round((event.ticketsSold / event.totalTickets) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(event.ticketsSold / event.totalTickets) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Revenue</p>
                          <p className="font-bold text-gray-900">{formatCurrency(event.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Check-ins</p>
                          <p className="font-bold text-gray-900">{event.checkIns}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                          <Edit size={14} />
                          Edit Event
                        </button>
                        <button className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2">
                          <QrCode size={14} />
                          Check-in
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'attendees' && (
            <motion.div
              key="attendees"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Event Attendees</h2>
                      <p className="text-sm text-gray-500">Manage and track attendee check-ins</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center gap-2">
                        <Download size={14} />
                        Export List
                      </button>
                      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Attendee</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Ticket Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Check-in Time</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendees.map((attendee) => (
                          <tr key={attendee.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium text-gray-900">{attendee.name}</p>
                                <p className="text-sm text-gray-500">{attendee.email}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                attendee.ticket === 'VIP' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {attendee.ticket}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCheckInStatusColor(attendee.status)}`}>
                                {attendee.status === 'checked-in' ? (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle size={12} />
                                    Checked In
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Not Checked In
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-500">
                              {attendee.checkInTime || '—'}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                  <Eye size={14} />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                  <Mail size={14} />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-red-600">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BarChart3 size={48} className="mx-auto mb-2" />
                      <p>Revenue chart will be displayed here</p>
                    </div>
                  </div>
                </div>

                {/* Ticket Sales */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Sales by Category</h3>
                  <div className="space-y-4">
                    {['Music', 'Nightlife', 'Business', 'Cultural'].map((category, index) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-gray-700">{category}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-600 h-2 rounded-full"
                              style={{ width: `${60 + index * 10}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{60 + index * 10}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attendance Rate */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Rate</h3>
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#dc2626"
                          strokeWidth="3"
                          strokeDasharray="85, 100"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">85%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Average attendance rate</p>
                  </div>
                </div>

                {/* Top Performing Events */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Events</h3>
                  <div className="space-y-4">
                    {events.slice(0, 3).map((event, index) => (
                      <div key={event.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-red-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-500">{event.ticketsSold} tickets</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(event.revenue)}</p>
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <Star size={12} />
                            <span>4.{8 - index}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Profile Information */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                        <input
                          type="text"
                          defaultValue="Convivia Events"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                        <input
                          type="email"
                          defaultValue="events@convivia.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          defaultValue="+234 801 234 5678"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          defaultValue="Lagos, Nigeria"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Social Media Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <Instagram className="text-pink-500" size={20} />
                        <input
                          type="text"
                          placeholder="Instagram handle"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Facebook className="text-blue-500" size={20} />
                        <input
                          type="text"
                          placeholder="Facebook page"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Twitter className="text-blue-400" size={20} />
                        <input
                          type="text"
                          placeholder="Twitter handle"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Notification Settings</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                        <span className="ml-3 text-sm text-gray-700">Email notifications for new ticket sales</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                        <span className="ml-3 text-sm text-gray-700">SMS notifications for event reminders</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                        <span className="ml-3 text-sm text-gray-700">Marketing emails and updates</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrganizerDashboard;


