import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useScroll, useTransform } from 'framer-motion';
import { Calendar, MapPin, Users, Star, Filter, ChevronDown, Search, ArrowRight, Clock, CheckCircle, ClipboardList, Music, Cake, Heart, Award, Wine, Utensils, Palette, X, TrendingUp, ThumbsUp, Globe, Sparkles, Ticket, CalendarPlus, User, Percent, Crown, Download, ListChecks, Building2, User2, Gift, Store, CalendarClock, Webhook, Camera, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Event card component with enhanced animations
const EventCard = ({ event, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
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

// Venue card component with enhanced animations
const VenueCard = ({ venue, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
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
          src={venue.image} 
          alt={venue.name}
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
          {venue.type.charAt(0).toUpperCase() + venue.type.slice(1)}
        </motion.div>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.4 }}
          className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-white"
        >
          <span>{venue.rating}</span>
          <Star className="h-3 w-3 text-yellow-400 fill-current" />
        </motion.div>
      </div>
      
      <div className="p-5">
        <motion.h3 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.1 }}
          className="text-xl font-bold text-white mb-2"
        >
          {venue.name}
        </motion.h3>
        
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
          className="flex items-center gap-2 text-white/70 text-sm mb-2"
        >
          <MapPin className="h-4 w-4 text-red-400" />
          <span>{venue.location}</span>
        </motion.div>
        
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className="flex items-center gap-2 text-white/70 text-sm mb-2"
        >
          <Users className="h-4 w-4 text-red-400" />
          <span>{venue.capacity}</span>
        </motion.div>
        
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.4 }}
          className="flex items-center gap-2 text-white/70 text-sm mb-4"
        >
          <Ticket className="h-4 w-4 text-red-400" />
          <span>{venue.price}</span>
        </motion.div>
        
        {/* Features Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {venue.features.map((feature, idx) => (
            <motion.span 
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 + idx * 0.05 + 0.5 }}
              whileHover={{ 
                scale: 1.1, 
                backgroundColor: "rgba(255, 0, 0, 0.2)"
              }}
              className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white/90"
            >
              {feature}
            </motion.span>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.7 }}
          className="flex justify-end pt-3 border-t border-white/10"
        >
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: "#CC0000" 
            }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-full flex items-center gap-1.5"
          >
            <span>View Details</span>
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
  
  // Add missing state for visible events
  const [visibleEvents, setVisibleEvents] = useState([]);
  
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
  
  // Update visibleEvents when filteredEvents changes
  useEffect(() => {
    setVisibleEvents(filteredEvents.slice(0, visibleItems));
  }, [filteredEvents, visibleItems]);
  
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
    setVisibleEvents(filteredEvents.slice(0, newVisibleItems));
  };

  // Tabs configuration
  const tabs = [
    { id: 'plan', label: 'Plan Your Celebrations', icon: <Calendar className="h-4 w-4" /> },
    { id: 'vendors', label: 'Vendors', icon: <Store className="h-4 w-4" /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white"
    >
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
              Ready to Bring People Together?
            </motion.h1>
            <motion.p 
              className="text-xl text-white/80 mb-8 text-center max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Create unforgettable celebration experiences that connect people through shared moments
            </motion.p>
            
            {/* Planning Steps */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 w-full max-w-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {[
                {
                  icon: <Cake className="h-6 w-6 text-red-400" />,
                  title: "Define Event",
                  desc: "Choose type & guest count"
                },
                {
                  icon: <Calendar className="h-6 w-6 text-red-400" />,
                  title: "Set Date & Budget",
                  desc: "Plan your timeline"
                },
                {
                  icon: <Webhook className="h-6 w-6 text-red-400" />,
                  title: "AI Recommendations",
                  desc: "Get personalized options"
                },
                {
                  icon: <Sparkles className="h-6 w-6 text-red-400" />,
                  title: "Create Memories",
                  desc: "Enjoy your celebration"
                }
              ].map((step, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                  className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col items-center text-center hover:bg-white/15 hover:border-red-500/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600/20 to-purple-600/20 rounded-full flex items-center justify-center mb-3">
                    {step.icon}
                  </div>
                  <h3 className="text-white font-medium mb-1">{step.title}</h3>
                  <p className="text-white/60 text-sm">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
            
            {/* CTA Button */}
            <motion.button
              onClick={() => setShowPlanningForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white text-lg font-medium rounded-full shadow-lg shadow-red-900/30 flex items-center gap-2 transform transition-all duration-300"
            >
              Start Planning Now
              <ArrowRight className="h-5 w-5" />
            </motion.button>
            
            {/* Country Selector */}
            <motion.div 
              className="flex justify-center gap-3 mt-10 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
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
      
      {/* Category Filters - Animated */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex overflow-x-auto scrollbar-hide py-4 gap-2 mb-8 snap-x"
        >
          {eventCategories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 + 0.3 }}
              whileHover={{ y: -5, backgroundColor: category.id === eventType ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEventType(category.id)}
              className={`py-2 px-4 rounded-full flex items-center gap-2 whitespace-nowrap transition-all duration-300 snap-start ${
                category.id === eventType
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
      
      {/* Content Based on Tab */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <AnimatePresence mode="wait">
          {activeTab === 'plan' && (
            <motion.div 
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Upcoming Events Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-12"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-between items-center mb-6"
                >
                  <h2 className="text-2xl font-bold">Upcoming Events</h2>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 text-white/70 hover:text-white cursor-pointer"
                  >
                    <span className="text-sm">View All</span>
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleEvents.map((event, index) => (
                    <EventCard key={event.id} event={event} index={index} />
                  ))}
                </div>
                
                {visibleEvents.length < filteredEvents.length && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex justify-center mt-8"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLoadMore}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      Load More Events
                      <ChevronDown className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
              
              {/* Popular Venues Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-16"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-between items-center mb-6"
                >
                  <h2 className="text-2xl font-bold">Popular Venues</h2>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 text-white/70 hover:text-white cursor-pointer"
                  >
                    <span className="text-sm">Explore All</span>
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedVenues.slice(0, 6).map((venue, index) => (
                    <VenueCard key={venue.id} venue={venue} index={index} />
                  ))}
                </div>
              </motion.div>
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
      
      {/* AI Planning Form Modal */}
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