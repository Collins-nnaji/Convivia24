import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Map, List, MapPin, Calendar, Clock, 
  Users, Star, Heart, Zap, Crown, Music, Trophy, 
  ChevronDown, ChevronUp, Eye, Share2, Ticket
} from 'lucide-react';

const EventDiscoveryMobile = () => {
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('london');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [events, setEvents] = useState([]);

  const categories = [
    { id: 'all', name: 'All', icon: <Calendar size={16} />, color: 'gray' },
    { id: 'nightlife', name: 'Nightlife', icon: <Music size={16} />, color: 'purple' },
    { id: 'sports', name: 'Sports', icon: <Trophy size={16} />, color: 'blue' },
    { id: 'festivals', name: 'Festivals', icon: <Zap size={16} />, color: 'orange' },
    { id: 'culture', name: 'Culture', icon: <Star size={16} />, color: 'pink' },
    { id: 'networking', name: 'Networking', icon: <Users size={16} />, color: 'green' }
  ];

  const cities = ['London', 'Manchester', 'Birmingham', 'Lagos', 'Abuja', 'New York', 'Barcelona'];

  // Mock events data
  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        title: "Champions League Final Watch Party",
        description: "Join hundreds of football fans for the biggest match of the year with premium drinks and VIP viewing areas.",
        category: 'sports',
        date: '2024-06-01',
        time: '20:00',
        venue: 'Sky Sports Bar & Lounge',
        city: 'London',
        country: 'UK',
        image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        price: 'Free',
        attendees: 250,
        capacity: 300,
        perks: ['Free welcome drink', 'VIP seating', '50% off food'],
        tier: 'premium',
        isLive: true
      },
      {
        id: 2,
        title: "Afrobeat Festival Night",
        description: "Experience the best of African music with live performances, traditional food, and cultural displays.",
        category: 'nightlife',
        date: '2024-06-15',
        time: '19:00',
        venue: 'Electric Ballroom',
        city: 'London',
        country: 'UK',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        price: '£25',
        attendees: 180,
        capacity: 200,
        perks: ['Early bird discount', 'Free parking', 'Complimentary cocktail'],
        tier: 'free',
        isLive: false
      },
      {
        id: 3,
        title: "Tech Networking Mixer",
        description: "Connect with fellow tech professionals, entrepreneurs, and innovators in a relaxed atmosphere.",
        category: 'networking',
        date: '2024-06-08',
        time: '18:30',
        venue: 'The Shard',
        city: 'London',
        country: 'UK',
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        price: '£15',
        attendees: 95,
        capacity: 120,
        perks: ['Free networking materials', 'Complimentary drinks', 'Speaker sessions'],
        tier: 'premium',
        isLive: false
      }
    ];
    setEvents(mockEvents);
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesCity = event.city.toLowerCase() === selectedCity.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesCity;
  });

  const toggleFavorite = (eventId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(eventId)) {
      newFavorites.delete(eventId);
    } else {
      newFavorites.add(eventId);
    }
    setFavorites(newFavorites);
  };

  const getCategoryColor = (category) => {
    const categoryObj = categories.find(cat => cat.id === category);
    return categoryObj ? categoryObj.color : 'gray';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-16 z-40">
        <div className="p-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search events, venues, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? `bg-${category.color}-100 text-${category.color}-700 border border-${category.color}-300`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* City Filter & View Toggle */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-500" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-sm font-medium text-gray-700 bg-transparent border-none focus:outline-none"
            >
              {cities.map(city => (
                <option key={city} value={city.toLowerCase()}>{city}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'map' ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Map size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {filteredEvents.length} Events Found
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700"
          >
            <Filter size={16} />
            Filters
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 bg-white rounded-xl p-4 shadow-sm border"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg text-sm">
                    <option>Any Date</option>
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg text-sm">
                    <option>Any Price</option>
                    <option>Free</option>
                    <option>Under £10</option>
                    <option>Under £25</option>
                    <option>Under £50</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Events Grid */}
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.tier === 'vip' ? 'bg-yellow-100 text-yellow-700' :
                    event.tier === 'premium' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {event.tier === 'vip' && <Crown size={10} className="inline mr-1" />}
                    {event.tier === 'premium' && <Star size={10} className="inline mr-1" />}
                    {event.tier.charAt(0).toUpperCase() + event.tier.slice(1)}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => toggleFavorite(event.id)}
                    className={`p-2 rounded-full transition-colors ${
                      favorites.has(event.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    }`}
                  >
                    <Heart size={16} className={favorites.has(event.id) ? 'fill-current' : ''} />
                  </button>
                </div>
                {event.isLive && (
                  <div className="absolute bottom-4 left-4">
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      Live
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{event.title}</h3>
                  <span className="text-lg font-bold text-red-600 ml-2">{event.price}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    {event.venue}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-600">{event.attendees}/{event.capacity} attending</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500" />
                    <span className="text-sm text-gray-600">4.8</span>
                  </div>
                </div>

                {event.perks && event.perks.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {event.perks.slice(0, 2).map((perk, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                        >
                          {perk}
                        </span>
                      ))}
                      {event.perks.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{event.perks.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                    <Ticket size={16} />
                    Get Tickets
                  </button>
                  <button className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <Share2 size={16} />
                  </button>
                  <button className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDiscoveryMobile;
