import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Calendar, MapPin, Users, Star, Filter, ChevronDown, Search, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import UpcomingEventsSection from '../components/UpcomingEventsSection';
import LocalEventsDiscovery from '../components/LocalEventsDiscovery';
import EventDiscoveryDetail from '../components/EventDiscoveryDetail';

const Events = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('discover'); // discover, event, connections
  const [selectedEventId, setSelectedEventId] = useState(null);
  
  const handleViewEvent = (eventId) => {
    setSelectedEventId(eventId);
    setActiveView('event');
    window.scrollTo(0, 0);
  };
  
  const handleBackToDiscovery = () => {
    setActiveView('discover');
    setSelectedEventId(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black text-white"
    >
      {activeView === 'discover' && (
        <>
          {/* Hero Banner */}
          <div className="relative py-16 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                Discover Events & Celebrations
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg text-gray-300 max-w-3xl mb-8"
              >
                Find upcoming events in your area. Plan better with beverage packages, venue suggestions, and fast delivery.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-2xl"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search events by name, location, or category..."
                    className="w-full bg-white/10 border border-white/20 rounded-full py-3 px-5 pl-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="pb-20">
            {/* Upcoming Events Section */}
            <UpcomingEventsSection />
            
            {/* Local Events with People Section */}
            <LocalEventsDiscovery />
          </div>
        </>
      )}
      
      {activeView === 'event' && selectedEventId && (
        <div>
          <div className="bg-black py-4 sticky top-0 z-20 shadow-md">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
              <button 
                onClick={handleBackToDiscovery}
                className="flex items-center gap-2 text-white/80 hover:text-white"
              >
                <ArrowRight className="h-5 w-5 transform rotate-180" />
                <span>Back to Events</span>
              </button>
            </div>
          </div>
          
          <EventDiscoveryDetail eventId={selectedEventId} />
        </div>
      )}
    </motion.div>
  );
};

export default Events; 