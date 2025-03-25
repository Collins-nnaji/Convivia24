import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Filter, ChevronDown,
  Globe, Utensils, Palette, Dumbbell, 
  Plane, Book, Music, Camera, Mountain, 
  Gamepad, Coffee 
} from 'lucide-react';

const FilterPanel = ({ 
  searchQuery, 
  setSearchQuery, 
  location, 
  setLocation, 
  selectedCategory, 
  setSelectedCategory,
  showFilters,
  setShowFilters,
  showAdvancedFilters,
  setShowAdvancedFilters,
  activeHotspot,
  setActiveHotspot,
  ageRange,
  setAgeRange,
  interests,
  hotspots
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
          <input
            type="text"
            placeholder="Find people by interest, name, or bio..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
          <input
            type="text"
            placeholder="Your city or location"
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all shadow-sm"
          >
            <Filter size={18} className="mr-2" />
            Interests
          </button>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-gray-700 transition-colors"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      {/* Interest Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => setSelectedCategory(interest.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    selectedCategory === interest.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <span className={selectedCategory === interest.id ? 'text-blue-200' : 'text-blue-500'}>
                    {interest.icon}
                  </span>
                  <span>{interest.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Active at Hotspot</label>
                <select
                  value={activeHotspot}
                  onChange={(e) => setActiveHotspot(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                >
                  <option value="all">All Hotspots</option>
                  {hotspots.map(hotspot => (
                    <option key={hotspot.id} value={hotspot.id}>{hotspot.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age Range: {ageRange[0]} - {ageRange[1]}</label>
                <div className="px-2">
                  <input
                    type="range"
                    min="18"
                    max="60"
                    value={ageRange[0]}
                    onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])}
                    className="w-full accent-blue-500 mb-3"
                  />
                  <input
                    type="range"
                    min="18"
                    max="60"
                    value={ageRange[1]}
                    onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterPanel; 