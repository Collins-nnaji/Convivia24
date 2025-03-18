import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Star, Filter, ChevronDown, Search, ArrowRight, Clock, CheckCircle, ClipboardList, Music, Cake, Heart, Award, Wine, Utensils, Palette, X, TrendingUp, ThumbsUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Events = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('plan');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortOption, setSortOption] = useState('popularity');
  const [eventType, setEventType] = useState('all');
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleItems, setVisibleItems] = useState(8);
  
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
  
  // Featured venue of the week (would be dynamically determined based on sentiment analysis or promotion)
  const featuredVenue = {
    id: 1,
    name: 'The Grand Ballroom',
    location: 'Lagos, Nigeria',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
    rating: 4.8,
    price: '₦500,000 - ₦1,200,000',
    capacity: '200-500',
    type: 'wedding',
    features: ['Catering', 'Decoration', 'Sound System', 'Air Conditioning'],
    sentiment: {
      positive: 95,
      neutral: 3,
      negative: 2
    },
    trending: true,
    featuredUntil: "April 30, 2024",
    socialBuzz: "Over 800 mentions on social media this week",
    promotionReason: "Trending for its elegant new decor and exceptional wedding services",
    recentEvents: 12,
    successRate: 98
  };
  
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
  }, []);
  
  // Sample event data
  const venues = [
    {
      id: 1,
      name: 'The Grand Ballroom',
      location: 'Lagos, Nigeria',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.8,
      price: '₦500,000 - ₦1,200,000',
      capacity: '200-500',
      type: 'wedding',
      features: ['Catering', 'Decoration', 'Sound System', 'Air Conditioning']
    },
    {
      id: 2,
      name: 'The Mayfair Hall',
      location: 'London, UK',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.9,
      price: '£3,000 - £8,000',
      capacity: '100-300',
      type: 'corporate',
      features: ['Projector', 'WiFi', 'Catering', 'Parking']
    },
    {
      id: 3,
      name: 'Ocean View Gardens',
      location: 'Lagos, Nigeria',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.7,
      price: '₦400,000 - ₦900,000',
      capacity: '100-300',
      type: 'wedding',
      features: ['Garden', 'Outdoor', 'Bar', 'Parking']
    },
    {
      id: 4,
      name: 'The Victoria Hall',
      location: 'Manchester, UK',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.5,
      price: '£2,500 - £5,000',
      capacity: '50-200',
      type: 'birthday',
      features: ['DJ Booth', 'Dance Floor', 'Bar', 'Security']
    },
    {
      id: 5,
      name: 'Royal Event Center',
      location: 'Abuja, Nigeria',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.6,
      price: '₦350,000 - ₦800,000',
      capacity: '150-400',
      type: 'corporate',
      features: ['Conference Setup', 'Projector', 'WiFi', 'Parking']
    },
    {
      id: 6,
      name: 'The Vintage Hall',
      location: 'Birmingham, UK',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.4,
      price: '£2,000 - £4,500',
      capacity: '80-250',
      type: 'wedding',
      features: ['Historic Building', 'Garden', 'Catering', 'Ceremony Space']
    },
    {
      id: 7,
      name: 'Seaside Event Center',
      location: 'Port Harcourt, Nigeria',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.3,
      price: '₦300,000 - ₦650,000',
      capacity: '100-250',
      type: 'birthday',
      features: ['Waterfront', 'Outdoor', 'Bar', 'Parking']
    },
    {
      id: 8,
      name: 'The Crystal Palace',
      location: 'London, UK',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.9,
      price: '£5,000 - £12,000',
      capacity: '200-600',
      type: 'corporate',
      features: ['Luxury', 'Full Service', 'Parking', 'Security']
    },
  ];
  
  const upcomingEvents = [
    {
      id: 1,
      name: 'Nigerian Cultural Festival',
      date: '2023-09-15',
      time: '12:00 PM',
      location: 'Lagos, Nigeria',
      image: 'https://images.unsplash.com/photo-1544928147-7c0c20911da5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      organizer: 'Nigerian Cultural Association',
      attendees: 250,
      type: 'cultural'
    },
    {
      id: 2,
      name: 'UK-Nigeria Business Networking',
      date: '2023-09-20',
      time: '6:00 PM',
      location: 'London, UK',
      image: 'https://images.unsplash.com/photo-1544928147-7c0c20911da5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      organizer: 'UK-Nigerian Chamber of Commerce',
      attendees: 120,
      type: 'corporate'
    },
    {
      id: 3,
      name: 'Yoruba Traditional Wedding',
      date: '2023-10-05',
      time: '2:00 PM',
      location: 'Ibadan, Nigeria',
      image: 'https://images.unsplash.com/photo-1544928147-7c0c20911da5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      organizer: 'Adebayo Family',
      attendees: 300,
      type: 'wedding'
    },
    {
      id: 4,
      name: 'African Food Festival',
      date: '2023-10-12',
      time: '11:00 AM',
      location: 'Manchester, UK',
      image: 'https://images.unsplash.com/photo-1544928147-7c0c20911da5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      organizer: 'African Chefs Association UK',
      attendees: 500,
      type: 'cultural'
    },
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
  const filteredVenues = venues.filter(venue => {
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
  const filteredEvents = upcomingEvents.filter(event => {
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

  const [showPlanningForm, setShowPlanningForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Your Complete Event Planning Platform</h1>
          <p className="text-xl mb-8">Find the perfect venue, services, and suppliers for your celebration</p>
          
          {/* Search bar */}
          <div className="relative max-w-3xl">
            <input
              type="text"
              placeholder="Search for venues, caterers, or services..."
              className="w-full px-5 py-3 rounded-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 pl-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
          </div>
        </div>
      </div>
      
      {/* Featured Venue of the Week */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 relative">
              <img 
                src={featuredVenue.image} 
                alt={featuredVenue.name} 
                className="w-full h-64 md:h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full flex items-center">
                <Award className="mr-2" size={18} />
                <span className="font-semibold">Venue of the Week</span>
              </div>
              {featuredVenue.trending && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full flex items-center">
                  <TrendingUp className="mr-1" size={14} />
                  <span className="text-sm font-medium">Trending</span>
                </div>
              )}
            </div>
            <div className="md:w-1/2 p-6 md:p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{featuredVenue.name}</h2>
                  <div className="flex items-center mt-1">
                    <MapPin size={16} className="text-gray-500 mr-1" />
                    <span className="text-gray-600">{featuredVenue.location}</span>
                  </div>
                </div>
                <div className="flex items-center bg-yellow-100 px-2 py-1 rounded">
                  <Star size={16} className="text-yellow-500 mr-1" />
                  <span className="font-semibold">{featuredVenue.rating}</span>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {featuredVenue.features.map((feature, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {feature}
                  </span>
                ))}
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center">
                  <Users size={16} className="text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">Capacity: {featuredVenue.capacity}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">{featuredVenue.recentEvents} events this month</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle size={16} className="text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">{featuredVenue.successRate}% success rate</span>
                </div>
                <div className="flex items-center">
                  <Cake size={16} className="text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">Perfect for {featuredVenue.type}s</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-lg font-semibold text-gray-900">{featuredVenue.price}</div>
                <div className="text-sm text-gray-600">per event</div>
              </div>
              
              <div className="mt-5 bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <ThumbsUp size={16} className="text-red-500 mr-2" />
                  Why it's trending
                </h3>
                <p className="mt-1 text-sm text-gray-700">{featuredVenue.promotionReason}</p>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${featuredVenue.sentiment.positive}%` }}></div>
                  </div>
                  <span className="ml-2">{featuredVenue.sentiment.positive}% positive</span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button className="bg-gradient-to-r from-red-700 to-red-900 text-white px-4 py-2 rounded-lg hover:from-red-800 hover:to-red-950 transition duration-300">
                  Book Now
                </button>
                <div className="flex space-x-2">
                  <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
                    <Heart size={20} className="text-gray-700" />
                  </button>
                  <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
                    <Calendar size={20} className="text-gray-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-r from-red-700 to-red-900 text-white py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Bringing People Together Through Celebrations
            </h1>
            <p className="text-xl text-gray-200 mb-10">
              Plan, organize, and enjoy unforgettable moments - our all-in-one platform connects you with everything you need
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search venues, beverages, caterers..."
                className="w-full pl-10 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="#f9fafb" preserveAspectRatio="none">
            <path d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,42.7C840,32,960,32,1080,37.3C1200,43,1320,53,1380,58.7L1440,64L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"></path>
          </svg>
        </div>
      </motion.section>
      
      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex border-b overflow-x-auto hide-scrollbar">
            <button
              className={`px-6 py-3 font-medium ${activeTab === 'plan' ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('plan')}
            >
              <ClipboardList className="inline-block mr-2 h-5 w-5" />
              Plan Your Event
            </button>
            <button
              className={`px-6 py-3 font-medium ${activeTab === 'beverages' ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('beverages')}
            >
              <Wine className="inline-block mr-2 h-5 w-5" />
              Beverage Supplies
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'plan' && (
            <motion.div 
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 md:p-8 border-2 border-red-100"
            >
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <span className="inline-block bg-red-100 text-red-800 text-sm font-medium px-4 py-1 rounded-full mb-4">Event Planning Portal</span>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Create Unforgettable Celebrations Together
                  </h2>
                  <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                    From intimate gatherings to grand events, our platform brings together everything and everyone you need for the perfect celebration
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl text-center"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-red-700 to-red-900 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                        <ClipboardList className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold mb-2">Smart Planning</h3>
                      <p className="text-sm text-gray-600">
                        AI-powered suggestions for venues, vendors, and timeline planning
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl text-center"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-red-700 to-red-900 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                        <Wine className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold mb-2">Complete Services</h3>
                      <p className="text-sm text-gray-600">
                        Order drinks, book caterers, arrange decorations, and more
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl text-center"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-red-700 to-red-900 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                        <Star className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold mb-2">Verified Services</h3>
                      <p className="text-sm text-gray-600">
                        Read reviews and book trusted service providers
                      </p>
                    </motion.div>
                  </div>

                {/* Event Timeline and Collaboration */}
                <div className="bg-gradient-to-r from-red-700 to-red-900 p-6 rounded-xl mb-12 text-white">
                  <h3 className="text-2xl font-bold mb-4">Bringing People Together</h3>
                  <p className="mb-6">Create your event and invite friends, family, and colleagues to collaborate on planning the perfect celebration</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                      <h4 className="font-bold text-lg mb-4">Event Timeline</h4>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-white font-bold">1</span>
                          </div>
                          <div>
                            <h5 className="font-medium">Planning & Invitations</h5>
                            <p className="text-sm text-gray-200">3-6 months before event</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-white font-bold">2</span>
                          </div>
                          <div>
                            <h5 className="font-medium">Vendors & Bookings</h5>
                            <p className="text-sm text-gray-200">2-4 months before event</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-white font-bold">3</span>
                          </div>
                          <div>
                            <h5 className="font-medium">Beverages & Catering</h5>
                            <p className="text-sm text-gray-200">1-2 months before event</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-white font-bold">4</span>
                          </div>
                          <div>
                            <h5 className="font-medium">Final Confirmations</h5>
                            <p className="text-sm text-gray-200">1-2 weeks before event</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                      <h4 className="font-bold text-lg mb-4">Event Collaboration</h4>
                      <p className="text-sm text-gray-200 mb-4">Invite team members to help plan different aspects of your event</p>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-bold">A</span>
                            </div>
                            <div>
                              <h5 className="font-medium">Aisha M.</h5>
                              <p className="text-xs text-gray-300">Venue coordinator</p>
                            </div>
                          </div>
                          <span className="text-xs bg-green-600/20 text-green-100 px-2 py-1 rounded-full">Added</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-bold">K</span>
                            </div>
                            <div>
                              <h5 className="font-medium">Kevin T.</h5>
                              <p className="text-xs text-gray-300">Beverage manager</p>
                            </div>
                          </div>
                          <span className="text-xs bg-green-600/20 text-green-100 px-2 py-1 rounded-full">Added</span>
                        </div>
                      </div>
                      
                      <button className="w-full py-2 bg-white/20 text-white rounded-lg border border-white/30 hover:bg-white/30 transition-colors">
                        + Add New Collaborator
                      </button>
                    </div>
                  </div>
                </div>

                {/* Service Categories */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <Wine className="h-8 w-8 text-red-700 mb-4" />
                      <h4 className="font-bold mb-2">Drinks & Beverages</h4>
                      <p className="text-sm text-gray-600">Order drinks for any occasion</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <Utensils className="h-8 w-8 text-red-700 mb-4" />
                      <h4 className="font-bold mb-2">Catering Services</h4>
                      <p className="text-sm text-gray-600">Professional food services</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <Palette className="h-8 w-8 text-red-700 mb-4" />
                      <h4 className="font-bold mb-2">Decoration</h4>
                      <p className="text-sm text-gray-600">Beautiful event styling</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <Music className="h-8 w-8 text-red-700 mb-4" />
                      <h4 className="font-bold mb-2">Entertainment</h4>
                      <p className="text-sm text-gray-600">DJs, bands, and performers</p>
                    </div>
                  </div>

                {/* Reviews Section */}
                <div className="mb-12">
                    <h3 className="text-2xl font-bold mb-6 text-center">Celebration Stories</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {reviews.map(review => (
                        <motion.div
                          key={review.id}
                          whileHover={{ y: -5 }}
                          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center font-bold text-red-700">
                              {review.user.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <h4 className="font-bold">{review.user}</h4>
                              <p className="text-sm text-gray-500">{review.service}</p>
                            </div>
                          </div>
                          <div className="text-yellow-400 mb-2">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                          <p className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                <div className="relative p-8 bg-gradient-to-r from-red-700 to-red-900 rounded-xl mb-8 overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600 opacity-20 rounded-full"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-600 opacity-20 rounded-full"></div>
                  
                  <div className="relative z-10 text-center text-white">
                    <h3 className="text-2xl font-bold mb-4">Create Your Perfect Celebration</h3>
                    <p className="mb-8 max-w-xl mx-auto">
                      Let our AI-powered platform help you plan every aspect of your event, from venue selection to entertainment and beverages
                    </p>
                    <button 
                      onClick={() => setShowPlanningForm(true)}
                      className="inline-block px-8 py-4 bg-white text-red-800 rounded-full font-medium hover:bg-gray-100 transition-colors shadow-md"
                    >
                      Start Planning Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'beverages' && (
            <motion.div 
              key="beverages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold mb-4">Premium Beverage Suppliers</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Celebrate with the perfect drinks - from premium wines to craft cocktails, we connect you with trusted beverage providers
                  </p>
                </div>
                
                {/* Beverage Categories */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                    <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-2">
                      <Wine className="h-6 w-6 text-red-700" />
                    </div>
                    <span className="font-medium">Wine</span>
                  </button>
                  
                  <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                    <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-2">
                      <Wine className="h-6 w-6 text-red-700" />
                    </div>
                    <span className="font-medium">Spirits</span>
                  </button>
                  
                  <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                    <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-2">
                      <Wine className="h-6 w-6 text-red-700" />
                    </div>
                    <span className="font-medium">Cocktails</span>
                  </button>
                  
                  <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                    <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-2">
                      <Wine className="h-6 w-6 text-red-700" />
                    </div>
                    <span className="font-medium">Non-Alcoholic</span>
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
                        <h4 className="font-bold text-lg">Premium Wine Collection</h4>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm">4.9</span>
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
                        <h4 className="font-bold text-lg">Craft Cocktail Bar</h4>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm">4.8</span>
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
                        <h4 className="font-bold text-lg">Premium Non-Alcoholic</h4>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm">4.7</span>
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
                    <h4 className="font-bold text-xl mb-4">Premium Wedding Package</h4>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Selection of red and white wines</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Champagne for toasts</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Premium spirits selection</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Non-alcoholic options</span>
                      </li>
                    </ul>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">₦250,000</span>
                      <button className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg hover:opacity-90 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h4 className="font-bold text-xl mb-4">Corporate Event Package</h4>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Selection of premium beers</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Wine selection</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Signature cocktails</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Premium soft drinks</span>
                      </li>
                    </ul>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">₦180,000</span>
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
        </AnimatePresence>
      </div>
      
      {/* Call to Action */}
      <section className="mt-16 bg-gradient-to-r from-red-700 to-red-900 text-white py-12">
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Plan Your Event</h3>
                  <button 
                    onClick={() => setShowPlanningForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500">
                      <option>Wedding</option>
                      <option>Birthday</option>
                      <option>Corporate Event</option>
                      <option>Cultural Celebration</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Guests
                      </label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        placeholder="Number of guests"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500">
                      <option>Lagos, Nigeria</option>
                      <option>Abuja, Nigeria</option>
                      <option>London, UK</option>
                      <option>Manchester, UK</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Services Needed
                    </label>
                    <div className="space-y-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      rows="3"
                      placeholder="Any specific requirements or preferences..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setShowPlanningForm(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
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