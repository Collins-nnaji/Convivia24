import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Calendar, MapPin, Users, Star, Filter, ChevronDown, Search, ArrowRight, Ticket, Tent } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import UpcomingEventsSection from '../components/UpcomingEventsSection';
import LocalEventsDiscovery from '../components/LocalEventsDiscovery';
import EventDiscoveryDetail from '../components/EventDiscoveryDetail';
import VenueShowcase from '../components/VenueShowcase';

const Events = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('discover'); // discover, event
  const [activeSection, setActiveSection] = useState('discover'); // discover | tickets | venues
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
          
          {/* Section Switcher */}
          <div className="bg-black sticky top-0 z-10 border-t border-b border-white/10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 py-3 overflow-x-auto">
                <button
                  onClick={() => setActiveSection('discover')}
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${activeSection === 'discover' ? 'bg-red-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
                >
                  <Calendar size={16} /> Discover
                </button>
                <button
                  onClick={() => setActiveSection('tickets')}
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${activeSection === 'tickets' ? 'bg-red-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
                >
                  <Ticket size={16} /> Tickets
                </button>
                <button
                  onClick={() => setActiveSection('venues')}
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${activeSection === 'venues' ? 'bg-red-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
                >
                  <Tent size={16} /> Venues
                </button>
              </div>
            </div>
          </div>

          {/* Main Content by Section */}
          <div className="pb-20">
            {activeSection === 'discover' && (
              <>
                <UpcomingEventsSection />
                <LocalEventsDiscovery />
              </>
            )}

            {activeSection === 'tickets' && (
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <h2 className="text-2xl font-bold mb-6">Featured Tickets</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[{ id: '1', title: 'Sunset Live Concert', venue: 'Skyline Arena', date: 'Sat, 8pm', city: 'Lagos', tiers: ['Early Bird', 'VIP', 'Last Minute'] },
                    { id: '2', title: 'Nightlife Experience', venue: 'Velvet Lounge', date: 'Fri, 10pm', city: 'Abuja', tiers: ['VIP', 'Regular'] },
                    { id: '3', title: 'Business Mixer', venue: 'Innovation Hub', date: 'Thu, 6pm', city: 'Lagos', tiers: ['Standard'] }].map((ev, i) => (
                    <motion.div key={ev.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{ev.title}</h3>
                        <Calendar className="text-white/50" size={18} />
                      </div>
                      <div className="text-sm text-white/70 flex items-center gap-2 mb-1"><MapPin size={14} /> {ev.venue} • {ev.city}</div>
                      <div className="text-sm text-white/70 mb-4">{ev.date}</div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {ev.tiers.map((t) => (
                          <span key={t} className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/80 border border-white/10">{t}</span>
                        ))}
                      </div>
                      <button className="w-full mt-auto bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 font-semibold">Buy Ticket</button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'venues' && (
              <div className="mt-10">
                <VenueShowcase />
              </div>
            )}
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