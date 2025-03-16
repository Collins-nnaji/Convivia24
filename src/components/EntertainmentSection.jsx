import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, Calendar, Star, 
  X, Mic, Radio, Search,
  MessageSquare, ThumbsUp, Award,
  Heart, Share, ChevronDown, Filter,
  MapPin, Clock, CheckCircle, User,
  Bookmark, ChevronRight, Users
} from 'lucide-react';

const EntertainmentSection = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showReviews, setShowReviews] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Artists', icon: <Star size={18} /> },
    { id: 'dj', label: 'DJs', icon: <Radio size={18} /> },
    { id: 'vocalist', label: 'Vocalists', icon: <Mic size={18} /> },
    { id: 'band', label: 'Live Bands', icon: <Music size={18} /> },
    { id: 'traditional', label: 'Traditional', icon: <Award size={18} /> }
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
      image: "https://images.unsplash.com/photo-1571816119607-57e48af1caa9?q=80&w=600&auto=format",
      description: "Top-rated DJ specializing in Afrobeats and contemporary music with over 7 years of experience.",
      location: "Lagos",
      availability: "Weekends, Some Weekdays",
      reviews: [
        { user: "Michael O.", rating: 5, comment: "DJ AfroMix was the highlight of our wedding! Kept everyone dancing all night.", date: "2 weeks ago" },
        { user: "Amara T.", rating: 4, comment: "Great music selection and very professional. Would book again.", date: "1 month ago" }
      ]
    },
    {
      id: 2,
      name: "MC Energy",
      category: "vocalist",
      specialties: "Weddings • Corporate • Parties",
      rating: 4.9,
      events: 200,
      price: "₦100,000",
      image: "https://images.unsplash.com/photo-1604514628550-37477afdf4e3?q=80&w=600&auto=format",
      description: "High-energy MC and vocalist known for keeping the crowd engaged with interactive performances.",
      location: "Abuja",
      availability: "Available Daily",
      reviews: [
        { user: "Chioma E.", rating: 5, comment: "MC Energy truly lives up to his name! Our corporate event was a huge success thanks to him.", date: "3 weeks ago" },
        { user: "David A.", rating: 5, comment: "Incredible stage presence and audience interaction. Highly recommended!", date: "2 months ago" }
      ]
    },
    {
      id: 3,
      name: "Melodic Band",
      category: "band",
      specialties: "Jazz • Highlife • Contemporary",
      rating: 4.7,
      events: 120,
      price: "₦300,000",
      image: "https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=600&auto=format",
      description: "Versatile live band with extensive traditional and modern repertoire, perfect for sophisticated events.",
      location: "Port Harcourt",
      availability: "Weekends, Holidays",
      reviews: [
        { user: "Ngozi I.", rating: 5, comment: "The band was absolutely phenomenal! They played a perfect mix of songs and were very accommodating with our requests.", date: "1 month ago" },
        { user: "Tunde F.", rating: 4, comment: "Great musicians with an impressive range. They made our anniversary special.", date: "2 months ago" }
      ]
    },
    {
      id: 4,
      name: "DJ Turntable",
      category: "dj",
      specialties: "Traditional • Wedding • Corporate",
      rating: 4.6,
      events: 180,
      price: "₦180,000",
      image: "https://images.unsplash.com/photo-1575672913784-11a7cd4f25df?q=80&w=600&auto=format",
      description: "Experienced DJ with expertise in traditional and modern music, specializing in seamless transitions.",
      location: "Lagos",
      availability: "Weekends, Some Weekdays",
      reviews: [
        { user: "Folake M.", rating: 4, comment: "DJ Turntable was professional and played great music. Everyone enjoyed the mix of traditional and modern songs.", date: "3 weeks ago" },
        { user: "Emeka O.", rating: 5, comment: "Outstanding performance! He read the crowd perfectly and kept the dance floor packed.", date: "1 month ago" }
      ]
    },
    {
      id: 5,
      name: "Afrobeats Collective",
      category: "band",
      specialties: "Afrobeats • Fusion • Contemporary",
      rating: 4.9,
      events: 95,
      price: "₦350,000",
      image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=600&auto=format",
      description: "A dynamic ensemble bringing authentic Afrobeats sounds with modern interpretations and high energy.",
      location: "Lagos",
      availability: "Weekends, Select Weekdays",
      reviews: [
        { user: "Jennifer K.", rating: 5, comment: "Absolutely incredible performance! They had everyone on their feet the entire night.", date: "2 weeks ago" },
        { user: "Olu D.", rating: 5, comment: "World-class musicians who brought our event to life. Worth every naira!", date: "1 month ago" }
      ]
    },
    {
      id: 6,
      name: "Adunni",
      category: "vocalist",
      specialties: "Soul • R&B • Traditional",
      rating: 4.8,
      events: 120,
      price: "₦200,000",
      image: "https://images.unsplash.com/photo-1516959512470-53955cd40f40?q=80&w=600&auto=format",
      description: "Soulful vocalist with a powerful voice that bridges traditional and contemporary music styles.",
      location: "Abuja",
      availability: "Weekends, Some Weekdays",
      reviews: [
        { user: "Bisi A.", rating: 5, comment: "Adunni's voice is simply magical. She made our wedding ceremony unforgettable.", date: "3 weeks ago" },
        { user: "Kola T.", rating: 4, comment: "Beautiful performance that touched everyone's hearts. Very professional and accommodating.", date: "2 months ago" }
      ]
    },
    {
      id: 7,
      name: "Cultural Drummers",
      category: "traditional",
      specialties: "Traditional • Cultural • Ceremonies",
      rating: 4.7,
      events: 200,
      price: "₦150,000",
      image: "https://images.unsplash.com/photo-1516307029006-f5e6282ced4a?q=80&w=600&auto=format",
      description: "Authentic traditional drummers bringing cultural depth and energy to ceremonies and celebrations.",
      location: "Enugu",
      availability: "Available Daily",
      reviews: [
        { user: "Chidi N.", rating: 5, comment: "They brought our traditional ceremony to life! Authentic and powerful performances.", date: "1 month ago" },
        { user: "Amina B.", rating: 4, comment: "Great cultural addition to our event. Very knowledgeable about different traditions.", date: "2 months ago" }
      ]
    },
    {
      id: 8,
      name: "DJ Vibes",
      category: "dj",
      specialties: "House • Electronic • Afrobeats",
      rating: 4.8,
      events: 130,
      price: "₦170,000",
      image: "https://images.unsplash.com/photo-1594623274890-6b45ce7cf44a?q=80&w=600&auto=format",
      description: "Trendsetting DJ known for creating immersive musical experiences with cutting-edge electronic sounds.",
      location: "Lagos",
      availability: "Weekends, Holidays",
      reviews: [
        { user: "Tayo P.", rating: 5, comment: "DJ Vibes created the perfect atmosphere for our corporate launch. Very professional!", date: "2 weeks ago" },
        { user: "Sarah J.", rating: 4, comment: "Great music selection and excellent at reading the crowd. Would definitely book again.", date: "1 month ago" }
      ]
    }
  ];

  const filteredEntertainers = entertainers
    .filter(entertainer => 
      (activeCategory === 'all' || entertainer.category === activeCategory) &&
      (searchQuery === '' || 
        entertainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entertainer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entertainer.specialties.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entertainer.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

  const handleBookEntertainer = (entertainer) => {
    console.log(`Booking entertainer: ${entertainer.name}`);
    alert(`You have booked ${entertainer.name} for your event!`);
  };

  const handleAddReview = (entertainerId, review) => {
    console.log(`Adding review for entertainer ID: ${entertainerId}`);
    alert(`Review added for entertainer ID: ${entertainerId}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="min-h-screen bg-gradient-to-b from-gray-900 to-black rounded-t-3xl mt-16 p-4 md:p-8 text-white"
            onClick={e => e.stopPropagation()}
          >
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Entertainment Hub
                  </h2>
                  <p className="text-gray-400">Discover and book top talent for your celebration</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search artists, bands, DJs..." 
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2 bg-gray-800/50 border border-gray-700 rounded-full hover:bg-gray-700 transition-colors"
                  >
                    <Filter size={18} />
                  </button>
                <button 
                  onClick={onClose}
                    className="p-2 bg-gray-800/50 border border-gray-700 rounded-full hover:bg-gray-700 transition-colors"
                >
                    <X size={18} />
                </button>
                </div>
              </div>

              {/* Filters Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-6"
                  >
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
                      <h3 className="font-bold mb-3">Filter Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Price Range</label>
                          <select className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm">
                            <option>Any Price</option>
                            <option>Under ₦100,000</option>
                            <option>₦100,000 - ₦200,000</option>
                            <option>₦200,000 - ₦300,000</option>
                            <option>Above ₦300,000</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Location</label>
                          <select className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm">
                            <option>All Locations</option>
                            <option>Lagos</option>
                            <option>Abuja</option>
                            <option>Port Harcourt</option>
                            <option>Enugu</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Availability</label>
                          <select className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm">
                            <option>Any Day</option>
                            <option>Weekends</option>
                            <option>Weekdays</option>
                            <option>Holidays</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Category Filters */}
              <div className="flex gap-2 md:gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                      activeCategory === category.id 
                        ? 'bg-gradient-to-r from-red-600 to-red-800 text-white' 
                        : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {category.icon}
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Entertainers Grid */}
              {filteredEntertainers.length === 0 ? (
                <div className="text-center py-16">
                  <Music className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No artists found</h3>
                  <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
                  <button 
                    onClick={() => {setActiveCategory('all'); setSearchQuery('');}}
                    className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full text-sm transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {filteredEntertainers.map((entertainer, index) => (
                  <motion.div
                    key={entertainer.id}
                    initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0 
                      }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden group hover:border-red-500/50 transition-all duration-300"
                  >
                    <div className="relative h-48">
                      <img 
                        src={entertainer.image}
                        alt={entertainer.name}
                        className="w-full h-full object-cover"
                      />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button className="p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-red-600/50 transition-colors">
                            <Heart size={16} />
                          </button>
                          <button className="p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-red-600/50 transition-colors">
                            <Share size={16} />
                          </button>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex justify-between items-end">
                            <div>
                              <h3 className="text-xl font-bold">{entertainer.name}</h3>
                              <div className="flex items-center text-sm">
                                <MapPin size={12} className="mr-1 text-red-500" />
                                <span className="text-gray-300">{entertainer.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                              <Star className="text-yellow-400 w-3 h-3 mr-1" fill="currentColor" />
                              <span className="text-sm">{entertainer.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                      <div className="p-4">
                        <div className="flex gap-2 mb-3">
                          <span className="text-xs px-3 py-1 bg-red-600/20 text-red-400 rounded-full">
                            {categories.find(c => c.id === entertainer.category)?.label}
                          </span>
                          <span className="text-xs px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full flex items-center">
                            <Calendar size={10} className="mr-1" />
                            {entertainer.events}+ Events
                        </span>
                      </div>
                      
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{entertainer.description}</p>
                      
                        <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-4">
                        <div className="flex items-center">
                            <Music size={10} className="mr-1" />
                          {entertainer.specialties}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-red-500 font-bold">From {entertainer.price}</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleBookEntertainer(entertainer)}
                              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-full text-xs transition-colors flex items-center"
                            >
                              <MessageSquare size={12} className="mr-1" />
                          Book Now
                        </button>
                            <button 
                              onClick={() => handleAddReview(entertainer.id, { user: 'New User', rating: 5, comment: 'Great performance!', date: 'Just now' })}
                              className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 rounded-full text-xs transition-colors"
                            >
                              Add Review
                            </button>
                          </div>
                        </div>
                        
                        {/* Reviews Section */}
                        <AnimatePresence>
                          {showReviews === entertainer.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t border-gray-700">
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="font-bold text-sm">Customer Reviews</h4>
                                  <div className="flex items-center text-yellow-400">
                                    <Star size={14} fill="currentColor" className="mr-1" />
                                    <span>{entertainer.rating} ({entertainer.reviews.length})</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  {entertainer.reviews.map((review, idx) => (
                                    <div key={idx} className="bg-gray-700/30 rounded-lg p-3">
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center">
                                          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center mr-2">
                                            <User size={12} />
                                          </div>
                                          <span className="font-medium text-sm">{review.user}</span>
                                        </div>
                                        <div className="flex">
                                          {[...Array(5)].map((_, i) => (
                                            <Star 
                                              key={i} 
                                              size={12} 
                                              className={i < review.rating ? "text-yellow-400" : "text-gray-600"}
                                              fill={i < review.rating ? "currentColor" : "none"}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <p className="text-gray-300 text-xs mb-2">{review.comment}</p>
                                      <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>{review.date}</span>
                                        <button className="flex items-center hover:text-gray-300">
                                          <ThumbsUp size={10} className="mr-1" /> Helpful
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <button className="w-full mt-3 text-center text-sm text-red-500 hover:text-red-400 flex items-center justify-center">
                                  See all reviews <ChevronDown size={14} className="ml-1" />
                        </button>
                      </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
              )}

              {/* Package Promotion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-900 to-red-600 rounded-xl overflow-hidden"
              >
                <div className="md:flex">
                  <div className="md:w-2/3 p-6 md:p-8">
                    <h3 className="text-2xl font-bold mb-2">Complete Entertainment Package</h3>
                    <p className="text-gray-200 mb-4">
                      Save up to 20% when you book a DJ, Vocalist, and Live Band together for your celebration
                    </p>
                    <ul className="space-y-2 mb-6">
                      {[
                        "Premium DJ services with state-of-the-art equipment",
                        "Professional vocalist to perform your favorite songs",
                        "Live band for an authentic musical experience",
                        "Dedicated event coordinator for seamless integration"
                      ].map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle size={16} className="mr-2 text-white flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="bg-white text-red-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">
                      View Premium Packages
                </button>
                  </div>
                  <div className="hidden md:block md:w-1/3 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=500&auto=format" 
                      alt="Live performance" 
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-transparent"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EntertainmentSection;