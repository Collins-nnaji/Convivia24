import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, Clock, Users, 
  Ticket, Heart, Share2, MessageCircle,
  UserPlus, Star, Filter, ChevronDown,
  Info, Globe, CreditCard, CheckCircle,
  AlertCircle, Camera, ArrowLeft
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const EventDiscoveryDetail = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [showAllPeople, setShowAllPeople] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  
  // In a real app, we would fetch the event data based on the ID
  // For now, we'll use mock data
  const eventId = parseInt(id) || 1;
  
  // Sample event data
  const event = {
    id: eventId,
    title: "Raver Tots Outdoor Festival Richmond 2025",
    venue: "Old Deer Park Car Park",
    address: "Twickenham Road, Richmond, TW9 2SF",
    location: "Richmond, London",
    date: "Sunday 31st August 2025",
    time: "1:00 PM - 8:00 PM",
    category: "Festivals",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6a3?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6a3?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&q=80"
    ],
    price: "£5 - £35",
    description: "Raver Tots presents the UK's biggest family friendly outdoor festival! Join us for a day of music, dancing and family fun, with world-class DJs, live entertainment, fun fair rides, and activities for children of all ages. Create unforgettable memories with your little ones at this unique festival experience.",
    organizer: "Raver Tots Events",
    attendees: {
      count: 342,
      mutual: 5,
      going: [
        {
          id: 1,
          name: "Emma Wilson",
          image: "https://randomuser.me/api/portraits/women/12.jpg",
          mutual: true,
          interests: ["Electronic Music", "Family Activities", "Festivals"]
        },
        {
          id: 2,
          name: "James Chen",
          image: "https://randomuser.me/api/portraits/men/32.jpg",
          mutual: true,
          interests: ["DJs", "Dancing", "Live Events"]
        },
        {
          id: 3,
          name: "Sophie Martin",
          image: "https://randomuser.me/api/portraits/women/23.jpg",
          mutual: true,
          interests: ["Family Outings", "Music", "Outdoor Activities"]
        },
        {
          id: 4,
          name: "David Thompson",
          image: "https://randomuser.me/api/portraits/men/45.jpg",
          mutual: false,
          interests: ["Festivals", "EDM", "Socializing"]
        },
        {
          id: 5,
          name: "Leila Patel",
          image: "https://randomuser.me/api/portraits/women/31.jpg",
          mutual: false,
          interests: ["Festivals", "Family Events", "Dancing"]
        },
        {
          id: 6,
          name: "Tom Jackson",
          image: "https://randomuser.me/api/portraits/men/67.jpg",
          mutual: false,
          interests: ["Music", "Outdoor Events", "Socializing"]
        },
        {
          id: 7,
          name: "Maya Rodriguez",
          image: "https://randomuser.me/api/portraits/women/44.jpg",
          mutual: true,
          interests: ["Family Activities", "Music Festivals", "Photography"]
        },
        {
          id: 8,
          name: "Alex Morgan",
          image: "https://randomuser.me/api/portraits/men/22.jpg",
          mutual: false,
          interests: ["Electronic Music", "DJs", "Festival Food"]
        }
      ],
      interested: [
        {
          id: 9,
          name: "Sarah Johnson",
          image: "https://randomuser.me/api/portraits/women/67.jpg",
          mutual: true,
          interests: ["Live Music", "Family Days Out", "Dancing"]
        },
        {
          id: 10,
          name: "Michael Roberts",
          image: "https://randomuser.me/api/portraits/men/59.jpg",
          mutual: false,
          interests: ["Festivals", "Electronic Music", "Weekend Activities"]
        },
        {
          id: 11,
          name: "Anya Singh",
          image: "https://randomuser.me/api/portraits/women/39.jpg",
          mutual: false,
          interests: ["Family Entertainment", "Live Events", "Music"]
        },
        {
          id: 12,
          name: "Chris Lee",
          image: "https://randomuser.me/api/portraits/men/17.jpg",
          mutual: false,
          interests: ["DJs", "Outdoor Festivals", "Socializing"]
        }
      ]
    },
    ticketTypes: [
      {
        name: "Standard Ticket",
        price: "£15",
        includes: ["Entry to festival", "Access to all music areas", "Children under 3 free"]
      },
      {
        name: "Family Pass (2 adults, 2 children)",
        price: "£35",
        includes: ["Entry for 2 adults & 2 children", "Fast track entry", "Complimentary soft drinks"]
      },
      {
        name: "VIP Experience",
        price: "£30",
        includes: ["Exclusive VIP area access", "Meet & Greet with headline DJ", "Goodie bag for children", "Priority viewing area"]
      }
    ]
  };

  // Display people with common interests
  const displayPeople = showAllPeople ? event.attendees.going : event.attendees.going.slice(0, 6);
  
  const handleBackToEvents = () => {
    navigate('/events');
  };
  
  return (
    <div className="bg-gradient-to-b from-black to-gray-900 text-white min-h-screen pb-16">
      {/* Top Navigation Bar */}
      <div className="bg-black py-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center">
          <button 
            onClick={handleBackToEvents}
            className="flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Events</span>
          </button>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>
        </div>
        
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8">
          <div className="mb-6">
            <span className="inline-block bg-red-600 text-white text-sm px-3 py-1 rounded-full mb-4">
              {event.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {event.title}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-red-400" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-red-400" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-red-400" />
                <span>{event.venue}, {event.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-red-400" />
                <span>{event.attendees.count} people going</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2"
            >
              <Ticket className="h-5 w-5" />
              <span>Get Tickets</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2"
            >
              <UserPlus className="h-5 w-5" />
              <span>Join Event</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Event Chat</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-transparent border border-white/20 text-white p-2.5 rounded-full flex items-center justify-center"
            >
              <Heart className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-transparent border border-white/20 text-white p-2.5 rounded-full flex items-center justify-center"
            >
              <Share2 className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Navigation */}
            <div className="flex gap-1 mb-8 overflow-x-auto hide-scrollbar border-b border-white/10 pb-1">
              {['about', 'people', 'tickets', 'gallery'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-5 py-2.5 whitespace-nowrap font-medium capitalize ${
                    activeSection === section
                      ? 'border-b-2 border-red-500 text-white'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
            
            {/* About Section */}
            {activeSection === 'about' && (
              <div>
                <div className="bg-white/5 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4">About This Event</h3>
                  <p className="text-white/80 mb-6 leading-relaxed">
                    {event.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                      <h4 className="text-sm uppercase text-white/60 mb-2">Date and Time</h4>
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-red-400 mt-0.5" />
                        <div>
                          <p className="font-medium">{event.date}</p>
                          <p className="text-white/70">{event.time}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-sm uppercase text-white/60 mb-2">Location</h4>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-red-400 mt-0.5" />
                        <div>
                          <p className="font-medium">{event.venue}</p>
                          <p className="text-white/70">{event.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4">Organizer</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {event.organizer.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{event.organizer}</p>
                      <p className="text-white/70 text-sm">Event Organizer</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* People Section */}
            {activeSection === 'people' && (
              <div>
                <div className="bg-white/5 rounded-xl p-6 mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">People Attending</h3>
                    <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
                      {event.attendees.count} Attending
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {displayPeople.map((person) => (
                      <div 
                        key={person.id}
                        className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <img 
                            src={person.image} 
                            alt={person.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <p className="font-medium">{person.name}</p>
                            {person.mutual && (
                              <p className="text-red-400 text-sm">Mutual Connection</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {person.interests.slice(0, 2).map((interest, i) => (
                            <span 
                              key={i}
                              className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/80"
                            >
                              {interest}
                            </span>
                          ))}
                          {person.interests.length > 2 && (
                            <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/80">
                              +{person.interests.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {!showAllPeople && event.attendees.going.length > 6 && (
                    <button 
                      onClick={() => setShowAllPeople(true)}
                      className="w-full py-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-white/80 transition-colors"
                    >
                      Show All Attendees
                    </button>
                  )}
                </div>
                
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-6">People Interested</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.attendees.interested.slice(0, 4).map((person) => (
                      <div 
                        key={person.id}
                        className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <img 
                            src={person.image} 
                            alt={person.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <p className="font-medium">{person.name}</p>
                            {person.mutual && (
                              <p className="text-red-400 text-sm">Mutual Connection</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {person.interests.slice(0, 2).map((interest, i) => (
                            <span 
                              key={i}
                              className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/80"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Tickets Section */}
            {activeSection === 'tickets' && (
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-6">Tickets</h3>
                <div className="space-y-4 mb-8">
                  {event.ticketTypes.map((ticket, index) => (
                    <div 
                      key={index}
                      className="bg-white/5 border border-white/10 rounded-lg p-5 hover:border-red-500/30 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-lg mb-1">{ticket.name}</h4>
                          <p className="text-white/70 mb-3">{ticket.price}</p>
                          <div className="space-y-1">
                            {ticket.includes.map((item, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium inline-flex items-center gap-2"
                          >
                            <Ticket className="h-4 w-4" />
                            <span>Buy Ticket</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-5 border border-white/5">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Ticket Information</h4>
                      <p className="text-white/70 text-sm mb-2">
                        Tickets are non-refundable but can be transferred to another person up to 48 hours before the event.
                      </p>
                      <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-white/70">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="h-4 w-4 text-blue-400" />
                          <span>Secure payment</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-4 w-4 text-blue-400" />
                          <span>E-tickets</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 text-blue-400" />
                          <span>Verification required</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Gallery Section */}
            {activeSection === 'gallery' && (
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-6">Event Gallery</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.gallery.map((image, index) => (
                    <div 
                      key={index}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden group"
                    >
                      <img 
                        src={image} 
                        alt={`Event gallery ${index + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                          <Camera className="h-6 w-6 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3">
            {/* Location Map */}
            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                <img 
                  src="https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/pin-l+f43f5e(-0.2866,51.4617)/0.2866,51.4617,14,0,0/600x300@2x?access_token=pk.dummy" 
                  alt="Event location map"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium">{event.venue}</p>
                  <p className="text-white/70 text-sm">{event.address}</p>
                </div>
              </div>
              <button className="w-full bg-white/10 hover:bg-white/15 text-white py-2.5 rounded-lg transition-colors">
                Get Directions
              </button>
            </div>
            
            {/* Planning Assistance */}
            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Plan With Convivia24</h3>
              <p className="text-white/70 text-sm mb-4">
                Order beverages in bulk, get venue suggestions, and use our chatbot for pairings and guest counts. 24-hour delivery available.
              </p>
              
              {/* Connection Stats */}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg mb-5">
                <div className="w-10 h-10 rounded-full bg-red-600/30 flex items-center justify-center">
                  <Users className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{event.attendees.count} Attending</span>
                    {event.attendees.mutual > 0 && (
                      <span className="text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full">
                        {event.attendees.mutual} Mutual
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/60">Smart tools for better event planning</p>
                </div>
              </div>
              
              {/* Attendee Profiles */}
              <div className="space-y-3 mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button className="bg-white/10 hover:bg-white/15 text-white py-3 rounded-lg transition-colors text-sm">
                    Browse Beverage Packages
                  </button>
                  <button className="bg-white/10 hover:bg-white/15 text-white py-3 rounded-lg transition-colors text-sm">
                    Get Venue Suggestions
                  </button>
                  <button className="bg-white/10 hover:bg-white/15 text-white py-3 rounded-lg transition-colors text-sm">
                    Ask the Chatbot
                  </button>
                </div>
              </div>
              
              {/* Interest Matching */}
              <div className="mb-5">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 text-yellow-400" />
                  <span>Popular add‑ons</span>
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['Bronze Beverage Package', 'Silver Beverage Package', 'Gold Beverage Package', 'Soft Drinks Bundle'].map((addon, index) => (
                    <button key={index} className="text-xs bg-white/10 hover:bg-white/15 text-white/80 px-2 py-1 rounded-full transition-colors">
                      {addon}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mb-3">
                <MessageCircle className="h-4 w-4" />
                <span>Open Chatbot</span>
              </button>
              <button className="w-full bg-white/10 hover:bg-white/15 text-white py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Bundle Venue + Beverages</span>
              </button>
            </div>
            
            {/* Share */}
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Share This Event</h3>
              <div className="flex gap-2">
                <button className="flex-1 bg-white/10 hover:bg-white/15 text-white py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
                <button className="flex-1 bg-white/10 hover:bg-white/15 text-white py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Style for hiding scrollbar */}
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
  );
};

export default EventDiscoveryDetail; 