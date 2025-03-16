import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Star, Filter, ChevronDown, Search, ArrowRight, Clock, Tag, Heart } from 'lucide-react';

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortOption, setSortOption] = useState('date');
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleItems, setVisibleItems] = useState(8);
  const [favorites, setFavorites] = useState([]);
  
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
  }, []);
  
  // Sample events data with better images and descriptions
  const events = [
    {
      id: 1,
      name: 'Nigerian Cultural Festival',
      date: '2024-09-15',
      time: '12:00 PM',
      location: 'Lagos, Nigeria',
      image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      organizer: 'Nigerian Cultural Association',
      attendees: 250,
      rating: 4.8,
      category: 'cultural',
      features: ['Cultural', 'Food', 'Music', 'Dance'],
      price: '₦5,000 - ₦10,000',
      popularity: 95,
      description: 'Experience the rich cultural heritage of Nigeria with traditional music, dance performances, authentic cuisine, and art exhibitions. A celebration of Nigeria\'s diverse ethnic groups and traditions.'
    },
    {
      id: 2,
      name: 'UK-Nigeria Business Networking',
      date: '2024-09-20',
      time: '6:00 PM',
      location: 'London, UK',
      image: 'https://images.unsplash.com/photo-1540317580384-e5d43867caa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      organizer: 'UK-Nigerian Chamber of Commerce',
      attendees: 120,
      rating: 4.6,
      category: 'business',
      features: ['Business', 'Networking', 'Catering', 'Presentations'],
      price: '£50 - £100',
      popularity: 85,
      description: 'Connect with business leaders and entrepreneurs from the UK and Nigeria. This networking event offers opportunities for partnerships, investment discussions, and insights into cross-border business operations.'
    },
    {
      id: 3,
      name: 'Yoruba Traditional Wedding',
      date: '2024-10-05',
      time: '2:00 PM',
      location: 'Ibadan, Nigeria',
      image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      organizer: 'Adebayo Family',
      attendees: 300,
      rating: 4.9,
      category: 'wedding',
      features: ['Wedding', 'Traditional', 'Catering', 'Music'],
      price: '₦50,000 - ₦100,000',
      popularity: 92,
      description: 'Witness the beauty and elegance of a traditional Yoruba wedding ceremony. Experience the colorful attires, cultural rituals, traditional music, and delicious Nigerian cuisine in this joyous celebration.'
    },
    {
      id: 4,
      name: 'African Food Festival',
      date: '2024-10-12',
      time: '11:00 AM',
      location: 'Manchester, UK',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      organizer: 'African Chefs Association UK',
      attendees: 500,
      rating: 4.7,
      category: 'food',
      features: ['Food', 'Cultural', 'Entertainment', 'Workshops'],
      price: '£15 - £30',
      popularity: 88,
      description: 'Indulge in the diverse flavors of African cuisine. This festival features food stalls from various African countries, cooking demonstrations, tasting sessions, and cultural performances celebrating the rich culinary traditions of Africa.'
    },
    {
      id: 5,
      name: 'Tech Summit Lagos',
      date: '2024-11-05',
      time: '9:00 AM',
      location: 'Lagos, Nigeria',
      image: 'https://images.unsplash.com/photo-1540304453527-62f979142a17?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      organizer: 'Nigerian Tech Association',
      attendees: 400,
      rating: 4.8,
      category: 'tech',
      features: ['Technology', 'Networking', 'Workshops', 'Presentations'],
      price: '₦15,000 - ₦50,000',
      popularity: 90,
      description: 'Join tech innovators, entrepreneurs, and industry leaders at Nigeria\'s premier technology conference. Featuring keynote speeches, panel discussions, product showcases, and networking opportunities focused on Africa\'s growing tech ecosystem.'
    },
    {
      id: 6,
      name: 'London Nigeria Fashion Week',
      date: '2024-11-15',
      time: '7:00 PM',
      location: 'London, UK',
      image: 'https://images.unsplash.com/photo-1605289355680-75fb41239154?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      organizer: 'Nigerian Fashion Council',
      attendees: 350,
      rating: 4.7,
      category: 'fashion',
      features: ['Fashion', 'Cultural', 'Networking', 'Entertainment'],
      price: '£80 - £200',
      popularity: 89,
      description: 'Experience the vibrant colors and innovative designs of Nigerian fashion. This prestigious event showcases collections from established and emerging Nigerian designers, celebrating the fusion of traditional African aesthetics with contemporary styles.'
    },
    {
      id: 7,
      name: 'Annual Charity Gala',
      date: '2024-12-10',
      time: '6:30 PM',
      location: 'Abuja, Nigeria',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      organizer: 'Nigerian Youth Foundation',
      attendees: 250,
      rating: 4.8,
      category: 'charity',
      features: ['Charity', 'Dinner', 'Auction', 'Entertainment'],
      price: '₦100,000 - ₦250,000',
      popularity: 87,
      description: 'Support educational initiatives for underprivileged youth in Nigeria at this elegant charity gala. The evening includes a gourmet dinner, silent auction, live entertainment, and inspiring speeches from community leaders and beneficiaries.'
    },
    {
      id: 8,
      name: 'New Year\'s Eve Celebration',
      date: '2024-12-31',
      time: '8:00 PM',
      location: 'Birmingham, UK',
      image: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      organizer: 'Nigerian-British Association',
      attendees: 500,
      rating: 4.9,
      category: 'celebration',
      features: ['Celebration', 'Dinner', 'Music', 'Dancing'],
      price: '£150 - £300',
      popularity: 94,
      description: 'Ring in the New Year with the Nigerian-British community at this spectacular celebration. Enjoy a luxurious dinner, live music performances, traditional and modern dancing, and a countdown to midnight with spectacular fireworks.'
    },
    {
      id: 9,
      name: 'Nigerian Independence Day Concert',
      date: '2024-10-01',
      time: '5:00 PM',
      location: 'Lagos, Nigeria',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      organizer: 'Ministry of Culture',
      attendees: 1000,
      rating: 4.9,
      category: 'concert',
      features: ['Music', 'Cultural', 'Celebration', 'Food'],
      price: '₦2,000 - ₦15,000',
      popularity: 98,
      description: 'Celebrate Nigeria\'s independence with a spectacular concert featuring top Nigerian artists, cultural performances, and patriotic celebrations. A night of music, dance, and national pride commemorating Nigeria\'s freedom.'
    },
    {
      id: 10,
      name: 'African Literature Festival',
      date: '2024-09-25',
      time: '10:00 AM',
      location: 'London, UK',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      organizer: 'African Writers Guild',
      attendees: 300,
      rating: 4.7,
      category: 'cultural',
      features: ['Literature', 'Workshops', 'Book Signing', 'Discussions'],
      price: '£25 - £50',
      popularity: 86,
      description: 'Immerse yourself in the rich literary traditions of Africa. This festival brings together renowned African authors, poets, and playwrights for readings, panel discussions, workshops, and book signings celebrating African storytelling.'
    },
    {
      id: 11,
      name: 'Nigerian Startup Pitch Competition',
      date: '2024-10-18',
      time: '1:00 PM',
      location: 'Lagos, Nigeria',
      image: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      organizer: 'Lagos Innovation Hub',
      attendees: 200,
      rating: 4.6,
      category: 'business',
      features: ['Startup', 'Pitch', 'Networking', 'Investment'],
      price: '₦10,000',
      popularity: 88,
      description: 'Watch Nigeria\'s most promising startups pitch their innovative ideas to a panel of investors and industry experts. This competition offers funding opportunities, mentorship, and valuable connections for emerging entrepreneurs.'
    },
    {
      id: 12,
      name: 'African Art Exhibition',
      date: '2024-11-10',
      time: '11:00 AM',
      location: 'Manchester, UK',
      image: 'https://images.unsplash.com/photo-1561839561-b13bcfe95249?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      organizer: 'African Art Foundation',
      attendees: 350,
      rating: 4.8,
      category: 'art',
      features: ['Art', 'Exhibition', 'Cultural', 'Workshops'],
      price: '£10 - £20',
      popularity: 89,
      description: 'Explore the diverse artistic expressions from across Africa in this comprehensive exhibition. Featuring contemporary and traditional works by established and emerging African artists, with guided tours, artist talks, and creative workshops.'
    }
  ];

  // Toggle favorite status
  const toggleFavorite = (eventId) => {
    setFavorites(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId) 
        : [...prev, eventId]
    );
  };

  // Filter events based on search query, category, and rating
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesRating = event.rating >= ratingFilter;
    
    return matchesSearch && matchesCategory && matchesRating;
  });
  
  // Sort events based on selection
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortOption) {
      case 'date':
        return new Date(a.date) - new Date(b.date);
      case 'attendees':
        return b.attendees - a.attendees;
      case 'rating':
        return b.rating - a.rating;
      case 'popularity':
        return b.popularity - a.popularity;
      default:
        return new Date(a.date) - new Date(b.date);
    }
  });
  
  const handleLoadMore = () => {
    setVisibleItems(prev => prev + 4);
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Amazing Events</h1>
          <p className="text-xl mb-8 max-w-3xl">Find and attend the best events in Nigeria and the UK. Connect with your community and create unforgettable memories.</p>
          
          {/* Search bar */}
          <div className="relative max-w-3xl">
            <input
              type="text"
              placeholder="Search for events, locations, or keywords..."
              className="w-full px-5 py-4 rounded-full bg-white/90 backdrop-blur-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 pl-12 shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-4 text-gray-500" size={20} />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-700 font-medium flex items-center gap-1">
                <Filter size={16} />
                Filter By:
              </span>
              
              {/* Category Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-gray-100 rounded-full px-4 py-2 pr-8 focus:outline-none hover:bg-gray-200 transition-colors"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="cultural">Cultural</option>
                  <option value="business">Business</option>
                  <option value="tech">Technology</option>
                  <option value="food">Food</option>
                  <option value="fashion">Fashion</option>
                  <option value="charity">Charity</option>
                  <option value="wedding">Wedding</option>
                  <option value="celebration">Celebration</option>
                  <option value="concert">Concert</option>
                  <option value="art">Art</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
              
              {/* Rating Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-gray-100 rounded-full px-4 py-2 pr-8 focus:outline-none hover:bg-gray-200 transition-colors"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(Number(e.target.value))}
                >
                  <option value="0">All Ratings</option>
                  <option value="4.5">4.5+</option>
                  <option value="4">4.0+</option>
                  <option value="3.5">3.5+</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium">Sort By:</span>
              <div className="relative">
                <select
                  className="appearance-none bg-gray-100 rounded-full px-4 py-2 pr-8 focus:outline-none hover:bg-gray-200 transition-colors"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="date">Date (Soonest)</option>
                  <option value="attendees">Attendees</option>
                  <option value="rating">Rating</option>
                  <option value="popularity">Popularity</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {Math.min(visibleItems, filteredEvents.length)} of {filteredEvents.length} events
          </p>
        </div>
        
        {/* Events Grid */}
        {isLoaded ? (
          <>
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedEvents.slice(0, visibleItems).map((event) => (
                  <div 
                    key={event.id} 
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
                  >
                    <div className="relative">
                      <img 
                        src={event.image} 
                        alt={event.name} 
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4 w-full">
                        <div className="flex justify-between items-center">
                          <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                          </div>
                          <button 
                            onClick={() => toggleFavorite(event.id)}
                            className="text-white hover:text-red-500 transition-colors"
                          >
                            <Heart 
                              size={20} 
                              className={favorites.includes(event.id) ? "fill-red-500 text-red-500" : ""} 
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-grow">
                      <h3 className="text-lg font-bold mb-2 text-gray-900">{event.name}</h3>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="text-sm">{formatDate(event.date)} • {event.time}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-sm">{event.attendees} attendees</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-3">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        <span className="text-sm">{event.rating} rating</span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {event.features.slice(0, 3).map((feature, index) => (
                          <span 
                            key={index} 
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center"
                          >
                            <Tag size={10} className="mr-1" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 pt-0 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-red-600 font-semibold">{event.price}</span>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center transition-colors">
                          Details
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 inline-block p-4 rounded-full mb-4">
                  <Calendar className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No events found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  We couldn't find any events matching your search criteria. Try adjusting your filters or search query.
                </p>
              </div>
            )}
            
            {/* Load More Button */}
            {filteredEvents.length > visibleItems && (
              <div className="text-center mt-8">
                <button 
                  onClick={handleLoadMore}
                  className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-6 border border-gray-300 rounded-full shadow-sm transition-colors"
                >
                  Load More Events
                </button>
              </div>
            )}
          </>
        ) : (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md h-96 animate-pulse">
                <div className="bg-gray-300 h-48 w-full"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-4/6 mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded w-full mt-auto"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events; 