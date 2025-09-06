import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Map, List, MapPin, Calendar, Clock, 
  Users, Star, Heart, Zap, Crown, Music, Trophy, 
  ChevronDown, ChevronUp, Eye, Share2, Ticket, Sparkles,
  Brain, TrendingUp, Target, Compass, Lightbulb, ThumbsUp,
  Coffee, Moon, Sun, Cloud, Wind, Flame, Droplets, Snowflake
} from 'lucide-react';

const EventDiscoveryAI = () => {
  const [activeTab, setActiveTab] = useState('mood');
  const [currentMood, setCurrentMood] = useState(null);
  const [userPreferences, setUserPreferences] = useState({});
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const tabs = [
    { id: 'mood', name: 'Mood Match', icon: <Brain size={20} /> },
    { id: 'trending', name: 'Trending', icon: <TrendingUp size={20} /> },
    { id: 'nearby', name: 'Nearby', icon: <MapPin size={20} /> },
    { id: 'personalized', name: 'For You', icon: <Target size={20} /> }
  ];

  const moods = [
    { 
      id: 'energetic', 
      name: 'Energetic', 
      icon: <Zap size={24} />, 
      color: 'from-yellow-400 to-orange-500',
      description: 'High-energy events, parties, sports',
      keywords: ['party', 'dance', 'sports', 'fitness', 'adventure']
    },
    { 
      id: 'chill', 
      name: 'Chill', 
      icon: <Coffee size={24} />, 
      color: 'from-blue-400 to-purple-500',
      description: 'Relaxed vibes, cafes, lounges',
      keywords: ['cafe', 'lounge', 'jazz', 'wine', 'art']
    },
    { 
      id: 'social', 
      name: 'Social', 
      icon: <Users size={24} />, 
      color: 'from-green-400 to-teal-500',
      description: 'Networking, meetups, group activities',
      keywords: ['networking', 'meetup', 'social', 'community', 'workshop']
    },
    { 
      id: 'romantic', 
      name: 'Romantic', 
      icon: <Heart size={24} />, 
      color: 'from-pink-400 to-red-500',
      description: 'Date nights, intimate venues',
      keywords: ['romantic', 'dinner', 'wine', 'intimate', 'couples']
    },
    { 
      id: 'creative', 
      name: 'Creative', 
      icon: <Lightbulb size={24} />, 
      color: 'from-purple-400 to-pink-500',
      description: 'Art, music, cultural events',
      keywords: ['art', 'music', 'culture', 'creative', 'exhibition']
    },
    { 
      id: 'adventurous', 
      name: 'Adventurous', 
      icon: <Compass size={24} />, 
      color: 'from-orange-400 to-red-500',
      description: 'Outdoor, extreme, new experiences',
      keywords: ['outdoor', 'adventure', 'extreme', 'explore', 'travel']
    }
  ];

  const weatherMoods = [
    { id: 'sunny', name: 'Sunny', icon: <Sun size={20} />, color: 'text-yellow-500' },
    { id: 'rainy', name: 'Rainy', icon: <Droplets size={20} />, color: 'text-blue-500' },
    { id: 'cloudy', name: 'Cloudy', icon: <Cloud size={20} />, color: 'text-gray-500' },
    { id: 'night', name: 'Night', icon: <Moon size={20} />, color: 'text-purple-500' }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: <Calendar size={16} />, color: 'gray' },
    { id: 'nightlife', name: 'Nightlife', icon: <Music size={16} />, color: 'purple' },
    { id: 'sports', name: 'Sports', icon: <Trophy size={16} />, color: 'blue' },
    { id: 'culture', name: 'Culture', icon: <Star size={16} />, color: 'pink' },
    { id: 'food', name: 'Food & Drink', icon: <Coffee size={16} />, color: 'orange' },
    { id: 'outdoor', name: 'Outdoor', icon: <Compass size={16} />, color: 'green' }
  ];

  const [events, setEvents] = useState([]);
  const [userHistory, setUserHistory] = useState([]);

  useEffect(() => {
    // Mock events data with enhanced metadata
    const mockEvents = [
      {
        id: 1,
        title: "Sunset Rooftop Party",
        description: "Dance under the stars with premium cocktails and city views",
        category: 'nightlife',
        date: '2024-06-01',
        time: '19:00',
        venue: 'Sky Lounge',
        city: 'London',
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        price: '£25',
        attendees: 150,
        capacity: 200,
        rating: 4.8,
        mood: ['energetic', 'social', 'romantic'],
        weather: ['sunny', 'night'],
        tags: ['rooftop', 'cocktails', 'dancing', 'sunset'],
        energy: 'high',
        social: 'high',
        intimacy: 'medium',
        novelty: 'medium',
        isRecommended: true,
        recommendationScore: 95,
        reason: 'Matches your energetic mood and love for nightlife'
      },
      {
        id: 2,
        title: "Jazz & Wine Evening",
        description: "Intimate jazz performance with curated wine selection",
        category: 'culture',
        date: '2024-06-02',
        time: '20:00',
        venue: 'Blue Note Jazz Club',
        city: 'London',
        image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        price: '£35',
        attendees: 80,
        capacity: 100,
        rating: 4.9,
        mood: ['chill', 'romantic', 'creative'],
        weather: ['rainy', 'night'],
        tags: ['jazz', 'wine', 'intimate', 'live music'],
        energy: 'low',
        social: 'medium',
        intimacy: 'high',
        novelty: 'low',
        isRecommended: true,
        recommendationScore: 88,
        reason: 'Perfect for a chill evening with your partner'
      },
      {
        id: 3,
        title: "Tech Networking Mixer",
        description: "Connect with fellow tech professionals and entrepreneurs",
        category: 'culture',
        date: '2024-06-03',
        time: '18:30',
        venue: 'The Shard',
        city: 'London',
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        price: '£15',
        attendees: 120,
        capacity: 150,
        rating: 4.6,
        mood: ['social', 'creative'],
        weather: ['cloudy'],
        tags: ['networking', 'tech', 'professional', 'startups'],
        energy: 'medium',
        social: 'high',
        intimacy: 'low',
        novelty: 'medium',
        isRecommended: false,
        recommendationScore: 72,
        reason: 'Great for expanding your professional network'
      },
      {
        id: 4,
        title: "Adventure Park Challenge",
        description: "Extreme obstacle course with zip-lining and climbing",
        category: 'outdoor',
        date: '2024-06-04',
        time: '10:00',
        venue: 'Adventure Park London',
        city: 'London',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        price: '£45',
        attendees: 60,
        capacity: 80,
        rating: 4.7,
        mood: ['adventurous', 'energetic'],
        weather: ['sunny'],
        tags: ['adventure', 'outdoor', 'extreme', 'challenge'],
        energy: 'high',
        social: 'medium',
        intimacy: 'low',
        novelty: 'high',
        isRecommended: true,
        recommendationScore: 91,
        reason: 'Perfect match for your adventurous spirit!'
      },
      {
        id: 5,
        title: "Art Gallery Opening",
        description: "Contemporary art exhibition with artist meet & greet",
        category: 'culture',
        date: '2024-06-05',
        time: '19:30',
        venue: 'Tate Modern',
        city: 'London',
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        price: 'Free',
        attendees: 200,
        capacity: 300,
        rating: 4.5,
        mood: ['creative', 'social', 'chill'],
        weather: ['cloudy', 'night'],
        tags: ['art', 'exhibition', 'culture', 'contemporary'],
        energy: 'low',
        social: 'medium',
        intimacy: 'medium',
        novelty: 'high',
        isRecommended: false,
        recommendationScore: 65,
        reason: 'Cultural enrichment opportunity'
      }
    ];

    setEvents(mockEvents);
    
    // Mock user history for personalization
    const mockHistory = [
      { eventId: 1, rating: 5, mood: 'energetic', date: '2024-05-20' },
      { eventId: 2, rating: 4, mood: 'chill', date: '2024-05-18' },
      { eventId: 3, rating: 3, mood: 'social', date: '2024-05-15' }
    ];
    setUserHistory(mockHistory);
  }, []);

  const analyzeMood = (mood) => {
    setIsAnalyzing(true);
    setCurrentMood(mood);
    
    // Simulate AI analysis
    setTimeout(() => {
      const recommendations = events.filter(event => 
        event.mood.includes(mood.id) && event.recommendationScore > 70
      ).sort((a, b) => b.recommendationScore - a.recommendationScore);
      
      setRecommendedEvents(recommendations);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getPersonalizedRecommendations = () => {
    // AI-powered personalization based on user history
    const userPreferences = analyzeUserHistory();
    const recommendations = events
      .map(event => ({
        ...event,
        personalScore: calculatePersonalScore(event, userPreferences)
      }))
      .filter(event => event.personalScore > 60)
      .sort((a, b) => b.personalScore - a.personalScore);
    
    setRecommendedEvents(recommendations);
  };

  const analyzeUserHistory = () => {
    const preferences = {
      categories: {},
      moods: {},
      energy: 0,
      social: 0,
      intimacy: 0,
      novelty: 0
    };

    userHistory.forEach(history => {
      const event = events.find(e => e.id === history.eventId);
      if (event) {
        preferences.categories[event.category] = (preferences.categories[event.category] || 0) + history.rating;
        preferences.moods[history.mood] = (preferences.moods[history.mood] || 0) + history.rating;
        preferences.energy += event.energy === 'high' ? history.rating : 0;
        preferences.social += event.social === 'high' ? history.rating : 0;
        preferences.intimacy += event.intimacy === 'high' ? history.rating : 0;
        preferences.novelty += event.novelty === 'high' ? history.rating : 0;
      }
    });

    return preferences;
  };

  const calculatePersonalScore = (event, preferences) => {
    let score = 0;
    
    // Category preference
    score += (preferences.categories[event.category] || 0) * 10;
    
    // Mood matching
    event.mood.forEach(mood => {
      score += (preferences.moods[mood] || 0) * 5;
    });
    
    // Energy level matching
    if (event.energy === 'high' && preferences.energy > 10) score += 20;
    if (event.energy === 'low' && preferences.energy < 10) score += 20;
    
    // Social preference
    if (event.social === 'high' && preferences.social > 10) score += 15;
    if (event.social === 'low' && preferences.social < 10) score += 15;
    
    // Novelty preference
    if (event.novelty === 'high' && preferences.novelty > 10) score += 10;
    
    return Math.min(score, 100);
  };

  const filteredEvents = recommendedEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getMoodColor = (moodId) => {
    const mood = moods.find(m => m.id === moodId);
    return mood ? mood.color : 'from-gray-400 to-gray-500';
  };

  const getRecommendationReason = (event) => {
    if (event.reason) return event.reason;
    if (event.personalScore > 80) return 'Highly personalized for you';
    if (event.rating > 4.5) return 'Highly rated by the community';
    return 'Matches your preferences';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-16 z-40">
        <div className="p-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search events, venues, or experiences..."
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="px-4">
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span className="text-sm">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
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
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">How are you feeling today?</h2>
                <p className="text-gray-600">Tell us your mood and we'll find the perfect events for you</p>
              </div>

              {/* Mood Selector */}
              <div className="grid grid-cols-2 gap-4">
                {moods.map((mood) => (
                  <motion.button
                    key={mood.id}
                    onClick={() => analyzeMood(mood)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-6 rounded-2xl text-white overflow-hidden ${
                      currentMood?.id === mood.id ? 'ring-4 ring-red-500 ring-opacity-50' : ''
                    }`}
                    style={{
                      background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                      '--tw-gradient-from': mood.color.split(' ')[0],
                      '--tw-gradient-to': mood.color.split(' ')[2]
                    }}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-center mb-3">
                        {mood.icon}
                      </div>
                      <h3 className="text-lg font-bold mb-1">{mood.name}</h3>
                      <p className="text-sm opacity-90">{mood.description}</p>
                    </div>
                    <div className="absolute inset-0 bg-black/10"></div>
                  </motion.button>
                ))}
              </div>

              {/* AI Analysis */}
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 text-center"
                >
                  <div className="flex items-center justify-center mb-4">
                    <Brain className="w-8 h-8 text-red-600 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">AI is analyzing your mood...</h3>
                  <p className="text-gray-600">Finding the perfect events that match your {currentMood?.name.toLowerCase()} vibe</p>
                  <div className="mt-4 flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                  </div>
                </motion.div>
              )}

              {/* Recommendations */}
              {currentMood && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">
                      Perfect for your {currentMood.name.toLowerCase()} mood
                    </h3>
                    <span className="text-sm text-gray-600">{filteredEvents.length} matches</span>
                  </div>

                  {filteredEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-red-100 hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                              AI MATCH
                            </span>
                            <span className="px-2 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded-full">
                              {event.recommendationScore}% match
                            </span>
                          </div>
                        </div>
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-white">
                            <Star size={14} className="text-yellow-400" />
                            <span className="text-sm font-medium">{event.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
                            <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                          </div>
                          <span className="text-lg font-bold text-red-600 ml-2">{event.price}</span>
                        </div>

                        {/* AI Recommendation Reason */}
                        <div className="bg-red-50 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={14} className="text-red-600" />
                            <span className="text-sm font-medium text-red-800">Why we recommend this:</span>
                          </div>
                          <p className="text-sm text-red-700">{getRecommendationReason(event)}</p>
                        </div>

                        {/* Event Details */}
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

                        {/* Mood Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {event.mood.map((moodId) => (
                            <span
                              key={moodId}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {moods.find(m => m.id === moodId)?.name}
                            </span>
                          ))}
                        </div>

                        {/* Actions */}
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
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Trending Tab */}
          {activeTab === 'trending' && (
            <motion.div
              key="trending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Trending Now</h2>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-red-600" />
                  <span className="text-sm text-gray-600">Live trends</span>
                </div>
              </div>

              {events.filter(e => e.rating > 4.5).map((event) => (
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
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                        TRENDING
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                      </div>
                      <span className="text-lg font-bold text-red-600 ml-2">{event.price}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        {event.attendees} attending
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500" />
                        {event.rating}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                        <Ticket size={16} />
                        Get Tickets
                      </button>
                      <button className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Nearby Tab */}
          {activeTab === 'nearby' && (
            <motion.div
              key="nearby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Near You</h2>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-red-600" />
                  <span className="text-sm text-gray-600">London, UK</span>
                </div>
              </div>

              {events.map((event) => (
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
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-white">
                        <MapPin size={14} />
                        <span className="text-sm font-medium">2.3 km</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                      </div>
                      <span className="text-lg font-bold text-red-600 ml-2">{event.price}</span>
                    </div>

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

                    <div className="flex gap-2">
                      <button className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                        <Ticket size={16} />
                        Get Tickets
                      </button>
                      <button className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Personalized Tab */}
          {activeTab === 'personalized' && (
            <motion.div
              key="personalized"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">For You</h2>
                <button
                  onClick={getPersonalizedRecommendations}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  <Brain size={16} />
                  Refresh
                </button>
              </div>

              {events.filter(e => e.isRecommended).map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-red-100 hover:shadow-md transition-all duration-300"
                >
                  <div className="relative">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                        PERSONALIZED
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                      </div>
                      <span className="text-lg font-bold text-red-600 ml-2">{event.price}</span>
                    </div>

                    <div className="bg-red-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Target size={14} className="text-red-600" />
                        <span className="text-sm font-medium text-red-800">Personalized for you:</span>
                      </div>
                      <p className="text-sm text-red-700">{event.reason}</p>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                        <Ticket size={16} />
                        Get Tickets
                      </button>
                      <button className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EventDiscoveryAI;
