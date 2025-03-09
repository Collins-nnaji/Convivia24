import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Search, Users, MapPin, 
  Filter, ChevronDown, Plus, 
  Crown, Heart, Star, PartyPopper
} from 'lucide-react';
import { motion } from 'framer-motion';

const Events = () => {
  const { currentUser } = useAuth();
  const { events, loading } = useCommunity();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    date: 'all',
    location: 'all'
  });
  
  // Filter events based on search query and filters
  const filteredEvents = events.filter(event => {
    // Search query filter
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter
    const matchesType = filters.type === 'all' ? true : event.tags?.includes(filters.type);
    
    // Date filter (simplified for demo)
    const eventDate = new Date(event.date);
    const today = new Date();
    const isToday = eventDate.toDateString() === today.toDateString();
    const isThisWeek = eventDate <= new Date(today.setDate(today.getDate() + 7));
    const isThisMonth = eventDate.getMonth() === new Date().getMonth() && eventDate.getFullYear() === new Date().getFullYear();
    
    let matchesDate = true;
    if (filters.date === 'today') matchesDate = isToday;
    else if (filters.date === 'week') matchesDate = isThisWeek;
    else if (filters.date === 'month') matchesDate = isThisMonth;
    
    // Location filter
    const matchesLocation = filters.location === 'all' ? true : event.location.includes(filters.location);
    
    return matchesSearch && matchesType && matchesDate && matchesLocation;
  });
  
  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const updateFilter = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const celebrationTypes = [
    {
      icon: <Crown size={32} className="text-red-600" />,
      title: "Traditional Ceremonies",
      description: "Custom packages for traditional weddings and cultural celebrations",
      features: ["Palm wine service", "Traditional servers", "Cultural presentations"]
    },
    {
      icon: <Heart size={32} className="text-red-600" />,
      title: "Wedding Services",
      description: "Complete beverage solutions for the perfect wedding celebration",
      features: ["Premium drink selection", "Professional service", "Custom packages"]
    },
    {
      icon: <Star size={32} className="text-red-600" />,
      title: "Corporate Events",
      description: "Sophisticated beverage services for corporate functions",
      features: ["High-end spirits", "Branded experiences", "Full-service bars"]
    },
    {
      icon: <PartyPopper size={32} className="text-red-600" />,
      title: "Private Celebrations",
      description: "Personalized service for birthdays and special moments",
      features: ["Custom cocktails", "Party supplies", "Event staffing"]
    }
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Raleway, sans-serif' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-black to-red-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Plan Your Celebration
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Discover and join upcoming events or create your own celebration. From weddings to corporate events, 
            we've got you covered.
          </p>
        </div>
      </div>

      {/* Celebration Types Section */}
      <section id="plan-your-celebration" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Choose Your Celebration Type
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Select from our range of specialized celebration services tailored to your specific event needs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {celebrationTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    {type.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{type.title}</h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <ul className="space-y-2">
                    {type.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center text-sm text-gray-500">
                        <div className="h-2 w-2 bg-red-600 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button 
                    onClick={() => {
                      updateFilter('type', type.title.toLowerCase().includes('traditional') ? 'traditional' : 
                                         type.title.toLowerCase().includes('wedding') ? 'wedding' : 
                                         type.title.toLowerCase().includes('corporate') ? 'corporate' : 'party');
                      document.getElementById('events-section').scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-red-600 font-semibold flex items-center hover:text-red-700 transition-colors"
                  >
                    View Events
                    <Calendar size={16} className="ml-2" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => currentUser ? navigate('/create-event') : navigate('/login')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              {currentUser ? 'Create Your Own Event' : 'Login to Create an Event'}
            </button>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <div id="events-section" className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-600 focus:border-red-600 sm:text-sm"
                placeholder="Search events by title, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button
              onClick={toggleFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Filter className="h-5 w-5 mr-2 text-gray-400" />
              Filters
              <ChevronDown className={`h-5 w-5 ml-1 text-gray-400 transition-transform ${showFilters ? 'transform rotate-180' : ''}`} />
            </button>
            
            {currentUser && (
              <button
                onClick={() => navigate('/create-event')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Event
              </button>
            )}
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-md shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                    value={filters.type}
                    onChange={(e) => updateFilter('type', e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate</option>
                    <option value="party">Party</option>
                    <option value="traditional">Traditional</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                    value={filters.date}
                    onChange={(e) => updateFilter('date', e.target.value)}
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                  >
                    <option value="all">All Locations</option>
                    <option value="Lagos">Lagos</option>
                    <option value="Virtual">Virtual</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Events Grid */}
        <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
          Upcoming Events
        </h2>
        
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filters to find events.
            </p>
            {currentUser && (
              <button
                onClick={() => navigate('/create-event')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Create an Event
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const eventDate = new Date(event.date);
              const formattedDate = eventDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const formattedTime = eventDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });
              
              return (
                <motion.div
                  key={event.id || event._id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                  onClick={() => handleEventClick(event.id || event._id)}
                >
                  <div className="h-40 relative">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 rounded-br-lg">
                      {formattedDate}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formattedTime}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{event.attendees || event.attendeeCount || 0} attending</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-gray-500 text-sm">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events; 