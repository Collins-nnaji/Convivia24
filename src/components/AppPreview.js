// src/components/AppPreview.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Calendar, Bell, Search,
    Star, Battery, Signal, Wifi,
    Music, Mic, Users, Heart,
    ChevronRight, Menu, MapPin,
    Download, ArrowRight, CheckCircle
  } from 'lucide-react';

const MobileAppInterface = () => {
  const [activeTab, setActiveTab] = useState('discover');

  // Mock data for the app interface
  const featuredArtists = [
    {
      id: 1,
      name: "DJ AfroMix",
      category: "DJ",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1571816119607-57e48af1caa9?q=80&w=200&auto=format",
      location: "Lagos",
      price: "₦150,000"
    },
    {
      id: 2,
      name: "Melodic Band",
      category: "Live Band",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=200&auto=format",
      location: "Abuja",
      price: "₦300,000"
    },
    {
      id: 3,
      name: "MC Energy",
      category: "Hype Man",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1604514628550-37477afdf4e3?q=80&w=200&auto=format",
      location: "Port Harcourt",
      price: "₦100,000"
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Lagos Music Festival",
      date: "May 15",
      location: "Eko Hotel",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6a3?q=80&w=200&auto=format"
    },
    {
      id: 2,
      title: "Afrobeats Night",
      date: "June 2",
      location: "Hard Rock Cafe",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=200&auto=format"
    }
  ];

  const renderDiscoverScreen = () => (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text" 
          placeholder="Search artists, bands, DJs..." 
          className="w-full bg-gray-800 rounded-full py-2 pl-10 pr-4 text-sm"
        />
      </div>
      
      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['All', 'DJs', 'Live Bands', 'Hype Men', 'Vocalists'].map((category, index) => (
          <div 
            key={index} 
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
              index === 0 ? 'bg-red-600' : 'bg-gray-800'
            }`}
          >
            {category}
          </div>
        ))}
      </div>
      
      {/* Featured Artists */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold">Featured Artists</h3>
          <button className="text-red-500 text-sm flex items-center">
            View all <ChevronRight size={14} />
                </button>
              </div>
        
        <div className="space-y-3">
          {featuredArtists.map(artist => (
            <div key={artist.id} className="flex bg-gray-800 rounded-xl overflow-hidden">
              <img 
                src={artist.image} 
                alt={artist.name} 
                className="w-20 h-20 object-cover"
              />
              <div className="p-3 flex-1">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-bold">{artist.name}</h4>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Music size={10} /> {artist.category}
                    </div>
                  </div>
                  <div className="flex items-center text-yellow-400 text-xs">
                    <Star size={12} className="mr-1" fill="currentColor" />
                    {artist.rating}
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <div className="text-xs text-gray-400 flex items-center">
                    <MapPin size={10} className="mr-1" /> {artist.location}
            </div>
                  <div className="text-red-500 font-bold text-sm">{artist.price}</div>
          </div>
              </div>
            </div>
          ))}
            </div>
          </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold">Upcoming Events</h3>
          <button className="text-red-500 text-sm flex items-center">
            View all <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {upcomingEvents.map(event => (
            <div 
              key={event.id} 
              className="bg-gray-800 rounded-xl overflow-hidden min-w-[140px] w-[140px]"
            >
              <div className="h-20 relative">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-red-600 text-xs px-2 py-0.5 rounded-full">
                  {event.date}
                </div>
              </div>
              <div className="p-2">
                <h4 className="font-bold text-sm">{event.title}</h4>
                <div className="text-xs text-gray-400 flex items-center">
                  <MapPin size={10} className="mr-1" /> {event.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBookingsScreen = () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Calendar size={40} className="mx-auto mb-4 text-gray-500" />
        <h3 className="font-bold mb-2">No Bookings Yet</h3>
        <p className="text-sm text-gray-400 mb-4">Your bookings will appear here</p>
        <button className="bg-red-600 px-4 py-2 rounded-full text-sm">
          Explore Artists
        </button>
      </div>
    </div>
  );

  const renderProfileScreen = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-700 rounded-full overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format" 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-bold">Sarah Johnson</h3>
          <p className="text-sm text-gray-400">Premium Member</p>
        </div>
      </div>
      
      <div className="space-y-2">
        {[
          { icon: <Heart size={16} />, label: "Favorites" },
          { icon: <Calendar size={16} />, label: "My Events" },
          { icon: <Users size={16} />, label: "Invite Friends" },
          { icon: <Bell size={16} />, label: "Notifications" }
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <ChevronRight size={16} className="text-gray-500" />
          </div>
        ))}
          </div>
        </div>
  );

  const renderActiveScreen = () => {
    switch(activeTab) {
      case 'discover':
        return renderDiscoverScreen();
      case 'bookings':
        return renderBookingsScreen();
      case 'profile':
        return renderProfileScreen();
      default:
        return renderDiscoverScreen();
    }
  };

  return (
    <div className="w-[280px] h-[580px] bg-black rounded-[40px] p-4 relative overflow-hidden shadow-2xl shadow-red-900/20">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />
      
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 text-xs">
        <div>9:41</div>
        <div className="flex items-center gap-1">
          <Signal size={12} />
          <Wifi size={12} />
          <Battery size={12} />
        </div>
      </div>

      {/* App Content */}
      <div className="bg-gray-900 h-[calc(100%-24px)] rounded-3xl p-4 text-white overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <img 
              src="/convivia24logo.png" 
              alt="Convivia24" 
              className="h-6"
            />
            <h2 className="font-bold">Convivia24</h2>
          </div>
          <Bell size={18} />
        </div>

        {/* Main Content */}
        <div className="h-[calc(100%-80px)] overflow-y-auto no-scrollbar">
          {renderActiveScreen()}
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-around items-center pt-3 border-t border-gray-800 mt-2">
          <button 
            onClick={() => setActiveTab('discover')}
            className={`p-2 rounded-full ${activeTab === 'discover' ? 'text-red-500' : 'text-gray-400'}`}
          >
            <Music size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`p-2 rounded-full ${activeTab === 'bookings' ? 'text-red-500' : 'text-gray-400'}`}
          >
            <Calendar size={20} />
          </button>
            <button
            onClick={() => setActiveTab('profile')}
            className={`p-2 rounded-full ${activeTab === 'profile' ? 'text-red-500' : 'text-gray-400'}`}
          >
            <Users size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

const AppPreview = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Convivia24 Mobile App
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Book top entertainment talent, manage your events, and discover new experiences
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* App Interface */}
          <div className="lg:w-1/2 flex justify-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <MobileAppInterface />
            </motion.div>
            
            {/* Decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-red-600 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute top-1/3 left-1/3 w-40 h-40 bg-purple-600 rounded-full opacity-20 blur-3xl"></div>
          </div>

          {/* App Features */}
          <div className="lg:w-1/2">
            <div className="space-y-8">
              {[
                {
                  icon: <Music size={24} className="text-red-500" />,
                  title: "Book Top Entertainment",
                  description: "Discover and book the best DJs, live bands, and performers for your celebration"
                },
                {
                  icon: <Calendar size={24} className="text-red-500" />,
                  title: "Event Management",
                  description: "Plan, organize, and track all your celebration details in one place"
                },
                {
                  icon: <Star size={24} className="text-red-500" />,
                  title: "Verified Reviews",
                  description: "Read authentic reviews and ratings from real customers"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex gap-6 p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:bg-gray-700/30 transition-colors group cursor-pointer"
                >
                  <div className="bg-gradient-to-br from-red-600 to-red-800 p-3 rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      {feature.title}
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {/* Download buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-6"
              >
                <h3 className="text-xl font-bold mb-4">Download Now</h3>
                <div className="flex flex-wrap gap-4">
                  <a href="#" className="flex items-center gap-3 bg-black border border-gray-700 hover:border-gray-500 rounded-xl px-6 py-3 transition-colors">
                    <div className="text-3xl">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.5"></path>
                        <path d="M16 3v4"></path>
                        <path d="M8 3v4"></path>
                        <path d="M3 11h18"></path>
                        <path d="M19 16v6"></path>
                        <path d="M22 19l-3-3-3 3"></path>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-gray-400">Download on the</div>
                      <div className="font-bold">App Store</div>
                    </div>
                  </a>
                  
                  <a href="#" className="flex items-center gap-3 bg-black border border-gray-700 hover:border-gray-500 rounded-xl px-6 py-3 transition-colors">
                    <div className="text-3xl">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-gray-400">GET IT ON</div>
                      <div className="font-bold">Google Play</div>
                    </div>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPreview;