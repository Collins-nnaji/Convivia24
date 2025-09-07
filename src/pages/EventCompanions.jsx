import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Shield, Heart, MessageCircle, Star, ArrowLeft, 
  Sparkles, CheckCircle, Zap, Coffee, Music, Camera,
  MapPin, Clock, UserPlus, Eye, Lock, Unlock, Send,
  ThumbsUp, ThumbsDown, X, Check, Phone, Video, MapPin as Location
} from 'lucide-react';

const EventCompanions = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState('onboarding'); // onboarding, home, checkin, matches, chat, profile
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isGoingSolo, setIsGoingSolo] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isFindingMatches, setIsFindingMatches] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    // Simulate loading matches
    setTimeout(() => {
      setMatches(mockMatches);
    }, 1000);
  }, []);

  // Mock data for the app
  const mockEvents = [
    {
      id: 1,
      name: "Afrobeat Festival 2024",
      date: "Dec 15, 2024",
      time: "7:00 PM",
      location: "Victoria Island, Lagos",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      attendees: 1200,
      type: "Music Festival"
    },
    {
      id: 2,
      name: "Tech Conference Lagos",
      date: "Dec 20, 2024",
      time: "9:00 AM",
      location: "Eko Convention Centre",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
      attendees: 500,
      type: "Conference"
    },
    {
      id: 3,
      name: "Food & Wine Tasting",
      date: "Dec 22, 2024",
      time: "6:00 PM",
      location: "Ikoyi Club",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
      attendees: 80,
      type: "Food & Drink"
    }
  ];

  const mockMatches = [
    {
      id: 1,
      name: "Sarah M.",
      age: 28,
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      interests: ["Music", "Travel", "Photography"],
      bio: "Love discovering new music and exploring Lagos!",
      matchScore: 95,
      event: "Afrobeat Festival 2024",
      isOnline: true,
      lastSeen: "2 min ago"
    },
    {
      id: 2,
      name: "David K.",
      age: 32,
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      interests: ["Technology", "Networking", "Coffee"],
      bio: "Tech enthusiast always looking to connect with like-minded people.",
      matchScore: 88,
      event: "Tech Conference Lagos",
      isOnline: false,
      lastSeen: "1 hour ago"
    },
    {
      id: 3,
      name: "Maria L.",
      age: 26,
      image: "https://randomuser.me/api/portraits/women/28.jpg",
      interests: ["Food", "Wine", "Cooking"],
      bio: "Foodie and wine lover, always up for trying new restaurants!",
      matchScore: 92,
      event: "Food & Wine Tasting",
      isOnline: true,
      lastSeen: "5 min ago"
    }
  ];

  const icebreakerPrompts = [
    "What's your favorite song from this artist?",
    "Have you seen them live before?",
    "What's the best concert you've ever been to?",
    "Are you more of a dancer or a listener?",
    "What's your go-to drink at events like this?",
    "Are you a foodie? What's your favorite cuisine?",
    "How far did you travel to get here?",
    "What's something you're really passionate about?"
  ];

  // Interactive functions
  const handleCompleteOnboarding = (profile) => {
    setUserProfile(profile);
    setCurrentView('home');
  };

  const handleEventCheckIn = (event) => {
    setSelectedEvent(event);
    setIsCheckingIn(true);
    setCurrentView('checkin');
    
    // Simulate check-in process
    setTimeout(() => {
      setIsCheckingIn(false);
      setIsFindingMatches(true);
      setCurrentView('matches');
      
      // Simulate finding matches
      setTimeout(() => {
        setIsFindingMatches(false);
        setMatches(mockMatches.filter(match => match.event === event.name));
      }, 2000);
    }, 1500);
  };

  const handleStartChat = (match) => {
    setSelectedMatch(match);
    const randomPrompt = icebreakerPrompts[Math.floor(Math.random() * icebreakerPrompts.length)];
    setChatMessages([
      {
        id: 1,
        sender: 'system',
        message: `🎉 You matched with ${match.name}! You both share similar interests and are attending the same event.`,
        timestamp: new Date(),
        isSystem: true
      },
      {
        id: 2,
        sender: 'system',
        message: `💡 Here's an icebreaker to get the conversation started:`,
        timestamp: new Date(),
        isSystem: true
      },
      {
        id: 3,
        sender: 'system',
        message: randomPrompt,
        timestamp: new Date(),
        isPrompt: true
      }
    ]);
    setCurrentView('chat');
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: 'me',
        message: newMessage,
        timestamp: new Date()
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
      
      // Simulate response
      setTimeout(() => {
        const responses = [
          "That's so interesting! Tell me more about that.",
          "I totally agree! I've had a similar experience.",
          "Wow, I never thought about it that way!",
          "That sounds amazing! I'd love to hear more."
        ];
        const response = {
          id: Date.now() + 1,
          sender: selectedMatch.name,
          message: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, response]);
      }, 1000);
    }
  };

  const handleLikeMatch = (matchId) => {
    setMatches(matches.map(match => 
      match.id === matchId ? { ...match, liked: true } : match
    ));
  };

  const handlePassMatch = (matchId) => {
    setMatches(matches.filter(match => match.id !== matchId));
  };

  // Render different views based on currentView state
  const renderOnboardingView = () => (
    <div className="px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users size={32} className="text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Welcome to <span className="text-red-600">Event Companions</span>
        </h1>
        <p className="text-gray-600 mb-8">
          Let's set up your profile so we can find the perfect companions for your events
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6"
      >
        <h3 className="font-bold text-gray-900 mb-4">Quick Setup</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Interests</label>
            <div className="flex flex-wrap gap-2">
              {['Music', 'Technology', 'Food', 'Travel', 'Sports', 'Art', 'Photography', 'Networking'].map((interest) => (
                <button
                  key={interest}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-red-100 hover:text-red-700 transition-colors"
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Types You Enjoy</label>
            <div className="flex flex-wrap gap-2">
              {['Concerts', 'Conferences', 'Food Events', 'Networking', 'Sports', 'Cultural'].map((type) => (
                <button
                  key={type}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-red-100 hover:text-red-700 transition-colors"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 mb-8 border border-red-200"
      >
        <h3 className="font-bold text-gray-900 mb-3">How It Works</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <span className="text-sm text-gray-700">Check into events you're attending</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <span className="text-sm text-gray-700">Get matched with like-minded attendees</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <span className="text-sm text-gray-700">Chat with icebreaker prompts and meet up</span>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        onClick={() => handleCompleteOnboarding({ interests: ['Music', 'Technology'], eventTypes: ['Concerts', 'Conferences'] })}
        className="w-full bg-red-600 text-white py-4 rounded-xl hover:bg-red-700 transition-colors font-semibold text-lg"
      >
        Get Started
      </motion.button>
    </div>
  );

  const renderHomeView = () => (
    <div className="px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Find Your <span className="text-red-600">Event Companions</span>
        </h1>
        <p className="text-gray-600 mb-6">
          Connect with like-minded people at events you're attending
        </p>
      </motion.div>

      {/* Going Solo Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 mb-8 border border-red-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Going Solo Mode</h3>
            <p className="text-sm text-gray-600">Connect with other solo attendees before the event</p>
          </div>
          <button
            onClick={() => setIsGoingSolo(!isGoingSolo)}
            className={`w-12 h-6 rounded-full transition-colors ${
              isGoingSolo ? 'bg-red-600' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              isGoingSolo ? 'translate-x-6' : 'translate-x-0.5'
            }`}></div>
          </button>
        </div>
      </motion.div>

      {/* Events List */}
      <div className="space-y-4">
        {mockEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="flex">
              <img
                src={event.image}
                alt={event.name}
                className="w-24 h-24 object-cover"
              />
              <div className="flex-1 p-4">
                <h3 className="font-bold text-gray-900 mb-1">{event.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Clock size={14} />
                  <span>{event.date} • {event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Location size={14} />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    {event.attendees} attendees
                  </span>
                  <button
                    onClick={() => handleEventCheckIn(event)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Check In
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderCheckInView = () => (
    <div className="px-4 py-6">
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={32} className="text-red-600" />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Checking you in...</h3>
        <p className="text-gray-600 mb-4">{selectedEvent?.name}</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <motion.div
            className="bg-red-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5 }}
          ></motion.div>
        </div>
        <p className="text-sm text-gray-500">Verifying your attendance and finding matches</p>
      </div>
    </div>
  );

  const renderMatchesView = () => (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Matches</h2>
          <p className="text-gray-600">{selectedEvent?.name}</p>
        </div>
        <button
          onClick={() => setCurrentView('home')}
          className="text-gray-600 hover:text-gray-900"
        >
          <X size={24} />
        </button>
      </div>

      {isFindingMatches ? (
        <div className="text-center py-12">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Users size={32} className="text-red-600" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Finding your matches...</h3>
          <p className="text-gray-600 mb-4">We're analyzing attendees to find the best companions for you</p>
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-red-600 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              ></motion.div>
            ))}
          </div>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches found</h3>
          <p className="text-gray-600 mb-4">Try checking into a different event or adjust your preferences</p>
          <button
            onClick={() => setCurrentView('home')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Another Event
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={match.image}
                    alt={match.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-red-200"
                  />
                  {match.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-900">{match.name}, {match.age}</h3>
                    <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      {match.matchScore}% match
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{match.bio}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {match.interests.map((interest, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span>{match.isOnline ? 'Online' : `Last seen ${match.lastSeen}`}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handlePassMatch(match.id)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      Pass
                    </button>
                    <button
                      onClick={() => handleStartChat(match)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={16} />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderChatView = () => (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('matches')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </button>
          <img
            src={selectedMatch?.image}
            alt={selectedMatch?.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-red-200"
          />
          <div>
            <h3 className="font-bold text-gray-900">{selectedMatch?.name}</h3>
            <p className="text-sm text-gray-600">{selectedMatch?.isOnline ? 'Online' : 'Offline'}</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-2xl ${
                message.sender === 'me'
                  ? 'bg-red-600 text-white'
                  : message.isSystem
                  ? 'bg-gray-100 text-gray-700 text-center'
                  : message.isPrompt
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.message}</p>
              {message.isPrompt && (
                <button
                  onClick={() => setNewMessage(message.message)}
                  className="mt-2 text-xs text-red-600 hover:text-red-800"
                >
                  Use this prompt
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-black overflow-hidden" style={{ fontFamily: 'Raleway, sans-serif' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => currentView === 'home' ? navigate(-1) : setCurrentView('home')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-lg font-bold text-gray-900">
              {currentView === 'onboarding' && 'Welcome'}
              {currentView === 'home' && 'Event Companions'}
              {currentView === 'checkin' && 'Checking In...'}
              {currentView === 'matches' && 'Your Matches'}
              {currentView === 'chat' && selectedMatch?.name}
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {currentView === 'onboarding' && renderOnboardingView()}
        {currentView === 'home' && renderHomeView()}
        {currentView === 'checkin' && renderCheckInView()}
        {currentView === 'matches' && renderMatchesView()}
        {currentView === 'chat' && renderChatView()}
      </div>
    </div>
  );
};

export default EventCompanions;