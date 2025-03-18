import React, { useState, useEffect } from 'react';
import { Star, Filter, Search, ChevronDown, ArrowRight, Clock, Users, Calendar, MapPin, MessageCircle, Award, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Providers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortOption, setSortOption] = useState('popularity');
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleItems, setVisibleItems] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedServiceType, setSelectedServiceType] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  
  // Animation hooks
  const [activeItemIndex, setActiveItemIndex] = useState(null);
  
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
  }, []);
  
  // Sample provider data with service-specific details
  const providers = [
    {
      id: 1,
      name: 'EventPro AI',
      category: 'event_planner',
      serviceType: 'planning',
      location: 'Lagos, Nigeria',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZXZlbnQlMjBwbGFubmluZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.9,
      price: '₦50,000 - ₦200,000',
      serviceDetails: {
        maxEventsPerMonth: 20,
        planningTime: '2-6 months',
        teamSize: '5-10',
        specialties: ['Corporate Events', 'Weddings', 'Conferences'],
        eventTypes: ['Corporate', 'Wedding', 'Conference', 'Birthday', 'Social'],
        experience: '5+ years',
        languages: ['English', 'Yoruba', 'Igbo'],
        certifications: ['Event Management Professional', 'AI Event Planning']
      },
      features: ['AI Planning', 'Budget Optimization', 'Vendor Matching', 'Real-time Updates'],
      openingHours: '24/7',
      eventsCompleted: 250,
      popularity: 98,
      aiFeatures: {
        smartPlanning: true,
        budgetOptimization: true,
        vendorMatching: true,
        realTimeUpdates: true,
        guestManagement: true,
        timelineOptimization: true
      }
    },
    {
      id: 2,
      name: 'Smart Catering Solutions',
      category: 'catering',
      serviceType: 'food',
      location: 'London, UK',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGNhdGVyaW5nfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.8,
      price: '£500 - £5,000',
      serviceDetails: {
        maxGuests: 500,
        cuisineTypes: ['International', 'Local', 'Fusion'],
        dietaryOptions: ['Vegetarian', 'Vegan', 'Halal', 'Kosher'],
        serviceStyle: ['Buffet', 'Plated', 'Family Style'],
        equipment: ['Full Kitchen Setup', 'Serving Staff', 'Tableware'],
        minimumNotice: '2 weeks',
        delivery: true,
        setupTime: '2-4 hours'
      },
      features: ['AI Menu Planning', 'Dietary Optimization', 'Smart Inventory', 'Real-time Tracking'],
      openingHours: '24/7',
      eventsCompleted: 180,
      popularity: 95,
      aiFeatures: {
        smartPlanning: true,
        menuOptimization: true,
        inventoryManagement: true,
        realTimeTracking: true,
        dietaryPlanning: true,
        wasteReduction: true
      }
    },
    {
      id: 3,
      name: 'AI Entertainment Hub',
      category: 'entertainment',
      serviceType: 'entertainment',
      location: 'Lagos, Nigeria',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGVudGVydGFpbm1lbnR8ZW58MHx8MHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.7,
      price: '₦30,000 - ₦150,000',
      serviceDetails: {
        entertainmentTypes: ['Live Music', 'DJ', 'Dance', 'Comedy', 'Games'],
        equipment: ['Sound System', 'Lighting', 'Stage', 'Microphones'],
        maxDuration: '8 hours',
        setupTime: '1-2 hours',
        genres: ['Pop', 'Hip Hop', 'Traditional', 'Jazz'],
        languages: ['English', 'Yoruba', 'Pidgin'],
        minimumNotice: '1 week'
      },
      features: ['AI DJ Selection', 'Music Optimization', 'Crowd Analytics', 'Real-time Adjustments'],
      openingHours: '24/7',
      eventsCompleted: 150,
      popularity: 92,
      aiFeatures: {
        smartPlanning: true,
        musicOptimization: true,
        crowdAnalytics: true,
        realTimeAdjustments: true,
        playlistOptimization: true,
        moodAnalysis: true
      }
    },
    {
      id: 4,
      name: 'Luxury Venue Solutions',
      category: 'venues',
      serviceType: 'venue',
      location: 'Lagos, Nigeria',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.9,
      price: '₦100,000 - ₦500,000',
      serviceDetails: {
        capacity: {
          indoor: 500,
          outdoor: 1000,
          total: 1500
        },
        spaces: ['Main Hall', 'Conference Rooms', 'Outdoor Garden', 'VIP Lounge'],
        amenities: ['Parking', 'Security', 'Catering Kitchen', 'Stage', 'Sound System'],
        setupTime: '4-6 hours',
        minimumNotice: '1 month',
        accessibility: ['Wheelchair Access', 'Elevator', 'Ramps'],
        additionalServices: ['Catering', 'Security', 'Cleaning']
      },
      features: ['Indoor & Outdoor', 'Parking', 'Security', 'Catering'],
      openingHours: '24/7',
      eventsCompleted: 300,
      popularity: 97,
      aiFeatures: {
        smartPlanning: true,
        venueMatching: true,
        capacityOptimization: true,
        realTimeAvailability: true,
        layoutOptimization: true,
        trafficFlow: true
      }
    },
    {
      id: 5,
      name: 'Elite Photography',
      category: 'photography',
      serviceType: 'photography',
      location: 'London, UK',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHBob3RvZ3JhcGh5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.8,
      price: '£200 - £2,000',
      serviceDetails: {
        coverage: ['Wedding', 'Corporate', 'Portrait', 'Drone'],
        equipment: ['Professional Cameras', 'Drones', 'Lighting', 'Backdrops'],
        deliveryTime: '1-2 weeks',
        photoCount: '200-500',
        formats: ['Digital', 'Print', 'Album'],
        teamSize: '2-4',
        languages: ['English', 'French', 'Spanish'],
        minimumNotice: '2 weeks'
      },
      features: ['Wedding', 'Corporate', 'Portrait', 'Drone'],
      openingHours: '24/7',
      eventsCompleted: 200,
      popularity: 96,
      aiFeatures: {
        smartPlanning: true,
        photoOptimization: true,
        instantDelivery: true,
        styleMatching: true,
        faceDetection: true,
        autoEditing: true
      }
    },
    {
      id: 6,
      name: 'Transportation Services',
      category: 'transportation',
      location: 'Birmingham, UK',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.4,
      price: '£200 - £1,000',
      capacity: '2-50',
      features: ['Luxury Vehicles', 'Chauffeur Service', 'Group Transport', 'Airport Pickup'],
      openingHours: '24/7',
      eventsCompleted: 140,
      popularity: 82,
      contact: {
        phone: '+44 121 123 4567',
        email: 'info@luxurytransport.com',
        website: 'www.luxurytransport.com'
      }
    },
    {
      id: 7,
      name: 'Event Security Services',
      category: 'security',
      location: 'Port Harcourt, Nigeria',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.3,
      price: '₦25,000 - ₦100,000',
      capacity: 'Any Size',
      features: ['Trained Personnel', 'Crowd Control', 'Access Control', 'Emergency Response'],
      openingHours: '24/7',
      eventsCompleted: 130,
      popularity: 80,
      contact: {
        phone: '+234 777 123 4567',
        email: 'info@eventsecurity.com',
        website: 'www.eventsecurity.com'
      }
    },
    {
      id: 8,
      name: 'Wedding Planning Specialists',
      category: 'planning',
      location: 'London, UK',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.9,
      price: '£1,000 - £5,000',
      capacity: 'Any Size',
      features: ['Full Planning', 'Day Coordination', 'Vendor Management', 'Timeline Creation'],
      openingHours: '9:00 AM - 6:00 PM',
      eventsCompleted: 170,
      popularity: 94,
      contact: {
        phone: '+44 20 7123 4567',
        email: 'info@weddingplanners.com',
        website: 'www.weddingplanners.com'
      }
    },
  ];

  // Provider categories
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'catering', name: 'Catering' },
    { id: 'decoration', name: 'Decoration' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'beverages', name: 'Beverages' },
    { id: 'photography', name: 'Photography' },
    { id: 'transportation', name: 'Transportation' },
    { id: 'security', name: 'Security' },
    { id: 'planning', name: 'Planning' }
  ];

  // Filter providers based on search query, category, and rating
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         provider.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedCategory === 'all' || 
                          (selectedCategory === 'nigeria' && provider.location.includes('Nigeria')) ||
                          (selectedCategory === 'uk' && provider.location.includes('UK'));
    const matchesRating = provider.rating >= ratingFilter;
    const matchesServiceType = selectedServiceType === 'all' || provider.serviceType === selectedServiceType;
    const matchesPrice = true; // Temporarily disable price filtering
    const matchesFeatures = selectedFeatures.length === 0 || 
                           (provider.features && selectedFeatures.every(feature => provider.features.includes(feature)));
    
    return matchesSearch && matchesLocation && matchesRating && matchesServiceType && matchesPrice && matchesFeatures;
  });
  
  // Group providers by category
  const groupedProviders = filteredProviders.reduce((acc, provider) => {
    const category = provider.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(provider);
    return acc;
  }, {});

  // Sort providers within each category
  Object.keys(groupedProviders).forEach(category => {
    groupedProviders[category].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return parseFloat(a.price.replace(/[^0-9.-]+/g, '')) - parseFloat(b.price.replace(/[^0-9.-]+/g, ''));
        case 'popularity':
        default:
          return b.popularity - a.popularity;
      }
    });
  });
  
  const handleLoadMore = () => {
    setVisibleItems(prev => prev + 4);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF0000]/20 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:20px_20px] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Event Service Marketplace
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            Connect with AI-powered event service providers. Find the perfect match for your event needs.
          </p>
          <div className="relative max-w-3xl">
            <input
              type="text"
              placeholder="Search for providers, services, or locations..."
              className="w-full px-6 py-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] pl-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-4 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Featured Providers Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Featured Providers</h2>
            <div className="flex items-center gap-2 text-[#FF0000]">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Updated Weekly</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {providers.slice(0, 3).map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-[#FF0000]/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative bg-white/5 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={provider.image}
                      alt={provider.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">{provider.name}</h3>
                        <div className="flex items-center bg-white/10 px-3 py-1 rounded-full text-sm">
                          <Star className="h-4 w-4 text-[#FF0000] mr-1" fill="currentColor" />
                          {provider.rating}
                        </div>
                      </div>
                      <div className="flex items-center text-white/80 mt-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{provider.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-sm text-white/60">
                        <Clock className="h-4 w-4 mr-1" />
                        {provider.openingHours}
                      </div>
                      <div className="text-[#FF0000] font-medium">{provider.price}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {provider.features.slice(0, 3).map((feature, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-white/5 text-white/80 text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">All Providers</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-300 hover:text-white transition-all duration-300"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Enhanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-12 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Range Filter */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Price Range</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full px-4 py-2 bg-white/5 rounded-lg text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                      placeholder="Min"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full px-4 py-2 bg-white/5 rounded-lg text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Features Filter */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Features</label>
                  <div className="flex flex-wrap gap-2">
                    {['AI Planning', 'Budget Optimization', 'Vendor Matching', 'Real-time Updates'].map((feature) => (
                      <button
                        key={feature}
                        onClick={() => {
                          setSelectedFeatures(prev =>
                            prev.includes(feature)
                              ? prev.filter(f => f !== feature)
                              : [...prev, feature]
                          );
                        }}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedFeatures.includes(feature)
                            ? 'bg-[#FF0000] text-white'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Location</label>
                  <select
                    className="w-full px-4 py-2 bg-white/5 rounded-lg text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Locations</option>
                    <option value="nigeria">Nigeria</option>
                    <option value="uk">United Kingdom</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Providers Grid */}
        <div className="space-y-12">
          {Object.entries(groupedProviders).map(([category, categoryProviders]) => (
            <div key={category} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white capitalize">
                  {category.replace('_', ' ')}
                </h3>
                <div className="flex items-center gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-white/5 rounded-lg text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="rating">Rating</option>
                    <option value="price">Price</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {categoryProviders.map((provider) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-[#FF0000]/50 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      {/* Provider Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-xl font-semibold text-white">{provider.name}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-white/80">{provider.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-white/60 mb-4">
                          <MapPin className="w-4 h-4" />
                          <span>{provider.location}</span>
                        </div>

                        {/* Service Details */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="text-sm text-white/60 mb-1">Operating Hours</div>
                            <div className="text-white">{provider.openingHours}</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="text-sm text-white/60 mb-1">Capacity</div>
                            <div className="text-white">
                              {provider.serviceDetails?.capacity?.total || provider.capacity || 'N/A'}
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="text-sm text-white/60 mb-1">Price Range</div>
                            <div className="text-white">{provider.price}</div>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="mb-4">
                          <div className="text-sm text-white/60 mb-2">Features</div>
                          <div className="flex flex-wrap gap-2">
                            {provider.features?.map((feature, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-[#FF0000]/10 text-[#FF0000] rounded-full text-sm"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Business Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-white mb-1">{provider.eventsCompleted}</div>
                            <div className="text-sm text-white/60">Events Completed</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-white mb-1">{provider.popularity}%</div>
                            <div className="text-sm text-white/60">Popularity</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-white mb-1">{provider.rating}</div>
                            <div className="text-sm text-white/60">Rating</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-white mb-1">{provider.reviews || 'N/A'}</div>
                            <div className="text-sm text-white/60">Reviews</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3">
                        <button className="px-6 py-2 bg-[#FF0000] text-white rounded-lg hover:bg-[#FF0000]/90 transition-colors">
                          View Profile
                        </button>
                        <button className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                          Message
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Providers; 