import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomeEventsSection = () => {
  // Sample featured events data
  const featuredEvents = [
    {
      id: 1,
      title: "Raver Tots Outdoor Festival Richmond 2025",
      venue: "Old Deer Park Car Park",
      location: "Richmond",
      date: "Sun 31st Aug",
      time: "1:00pm",
      category: "Festivals",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6a3?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
      attendees: 342
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
      attendees: 618
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
      attendees: 204
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
      attendees: 175
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-6 md:mb-0"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Upcoming Events</h2>
            <p className="text-gray-400 max-w-lg">
              Discover events where you can connect with people who share your interests
            </p>
          </motion.div>
          
          <Link to="/events">
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-full flex items-center gap-2 shadow-lg shadow-red-900/20"
            >
              View All Events
              <ArrowRight size={18} />
            </motion.button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredEvents.map((event, index) => (
            <Link to={`/event/${event.id}`} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-red-500/30 transition-all duration-300 h-full flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                  {event.category && (
                    <div className="absolute top-3 left-3 bg-red-600/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                      {event.category}
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-red-400" />
                    <span>{event.date}</span>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-base font-semibold mb-2 text-white line-clamp-2">{event.title}</h3>
                  
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <MapPin className="h-4 w-4 text-red-400" />
                    <span>{event.venue}, {event.location}</span>
                  </div>
                  
                  <div className="mt-auto flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="text-sm text-gray-400">{event.attendees} attending</span>
                    <motion.span 
                      className="text-red-400 flex items-center gap-1 text-sm hover:text-red-300"
                      whileHover={{ x: 3 }}
                    >
                      Details <ChevronRight size={14} />
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeEventsSection; 