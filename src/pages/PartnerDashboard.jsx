import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, Calendar, Users, BarChart3, TrendingUp, MapPin,
  Plus, Edit, Eye, Share2, QrCode, DollarSign, Star,
  Clock, Coffee, Music, Trophy, Palette, Briefcase,
  Download, Upload, Settings, Bell, Mail, Phone
} from 'lucide-react';

const PartnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [venueData, setVenueData] = useState({
    name: 'Sky Lounge',
    type: 'Rooftop Bar',
    location: 'London, UK',
    membersReached: 1247,
    eventsHosted: 12,
    revenue: 15420,
    rating: 4.8
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <BarChart3 size={20} /> },
    { id: 'events', name: 'Events', icon: <Calendar size={20} /> },
    { id: 'analytics', name: 'Analytics', icon: <TrendingUp size={20} /> },
    { id: 'profile', name: 'Venue Profile', icon: <Building size={20} /> }
  ];

  const eventCategories = [
    { id: 'nightlife', name: 'Nightlife', icon: <Music size={16} /> },
    { id: 'networking', name: 'Networking', icon: <Briefcase size={16} /> },
    { id: 'culture', name: 'Culture', icon: <Palette size={16} /> },
    { id: 'sports', name: 'Sports', icon: <Trophy size={16} /> },
    { id: 'dining', name: 'Dining', icon: <Coffee size={16} /> }
  ];

  const recentEvents = [
    {
      id: 1,
      title: 'Rooftop Summer Party',
      date: '2024-06-15',
      time: '20:00',
      category: 'nightlife',
      attendees: 89,
      capacity: 120,
      revenue: 2340,
      status: 'upcoming',
      conviviaMembers: 67
    },
    {
      id: 2,
      title: 'Tech Networking Mixer',
      date: '2024-06-08',
      time: '18:30',
      category: 'networking',
      attendees: 45,
      capacity: 60,
      revenue: 1800,
      status: 'completed',
      conviviaMembers: 34
    },
    {
      id: 3,
      title: 'Jazz & Wine Night',
      date: '2024-05-30',
      time: '19:00',
      category: 'culture',
      attendees: 52,
      capacity: 70,
      revenue: 2100,
      status: 'completed',
      conviviaMembers: 41
    }
  ];

  const analytics = {
    totalRevenue: 15420,
    conviviaRevenue: 8950,
    memberAttendance: 247,
    averageSpend: 45.50,
    repeatCustomers: 68,
    monthlyGrowth: 23
  };

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    category: 'nightlife',
    capacity: '',
    price: '',
    perks: []
  });

  const handleCreateEvent = (e) => {
    e.preventDefault();
    // Handle event creation logic
    console.log('Creating event:', newEvent);
    setShowCreateEvent(false);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      category: 'nightlife',
      capacity: '',
      price: '',
      perks: []
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{venueData.name}</h1>
                <p className="text-gray-600">{venueData.type} • {venueData.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                <Settings size={20} />
                Settings
              </button>
              <button
                onClick={() => setShowCreateEvent(true)}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus size={20} />
                Create Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                  <span className="text-sm text-green-600 font-medium">+23%</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{venueData.membersReached}</p>
                <p className="text-sm text-gray-600">Convivia Members Reached</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 text-purple-600" />
                  <span className="text-sm text-green-600 font-medium">+2</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{venueData.eventsHosted}</p>
                <p className="text-sm text-gray-600">Events This Month</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+18%</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">£{venueData.revenue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <span className="text-sm text-blue-600 font-medium">{venueData.rating}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{venueData.rating}</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Recent Events</h3>
                  <button className="text-red-600 hover:text-red-700 font-medium">View All</button>
                </div>
              </div>
              <div className="divide-y">
                {recentEvents.map((event) => (
                  <div key={event.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {eventCategories.find(c => c.id === event.category)?.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                          <span>{event.attendees}/{event.capacity} attendees</span>
                          <span>{event.conviviaMembers} Convivia members</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">£{event.revenue}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Events List */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">All Events</h3>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Download size={16} />
                      Export
                    </button>
                    <button
                      onClick={() => setShowCreateEvent(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Plus size={16} />
                      Create Event
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-600">{event.category}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <p>{new Date(event.date).toLocaleDateString()}</p>
                            <p className="text-gray-600">{event.time}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <p>{event.attendees}/{event.capacity}</p>
                            <p className="text-gray-600">{event.conviviaMembers} Convivia</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          £{event.revenue}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="p-1 text-gray-600 hover:text-gray-800">
                              <Eye size={16} />
                            </button>
                            <button className="p-1 text-gray-600 hover:text-gray-800">
                              <Edit size={16} />
                            </button>
                            <button className="p-1 text-gray-600 hover:text-gray-800">
                              <QrCode size={16} />
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
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Revenue Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-bold text-lg">£{analytics.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Convivia Members</span>
                    <span className="font-bold text-green-600">£{analytics.conviviaRevenue.toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(analytics.conviviaRevenue / analytics.totalRevenue) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {Math.round((analytics.conviviaRevenue / analytics.totalRevenue) * 100)}% from Convivia members
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Customer Insights</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Spend</span>
                    <span className="font-bold">£{analytics.averageSpend}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Repeat Customers</span>
                    <span className="font-bold">{analytics.repeatCustomers}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Growth</span>
                    <span className="font-bold text-green-600">+{analytics.monthlyGrowth}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Event Performance</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Analytics charts will be displayed here</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Venue Information</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
                    <input
                      type="text"
                      value={venueData.name}
                      onChange={(e) => setVenueData({...venueData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue Type</label>
                    <select
                      value={venueData.type}
                      onChange={(e) => setVenueData({...venueData, type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option>Rooftop Bar</option>
                      <option>Nightclub</option>
                      <option>Restaurant</option>
                      <option>Event Space</option>
                      <option>Lounge</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your venue and what makes it unique..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="email"
                        placeholder="venue@example.com"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="tel"
                        placeholder="+44 20 1234 5678"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                    <textarea
                      rows={2}
                      placeholder="Full venue address..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateEvent(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">Create New Event</h3>
              </div>
              
              <form onSubmit={handleCreateEvent} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Enter event title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Describe your event"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      {eventCategories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                    <input
                      type="number"
                      value={newEvent.capacity}
                      onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})}
                      placeholder="Max attendees"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="text"
                      value={newEvent.price}
                      onChange={(e) => setNewEvent({...newEvent, price: e.target.value})}
                      placeholder="e.g. £25 or Free"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateEvent(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Create Event
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerDashboard;
