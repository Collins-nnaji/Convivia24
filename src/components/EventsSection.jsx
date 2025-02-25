import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, X, Clock, Calendar,
  MapPin, Users,  Heart,
  Crown, PartyPopper, GlassWater
} from 'lucide-react';

const EventsSection = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const events = [
    {
      id: 1,
      title: "Royal Wedding Showcase",
      venue: "Landmark Event Center",
      time: "11 AM - 8 PM",
      date: "Next Saturday",
      price: "₦15,000",
      category: "wedding",
      image: "/event-thumbnails/event1.jpg",
      attendees: 350,
      description: "Experience the perfect wedding celebration with premium drink selections and expert service."
    },
    {
      id: 2,
      title: "Cultural Festival",
      venue: "Freedom Park",
      time: "12 PM - 10 PM",
      date: "Sunday",
      price: "₦8,000",
      category: "cultural",
      image: "/event-thumbnails/event2.jpg",
      attendees: 500,
      description: "A celebration of Nigerian traditions with special palm wine and traditional drink ceremonies."
    },
    {
      id: 3,
      title: "Corporate Gala Night",
      venue: "Oriental Hotel",
      time: "6 PM - 11 PM",
      date: "Next Friday",
      price: "₦25,000",
      category: "corporate",
      image: "/event-thumbnails/event3.jpg",
      attendees: 200,
      description: "An elegant evening of networking with premium champagne and cocktail service."
    },
    {
      id: 4,
      title: "Birthday Extravaganza",
      venue: "Sky Lounge",
      time: "7 PM - 2 AM",
      date: "Saturday",
      price: "₦10,000",
      category: "party",
      image: "/event-thumbnails/event4.jpg",
      attendees: 150,
      description: "Celebrate in style with customized drink packages and professional bartending."
    }
  ];

  const categories = [
    { id: 'all', label: 'All Celebrations', icon: <Calendar size={18} /> },
    { id: 'wedding', label: 'Weddings', icon: <Heart size={18} /> },
    { id: 'cultural', label: 'Cultural Events', icon: <Crown size={18} /> },
    { id: 'corporate', label: 'Corporate Events', icon: <Users size={18} /> },
    { id: 'party', label: 'Private Parties', icon: <PartyPopper size={18} /> }
  ];

  const featuredEvent = {
    title: "Grand Wedding Expo 2024",
    venue: "Eko Convention Center",
    date: "Next Weekend",
    image: "/featured-event.jpg",
    attendees: 2000,
    description: "Lagos' premier wedding exhibition featuring luxury beverage services, traditional ceremonies, and modern celebrations."
  };

  const filteredEvents = activeCategory === 'all' 
    ? events 
    : events.filter(event => event.category === activeCategory);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="min-h-screen bg-black rounded-t-3xl mt-20 p-8 text-white"
            onClick={e => e.stopPropagation()}
          >
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Upcoming Celebrations
                </h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Featured Event */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-xl overflow-hidden mb-12 h-96"
              >
                <img 
                  src={featuredEvent.image}
                  alt="Featured Event"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center text-red-500 mb-2">
                    <Star size={20} className="mr-2" />
                    <span>Featured Event</span>
                  </div>
                  <h3 className="text-4xl font-bold mb-2">{featuredEvent.title}</h3>
                  <p className="text-gray-300 mb-4 max-w-2xl">{featuredEvent.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      {featuredEvent.date}
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-1" />
                      {featuredEvent.venue}
                    </div>
                    <div className="flex items-center">
                      <Users size={16} className="mr-1" />
                      {featuredEvent.attendees}+ Expected
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Category Filters */}
              <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors ${
                      activeCategory === category.id 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {category.icon}
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Event Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900 rounded-lg overflow-hidden group hover:scale-105 transition-transform duration-300"
                  >
                    <div className="relative h-48">
                      <img 
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold px-3 py-1 bg-red-600 rounded-full">
                            {event.category.toUpperCase()}
                          </span>
                          <span className="text-sm font-bold">{event.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{event.description}</p>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-400 mb-4">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {event.venue}
                        </div>
                        <div className="flex items-center">
                          <Users size={14} className="mr-1" />
                          {event.attendees}+ Going
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-red-500 font-bold">{event.price}</span>
                        <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm transition-colors">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Services Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                  {
                    icon: <GlassWater size={24} />,
                    title: "Premium Bar Service",
                    description: "Professional bartenders and premium drink selections"
                  },
                  {
                    icon: <Crown size={24} />,
                    title: "Traditional Ceremonies",
                    description: "Specialized service for cultural celebrations"
                  },
                  {
                    icon: <PartyPopper size={24} />,
                    title: "Custom Packages",
                    description: "Tailored beverage solutions for any celebration"
                  }
                ].map((service, index) => (
                  <div key={index} className="bg-gray-900 p-6 rounded-xl">
                    <div className="text-red-500 mb-4">{service.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-gray-400">{service.description}</p>
                  </div>
                ))}
              </div>

              {/* Download App CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-600 to-red-900 rounded-xl p-8 text-center"
              >
                <h3 className="text-2xl font-bold mb-4">Plan Your Perfect Celebration</h3>
                <p className="text-gray-200 mb-6">
                  Download the Convivia24 app to start planning your next event with our premium beverage services.
                </p>
                <button className="bg-white text-red-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">
                  Download App
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventsSection;