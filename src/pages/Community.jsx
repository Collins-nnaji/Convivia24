import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Calendar, MessageSquare, Search, 
  Plus, ChevronRight, Tag, User
} from 'lucide-react';
import { motion } from 'framer-motion';

const Community = () => {
  const { currentUser } = useAuth();
  const { 
    communities, 
    events, 
    loading, 
    joinCommunity, 
    leaveCommunity 
  } = useCommunity();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('communities');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter communities based on search query
  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Filter events based on search query
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleJoinCommunity = (communityId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    joinCommunity(communityId);
  };
  
  const handleLeaveCommunity = (communityId) => {
    leaveCommunity(communityId);
  };
  
  const handleCommunityClick = (communityId) => {
    navigate(`/community/${communityId}`);
  };
  
  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Raleway, sans-serif' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-black to-red-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Celebration Community
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Connect with fellow celebration enthusiasts, join communities, 
            participate in events, and share your experiences.
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-600 focus:border-red-600 sm:text-sm"
            placeholder="Search communities, events, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${
              activeTab === 'communities'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('communities')}
          >
            <Users className="h-5 w-5 mr-2" />
            Communities
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${
              activeTab === 'events'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('events')}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Events
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${
              activeTab === 'chats'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('chats')}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            My Chats
          </button>
        </div>
        
        {/* Communities Tab */}
        {activeTab === 'communities' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Communities</h2>
              {currentUser && (
                <button
                  onClick={() => navigate('/create-community')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Community
                </button>
              )}
            </div>
            
            {filteredCommunities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No communities found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map((community) => (
                  <motion.div
                    key={community.id}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                    onClick={() => handleCommunityClick(community.id)}
                  >
                    <div className="h-32 bg-gradient-to-r from-red-500 to-red-800 relative">
                      {community.image && (
                        <img
                          src={community.image}
                          alt={community.name}
                          className="w-full h-full object-cover opacity-50"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-xl font-bold text-white text-center px-4">
                          {community.name}
                        </h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 text-sm mb-4">
                        {community.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-500 text-sm">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{community.members} members</span>
                        </div>
                        {community.isJoined ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLeaveCommunity(community.id);
                            }}
                            className="px-3 py-1 text-xs font-medium text-red-600 border border-red-600 rounded-full hover:bg-red-50"
                          >
                            Leave
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinCommunity(community.id);
                            }}
                            className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-full hover:bg-red-700"
                          >
                            Join
                          </button>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {community.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
              {currentUser && (
                <button
                  onClick={() => navigate('/create-event')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Event
                </button>
              )}
            </div>
            
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No events found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => {
                  const eventDate = new Date(event.date);
                  const formattedDate = eventDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const formattedTime = eventDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  
                  return (
                    <motion.div
                      key={event.id}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                      onClick={() => handleEventClick(event.id)}
                    >
                      <div className="h-40 relative">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 rounded-br-lg">
                          {formattedDate}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formattedTime}</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{event.attendees} attending</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center text-gray-500 text-sm">
                          <div className="flex-1 truncate">
                            {event.location}
                          </div>
                          <button
                            className="ml-2 px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-full hover:bg-red-700"
                          >
                            {event.isJoined ? 'Attending' : 'Join'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Chats Tab */}
        {activeTab === 'chats' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Chats</h2>
            
            {!currentUser ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sign in to access your chats
                </h3>
                <p className="text-gray-500 mb-4">
                  Join communities and participate in conversations
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {communities.filter(c => c.isJoined).length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No chats yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Join communities to start chatting with other members
                    </p>
                    <button
                      onClick={() => setActiveTab('communities')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Browse Communities
                    </button>
                  </div>
                ) : (
                  <div>
                    {communities.filter(c => c.isJoined).map(community => (
                      <div
                        key={community.id}
                        className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/community/${community.id}/chat`)}
                      >
                        <div className="p-4 flex items-center">
                          <div className="h-12 w-12 rounded-full overflow-hidden bg-red-100 flex-shrink-0">
                            {community.image ? (
                              <img
                                src={community.image}
                                alt={community.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Users className="h-6 w-6 m-auto text-red-600" />
                            )}
                          </div>
                          <div className="ml-4 flex-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              {community.name}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              {community.description}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community; 