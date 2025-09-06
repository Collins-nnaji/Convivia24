import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, Play, Pause, Heart, Share2, ExternalLink, Clock, Users,
  Sparkles, Zap, Moon, Sun, Coffee, Wine, PartyPopper, Headphones,
  TrendingUp, Star, Plus, Shuffle, Repeat, Volume2, Download
} from 'lucide-react';

const MusicPage = () => {
  const [selectedMood, setSelectedMood] = useState('party');
  const [playingTrack, setPlayingTrack] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  const moods = [
    { id: 'party', name: 'Party', icon: <PartyPopper size={20} />, color: 'from-red-500 to-pink-500' },
    { id: 'chill', name: 'Chill', icon: <Moon size={20} />, color: 'from-blue-500 to-purple-500' },
    { id: 'energetic', name: 'Energetic', icon: <Zap size={20} />, color: 'from-yellow-500 to-orange-500' },
    { id: 'romantic', name: 'Romantic', icon: <Heart size={20} />, color: 'from-pink-500 to-red-500' },
    { id: 'workout', name: 'Workout', icon: <Sun size={20} />, color: 'from-green-500 to-teal-500' },
    { id: 'focus', name: 'Focus', icon: <Coffee size={20} />, color: 'from-gray-500 to-slate-500' },
    { id: 'wine', name: 'Wine Night', icon: <Wine size={20} />, color: 'from-purple-500 to-indigo-500' },
    { id: 'dance', name: 'Dance', icon: <Music size={20} />, color: 'from-orange-500 to-red-500' }
  ];

  const playlists = {
    party: [
      {
        id: 1,
        title: 'Neon Nights',
        artist: 'Various Artists',
        duration: '2h 15m',
        tracks: 28,
        platform: 'spotify',
        mood: 'High Energy',
        description: 'The ultimate party playlist for late nights and wild celebrations',
        cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        featured: true
      },
      {
        id: 2,
        title: 'Club Bangers 2024',
        artist: 'DJ Mix',
        duration: '1h 45m',
        tracks: 22,
        platform: 'apple',
        mood: 'Dance Floor',
        description: 'Latest club hits and electronic beats',
        cover: 'https://images.unsplash.com/photo-1571266028243-e68f8570c9e2?w=300&h=300&fit=crop'
      },
      {
        id: 3,
        title: 'House Party Vibes',
        artist: 'Curated Mix',
        duration: '3h 30m',
        tracks: 42,
        platform: 'spotify',
        mood: 'Social',
        description: 'Perfect for house parties and social gatherings',
        cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop'
      }
    ],
    chill: [
      {
        id: 4,
        title: 'Midnight Jazz',
        artist: 'Jazz Collective',
        duration: '2h 30m',
        tracks: 18,
        platform: 'spotify',
        mood: 'Relaxed',
        description: 'Smooth jazz for late night relaxation',
        cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        featured: true
      },
      {
        id: 5,
        title: 'Ambient Dreams',
        artist: 'Electronic Artists',
        duration: '1h 55m',
        tracks: 15,
        platform: 'apple',
        mood: 'Meditative',
        description: 'Atmospheric sounds for deep relaxation',
        cover: 'https://images.unsplash.com/photo-1571266028243-e68f8570c9e2?w=300&h=300&fit=crop'
      }
    ],
    energetic: [
      {
        id: 6,
        title: 'Power Up',
        artist: 'Energy Mix',
        duration: '2h 00m',
        tracks: 25,
        platform: 'spotify',
        mood: 'High Energy',
        description: 'High-energy tracks to boost your mood',
        cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
        featured: true
      }
    ],
    romantic: [
      {
        id: 7,
        title: 'Love Stories',
        artist: 'Romantic Collection',
        duration: '2h 45m',
        tracks: 20,
        platform: 'spotify',
        mood: 'Intimate',
        description: 'Beautiful love songs for romantic moments',
        cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        featured: true
      }
    ],
    workout: [
      {
        id: 8,
        title: 'Beast Mode',
        artist: 'Fitness Mix',
        duration: '1h 30m',
        tracks: 20,
        platform: 'apple',
        mood: 'Intense',
        description: 'High-intensity tracks for maximum workout performance',
        cover: 'https://images.unsplash.com/photo-1571266028243-e68f8570c9e2?w=300&h=300&fit=crop',
        featured: true
      }
    ],
    focus: [
      {
        id: 9,
        title: 'Deep Focus',
        artist: 'Productivity Sounds',
        duration: '3h 00m',
        tracks: 12,
        platform: 'spotify',
        mood: 'Concentrated',
        description: 'Instrumental tracks for deep work and concentration',
        cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
        featured: true
      }
    ],
    wine: [
      {
        id: 10,
        title: 'Wine & Dine',
        artist: 'Sophisticated Mix',
        duration: '2h 15m',
        tracks: 24,
        platform: 'spotify',
        mood: 'Elegant',
        description: 'Refined music perfect for wine tasting and fine dining',
        cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        featured: true
      }
    ],
    dance: [
      {
        id: 11,
        title: 'Dance Floor Anthems',
        artist: 'Club Mix',
        duration: '2h 30m',
        tracks: 30,
        platform: 'apple',
        mood: 'Dance',
        description: 'Classic and modern dance hits for any dance floor',
        cover: 'https://images.unsplash.com/photo-1571266028243-e68f8570c9e2?w=300&h=300&fit=crop',
        featured: true
      }
    ]
  };

  const handlePlay = (playlistId) => {
    setPlayingTrack(playingTrack === playlistId ? null : playlistId);
  };

  const handleFavorite = (playlistId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(playlistId)) {
      newFavorites.delete(playlistId);
    } else {
      newFavorites.add(playlistId);
    }
    setFavorites(newFavorites);
  };

  const handleOpenPlaylist = (playlist) => {
    // In a real app, this would open the playlist in the respective music app
    const urls = {
      spotify: `https://open.spotify.com/playlist/${playlist.id}`,
      apple: `https://music.apple.com/playlist/${playlist.id}`
    };
    window.open(urls[playlist.platform], '_blank');
  };

  const currentPlaylists = playlists[selectedMood] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header with Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Title and Stats */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Music Curation</h1>
                <p className="text-sm text-gray-600">Mood-based playlist discovery</p>
              </div>
              <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>8 moods</span>
                </div>
                <div className="flex items-center gap-1">
                  <Music size={14} />
                  <span>24 playlists</span>
                </div>
              </div>
            </div>

            {/* Mood Selector */}
            <div className="flex items-center gap-4">
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {moods.slice(0, 4).map((mood, index) => (
                  <motion.button
                    key={mood.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      selectedMood === mood.id
                        ? 'bg-white text-red-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {React.cloneElement(mood.icon, { size: 12 })}
                    <span className="hidden sm:inline">{mood.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence mode="wait">
            {currentPlaylists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
              >
                {/* Modern Playlist Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={playlist.cover}
                        alt={playlist.title}
                        className="w-full h-full object-cover"
                      />
                      {playlist.featured && (
                        <div className="absolute top-0.5 left-0.5">
                          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <Star size={8} />
                          </span>
                        </div>
                      )}
                      
                      {/* Play Button */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handlePlay(playlist.id)}
                          className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"
                        >
                          {playingTrack === playlist.id ? (
                            <Pause size={12} className="text-gray-900" />
                          ) : (
                            <Play size={12} className="text-gray-900 ml-0.5" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-gray-900">{playlist.title}</h3>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                          {playlist.mood}
                        </span>
                        {playlist.featured && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            FEATURED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{playlist.artist}</span>
                        <span>•</span>
                        <span>{playlist.duration}</span>
                        <span>•</span>
                        <span>{playlist.tracks} tracks</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFavorite(playlist.id)}
                    className={`p-1 transition-colors ${
                      favorites.has(playlist.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart size={14} className={favorites.has(playlist.id) ? 'fill-current' : ''} />
                  </button>
                </div>

                {/* Playlist Description */}
                <p className="text-gray-800 text-sm mb-3 leading-relaxed">{playlist.description}</p>

                {/* Platform and Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    playlist.platform === 'spotify' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {playlist.platform === 'spotify' ? 'Spotify' : 'Apple Music'}
                  </span>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleOpenPlaylist(playlist)}
                      className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <Share2 size={14} />
                      <span className="text-xs">Share</span>
                    </button>
                    <button
                      onClick={() => handleOpenPlaylist(playlist)}
                      className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      Open
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MusicPage;
