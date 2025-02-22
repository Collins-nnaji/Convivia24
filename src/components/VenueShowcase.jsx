import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  Star, 
  Calendar,
  Wine,
  Music,
  Tent,
  HeartHandshake
} from 'lucide-react';

const VenueShowcase = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const venues = [
    {
      name: "Royal Palm Hall",
      location: "Victoria Island, Lagos",
      capacity: "500-1000",
      category: "wedding",
      rating: 4.8,
      image: "/api/placeholder/600/400",
      features: ["Full Bar Service", "Garden Space", "Valet Parking"],
      specialties: ["Traditional Ceremonies", "White Weddings"]
    },
    {
      name: "Sky Lounge",
      location: "Lekki, Lagos",
      capacity: "200-400",
      category: "corporate",
      rating: 4.6,
      image: "/api/placeholder/600/400",
      features: ["Rooftop View", "Premium Bar", "AV Equipment"],
      specialties: ["Corporate Events", "Product Launches"]
    },
    {
      name: "The Glass House",
      location: "Ikoyi, Lagos",
      capacity: "100-300",
      category: "party",
      rating: 4.7,
      image: "/api/placeholder/600/400",
      features: ["Modern Design", "Indoor-Outdoor Flow", "Catering Kitchen"],
      specialties: ["Birthday Parties", "Anniversary Celebrations"]
    },
    {
      name: "Cultural Center",
      location: "Ikeja, Lagos",
      capacity: "300-600",
      category: "cultural",
      rating: 4.9,
      image: "/api/placeholder/600/400",
      features: ["Traditional Décor", "Multiple Halls", "Ceremonial Spaces"],
      specialties: ["Cultural Events", "Traditional Ceremonies"]
    }
  ];

  const categories = [
    { id: 'all', label: 'All Venues', icon: <Tent /> },
    { id: 'wedding', label: 'Wedding Venues', icon: <HeartHandshake /> },
    { id: 'corporate', label: 'Corporate Spaces', icon: <Users /> },
    { id: 'party', label: 'Party Venues', icon: <Music /> },
    { id: 'cultural', label: 'Cultural Centers', icon: <Star /> }
  ];

  const filteredVenues = activeCategory === 'all' 
    ? venues 
    : venues.filter(venue => venue.category === activeCategory);

  return (
    <section className="py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Premium Celebration Venues
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover the perfect space for your next celebration, complete with our premium beverage services
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
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

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredVenues.map((venue, index) => (
            <motion.div
              key={venue.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-900 rounded-xl overflow-hidden group"
            >
              <div className="relative h-64">
                <img 
                  src={venue.image}
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex justify-between items-end">
                    <h3 className="text-2xl font-bold">{venue.name}</h3>
                    <div className="flex items-center">
                      <Star className="text-yellow-400 w-4 h-4 mr-1" />
                      <span>{venue.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1" />
                    {venue.location}
                  </div>
                  <div className="flex items-center">
                    <Users size={16} className="mr-1" />
                    {venue.capacity}
                  </div>
                  <div className="flex items-center">
                    <Wine size={16} className="mr-1" />
                    Full Bar Service
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {venue.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Calendar size={18} />
                  Check Availability
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VenueShowcase;