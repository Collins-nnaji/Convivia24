import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useScroll, useTransform } from 'framer-motion';
import { Calendar, MapPin, Users, Star, Filter, ChevronDown, Search, ArrowRight, Clock, CheckCircle, ClipboardList, Music, Cake, Heart, Award, Wine, Utensils, Palette, X, TrendingUp, ThumbsUp, Globe, Sparkles, Ticket, CalendarPlus, User, Percent, Crown, Download, ListChecks, Building2, User2, Gift, Store, CalendarClock, Webhook, Camera, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Event card component with enhanced animations
const EventCard = ({ event, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -10,
        transition: { duration: 0.3 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 shadow-xl hover:border-red-500/30 transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <motion.img 
          src={event.image} 
          alt={event.name}
          className="w-full h-full object-cover"
          animate={{ 
            scale: isHovered ? 1.05 : 1
          }}
          transition={{ duration: 0.4 }}
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"
          animate={{
            opacity: isHovered ? 0.8 : 0.6
          }}
          transition={{ duration: 0.3 }}
        />
        <motion.div 
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className="absolute top-3 left-3 bg-red-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white"
        >
          {event.category}
        </motion.div>
      </div>
      
      <div className="p-5">
        <motion.h3 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.1 }}
          className="text-xl font-bold text-white mb-2"
        >
          {event.name}
        </motion.h3>
        
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
          className="flex items-center gap-2 text-white/70 text-sm mb-2"
        >
          <Calendar className="h-4 w-4 text-red-400" />
          <span>{event.date} • {event.time}</span>
        </motion.div>
        
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className="flex items-center gap-2 text-white/70 text-sm mb-2"
        >
          <MapPin className="h-4 w-4 text-red-400" />
          <span>{event.location} • {event.venue}</span>
        </motion.div>
        
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.4 }}
          className="flex items-center gap-2 text-white/70 text-sm mb-4"
        >
          <User2 className="h-4 w-4 text-red-400" />
          <span>By {event.organizer}</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 + 0.5 }}
          className="flex justify-between items-center pt-3 border-t border-white/10"
        >
          <motion.button
            whileHover={{ scale: 1.05, color: "#F43F5E" }}
            whileTap={{ scale: 0.95 }}
            className="text-white/70 hover:text-white flex items-center gap-1.5 text-sm"
          >
            <Heart className="h-4 w-4" />
            <span>Save</span>
          </motion.button>
          
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: "#CC0000" 
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/event/${event.id}`)}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-full flex items-center gap-1.5"
          >
            <span>Get Tickets</span>
            <motion.div
              animate={{ x: isHovered ? 3 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// VenueCard component for displaying venues
const VenueCard = ({ venue, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-gradient-to-br from-black/40 to-gray-900/20 border border-white/10 hover:border-blue-500/30 rounded-xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 group"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={venue.image} 
          alt={venue.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <div className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {venue.type}
          </div>
          <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
            {venue.price ? venue.price : 'Contact for pricing'}
          </div>
        </div>
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full flex items-center gap-0.5 px-1.5 py-0.5">
          <Star className="h-3 w-3 text-yellow-500 fill-current" />
          <span className="text-white text-xs font-medium">{venue.rating}</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-1 truncate">{venue.name}</h3>
        <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-2">
          <MapPin className="h-3.5 w-3.5 text-blue-400" />
          <span className="truncate">{venue.location}</span>
        </div>
        <p className="text-white/70 text-sm mb-4 line-clamp-2">{venue.description || `${venue.name} is a ${venue.type} venue located in ${venue.location} with a rating of ${venue.rating}.`}</p>
        
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex gap-2">
            {venue.features && venue.features.slice(0, 3).map((feature, idx) => (
              <span key={idx} className="text-xs text-white/70 bg-white/5 px-2 py-1 rounded">
                {feature}
              </span>
            ))}
            {(!venue.features || venue.features.length === 0) && (
              <span className="text-xs text-white/70 bg-white/5 px-2 py-1 rounded">
                {venue.capacity || 'Flexible Capacity'}
              </span>
            )}
          </div>
          <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors">
            View <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

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
    const newVisibleItems = visibleItems + 3;
    setVisibleItems(newVisibleItems);
  };

  // Tabs configuration
  const tabs = [
    { id: 'plan', label: 'Plan Your Celebrations', icon: <Calendar className="h-4 w-4" /> },
    { id: 'vendors', label: 'Vendors', icon: <Store className="h-4 w-4" /> },
  ];
  
  // Venue categories with icons (replacement for removed eventCategories)
  const venueCategories = [
    { id: 'all', name: 'All Venues', icon: <Building2 size={20} /> },
    { id: 'wedding', name: 'Wedding Venues', icon: <Heart size={20} /> },
    { id: 'corporate', name: 'Corporate Venues', icon: <ClipboardList size={20} /> },
    { id: 'birthday', name: 'Birthday Venues', icon: <Cake size={20} /> },
    { id: 'cultural', name: 'Cultural Venues', icon: <Award size={20} /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white"
    >
      {/* Header with dual-purpose headline */}
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
        
        <div className="relative z-10 pt-12 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6"
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-white via-red-500 to-white"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              Create Extraordinary Moments
            </motion.h1>
            <motion.p 
              className="text-lg text-white/80 text-center max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Two powerful ways to bring people together through shared celebrations
            </motion.p>
          </motion.div>
          
          {/* Country Selector - Kept at the top for both sections */}
          <motion.div 
            className="flex justify-center gap-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
        </div>
      </div>
      
      {/* Split Screen Layout - Two Distinct Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Introduction Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-3 bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-4"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-center">Explore Our Event Services</h2>
            <p className="text-white/70 text-center mb-0">From initial concept to final execution, we provide tools to make your celebrations truly extraordinary</p>
          </motion.div>
          
          {/* Feature Cards - 3 column layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-blue-700/10 to-blue-900/10 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-600/20 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-bold text-lg">Event Planning</h3>
            </div>
            <p className="text-white/70 text-sm mb-0">Our AI-powered planning tools create personalized event timelines and recommendations based on your preferences.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-red-700/10 to-red-900/10 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-red-500/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-600/20 p-2 rounded-lg">
                <Store className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="font-bold text-lg">Vendor Matching</h3>
            </div>
            <p className="text-white/70 text-sm mb-0">Connect with top-rated vendors across categories like catering, decor, photography, and entertainment.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-purple-700/10 to-purple-900/10 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-600/20 p-2 rounded-lg">
                <Webhook className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="font-bold text-lg">AI Assistance</h3>
            </div>
            <p className="text-white/70 text-sm mb-0">Leverage our AI to analyze thousands of options and provide suggestions tailored to your specific requirements.</p>
          </motion.div>
        </div>
      </div>
      
      {/* Subtle Divider */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="border-t border-white/10 mb-12"></div>
      </div>
      
      {/* Category Filters Section */}
      <div id="feature-sections" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        {/* Tab Navigation - Keep this for detailed view switching */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-900/30 border border-red-400/30' 
                  : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {activeTab === tab.id && <CheckCircle className="h-4 w-4 ml-1.5 text-white" />}
            </motion.button>
          ))}
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              showFilters 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-900/30 border border-purple-400/30' 
                : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </motion.button>
        </div>
        
        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-xl mb-6 shadow-lg"
            >
              <div className="py-6 px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Venue Type
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {venueCategories.map(category => (
                        <motion.button
                          key={category.id}
                          onClick={() => setEventType(category.id)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                            eventType === category.id 
                              ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-900/30' 
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          {category.icon}
                          <span>{category.name}</span>
                          {eventType === category.id && <CheckCircle className="h-4 w-4 ml-auto text-white" />}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Rating
                    </label>
                    <div className="px-2 bg-white/5 p-4 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/60">Minimum Rating</span>
                        <span className="text-sm font-medium text-white bg-red-600/20 px-2 py-1 rounded-full">{ratingFilter.toFixed(1)}+</span>
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
                    <div className="relative">
                      <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="w-full appearance-none px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                      >
                        <option value="popularity" className="bg-gray-800 text-white">Popularity</option>
                        <option value="rating" className="bg-gray-800 text-white">Rating (High to Low)</option>
                        <option value="capacity" className="bg-gray-800 text-white">Capacity (High to Low)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-white/50 pointer-events-none" />
                    </div>
                    <div className="mt-3 bg-white/5 p-3 rounded-lg border border-white/10">
                      <p className="text-xs text-white/60">
                        Current sort: <span className="text-white font-medium">
                          {sortOption === 'popularity' ? 'Most Popular First' : 
                           sortOption === 'rating' ? 'Highest Rated First' : 
                           'Largest Capacity First'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 border-t border-white/10 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setRatingFilter(0);
                      setEventType('all');
                      setSortOption('popularity');
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm transition-all duration-300 mr-3 border border-white/10"
                  >
                    Reset Filters
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowFilters(false)}
                    className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-md shadow-red-900/30"
                  >
                    Apply Filters
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Detailed Content Based on Selected Tab */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {activeTab === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* AI-Powered Event Planner Section */}
              <div className="mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-black/60 to-red-900/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-12"
                >
                  <div className="flex items-start gap-6 flex-col md:flex-row">
                    <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-4 rounded-xl">
                      <Webhook className="h-14 w-14 text-blue-500" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">AI-Powered Event Recommendation</h3>
                      <p className="text-white/80 mb-6">Our AI analyzes thousands of venues, vendor reviews, and successful events to provide personalized recommendations tailored to your specific needs and preferences.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-5 w-5 text-yellow-400" />
                            <span className="font-medium">Review Analysis</span>
                          </div>
                          <p className="text-white/70 text-sm">Processes authentic reviews to identify the best-rated venues and vendors</p>
                        </div>
                        
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-5 w-5 text-green-400" />
                            <span className="font-medium">Guest Satisfaction</span>
                          </div>
                          <p className="text-white/70 text-sm">Learns from past events to maximize guest experiences and satisfaction</p>
                        </div>
                        
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Percent className="h-5 w-5 text-red-400" />
                            <span className="font-medium">Budget Optimization</span>
                          </div>
                          <p className="text-white/70 text-sm">Helps maximize value within your budget by suggesting optimal combinations</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setShowPlanningForm(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl flex items-center gap-2 transition-all"
                      >
                        Get AI Recommendations
                        <Sparkles className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'vendors' && (
            <motion.div
              key="vendors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Vendors Section */}
              <div className="mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-black/60 to-red-900/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-12"
                >
                  <div className="flex items-start gap-6 flex-col md:flex-row">
                    <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 p-4 rounded-xl">
                      <Store className="h-14 w-14 text-red-500" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">AI Vendor Matchmaking</h3>
                      <p className="text-white/80 mb-6">Let our AI assistant match you with the perfect vendors based on your event details, style preferences, and budget requirements.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Utensils className="h-5 w-5 text-red-400" />
                            <span className="font-medium">Catering</span>
                          </div>
                          <p className="text-white/70 text-sm">Find top-rated catering services that match your cuisine preferences</p>
                        </div>
                        
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Palette className="h-5 w-5 text-orange-400" />
                            <span className="font-medium">Decoration</span>
                          </div>
                          <p className="text-white/70 text-sm">Discover decorators who can bring your vision to life with style</p>
                        </div>
                        
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Music className="h-5 w-5 text-yellow-400" />
                            <span className="font-medium">Entertainment</span>
                          </div>
                          <p className="text-white/70 text-sm">Connect with performers and DJs to create the perfect atmosphere</p>
                        </div>
                      </div>
                      
                      {/* Enhanced Vendor Search Form with AI-compatible data attributes */}
                      <div className="bg-black/30 rounded-xl p-6 border border-white/10 mb-6">
                        <h4 className="text-lg font-semibold mb-4">
                          <div className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-red-400" />
                            <span>AI-Enhanced Vendor Search</span>
                          </div>
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm text-white/70 mb-2">Vendor Type</label>
                            <select 
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 text-white backdrop-blur-sm"
                              data-ai-field="vendor_type"
                            >
                              <option value="all" className="bg-gray-800 text-white">All Categories</option>
                              <option value="catering" className="bg-gray-800 text-white">Catering</option>
                              <option value="decor" className="bg-gray-800 text-white">Decor & Design</option>
                              <option value="photo_video" className="bg-gray-800 text-white">Photography & Video</option>
                              <option value="entertainment" className="bg-gray-800 text-white">Entertainment</option>
                              <option value="rental" className="bg-gray-800 text-white">Rental & Equipment</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-white/70 mb-2">Location</label>
                            <select 
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 text-white backdrop-blur-sm"
                              data-ai-field="location"
                            >
                              <option value="all" className="bg-gray-800 text-white">All Locations</option>
                              <option value="lagos" className="bg-gray-800 text-white">Lagos, Nigeria</option>
                              <option value="abuja" className="bg-gray-800 text-white">Abuja, Nigeria</option>
                              <option value="london" className="bg-gray-800 text-white">London, UK</option>
                              <option value="manchester" className="bg-gray-800 text-white">Manchester, UK</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-white/70 mb-2">Budget Range</label>
                            <select 
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 text-white backdrop-blur-sm"
                              data-ai-field="budget_range"
                            >
                              <option value="any" className="bg-gray-800 text-white">Any Budget</option>
                              <option value="low_naira" className="bg-gray-800 text-white">₦100,000 - ₦500,000</option>
                              <option value="medium_naira" className="bg-gray-800 text-white">₦500,000 - ₦1,000,000</option>
                              <option value="high_naira" className="bg-gray-800 text-white">₦1,000,000+</option>
                              <option value="low_gbp" className="bg-gray-800 text-white">£500 - £2,000</option>
                              <option value="high_gbp" className="bg-gray-800 text-white">£2,000+</option>
                            </select>
                          </div>
                        </div>
                        
                        {/* Advanced Filters Section */}
                        <motion.div 
                          className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          <div>
                            <label className="block text-sm text-white/70 mb-2">Minimum Rating</label>
                            <div className="flex items-center">
                              <select 
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 text-white backdrop-blur-sm"
                                data-ai-field="min_rating"
                              >
                                <option value="0" className="bg-gray-800 text-white">Any Rating</option>
                                <option value="3" className="bg-gray-800 text-white">3+ Stars</option>
                                <option value="4" className="bg-gray-800 text-white">4+ Stars</option>
                                <option value="4.5" className="bg-gray-800 text-white">4.5+ Stars</option>
                              </select>
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 -ml-8 pointer-events-none" />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-white/70 mb-2">Availability</label>
                            <input 
                              type="date" 
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 text-white backdrop-blur-sm"
                              data-ai-field="availability_date"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm text-white/70 mb-2">Sort Results By</label>
                            <select 
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 text-white backdrop-blur-sm"
                              data-ai-field="sort_by"
                            >
                              <option value="relevance" className="bg-gray-800 text-white">Relevance</option>
                              <option value="highest_rated" className="bg-gray-800 text-white">Highest Rated</option>
                              <option value="most_reviewed" className="bg-gray-800 text-white">Most Reviewed</option>
                              <option value="price_low" className="bg-gray-800 text-white">Price: Low to High</option>
                              <option value="price_high" className="bg-gray-800 text-white">Price: High to Low</option>
                            </select>
                          </div>
                        </motion.div>
                        
                        <div className="flex gap-3">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              placeholder="Search by vendor name, service or keyword..."
                              className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white backdrop-blur-sm"
                              data-ai-field="search_query"
                            />
                            <Search className="absolute left-3 top-3.5 h-5 w-5 text-white/50" />
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                            data-ai-action="search_vendors"
                          >
                            Search
                            <Search className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                      
                      {/* AI Vendor Matchmaking with Structured Data for AI Integration */}
                      <div className="bg-gradient-to-br from-black/50 to-purple-900/10 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 p-3 rounded-full">
                            <Webhook className="h-6 w-6 text-purple-400" />
                          </div>
                          <h4 className="text-xl font-semibold">AI Vendor Matchmaking</h4>
                        </div>
                        
                        <p className="text-white/70 mb-4">
                          Skip the search and let our AI assistant find the perfect vendors for your event. 
                          We'll analyze your requirements and match you with vendors who best fit your needs.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                            <div>
                              <p className="text-white font-medium">Personalized Matching</p>
                              <p className="text-white/60 text-sm">Our AI understands your specific event needs</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                            <Star className="h-5 w-5 text-yellow-400 mt-0.5" />
                            <div>
                              <p className="text-white font-medium">Quality Verified</p>
                              <p className="text-white/60 text-sm">All vendors are vetted and reviewed</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-400 mt-0.5" />
                            <div>
                              <p className="text-white font-medium">Availability Checked</p>
                              <p className="text-white/60 text-sm">Only see vendors available on your date</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                            <Percent className="h-5 w-5 text-red-400 mt-0.5" />
                            <div>
                              <p className="text-white font-medium">Budget Optimized</p>
                              <p className="text-white/60 text-sm">Find the best value within your price range</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                            data-ai-action="filter_vendors"
                          >
                            Apply Filters
                            <Filter className="h-4 w-4 ml-1" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Top Vendors Categories with Improved Structure for AI Parsing */}
                <div className="mb-12">
                  <h3 className="text-2xl font-bold mb-6">Top Vendor Categories</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        id: "catering",
                        icon: <Utensils className="h-8 w-8 text-red-400" />,
                        title: "Catering",
                        description: "Premium food services",
                        avg_rating: 4.8,
                        price_range: "₦200,000-₦2,000,000",
                        vendor_count: 48
                      },
                      {
                        id: "photography",
                        icon: <Camera className="h-8 w-8 text-orange-400" />,
                        title: "Photography",
                        description: "Expert photographers",
                        avg_rating: 4.7,
                        price_range: "₦150,000-₦800,000",
                        vendor_count: 35
                      },
                      {
                        id: "entertainment",
                        icon: <Music className="h-8 w-8 text-yellow-400" />,
                        title: "Entertainment",
                        description: "DJs and performers",
                        avg_rating: 4.6,
                        price_range: "₦100,000-₦1,500,000",
                        vendor_count: 52
                      },
                      {
                        id: "decoration",
                        icon: <Palette className="h-8 w-8 text-green-400" />,
                        title: "Decoration",
                        description: "Creative design services",
                        avg_rating: 4.9,
                        price_range: "₦250,000-₦3,000,000",
                        vendor_count: 41
                      }
                    ].map((category, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-br from-black/60 to-red-900/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-red-500/30 transition-all"
                        data-vendor-category={category.id}
                        data-average-rating={category.avg_rating}
                        data-price-range={category.price_range}
                        data-vendor-count={category.vendor_count}
                      >
                        <div className="bg-gradient-to-br from-red-600/10 to-black/50 p-3 rounded-xl inline-block mb-3">
                          {category.icon}
                        </div>
                        <h4 className="text-xl font-bold mb-2">{category.title}</h4>
                        <p className="text-white/70 mb-2">{category.description}</p>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-white/80 text-sm ml-1">{category.avg_rating}</span>
                          </div>
                          <span className="text-white/40">•</span>
                          <span className="text-white/80 text-sm">{category.vendor_count} vendors</span>
                        </div>
                        
                        <button 
                          className="text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
                          data-ai-action="browse_category"
                          data-category={category.id}
                        >
                          Browse vendors <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Planning Form Modal */}
      <AnimatePresence>
        {showPlanningForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-blue-600/30 p-2 rounded-lg">
                        <Webhook className="h-6 w-6 text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-blue-400">AI-POWERED</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">Tell Us About Your Celebration</h3>
                    <p className="text-gray-400 mt-2">Our AI will analyze your preferences to recommend the perfect venues, vendors, and experiences</p>
                  </div>
                  <button 
                    onClick={() => setShowPlanningForm(false)}
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        What are you celebrating?
                      </label>
                      <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm">
                        <option className="bg-gray-800 text-white">Wedding</option>
                        <option className="bg-gray-800 text-white">Birthday</option>
                        <option className="bg-gray-800 text-white">Corporate Event</option>
                        <option className="bg-gray-800 text-white">Cultural Celebration</option>
                        <option className="bg-gray-800 text-white">Anniversary</option>
                        <option className="bg-gray-800 text-white">Other (Please specify)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        How many people are you bringing together?
                      </label>
                      <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm">
                        <option className="bg-gray-800 text-white">Intimate (1-20 guests)</option>
                        <option className="bg-gray-800 text-white">Small (21-50 guests)</option>
                        <option className="bg-gray-800 text-white">Medium (51-100 guests)</option>
                        <option className="bg-gray-800 text-white">Large (101-200 guests)</option>
                        <option className="bg-gray-800 text-white">Very Large (200+ guests)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        When is your celebration?
                      </label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        What's your budget range?
                      </label>
                      <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm">
                        <option className="bg-gray-800 text-white">₦100,000 - ₦500,000 / £500 - £2,500</option>
                        <option className="bg-gray-800 text-white">₦500,000 - ₦1,000,000 / £2,500 - £5,000</option>
                        <option className="bg-gray-800 text-white">₦1,000,000 - ₦2,000,000 / £5,000 - £10,000</option>
                        <option className="bg-gray-800 text-white">₦2,000,000+ / £10,000+</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Where will you be celebrating?
                    </label>
                    <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm">
                      <option className="bg-gray-800 text-white">Lagos, Nigeria</option>
                      <option className="bg-gray-800 text-white">Abuja, Nigeria</option>
                      <option className="bg-gray-800 text-white">London, UK</option>
                      <option className="bg-gray-800 text-white">Manchester, UK</option>
                      <option className="bg-gray-800 text-white">Other (Our AI will find options)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      What elements are important to you? (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-3 text-white">
                      {[
                        { icon: <Building2 className="h-4 w-4" />, label: "Unique Venue" },
                        { icon: <Wine className="h-4 w-4" />, label: "Premium Drinks" },
                        { icon: <Utensils className="h-4 w-4" />, label: "Gourmet Food" },
                        { icon: <Music className="h-4 w-4" />, label: "Live Entertainment" },
                        { icon: <Palette className="h-4 w-4" />, label: "Beautiful Decor" },
                        { icon: <Camera className="h-4 w-4" />, label: "Photography" },
                        { icon: <Users className="h-4 w-4" />, label: "Group Activities" },
                        { icon: <MapPin className="h-4 w-4" />, label: "Convenient Location" }
                      ].map((item, index) => (
                        <label key={index} className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer">
                          <input type="checkbox" className="rounded text-blue-600 bg-white/5 border-white/20" />
                          <div className="flex items-center gap-2">
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Tell our AI a bit more about your vision
                    </label>
                    <textarea 
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm"
                      rows="3"
                      placeholder="Describe the atmosphere you want to create and any specific requirements..."
                    ></textarea>
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Shield className="h-4 w-4" />
                      <span>Your data is only used to personalize recommendations</span>
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setShowPlanningForm(false)}
                        className="px-6 py-3 border border-white/10 rounded-xl text-white bg-white/5 hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all"
                      >
                        Generate AI Recommendations
                        <Sparkles className="h-4 w-4" />
                      </button>
                    </div>
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
    </motion.div>
  );
};

export default Events; 