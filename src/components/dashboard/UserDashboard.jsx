import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, Clock, Users, Star, Ticket, 
  Heart, Share2, Download, Eye, X, CheckCircle,
  TrendingUp, Award, Crown, Sparkles, Filter
} from 'lucide-react';
import { bookingService, eventService } from '../../services/eventService';

const UserDashboard = ({ currentUser }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadUserBookings();
  }, [currentUser]);

  const loadUserBookings = async () => {
    try {
      setIsLoading(true);
      const response = await bookingService.getUserBookings(currentUser.id);
      
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const response = await bookingService.cancelBooking(bookingId);
        if (response.success) {
          setBookings(prev => prev.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: 'cancelled' }
              : booking
          ));
        }
      } catch (error) {
        console.error('Error cancelling booking:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} />;
      case 'cancelled': return <X size={16} />;
      case 'pending': return <Clock size={16} />;
      default: return <Ticket size={16} />;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus !== 'all' && booking.status !== filterStatus) {
      return false;
    }
    
    const eventDate = new Date(booking.event.date);
    const now = new Date();
    
    if (activeTab === 'upcoming') {
      return eventDate >= now;
    } else if (activeTab === 'past') {
      return eventDate < now;
    }
    
    return true;
  });

  const upcomingBookings = bookings.filter(booking => {
    const eventDate = new Date(booking.event.date);
    return eventDate >= new Date();
  });

  const pastBookings = bookings.filter(booking => {
    const eventDate = new Date(booking.event.date);
    return eventDate < new Date();
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile-Optimized Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Welcome back, {currentUser.name}!</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your events and bookings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Stats Cards */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
                <Calendar className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{upcomingBookings.length}</p>
                <p className="text-xs sm:text-sm text-gray-600">Upcoming Events</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{pastBookings.length}</p>
                <p className="text-xs sm:text-sm text-gray-600">Past Events</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-xl">
                <Award className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{currentUser.loyaltyPoints}</p>
                <p className="text-xs sm:text-sm text-gray-600">Loyalty Points</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{currentUser.totalEvents}</p>
                <p className="text-xs sm:text-sm text-gray-600">Total Events</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile-Optimized Tabs */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
              {[
                { id: 'upcoming', name: 'Upcoming', count: upcomingBookings.length },
                { id: 'past', name: 'Past', count: pastBookings.length },
                { id: 'all', name: 'All', count: bookings.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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

          {/* Mobile-Optimized Filter Bar */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Filter size={18} className="text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Mobile-Optimized Bookings List */}
          <div className="p-4 sm:p-6">
            {filteredBookings.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {filteredBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col space-y-4">
                      {/* Event Info */}
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <img
                          src={booking.event.images[0]}
                          alt={booking.event.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                              {booking.event.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(booking.status)} w-fit`}>
                              {getStatusIcon(booking.status)}
                              <span className="capitalize">{booking.status}</span>
                            </span>
                          </div>
                          
                          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Calendar size={14} />
                              <span>{formatDate(booking.event.date)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock size={14} />
                              <span>{formatTime(booking.event.time)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin size={14} />
                              <span className="truncate">{booking.event.venue?.name}</span>
                            </div>
                          </div>

                          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm space-y-1 sm:space-y-0">
                            <div className="flex items-center space-x-1">
                              <Ticket size={14} />
                              <span>{booking.quantity}x {booking.ticketType}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users size={14} />
                              <span className="truncate">ID: {booking.id}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="text-center sm:text-right">
                          <p className="text-xl sm:text-2xl font-bold text-gray-900">
                            ${booking.totalPrice}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Paid on {formatDate(booking.bookingDate)}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <button className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                            <Eye size={14} />
                            <span>View</span>
                          </button>
                          
                          <button className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                            <Download size={14} />
                            <span>Download</span>
                          </button>
                          
                          {booking.status === 'confirmed' && new Date(booking.event.date) > new Date() && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                            >
                              <X size={14} />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  {activeTab === 'upcoming' 
                    ? "You don't have any upcoming events booked"
                    : "You haven't attended any events yet"
                  }
                </p>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm sm:text-base">
                  Browse Events
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
