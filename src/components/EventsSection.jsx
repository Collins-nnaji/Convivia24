import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, X, Clock, Calendar,
  MapPin, Users, Heart,
  Crown, PartyPopper, GlassWater,
  Sparkles, FileDown, PhoneCall, Search, 
  Wine, CheckCircle, ChevronRight,
  Webhook, Gift, Cake, ShoppingBag, Bot
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

  const planningSteps = [
    {
      icon: <Cake size={24} className="text-red-400" />,
      title: "Define Your Celebration",
      description: "Choose your event type, guest count, and desired atmosphere"
    },
    {
      icon: <Calendar size={24} className="text-red-400" />,
      title: "Set Your Date & Budget",
      description: "Select your ideal date and determine your celebration budget"
    },
    {
      icon: <Bot size={24} className="text-red-400" />,
      title: "AI-Powered Recommendations",
      description: "Our AI scours the internet for the perfect venues and vendors"
    },
    {
      icon: <ShoppingBag size={24} className="text-red-400" />,
      title: "Curated Shopping List",
      description: "Get personalized recommendations for everything you need"
    }
  ];

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
                  Plan Your Perfect Celebration
                </h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Enhanced Hero Section for Celebration Planning */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-xl overflow-hidden mb-12"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Visual banner - takes 7/12 columns on large screens */}
                  <div className="lg:col-span-7 relative h-80 lg:h-auto bg-gradient-to-r from-gray-900 to-red-900/30">
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
                    <div className="absolute top-8 left-8 max-w-md">
                      <div className="inline-block px-3 py-1 bg-red-600/80 backdrop-blur-sm rounded-full text-sm mb-4">
                        <span className="flex items-center gap-2">
                          <Sparkles size={16} />
                          Your Ultimate Celebration Planner
                        </span>
                      </div>
                      <h3 className="text-3xl lg:text-4xl font-bold mb-3">Create Unforgettable Moments</h3>
                      <p className="text-white/80 text-base">From intimate gatherings to grand celebrations, we help you plan every detail.</p>
                    </div>
                  </div>
                  
                  {/* Planning steps - takes 5/12 columns on large screens */}
                  <div className="lg:col-span-5 bg-gradient-to-r from-gray-900 to-black p-8">
                    <h4 className="text-xl font-semibold mb-6">How It Works</h4>
                    <div className="space-y-6">
                      {planningSteps.map((step, index) => (
                        <div key={index} className="flex gap-4 items-start">
                          <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center flex-shrink-0">
                            {step.icon}
                          </div>
                          <div>
                            <h5 className="font-medium text-lg mb-1">{step.title}</h5>
                            <p className="text-gray-400 text-sm">{step.description}</p>
                          </div>
                        </div>
                      ))}
                      <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors mt-4">
                        Start Planning Now <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* AI-Powered Assistant Banner */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Webhook size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-1">AI-Powered Celebration Assistant</h4>
                    <p className="text-gray-300 text-sm">Our AI agents search the entire internet to find and recommend the best vendors, venues, and supplies based on verified reviews and your preferences.</p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Try Now
                  </button>
                </div>
              </div>

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

              {/* Planning Tools Section */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Planning Tools
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Event Planning Guide */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden">
                    <div className="p-6">
                      <FileDown size={28} className="text-red-500 mb-4" />
                      <h4 className="text-xl font-bold mb-2">Event Planning Guide</h4>
                      <p className="text-gray-400 mb-6">Step-by-step instructions to plan your perfect event</p>
                      <p className="text-gray-300 text-sm mb-6">
                        Our comprehensive guide covers everything from budgeting to vendor selection, ensuring your event is memorable and stress-free.
                      </p>
                      <button className="flex items-center gap-2 text-red-400 font-medium hover:text-red-300 transition-colors">
                        Download Guide <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Event Consultation */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden">
                    <div className="p-6">
                      <PhoneCall size={28} className="text-red-500 mb-4" />
                      <h4 className="text-xl font-bold mb-2">Event Consultation</h4>
                      <p className="text-gray-400 mb-6">Speak with our experienced event planners</p>
                      <p className="text-gray-300 text-sm mb-6">
                        Get personalized advice from our expert team who can help you choose the perfect venue, theme, and vendors for your specific event needs.
                      </p>
                      <button className="flex items-center gap-2 text-red-400 font-medium hover:text-red-300 transition-colors">
                        Schedule Consultation <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* AI Shopping Assistant */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden">
                    <div className="p-6">
                      <Bot size={28} className="text-red-500 mb-4" />
                      <h4 className="text-xl font-bold mb-2">AI Shopping Assistant</h4>
                      <p className="text-gray-400 mb-6">Find everything you need for your celebration</p>
                      <p className="text-gray-300 text-sm mb-6">
                        Our AI assistant searches the internet to find the best-reviewed products and services for your celebration, creating a custom shopping list.
                      </p>
                      <button className="flex items-center gap-2 text-red-400 font-medium hover:text-red-300 transition-colors">
                        Start Shopping <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini Convivia Pass Section */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-yellow-500/20 p-2">
                    <Crown size={20} className="text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold">Convivia Pass</h4>
                    <p className="text-xs text-gray-400">Unlock premium celebration benefits and exclusive discounts</p>
                  </div>
                  <button className="text-xs bg-transparent border border-yellow-500 text-yellow-500 px-3 py-1 rounded-lg hover:bg-yellow-500/10 transition-colors">
                    Learn More
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-white/20 rounded-full text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventsSection;