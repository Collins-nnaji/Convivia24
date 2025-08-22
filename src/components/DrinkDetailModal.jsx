import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Star, ShoppingCart, Heart, Share2, Award, MapPin, 
  Clock, Users, Wine, Calendar, Target, Sparkles, Crown,
  ChevronLeft, ChevronRight, Info, Gift, Zap
} from 'lucide-react';
import { useLoyalty } from '../context/LoyaltyContext';

const DrinkDetailModal = ({ drink, isOpen, onClose, onAddToCart }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const { loyaltyData } = useLoyalty();

  if (!drink) return null;

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

  const getCategoryInfo = (category) => {
    const categoryData = {
      vodka: { 
        icon: <Zap className="text-blue-400" size={20} />, 
        color: 'from-blue-400 to-cyan-400',
        description: 'Pure, clean spirits perfect for cocktails and celebrations'
      },
      whisky: { 
        icon: <Crown className="text-amber-500" size={20} />, 
        color: 'from-amber-400 to-orange-400',
        description: 'Aged spirits with complex flavors and rich heritage'
      },
      whiskey: { 
        icon: <Crown className="text-amber-500" size={20} />, 
        color: 'from-amber-400 to-orange-400',
        description: 'Aged spirits with complex flavors and rich heritage'
      },
      cognac: { 
        icon: <Wine className="text-purple-500" size={20} />, 
        color: 'from-purple-400 to-pink-400',
        description: 'Luxurious French brandy representing prestige and sophistication'
      },
      tequila: { 
        icon: <Target className="text-green-500" size={20} />, 
        color: 'from-green-400 to-teal-400',
        description: 'Bold Mexican spirits perfect for celebrations and good times'
      }
    };
    return categoryData[category] || categoryData.vodka;
  };

  const categoryInfo = getCategoryInfo(drink.category);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'taste', label: 'Taste Profile', icon: Wine },
    { id: 'occasions', label: 'Occasions', icon: Calendar },
    { id: 'story', label: 'Story', icon: Sparkles }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`relative p-6 bg-gradient-to-r ${categoryInfo.color} text-white`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  {categoryInfo.icon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{drink.name}</h1>
                  <p className="text-white/80 text-lg">{drink.brand}</p>
                </div>
              </div>
              
              <p className="text-white/90 max-w-2xl">{categoryInfo.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Left Column - Image and Basic Info */}
              <div className="space-y-6">
                {/* Product Image */}
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
                    <img 
                      src={drink.images[currentImageIndex] || drink.images[0]} 
                      alt={drink.name}
                      className="w-full h-full object-contain p-8"
                    />
                  </div>
                  
                  {/* Premium Badge */}
                  {(drink.subcategory.includes('premium') || drink.subcategory.includes('luxury')) && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                        <Crown size={16} />
                        PREMIUM
                      </div>
                    </div>
                  )}
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{drink.alcoholContent}%</div>
                    <div className="text-sm text-gray-600">Alcohol Content</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{drink.volume}ml</div>
                    <div className="text-sm text-gray-600">Volume</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="text-yellow-400 fill-current" size={16} />
                      <span className="text-xl font-bold text-gray-900">{drink.rating}</span>
                    </div>
                    <div className="text-sm text-gray-600">{drink.reviewCount} Reviews</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MapPin size={16} className="text-gray-600" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">{drink.origin}</div>
                    <div className="text-xs text-gray-600">Origin</div>
                  </div>
                </div>

                {/* Awards */}
                {drink.awards && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="text-yellow-600" size={20} />
                      <h3 className="font-semibold text-gray-900">Awards & Recognition</h3>
                    </div>
                    <div className="space-y-1">
                      {drink.awards.map((award, idx) => (
                        <div key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                          {award}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Detailed Information */}
              <div className="space-y-6">
                {/* Pricing Section */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
                  <div className="space-y-3">
                    {drink.discount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-gray-400 line-through">{formatPrice(drink.originalPrice)}</span>
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          -{drink.discount}% OFF
                        </span>
                      </div>
                    )}
                    
                    {loyaltyData.tier.id !== 'bronze' && (
                      <div className="text-green-600 font-medium">
                        {loyaltyData.tier.name} discount: -{formatPrice(getTierDiscount(drink.price))}
                      </div>
                    )}
                    
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(finalPrice)}
                    </div>
                    
                    {totalSavings > 0 && (
                      <div className="text-green-600 font-medium">
                        Total savings: {formatPrice(totalSavings)}
                      </div>
                    )}
                  </div>

                  {/* Quantity and Add to Cart */}
                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Qty:</span>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button 
                          onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onAddToCart({ ...drink, quantity })}
                      className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={20} />
                      Add to Cart
                    </button>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                  <div className="flex space-x-8">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-3 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-red-500 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <tab.icon size={16} />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px]">
                  <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                      <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                          <p className="text-gray-700">{drink.description}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">What it Represents</h3>
                          <p className="text-gray-700">{drink.significance}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Personality</h3>
                          <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 rounded-full font-medium">
                            {drink.personality}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'taste' && (
                      <motion.div
                        key="taste"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Tasting Notes</h3>
                          <div className="flex flex-wrap gap-2">
                            {drink.tastingNotes.map((note, idx) => (
                              <span key={idx} className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {note}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Perfect Pairings</h3>
                          <div className="flex flex-wrap gap-2">
                            {drink.perfectPairings.map((pairing, idx) => (
                              <span key={idx} className="px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                {pairing}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Serving Style</h3>
                          <p className="text-gray-700">{drink.servingStyle}</p>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'occasions' && (
                      <motion.div
                        key="occasions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Best Occasions</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {drink.bestOccasions.map((occasion, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Calendar className="text-red-500" size={16} />
                                <span className="text-gray-700 font-medium">{occasion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'story' && (
                      <motion.div
                        key="story"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">The Story</h3>
                          <p className="text-gray-700">{drink.story}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DrinkDetailModal;
