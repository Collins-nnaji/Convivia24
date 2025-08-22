import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Star, ShoppingCart, Heart, Share2, Award, MapPin, 
  Clock, Users, Wine, Calendar, Target, Sparkles, Crown,
  Info, Gift, Zap, Plus, Minus, Shield, CheckCircle
} from 'lucide-react';
import { drinksDatabase } from '../data/drinksDatabase';
import { useLoyalty } from '../context/LoyaltyContext';
import { useCart } from '../context/CartContext';

const DrinkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drink, setDrink] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorited, setIsFavorited] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const { loyaltyData, addPoints } = useLoyalty();
  const { addToCart } = useCart();

  useEffect(() => {
    const foundDrink = drinksDatabase.find(d => d.id === parseInt(id));
    if (foundDrink) {
      setDrink(foundDrink);
    } else {
      navigate('/shopping');
    }
  }, [id, navigate]);

  if (!drink) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Loading drink details...</p>
        </div>
      </div>
    );
  }

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
        description: 'Elegant aged brandies with exceptional sophistication'
      },
      tequila: { 
        icon: <Target className="text-green-500" size={20} />, 
        color: 'from-green-400 to-teal-400',
        description: 'Vibrant agave spirits with distinct character'
      }
    };
    return categoryData[category] || { 
      icon: <Wine className="text-gray-500" size={20} />, 
      color: 'from-gray-400 to-slate-400',
      description: 'Premium spirits with unique character'
    };
  };

  const handleAddToCart = () => {
    const finalPrice = drink.price - getTierDiscount(drink.price);
    const pointsEarned = Math.floor(finalPrice * quantity);
    
    addToCart({ ...drink, finalPrice, quantity });
    addPoints(finalPrice * quantity, Date.now().toString());
    
    setNotification({ 
      show: true, 
      message: `${drink.name} (${quantity}) added to cart! Earned ${pointsEarned} points.` 
    });
    setTimeout(() => setNotification({ show: false, message: '' }), 3000);
  };

  const categoryInfo = getCategoryInfo(drink.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Notification */}
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          {notification.message}
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate('/shopping')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Shop
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Heart 
                  size={20} 
                  className={`${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden">
              <img 
                src={drink.images[0]} 
                alt={drink.name}
                className="w-full h-[600px] object-contain p-8"
                onError={(e) => { e.currentTarget.src = '/Convivia24-images-1.jpg'; }}
              />
              
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {(drink.subcategory.includes('premium') || drink.subcategory.includes('luxury')) && (
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Crown size={14} />
                    PREMIUM
                  </div>
                )}
                {drink.discount > 0 && (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{drink.discount}% OFF
                  </div>
                )}
              </div>

              {/* Category Badge */}
              <div className="absolute bottom-6 left-6">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${categoryInfo.color} text-white font-medium`}>
                  {categoryInfo.icon}
                  <span className="capitalize">{drink.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {drink.brand}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <span className="text-sm font-medium text-gray-700">{drink.rating}</span>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {drink.name}
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                {drink.description}
              </p>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} />
                <span>{drink.origin}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Wine size={16} />
                <span>{drink.volume}ml • {drink.alcoholContent}% ABV</span>
              </div>
            </div>

            {/* Personality */}
            <div>
              <div className="inline-block px-4 py-2 rounded-full text-white bg-gradient-to-r from-purple-500 to-blue-500 font-medium">
                {drink.personality}
              </div>
            </div>

            {/* What it Represents */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="text-purple-500" size={20} />
                What it Represents
              </h3>
              <p className="text-gray-700">{drink.whatItRepresents}</p>
            </div>

            {/* Best Occasions */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="text-blue-500" size={20} />
                Perfect For
              </h3>
              <div className="flex flex-wrap gap-2">
                {drink.bestOccasions.map((occasion, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {occasion}
                  </span>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 rounded-2xl p-6">
              {drink.discount > 0 && (
                <div className="text-lg text-gray-400 line-through mb-2">
                  {formatPrice(drink.originalPrice)}
                </div>
              )}
              
              {loyaltyData.tier.id !== 'bronze' && (
                <div className="text-green-600 mb-2">
                  {loyaltyData.tier.name} discount: -{formatPrice(getTierDiscount(drink.price))}
                </div>
              )}
              
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {formatPrice(finalPrice)}
              </div>
              
              {totalSavings > 0 && (
                <div className="text-green-600 font-medium">
                  You save {formatPrice(totalSavings)}!
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-colors text-lg"
              >
                <ShoppingCart size={20} />
                Add to Cart • {formatPrice(finalPrice * quantity)}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 pt-6 border-t">
              <div className="flex items-center gap-2 text-green-600">
                <Shield size={16} />
                <span className="text-sm font-medium">Age Verified</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Authentic Product</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['overview', 'tasting', 'pairings', 'story'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'overview' ? 'Overview' :
                   tab === 'tasting' ? 'Tasting Notes' :
                   tab === 'pairings' ? 'Perfect Pairings' :
                   'Origin Story'}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'overview' && (
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {drink.description}
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Product Details</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>Volume: {drink.volume}ml</li>
                      <li>Alcohol Content: {drink.alcoholContent}% ABV</li>
                      <li>Origin: {drink.origin}</li>
                      <li>Brand: {drink.brand}</li>
                    </ul>
                  </div>
                  {drink.awards && drink.awards.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Awards & Recognition</h4>
                      <ul className="space-y-2 text-gray-600">
                        {drink.awards.map((award, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Award size={16} className="text-yellow-500" />
                            {award}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tasting' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Tasting Notes</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {drink.tastingNotes.map((note, idx) => (
                    <div key={idx} className="bg-blue-50 rounded-xl p-4 text-center">
                      <div className="text-blue-700 font-medium">{note}</div>
                    </div>
                  ))}
                </div>
                {drink.servingSuggestions && (
                  <div className="mt-8">
                    <h4 className="font-semibold text-gray-900 mb-4">Serving Suggestions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {drink.servingSuggestions.map((suggestion, idx) => (
                        <div key={idx} className="bg-green-50 rounded-xl p-4">
                          <div className="text-green-700">{suggestion}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pairings' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Perfect Pairings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drink.perfectPairings.map((pairing, idx) => (
                    <div key={idx} className="bg-green-50 rounded-xl p-4 text-center">
                      <div className="text-green-700 font-medium">{pairing}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'story' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Origin Story</h3>
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {drink.originStory}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrinkDetail;
