import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wine, UtensilsCrossed, GlassWater, Martini, Coffee, ArrowRight, Star } from 'lucide-react';

const BrandSpotlightSection = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState('restaurants');
  const [highlightedBrand, setHighlightedBrand] = useState(null);
  
  // Sample brand data - would come from an API in a real implementation
  const brandData = {
    restaurants: [
      {
        id: 1,
        name: 'The Garden Terrace',
        logo: '/images/brands/restaurant1.jpg',
        description: 'A premium dining experience offering a fusion of continental and local dishes in an elegant setting.',
        location: 'Lagos, Nigeria',
        rating: 4.8,
        specialOffer: '15% off for Convivia24 event bookings',
        highlight: true
      },
      {
        id: 2,
        name: 'Mayfair Brasserie',
        logo: '/images/brands/restaurant2.jpg',
        description: 'Classic British cuisine with a contemporary twist, perfect for elegant celebrations.',
        location: 'London, UK',
        rating: 4.7,
        specialOffer: 'Complimentary champagne for groups of 10+',
        highlight: false
      },
      {
        id: 3,
        name: 'Spice Harbour',
        logo: '/images/brands/restaurant3.jpg',
        description: 'Authentic Indian cuisine with a focus on shared dining experiences for groups and celebrations.',
        location: 'Manchester, UK',
        rating: 4.6,
        specialOffer: 'Custom menu planning for events',
        highlight: false
      }
    ],
    beverages: [
      {
        id: 1,
        name: 'Royal Oak Winery',
        logo: '/images/brands/beverage1.jpg',
        description: 'Premium wines sourced from vineyards around the world, perfect for sophisticated celebrations.',
        location: 'Lagos, Nigeria',
        rating: 4.9,
        specialOffer: 'Free tasting session for event planners',
        highlight: true
      },
      {
        id: 2,
        name: 'Highland Spirits',
        logo: '/images/brands/beverage2.jpg',
        description: 'Luxury spirits and craft cocktail ingredients for memorable celebration experiences.',
        location: 'Edinburgh, UK',
        rating: 4.8,
        specialOffer: 'Mixologist included with large orders',
        highlight: false
      },
      {
        id: 3,
        name: 'Tropical Blends',
        logo: '/images/brands/beverage3.jpg',
        description: 'Non-alcoholic premium beverages for inclusive celebrations that everyone can enjoy.',
        location: 'Port Harcourt, Nigeria',
        rating: 4.7,
        specialOffer: 'Special pricing for bulk orders',
        highlight: false
      }
    ],
    catering: [
      {
        id: 1,
        name: 'Elegance Catering',
        logo: '/images/brands/catering1.jpg',
        description: 'Full-service catering for events of all sizes, specializing in fusion cuisine and presentation.',
        location: 'Abuja, Nigeria',
        rating: 4.9,
        specialOffer: 'Free dessert station with packages over £2000',
        highlight: true
      },
      {
        id: 2,
        name: 'Gourmet Gatherings',
        logo: '/images/brands/catering2.jpg',
        description: 'Bespoke catering solutions with a focus on locally-sourced ingredients and sustainable practices.',
        location: 'Birmingham, UK',
        rating: 4.8,
        specialOffer: 'Custom menu consultation included',
        highlight: false
      },
      {
        id: 3,
        name: 'Celebration Chefs',
        logo: '/images/brands/catering3.jpg',
        description: 'Interactive food experiences including live cooking stations and themed food presentations.',
        location: 'Liverpool, UK',
        rating: 4.7,
        specialOffer: '10% discount for weekday events',
        highlight: false
      }
    ]
  };
  
  // Set initial highlighted brand
  useEffect(() => {
    const highlighted = brandData[activeCategory].find(brand => brand.highlight) || brandData[activeCategory][0];
    setHighlightedBrand(highlighted);
  }, [activeCategory]);
  
  const categoryIcons = {
    restaurants: <UtensilsCrossed size={20} />,
    beverages: <Wine size={20} />,
    catering: <Coffee size={20} />
  };
  
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };
  
  const handleBrandSelect = (brand) => {
    setHighlightedBrand(brand);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 md:p-8 relative overflow-hidden"
    >
      <div className="absolute top-4 right-4">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-red-700 dark:text-red-400 mb-2">Brand Spotlight</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Featuring premium partners to elevate your celebration experience
        </p>
      </div>
      
      {/* Category Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.keys(brandData).map(category => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`flex items-center px-4 py-2 rounded-full transition-all ${
              activeCategory === category 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">{categoryIcons[category]}</span>
            <span className="capitalize">{category}</span>
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Featured Brand Highlight */}
        {highlightedBrand && (
          <div className="lg:col-span-2 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <div className="w-full h-48 bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden flex items-center justify-center">
                  <img 
                    src={highlightedBrand.logo} 
                    alt={highlightedBrand.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=Brand+Logo';
                    }}
                  />
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-yellow-500 flex items-center">
                    <Star size={16} fill="currentColor" className="mr-1" />
                    {highlightedBrand.rating}
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{highlightedBrand.location}</span>
                </div>
              </div>
              
              <div className="w-full md:w-2/3">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">{highlightedBrand.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{highlightedBrand.description}</p>
                
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg mb-4">
                  <p className="text-yellow-800 dark:text-yellow-500 font-medium">
                    <span className="font-bold">Special Offer:</span> {highlightedBrand.specialOffer}
                  </p>
                </div>
                
                <button className="flex items-center text-red-700 dark:text-red-400 font-medium hover:text-red-800 dark:hover:text-red-300 transition-colors">
                  Learn more about this partner
                  <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Brand List */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 capitalize">
            Featured {activeCategory}
          </h3>
          
          <div className="space-y-4">
            {brandData[activeCategory].map(brand => (
              <button
                key={brand.id}
                onClick={() => handleBrandSelect(brand)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  highlightedBrand?.id === brand.id 
                    ? 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-600'
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center mr-3 flex-shrink-0">
                    <img 
                      src={brand.logo} 
                      alt={brand.name}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/100?text=Logo';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">{brand.name}</h4>
                    <div className="flex items-center">
                      <span className="text-yellow-500 flex items-center text-sm">
                        <Star size={14} fill="currentColor" className="mr-1" />
                        {brand.rating}
                      </span>
                      <span className="mx-2 text-gray-400 text-xs">•</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">{brand.location}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
          Discover All Partners
        </button>
      </div>
    </motion.div>
  );
};

export default BrandSpotlightSection; 