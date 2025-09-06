import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MessageCircle, BarChart3, TrendingUp, Gamepad2, 
  Mic, MicOff, Video, VideoOff, Settings, Crown,
  Heart, ThumbsUp, Laugh, Flame, Sparkles, Send,
  ChevronDown, ChevronUp, Volume2, VolumeX, Share2
} from 'lucide-react';
import PollComponent from './PollComponent';
import PredictionComponent from './PredictionComponent';
import GameComponent from './GameComponent';

const HangoutRoom = ({ room, user, onLeave }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showPolls, setShowPolls] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [reactions, setReactions] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock messages for demo
  useEffect(() => {
    const mockMessages = [
      {
        id: 1,
        user: { name: 'Alex', profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg' },
        content: 'This event is amazing! 🎉',
        timestamp: new Date(Date.now() - 300000),
        reactions: { heart: 3, fire: 1 }
      },
      {
        id: 2,
        user: { name: 'Sarah', profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg' },
        content: 'Who else is excited for the main act?',
        timestamp: new Date(Date.now() - 180000),
        reactions: { thumbsUp: 5, partyPopper: 2 }
      },
      {
        id: 3,
        user: { name: 'Mike', profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg' },
        content: 'The energy here is incredible!',
        timestamp: new Date(Date.now() - 120000),
        reactions: { fire: 4, heart: 2 }
      }
    ];
    setMessages(mockMessages);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        user: { name: user.name, profilePicture: user.profilePicture },
        content: message,
        timestamp: new Date(),
        reactions: {}
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const addReaction = (messageId, reactionType) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const currentReactions = msg.reactions || {};
        return {
          ...msg,
          reactions: {
            ...currentReactions,
            [reactionType]: (currentReactions[reactionType] || 0) + 1
          }
        };
      }
      return msg;
    }));
  };

  const reactionTypes = [
    { type: 'heart', icon: Heart, color: 'text-red-500' },
    { type: 'thumbsUp', icon: ThumbsUp, color: 'text-blue-500' },
    { type: 'laugh', icon: Laugh, color: 'text-yellow-500' },
    { type: 'fire', icon: Flame, color: 'text-orange-500' },
    { type: 'partyPopper', icon: Sparkles, color: 'text-purple-500' }
  ];

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{room?.name || 'Event Hangout'}</h1>
                <p className="text-gray-300 text-sm">
                  {room?.currentParticipants?.length || 0} participants • {room?.event?.title || 'Live Event'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-full transition-colors ${
                  isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-2 rounded-full transition-colors ${
                  isVideoOn ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              
              <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <Share2 size={20} />
              </button>
              
              <button
                onClick={onLeave}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-black/10 backdrop-blur-sm border-b border-white/10">
          <div className="flex">
            {[
              { id: 'chat', label: 'Chat', icon: MessageCircle },
              { id: 'polls', label: 'Polls', icon: BarChart3 },
              { id: 'predictions', label: 'Predictions', icon: TrendingUp },
              { id: 'games', label: 'Games', icon: Gamepad2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-purple-400 bg-purple-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 group"
                      >
                        <img
                          src={msg.user.profilePicture}
                          alt={msg.user.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium text-sm">{msg.user.name}</span>
                            <span className="text-gray-400 text-xs">{formatTime(msg.timestamp)}</span>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-2">
                            <p className="text-white text-sm">{msg.content}</p>
                          </div>
                          
                          {/* Reactions */}
                          <div className="flex items-center gap-2">
                            {Object.entries(msg.reactions || {}).map(([type, count]) => {
                              const reaction = reactionTypes.find(r => r.type === type);
                              if (!reaction) return null;
                              const Icon = reaction.icon;
                              return (
                                <button
                                  key={type}
                                  onClick={() => addReaction(msg.id, type)}
                                  className={`flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${reaction.color}`}
                                >
                                  <Icon size={12} />
                                  <span className="text-xs">{count}</span>
                                </button>
                              );
                            })}
                            
                            {/* Add Reaction Buttons */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {reactionTypes.map((reaction) => {
                                const Icon = reaction.icon;
                                return (
                                  <button
                                    key={reaction.type}
                                    onClick={() => addReaction(msg.id, reaction.type)}
                                    className={`p-1 rounded-full hover:bg-white/20 transition-colors ${reaction.color}`}
                                  >
                                    <Icon size={14} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-white/10">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'polls' && (
              <div className="flex-1 p-4">
                <PollComponent roomId={room?._id} />
              </div>
            )}

            {activeTab === 'predictions' && (
              <div className="flex-1 p-4">
                <PredictionComponent roomId={room?._id} />
              </div>
            )}

            {activeTab === 'games' && (
              <div className="flex-1 p-4">
                <GameComponent roomId={room?._id} />
              </div>
            )}
          </div>

          {/* Participants Sidebar */}
          <AnimatePresence>
            {showParticipants && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-black/20 backdrop-blur-md border-l border-white/10"
              >
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">Participants</h3>
                    <button
                      onClick={() => setShowParticipants(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <ChevronDown size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  {room?.currentParticipants?.map((participant, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={participant.user?.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg'}
                          alt={participant.user?.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                          participant.isOnline ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">
                            {participant.user?.name}
                          </span>
                          {participant.user?._id === room?.host?._id && (
                            <Crown size={14} className="text-yellow-400" />
                          )}
                        </div>
                        <p className="text-gray-400 text-xs">
                          {participant.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Show Participants Button */}
        {!showParticipants && (
          <button
            onClick={() => setShowParticipants(true)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <ChevronUp size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default HangoutRoom;
