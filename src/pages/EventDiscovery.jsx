import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Map, List, MapPin, Calendar, Clock, 
  Users, Star, Heart, Bookmark, Navigation, Zap, Crown,
  Music, Trophy, Palette, Briefcase, Coffee, Gamepad2,
  ChevronDown, ChevronUp, Eye, Share2, Ticket
} from 'lucide-react';

const EventDiscovery = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('london');
  const [selectedCountry, setSelectedCountry] = useState('uk');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [events, setEvents] = useState([]);

  const categories = [
    { id: 'all', name: 'All Events', icon: <Calendar size={16} />, color: 'gray' },
    { id: 'nightlife', name: 'Nightlife', icon: <Music size={16} />, color: 'purple' },
    { id: 'sports', name: 'Sports', icon: <Trophy size={16} />, color: 'blue' },
    { id: 'festivals', name: 'Festivals', icon: <Zap size={16} />, color: 'orange' },
    { id: 'culture', name: 'Culture', icon: <Palette size={16} />, color: 'pink' },
    { id: 'networking', name: 'Networking', icon: <Briefcase size={16} />, color: 'green' },
    { id: 'dining', name: 'Dining', icon: <Coffee size={16} />, color: 'yellow' },
    { id: 'gaming', name: 'Gaming', icon: <Gamepad2 size={16} />, color: 'red' }
  ];

  const cities = {
    uk: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Edinburgh'],
    nigeria: ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Benin City'],
    usa: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Las Vegas', 'San Francisco'],
    spain: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao', 'Malaga']
  };

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
        address: '123 Oxford Street, London W1D 2HX',
        image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        price: 'Free Entry',
        rating: 4.8,
        attendees: 247,
        capacity: 300,
        tags: ['Sports', 'Football', 'Live Streaming', 'Free Drinks'],
        perks: ['Free welcome drink', 'VIP seating area', 'Half-time snacks'],
        isPartner: true,
        isFeatured: true,
        aiRecommendation: 95,
        distance: '0.8 km'
      },
      {
        id: 2,
        title: "Afrobeat Festival Night",
        description: "Experience the best of African music and culture with live performances, DJ sets, and authentic cuisine.",
        category: 'festivals',
        date: '2024-05-25',
        time: '19:00',
        venue: 'Electric Ballroom',
        city: 'London',
        country: 'UK',
        address: '184 Camden High St, London NW1 8QP',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        price: '£25',
        rating: 4.9,
        attendees: 189,
        capacity: 250,
        tags: ['Afrobeat', 'Live Music', 'Culture', 'Dancing'],
        perks: ['Early entry', '10% off drinks', 'Meet & greet with artists'],
        isPartner: true,
        isFeatured: true,
        aiRecommendation: 88,
        distance: '1.2 km'
      },
      {
        id: 3,
        title: "Rooftop Networking Mixer",
        description: "Connect with professionals from tech, finance, and creative industries while enjoying panoramic city views.",
        category: 'networking',
        date: '2024-05-30',
        time: '18:30',
        venue: 'The Shard Sky Lounge',
        city: 'London',
        country: 'UK',
        address: '31 St Thomas St, London SE1 9QU',
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        price: '£40',
        rating: 4.7,
        attendees: 156,
        capacity: 200,
        tags: ['Networking', 'Professionals', 'Rooftop', 'Cocktails'],
        perks: ['Welcome cocktail', 'Business card exchange', 'VIP area access'],
        isPartner: true,
        isFeatured: false,
        aiRecommendation: 82,
        distance: '2.1 km'
      },
      {
        id: 4,
        title: "Underground Jazz & Cocktails",
        description: "Intimate jazz session in a speakeasy-style venue with craft cocktails and live performances.",
        category: 'nightlife',
        date: '2024-05-28',
        time: '21:00',
        venue: 'Jazz Café Underground',
        city: 'London',
        country: 'UK',
        address: '5 Parkway, London NW1 7PG',
        image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        price: '£30',
        rating: 4.6,
        attendees: 87,
        capacity: 120,
        tags: ['Jazz', 'Cocktails', 'Intimate', 'Live Music'],
        perks: ['Signature cocktail', 'VIP table booking', 'Meet the musicians'],
        isPartner: true,
        isFeatured: false,
        aiRecommendation: 79,
        distance: '1.5 km'
      }
    ];
    setEvents(mockEvents);
  }, []);

  const filteredEvents = events.filter(event => {
    if (selectedCategory !== 'all' && event.category !== selectedCategory) return false;
    if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !event.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
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

  const getRecommendationColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || 'gray';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Events</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <select 
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="bg-transparent border-none outline-none font-medium"
                  >
                    <option value="uk">United Kingdom</option>
                    <option value="nigeria">Nigeria</option>
                    <option value="usa">United States</option>
                    <option value="spain">Spain</option>
                  </select>
                </div>
                <span>•</span>
                <select 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent border-none outline-none font-medium"
                >
                  {cities[selectedCountry]?.map(city => (
                    <option key={city} value={city.toLowerCase()}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List size={16} />
                  List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Map size={16} />
                  Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search events, venues, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
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

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                className="mt-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500">
                      <option>Today</option>
                      <option>This Week</option>
                      <option>This Month</option>
                      <option>Custom Range</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500">
                      <option>Any Price</option>
                      <option>Free</option>
                      <option>Under £20</option>
                      <option>£20 - £50</option>
                      <option>£50+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Distance</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500">
                      <option>Any Distance</option>
                      <option>Within 1km</option>
                      <option>Within 5km</option>
                      <option>Within 10km</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500">
                      <option>AI Recommended</option>
                      <option>Most Popular</option>
                      <option>Nearest</option>
                      <option>Date</option>
                      <option>Price</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Recommendations Banner */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-red-700">
              <Zap size={20} />
              <span className="font-medium">AI Recommendations</span>
            </div>
            <span className="text-red-600">Based on your interests: Nightlife, Sports, Networking</span>
          </div>
        </div>
      </div>

      {/* Events Content */}
      <div className="container mx-auto px-4 py-6">
        {viewMode === 'list' ? (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredEvents.length} events found
                </h2>
                <p className="text-gray-600">Showing events in {selectedCity}</p>
              </div>
            </div>

            {/* Events List */}
            <div className="space-y-4">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Event Image */}
                    <div className="lg:w-80 h-48 lg:h-auto relative">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover rounded-t-xl lg:rounded-l-xl lg:rounded-t-none"
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {event.isFeatured && (
                          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Crown size={12} />
                            Featured
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${getRecommendationColor(event.aiRecommendation)}`}>
                          {event.aiRecommendation}% Match
                        </span>
                      </div>
                      <button
                        onClick={() => toggleFavorite(event.id)}
                        className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                      >
                        <Heart
                          size={20}
                          className={favorites.has(event.id) ? 'text-red-500 fill-current' : 'text-gray-600'}
                        />
                      </button>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getCategoryColor(event.category)}-100 text-${getCategoryColor(event.category)}-700`}>
                              {event.category}
                            </span>
                            {event.isPartner && (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                Partner
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                          <p className="text-gray-600 mb-4">{event.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">{event.price}</div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star size={14} className="text-yellow-400 fill-current" />
                            {event.rating}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          {event.distance}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          {event.attendees}/{event.capacity}
                        </div>
                      </div>

                      {/* Perks */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Member Perks:</h4>
                        <div className="flex flex-wrap gap-2">
                          {event.perks.map((perk, index) => (
                            <span
                              key={index}
                              className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full"
                            >
                              {perk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Ticket size={18} />
                          Get Access
                        </motion.button>
                        <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Eye size={18} />
                        </button>
                        <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Map size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Map View</h3>
                <p className="text-gray-500">Interactive map with event locations will be displayed here</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDiscovery;
