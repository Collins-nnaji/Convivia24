import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, Filter, ChevronDown, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const UpcomingEventsSection = () => {
  const [activeCategory, setActiveCategory] = useState('All Events');
  const [sortOrder, setSort] = useState('Popularity');

  // Real upcoming events data based on the image provided
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
      price: "£5 - £35"
    },
    {
      id: 2,
      title: "Raver Tots Outdoor Festival Reading 2025",
      venue: "Prospect Park",
      location: "Reading",
      date: "Sun 20th Jul",
      time: "1:00pm",
      category: "Festivals",
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
      price: "£5 - £40"
    },
    {
      id: 3,
      title: "Raver Tots Outdoor Festival Kent 2025",
      venue: "Mote Park",
      location: "Maidstone",
      date: "Mon 26th May",
      time: "12:00pm",
      category: "Festivals",
      image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
      price: "£5 - £40"
    },
    {
      id: 4,
      title: "Summer Ball 2025 | Imperial College Union",
      venue: "Imperial College London",
      location: "London",
      date: "Sat 21st Jun",
      time: "2:00pm",
      category: "Arts & Performance",
      image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
      price: "£45 - £180"
    },
    {
      id: 5,
      title: "Raver Tots Outdoor Festival Barnet 2025",
      venue: "Barnet Stadium",
      location: "Barnet",
      date: "Sat 28th Jun",
      time: "2:00pm",
      category: "Festivals",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
      price: "£10 - £45"
    },
    {
      id: 6,
      title: "DULCE SOL / VOL XX",
      venue: "Secret Location",
      location: "London",
      date: "Mon 9th Jun",
      time: "2:00pm",
      category: "Club Nights",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
      price: "£20 - £60"
    },
    {
      id: 7,
      title: "The Halal Food Festival Manchester 2025",
      venue: "Trafford Centre",
      location: "Manchester",
      date: "Sat 23rd Aug",
      time: "12:00pm",
      category: "Food & Drink",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
      price: "£8 - £15"
    },
    {
      id: 8,
      title: "Sounds From The Other City 2025",
      venue: "Multiple Venues",
      location: "Manchester",
      date: "Sun 4th May",
      time: "2:00pm",
      category: "Arts & Performance",
      image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
      price: "£30 - £85"
    }
  ];

  const categories = [
    "All Events",
    "Club Nights",
    "Gigs",
    "Fun Things",
    "Food & Drink",
    "Festivals",
    "Business & Conferences",
    "Dating",
    "Comedy",
    "Arts & Performance",
    "Classes",
    "Sports & Fitness"
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl font-bold mb-8 text-center"
        >
          All Events
        </motion.h2>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter a location"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pl-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="relative">
            <button className="w-full sm:w-auto bg-white/5 border border-white/10 rounded-xl py-3 px-6 text-white flex items-center justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-red-500">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-400" />
                <span>Choose Date</span>
              </div>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 overflow-x-auto hide-scrollbar">
          <div className="flex space-x-3 pb-2 min-w-max">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? 'bg-red-600 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Event Counter with Sort */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400">{events.length.toLocaleString()} Events</p>
          <div className="relative">
            <button className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg">
              <span>Sort by {sortOrder}</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event, index) => (
            <Link to={`/event/${event.id}`} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-red-500/30 transition-all hover:-translate-y-1 group"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                  {event.category && (
                    <div className="absolute top-3 left-3 bg-red-600/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                      {event.category}
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Calendar className="h-4 w-4 text-red-400" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 text-white">{event.title}</h3>
                  
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <MapPin className="h-4 w-4 text-red-400" />
                    <span>{event.venue}, {event.location}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="text-white font-medium">{event.price}</span>
                    <motion.span 
                      className="text-red-400 flex items-center gap-1 text-sm group-hover:text-red-300"
                      whileHover={{ x: 3 }}
                    >
                      Details <ArrowRight size={14} />
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-lg font-medium px-8 py-3 rounded-full inline-flex items-center gap-2 shadow-lg"
          >
            <span>Load More Events</span>
            <ArrowRight size={18} />
          </motion.button>
        </div>

        {/* CSS for hiding scrollbar */}
        <style jsx="true">{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </section>
  );
};

export default UpcomingEventsSection; 