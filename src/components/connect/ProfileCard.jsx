import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageSquare, UserPlus, MapPin, 
  Users2, Briefcase, GraduationCap, CheckCircle,
  Clock, Tag, Award, Share2, BookOpen, Zap
} from 'lucide-react';

const ProfileCard = ({ person, onConnect, showSendMessage = false }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [showBio, setShowBio] = useState(false);
  const [liked, setLiked] = useState(false);

  function getInitials(name) {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }

  function getStatusColor(status) {
    if (status.includes('Online')) return 'bg-green-500';
    if (status.includes('Active')) return 'bg-yellow-500';
    return 'bg-gray-400';
  }

  function getRandomGradient(id) {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-sky-500 to-blue-500',
      'from-blue-500 to-indigo-500',
      'from-indigo-500 to-blue-500',
      'from-blue-400 to-blue-600',
      'from-sky-400 to-blue-500',
      'from-indigo-400 to-blue-500',
      'from-blue-500 to-sky-400',
    ];
    return gradients[id % gradients.length];
  }

  // Calculate compatibility vibe based on percentage
  const getCompatibilityVibe = (percentage) => {
    if (percentage >= 90) return "Perfect Match!";
    if (percentage >= 80) return "Great Match!";
    if (percentage >= 70) return "Good Match";
    if (percentage >= 60) return "Decent Match";
    return "Potential Match";
  }

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 h-full group relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute -right-12 -top-12 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:bg-blue-100 transition-all"></div>
      <div className="absolute -left-12 -bottom-12 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:bg-indigo-100 transition-all"></div>
      
      {/* Quick action buttons - appear on hover */}
      <AnimatePresence>
        {isHovering && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-3 right-3 z-10 flex gap-1"
          >
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-full bg-white shadow-md text-gray-500 hover:text-blue-500 border border-gray-100"
              title="Share Profile"
            >
              <Share2 size={14} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-full bg-white shadow-md text-gray-500 hover:text-indigo-500 border border-gray-100"
              title="View Full Profile"
            >
              <BookOpen size={14} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-5 flex flex-col h-full relative z-0">
        {/* Header section with avatar and basic info */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center">
            <div className="relative">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-semibold bg-gradient-to-r ${getRandomGradient(person.id)}`}
              >
                {getInitials(person.name)}
                
                {/* Subtle animation on the avatar */}
                <motion.div 
                  animate={{ 
                    opacity: [0.5, 0.7, 0.5],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent"
                />
              </motion.div>

              {/* Status indicator */}
              <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${getStatusColor(person.status)}`}>
                {person.status.includes('Online') && (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-green-500 opacity-60"
                  />
                )}
              </div>

              {/* Verification badge */}
              {person.verified && (
                <motion.div 
                  initial={{ y: 0 }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 shadow-md"
                >
                  <CheckCircle size={14} />
                </motion.div>
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {person.name}
                {person.compatibility && (
                  <motion.span 
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="ml-2 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 px-2 py-0.5 rounded-full border border-blue-100 text-blue-600 inline-flex items-center"
                  >
                    <Zap size={10} className="mr-0.5" />
                    {person.compatibility}% Match
                  </motion.span>
                )}
              </h3>
              <p className="text-sm text-gray-500">{person.username}</p>
              <p className="text-xs text-gray-500 mt-1">
                {person.status === 'Online now' ? (
                  <span className="text-green-500 font-medium flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                    {person.status}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Clock size={12} className="mr-1 text-gray-400" />
                    {person.status}
                  </span>
                )}
              </p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setLiked(!liked)}
            className={`text-gray-400 hover:text-pink-500 transition-colors focus:outline-none ${liked ? 'text-pink-500' : ''}`}
            aria-label="Add to favorites"
          >
            <Heart size={20} fill={liked ? "#ec4899" : "none"} />
          </motion.button>
        </div>
        
        {/* Bio section with expand/collapse functionality */}
        <div 
          className="mb-5 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 cursor-pointer group/bio"
          onClick={() => setShowBio(!showBio)}
        >
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider flex items-center">
              About {person.name.split(' ')[0]}
              <motion.span 
                animate={{ rotate: showBio ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="inline-block ml-1 text-blue-500"
              >
                <ChevronIndicator />
              </motion.span>
            </h4>
            <span className="text-xs text-blue-500 group-hover/bio:underline">
              {showBio ? "Less" : "More"}
            </span>
          </div>
          <AnimatePresence initial={false}>
            <motion.p 
              className={`text-gray-600 text-sm overflow-hidden ${!showBio && 'line-clamp-2'}`}
              animate={{ height: showBio ? 'auto' : '2.5rem' }}
              transition={{ duration: 0.3 }}
            >
              {person.bio}
            </motion.p>
          </AnimatePresence>
        </div>
        
        {/* Personal Details Section */}
        <div className="mb-5 p-3 bg-blue-50/30 rounded-lg border border-blue-100/50 hover:bg-blue-50/50 transition-colors">
          <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider flex items-center">
            <Award size={12} className="mr-1 text-blue-500" />
            Personal Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600 group">
              <MapPin size={14} className="mr-1 flex-shrink-0 text-blue-500 group-hover:text-blue-600 transition-colors" />
              <span className="truncate group-hover:text-gray-800 transition-colors">{person.location}</span>
            </div>
            <div className="flex items-center text-gray-600 group">
              <Users2 size={14} className="mr-1 flex-shrink-0 text-blue-500 group-hover:text-blue-600 transition-colors" />
              <span className="group-hover:text-gray-800 transition-colors">
                {person.connections} 
                <span className="text-xs text-blue-500 ml-1">connections</span>
              </span>
            </div>
            <div className="flex items-center text-gray-600 group">
              <Briefcase size={14} className="mr-1 flex-shrink-0 text-blue-500 group-hover:text-blue-600 transition-colors" />
              <span className="truncate group-hover:text-gray-800 transition-colors">{person.occupation}</span>
            </div>
            <div className="flex items-center text-gray-600 group">
              <GraduationCap size={14} className="mr-1 flex-shrink-0 text-blue-500 group-hover:text-blue-600 transition-colors" />
              <span className="truncate group-hover:text-gray-800 transition-colors">{person.education}</span>
            </div>
          </div>
        </div>
        
        {/* Hotspots section with animation */}
        <div className="mb-5 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 relative overflow-hidden group/hotspots">
          {/* Decorative elements */}
          <motion.div 
            animate={{ 
              y: [0, -8, 0],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
            className="absolute -right-3 -top-3 w-12 h-12 bg-blue-100 rounded-full opacity-30"
          />
          <h4 className="text-xs font-medium text-blue-600 mb-2 flex items-center relative z-10">
            <MapPin size={12} className="mr-1 text-blue-500" />
            Active at hotspots
          </h4>
          <div className="flex flex-wrap gap-2 relative z-10">
            {person.activeHotspots.map((hotspot, index) => (
              <motion.span 
                key={index}
                whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                className="inline-flex items-center px-2 py-1 bg-white text-blue-600 rounded-full text-xs border border-blue-100 shadow-sm cursor-pointer"
              >
                <MapPin size={12} className="mr-1 text-blue-500" />
                {hotspot}
              </motion.span>
            ))}
          </div>
          
          {/* Hover indicator */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute right-2 bottom-2 text-[10px] text-blue-600 bg-white px-1.5 py-0.5 rounded-full shadow-sm border border-blue-100"
          >
            Click to explore
          </motion.div>
        </div>
        
        {/* Tags section with hover effects */}
        <div className="mb-5 p-3 bg-gray-50 rounded-lg border border-gray-200 group/tags relative">
          <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
            <Tag size={12} className="mr-1 text-gray-500" />
            Interests & Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {person.tags.map((tag, i) => (
              <motion.span
                key={tag}
                whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                custom={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="px-2 py-1 bg-white text-gray-600 rounded-full text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer border border-gray-200 shadow-sm"
              >
                {tag}
              </motion.span>
            ))}
          </div>
          
          {/* Match indicator - shown with high compatibility */}
          {person.compatibility && person.compatibility > 60 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-2 pt-2 border-t border-gray-200"
            >
              <div className="flex items-center text-xs">
                <div className="h-1.5 flex-grow rounded-full bg-gray-200 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${person.compatibility}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  />
                </div>
                <span className="ml-2 text-blue-600 font-medium">
                  {getCompatibilityVibe(person.compatibility)}
                </span>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Connect buttons with improved styling */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex gap-2">
            {showSendMessage && (
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 transition-colors relative overflow-hidden group/button"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-gray-200/0 via-gray-200/50 to-gray-200/0 opacity-0 group-hover/button:opacity-100 transform -translate-x-full group-hover/button:translate-x-full transition-all duration-1000"></span>
                <MessageSquare size={16} className="relative z-10" />
                <span className="relative z-10">Message</span>
              </motion.button>
            )}
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-1 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-2 rounded-lg text-white transition-colors shadow-sm relative overflow-hidden group/button"
              onClick={() => onConnect(person.id)}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover/button:opacity-100 transform -translate-x-full group-hover/button:translate-x-full transition-all duration-1000"></span>
              <UserPlus size={16} className="relative z-10" />
              <span className="relative z-10">Connect</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Small chevron component for bio toggle
const ChevronIndicator = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default ProfileCard; 