import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, MapPin, Clock, CalendarDays, 
  ArrowRight, Globe, MoreHorizontal 
} from 'lucide-react';

const CommunityCard = ({ community, onJoin }) => {
  return (
    <motion.div 
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col"
      whileHover={{ y: -5 }}
    >
      {/* Cover Image */}
      <div className="relative h-48">
        <img 
          src={community.image} 
          alt={community.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        
        {/* Community info overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-white/80 text-xs font-medium uppercase tracking-wider">{community.category}</span>
              <h3 className="text-white text-xl font-bold leading-tight">{community.name}</h3>
            </div>
            <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <Users size={12} />
              <span>{community.members}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={14} className="mr-1" />
            <span>{community.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={14} className="mr-1" />
            <span>{community.meetingFrequency}</span>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4 flex-grow text-sm">
          {community.description}
        </p>
        
        {/* Interest Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {community.interests.map((interest, index) => (
            <span 
              key={index} 
              className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
            >
              {interest}
            </span>
          ))}
        </div>
        
        {/* Featured Hotspot and Events */}
        <div className="bg-gray-50 -mx-5 px-5 py-3 border-t border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-blue-600" />
              <span className="text-sm font-medium">Featured Hotspot</span>
            </div>
            <span className="text-sm text-gray-700">{community.featuredHotspot}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-blue-600" />
              <span className="text-sm font-medium">Upcoming Events</span>
            </div>
            <span className="text-sm text-blue-600 font-semibold">{community.upcomingEvents}</span>
          </div>
        </div>
      </div>
      
      {/* Action Footer */}
      <div className="border-t border-gray-100 p-4 bg-white flex justify-between items-center">
        <button 
          onClick={() => onJoin && onJoin(community.id)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          Join Community
          <ArrowRight size={16} />
        </button>
        
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <MoreHorizontal size={18} className="text-gray-500" />
        </button>
      </div>
    </motion.div>
  );
};

export default CommunityCard; 