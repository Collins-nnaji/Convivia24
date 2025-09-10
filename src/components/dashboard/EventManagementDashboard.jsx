import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Calendar, MapPin, Clock, Users, Star, Ticket, 
  TrendingUp, Eye, Edit, Trash2, Share2, Download,
  BarChart3, DollarSign, UserCheck, AlertCircle,
  CheckCircle, X, Filter, Search
} from 'lucide-react';
import { eventService, bookingService } from '../../services/eventService';

const EventManagementDashboard = ({ currentUser }) => {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would fetch organizer's events
      const response = await eventService.getEvents(1, 50, {});
      
      if (response.success) {
        // Filter events for this organizer (in real app, this would be done by API)
        const organizerEvents = response.data.events.filter(event => 
          event.organizer.id === 'org_1' // Mock organizer ID
        );
        setEvents(organizerEvents);
        
        // Load bookings for these events
        const eventIds = organizerEvents.map(event => event.id);
        const allBookings = [];
        
        for (const eventId of eventIds) {
          // In real app, this would be a single API call
          const bookingsResponse = await bookingService.getUserBookings('user_1');
          if (bookingsResponse.success) {
            const eventBookings = bookingsResponse.data.filter(booking => 
              booking.eventId === eventId
            );
            allBookings.push(...eventBookings);
          }
        }
        
        setBookings(allBookings);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    
    if (event.booked >= event.capacity) {
      return { status: 'sold_out', color: 'text-red-600 bg-red-100', icon: <X size={16} /> };
    } else if (eventDate < now) {
      return { status: 'completed', color: 'text-gray-600 bg-gray-100', icon: <CheckCircle size={16} /> };
    } else if (eventDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
      return { status: 'upcoming', color: 'text-yellow-600 bg-yellow-100', icon: <AlertCircle size={16} /> };
    } else {
      return { status: 'active', color: 'text-green-600 bg-green-100', icon: <CheckCircle size={16} /> };
    }
  };

  const calculateRevenue = (event) => {
    const eventBookings = bookings.filter(booking => booking.eventId === event.id);
    return eventBookings.reduce((total, booking) => total + booking.totalPrice, 0);
  };

  const getBookingStats = () => {
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const totalRevenue = bookings.reduce((total, booking) => total + booking.totalPrice, 0);
    
    return { totalBookings, confirmedBookings, totalRevenue };
  };

  const stats = getBookingStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
              <p className="text-gray-600">Manage your events and track performance</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Create Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                <p className="text-gray-600">Total Events</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <UserCheck className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmedBookings}</p>
                <p className="text-gray-600">Total Bookings</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <DollarSign className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
                <p className="text-gray-600">Total Revenue</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {events.length > 0 ? Math.round((stats.confirmedBookings / events.length) * 100) : 0}%
                </p>
                <p className="text-gray-600">Avg. Bookings/Event</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'events', name: 'Events', count: events.length },
                { id: 'bookings', name: 'Bookings', count: bookings.length },
                { id: 'analytics', name: 'Analytics', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'events' && (
              <div className="space-y-6">
                {events.length > 0 ? (
                  events.map((event, index) => {
                    const eventStatus = getEventStatus(event);
                    const revenue = calculateRevenue(event);
                    
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          {/* Event Info */}
                          <div className="flex-1">
                            <div className="flex items-start space-x-4">
                              <img
                                src={event.images[0]}
                                alt={event.title}
                                className="w-20 h-20 rounded-xl object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="text-xl font-semibold text-gray-900">
                                    {event.title}
                                  </h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${eventStatus.color}`}>
                                    {eventStatus.icon}
                                    <span className="capitalize">{eventStatus.status.replace('_', ' ')}</span>
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center space-x-2">
                                    <Calendar size={16} />
                                    <span>{formatDate(event.date)}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock size={16} />
                                    <span>{formatTime(event.time)}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <MapPin size={16} />
                                    <span>{event.venue?.name}</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-6 text-sm">
                                  <div className="flex items-center space-x-1">
                                    <Users size={16} />
                                    <span>{event.booked}/{event.capacity} attendees</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Star size={16} />
                                    <span>{event.rating} ({event.reviews} reviews)</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <DollarSign size={16} />
                                    <span>${revenue} revenue</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-3">
                            <div className="flex space-x-2">
                              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <Eye size={16} />
                                <span>View</span>
                              </button>
                              
                              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <Edit size={16} />
                                <span>Edit</span>
                              </button>
                              
                              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <Share2 size={16} />
                                <span>Share</span>
                              </button>
                              
                              <button className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                                <Trash2 size={16} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No events created yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first event to start managing bookings and tracking performance
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Create Event
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-6">
                {bookings.length > 0 ? (
                  bookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={booking.event.images[0]}
                            alt={booking.event.title}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.event.title}
                            </h3>
                            <p className="text-gray-600">
                              {booking.attendees[0]?.name} • {booking.quantity}x {booking.ticketType}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(booking.bookingDate)} • Booking ID: {booking.id}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            ${booking.totalPrice}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' 
                              ? 'text-green-600 bg-green-100' 
                              : 'text-yellow-600 bg-yellow-100'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ticket className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600">
                      Bookings will appear here once people start registering for your events
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="text-gray-400" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
                <p className="text-gray-600">
                  Detailed analytics and insights will be available here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManagementDashboard;
