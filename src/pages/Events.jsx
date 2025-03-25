import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Star, Filter, ChevronDown, Search, ArrowRight, Clock, CheckCircle, ClipboardList, Music, Cake, Heart, Award, Wine, Utensils, Palette, X, TrendingUp, ThumbsUp, Globe, Sparkles, Ticket, CalendarPlus, User, Percent, Crown, Download, ListChecks, Building2, User2, Gift, Store, CalendarClock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Events = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('plan');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [eventType, setEventType] = useState('all');
  const [sortOption, setSortOption] = useState('popularity');
  const [visibleItems, setVisibleItems] = useState(6);
  const [showPlanningForm, setShowPlanningForm] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Animation hooks
  const [activeItemIndex, setActiveItemIndex] = useState(null);
  
  // Add review state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: "Sarah Johnson",
      rating: 5,
      service: "Catering",
      comment: "Exceptional service! The food was amazing and the presentation was perfect.",
      date: "2024-03-15"
    },
    {
      id: 2,
      user: "Michael Chen",
      rating: 4,
      service: "Decoration",
      comment: "Beautiful decorations and great attention to detail. Would recommend!",
      date: "2024-03-14"
    },
    {
      id: 3,
      user: "Aisha Patel",
      rating: 5,
      service: "Drinks Service",
      comment: "Professional service and excellent drink selection. Made our event special!",
      date: "2024-03-13"
    }
  ]);
  
  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
  }, []);
  
  // Mock venues data
  const venuesData = [
    {
      id: 1,
      name: "The Grand Ballroom",
      location: "Lagos, Nigeria",
      rating: 4.9,
      price: "₦500,000 - ₦1,500,000",
      capacity: "Up to 500 guests",
      features: ["Free Parking", "Catering", "Decoration", "Sound System"],
      type: "wedding",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80",
      popularity: 98
    },
    {
      id: 2,
      name: "Riverside Manor",
      location: "London, UK",
      rating: 4.8,
      price: "£5,000 - £12,000",
      capacity: "Up to 300 guests",
      features: ["Garden", "Indoor & Outdoor", "Accommodation", "Bar Service"],
      type: "wedding",
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
      popularity: 95
    },
    {
      id: 3,
      name: "Skyline Terrace",
      location: "Abuja, Nigeria",
      rating: 4.7,
      price: "₦350,000 - ₦900,000",
      capacity: "Up to 150 guests",
      features: ["Rooftop View", "Catering", "Bar Service", "Sunset Views"],
      type: "corporate",
      image: "https://images.unsplash.com/photo-1533092770895-4ae2f92a3faa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1474&q=80",
      popularity: 90
    },
    {
      id: 4,
      name: "The Royal Garden",
      location: "Manchester, UK",
      rating: 4.6,
      price: "£3,000 - £8,000",
      capacity: "Up to 200 guests",
      features: ["Historic Building", "Gardens", "Catering", "Parking"],
      type: "wedding",
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
      popularity: 88
    },
    {
      id: 5,
      name: "Ocean View Resort",
      location: "Lagos, Nigeria",
      rating: 4.8,
      price: "₦650,000 - ₦1,800,000",
      capacity: "Up to 400 guests",
      features: ["Beach Access", "Accommodation", "Spa", "Multiple Venues"],
      type: "corporate",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
      popularity: 92
    },
    {
      id: 6,
      name: "Central City Hall",
      location: "London, UK",
      rating: 4.5,
      price: "£4,000 - £9,000",
      capacity: "Up to 350 guests",
      features: ["Central Location", "Historic Building", "In-house Catering", "AV Equipment"],
      type: "corporate",
      image: "https://images.unsplash.com/photo-1572025442646-866d16c84a54?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
      popularity: 85
    },
    {
      id: 7,
      name: "Garden Paradise",
      location: "Port Harcourt, Nigeria",
      rating: 4.6,
      price: "₦300,000 - ₦800,000",
      capacity: "Up to 250 guests",
      features: ["Tropical Gardens", "Outdoor Space", "Catering", "Photography Spots"],
      type: "birthday",
      image: "https://images.unsplash.com/photo-1604881988758-f76ad2f7aac1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80",
      popularity: 83
    },
    {
      id: 8,
      name: "The Vintage Loft",
      location: "Birmingham, UK",
      rating: 4.7,
      price: "£2,500 - £6,000",
      capacity: "Up to 120 guests",
      features: ["Industrial Style", "Unique Space", "Urban Location", "Flexible Layout"],
      type: "birthday",
      image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80",
      popularity: 87
    }
  ];

  // Mock upcoming events data
  const eventsData = [
    {
      id: 1,
      name: "Annual Tech Conference 2024",
      date: "June 15, 2024",
      time: "9:00 AM - 6:00 PM",
      location: "Lagos, Nigeria",
      venue: "Ocean View Resort",
      category: "Conference",
      organizer: "TechNigeria Association",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 2,
      name: "Summer Music Festival",
      date: "July 5-7, 2024",
      time: "4:00 PM - 11:00 PM",
      location: "London, UK",
      venue: "Riverside Park",
      category: "Entertainment",
      organizer: "UK Music Productions",
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 3,
      name: "International Food Festival",
      date: "May 20-22, 2024",
      time: "12:00 PM - 10:00 PM",
      location: "Abuja, Nigeria",
      venue: "Central City Square",
      category: "Food & Drink",
      organizer: "Global Tastes Nigeria",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80"
    },
    {
      id: 4,
      name: "Business Leadership Summit",
      date: "June 8, 2024",
      time: "8:30 AM - 4:30 PM",
      location: "Manchester, UK",
      venue: "The Royal Garden Conference Center",
      category: "Business",
      organizer: "UK Business Network",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80"
    },
    {
      id: 5,
      name: "Wedding Expo 2024",
      date: "May 18-19, 2024",
      time: "10:00 AM - 8:00 PM",
      location: "Lagos, Nigeria",
      venue: "The Grand Ballroom",
      category: "Exhibition",
      organizer: "Wedding Planners Association",
      image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 6,
      name: "Charity Gala Dinner",
      date: "July 20, 2024",
      time: "7:00 PM - 11:00 PM",
      location: "London, UK",
      venue: "Central City Hall",
      category: "Charity",
      organizer: "UK Children's Foundation",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80"
    }
  ];
  
  // Event categories with icons
  const eventCategories = [
    { id: 'all', name: 'All Events', icon: <Calendar size={20} /> },
    { id: 'wedding', name: 'Weddings', icon: <Heart size={20} /> },
    { id: 'corporate', name: 'Corporate', icon: <ClipboardList size={20} /> },
    { id: 'birthday', name: 'Birthday', icon: <Cake size={20} /> },
    { id: 'cultural', name: 'Cultural', icon: <Award size={20} /> },
  ];

  // Filter venues based on search query, location, rating, and type
  const filteredVenues = venuesData.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         venue.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || 
                          (selectedLocation === 'nigeria' && venue.location.includes('Nigeria')) ||
                          (selectedLocation === 'uk' && venue.location.includes('UK'));
    const matchesRating = venue.rating >= ratingFilter;
    const matchesType = eventType === 'all' || venue.type === eventType;
    
    return matchesSearch && matchesLocation && matchesRating && matchesType;
  });
  
  // Filter events based on search query, location and type
  const filteredEvents = eventsData.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || 
                          (selectedLocation === 'nigeria' && event.location.includes('Nigeria')) ||
                          (selectedLocation === 'uk' && event.location.includes('UK'));
    const matchesType = eventType === 'all' || event.type === eventType;
    
    return matchesSearch && matchesLocation && matchesType;
  });
  
  // Sort venues based on selection
  const sortedVenues = [...filteredVenues].sort((a, b) => {
    switch (sortOption) {
      case 'rating':
        return b.rating - a.rating;
      case 'capacity':
        return parseInt(b.capacity.split('-')[1]) - parseInt(a.capacity.split('-')[1]);
      default:
        return b.rating - a.rating;
    }
  });
  
  const handleLoadMore = () => {
    setVisibleItems(prev => prev + 4);
  };

  // Tabs configuration
  const tabs = [
    { id: 'plan', label: 'Plan Your Celebrations', icon: <Calendar className="h-4 w-4" /> },
    { id: 'vendors', label: 'Vendors', icon: <Store className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background with animated particles */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-red-900/80 to-black z-10"></div>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`particle-events-${i}`}
              className="absolute w-1 h-1 rounded-full bg-red-500/30"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: Math.random() * 100 + '%', 
                opacity: 0.3 + Math.random() * 0.5
              }}
              animate={{ 
                x: Math.random() * 100 + '%', 
                y: Math.random() * 100 + '%',
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ 
                duration: 5 + Math.random() * 10, 
                repeat: Infinity,
                repeatType: "mirror"
              }}
            />
          ))}
          <motion.div 
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black/10 to-black z-0"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.4, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[length:20px_20px] z-0" />
        </div>
        
        <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-white via-red-500 to-white"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              Events & Celebrations
            </motion.h1>
            <motion.p 
              className="text-xl text-white/80 mb-8 text-center max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Discover amazing venues and upcoming events across Nigeria and the UK
            </motion.p>
            
            {/* Search bar */}
            <motion.div
              className="relative w-full max-w-3xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-full overflow-hidden focus-within:border-red-500/50 transition-all duration-300">
                <Search className="ml-5 h-5 w-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search for events, venues, or services..."
                  className="flex-1 bg-transparent border-none h-14 px-4 text-white focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="bg-red-600 hover:bg-red-700 transition-colors h-14 px-6 text-white font-medium">
                  Search
                </button>
              </div>
            </motion.div>
            
            {/* Country Selector */}
            <motion.div 
              className="flex justify-center gap-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <button
                onClick={() => setSelectedLocation('all')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all duration-300 ${
                  selectedLocation === 'all' 
                    ? 'bg-red-600 text-white font-medium' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <Globe className="w-4 h-4" />
                All Locations
              </button>
              <button
                onClick={() => setSelectedLocation('nigeria')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all duration-300 ${
                  selectedLocation === 'nigeria' 
                    ? 'bg-red-600 text-white font-medium' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <span className="text-base">🇳🇬</span> Nigeria
              </button>
              <button
                onClick={() => setSelectedLocation('uk')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all duration-300 ${
                  selectedLocation === 'uk' 
                    ? 'bg-red-600 text-white font-medium' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <span className="text-base">🇬🇧</span> United Kingdom
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-lg shadow-purple-700/20' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-black/40 backdrop-blur-lg border-b border-white/10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Event Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {eventCategories.map(category => (
                      <motion.button
                        key={category.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                        onClick={() => setEventType(category.id)}
                        className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 ${
                          eventType === category.id 
                            ? 'bg-red-600 text-white' 
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {category.icon}
                        <span>{category.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Rating
                  </label>
                  <div className="px-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/60">Minimum Rating</span>
                      <span className="text-sm font-medium text-white">{ratingFilter.toFixed(1)}+</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.1"
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-white/40">0</span>
                      <span className="text-xs text-white/40">5.0</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all duration-300"
                  >
                    <option value="popularity" className="bg-gray-800 text-white">Popularity</option>
                    <option value="rating" className="bg-gray-800 text-white">Rating (High to Low)</option>
                    <option value="capacity" className="bg-gray-800 text-white">Capacity (High to Low)</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setRatingFilter(0);
                    setEventType('all');
                    setSortOption('popularity');
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm transition-all duration-300 mr-3"
                >
                  Reset Filters
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-300"
                >
                  Apply Filters
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-12"
            >
              {/* ConviviaPass Membership Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-red-900/40 to-purple-900/40 backdrop-blur-xl border border-white/10"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full filter blur-3xl opacity-20 -z-10"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20 -z-10"></div>
                
                <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                      <Sparkles className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium text-white">Introducing</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-bold">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-400">
                        ConviviaPass
                      </span>
                    </h2>
                    
                    <p className="text-xl text-white/80">
                      Your exclusive membership for premium experiences at partner venues across Nigeria and the UK.
                    </p>
                    
                    <ul className="space-y-3">
                      {[
                        {icon: <Percent className="h-5 w-5 text-red-400" />, text: "Exclusive discounts of up to 30% at partner venues"},
                        {icon: <Crown className="h-5 w-5 text-red-400" />, text: "VIP access and special treatment at events"},
                        {icon: <Calendar className="h-5 w-5 text-red-400" />, text: "Priority bookings and reservations"},
                        {icon: <Globe className="h-5 w-5 text-red-400" />, text: "International access in Nigeria and the UK"},
                        {icon: <Gift className="h-5 w-5 text-red-400" />, text: "Complimentary upgrades and exclusive gifts"}
                      ].map((item, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                          className="flex items-start gap-3"
                        >
                          <div className="mt-0.5 p-1.5 rounded-full bg-white/10">{item.icon}</div>
                          <span className="text-white/80">{item.text}</span>
                        </motion.li>
                      ))}
                    </ul>
                    
                    <div className="flex flex-wrap gap-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-700/30 transition-all duration-300"
                      >
                        Join ConviviaPass
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-300"
                      >
                        Learn More
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="relative flex items-center">
                    <motion.div
                      initial={{ opacity: 0, rotateY: 30 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      transition={{ duration: 0.8 }}
                      className="relative mx-auto w-full max-w-md perspective"
                    >
                      {/* Membership Card */}
                      <div className="relative rounded-2xl overflow-hidden aspect-[1.58/1] shadow-2xl shadow-purple-900/30">
                        {/* Card Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-purple-800">
                          {/* Background Pattern */}
                          <div className="absolute inset-0 opacity-30">
                            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0)_60%)]"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/10 filter blur-3xl"></div>
                          </div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="relative p-6 h-full flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold text-white">ConviviaPass</h3>
                              <p className="text-white/70 text-sm">Exclusive Member</p>
                            </div>
                            <div className="rounded-full bg-white/20 backdrop-blur-xl p-2">
                              <Sparkles className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          
                          <div className="pt-4">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="h-8 w-14 rounded-md bg-white/20 backdrop-blur-xl"></div>
                              <div className="h-8 w-14 rounded-md bg-white/20 backdrop-blur-xl"></div>
                              <div className="h-8 w-14 rounded-md bg-white/20 backdrop-blur-xl"></div>
                              <div className="h-8 w-14 rounded-md bg-white/20 backdrop-blur-xl"></div>
                            </div>
                            
                            <div className="flex justify-between">
                              <div>
                                <p className="text-white/60 text-xs mb-1">MEMBER NAME</p>
                                <p className="text-white font-medium">YOUR NAME</p>
                              </div>
                              <div>
                                <p className="text-white/60 text-xs mb-1">VALID THROUGH</p>
                                <p className="text-white font-medium">12/26</p>
                              </div>
                              <div className="flex items-center">
                                <div className="flex">
                                  <div className="h-8 w-8 rounded-full bg-red-500/80 -mr-2"></div>
                                  <div className="h-8 w-8 rounded-full bg-purple-500/80"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Card Reflection */}
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent opacity-10 transform -scale-y-100 translate-y-full blur-sm"></div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
              
              {/* Planning Resources */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-black/30 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 group hover:border-red-500/30 transition-all duration-300"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80" 
                      alt="Event Planning"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1">Event Planning Guide</h3>
                      <p className="text-white/70 text-sm">Step-by-step instructions to plan your perfect event</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-white/80 text-sm mb-4">
                      Our comprehensive guide covers everything from budgeting to vendor selection, 
                      ensuring your event is memorable and stress-free.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-2.5 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                    >
                      Download Guide
                      <Download className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="bg-black/30 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 group hover:border-red-500/30 transition-all duration-300"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1556125574-d7f27ec36a06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" 
                      alt="Event Consultation"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1">Event Consultation</h3>
                      <p className="text-white/70 text-sm">Speak with our experienced event planners</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-white/80 text-sm mb-4">
                      Get personalized advice from our expert team who can help you choose the perfect venue, 
                      theme, and vendors for your specific event needs.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-2.5 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                    >
                      Schedule Consultation
                      <CalendarClock className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="bg-black/30 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 group hover:border-red-500/30 transition-all duration-300"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80" 
                      alt="Vendor Directory"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1">Vendor Directory</h3>
                      <p className="text-white/70 text-sm">Find the best vendors for your event</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-white/80 text-sm mb-4">
                      Browse our curated list of trusted vendors including caterers, decorators, 
                      photographers, and entertainment options for your event.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-2.5 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                    >
                      Explore Vendors
                      <ListChecks className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              </div>
              
              {/* Partner Venues */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-3">ConviviaPass Partner Venues</h2>
                  <p className="text-white/70 max-w-xl mx-auto">
                    Our exclusive partner venues offer special benefits for ConviviaPass members.
                    From luxury hotels to unique event spaces across Nigeria and the UK.
                  </p>
                </div>
                
                <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide">
                  {[
                    {
                      name: "The Grand Ballroom",
                      location: "Lagos, Nigeria",
                      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80",
                      discount: "25% off bookings"
                    },
                    {
                      name: "Riverside Manor",
                      location: "London, UK",
                      image: "https://images.unsplash.com/photo-1515095184895-0ed83d7da235?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
                      discount: "20% off bookings"
                    },
                    {
                      name: "Skyline Terrace",
                      location: "Abuja, Nigeria",
                      image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80",
                      discount: "Free welcome drinks"
                    },
                    {
                      name: "The Royal Garden",
                      location: "Manchester, UK",
                      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
                      discount: "15% off bookings"
                    },
                    {
                      name: "Ocean View Resort",
                      location: "Lagos, Nigeria",
                      image: "https://images.unsplash.com/photo-1439130490301-25e322d88054?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80",
                      discount: "Complimentary upgrade"
                    }
                  ].map((venue, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className="flex-shrink-0 w-72 bg-gradient-to-br from-red-900/20 to-purple-900/20 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 group"
                    >
                      <div className="h-40 relative overflow-hidden">
                        <img 
                          src={venue.image}
                          alt={venue.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                          {venue.location.includes('Nigeria') ? '🇳🇬' : '🇬🇧'} {venue.location}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                          {venue.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mb-3 text-white/70 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-red-400" />
                          <span>{venue.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-4 py-1.5 px-3 bg-gradient-to-r from-red-500/10 to-purple-600/10 rounded-full">
                          <Sparkles className="h-3.5 w-3.5 text-red-400" />
                          <span className="text-xs text-white/90">{venue.discount}</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all duration-300"
                        >
                          View Details
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {activeTab === 'beverages' && (
            <motion.div 
              key="beverages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8 border border-gray-700"
            >
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold mb-4">Premium Beverage Suppliers</h2>
                  <p className="text-gray-300 max-w-2xl mx-auto">
                    Celebrate with the perfect drinks - from premium wines to craft cocktails, we connect you with trusted beverage providers
                  </p>
                </div>
                
                {/* Beverage Categories */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                    <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-2">
                      <Wine className="h-6 w-6 text-red-700" />
                    </div>
                    <span className="font-medium text-gray-800">Wine</span>
                  </button>
                  
                  <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                    <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-2">
                      <Wine className="h-6 w-6 text-red-700" />
                    </div>
                    <span className="font-medium text-gray-800">Spirits</span>
                  </button>
                  
                  <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                    <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-2">
                      <Wine className="h-6 w-6 text-red-700" />
                    </div>
                    <span className="font-medium text-gray-800">Cocktails</span>
                  </button>
                  
                  <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                    <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-2">
                      <Wine className="h-6 w-6 text-red-700" />
                    </div>
                    <span className="font-medium text-gray-800">Non-Alcoholic</span>
                  </button>
                </div>
                
                {/* Featured Suppliers */}
                <h3 className="text-2xl font-bold mb-6">Featured Suppliers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                        alt="Premium Wines"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-lg text-gray-800">Premium Wine Collection</h4>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-700">4.9</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        Curated selection of fine wines for special occasions
                      </p>
                      <div className="flex items-center text-red-600 text-sm mb-4">
                        <span className="font-medium">Starting from ₦15,000</span>
                      </div>
                      <button className="w-full py-2 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg hover:opacity-90 transition-colors">
                        View Collection
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                        alt="Craft Cocktails"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-lg text-gray-800">Craft Cocktail Bar</h4>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-700">4.8</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        Mobile cocktail bar service with professional mixologists
                      </p>
                      <div className="flex items-center text-red-600 text-sm mb-4">
                        <span className="font-medium">Starting from ₦120,000</span>
                      </div>
                      <button className="w-full py-2 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg hover:opacity-90 transition-colors">
                        Book Service
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                        alt="Premium Non-Alcoholic"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-lg text-gray-800">Premium Non-Alcoholic</h4>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-700">4.7</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        Sophisticated alcohol-free options for all guests
                      </p>
                      <div className="flex items-center text-red-600 text-sm mb-4">
                        <span className="font-medium">Starting from ₦8,000</span>
                      </div>
                      <button className="w-full py-2 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg hover:opacity-90 transition-colors">
                        View Collection
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Beverage Packages */}
                <h3 className="text-2xl font-bold mb-6">Popular Packages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h4 className="font-bold text-xl mb-4 text-gray-800">Premium Wedding Package</h4>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Selection of red and white wines</span>
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Champagne for toasts</span>
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Premium spirits selection</span>
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Non-alcoholic options</span>
                      </li>
                    </ul>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-800">₦250,000</span>
                      <button className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg hover:opacity-90 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h4 className="font-bold text-xl mb-4 text-gray-800">Corporate Event Package</h4>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Selection of premium beers</span>
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Wine selection</span>
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Signature cocktails</span>
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Premium soft drinks</span>
                      </li>
                    </ul>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-800">₦180,000</span>
                      <button className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg hover:opacity-90 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <button className="px-8 py-4 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-full font-medium hover:opacity-90 transition-colors shadow-md">
                    Request Custom Beverage Package
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'upcoming' && (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Section Title & Introduction */}
              <div className="text-center max-w-3xl mx-auto mb-8">
                <motion.h2 
                  className="text-3xl font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Upcoming Events & Celebrations
                </motion.h2>
                <motion.p 
                  className="text-white/70"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Don't miss out on these exciting events happening near you. 
                  ConviviaPass members enjoy exclusive benefits and early access.
                </motion.p>
              </div>
              
              {/* Featured Event Banner */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-xl mb-10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-800/80 to-red-800/80 z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80" 
                  alt="Featured Event" 
                  className="w-full h-96 object-cover object-center"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Featured Event</span>
                    </div>
                    <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      {selectedLocation === 'nigeria' ? '🇳🇬 Lagos' : selectedLocation === 'uk' ? '🇬🇧 London' : 'International'}
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">The Grand Convivia Gala 2024</h3>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-white/90">
                      <Calendar className="h-4 w-4 text-red-400" />
                      <span>May 15, 2024</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/90">
                      <Clock className="h-4 w-4 text-red-400" />
                      <span>7:00 PM</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/90">
                      <MapPin className="h-4 w-4 text-red-400" />
                      <span>The Grand Ballroom</span>
                    </div>
                  </div>
                  <p className="text-white/80 max-w-3xl mb-6">
                    Join us for an unforgettable evening of networking, entertainment, and celebration. 
                    ConviviaPass members receive 25% off tickets and VIP access.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-lg font-medium flex items-center gap-2"
                    >
                      Get Tickets Now
                      <Ticket className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg font-medium flex items-center gap-2"
                    >
                      Add to Calendar
                      <CalendarPlus className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
              
              {/* Events Grid */}
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="group relative overflow-hidden rounded-xl bg-black/30 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                    >
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="flex flex-col md:flex-row h-full">
                        {/* Event Image */}
                        <div className="relative w-full md:w-2/5 overflow-hidden">
                          <img 
                            src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"}
                            alt={event.name}
                            className="w-full h-48 md:h-full object-cover"
                          />
                          <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center">
                            <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                              {event.location.includes('Nigeria') ? '🇳🇬' : '🇬🇧'} {event.location}
                            </div>
                            {/* ConviviaPass Indicator */}
                            {index % 3 === 0 && (
                              <div className="bg-gradient-to-r from-red-600 to-purple-600 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3 text-white" />
                                <span className="text-white text-xs font-medium">Members Save 20%</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Event Content */}
                        <div className="p-5 flex flex-col justify-between w-full md:w-3/5">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                                {event.name}
                              </h3>
                              <div className="bg-white/10 px-2 py-1 rounded-full text-xs text-white">
                                {event.category}
                              </div>
                            </div>
                            
                            {/* Date & Time */}
                            <div className="flex flex-wrap gap-4 mb-3 text-white/70 text-sm">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-purple-400" />
                                <span>{event.date}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-purple-400" />
                                <span>{event.time}</span>
                              </div>
                            </div>
                            
                            {/* Venue */}
                            <div className="flex items-center gap-1.5 mb-3 text-white/70 text-sm">
                              <MapPin className="h-4 w-4 text-purple-400" />
                              <span>{event.venue}</span>
                            </div>
                            
                            {/* Organizer */}
                            <div className="flex items-center gap-1.5 mb-4 text-white/70 text-sm">
                              <User className="h-4 w-4 text-purple-400" />
                              <span>Organized by {event.organizer}</span>
                            </div>
                            
                            {/* ConviviaPass Member Benefits - Show only on some events */}
                            {index % 3 === 0 && (
                              <div className="mb-4 p-2 bg-gradient-to-r from-red-500/10 to-purple-600/10 rounded-lg border border-purple-500/20">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                                  <span className="text-xs font-medium text-white">ConviviaPass Benefits</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-white/70 text-xs">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>20% off tickets & VIP entry</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex justify-between items-center">
                            <button className="text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors">
                              Event details
                            </button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300"
                            >
                              RSVP Now
                              <Ticket className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-16 px-4 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10"
                >
                  <div className="max-w-md mx-auto">
                    <Calendar className="w-12 h-12 text-purple-500/50 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
                    <p className="text-white/60 mb-6">There are no upcoming events matching your filters. Try adjusting your search or check back soon.</p>
                    <button
                      onClick={() => {
                        setSelectedLocation('all');
                        setSearchQuery('');
                      }}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm font-medium transition-colors duration-300"
                    >
                      View All Events
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
          
          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              {/* Section Title & Introduction */}
              <div className="text-center max-w-3xl mx-auto mb-8">
                <motion.h2 
                  className="text-3xl font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Community Reviews & Testimonials
                </motion.h2>
                <motion.p 
                  className="text-white/70"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  See what others are saying about their experiences with our partner venues and events.
                  ConviviaPass members share their exclusive stories.
                </motion.p>
              </div>
              
              {/* Featured Review */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative bg-black/30 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10"
              >
                {/* Decorative elements */}
                <div className="absolute top-8 left-8 text-8xl text-red-500/20 font-serif">"</div>
                <div className="absolute bottom-8 right-8 text-8xl text-red-500/20 font-serif">"</div>
                
                <div className="relative z-10 p-8 md:p-12">
                  <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                    <div className="md:w-1/3 flex flex-col items-center text-center">
                      <div className="w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-white/10">
                        <img 
                          src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=922&q=80" 
                          alt="Featured Reviewer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">Sarah Johnson</h3>
                      <p className="text-red-400 text-sm mb-2">ConviviaPass Member</p>
                      <div className="flex items-center gap-1">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-red-500" fill="#ef4444" />
                        ))}
                      </div>
                      <div className="mt-4 py-1 px-3 bg-gradient-to-r from-red-500/20 to-purple-600/20 rounded-full inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-red-400" />
                        <span className="text-xs text-white/90">Lagos, Nigeria</span>
                      </div>
                    </div>
                    
                    <div className="md:w-2/3">
                      <blockquote className="text-lg text-white/80 italic mb-6">
                        "My ConviviaPass membership has completely transformed how I experience events in Lagos. 
                        The Grand Ballroom treated us like royalty when they saw our membership. We received complimentary 
                        champagne, the best table in the house, and the staff went above and beyond to make our night special. 
                        The 25% discount was just the cherry on top. If you attend events regularly, this membership pays for itself within months!"
                      </blockquote>
                      <div>
                        <p className="text-white font-medium mb-1">The Grand Ballroom Gala Night</p>
                        <p className="text-white/60 text-sm">Attended: March 2024</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Reviews Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    name: "James Wilson",
                    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
                    location: "London, UK",
                    rating: 5,
                    review: "The Riverside Manor exceeded all expectations. As a ConviviaPass member, I was given early access to book the venue for my corporate event, which would have been sold out otherwise. The staff was incredibly accommodating and professional.",
                    event: "Corporate Retreat",
                    date: "February 2024",
                    isMember: true
                  },
                  {
                    name: "Oluwaseun Adebayo",
                    avatar: "https://images.unsplash.com/photo-1539701938214-0d9736e1c16b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1024&q=80",
                    location: "Lagos, Nigeria",
                    rating: 4,
                    review: "My wedding reception at Skyline Terrace was magical. The views were breathtaking, and the service was top-notch. They made planning from abroad so easy, and everything went smoothly on the day.",
                    event: "Wedding Reception",
                    date: "January 2024",
                    isMember: false
                  },
                  {
                    name: "Emma Thompson",
                    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=688&q=80",
                    location: "Manchester, UK",
                    rating: 5,
                    review: "The Royal Garden was the perfect setting for my daughter's 16th birthday party. With my ConviviaPass membership, we got a free photo booth for the kids, which was a huge hit! The garden area was beautifully lit in the evening.",
                    event: "Birthday Celebration",
                    date: "April 2024",
                    isMember: true
                  },
                  {
                    name: "Chinedu Okonkwo",
                    avatar: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
                    location: "Abuja, Nigeria",
                    rating: 5,
                    review: "Ocean View Resort is now my go-to venue for business events. The conference facilities are state-of-the-art, and the catering is consistently excellent. Their attention to detail makes all the difference.",
                    event: "Business Conference",
                    date: "March 2024",
                    isMember: false
                  }
                ].map((review, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-6 relative overflow-hidden group"
                  >
                    {/* Spotlight hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10">
                          <img 
                            src={review.avatar} 
                            alt={review.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white">{review.name}</h3>
                            {review.isMember && (
                              <div className="bg-gradient-to-r from-red-600 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                <span>Member</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-white/70 text-sm">
                            <MapPin className="h-3.5 w-3.5 text-red-400" />
                            <span>{review.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 mb-3">
                        {Array(5).fill(0).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'text-red-500' : 'text-white/20'}`} 
                            fill={i < review.rating ? "#ef4444" : "none"}
                          />
                        ))}
                      </div>
                      
                      <blockquote className="text-white/80 mb-4">
                        "{review.review}"
                      </blockquote>
                      
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-white text-sm font-medium">{review.event}</p>
                        <p className="text-white/60 text-xs">Attended: {review.date}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Write Review CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-red-900/30 to-purple-900/30 rounded-xl p-8 text-center border border-white/10"
              >
                <h3 className="text-2xl font-bold text-white mb-3">Share Your Experience</h3>
                <p className="text-white/70 max-w-2xl mx-auto mb-6">
                  Had a great experience at one of our partner venues or events? Share your thoughts and help others 
                  discover amazing experiences in Nigeria and the UK.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-700/30 transition-all duration-300"
                >
                  Write a Review
                </motion.button>
              </motion.div>
              
              {/* Testimonials from Venues */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-8"
              >
                <h3 className="text-2xl font-bold text-white mb-6 text-center">From Our Partner Venues</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      name: "The Grand Ballroom",
                      logo: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?ixlib=rb-4.0.3&auto=format&fit=crop&w=1173&q=80",
                      quote: "Partnering with Convivia has increased our bookings by 35%. ConviviaPass members bring quality guests and events to our venue.",
                      person: "David Chen",
                      title: "Event Director"
                    },
                    {
                      name: "Riverside Manor",
                      logo: "https://images.unsplash.com/photo-1503602642458-232111445657?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
                      quote: "The ConviviaPass program has been transformative for our business. We love hosting members who appreciate our premium services.",
                      person: "Amanda Williams",
                      title: "General Manager"
                    },
                    {
                      name: "Ocean View Resort",
                      logo: "https://images.unsplash.com/photo-1577401239170-897942555fb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
                      quote: "Being a Convivia partner venue has enhanced our reputation as a premier event destination in Lagos. The promotion is excellent.",
                      person: "Tunde Bakare",
                      title: "Marketing Director"
                    }
                  ].map((testimonial, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.15 * index }}
                      className="bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/10 transition-colors duration-300"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-purple-600 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold">{testimonial.name}</h4>
                          <p className="text-white/60 text-sm">Partner Venue</p>
                        </div>
                      </div>
                      <blockquote className="text-white/80 mb-4 italic">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                          <User2 className="h-full w-full p-2 text-white/70" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{testimonial.person}</p>
                          <p className="text-white/60 text-xs">{testimonial.title}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {activeTab === 'vendors' && (
            <motion.div 
              key="vendors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              <div className="text-center max-w-3xl mx-auto mb-8">
                <motion.h2 
                  className="text-3xl font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Premium Event Vendors
                </motion.h2>
                <motion.p 
                  className="text-white/70"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Connect with trusted vendors across Nigeria and the UK for all your event needs.
                  ConviviaPass members enjoy special rates and priority bookings.
                </motion.p>
              </div>
              
              {/* Vendor Categories */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: <Utensils className="h-6 w-6" />, name: "Catering" },
                  { icon: <Wine className="h-6 w-6" />, name: "Beverages" },
                  { icon: <Music className="h-6 w-6" />, name: "Entertainment" },
                  { icon: <Palette className="h-6 w-6" />, name: "Decoration" }
                ].map((category, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-red-900/30 to-purple-900/30 backdrop-blur-sm p-6 rounded-xl text-center border border-white/10 hover:border-red-500/50 transition-all duration-300"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                      {category.icon}
                    </div>
                    <h3 className="font-bold text-lg text-white mb-2">{category.name}</h3>
                  </motion.button>
                ))}
              </div>
              
              {/* Featured Vendors */}
              <div className="space-y-3 mb-8">
                <h3 className="text-2xl font-bold mb-6">Featured Vendors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Royal Catering",
                      category: "Catering",
                      location: "Lagos, Nigeria",
                      image: "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
                      rating: 4.9,
                      description: "Premium catering service for all events with customized menus and exceptional presentation."
                    },
                    {
                      name: "Elite Entertainment",
                      category: "Entertainment",
                      location: "London, UK",
                      image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
                      rating: 4.8,
                      description: "Professional DJs, live bands, and performers to create the perfect atmosphere for any event."
                    },
                    {
                      name: "Creative Decor",
                      category: "Decoration",
                      location: "Abuja, Nigeria",
                      image: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?ixlib=rb-4.0.3&auto=format&fit=crop&w=1032&q=80",
                      rating: 4.7,
                      description: "Stunning event styling and decoration services that transform spaces into magical settings."
                    }
                  ].map((vendor, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="bg-black/30 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 group hover:border-red-500/30 transition-all duration-300"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={vendor.image}
                          alt={vendor.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                          {vendor.location.includes('Nigeria') ? '🇳🇬' : '🇬🇧'} {vendor.location}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 text-yellow-400" fill="#facc15" />
                          <span className="text-white text-xs font-medium">{vendor.rating}</span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors duration-300">
                            {vendor.name}
                          </h3>
                          <div className="bg-gradient-to-r from-red-600/20 to-purple-600/20 px-2 py-0.5 rounded-full text-xs text-white/90">
                            {vendor.category}
                          </div>
                        </div>
                        <p className="text-white/70 text-sm mb-4">{vendor.description}</p>
                        <div className="flex items-center justify-between">
                          {index % 2 === 0 && (
                            <div className="flex items-center gap-1.5 py-1 px-3 bg-gradient-to-r from-red-500/10 to-purple-600/10 rounded-full">
                              <Sparkles className="h-3.5 w-3.5 text-red-400" />
                              <span className="text-xs text-white/90">ConviviaPass: 15% Off</span>
                            </div>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="ml-auto px-4 py-2 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300"
                          >
                            View Details
                            <ArrowRight className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Beverage Suppliers */}
              <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-3">Premium Beverage Suppliers</h2>
                  <p className="text-white/70 max-w-xl mx-auto">
                    Celebrate with the perfect drinks - from premium wines to craft cocktails. 
                    ConviviaPass members enjoy exclusive tastings and special offers.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Premium Wine Collection",
                      image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
                      price: "₦15,000+",
                      description: "Curated selection of fine wines for special occasions"
                    },
                    {
                      name: "Craft Cocktail Bar",
                      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
                      price: "₦120,000+",
                      description: "Mobile cocktail bar service with professional mixologists"
                    },
                    {
                      name: "Premium Non-Alcoholic",
                      image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
                      price: "₦8,000+",
                      description: "Sophisticated alcohol-free options for all guests"
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className="bg-gradient-to-br from-red-900/20 to-purple-900/20 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 group"
                    >
                      <div className="h-48 relative overflow-hidden">
                        <img 
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-white/70 text-sm mb-3">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="text-red-400 text-sm font-medium">Starting from {item.price}</div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all duration-300"
                          >
                            View Details
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Call to Action for Vendors */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-red-900/40 to-purple-900/40 rounded-xl p-8 text-center border border-white/10"
              >
                <h3 className="text-2xl font-bold text-white mb-3">Are You a Service Provider?</h3>
                <p className="text-white/70 max-w-2xl mx-auto mb-6">
                  Join our network of trusted vendors and reach more clients across Nigeria and the UK.
                  Become a ConviviaPass partner for exclusive benefits.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-700/30 transition-all duration-300"
                >
                  Become a Partner
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Call to Action */}
      <section className="mt-16 bg-gradient-to-r from-red-900 to-red-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Bring People Together?</h2>
            <p className="text-xl mb-8">
              Create unforgettable celebration experiences that connect people through shared moments
            </p>
            <button 
              onClick={() => setShowPlanningForm(true)}
              className="bg-white text-red-800 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors"
            >
              Start Planning Now
            </button>
          </div>
        </div>
      </section>
      
      {/* Planning Form Modal */}
      <AnimatePresence>
        {showPlanningForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Plan Your Event</h3>
                  <button 
                    onClick={() => setShowPlanningForm(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Event Type
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-800 bg-white">
                      <option>Wedding</option>
                      <option>Birthday</option>
                      <option>Corporate Event</option>
                      <option>Cultural Celebration</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Date
                      </label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-800 bg-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Expected Guests
                      </label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-800 bg-white"
                        placeholder="Number of guests"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Location
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-800 bg-white">
                      <option>Lagos, Nigeria</option>
                      <option>Abuja, Nigeria</option>
                      <option>London, UK</option>
                      <option>Manchester, UK</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Services Needed
                    </label>
                    <div className="space-y-2 text-white">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded text-red-600" />
                        <span className="ml-2">Venue</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded text-red-600" />
                        <span className="ml-2">Catering</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded text-red-600" />
                        <span className="ml-2">Drinks & Beverages</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded text-red-600" />
                        <span className="ml-2">Decoration</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded text-red-600" />
                        <span className="ml-2">Entertainment</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Additional Notes
                    </label>
                    <textarea 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-800 bg-white"
                      rows="3"
                      placeholder="Any specific requirements or preferences..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setShowPlanningForm(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-white bg-gray-700 hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg hover:opacity-90"
                    >
                      Get AI Recommendations
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add custom styles for hiding scrollbars */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Events; 