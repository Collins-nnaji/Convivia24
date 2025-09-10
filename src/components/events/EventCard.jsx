import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, Clock, Users, Star, Heart, 
  Share2, Bookmark, Eye, Ticket, TrendingUp
} from 'lucide-react';
import BookingModal from './BookingModal';

const EventCard = ({ event, currentUser, onBook, onFavorite, onShare }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
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

  const getAvailabilityColor = () => {
    const percentage = (event.booked / event.capacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getAvailabilityText = () => {
    const remaining = event.capacity - event.booked;
    if (remaining <= 0) return 'Sold Out';
    if (remaining <= 10) return `Only ${remaining} left`;
    return `${remaining} available`;
  };

  const handleBookNow = () => {
    setIsBookingOpen(true);
    if (onBook) onBook(event);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    if (onFavorite) onFavorite(event, !isFavorited);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (onShare) onShare(event);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Music': 'bg-purple-100 text-purple-800',
      'Art': 'bg-pink-100 text-pink-800',
      'Business': 'bg-green-100 text-green-800',
      'Wellness': 'bg-cyan-100 text-cyan-800',
      'Food & Drink': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -2 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        {/* Image Section */}
        <div className="relative">
          <img
            src={event.images[0]}
            alt={event.title}
            className="w-full h-40 sm:h-48 object-cover"
          />
          
          {/* Overlay Badges */}
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col space-y-1 sm:space-y-2">
            {event.featured && (
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                <Star size={10} />
                <span className="hidden sm:inline">Featured</span>
              </span>
            )}
            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(event.category)}`}>
              {event.category}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col space-y-1 sm:space-y-2">
            <button
              onClick={handleFavorite}
              className={`p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-colors ${
                isFavorited 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white bg-opacity-80 text-gray-600 hover:bg-opacity-100'
              }`}
            >
              <Heart size={14} className={isFavorited ? 'fill-current' : ''} />
            </button>
            <button
              onClick={handleBookmark}
              className={`p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-colors ${
                isBookmarked 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white bg-opacity-80 text-gray-600 hover:bg-opacity-100'
              }`}
            >
              <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 sm:p-2 rounded-full bg-white bg-opacity-80 text-gray-600 hover:bg-opacity-100 transition-colors"
            >
              <Share2 size={14} />
            </button>
          </div>

          {/* Availability Indicator */}
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
            <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-1.5 sm:p-2">
              <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                <span className="flex items-center space-x-1">
                  <Users size={12} />
                  <span>{event.booked}/{event.capacity}</span>
                </span>
                <span className={getAvailabilityColor()}>
                  {getAvailabilityText()}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-1 mt-1 sm:mt-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(event.booked / event.capacity) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-6">
          {/* Event Title and Rating */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 flex-1">
              {event.title}
            </h3>
            <div className="flex items-center space-x-1 ml-3">
              <Star size={14} className="text-yellow-400 fill-current" />
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                {event.rating}
              </span>
              <span className="text-xs text-gray-500">
                ({event.reviews})
              </span>
            </div>
          </div>

          {/* Event Description */}
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {event.description}
          </p>

          {/* Event Details */}
          <div className="space-y-1.5 sm:space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
              <Calendar size={14} />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
              <Clock size={14} />
              <span>{formatTime(event.time)}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
              <MapPin size={14} />
              <span className="truncate">{event.venue?.name}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {event.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{event.tags.length - 3} more
              </span>
            )}
          </div>

          {/* Organizer */}
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={event.organizer.logo}
              alt={event.organizer.name}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
            />
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-900">
                {event.organizer.name}
              </p>
              <p className="text-xs text-gray-500">Organizer</p>
            </div>
          </div>

          {/* Price and Action */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                ${event.price.general}
              </span>
              {event.price.vip && (
                <span className="text-xs sm:text-sm text-gray-500">
                  - ${event.price.vip} VIP
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {/* View details */}}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-1"
              >
                <Eye size={14} />
                <span>View</span>
              </button>
              
              <button
                onClick={handleBookNow}
                disabled={event.booked >= event.capacity}
                className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <Ticket size={14} />
                <span>
                  {event.booked >= event.capacity ? 'Sold Out' : 'Book Now'}
                </span>
              </button>
            </div>
          </div>

          {/* Trending Indicator */}
          {event.booked > event.capacity * 0.7 && (
            <div className="mt-3 flex items-center space-x-1 text-orange-600 text-xs sm:text-sm">
              <TrendingUp size={12} />
              <span>Trending - {Math.round((event.booked / event.capacity) * 100)}% sold</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        event={event}
        currentUser={currentUser}
      />
    </>
  );
};

export default EventCard;
