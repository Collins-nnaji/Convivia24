import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Video, MapPin, Clock, Users, Heart, MessageCircle, Share2, 
  MoreHorizontal, Star, Sparkles, Music, Zap, Crown, TrendingUp,
  Plus, Send, Smile, Image, Mic, Radio, X
} from 'lucide-react';

const LiveUpdates = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [newPost, setNewPost] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);

  // Mock live updates data
  const liveUpdates = [
    {
      id: 1,
      user: {
        name: "Sarah Wilson",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        location: "London, UK",
        level: "Gold"
      },
      event: {
        name: "Neon Nights: Electronic Music Festival",
        venue: "Skyline Rooftop Lounge",
        date: "2024-02-15",
        time: "10:00 PM"
      },
      content: "The energy here is absolutely electric! 🔥 The DJ just dropped an insane remix and the crowd is going wild!",
      images: [
        "https://images.unsplash.com/photo-1571266028243-e68f857f258a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
      ],
      isLive: true,
      likes: 24,
      comments: 8,
      shares: 3,
      timestamp: "2 minutes ago",
      isLiked: false
    },
    {
      id: 2,
      user: {
        name: "Mike Chen",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        location: "Lagos, Nigeria",
        level: "Silver"
      },
      event: {
        name: "Jazz & Wine Tasting Evening",
        venue: "Underground Speakeasy",
        date: "2024-02-18",
        time: "8:00 PM"
      },
      content: "Just tried the most amazing cocktail here! The mixologist is a genius 🍸✨ The jazz band is setting the perfect mood.",
      images: [
        "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
      ],
      isLive: true,
      likes: 18,
      comments: 5,
      shares: 2,
      timestamp: "5 minutes ago",
      isLiked: true
    },
    {
      id: 3,
      user: {
        name: "Emma Thompson",
        avatar: "https://randomuser.me/api/portraits/women/28.jpg",
        location: "Manchester, UK",
        level: "Platinum"
      },
      event: {
        name: "Art Gallery Opening: Modern Expressions",
        venue: "Cultural Haven",
        date: "2024-02-20",
        time: "7:00 PM"
      },
      content: "This gallery opening is incredible! The contemporary pieces are mind-blowing and I've met so many interesting artists tonight 🎨",
      images: [
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
      ],
      isLive: false,
      likes: 31,
      comments: 12,
      shares: 7,
      timestamp: "15 minutes ago",
      isLiked: false
    }
  ];

  const trendingEvents = [
    { name: "Neon Nights Festival", venue: "Skyline Rooftop", posts: 45 },
    { name: "Jazz & Wine Tasting", venue: "Underground Speakeasy", posts: 32 },
    { name: "Art Gallery Opening", venue: "Cultural Haven", posts: 28 },
    { name: "Rooftop Party", venue: "Sky Lounge", posts: 23 }
  ];

  const tabs = [
    { id: 'live', label: 'Live Now', icon: <Radio size={16} /> },
    { id: 'trending', label: 'Trending', icon: <TrendingUp size={16} /> },
    { id: 'nearby', label: 'Nearby', icon: <MapPin size={16} /> }
  ];

  const handleLike = (postId) => {
    console.log('Liked post:', postId);
  };

  const handleShare = (postId) => {
    console.log('Shared post:', postId);
  };

  const handleComment = (postId) => {
    console.log('Commented on post:', postId);
  };

  const handlePostUpdate = () => {
    if (newPost.trim()) {
      console.log('Posting update:', newPost, 'for event:', selectedEvent);
      setNewPost('');
      setSelectedEvent('');
      setShowPostModal(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header with Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Title and Stats */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Live Updates</h1>
                <p className="text-sm text-gray-600">Real-time event experiences</p>
              </div>
              <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>3 live</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>127 active</span>
                </div>
              </div>
            </div>

            {/* Tabs and Post Button */}
            <div className="flex items-center gap-4">
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {tabs.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white text-red-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
              
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                onClick={() => setShowPostModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Post</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {activeTab === 'live' && (
            <>
              {liveUpdates.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                >
                  {/* Modern Post Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.user.avatar}
                        alt={post.user.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm text-gray-900">{post.user.name}</h3>
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                            {post.user.level}
                          </span>
                          {post.isLive && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                              LIVE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{post.user.location}</span>
                          <span>•</span>
                          <span>{post.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                      <MoreHorizontal size={14} className="text-gray-400" />
                    </button>
                  </div>

                  {/* Event Context */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center">
                        <Music size={12} className="text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">{post.event.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <span>{post.event.venue}</span>
                          <span>•</span>
                          <span>{formatDate(post.event.date)}</span>
                          <span>•</span>
                          <span>{post.event.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-800 text-sm mb-3 leading-relaxed">{post.content}</p>

                  {/* Post Images */}
                  {post.images.length > 0 && (
                    <div className={`grid gap-2 mb-3 ${
                      post.images.length === 1 ? 'grid-cols-1' : 
                      post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
                    }`}>
                      {post.images.map((image, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={image}
                          alt={`Post image ${imgIndex + 1}`}
                          className="w-full h-28 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Modern Post Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 transition-colors ${
                          post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                        }`}
                      >
                        <Heart size={14} className={post.isLiked ? 'fill-current' : ''} />
                        <span className="text-xs">{post.likes}</span>
                      </button>
                      <button
                        onClick={() => handleComment(post.id)}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <MessageCircle size={14} />
                        <span className="text-xs">{post.comments}</span>
                      </button>
                      <button
                        onClick={() => handleShare(post.id)}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-green-600 transition-colors"
                      >
                        <Share2 size={14} />
                        <span className="text-xs">{post.shares}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}

          {activeTab === 'trending' && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-3 text-gray-900">Trending Events</h3>
              <div className="space-y-2">
                {trendingEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <span className="font-medium text-gray-900 text-sm">{event.name}</span>
                      <p className="text-xs text-gray-600">{event.venue}</p>
                    </div>
                    <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full border">{event.posts} posts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'nearby' && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-3 text-gray-900">Events Near You</h3>
              <p className="text-sm text-gray-600">Location-based events will appear here when location services are enabled.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modern Post Modal */}
      <AnimatePresence>
        {showPostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPostModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-xl p-4 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Share Update</h3>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={18} className="text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    <option value="">Select an event</option>
                    <option value="neon-nights">Neon Nights Festival</option>
                    <option value="jazz-wine">Jazz & Wine Tasting</option>
                    <option value="art-gallery">Art Gallery Opening</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">What's happening?</label>
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share what's happening at the event..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                    <Image size={16} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                    <Camera size={16} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                    <Video size={16} />
                  </button>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowPostModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePostUpdate}
                    disabled={!newPost.trim() || !selectedEvent}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Post Update
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveUpdates;
