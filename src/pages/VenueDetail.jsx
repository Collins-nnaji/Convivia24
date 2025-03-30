import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Users, Ticket, Heart, Star, Calendar, Mail, Phone } from 'lucide-react';

const VenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Would normally fetch venue details based on ID
  // For now we'll use placeholder data
  const venue = {
    id: id,
    name: "The Grand Ballroom",
    location: "Lagos, Nigeria",
    rating: 4.9,
    price: "₦500,000 - ₦1,500,000",
    capacity: "Up to 500 guests",
    features: ["Free Parking", "Catering", "Decoration", "Sound System"],
    type: "wedding",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80",
    popularity: 98,
    description: "This is a placeholder description for the venue. In a real application, this would be fetched from an API based on the venue ID."
  };
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white"
    >
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Venues</span>
        </button>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="relative h-72 md:h-96 overflow-hidden">
            <img 
              src={venue.image} 
              alt={venue.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            <div className="absolute top-4 left-4 bg-red-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white">
              {venue.type.charAt(0).toUpperCase() + venue.type.slice(1)}
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-white">
              <span>{venue.rating}</span>
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{venue.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-2 text-white/70">
                <MapPin className="h-5 w-5 text-red-400" />
                <span>{venue.location}</span>
              </div>
              
              <div className="flex items-center gap-2 text-white/70">
                <Users className="h-5 w-5 text-red-400" />
                <span>{venue.capacity}</span>
              </div>
              
              <div className="flex items-center gap-2 text-white/70">
                <Ticket className="h-5 w-5 text-red-400" />
                <span>{venue.price}</span>
              </div>
            </div>
            
            {/* Features Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {venue.features.map((feature, idx) => (
                <span 
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white/90"
                >
                  {feature}
                </span>
              ))}
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">About This Venue</h2>
              <p className="text-white/80">{venue.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-red-400" />
                  Availability
                </h3>
                <p className="text-white/70">Check our calendar for available dates</p>
                <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                  View Calendar
                </button>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-red-400" />
                  Contact Information
                </h3>
                <div className="flex items-center gap-2 text-white/70 mb-2">
                  <Phone className="h-4 w-4" />
                  <span>+234 123 456 7890</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Mail className="h-4 w-4" />
                  <span>contact@grandballroom.com</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-medium rounded-full shadow-lg flex items-center gap-2">
                Book This Venue
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VenueDetail; 