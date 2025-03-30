import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, ArrowRight, CheckCircle, Heart, 
  Users2, Sparkles, Search, Plus, BellRing, 
  Zap, Menu, User, X, MessageSquare, Globe,
  Filter, Calendar, Home, Map, Settings,
  Bell, UserPlus, ChevronRight, MessagesSquare
} from 'lucide-react';

// Import custom components
import ProfileCard from '../components/connect/ProfileCard';
import FilterPanel from '../components/connect/FilterPanel';
import TabsNavigator from '../components/connect/TabsNavigator';
import ConnectionsList from '../components/connect/ConnectionsList';
import ConnectionRequestModal from '../components/connect/ConnectionRequestModal';
import CommunityCard from '../components/connect/CommunityCard';

// Import mock data
import { 
  interests, hotspots, people, communities,
  connectionRequests, pendingRequests, activeConnections 
} from '../components/connect/MockData';

const Connect = () => {
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
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [openSearchBar, setOpenSearchBar] = useState(false);
  const [communityFilter, setCommunityFilter] = useState('all');
  
  // Added state for connection modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [notifications, setNotifications] = useState(3);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
  }, []);

  const handleConnect = (personId) => {
    const person = people.find(p => p.id === personId);
    setSelectedPerson(person);
    setIsModalOpen(true);
  };

  const handleJoinCommunity = (communityId) => {
    console.log(`Joining community with id: ${communityId}`);
    // Implementation would go here
  };

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
  }, [searchQuery, selectedCategory, location, activeHotspot, ageRange, activeTab]);

  const filteredCommunities = useMemo(() => {
    return communities.filter(community => {
      const matchesSearch = 
        !searchQuery ||
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        communityFilter === 'all' || 
        community.interests.includes(communityFilter);
      
      const matchesLocation = 
        !location || 
        community.location.toLowerCase().includes(location.toLowerCase());
      
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [searchQuery, communityFilter, location]);

  // Render appropriate content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'suggested':
      case 'new':
      case 'active':
        return (
          <>
            {/* Search and Filter Section (Mobile display only when opened) */}
            <AnimatePresence>
              {openSearchBar && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 lg:hidden"
                >
                  <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-full border border-white/10 p-1 shadow-sm">
                    <Search className="ml-3 text-red-500" size={18} />
                    <input
                      type="text"
                      placeholder="Search people, interests, locations..."
                      className="w-full py-2 px-3 bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button 
                      onClick={() => setOpenSearchBar(false)}
                      className="p-2 mr-1 rounded-full hover:bg-gray-800"
                    >
                      <X size={18} className="text-gray-400" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Desktop/Tablet Filter Panel - Hidden on mobile */}
            <div className="hidden lg:block mb-6">
              <FilterPanel 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                location={location}
                setLocation={setLocation}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                showAdvancedFilters={showAdvancedFilters}
                setShowAdvancedFilters={setShowAdvancedFilters}
                activeHotspot={activeHotspot}
                setActiveHotspot={setActiveHotspot}
                ageRange={ageRange}
                setAgeRange={setAgeRange}
                interests={interests}
                hotspots={hotspots}
              />
            </div>

            {/* Search Results Summary - Desktop Only */}
            <div className="hidden lg:flex justify-between items-center mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl shadow-sm border border-blue-100">
              <div className="flex items-center">
                <Users2 className="mr-2 text-red-500" size={20} />
                <p className="text-white text-sm">
                  <span className="font-semibold text-red-400">{filteredPeople.length}</span> people matching your criteria
                </p>
              </div>
              <div className="flex gap-2">
                <button className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors">
                  <Heart size={16} className="text-pink-500" />
                  Save search
                </button>
              </div>
            </div>

            {/* Quick Category Filters - Mobile Scrollable */}
            <div className="lg:hidden mb-4 overflow-x-auto scrollbar-hide whitespace-nowrap py-2 -mx-4 px-4">
              <button 
                onClick={() => setSelectedCategory('all')}
                className={`mr-2 px-4 py-1.5 rounded-full text-sm font-medium ${
                  selectedCategory === 'all' 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' 
                    : 'bg-black/30 text-white border border-white/10'
                }`}
              >
                All
              </button>
              {interests.map(interest => (
                <button 
                  key={interest.id}
                  onClick={() => setSelectedCategory(interest.id)}
                  className={`mr-2 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedCategory === interest.id
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' 
                      : 'bg-black/30 text-white border border-white/10'
                  }`}
                >
                  {interest.name}
                </button>
              ))}
            </div>

            {/* Mobile Actions Bar */}
            <div className="lg:hidden sticky top-20 z-30 flex justify-between items-center mb-4 bg-black/50 backdrop-blur-md shadow-md rounded-xl py-2 px-4 border border-white/10">
              <div className="flex items-center">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMobileNav(!showMobileNav)}
                  className="p-2 rounded-full hover:bg-gray-800 mr-2"
                >
                  <Menu size={20} className="text-gray-300" />
                </motion.button>
                <button
                  onClick={() => setOpenSearchBar(!openSearchBar)}
                  className="flex items-center gap-2 py-1.5 px-3 bg-gray-800 rounded-full text-sm text-gray-300"
                >
                  <Search size={16} className="text-gray-400" />
                  <span className="text-gray-400">Search</span>
                </button>
              </div>
              <div>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 rounded-full hover:bg-gray-800"
                >
                  <Filter size={20} className="text-gray-300" />
                </motion.button>
              </div>
            </div>

            {/* Mobile Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="lg:hidden mb-6"
                >
                  <div className="bg-black/50 backdrop-blur-md rounded-xl shadow-md p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-white">Filters</h3>
                      <button 
                        onClick={() => setShowFilters(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">Location</label>
                        <input
                          type="text"
                          placeholder="Enter city or country"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">Interests</label>
                        <div className="flex flex-wrap gap-2">
                          {interests.slice(0, 6).map(interest => (
                            <button 
                              key={interest.id}
                              onClick={() => setSelectedCategory(interest.id === selectedCategory ? 'all' : interest.id)}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                selectedCategory === interest.id
                                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' 
                                  : 'bg-gray-800 text-white border border-white/10'
                              }`}
                            >
                              {interest.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <button
                          onClick={() => {
                            setShowFilters(false);
                            setSearchQuery('');
                            setSelectedCategory('all');
                            setLocation('');
                          }}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* People Grid */}
            {filteredPeople.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {filteredPeople.slice(0, visibleItems).map(person => (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                    transition={{ duration: 0.4, delay: 0.1 * person.id % 10 }}
                  >
                    <ProfileCard 
                      person={person} 
                      onConnect={() => handleConnect(person.id)}
                      showSendMessage
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                className="bg-black/30 backdrop-blur-md rounded-xl shadow-sm p-8 text-center border border-white/10 mb-8"
              >
                <div className="flex flex-col items-center justify-center">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ repeat: Infinity, repeatDelay: 3, duration: 1 }}
                    className="mb-4 w-16 h-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full flex items-center justify-center shadow-sm"
                  >
                    <Search size={24} className="text-blue-500" />
                  </motion.div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Try adjusting your search criteria or filters to find more people.
                  </p>
                  
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setLocation('');
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Clear all filters
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* Load More Button */}
            {filteredPeople.length > visibleItems && (
              <div className="flex justify-center mb-8">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setVisibleItems(prev => prev + 6)}
                  className="px-6 py-3 bg-black/50 hover:bg-black/70 text-red-500 font-medium rounded-xl shadow-sm border border-white/10 flex items-center gap-2 transition-colors"
                >
                  Load more people
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            )}
          </>
        );
        
      case 'communities':
        return (
          <>
            {/* Communities List */}
            <div className="mb-4 lg:mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="bg-black/30 backdrop-blur-sm rounded-full border border-white/10 p-1 shadow-sm flex items-center flex-1">
                  <Search className="ml-3 text-red-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search communities..."
                    className="w-full py-2 px-3 bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="p-2 mr-1 rounded-full hover:bg-gray-800"
                    >
                      <X size={18} className="text-gray-400" />
                    </button>
                  )}
                </div>

                <div className="flex overflow-x-auto hide-scrollbar whitespace-nowrap">
                  <button 
                    onClick={() => setCommunityFilter('all')}
                    className={`mr-2 px-4 py-2 rounded-full text-sm font-medium ${
                      communityFilter === 'all' 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' 
                        : 'bg-black/30 text-white border border-white/10'
                    }`}
                  >
                    All
                  </button>
                  {interests.map(interest => (
                    <button 
                      key={interest.id}
                      onClick={() => setCommunityFilter(interest.id)}
                      className={`mr-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                        communityFilter === interest.id
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' 
                          : 'bg-black/30 text-white border border-white/10'
                      }`}
                    >
                      {interest.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Communities Grid */}
            {filteredCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {filteredCommunities.slice(0, visibleItems).map(community => (
                  <motion.div
                    key={community.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                    transition={{ duration: 0.4, delay: 0.1 * (community.id % 10) }}
                  >
                    <CommunityCard 
                      community={community} 
                      onJoin={() => handleJoinCommunity(community.id)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                className="bg-black/30 backdrop-blur-md rounded-xl shadow-sm p-8 text-center border border-white/10 mb-8"
              >
                <div className="flex flex-col items-center justify-center">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ repeat: Infinity, repeatDelay: 3, duration: 1 }}
                    className="mb-4 w-16 h-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full flex items-center justify-center shadow-sm"
                  >
                    <Globe size={24} className="text-blue-500" />
                  </motion.div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No communities found</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Try adjusting your search criteria or consider creating a new community.
                  </p>
                  
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setCommunityFilter('all');
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Clear all filters
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* Load More Button */}
            {filteredCommunities.length > visibleItems && (
              <div className="flex justify-center mb-8">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setVisibleItems(prev => prev + 6)}
                  className="px-6 py-3 bg-black/50 hover:bg-black/70 text-red-500 font-medium rounded-xl shadow-sm border border-white/10 flex items-center gap-2 transition-colors"
                >
                  Load more communities
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            )}
            
            {/* Create Community Button - Fixed */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg transition-colors"
            >
              <Plus size={20} />
              <span className="font-medium">Create Community</span>
            </motion.button>
          </>
        );
        
      case 'connections':
        return <ConnectionsList type="connections" items={activeConnections} />;
        
      case 'requests':
        return <ConnectionsList type="requests" items={connectionRequests} />;
        
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-b from-black via-[#0A0A0A] to-[#121212] text-white pb-20 relative"
    >
      {/* Mobile App Header */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileNav(!showMobileNav)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
              >
                <Menu className="h-5 w-5 text-white" />
              </button>
              <h1 className="text-lg font-bold text-white">Connect</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpenSearchBar(!openSearchBar)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
              >
                <Search className="h-5 w-5 text-white" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
                >
                  <Bell className="h-5 w-5 text-white" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">{notifications}</span>
                  )}
                </button>
                
                <AnimatePresence>
                  {showNotificationPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-72 bg-gray-900 rounded-xl border border-white/10 shadow-lg shadow-black/30 z-40"
                    >
                      <div className="p-3 border-b border-white/10">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-white">Notifications</h3>
                          <button className="text-xs text-blue-400">Mark all as read</button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors flex gap-3 items-start">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                              {i === 0 ? <UserPlus size={14} /> : i === 1 ? <Heart size={14} /> : <MessagesSquare size={14} />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-white">
                                {i === 0 ? 'Sarah connected with you' : i === 1 ? 'Michael liked your post' : 'New message from David'}
                              </p>
                              <p className="text-xs text-gray-400">Just now</p>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          </div>
                        ))}
                      </div>
                      <div className="p-2 text-center">
                        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View all notifications</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="ml-2 flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-full"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Connect</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Nav Sidebar */}
      <AnimatePresence>
        {showMobileNav && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileNav(false)}
              className="fixed inset-0 bg-black/70 z-40"
            />
            
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed top-0 left-0 h-full w-72 bg-gray-900 z-50 shadow-xl"
            >
              <div className="p-5 border-b border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    <img 
                      src="https://randomuser.me/api/portraits/women/44.jpg" 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-white">Jessica Williams</p>
                    <p className="text-sm text-green-500">Active</p>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <button className="flex items-center gap-3 p-3 w-full text-left rounded-lg hover:bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-white">Profile</span>
                </button>
                
                <button className="flex items-center gap-3 p-3 w-full text-left rounded-lg hover:bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <MessagesSquare className="h-4 w-4 text-purple-400" />
                  </div>
                  <span className="text-white">Messages</span>
                  <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">2</span>
                </button>
                
                <button className="flex items-center gap-3 p-3 w-full text-left rounded-lg hover:bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-green-400" />
                  </div>
                  <span className="text-white">Connections</span>
                </button>
                
                <button className="flex items-center gap-3 p-3 w-full text-left rounded-lg hover:bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-yellow-400" />
                  </div>
                  <span className="text-white">Events</span>
                </button>
                
                <button className="flex items-center gap-3 p-3 w-full text-left rounded-lg hover:bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Settings className="h-4 w-4 text-gray-400" />
                  </div>
                  <span className="text-white">Settings</span>
                </button>
              </div>
              
              <div className="absolute bottom-0 w-full p-5 border-t border-white/10">
                <button className="w-full p-3 bg-white/10 hover:bg-white/15 rounded-lg text-white text-center">
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* QR Code Modal for Connections */}
      <AnimatePresence>
        {showQRCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRCode(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-1">Quick Connect</h3>
                <p className="text-gray-400 text-sm">Scan this code to connect instantly</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl mb-4">
                <div className="aspect-square w-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ConviviaUserID123')] bg-center bg-no-repeat bg-contain">
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-center text-white font-bold">Jessica Williams</p>
                <p className="text-center text-gray-400 text-sm">@jessica.w</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <button className="w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium">
                  Share Profile
                </button>
                <button 
                  onClick={() => setShowQRCode(false)}
                  className="w-full p-3 bg-white/10 hover:bg-white/15 rounded-lg text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="container mx-auto px-4 pt-4 pb-20">
        {/* Tabs Navigator */}
        <TabsNavigator 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        
        {/* Main Content - Shows based on active tab */}
        {renderTabContent()}
      </div>
      
      {/* Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-lg border-t border-white/10 z-30">
        <div className="flex justify-around items-center h-16">
          <button className="flex flex-col items-center justify-center text-white/60 hover:text-white transition-colors">
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button className="flex flex-col items-center justify-center text-white/60 hover:text-white transition-colors">
            <Globe className="h-5 w-5" />
            <span className="text-xs mt-1">Discover</span>
          </button>
          
          <button className="flex flex-col items-center justify-center -mt-5 relative">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-3 shadow-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs mt-1 text-white/60">Create</span>
          </button>
          
          <button className="flex flex-col items-center justify-center text-white hover:text-white transition-colors">
            <div className="relative">
              <MessagesSquare className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-3.5 h-3.5 flex items-center justify-center rounded-full">2</span>
            </div>
            <span className="text-xs mt-1">Messages</span>
          </button>
          
          <button className="flex flex-col items-center justify-center text-white/60 hover:text-white transition-colors">
            <div className="relative rounded-full overflow-hidden h-5 w-5">
              <img 
                src="https://randomuser.me/api/portraits/women/44.jpg" 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
      
      {/* Connection Request Modal */}
      <ConnectionRequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        person={selectedPerson}
      />
    </motion.div>
  );
};

export default Connect; 