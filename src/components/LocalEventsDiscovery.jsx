import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, Users, 
  ArrowRight, Filter, 
  Search, Clock, 
  UserPlus, MessageCircle, Share2 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LocalEventsDiscovery = () => {
  const [locationFilter, setLocationFilter] = useState('');

  // Sample data for local events with attendance information
  const events = [
    {
      id: 1,
      title: "Raver Tots Outdoor Festival Richmond 2025",
      venue: "Old Deer Park Car Park",
      location: "Richmond",
      date: "Sun 31st Aug",
      time: "1:00pm",
      category: "Festivals",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6a3?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
      price: "£5 - £35",
      attendees: {
        count: 342,
        mutual: 5,
        profiles: [
          "https://randomuser.me/api/portraits/women/12.jpg",
          "https://randomuser.me/api/portraits/men/32.jpg",
          "https://randomuser.me/api/portraits/women/23.jpg", 
          "https://randomuser.me/api/portraits/men/45.jpg"
        ]
      }
    },
    {
      id: 2,
      title: "Summer Ball 2025 | Imperial College Union",
      venue: "Imperial College London",
      location: "London",
      date: "Sat 21st Jun",
      time: "2:00pm",
      category: "Arts & Performance",
      image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
      price: "£45 - £180",
      attendees: {
        count: 618,
        mutual: 12,
        profiles: [
          "https://randomuser.me/api/portraits/women/44.jpg",
          "https://randomuser.me/api/portraits/men/22.jpg",
          "https://randomuser.me/api/portraits/women/67.jpg",
          "https://randomuser.me/api/portraits/men/59.jpg"
        ]
      }
    },
    {
      id: 3,
      title: "DULCE SOL / VOL XX",
      venue: "Secret Location",
      location: "London",
      date: "Mon 9th Jun",
      time: "2:00pm",
      category: "Club Nights",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
      price: "£20 - £60",
      attendees: {
        count: 204,
        mutual: 3,
        profiles: [
          "https://randomuser.me/api/portraits/men/81.jpg",
          "https://randomuser.me/api/portraits/women/39.jpg",
          "https://randomuser.me/api/portraits/men/17.jpg",
          "https://randomuser.me/api/portraits/women/55.jpg"
        ]
      }
    },
    {
      id: 4,
      title: "The Halal Food Festival Manchester 2025",
      venue: "Trafford Centre",
      location: "Manchester",
      date: "Sat 23rd Aug",
      time: "12:00pm",
      category: "Food & Drink",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
      price: "£8 - £15",
      attendees: {
        count: 175,
        mutual: 2,
        profiles: [
          "https://randomuser.me/api/portraits/women/72.jpg",
          "https://randomuser.me/api/portraits/men/29.jpg",
          "https://randomuser.me/api/portraits/women/51.jpg",
          "https://randomuser.me/api/portraits/men/64.jpg"
        ]
      }
    }
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              Plan Better with Convivia24
            </h2>
            <p className="text-gray-400">
              Find events and bundle beverages, venues, and planning tools in one place
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 sm:mt-0"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full sm:w-72 bg-white/5 border border-white/10 rounded-xl py-3 px-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </motion.div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-gradient-to-br from-black/80 to-gray-900/80 border border-white/10 rounded-xl overflow-hidden group hover:border-red-500/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Event Image */}
                <div className="sm:w-2/5 relative">
                  <div className="aspect-[4/3] sm:h-full">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                      {event.category}
                    </div>
                  </div>
                </div>
                
                {/* Event Details */}
                <div className="sm:w-3/5 p-5">
                  <div className="flex flex-col h-full">
                    <div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                        <Calendar className="h-4 w-4 text-red-400" />
                        <span>{event.date} at {event.time}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2 text-white line-clamp-2">{event.title}</h3>
                      
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                        <MapPin className="h-4 w-4 text-red-400" />
                        <span>{event.venue}, {event.location}</span>
                      </div>
                      
                      {/* Attendees */}
                      <div className="flex items-center gap-3 mb-5">
                        <div className="flex -space-x-2">
                          {event.attendees.profiles.map((profile, i) => (
                            <img 
                              key={i}
                              src={profile} 
                              alt="Attendee" 
                              className="w-8 h-8 rounded-full border-2 border-black"
                            />
                          ))}
                        </div>
                        <div className="text-sm">
                          <span className="text-white font-medium">{event.attendees.count} people</span>
                          {event.attendees.mutual > 0 && (
                            <span className="text-gray-400"> • {event.attendees.mutual} mutual</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex flex-wrap gap-2">
                      <button className="bg-red-600 hover:bg-red-700 text-white text-sm rounded-full px-4 py-2 flex items-center gap-1.5 transition-colors">
                        <UserPlus size={16} />
                        <span>Join Event</span>
                      </button>
                      <button className="bg-white/10 hover:bg-white/15 text-white text-sm rounded-full px-4 py-2 flex items-center gap-1.5 transition-colors">
                        <MessageCircle size={16} />
                        <span>Event Chat</span>
                      </button>
                      <button className="bg-transparent border border-white/20 hover:bg-white/5 text-white text-sm rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* View All Button */}
        <div className="text-center mt-10">
          <Link to="/events">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/10 hover:bg-white/15 text-white text-base font-medium px-6 py-3 rounded-full inline-flex items-center gap-2"
            >
              <span>View All Local Events</span>
              <ArrowRight size={18} />
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LocalEventsDiscovery; 