import React, { useState, useEffect } from 'react';
import { Star, Filter, Search, ChevronDown, ArrowRight, Clock, Users, Calendar, MapPin, Phone, Mail, Globe } from 'lucide-react';

const Providers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortOption, setSortOption] = useState('popularity');
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleItems, setVisibleItems] = useState(8);
  
  // Animation hooks
  const [activeItemIndex, setActiveItemIndex] = useState(null);
  
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
  }, []);
  
  // Sample provider data
  const providers = [
    {
      id: 1,
      name: 'Elite Catering Services',
      category: 'catering',
      location: 'Lagos, Nigeria',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.8,
      price: '₦50,000 - ₦200,000',
      capacity: '50-500',
      features: ['Custom Menus', 'Staff Service', 'Equipment Rental', 'Special Dietary Options'],
      openingHours: '8:00 AM - 10:00 PM',
      eventsCompleted: 150,
      popularity: 95,
      contact: {
        phone: '+234 123 456 7890',
        email: 'info@elitecatering.com',
        website: 'www.elitecatering.com'
      }
    },
    {
      id: 2,
      name: 'Premium Event Decorators',
      category: 'decoration',
      location: 'London, UK',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.9,
      price: '£500 - £2,000',
      capacity: 'Any Size',
      features: ['Theme Design', 'Custom Props', 'Lighting', 'Floral Arrangements'],
      openingHours: '9:00 AM - 8:00 PM',
      eventsCompleted: 200,
      popularity: 92,
      contact: {
        phone: '+44 20 7123 4567',
        email: 'info@premiumdecorators.com',
        website: 'www.premiumdecorators.com'
      }
    },
    {
      id: 3,
      name: 'Sound & Light Solutions',
      category: 'entertainment',
      location: 'Lagos, Nigeria',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.7,
      price: '₦30,000 - ₦150,000',
      capacity: 'Any Size',
      features: ['Professional DJs', 'Sound Systems', 'Lighting Effects', 'Stage Setup'],
      openingHours: '10:00 AM - 11:00 PM',
      eventsCompleted: 180,
      popularity: 88,
      contact: {
        phone: '+234 987 654 3210',
        email: 'info@soundandlight.com',
        website: 'www.soundandlight.com'
      }
    },
    {
      id: 4,
      name: 'Luxury Beverage Services',
      category: 'beverages',
      location: 'Manchester, UK',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.5,
      price: '£300 - £1,500',
      capacity: '50-300',
      features: ['Bar Service', 'Wine Selection', 'Cocktail Bar', 'Non-Alcoholic Options'],
      openingHours: '11:00 AM - 12:00 AM',
      eventsCompleted: 120,
      popularity: 85,
      contact: {
        phone: '+44 161 123 4567',
        email: 'info@luxurybeverages.com',
        website: 'www.luxurybeverages.com'
      }
    },
    {
      id: 5,
      name: 'Professional Photography',
      category: 'photography',
      location: 'Abuja, Nigeria',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.6,
      price: '₦40,000 - ₦180,000',
      capacity: 'Any Size',
      features: ['Event Coverage', 'Photo Booth', 'Video Recording', 'Online Gallery'],
      openingHours: '8:00 AM - 8:00 PM',
      eventsCompleted: 160,
      popularity: 87,
      contact: {
        phone: '+234 555 123 4567',
        email: 'info@prophotography.com',
        website: 'www.prophotography.com'
      }
    },
    {
      id: 6,
      name: 'Transportation Services',
      category: 'transportation',
      location: 'Birmingham, UK',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.4,
      price: '£200 - £1,000',
      capacity: '2-50',
      features: ['Luxury Vehicles', 'Chauffeur Service', 'Group Transport', 'Airport Pickup'],
      openingHours: '24/7',
      eventsCompleted: 140,
      popularity: 82,
      contact: {
        phone: '+44 121 123 4567',
        email: 'info@luxurytransport.com',
        website: 'www.luxurytransport.com'
      }
    },
    {
      id: 7,
      name: 'Event Security Services',
      category: 'security',
      location: 'Port Harcourt, Nigeria',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.3,
      price: '₦25,000 - ₦100,000',
      capacity: 'Any Size',
      features: ['Trained Personnel', 'Crowd Control', 'Access Control', 'Emergency Response'],
      openingHours: '24/7',
      eventsCompleted: 130,
      popularity: 80,
      contact: {
        phone: '+234 777 123 4567',
        email: 'info@eventsecurity.com',
        website: 'www.eventsecurity.com'
      }
    },
    {
      id: 8,
      name: 'Wedding Planning Specialists',
      category: 'planning',
      location: 'London, UK',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.9,
      price: '£1,000 - £5,000',
      capacity: 'Any Size',
      features: ['Full Planning', 'Day Coordination', 'Vendor Management', 'Timeline Creation'],
      openingHours: '9:00 AM - 6:00 PM',
      eventsCompleted: 170,
      popularity: 94,
      contact: {
        phone: '+44 20 7123 4567',
        email: 'info@weddingplanners.com',
        website: 'www.weddingplanners.com'
      }
    },
  ];

  // Provider categories
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'catering', name: 'Catering' },
    { id: 'decoration', name: 'Decoration' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'beverages', name: 'Beverages' },
    { id: 'photography', name: 'Photography' },
    { id: 'transportation', name: 'Transportation' },
    { id: 'security', name: 'Security' },
    { id: 'planning', name: 'Planning' }
  ];

  // Filter providers based on search query, category, and rating
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         provider.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory;
    const matchesRating = provider.rating >= ratingFilter;
    
    return matchesSearch && matchesCategory && matchesRating;
  });
  
  // Sort providers based on selection
  const sortedProviders = [...filteredProviders].sort((a, b) => {
    switch (sortOption) {
      case 'rating':
        return b.rating - a.rating;
      case 'events':
        return b.eventsCompleted - a.eventsCompleted;
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
          <h1 className="text-4xl font-bold mb-4">Event Service Providers</h1>
          <p className="text-xl mb-8">Find trusted professionals for your event needs</p>
          
          {/* Search bar */}
          <div className="relative max-w-3xl">
            <input
              type="text"
              placeholder="Search for providers or services..."
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
              
              {/* Category Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-gray-100 rounded-full px-4 py-2 pr-8 focus:outline-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
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
                  <option value="events">Events Completed</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoaded ? (
            sortedProviders.slice(0, visibleItems).map((provider, index) => (
              <div
                key={provider.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-transform duration-200"
                onMouseEnter={() => setActiveItemIndex(provider.id)}
                onMouseLeave={() => setActiveItemIndex(null)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={provider.image} 
                    alt={provider.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
                    style={{ 
                      transform: activeItemIndex === provider.id ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-white ml-1 text-sm">{provider.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-1">{provider.name}</h3>
                  <p className="text-gray-500 text-sm mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {provider.location}
                  </p>
                  
                  <div className="flex items-center mb-3">
                    <Users className="h-4 w-4 text-gray-600 mr-1" />
                    <span className="text-sm text-gray-600">Capacity: {provider.capacity}</span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <Clock className="h-4 w-4 text-gray-600 mr-1" />
                    <span className="text-sm text-gray-600">{provider.openingHours}</span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <Calendar className="h-4 w-4 text-gray-600 mr-1" />
                    <span className="text-sm text-gray-600">{provider.eventsCompleted} events completed</span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-red-600">{provider.price}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {provider.features.slice(0, 3).map((feature, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                    {provider.features.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        +{provider.features.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <a href={`tel:${provider.contact.phone}`} className="text-sm text-gray-600 hover:text-red-600 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {provider.contact.phone}
                    </a>
                    <a href={`mailto:${provider.contact.email}`} className="text-sm text-gray-600 hover:text-red-600 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {provider.contact.email}
                    </a>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <a 
                      href={provider.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-red-600 hover:text-red-700 flex items-center"
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      Visit Website
                    </a>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
                      Contact <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
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
        {isLoaded && sortedProviders.length > visibleItems && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-white border border-red-600 text-red-600 rounded-full hover:bg-red-50 transition-colors"
            >
              Load More Providers
            </button>
          </div>
        )}
        
        {sortedProviders.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No providers found</h3>
            <p className="text-gray-500">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Providers; 