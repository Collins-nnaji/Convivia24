import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, MapPin, Calendar, Clock, 
  Heart, MessageCircle, Star, 
  Filter, Search, ChevronDown, 
  ArrowRight, Users2, Globe, 
  Coffee, Book, Music, Camera, 
  Utensils, Mountain, Gamepad, 
  Palette, Dumbbell, Plane,
  MessageSquare, UserPlus, ThumbsUp,
  Clock3, Zap, X, Briefcase,
  GraduationCap, Languages, Sparkles,
  CheckCircle
} from 'lucide-react';

const Experiences = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleItems, setVisibleItems] = useState(6);
  const [activeTab, setActiveTab] = useState('suggested');
  const [ageRange, setAgeRange] = useState([18, 60]);
  const [activeHotspot, setActiveHotspot] = useState('all');

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
  }, []);

  const interests = [
    { id: 'all', name: 'All Interests', icon: <Globe size={24} /> },
    { id: 'food', name: 'Food & Drinks', icon: <Utensils size={24} /> },
    { id: 'culture', name: 'Arts & Culture', icon: <Palette size={24} /> },
    { id: 'fitness', name: 'Fitness & Sports', icon: <Dumbbell size={24} /> },
    { id: 'travel', name: 'Travel', icon: <Plane size={24} /> },
    { id: 'books', name: 'Books & Reading', icon: <Book size={24} /> },
    { id: 'music', name: 'Music', icon: <Music size={24} /> },
    { id: 'photography', name: 'Photography', icon: <Camera size={24} /> },
    { id: 'outdoor', name: 'Outdoors', icon: <Mountain size={24} /> },
    { id: 'gaming', name: 'Gaming', icon: <Gamepad size={24} /> },
    { id: 'social', name: 'Coffee Chats', icon: <Coffee size={24} /> }
  ];

  const hotspots = [
    { id: 'all', name: 'All Locations' },
    { id: 'brew', name: 'The Brew Café' },
    { id: 'highland', name: 'Highland Trekkers Club' },
    { id: 'jazz', name: 'Jazz Corner' },
    { id: 'victoria', name: 'Victoria Island Bistro' },
    { id: 'green', name: 'Green Juice Bar' },
    { id: 'brick', name: 'Brick Lane Gallery' },
    { id: 'southbank', name: 'Southbank Centre' }
  ];

  const people = [
    {
      id: 1,
      name: 'Sarah Thompson',
      username: '@sarah_t',
      interests: ['food', 'photography', 'travel'],
      bio: 'Food lover and amateur photographer. Always looking for new cuisine adventures and interesting people to chat with!',
      location: 'Lagos, Nigeria',
      status: 'Online now',
      activeHotspots: ['The Brew Café', 'Victoria Island Bistro'],
      compatibility: 92,
      lastActive: '2 minutes ago',
      connections: 143,
      occupation: 'Food Photographer',
      education: 'University of Lagos',
      languages: ['English', 'Yoruba'],
      tags: ['Foodie', 'Photography', 'Travel'],
      verified: true,
      age: 28,
      joinDate: 'January 2023'
    },
    {
      id: 2,
      name: 'James Wilson',
      username: '@jwilson',
      interests: ['photography', 'outdoor', 'culture'],
      bio: 'Street photographer with a passion for urban exploration. Let\'s connect and maybe explore the city together!',
      location: 'London, UK',
      status: 'Active today',
      activeHotspots: ['Brick Lane Gallery', 'Southbank Centre'],
      compatibility: 85,
      lastActive: '1 hour ago',
      connections: 89,
      occupation: 'Graphic Designer',
      education: 'Central Saint Martins',
      languages: ['English', 'Spanish'],
      tags: ['Photography', 'Art', 'Hiking'],
      verified: true,
      age: 31,
      joinDate: 'March 2023'
    },
    {
      id: 3,
      name: 'Priya Patel',
      username: '@priya_om',
      interests: ['fitness', 'outdoor', 'food'],
      bio: 'Yoga instructor and wellness enthusiast. Love connecting with positive, health-conscious people!',
      location: 'Lagos, Nigeria',
      status: 'Online now',
      activeHotspots: ['Green Juice Bar', 'Highland Trekkers Club'],
      compatibility: 78,
      lastActive: 'Just now',
      connections: 215,
      occupation: 'Yoga Instructor',
      education: 'Wellness Academy',
      languages: ['English', 'Hindi', 'Gujarati'],
      tags: ['Fitness', 'Wellness', 'Vegan'],
      verified: true,
      age: 30,
      joinDate: 'November 2022'
    },
    {
      id: 4,
      name: 'Chinwe Okonkwo',
      username: '@chinwe_reads',
      interests: ['books', 'culture', 'coffee'],
      bio: 'Avid reader and literary critic. Currently obsessed with contemporary African literature. Always up for book discussions!',
      location: 'London, UK',
      status: 'Last seen 2h ago',
      activeHotspots: ['Readers Bookshop', 'The Brew Café'],
      compatibility: 88,
      lastActive: '2 hours ago',
      connections: 67,
      occupation: 'Literary Editor',
      education: 'University of London',
      languages: ['English', 'Igbo', 'French'],
      tags: ['Books', 'Writing', 'Culture'],
      verified: true,
      age: 34,
      joinDate: 'August 2022'
    },
    {
      id: 5,
      name: 'Mike Johnson',
      username: '@mike_trek',
      interests: ['outdoor', 'fitness', 'travel'],
      bio: 'Adventure enthusiast and nature lover. If it involves mountains, count me in! Looking for hiking buddies.',
      location: 'Lagos, Nigeria',
      status: 'Online now',
      activeHotspots: ['Highland Trekkers Club', 'Green Juice Bar'],
      compatibility: 72,
      lastActive: '5 minutes ago',
      connections: 172,
      occupation: 'Adventure Tour Guide',
      education: 'University of Adventure',
      languages: ['English', 'Hausa'],
      tags: ['Hiking', 'Adventure', 'Fitness'],
      verified: false,
      age: 32,
      joinDate: 'February 2023'
    },
    {
      id: 6,
      name: 'David Ahmed',
      username: '@dave_music',
      interests: ['music', 'culture', 'social'],
      bio: 'Music producer and vinyl collector. Always hunting for new sounds and interesting conversations about music.',
      location: 'London, UK',
      status: 'Active today',
      activeHotspots: ['Jazz Corner', 'Vinyl Records Store'],
      compatibility: 65,
      lastActive: '3 hours ago',
      connections: 124,
      occupation: 'Music Producer',
      education: 'Royal Academy of Music',
      languages: ['English', 'Arabic'],
      tags: ['Music', 'Production', 'Vinyl'],
      verified: true,
      age: 36,
      joinDate: 'May 2023'
    },
    {
      id: 7,
      name: 'Amara Okafor',
      username: '@amaracooks',
      interests: ['food', 'culture', 'social'],
      bio: 'Chef and culinary explorer. Love discussing food traditions and sharing recipes from around the world.',
      location: 'Lagos, Nigeria',
      status: 'Last seen 1h ago',
      activeHotspots: ['The Brew Café', 'Victoria Island Bistro'],
      compatibility: 80,
      lastActive: '1 hour ago',
      connections: 93,
      occupation: 'Professional Chef',
      education: 'Culinary Institute',
      languages: ['English', 'Igbo', 'French'],
      tags: ['Cooking', 'Food', 'Culture'],
      verified: true,
      age: 29,
      joinDate: 'April 2023'
    },
    {
      id: 8,
      name: 'Tom Richards',
      username: '@tom_games',
      interests: ['gaming', 'tech', 'social'],
      bio: 'Gamer and tech enthusiast. From board games to eSports, I\'m always up for gaming conversations and meetups.',
      location: 'London, UK',
      status: 'Online now',
      activeHotspots: ['Game Zone', 'The Brew Café'],
      compatibility: 70,
      lastActive: 'Just now',
      connections: 156,
      occupation: 'Software Developer',
      education: 'Imperial College London',
      languages: ['English', 'Java', 'Python'],
      tags: ['Gaming', 'Tech', 'eSports'],
      verified: false,
      age: 27,
      joinDate: 'June 2023'
    }
  ];

  const filteredPeople = useMemo(() => {
    return people.filter(person => {
      const matchesSearch = 
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = 
        selectedCategory === 'all' || 
        person.interests.includes(selectedCategory);
      
      const matchesLocation = 
        !location || 
        person.location.toLowerCase().includes(location.toLowerCase());
      
      const matchesHotspot =
        activeHotspot === 'all' ||
        person.activeHotspots.some(hotspot => hotspot.includes(hotspots.find(h => h.id === activeHotspot)?.name || ''));
      
      const matchesAge =
        person.age >= ageRange[0] && person.age <= ageRange[1];
      
      return matchesSearch && matchesCategory && matchesLocation && matchesHotspot && matchesAge;
    }).sort((a, b) => {
      if (activeTab === 'suggested') {
        return b.compatibility - a.compatibility;
      } else if (activeTab === 'new') {
        return new Date(b.joinDate) - new Date(a.joinDate);
      } else if (activeTab === 'active') {
        if (a.status.includes('Online') && !b.status.includes('Online')) return -1;
        if (!a.status.includes('Online') && b.status.includes('Online')) return 1;
        return 0;
      }
      return 0;
    });
  }, [searchQuery, selectedCategory, location, activeHotspot, ageRange, people, activeTab, hotspots]);

  function getInitials(name) {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }

  function getStatusColor(status) {
    if (status.includes('Online')) return 'bg-green-500';
    if (status.includes('Active')) return 'bg-yellow-500';
    return 'bg-gray-400';
  }

  function getRandomGradient(id) {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-500',
      'from-yellow-400 to-orange-500',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-blue-500',
      'from-red-500 to-pink-500',
      'from-purple-500 to-indigo-500',
      'from-teal-400 to-blue-500',
    ];
    return gradients[id % gradients.length];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-300">Connect With People</h1>
          <p className="text-xl text-gray-300">Chat with like-minded individuals and meet up at popular hotspots around your city</p>
        </div>

        {/* Tabs Section */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden mb-8 border border-gray-700">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('suggested')}
              className={`flex-1 py-4 px-4 text-sm font-medium ${
                activeTab === 'suggested'
                  ? 'text-red-500 border-b-2 border-red-500 bg-gray-800/60'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/60'
              }`}
            >
              <Sparkles size={18} className="inline mr-2" />
              Suggested for You
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-4 px-4 text-sm font-medium ${
                activeTab === 'new'
                  ? 'text-red-500 border-b-2 border-red-500 bg-gray-800/60'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/60'
              }`}
            >
              <Zap size={18} className="inline mr-2" />
              New People
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-4 px-4 text-sm font-medium ${
                activeTab === 'active'
                  ? 'text-red-500 border-b-2 border-red-500 bg-gray-800/60'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/60'
              }`}
            >
              <Clock3 size={18} className="inline mr-2" />
              Currently Active
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Find people by interest, name, or bio..."
                className="w-full pl-10 pr-4 py-3 bg-gray-700/70 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Your city or location"
                className="w-full pl-10 pr-4 py-3 bg-gray-700/70 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-all"
              >
                <Filter size={18} className="mr-2" />
                Interests
              </button>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center justify-center px-4 py-3 bg-gray-700/70 border border-gray-600 rounded-lg hover:bg-gray-600 text-white"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Interest Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-700"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {interests.map((interest) => (
                    <button
                      key={interest.id}
                      onClick={() => setSelectedCategory(interest.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        selectedCategory === interest.id
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                          : 'bg-gray-700/70 text-gray-200 hover:bg-gray-600'
                      }`}
                    >
                      {interest.icon}
                      <span>{interest.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Active at Hotspot</label>
                    <select
                      value={activeHotspot}
                      onChange={(e) => setActiveHotspot(e.target.value)}
                      className="w-full p-3 bg-gray-700/70 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                    >
                      {hotspots.map(hotspot => (
                        <option key={hotspot.id} value={hotspot.id}>{hotspot.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Age Range: {ageRange[0]} - {ageRange[1]}</label>
                    <div className="px-2">
                      <input
                        type="range"
                        min="18"
                        max="60"
                        value={ageRange[0]}
                        onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])}
                        className="w-full accent-red-500"
                      />
                      <input
                        type="range"
                        min="18"
                        max="60"
                        value={ageRange[1]}
                        onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                        className="w-full accent-red-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-300 text-sm">
            Showing <span className="font-semibold text-white">{filteredPeople.length}</span> people matching your criteria
          </p>
          <div className="flex gap-2">
            <button className="text-sm text-red-400 hover:text-red-300">
              Save this search
            </button>
          </div>
        </div>

        {/* People Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeople.slice(0, visibleItems).map((person) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold bg-gradient-to-r ${getRandomGradient(person.id)}`}>
                        {getInitials(person.name)}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-gray-800 ${getStatusColor(person.status)}`}></div>
                      {person.verified && (
                        <div className="absolute top-0 right-0 bg-blue-500 text-white rounded-full p-0.5 shadow-lg">
                          <CheckCircle size={14} />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-white">{person.name}
                      {activeTab === 'suggested' && (
                        <span className="ml-2 text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full">
                          {person.compatibility}% Match
                        </span>
                      )}
                      </h3>
                      <p className="text-sm text-gray-400">{person.username}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {person.status === 'Online now' ? (
                          <span className="text-green-400 font-medium">{person.status}</span>
                        ) : (
                          person.status
                        )}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-red-400 transition-colors">
                    <Heart size={20} />
                  </button>
                </div>
                
                <p className="text-gray-300 mb-4 text-sm">{person.bio}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center text-gray-400">
                    <MapPin size={14} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{person.location}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Users2 size={14} className="mr-1 flex-shrink-0" />
                    <span>{person.connections} connections</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Briefcase size={14} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{person.occupation}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <GraduationCap size={14} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{person.education}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Active at hotspots:</p>
                  <div className="flex flex-wrap gap-2">
                    {person.activeHotspots.map((hotspot, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-red-900/30 text-red-300 rounded-full text-xs"
                      >
                        <MapPin size={12} className="mr-1" />
                        {hotspot}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {person.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between mt-4">
                  <button className="flex items-center gap-1 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg text-white transition-colors">
                    <MessageSquare size={16} />
                    Message
                  </button>
                  <button className="flex items-center gap-1 text-sm bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-white transition-colors">
                    <UserPlus size={16} />
                    Connect
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
        {filteredPeople.length > visibleItems && (
          <div className="text-center mt-8">
            <button
              onClick={() => setVisibleItems(prev => prev + 6)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
            >
              Show More People
            </button>
          </div>
        )}

        {/* Discover Hotspots Section */}
        <div className="mt-16 bg-gradient-to-r from-red-900 to-black rounded-2xl p-8 text-white border border-red-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="text-2xl font-bold mb-2">Want to meet in person?</h2>
              <p className="text-red-200">Discover popular hotspots where our community members hang out</p>
            </div>
            <button 
              onClick={() => navigate('/hotspots')}
              className="flex items-center gap-2 bg-white text-red-700 px-6 py-3 rounded-lg hover:bg-red-50 font-medium transition-colors shadow-lg"
            >
              <MapPin size={20} />
              Explore Hotspots
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="mt-16 bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Safety Tips for Meeting New People</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <CheckCircle size={18} className="text-red-400 mr-2 mt-1 flex-shrink-0" />
              <span>Always meet in public places like our featured hotspots</span>
            </li>
            <li className="flex items-start">
              <CheckCircle size={18} className="text-red-400 mr-2 mt-1 flex-shrink-0" />
              <span>Let friends or family know about your plans</span>
            </li>
            <li className="flex items-start">
              <CheckCircle size={18} className="text-red-400 mr-2 mt-1 flex-shrink-0" />
              <span>Start with video chats before meeting in person</span>
            </li>
            <li className="flex items-start">
              <CheckCircle size={18} className="text-red-400 mr-2 mt-1 flex-shrink-0" />
              <span>Trust your instincts and feel free to leave if uncomfortable</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Experiences; 