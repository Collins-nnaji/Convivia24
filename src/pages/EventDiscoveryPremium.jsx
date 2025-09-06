import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Search, Filter, Map, List, Star, Heart, Share2, Calendar, Clock, MapPin, 
  Users, Crown, ChevronDown, ChevronUp, Sparkles, Zap, Music, Gamepad2,
  Camera, Coffee, Wine, Moon, Sun, Cloud, Wind, Flame, Snowflake,
  TrendingUp, Award, Gift, Eye, Play, Pause, Volume2, VolumeX,
  ThumbsUp, MessageCircle, Bookmark, ExternalLink, ArrowRight,
  Brain, Target, Compass, Globe, Palette, Headphones, Grid
} from 'lucide-react';

const EventDiscoveryPremium = () => {
  const [activeTab, setActiveTab] = useState('mood');
  const [selectedMood, setSelectedMood] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, map
  const [isLoading, setIsLoading] = useState(false);

  const controls = useAnimation();

  // Compact Mood System - Red, White, Black Theme
  const moodCategories = [
    {
      id: 'energetic',
      name: 'Energetic',
      icon: <Zap size={20} />,
      color: 'from-red-500 to-red-700',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-200'
    },
    {
      id: 'chill',
      name: 'Chill',
      icon: <Coffee size={20} />,
      color: 'from-gray-600 to-gray-800',
      bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
      borderColor: 'border-gray-200'
    },
    {
      id: 'creative',
      name: 'Creative',
      icon: <Palette size={20} />,
      color: 'from-red-600 to-red-800',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-200'
    },
    {
      id: 'social',
      name: 'Social',
      icon: <Users size={20} />,
      color: 'from-gray-700 to-black',
      bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
      borderColor: 'border-gray-200'
    },
    {
      id: 'intellectual',
      name: 'Intellectual',
      icon: <Brain size={20} />,
      color: 'from-red-500 to-red-700',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-200'
    },
    {
      id: 'competitive',
      name: 'Competitive',
      icon: <Target size={20} />,
      color: 'from-red-600 to-red-800',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-200'
    }
  ];

  const tabs = [
    { id: 'mood', name: 'Mood Match', icon: <Brain size={20} />, color: 'red' },
    { id: 'trending', name: 'Trending', icon: <TrendingUp size={20} />, color: 'red' },
    { id: 'nearby', name: 'Nearby', icon: <MapPin size={20} />, color: 'gray' },
    { id: 'forYou', name: 'For You', icon: <Sparkles size={20} />, color: 'red' }
  ];

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    // Mock events data with enhanced details
    const mockEvents = [
      {
        id: 1,
        title: "Neon Nights: Electronic Music Festival",
        description: "Experience the future of electronic music with world-class DJs and immersive light shows",
        date: "2024-06-15",
        time: "20:00",
        location: "Electric Park, London",
        category: "music",
        mood: "energetic",
        subMood: "party",
        intensity: 90,
        price: "£45",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        organizer: "Electric Events",
        attendees: 2500,
        maxAttendees: 5000,
        rating: 4.8,
        reviews: 324,
        tags: ["electronic", "dance", "festival", "nightlife"],
        perks: ["Free drink voucher", "VIP queue skip", "Exclusive merchandise"],
        matchScore: 95,
        isTrending: true,
        isNearby: true,
        distance: "2.3 km"
      },
      {
        id: 2,
        title: "Sunset Jazz & Wine Tasting",
        description: "Unwind with smooth jazz melodies and premium wine selections in a cozy rooftop setting",
        date: "2024-06-20",
        time: "18:30",
        location: "Sky Lounge, London",
        category: "music",
        mood: "chill",
        subMood: "romantic",
        intensity: 25,
        price: "£35",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        organizer: "Jazz Collective",
        attendees: 120,
        maxAttendees: 200,
        rating: 4.9,
        reviews: 89,
        tags: ["jazz", "wine", "rooftop", "sunset"],
        perks: ["Welcome drink", "Wine tasting flight", "Jazz CD"],
        matchScore: 88,
        isTrending: false,
        isNearby: true,
        distance: "1.8 km"
      },
      {
        id: 3,
        title: "Digital Art Exhibition: Future Visions",
        description: "Explore cutting-edge digital art installations and meet the artists behind tomorrow's masterpieces",
        date: "2024-06-25",
        time: "10:00",
        location: "Modern Art Gallery, London",
        category: "art",
        mood: "creative",
        subMood: "artistic",
        intensity: 70,
        price: "£20",
        image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        organizer: "Art Forward",
        attendees: 450,
        maxAttendees: 800,
        rating: 4.7,
        reviews: 156,
        tags: ["digital art", "exhibition", "technology", "innovation"],
        perks: ["Artist meet & greet", "Exhibition catalog", "VR experience"],
        matchScore: 82,
        isTrending: true,
        isNearby: false,
        distance: "5.2 km"
      },
      {
        id: 4,
        title: "Champions League Final Viewing Party",
        description: "Watch the biggest match of the year with fellow football fans in an electric atmosphere",
        date: "2024-06-01",
        time: "19:45",
        location: "Sports Bar & Grill, London",
        category: "sports",
        mood: "competitive",
        subMood: "sports",
        intensity: 85,
        price: "£15",
        image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        organizer: "Football Fanatics",
        attendees: 180,
        maxAttendees: 300,
        rating: 4.6,
        reviews: 203,
        tags: ["football", "champions league", "sports bar", "viewing party"],
        perks: ["Free beer", "Match predictions", "Team merchandise"],
        matchScore: 91,
        isTrending: true,
        isNearby: true,
        distance: "0.8 km"
      },
      {
        id: 5,
        title: "Mindfulness & Meditation Workshop",
        description: "Find inner peace and learn powerful meditation techniques in a serene environment",
        date: "2024-06-18",
        time: "14:00",
        location: "Zen Center, London",
        category: "wellness",
        mood: "chill",
        subMood: "relax",
        intensity: 15,
        price: "£25",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        organizer: "Zen Masters",
        attendees: 35,
        maxAttendees: 50,
        rating: 4.9,
        reviews: 67,
        tags: ["meditation", "wellness", "mindfulness", "peace"],
        perks: ["Meditation guide", "Herbal tea", "Take-home exercises"],
        matchScore: 76,
        isTrending: false,
        isNearby: false,
        distance: "3.7 km"
      },
      {
        id: 6,
        title: "Tech Innovation Summit 2024",
        description: "Discover the latest in AI, blockchain, and emerging technologies with industry leaders",
        date: "2024-06-30",
        time: "09:00",
        location: "Convention Center, London",
        category: "technology",
        mood: "intellectual",
        subMood: "innovation",
        intensity: 75,
        price: "£120",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        organizer: "Tech Forward",
        attendees: 1200,
        maxAttendees: 2000,
        rating: 4.8,
        reviews: 445,
        tags: ["technology", "AI", "innovation", "networking"],
        perks: ["VIP networking", "Exclusive demos", "Conference materials"],
        matchScore: 89,
        isTrending: true,
        isNearby: false,
        distance: "8.1 km"
      }
    ];

    setEvents(mockEvents);
    setFilteredEvents(mockEvents);
  }, []);

  const handleMoodSelection = async (mood) => {
    setSelectedMood(mood);
    setIsAnalyzing(true);
    
    // Animate the mood selection
    await controls.start({
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.6 }
    });

    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      // Filter events based on mood
      const moodEvents = events.filter(event => 
        event.mood === mood.id
      );
      setFilteredEvents(moodEvents.length > 0 ? moodEvents : events);
    }, 1500);
  };

  const getMatchColor = (score) => {
    if (score >= 90) return 'text-red-600 bg-red-100';
    if (score >= 80) return 'text-red-500 bg-red-50';
    if (score >= 70) return 'text-gray-600 bg-gray-100';
    return 'text-gray-500 bg-gray-50';
  };

  const getIntensityColor = (intensity) => {
    if (intensity >= 80) return 'text-red-600';
    if (intensity >= 60) return 'text-red-500';
    if (intensity >= 40) return 'text-gray-600';
    return 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Enhanced Header with Glassmorphism */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-16 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200/50"
      >
        <div className="p-4">
          {/* Search Bar with Advanced Styling */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative mb-4"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search events, venues, or artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-16 py-4 border-0 rounded-2xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-red-500/50 focus:bg-white/90 transition-all duration-300 shadow-lg"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
                <Search size={16} />
              </button>
            </div>
          </motion.div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-red-500 text-white' : 'bg-white/70 text-gray-600'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-red-500 text-white' : 'bg-white/70 text-gray-600'
                }`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'map' ? 'bg-red-500 text-white' : 'bg-white/70 text-gray-600'
                }`}
              >
                <Map size={18} />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white/90 transition-all"
            >
              <Filter size={18} />
              Filters
              {selectedFilters.length > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {selectedFilters.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs with Enhanced Styling */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="px-4">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-500 text-white shadow-lg`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab.icon}
                <span className="text-sm">{tab.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {/* Mood Match Tab */}
          {activeTab === 'mood' && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Mood Selection Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl mb-3"
                >
                  <Brain size={18} />
                  <span className="font-medium text-sm">AI Mood Matcher</span>
                </motion.div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">How are you feeling?</h2>
                <p className="text-gray-600 text-sm">Select your mood for personalized events</p>
              </div>

              {/* Compact Mood Categories Grid */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {moodCategories.map((mood, index) => (
                  <motion.button
                    key={mood.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleMoodSelection(mood)}
                    className={`${mood.bgColor} ${mood.borderColor} border rounded-xl p-3 cursor-pointer hover:shadow-md transition-all duration-300 flex flex-col items-center gap-2`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${mood.color} text-white`}>
                      {mood.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-900 text-center">{mood.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* AI Analysis Animation */}
              <AnimatePresence>
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                  >
                    <motion.div
                      animate={controls}
                      className="bg-white rounded-2xl p-8 text-center shadow-2xl"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <Brain size={32} className="text-white" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing your mood...</h3>
                      <p className="text-gray-600">Finding the perfect events for you</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Events Display */}
          {(activeTab === 'trending' || activeTab === 'nearby' || activeTab === 'forYou' || selectedMood) && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedMood ? `Perfect matches for ${selectedMood.name}` : 
                     activeTab === 'trending' ? 'Trending Events' :
                     activeTab === 'nearby' ? 'Events Near You' : 'Recommended for You'}
                  </h2>
                  <p className="text-gray-600">
                    {filteredEvents.length} events found
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select className="px-3 py-2 border border-gray-200 rounded-lg bg-white">
                    <option>Relevance</option>
                    <option>Date</option>
                    <option>Distance</option>
                    <option>Price</option>
                  </select>
                </div>
              </div>

              {/* Events Grid */}
              <div className={`grid gap-6 ${
                viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
              }`}>
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                    whileHover={{ y: -5 }}
                  >
                    {/* Event Image with Overlay */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Event Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {event.isTrending && (
                          <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                            <TrendingUp size={12} />
                            Trending
                          </span>
                        )}
                        {event.isNearby && (
                          <span className="px-3 py-1 bg-gray-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                            <MapPin size={12} />
                            {event.distance}
                          </span>
                        )}
                      </div>

                      {/* Match Score */}
                      {selectedMood && (
                        <div className="absolute top-4 right-4">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${getMatchColor(event.matchScore)}`}>
                            {event.matchScore}% match
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                        >
                          <Heart size={16} className="text-white" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                        >
                          <Share2 size={16} className="text-white" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                            {event.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            {event.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-red-600">{event.price}</div>
                        </div>
                      </div>

                      {/* Event Meta */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                          <Clock size={14} />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users size={14} />
                          <span>{event.attendees.toLocaleString()} / {event.maxAttendees.toLocaleString()} attending</span>
                        </div>
                      </div>

                      {/* Rating and Reviews */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < Math.floor(event.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {event.rating} ({event.reviews} reviews)
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {event.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Perks */}
                      {event.perks.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Gift size={14} className="text-red-600" />
                            <span className="text-sm font-medium text-gray-900">Perks included:</span>
                          </div>
                          <div className="space-y-1">
                            {event.perks.slice(0, 2).map((perk, index) => (
                              <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                {perk}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <span>Get Tickets</span>
                        <ArrowRight size={16} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EventDiscoveryPremium;
