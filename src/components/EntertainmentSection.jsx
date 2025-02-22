import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, Calendar,  Star, 
  X,  Mic, Radio
} from 'lucide-react';

const EntertainmentSection = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Services', icon: <Star size={18} /> },
    { id: 'dj', label: 'DJs', icon: <Radio size={18} /> },
    { id: 'hypeman', label: 'Hype Men', icon: <Mic size={18} /> },
    { id: 'band', label: 'Live Bands', icon: <Music size={18} /> }
  ];

  const entertainers = [
    {
      id: 1,
      name: "DJ AfroMix",
      category: "dj",
      specialties: "Afrobeats • Hip Hop • Amapiano",
      rating: 4.8,
      events: 150,
      price: "₦150,000",
      image: "/event-thumbnails/dj-sample.jpg",
      description: "Top-rated DJ specializing in Afrobeats and contemporary music."
    },
    {
      id: 2,
      name: "MC Energy",
      category: "hypeman",
      specialties: "Weddings • Corporate • Parties",
      rating: 4.9,
      events: 200,
      price: "₦100,000",
      image: "/event-thumbnails/hypeman-sample.jpg",
      description: "High-energy MC known for keeping the crowd engaged."
    },
    {
      id: 3,
      name: "Melodic Band",
      category: "band",
      specialties: "Jazz • Highlife • Contemporary",
      rating: 4.7,
      events: 120,
      price: "₦300,000",
      image: "/event-thumbnails/liveband-sample.jpg",
      description: "Versatile live band with extensive traditional and modern repertoire."
    },
    {
      id: 4,
      name: "DJ Turntable",
      category: "dj",
      specialties: "Traditional • Wedding • Corporate",
      rating: 4.6,
      events: 180,
      price: "₦180,000",
      image: "/event-thumbnails/dj-sample2.jpg",
      description: "Experienced DJ with expertise in traditional and modern music."
    }
  ];

  const filteredEntertainers = activeCategory === 'all' 
    ? entertainers 
    : entertainers.filter(entertainer => entertainer.category === activeCategory);

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
                <div>
                  <h2 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Entertainment Services
                  </h2>
                  <p className="text-gray-400">Book top entertainers for your celebration</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
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

              {/* Entertainers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {filteredEntertainers.map((entertainer, index) => (
                  <motion.div
                    key={entertainer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900 rounded-lg overflow-hidden group hover:scale-105 transition-transform duration-300"
                  >
                    <div className="relative h-48">
                      <img 
                        src={entertainer.image}
                        alt={entertainer.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex justify-between items-end">
                          <h3 className="text-2xl font-bold">{entertainer.name}</h3>
                          <div className="flex items-center">
                            <Star className="text-yellow-400 w-4 h-4 mr-1" />
                            <span>{entertainer.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex gap-2 mb-4">
                        <span className="text-sm px-3 py-1 bg-red-600 rounded-full">
                          {entertainer.category.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4">{entertainer.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center">
                          <Music size={14} className="mr-1" />
                          {entertainer.specialties}
                        </div>
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {entertainer.events}+ Events
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-red-500 font-bold">From {entertainer.price}</span>
                        <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm transition-colors">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Package Promotion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-600 to-red-900 rounded-xl p-8 text-center"
              >
                <h3 className="text-2xl font-bold mb-4">Complete Entertainment Package</h3>
                <p className="text-gray-200 mb-6">
                  Save up to 20% when you book a DJ, Hype Man, and Live Band together
                </p>
                <button className="bg-white text-red-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">
                  View Packages
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EntertainmentSection;