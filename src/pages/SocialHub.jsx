import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MessageCircle, Calendar, MapPin, Clock, Star, 
  Search, Filter, Plus, Crown, Zap, TrendingUp, Gamepad2,
  Mic, MicOff, Video, VideoOff, Settings, Share2, Heart,
  ThumbsUp, Laugh, Flame, Sparkles, Send, ChevronDown
} from 'lucide-react';
import HangoutRoom from '../components/HangoutRoom';

const SocialHub = () => {
  const [activeView, setActiveView] = useState('lounge');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [hangoutRooms, setHangoutRooms] = useState([]);
  const [loungeRooms, setLoungeRooms] = useState([]);

  // Mock data for hangout rooms
  useEffect(() => {
    const mockHangoutRooms = [
      {
        _id: '1',
        name: 'Champions League Final Watch Party',
        description: 'Join us for the biggest football match of the year!',
        type: 'event',
        isActive: true,
        currentParticipants: [
          { user: { name: 'Alex', profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg', isOnline: true } },
          { user: { name: 'Sarah', profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg', isOnline: true } },
          { user: { name: 'Mike', profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg', isOnline: false } }
        ],
        host: { name: 'Alex', profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg' },
        event: {
          title: 'Champions League Final',
          date: '2024-06-01',
          location: 'London, UK',
          image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        tags: ['sports', 'football', 'live-streaming']
      },
      {
        _id: '2',
        name: 'Afrobeat Festival Hangout',
        description: 'Celebrating African music and culture together',
        type: 'event',
        isActive: true,
        currentParticipants: [
          { user: { name: 'Emma', profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg', isOnline: true } },
          { user: { name: 'John', profilePicture: 'https://randomuser.me/api/portraits/men/5.jpg', isOnline: true } }
        ],
        host: { name: 'Emma', profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg' },
        event: {
          title: 'Afrobeat Festival',
          date: '2024-05-25',
          location: 'Lagos, Nigeria',
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        tags: ['music', 'culture', 'festival']
      },
      {
        _id: '3',
        name: 'Pride Week Celebration',
        description: 'Join the LGBTQ+ community for Pride Week events',
        type: 'event',
        isActive: true,
        currentParticipants: [
          { user: { name: 'Lisa', profilePicture: 'https://randomuser.me/api/portraits/women/6.jpg', isOnline: true } },
          { user: { name: 'Tom', profilePicture: 'https://randomuser.me/api/portraits/men/7.jpg', isOnline: true } },
          { user: { name: 'Anna', profilePicture: 'https://randomuser.me/api/portraits/women/8.jpg', isOnline: true } }
        ],
        host: { name: 'Lisa', profilePicture: 'https://randomuser.me/api/portraits/women/6.jpg' },
        event: {
          title: 'Pride Week',
          date: '2024-06-15',
          location: 'London, UK',
          image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        tags: ['pride', 'celebration', 'community']
      }
    ];

    const mockLoungeRooms = [
      {
        _id: 'lounge1',
        name: 'Convivia Main Lounge',
        description: 'The main 24/7 social hub where people drop in to chat and share memes',
        type: 'lounge',
        isActive: true,
        currentParticipants: [
          { user: { name: 'David', profilePicture: 'https://randomuser.me/api/portraits/men/9.jpg', isOnline: true } },
          { user: { name: 'Maria', profilePicture: 'https://randomuser.me/api/portraits/women/10.jpg', isOnline: true } },
          { user: { name: 'Chris', profilePicture: 'https://randomuser.me/api/portraits/men/11.jpg', isOnline: true } },
          { user: { name: 'Sophie', profilePicture: 'https://randomuser.me/api/portraits/women/12.jpg', isOnline: false } }
        ],
        host: { name: 'David', profilePicture: 'https://randomuser.me/api/portraits/men/9.jpg' },
        tags: ['general', '24/7', 'social']
      },
      {
        _id: 'lounge2',
        name: 'Music Lovers Lounge',
        description: 'Share your favorite tracks and discover new music',
        type: 'lounge',
        isActive: true,
        currentParticipants: [
          { user: { name: 'Jake', profilePicture: 'https://randomuser.me/api/portraits/men/13.jpg', isOnline: true } },
          { user: { name: 'Nina', profilePicture: 'https://randomuser.me/api/portraits/women/14.jpg', isOnline: true } }
        ],
        host: { name: 'Jake', profilePicture: 'https://randomuser.me/api/portraits/men/13.jpg' },
        tags: ['music', 'discovery', 'sharing']
      }
    ];

    setHangoutRooms(mockHangoutRooms);
    setLoungeRooms(mockLoungeRooms);
  }, []);

  const filteredRooms = activeView === 'lounge' 
    ? loungeRooms.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : hangoutRooms.filter(room => {
        const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             room.event?.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || room.type === filterType;
        return matchesSearch && matchesFilter;
      });

  const mockUser = {
    name: 'You',
    profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg'
  };

  if (selectedRoom) {
    return (
      <HangoutRoom 
        room={selectedRoom} 
        user={mockUser}
        onLeave={() => setSelectedRoom(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Convivia Social Hub</h1>
                <p className="text-gray-300">Connect around events, nightlife, sports, and celebrations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                <Settings size={20} />
              </button>
              <button className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-black/10 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto">
          <div className="flex">
            {[
              { id: 'lounge', label: '24/7 Lounges', icon: MessageCircle, description: 'Always-on social spaces' },
              { id: 'events', label: 'Event Hangouts', icon: Calendar, description: 'Live event rooms' },
              { id: 'sports', label: 'Sports Watch Parties', icon: TrendingUp, description: 'Game day gatherings' },
              { id: 'music', label: 'Music & Culture', icon: Zap, description: 'Festivals and concerts' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex flex-col items-center gap-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeView === tab.id
                    ? 'text-white border-b-2 border-purple-400 bg-purple-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
                <span className="text-xs opacity-75">{tab.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search hangout rooms, events, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="event">Events</option>
              <option value="lounge">Lounges</option>
              <option value="private">Private</option>
            </select>
            
            <button className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors">
              <Plus size={16} />
              Create Room
            </button>
          </div>
        </div>

        {/* Featured Section */}
        {activeView === 'lounge' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">24/7 Convivia Lounges</h2>
            <p className="text-gray-300 mb-6">
              Always-on social spaces where people drop in to chat, listen to music, or share memes about current events.
            </p>
          </div>
        )}

        {activeView === 'events' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Event Hangout Rooms</h2>
            <p className="text-gray-300 mb-6">
              Join live rooms for specific events with chat, polls, predictions, and reactions.
            </p>
          </div>
        )}

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedRoom(room)}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      room.type === 'lounge' 
                        ? 'text-blue-400 bg-blue-400/20' 
                        : 'text-purple-400 bg-purple-400/20'
                    }`}>
                      {room.type === 'lounge' ? '24/7 Lounge' : 'Event Room'}
                    </span>
                    {room.isActive && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Live
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-white font-medium mb-2 group-hover:text-purple-300 transition-colors">
                    {room.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {room.description}
                  </p>
                  
                  {room.event && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                      <Calendar size={14} />
                      <span>{room.event.title}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Participants */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {room.currentParticipants.slice(0, 4).map((participant, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={participant.user.profilePicture}
                          alt={participant.user.name}
                          className="w-8 h-8 rounded-full border-2 border-gray-800"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
                          participant.isOnline ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                      </div>
                    ))}
                    {room.currentParticipants.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center">
                        <span className="text-white text-xs">+{room.currentParticipants.length - 4}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">
                    {room.currentParticipants.length} participants
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={14} className="fill-current" />
                  <span className="text-sm">4.8</span>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {room.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-white/10 text-white text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              {/* Join Button */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium">
                  Join Room
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <Users size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-white font-medium mb-2">No rooms found</h3>
            <p className="text-gray-400">Try adjusting your search or create a new room</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialHub;
