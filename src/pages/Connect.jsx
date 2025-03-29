import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, ArrowRight, CheckCircle, Heart, 
  Users2, Sparkles, Search, Plus, BellRing, 
  Zap, Menu, User, X, MessageSquare, Globe,
  Filter, Calendar, Home, Map
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
      className="min-h-screen bg-gradient-to-b from-black via-[#0A0A0A] to-[#121212] text-white"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Connect</h1>
            <p className="text-gray-400">Find people and communities with similar interests</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-sm transition-colors"
          >
            <Plus size={16} />
            <span className="font-medium">Create</span>
          </motion.button>
        </div>
        
        {/* Tabs Navigator */}
        <TabsNavigator 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        
        {/* Main Content - Shows based on active tab */}
        {renderTabContent()}
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