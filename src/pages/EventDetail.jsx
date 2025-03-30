import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Clock, User2 } from 'lucide-react';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Would normally fetch event details based on ID
  // For now we'll use placeholder data
  const event = {
    id: id,
    name: "Event Details",
    date: "June 15, 2024",
    time: "9:00 AM - 6:00 PM",
    location: "Lagos, Nigeria",
    venue: "Ocean View Resort",
    category: "Conference",
    organizer: "TechNigeria Association",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    description: "This is a placeholder description for the event. In a real application, this would be fetched from an API based on the event ID."
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
          <span>Back to Events</span>
        </button>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="relative h-72 md:h-96 overflow-hidden">
            <img 
              src={event.image} 
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            <div className="absolute top-4 left-4 bg-red-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white">
              {event.category}
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-2 text-white/70">
                <Calendar className="h-5 w-5 text-red-400" />
                <span>{event.date} • {event.time}</span>
              </div>
              
              <div className="flex items-center gap-2 text-white/70">
                <MapPin className="h-5 w-5 text-red-400" />
                <span>{event.location} • {event.venue}</span>
              </div>
              
              <div className="flex items-center gap-2 text-white/70">
                <User2 className="h-5 w-5 text-red-400" />
                <span>By {event.organizer}</span>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">About This Event</h2>
              <p className="text-white/80">{event.description}</p>
            </div>
            
            <div className="flex justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-medium rounded-full shadow-lg flex items-center gap-2">
                Register for this Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventDetail; 