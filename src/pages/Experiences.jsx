import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, ArrowRight, CheckCircle, Heart, 
  Users2, Sparkles, Search, Plus, BellRing, 
  Zap, Menu, User, X, MessageSquare, Globe,
  Filter, Calendar
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
                  <div className="flex items-center bg-white rounded-full border border-gray-200 p-1 shadow-sm">
                    <Search className="ml-3 text-blue-500" size={18} />
                    <input
                      type="text"
                      placeholder="Search people, interests, locations..."
                      className="w-full py-2 px-3 bg-transparent border-none focus:ring-0 text-gray-800"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button 
                      onClick={() => setOpenSearchBar(false)}
                      className="p-2 mr-1 rounded-full hover:bg-gray-100"
                    >
                      <X size={18} className="text-gray-500" />
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
                <Users2 className="mr-2 text-blue-500" size={20} />
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold text-blue-600">{filteredPeople.length}</span> people matching your criteria
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
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                All
              </button>
              {interests.slice(0, 8).map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => setSelectedCategory(interest.id)}
                  className={`mr-2 px-4 py-1.5 rounded-full text-sm font-medium ${
                    selectedCategory === interest.id 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {interest.name}
                </button>
              ))}
              <button 
                onClick={() => setShowFilters(true)}
                className="px-4 py-1.5 rounded-full bg-gray-200 text-gray-700 text-sm font-medium"
              >
                More...
              </button>
            </div>

            {/* People Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPeople.slice(0, visibleItems).map((person, index) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="h-full"
                >
                  <ProfileCard 
                    person={person} 
                    onConnect={handleConnect}
                    showSendMessage={false} 
                  />
                </motion.div>
              ))}
            </div>

            {/* Load More Button */}
            {filteredPeople.length > visibleItems && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setVisibleItems(prev => prev + 6)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium"
                >
                  Show More People
                </button>
              </div>
            )}
          </>
        );

      case 'communities':
        return (
          <>
            {/* Communities Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <Globe size={24} className="text-blue-600" />
                  Communities
                </h2>
                <p className="text-gray-600">
                  Join groups of like-minded individuals who share your interests
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <div className="flex items-center bg-gray-100 rounded-full pr-3 shadow-inner">
                    <input 
                      type="text" 
                      placeholder="Search communities..."
                      className="py-2 pl-4 pr-10 bg-transparent border-none focus:ring-0 text-gray-700 text-sm rounded-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search size={16} className="text-gray-500" />
                  </div>
                </div>
                
                <button 
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={20} />
                </button>
                
                <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors font-medium flex items-center gap-1">
                  <Plus size={18} />
                  Create Community
                </button>
              </div>
            </div>
            
            {/* Communities Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Filter by interest</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setCommunityFilter('all')}
                          className={`px-3 py-1.5 rounded-full text-sm ${
                            communityFilter === 'all'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-200'
                          }`}
                        >
                          All
                        </button>
                        {interests.slice(0, 8).map(interest => (
                          <button
                            key={interest.id}
                            onClick={() => setCommunityFilter(interest.id)}
                            className={`px-3 py-1.5 rounded-full text-sm ${
                              communityFilter === interest.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-200'
                            }`}
                          >
                            {interest.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Location</label>
                      <div className="flex items-center bg-white rounded-md border border-gray-200 px-3 py-1.5 w-64">
                        <MapPin size={16} className="text-gray-500 mr-2" />
                        <input
                          type="text"
                          placeholder="Filter by location..."
                          className="border-none bg-transparent p-0 focus:ring-0 text-sm flex-1"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Location/Interest Summary */}
            {(communityFilter !== 'all' || location) && (
              <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3 mb-6 border border-blue-100">
                <Sparkles size={18} className="text-blue-600" />
                <p className="text-sm text-gray-700">
                  {communityFilter !== 'all' && (
                    <span>
                      Showing communities focused on <span className="font-semibold">{
                        interests.find(i => i.id === communityFilter)?.name
                      }</span>
                    </span>
                  )}
                  {communityFilter !== 'all' && location && <span> in </span>}
                  {location && (
                    <span>
                      <span className="font-semibold">{location}</span>
                    </span>
                  )}
                </p>
                <button 
                  onClick={() => {
                    setCommunityFilter('all');
                    setLocation('');
                  }}
                  className="ml-auto text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear filters
                </button>
              </div>
            )}
            
            {/* Communities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community, index) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <CommunityCard 
                    community={community}
                    onJoin={handleJoinCommunity}
                  />
                </motion.div>
              ))}
              
              {/* Create Community Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: filteredCommunities.length * 0.05 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] h-full"
              >
                <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center mb-6">
                  <Plus size={30} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Create a Community</h3>
                <p className="text-gray-600 mb-6 text-center max-w-xs">
                  Start your own community based on your interests and connect with like-minded people
                </p>
                <button className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-md font-medium transition-colors">
                  Get Started
                </button>
              </motion.div>
            </div>
            
            {/* Featured Events in Communities */}
            <div className="mt-12 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Calendar className="mr-2 text-blue-600" size={20} />
                  Upcoming Community Events
                </h3>
                <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium">
                  View all events
                  <ArrowRight size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                  <div className="h-36 bg-gradient-to-r from-blue-400 to-purple-500 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar size={40} className="text-white" />
                    </div>
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      Jun 15
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-blue-600 font-medium">Lagos Coffee Enthusiasts</div>
                    <h3 className="font-bold mb-1">Coffee Brewing Workshop</h3>
                    <p className="text-gray-600 text-sm mb-3">Learn expert brewing techniques from professional baristas</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin size={12} className="mr-1" />
                        The Brew Café
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Users2 size={12} className="mr-1" />
                        24 attending
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                  <div className="h-36 bg-gradient-to-r from-green-400 to-teal-500 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar size={40} className="text-white" />
                    </div>
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      Jun 18
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-green-600 font-medium">Abuja Hikers Network</div>
                    <h3 className="font-bold mb-1">Weekend Hiking Trip</h3>
                    <p className="text-gray-600 text-sm mb-3">Group hike through the scenic trails outside Abuja</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin size={12} className="mr-1" />
                        Highland Trekkers Club
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Users2 size={12} className="mr-1" />
                        18 attending
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                  <div className="h-36 bg-gradient-to-r from-purple-400 to-pink-500 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar size={40} className="text-white" />
                    </div>
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      Jun 20
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-purple-600 font-medium">London Photography Walks</div>
                    <h3 className="font-bold mb-1">Urban Photography Session</h3>
                    <p className="text-gray-600 text-sm mb-3">Capture the essence of East London with fellow photographers</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin size={12} className="mr-1" />
                        Brick Lane Gallery
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Users2 size={12} className="mr-1" />
                        15 attending
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      
      case 'connections':
        return <ConnectionsList type="connections" items={activeConnections} />;
      
      case 'requests':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="inline-block mr-2 p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-md">
                  <BellRing size={18} className="text-white" />
                </span>
                Connection Requests
              </h3>
              <ConnectionsList type="requests" items={connectionRequests} />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="inline-block mr-2 p-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-md">
                  <ArrowRight size={18} className="text-white" />
                </span>
                Pending Requests
              </h3>
              <ConnectionsList type="pending" items={pendingRequests} />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-repeat opacity-5 pointer-events-none" 
           style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e40af' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
      
      {/* Top App Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="px-4 py-3 max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="p-2 rounded-full hover:bg-gray-100 lg:hidden"
            >
              <Menu size={22} className="text-gray-700" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Connect</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Desktop Search */}
            <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-3 py-2 mr-2 border border-gray-200 shadow-inner">
              <Search className="text-blue-500 mr-1" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none w-48 focus:w-60 transition-all focus:ring-0 text-gray-700 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Mobile Search Button */}
            <button 
              onClick={() => setOpenSearchBar(true)}
              className="p-2 rounded-full hover:bg-gray-100 lg:hidden"
            >
              <Search size={20} className="text-gray-700" />
            </button>
            
            <button className="p-2 rounded-full hover:bg-gray-100 relative">
              <BellRing size={20} className="text-gray-700" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-white text-xs flex items-center justify-center shadow-sm">
                3
              </span>
            </button>
            
            <button className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-colors shadow-md">
              <User size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-4 relative">
        {/* Mobile Side Navigation - Slide in from left */}
        <AnimatePresence>
          {showMobileNav && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40 lg:hidden"
                onClick={() => setShowMobileNav(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-xl z-50 lg:hidden"
              >
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Convivia</h2>
                  <button onClick={() => setShowMobileNav(false)}>
                    <X size={24} className="text-gray-500" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Navigation</h3>
                    <ul className="space-y-2">
                      <li>
                        <a href="/" className="flex items-center p-2 rounded-lg hover:bg-gray-100 text-gray-700">
                          Home
                        </a>
                      </li>
                      <li>
                        <a href="/events" className="flex items-center p-2 rounded-lg hover:bg-gray-100 text-gray-700">
                          Events
                        </a>
                      </li>
                      <li>
                        <a href="/experiences" className="flex items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-medium">
                          Connect
                        </a>
                      </li>
                      <li>
                        <a href="/hotspots" className="flex items-center p-2 rounded-lg hover:bg-gray-100 text-gray-700">
                          Hotspots
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Filters</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-700 mb-1 block">Location</label>
                        <input
                          type="text"
                          placeholder="Enter your location"
                          className="w-full p-2 border border-gray-300 rounded-lg shadow-inner bg-gray-50"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 mb-1 block">Interests</label>
                        <div className="flex flex-wrap gap-2">
                          {interests.slice(0, 6).map((interest) => (
                            <button
                              key={interest.id}
                              onClick={() => setSelectedCategory(interest.id)}
                              className={`px-3 py-1 rounded-full text-xs ${
                                selectedCategory === interest.id
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {interest.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        {/* Fixed Floating Action Button for Mobile */}
        <button className="fixed right-6 bottom-20 z-20 lg:hidden w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg flex items-center justify-center animate-pulse">
          <MessageSquare size={24} />
        </button>
      
        {/* Tabs Navigation */}
        <TabsNavigator activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Main Content */}
        <div className="mt-4">
          {renderTabContent()}
        </div>
        
        {/* Discover Hotspots Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 text-gray-800 border border-blue-100 shadow-sm relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-100 opacity-50"></div>
          <div className="absolute right-20 bottom-4 w-12 h-12 rounded-full bg-indigo-100 opacity-50"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center relative z-10">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">Ready to meet up?</h2>
              <p className="text-gray-600">Check out the top hangout spots where you can meet your new connections</p>
            </div>
            <button 
              onClick={() => navigate('/hotspots')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-3 rounded-full text-white font-medium transition-all shadow-md"
            >
              <MapPin size={20} />
              Explore Hotspots
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="mt-12 mb-20 bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="inline-block mr-2 p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-md">
              <CheckCircle size={18} className="text-white" />
            </span>
            Safety Tips for Meeting New Friends
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CheckCircle size={18} className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
              <span>Always meet in public places like our featured hotspots</span>
            </li>
            <li className="flex items-start bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CheckCircle size={18} className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
              <span>Let friends or family know about your plans</span>
            </li>
            <li className="flex items-start bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CheckCircle size={18} className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
              <span>Start with video chats before meeting in person</span>
            </li>
            <li className="flex items-start bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CheckCircle size={18} className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
              <span>Trust your instincts and feel free to leave if uncomfortable</span>
            </li>
          </ul>
        </div>
        
        {/* Bottom Navigation Bar - Mobile Only */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-6 z-20 lg:hidden shadow-lg">
          <button className="flex flex-col items-center justify-center">
            <Zap size={20} className="text-gray-500" />
            <span className="text-xs text-gray-500 mt-1">Discover</span>
          </button>
          <button className="flex flex-col items-center justify-center relative">
            <div className="absolute -top-3 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            <Users2 size={20} className="text-blue-600" />
            <span className="text-xs text-blue-600 mt-1 font-medium">Connect</span>
          </button>
          <button className="flex flex-col items-center justify-center">
            <MapPin size={20} className="text-gray-500" />
            <span className="text-xs text-gray-500 mt-1">Hotspots</span>
          </button>
          <button className="flex flex-col items-center justify-center">
            <User size={20} className="text-gray-500" />
            <span className="text-xs text-gray-500 mt-1">Profile</span>
          </button>
        </div>
      </div>

      {/* Connection Request Modal */}
      <ConnectionRequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        person={selectedPerson}
        hotspots={hotspots}
      />
    </div>
  );
};

export default Experiences; 