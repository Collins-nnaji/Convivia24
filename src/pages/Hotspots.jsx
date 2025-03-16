import React, { useState, useEffect } from 'react';
import { MapPin, Star, Filter, Search, ChevronDown, ArrowRight, Clock, Users, Calendar } from 'lucide-react';

const Hotspots = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortOption, setSortOption] = useState('popularity');
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleItems, setVisibleItems] = useState(8);
  
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
  }, []);
  
  // Sample hotspot data
  const hotspots = [
    {
      id: 1,
      name: 'The Grand Ballroom',
      location: 'Lagos, Nigeria',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.8,
      price: '₦500,000 - ₦1,200,000',
      capacity: '200-500',
      type: 'wedding',
      features: ['Catering', 'Decoration', 'Sound System', 'Air Conditioning'],
      openingHours: '9:00 AM - 10:00 PM',
      eventsToday: 3,
      popularity: 95
    },
    {
      id: 2,
      name: 'The Mayfair Hall',
      location: 'London, UK',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.9,
      price: '£3,000 - £8,000',
      capacity: '100-300',
      type: 'corporate',
      features: ['Projector', 'WiFi', 'Catering', 'Parking'],
      openingHours: '8:00 AM - 9:00 PM',
      eventsToday: 2,
      popularity: 92
    },
    {
      id: 3,
      name: 'Ocean View Gardens',
      location: 'Lagos, Nigeria',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.7,
      price: '₦400,000 - ₦900,000',
      capacity: '100-300',
      type: 'wedding',
      features: ['Garden', 'Outdoor', 'Bar', 'Parking'],
      openingHours: '10:00 AM - 11:00 PM',
      eventsToday: 4,
      popularity: 88
    },
    {
      id: 4,
      name: 'The Victoria Hall',
      location: 'Manchester, UK',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.5,
      price: '£2,500 - £5,000',
      capacity: '50-200',
      type: 'birthday',
      features: ['DJ Booth', 'Dance Floor', 'Bar', 'Security'],
      openingHours: '11:00 AM - 12:00 AM',
      eventsToday: 1,
      popularity: 85
    },
    {
      id: 5,
      name: 'Royal Event Center',
      location: 'Abuja, Nigeria',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.6,
      price: '₦350,000 - ₦800,000',
      capacity: '150-400',
      type: 'corporate',
      features: ['Conference Setup', 'Projector', 'WiFi', 'Parking'],
      openingHours: '8:00 AM - 8:00 PM',
      eventsToday: 2,
      popularity: 87
    },
    {
      id: 6,
      name: 'The Vintage Hall',
      location: 'Birmingham, UK',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.4,
      price: '£2,000 - £4,500',
      capacity: '80-250',
      type: 'wedding',
      features: ['Historic Building', 'Garden', 'Catering', 'Ceremony Space'],
      openingHours: '9:00 AM - 9:00 PM',
      eventsToday: 1,
      popularity: 82
    },
    {
      id: 7,
      name: 'Seaside Event Center',
      location: 'Port Harcourt, Nigeria',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.3,
      price: '₦300,000 - ₦650,000',
      capacity: '100-250',
      type: 'birthday',
      features: ['Waterfront', 'Outdoor', 'Bar', 'Parking'],
      openingHours: '10:00 AM - 10:00 PM',
      eventsToday: 2,
      popularity: 80
    },
    {
      id: 8,
      name: 'The Crystal Palace',
      location: 'London, UK',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.9,
      price: '£5,000 - £12,000',
      capacity: '200-600',
      type: 'corporate',
      features: ['Luxury', 'Full Service', 'Parking', 'Security'],
      openingHours: '7:00 AM - 11:00 PM',
      eventsToday: 3,
      popularity: 94
    },
  ];

  // Filter hotspots based on search query, location, and rating
  const filteredHotspots = hotspots.filter(hotspot => {
    const matchesSearch = hotspot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         hotspot.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || 
                          (selectedLocation === 'nigeria' && hotspot.location.includes('Nigeria')) ||
                          (selectedLocation === 'uk' && hotspot.location.includes('UK'));
    const matchesRating = hotspot.rating >= ratingFilter;
    
    return matchesSearch && matchesLocation && matchesRating;
  });
  
  // Sort hotspots based on selection
  const sortedHotspots = [...filteredHotspots].sort((a, b) => {
    switch (sortOption) {
      case 'rating':
        return b.rating - a.rating;
      case 'capacity':
        return parseInt(b.capacity.split('-')[1]) - parseInt(a.capacity.split('-')[1]);
      case 'popularity':
        return b.popularity - a.popularity;
      default:
        return b.rating - a.rating;
    }
  });
  
  const handleLoadMore = () => {
    setVisibleItems(prev => prev + 4);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Popular Event Hotspots</h1>
          <p className="text-xl mb-8">Discover the most sought-after venues and event spaces</p>
          
          {/* Search bar */}
          <div className="relative max-w-3xl">
            <input
              type="text"
              placeholder="Search for venues or locations..."
              className="w-full px-5 py-3 rounded-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 pl-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-700 font-medium">Filter By:</span>
              
              {/* Location Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-gray-100 rounded-full px-4 py-2 pr-8 focus:outline-none"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  <option value="nigeria">Nigeria</option>
                  <option value="uk">United Kingdom</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
              
              {/* Rating Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-gray-100 rounded-full px-4 py-2 pr-8 focus:outline-none"
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
                  className="appearance-none bg-gray-100 rounded-full px-4 py-2 pr-8 focus:outline-none"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="popularity">Popularity</option>
                  <option value="rating">Rating</option>
                  <option value="capacity">Capacity</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Hotspots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoaded ? (
            sortedHotspots.slice(0, visibleItems).map((hotspot, index) => (
              <div
                key={hotspot.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img 
                    src={hotspot.image} 
                    alt={hotspot.name} 
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                    {hotspot.rating}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1">{hotspot.name}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{hotspot.location}</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {hotspot.type.charAt(0).toUpperCase() + hotspot.type.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-sm">{hotspot.eventsToday} Events Today</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">{hotspot.openingHours}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">Capacity: {hotspot.capacity}</span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-gray-800 font-medium mb-1">Price Range:</div>
                    <div className="text-red-600 font-medium">{hotspot.price}</div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-gray-800 font-medium mb-1">Features:</div>
                    <div className="flex flex-wrap gap-1">
                      {hotspot.features.slice(0, 3).map((feature, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {feature}
                        </span>
                      ))}
                      {hotspot.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{hotspot.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center">
                    View Details
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            // Loading skeletons
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Load More Button */}
        {isLoaded && sortedHotspots.length > visibleItems && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-white border border-red-600 text-red-600 rounded-full hover:bg-red-50 transition-colors"
            >
              Load More Hotspots
            </button>
          </div>
        )}
        
        {sortedHotspots.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No hotspots found</h3>
            <p className="text-gray-500">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hotspots; 