import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, ShoppingCart, Eye, Star, MapPin, Award, 
  Clock, Users, Sparkles, Info, ChevronRight, Crown,
  Wine, Calendar, Target, Zap
} from 'lucide-react';
import { useLoyalty } from '../context/LoyaltyContext';

const ModernDrinkCard = ({ drink, onAddToCart, onViewDetails, featured = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const { loyaltyData } = useLoyalty();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const getTierDiscount = (price) => {
    const discountRate = loyaltyData.tier.id === 'gold' ? 0.10 : 
                        loyaltyData.tier.id === 'silver' ? 0.05 : 0.02;
    return price * discountRate;
  };

  const finalPrice = drink.price - getTierDiscount(drink.price);
  const totalSavings = drink.originalPrice - finalPrice;

  const getCategoryIcon = (category) => {
    const icons = {
      vodka: <Zap className="text-blue-400" size={16} />,
      whisky: <Crown className="text-amber-500" size={16} />,
      whiskey: <Crown className="text-amber-500" size={16} />,
      cognac: <Wine className="text-purple-500" size={16} />,
      tequila: <Target className="text-green-500" size={16} />
    };
    return icons[category] || <Wine className="text-gray-500" size={16} />;
  };

  const getPersonalityColor = (personality) => {
    if (personality.includes('sophisticated') || personality.includes('elegant')) return 'from-purple-500 to-blue-500';
    if (personality.includes('bold') || personality.includes('confident')) return 'from-red-500 to-orange-500';
    if (personality.includes('refined') || personality.includes('prestigious')) return 'from-yellow-500 to-amber-500';
    if (personality.includes('warm') || personality.includes('welcoming')) return 'from-green-500 to-teal-500';
    return 'from-gray-500 to-slate-500';
  };

  return (
    <motion.div
      className={`group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ${
        featured ? 'ring-2 ring-gradient-to-r from-yellow-400 to-red-500' : ''
      }`}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
    >
      {/* Premium Badge */}
      {(drink.subcategory.includes('premium') || drink.subcategory.includes('luxury')) && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Crown size={12} />
            PREMIUM
          </div>
        </div>
      )}

      {/* Discount Badge */}
      {drink.discount > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            -{drink.discount}% OFF
          </div>
        </div>
      )}

      {/* Favorite Button */}
      <button
        onClick={() => setIsFavorited(!isFavorited)}
        className="absolute top-4 right-16 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
      >
        <Heart 
          size={16} 
          className={`${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'} transition-colors`} 
        />
      </button>

      {/* Product Image with Overlay Effects */}
      <div className="relative h-80 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <img 
          src={drink.images[0]} 
          alt={drink.name}
          className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Floating Action Buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <motion.button 
            onClick={() => setShowQuickView(true)}
            className="p-3 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full shadow-lg hover:bg-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye size={20} />
          </motion.button>
          <motion.button 
            onClick={() => onAddToCart(drink)}
            className="p-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart size={20} />
          </motion.button>
        </div>

        {/* Category Icon */}
        <div className="absolute bottom-4 left-4">
          <div className="p-2 bg-white/90 backdrop-blur-sm rounded-full">
            {getCategoryIcon(drink.category)}
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-6">
        {/* Brand and Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {drink.brand}
          </span>
          <div className="flex items-center gap-1">
            <Star className="text-yellow-400 fill-current" size={14} />
            <span className="text-sm font-medium text-gray-700">{drink.rating}</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
          {drink.name}
        </h3>

        {/* Origin and Volume */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{drink.origin}</span>
          </div>
          <div className="flex items-center gap-1">
            <Wine size={14} />
            <span>{drink.volume}ml</span>
          </div>
        </div>

        {/* Personality Tag */}
        <div className="mb-4">
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getPersonalityColor(drink.personality)}`}>
            {drink.personality}
          </div>
        </div>

        {/* Best Occasions */}
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2">
            <Calendar size={14} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Best For</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {drink.bestOccasions.slice(0, 2).map((occasion, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                {occasion}
              </span>
            ))}
            {drink.bestOccasions.length > 2 && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                +{drink.bestOccasions.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-4">
          {drink.discount > 0 && (
            <div className="text-sm text-gray-400 line-through mb-1">
              {formatPrice(drink.originalPrice)}
            </div>
          )}
          
          {loyaltyData.tier.id !== 'bronze' && (
            <div className="text-sm text-green-600 mb-1">
              {loyaltyData.tier.name} discount: -{formatPrice(getTierDiscount(drink.price))}
            </div>
          )}
          
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(finalPrice)}
          </div>
          
          {totalSavings > 0 && (
            <div className="text-sm text-green-600 font-medium">
              You save {formatPrice(totalSavings)}!
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={() => onViewDetails(drink)}
            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Info size={16} />
            Details
          </button>
          <button 
            onClick={() => onAddToCart(drink)}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={16} />
            Add
          </button>
        </div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuickView(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{drink.name}</h3>
                    <p className="text-gray-600">{drink.brand}</p>
                  </div>
                  <button 
                    onClick={() => setShowQuickView(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img 
                      src={drink.images[0]} 
                      alt={drink.name}
                      className="w-full h-64 object-contain bg-gray-50 rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">What it represents:</h4>
                      <p className="text-gray-600 text-sm">{drink.significance}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tasting Notes:</h4>
                      <div className="flex flex-wrap gap-1">
                        {drink.tastingNotes.map((note, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Perfect Pairings:</h4>
                      <div className="flex flex-wrap gap-1">
                        {drink.perfectPairings.map((pairing, idx) => (
                          <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {pairing}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <button 
                        onClick={() => {
                          onAddToCart(drink);
                          setShowQuickView(false);
                        }}
                        className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
                      >
                        Add to Cart - {formatPrice(finalPrice)}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ModernDrinkCard;
