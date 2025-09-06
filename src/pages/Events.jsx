import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Clock, Users, Star, Filter, Search, Heart, 
  ChevronDown, ChevronUp, Ticket, Crown, Sparkles, Music, Camera
} from 'lucide-react';
import BookingModal from '../components/BookingModal';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Mock events data
  const mockEvents = [
    {
      id: 1,
      title: "Neon Nights: Electronic Music Festival",
      description: "Experience the ultimate electronic music festival with world-class DJs and immersive light shows.",
      date: "2024-02-15",
      time: "22:00",
      venue: "Skyline Rooftop Lounge",
      location: "London, UK",
      price: "£45",
      category: "music",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      capacity: 200,
      available: 45,
      rating: 4.8,
      featured: true,
      tags: ["Electronic", "DJ", "Festival", "VIP Available"]
    },
    {
      id: 2,
      title: "Jazz & Wine Tasting Evening",
      description: "An intimate evening of smooth jazz and premium wine tasting in an elegant speakeasy setting.",
      date: "2024-02-18",
      time: "19:30",
      venue: "Underground Speakeasy",
      location: "Lagos, Nigeria",
      price: "₦15,000",
      category: "music",
      image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      capacity: 50,
      available: 12,
      rating: 4.9,
      featured: false,
      tags: ["Jazz", "Wine Tasting", "Intimate", "Premium"]
    },
    {
      id: 3,
      title: "Art Gallery Opening: Modern Expressions",
      description: "Discover contemporary art from emerging artists with live performances and networking opportunities.",
      date: "2024-02-20",
      time: "18:00",
      venue: "Cultural Haven",
      location: "London, UK",
      price: "Free",
      category: "art",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      capacity: 100,
      available: 67,
      rating: 4.6,
      featured: true,
      tags: ["Art", "Networking", "Free", "Contemporary"]
    },
    {
      id: 4,
      title: "Cocktail Masterclass & Mixology",
      description: "Learn the art of mixology from award-winning bartenders and create your own signature cocktails.",
      date: "2024-02-22",
      time: "20:00",
      venue: "Brew Café Social Hub",
      location: "Lagos, Nigeria",
      price: "₦25,000",
      category: "workshop",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      capacity: 30,
      available: 8,
      rating: 4.7,
      featured: false,
      tags: ["Cocktails", "Learning", "Interactive", "Premium"]
    },
    {
      id: 5,
      title: "Silent Disco: Headphone Party",
      description: "Dance the night away with wireless headphones, choosing your own music channel.",
      date: "2024-02-25",
      time: "21:00",
      venue: "Underground Club",
      location: "Manchester, UK",
      price: "£25",
      category: "music",
      image: "https://images.unsplash.com/photo-1571266028243-e68f857f258a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      capacity: 150,
      available: 89,
      rating: 4.5,
      featured: false,
      tags: ["Silent Disco", "Unique", "Dance", "Headphones"]
    },
    {
      id: 6,
      title: "Photography Workshop: Nightlife Shots",
      description: "Capture the energy of nightlife with professional photography techniques and equipment.",
      date: "2024-02-28",
      time: "19:00",
      venue: "Creative Studio",
      location: "Birmingham, UK",
      price: "£35",
      category: "workshop",
      image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      capacity: 20,
      available: 5,
      rating: 4.8,
      featured: true,
      tags: ["Photography", "Learning", "Nightlife", "Professional"]
    }
  ];

  const categories = [
    { value: 'all', label: 'All Events', icon: <Calendar size={16} /> },
    { value: 'music', label: 'Music', icon: <Music size={16} /> },
    { value: 'art', label: 'Art & Culture', icon: <Camera size={16} /> },
    { value: 'workshop', label: 'Workshops', icon: <Users size={16} /> },
    { value: 'networking', label: 'Networking', icon: <Users size={16} /> }
  ];

  const dateFilters = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' }
  ];

  useEffect(() => {
    setEvents(mockEvents);
    setFilteredEvents(mockEvents);
  }, []);

  useEffect(() => {
    let filtered = events;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filter by date
    if (selectedDate !== 'all') {
      const today = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        switch (selectedDate) {
          case 'today':
            return eventDate.toDateString() === today.toDateString();
          case 'tomorrow':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return eventDate.toDateString() === tomorrow.toDateString();
          case 'this-week':
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            return eventDate >= today && eventDate <= weekEnd;
          case 'this-month':
            return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
          default:
            return true;
        }
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredEvents(filtered);
  }, [events, selectedCategory, selectedDate, searchTerm]);

  const toggleFavorite = (eventId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(eventId)) {
      newFavorites.delete(eventId);
    } else {
      newFavorites.add(eventId);
    }
    setFavorites(newFavorites);
  };

  const handleBookEvent = (event) => {
    setSelectedEvent(event);
    setIsBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingModalOpen(false);
    setSelectedEvent(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 20%, rgba(220, 38, 38, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 40% 80%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.1) 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 right-10 w-32 h-32 border border-red-200/30 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-10 left-10 w-24 h-24 border border-red-200/30 rounded-full"
          />
        </div>

        <div className="container mx-auto px-4 py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <span className="bg-gradient-to-r from-red-100/80 to-red-200/80 backdrop-blur-sm border border-red-200 rounded-full px-6 py-2 text-red-800 text-sm font-medium flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-400" />
                Live Events • Real Experiences • Unforgettable Nights
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold mb-8 text-gray-800 leading-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              <motion.span
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent bg-[length:200%_100%]"
              >
                Electric Events
              </motion.span>
              <br />
              <span className="text-gray-800">Awaiting You</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Immerse yourself in the pulse of the city. From underground beats to rooftop vibes, 
              discover events that ignite your soul and create memories that last forever.
            </motion.p>
            
            {/* Enhanced Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative max-w-3xl mx-auto"
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    boxShadow: [
                      "0 0 0 0 rgba(239, 68, 68, 0.4)",
                      "0 0 0 10px rgba(239, 68, 68, 0)",
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full blur-xl opacity-30"
                />
                <div className="relative bg-white/90 backdrop-blur-md border border-red-200 rounded-full p-2">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="text"
                    placeholder="Search for your next unforgettable experience..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none text-lg"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-full font-medium"
                  >
                    Search
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-20 left-10 text-white/20"
            >
              <Music size={24} />
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute top-32 right-20 text-white/20"
            >
              <Star size={20} />
            </motion.div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute bottom-20 left-20 text-white/20"
            >
              <Sparkles size={18} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-12 bg-gradient-to-r from-white via-red-50 to-white border-b">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row gap-6 items-center justify-between"
          >
            <div className="flex flex-wrap gap-4">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-3">
                {categories.map((category, index) => (
                  <motion.button
                    key={category.value}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category.value
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25'
                        : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-700 border border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <motion.div
                      animate={selectedCategory === category.value ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {category.icon}
                    </motion.div>
                    {category.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Date Filter */}
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {dateFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>

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
          </motion.div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 p-6 bg-gray-50 rounded-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option>All Locations</option>
                      <option>London, UK</option>
                      <option>Lagos, Nigeria</option>
                      <option>Manchester, UK</option>
                      <option>Birmingham, UK</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option>All Types</option>
                      <option>Featured Events</option>
                      <option>Free Events</option>
                      <option>VIP Events</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 bg-gradient-to-br from-white via-red-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {filteredEvents.length} Electric Events Found
              </h2>
              <p className="text-gray-600">Ready to ignite your night?</p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm border border-gray-200"
            >
              <span className="text-sm text-gray-600">Sort by:</span>
              <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Most Popular</option>
                <option>Date</option>
                <option>Price</option>
                <option>Rating</option>
              </select>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -15,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 group-hover:shadow-2xl transition-all duration-500">
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {event.featured && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <Crown size={12} />
                        Featured
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => toggleFavorite(event.id)}
                    className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Heart
                      size={20}
                      className={favorites.has(event.id) ? 'text-red-500 fill-current' : 'text-white'}
                    />
                  </button>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-white mb-1">
                      <MapPin size={14} />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{event.title}</h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      {event.available}/{event.capacity}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{event.rating}</span>
                      </div>
                      <span className="text-2xl font-bold text-red-600">{event.price}</span>
                    </div>
                    <motion.button 
                      onClick={() => handleBookEvent(event)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-red-500/25"
                    >
                      <Ticket size={16} />
                      Book Now
                    </motion.button>
                  </div>
                </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseBooking}
        event={selectedEvent}
        venue={selectedEvent ? { name: selectedEvent.venue } : null}
      />
    </div>
  );
};

export default Events;
