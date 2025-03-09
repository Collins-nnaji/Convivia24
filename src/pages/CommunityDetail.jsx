import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Calendar, MessageSquare, 
  Send, Tag, Info, ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

const CommunityDetail = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    communities, 
    events, 
    chats, 
    sendMessage, 
    getMessages, 
    joinCommunity, 
    leaveCommunity 
  } = useCommunity();
  
  const [activeTab, setActiveTab] = useState('about');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Find the current community
  const community = communities.find(c => c.id === communityId || c._id === communityId);
  
  // Find events for this community
  const communityEvents = events.filter(e => e.communityId === communityId || e.community === communityId);
  
  // Get chat messages for this community
  const chatMessages = useMemo(() => chats[communityId] || [], [chats, communityId]);
  
  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatEndRef.current && activeTab === 'chat') {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);
  
  // Load messages when component mounts
  useEffect(() => {
    if (communityId) {
      getMessages(communityId);
    }
  }, [communityId, getMessages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      await sendMessage(communityId, message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinCommunity = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    joinCommunity(communityId);
  };
  
  const handleLeaveCommunity = () => {
    leaveCommunity(communityId);
  };
  
  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Community Not Found</h2>
          <p className="text-gray-600 mb-6">The community you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/community')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Communities
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Raleway, sans-serif' }}>
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-black to-red-900 text-white"
        style={{
          backgroundImage: community.image ? `linear-gradient(to right, rgba(0,0,0,0.8), rgba(153,27,27,0.8)), url(${community.image})` : '',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4 py-12">
          <button
            onClick={() => navigate('/community')}
            className="inline-flex items-center text-white hover:text-red-300 transition-colors mb-6"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Communities
          </button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {community.name}
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mb-4">
                {community.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {community.tags && community.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center text-gray-300">
                <Users className="h-5 w-5 mr-2" />
                <span>{community.members?.length || community.memberCount || 0} members</span>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0">
              {community.isJoined ? (
                <button
                  onClick={handleLeaveCommunity}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-700 hover:bg-red-800 rounded-md transition-colors"
                >
                  Leave Community
                </button>
              ) : (
                <button
                  onClick={handleJoinCommunity}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  Join Community
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            <button
              className={`px-4 py-4 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === 'about'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('about')}
            >
              <Info className="h-5 w-5 mr-2" />
              About
            </button>
            <button
              className={`px-4 py-4 font-medium text-sm flex items-center whitespace-nowrap ${
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
              className={`px-4 py-4 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Community Chat
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">About this Community</h2>
            <p className="text-gray-700 mb-6">
              {community.description}
            </p>
            
            <h3 className="text-lg font-bold mb-3">Community Guidelines</h3>
            <ul className="list-disc pl-5 mb-6 text-gray-700 space-y-2">
              <li>Be respectful and considerate of all members</li>
              <li>Share your celebration experiences and ideas</li>
              <li>Ask questions and provide helpful answers</li>
              <li>No spam, promotional content, or harassment</li>
            </ul>
            
            <h3 className="text-lg font-bold mb-3">Join the Conversation</h3>
            <p className="text-gray-700">
              Connect with other members, share your experiences, and learn from others in the community chat.
            </p>
          </div>
        )}
        
        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Community Events</h2>
              {currentUser && (
                <button
                  onClick={() => navigate('/create-event')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Create Event
                </button>
              )}
            </div>
            
            {communityEvents.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No events yet
                </h3>
                <p className="text-gray-500 mb-4">
                  This community doesn't have any upcoming events.
                </p>
                {currentUser && (
                  <button
                    onClick={() => navigate('/create-event')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Create the first event
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityEvents.map((event) => {
                  const eventDate = new Date(event.date);
                  const formattedDate = eventDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  
                  return (
                    <motion.div
                      key={event.id || event._id}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/event/${event.id || event._id}`)}
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
                        <div className="flex items-center text-gray-500 text-sm">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{event.attendees || event.attendeeCount || 0} attending</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">Community Chat</h2>
            </div>
            
            <div className="h-96 overflow-y-auto p-4">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No messages yet
                  </h3>
                  <p className="text-gray-500">
                    Be the first to start a conversation!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.userId === currentUser?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                          msg.userId === currentUser?.id
                            ? 'bg-red-100 text-red-900'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="font-bold text-sm mb-1">
                          {msg.userName || 'Anonymous'}
                        </div>
                        <div className="text-sm">{msg.content}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
            
            {currentUser ? (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-r-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    disabled={loading}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 border-t border-gray-200 text-center">
                <p className="text-gray-600 mb-2">
                  You need to be logged in to participate in the chat.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Log in to chat
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityDetail; 