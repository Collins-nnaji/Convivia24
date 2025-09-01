import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Minus, 
  Plus, 
  MapPin, 
  Sliders, 
  ShoppingCart, 
  Heart, 
  Eye, 
  Crown, 
  Target, 
  Wine, 
  Sparkles, 
  ArrowRight, 
  Truck, 
  Package, 
  Users, 
  Building, 
  BarChart3, 
  DollarSign,
  Zap,
  Gift,
  Grid,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { drinksDatabase, getByCategory, getByOccasion, getFeaturedPremium } from '../data/drinksDatabase';
import SimpleDrinkCard from '../components/SimpleDrinkCard';
import BundleModal from '../components/BundleModal';
import VIPDrops from '../components/VIPDrops';
import Notification from '../components/Notification';


const ModernShopping = () => {
  const navigate = useNavigate();
  const [drinks, setDrinks] = useState(drinksDatabase);
  const [filteredDrinks, setFilteredDrinks] = useState(drinksDatabase);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [activeTab, setActiveTab] = useState('drinks'); // 'drinks', 'bundles', or 'vip'
  const [showPartyCalculator, setShowPartyCalculator] = useState(false);
  const [partySize, setPartySize] = useState(10);
  const [partyType, setPartyType] = useState('casual');
  const [priceRange, setPriceRange] = useState([0, 3000000]);
  const { addToCart } = useCart();
  const { loyaltyData, addPoints } = useLoyalty();

  const categories = [
    { id: 'all', name: 'All Products', icon: <Wine size={20} />, color: 'from-gray-400 to-gray-600' },
    { id: 'vodka', name: 'Vodka', icon: <Zap size={20} />, color: 'from-blue-400 to-cyan-500' },
    { id: 'whisky', name: 'Whisky', icon: <Crown size={20} />, color: 'from-amber-400 to-orange-500' },
    { id: 'whiskey', name: 'Whiskey', icon: <Crown size={20} />, color: 'from-amber-500 to-yellow-500' },
    { id: 'cognac', name: 'Cognac', icon: <Wine size={20} />, color: 'from-purple-400 to-pink-500' },
    { id: 'tequila', name: 'Tequila', icon: <Target size={20} />, color: 'from-green-400 to-teal-500' },
    { id: 'wine', name: 'Wine', icon: <Wine size={20} />, color: 'from-red-400 to-purple-500' },
    { id: 'champagne', name: 'Champagne', icon: <Sparkles size={20} />, color: 'from-yellow-400 to-orange-500' }
  ];

  const occasions = [
    { id: 'all', name: 'All Business Types' },
    { id: 'restaurants', name: 'Restaurants' },
    { id: 'bars', name: 'Bars & Lounges' },
    { id: 'hotels', name: 'Hotels & Resorts' },
    { id: 'corporate', name: 'Corporate Events' },
    { id: 'weddings', name: 'Weddings & Events' },
    { id: 'retail', name: 'Retail & Distribution' }
  ];

  const sortOptions = [
    { id: 'featured', name: 'Featured' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'premium', name: 'Premium First' },
    { id: 'bulk-discount', name: 'Bulk Discount' },
    { id: 'business-value', name: 'Business Value' }
  ];

  // B2B Hospitality Bundles
  const bundles = [
    {
      id: 'restaurant-starter',
      name: 'Restaurant Starter Pack',
      description: 'Essential spirits and wines for new restaurant openings and daily operations.',
      items: [
        { category: 'spirits', tier: 'premium', name: 'Premium Vodka' },
        { category: 'spirits', tier: 'mainstream', name: 'Gin' },
        { category: 'wine', tier: 'premium', name: 'House Wines' },
        { category: 'mixers', tier: 'mainstream', name: 'Premium Mixers' }
      ],
      price: 125000,
      originalPrice: 165000,
      discount: 24,
      businessSize: 'Small-Medium Restaurant',
      delivery: '24-hour delivery',
      includes: ['Premium spirits selection', 'House wine collection', 'Premium mixers', 'Inventory management guide']
    },
    {
      id: 'bar-premium',
      name: 'Premium Bar Collection',
      description: 'High-end spirits and premium wines for upscale bars and lounges.',
      items: [
        { category: 'spirits', tier: 'premium', name: 'Premium Whiskey' },
        { category: 'spirits', tier: 'premium', name: 'Premium Gin' },
        { category: 'wine', tier: 'premium', name: 'Premium Wines' },
        { category: 'champagne', tier: 'premium', name: 'Champagne Selection' }
      ],
      price: 185000,
      originalPrice: 245000,
      discount: 24,
      businessSize: 'Premium Bar/Lounge',
      delivery: 'Same-day delivery available',
      includes: ['Premium spirits selection', 'Premium wine collection', 'Champagne selection', 'Bar management guide']
    },
    {
      id: 'hotel-events',
      name: 'Hotel Events Package',
      description: 'Complete beverage solution for hotel events, conferences, and corporate functions.',
      items: [
        { category: 'wine', tier: 'premium', name: 'Premium Red Wine' },
        { category: 'wine', tier: 'premium', name: 'Premium White Wine' },
        { category: 'spirits', tier: 'premium', name: 'Premium Spirits' },
        { category: 'champagne', tier: 'premium', name: 'Champagne Selection' }
      ],
      price: 225000,
      originalPrice: 295000,
      discount: 24,
      businessSize: 'Hotel/Conference Center',
      delivery: '24-hour delivery',
      includes: ['Premium wine selection', 'Premium spirits', 'Champagne', 'Event planning guide']
    }
  ];

  // Filter and sort drinks
  useEffect(() => {
    let filtered = [...drinks];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(drink => drink.category === selectedCategory);
    }

    // Filter by occasion
    if (selectedOccasion !== 'all') {
      filtered = filtered.filter(drink => 
        drink.bestOccasions.some(occasion => 
          occasion.toLowerCase().includes(selectedOccasion)
        )
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(drink =>
        drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drink.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drink.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(drink => 
      drink.price >= priceRange[0] && drink.price <= priceRange[1]
    );

    // Sort drinks
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'premium':
        filtered.sort((a, b) => {
          const aIsPremium = a.subcategory.includes('premium') || a.subcategory.includes('luxury') ? 1 : 0;
          const bIsPremium = b.subcategory.includes('premium') || b.subcategory.includes('luxury') ? 1 : 0;
          return bIsPremium - aIsPremium || b.price - a.price;
        });
        break;
      case 'bulk-discount':
        filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case 'business-value':
        filtered.sort((a, b) => {
          const aValue = a.price * (1 - (a.discount || 0) / 100);
          const bValue = b.price * (1 - (b.discount || 0) / 100);
          return aValue - bValue;
        });
        break;
      case 'featured':
        filtered.sort((a, b) => {
          const aIsPremium = a.subcategory.includes('premium') || a.subcategory.includes('luxury') ? 1 : 0;
          const bIsPremium = b.subcategory.includes('premium') || b.subcategory.includes('luxury') ? 1 : 0;
          return bIsPremium - aIsPremium || b.price - a.price;
        });
        break;
      default:
        break;
    }

    setFilteredDrinks(filtered);
  }, [drinks, selectedCategory, selectedOccasion, searchTerm, sortBy, priceRange]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  // Calculate tier-based discount
  const getTierDiscount = (price) => {
    const discountRate = loyaltyData.tier.id === 'gold' ? 0.10 : 
                        loyaltyData.tier.id === 'silver' ? 0.05 : 0.02;
    return price * discountRate;
  };

  // Calculate final price with tier discount
  const getFinalPrice = (originalPrice, existingDiscount = 0) => {
    const discountedPrice = originalPrice * (1 - existingDiscount / 100);
    const tierDiscount = getTierDiscount(discountedPrice);
    return discountedPrice - tierDiscount;
  };

  // Enhanced add to cart with loyalty points
  const handleAddToCart = (drink, quantity = 1) => {
    const finalPrice = getFinalPrice(drink.price, drink.discount || 0);
    const pointsEarned = Math.floor(finalPrice);
    
    addToCart({ ...drink, finalPrice, quantity });
    addPoints(finalPrice, Date.now().toString());
    
    setNotification({ 
      show: true, 
      message: `${drink.name} added to cart! Earned ${pointsEarned} points.` 
    });
    setTimeout(() => setNotification({ show: false, message: '' }), 3000);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero removed as requested */}

      {/* Modern Navigation */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Tab Navigation */}
            <div className="flex items-center space-x-2">
              {[
                { id: 'drinks', label: 'Wholesale Catalog', icon: Wine },
                { id: 'bundles', label: 'B2B Bundles', icon: Gift },
                { id: 'vip', label: 'Premium Collection', icon: Crown }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                  {tab.id === 'vip' && loyaltyData.tier.id === 'gold' && (
                    <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                      NEW
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'drinks' && (
            <motion.div
              key="drinks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Premium Hero Section */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl mb-12">
                {/* Background with gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-red-800 to-purple-900"></div>
                
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="absolute bottom-10 right-10 w-24 h-24 bg-red-400/30 rounded-full blur-lg animate-pulse delay-1000"></div>
                  <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-400/20 rounded-full blur-md animate-pulse delay-500"></div>
                </div>

                {/* Content */}
                <div className="relative px-8 py-16 text-center text-white">
                  <div className="max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6">
                      <Crown size={16} className="text-yellow-300" />
                      <span className="text-sm font-medium">Premium B2B Distribution</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                      <span className="bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
                        Premium Wine & Spirits
                      </span>
                      <br />
                      <span className="text-white">
                        for Hospitality Excellence
                      </span>
                    </h1>

                    {/* Description */}
                    <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                      Curated selection of world-class spirits, premium wines, and exclusive collections. 
                      Delivered to your business with wholesale pricing and smart inventory management.
                    </p>

                    {/* Key Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                      <div className="text-center">
                        <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <Truck size={28} />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">24-Hour Delivery</h3>
                        <p className="text-white/80">Fast, reliable delivery to your business</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <DollarSign size={28} />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Wholesale Pricing</h3>
                        <p className="text-white/80">Bulk discounts and business rates</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <BarChart3 size={28} />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Smart Inventory</h3>
                        <p className="text-white/80">AI-powered reordering and forecasting</p>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button 
                        onClick={() => setActiveTab('bundles')}
                        className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        View B2B Bundles
                      </button>
                      <button 
                        onClick={() => navigate('/conviviapass')}
                        className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
                      >
                        Become a Partner
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">500+</div>
                        <div className="text-white/70 text-sm">Business Partners</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">25,000+</div>
                        <div className="text-white/70 text-sm">Bottles Delivered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">24hr</div>
                        <div className="text-white/70 text-sm">Delivery Time</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modern Filters */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">B2B Wholesale Wine & Spirits</h2>
                    <p className="text-gray-600 mt-2">Premium selection, bulk pricing, and smart inventory management for hospitality businesses.</p>
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    <SlidersHorizontal size={18} />
                    Filters
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search spirits, brands, or occasions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-6 py-3 rounded-2xl font-medium flex items-center gap-2 transition-all duration-300 ${
                        selectedCategory === category.id
                          ? `bg-gradient-to-r ${category.color} text-white shadow-lg transform scale-105`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.icon}
                      {category.name}
                    </button>
                  ))}
                </div>

                {/* Filters Panel */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200 pt-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Occasions */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Best For</label>
                          <select
                            value={selectedOccasion}
                            onChange={(e) => setSelectedOccasion(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          >
                            {occasions.map(occasion => (
                              <option key={occasion.id} value={occasion.id}>
                                {occasion.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Sort */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Sort By</label>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          >
                            {sortOptions.map(option => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Price Range */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                          </label>
                          <div className="space-y-2">
                            <input
                              type="range"
                              min="0"
                              max="3000000"
                              step="50000"
                              value={priceRange[1]}
                              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between">
                <div className="text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredDrinks.length}</span> premium spirits
                </div>
                <div className="text-sm text-gray-500">
                  {selectedCategory !== 'all' && `Filtered by ${categories.find(c => c.id === selectedCategory)?.name}`}
                </div>
              </div>

              {/* Drinks Grid */}
              <div className={`grid gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                <AnimatePresence>
                  {filteredDrinks.map((drink, index) => (
                    <SimpleDrinkCard
                      key={drink.id}
                      drink={drink}
                      onAddToCart={handleAddToCart}
                      featured={index < 3 && sortBy === 'featured'}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* No Results */}
              {filteredDrinks.length === 0 && (
                <div className="text-center py-16">
                  <Wine className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No spirits found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedOccasion('all');
                      setSearchTerm('');
                      setPriceRange([0, 3000000]);
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Bundles Tab */}
          {activeTab === 'bundles' && (
            <motion.div
              key="bundles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">B2B Hospitality Bundles</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Curated packages for restaurants, bars, hotels, and events. Wholesale pricing with bulk discounts and smart quantity planning.
                </p>
              </div>
              
              {/* Bundles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bundles.map((bundle, index) => (
                  <motion.div
                    key={bundle.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-gray-100"
                  >
                    <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Bundle Preview</div>
                        <div className="text-xs text-gray-400">{bundle.items.map(i => i.name).slice(0,3).join(' • ')}</div>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">{bundle.name}</h3>
                        <div className="bg-red-500/90 text-white px-3 py-1 rounded-full text-sm font-bold">
                          -{bundle.discount}% OFF
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-6">{bundle.description}</p>
                      
                      <div className="grid grid-cols-2 gap-3 mb-6 text-sm text-gray-700">
                        <div className="flex items-center gap-2"><Users size={16} /><span>{bundle.businessSize}</span></div>
                        <div className="flex items-center gap-2"><Truck size={16} /><span>{bundle.delivery}</span></div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="text-xs text-gray-500 mb-2">Includes</div>
                        <div className="flex flex-wrap gap-2">
                          {bundle.includes.slice(0, 4).map((item, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-end justify-between mb-6">
                        <div>
                          <div className="text-sm text-gray-400 line-through">{formatPrice(bundle.originalPrice)}</div>
                          <div className="text-3xl font-extrabold text-gray-900">{formatPrice(bundle.price)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-green-600 font-medium">Wholesale value</div>
                          <div className="text-[11px] text-gray-500">B2B pricing & bulk discounts</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button 
                          onClick={() => {
                            setSelectedBundle(bundle);
                            setIsBundleModalOpen(true);
                          }}
                          className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium transition-colors"
                        >
                          Details
                        </button>
                        <button 
                          onClick={() => handleAddToCart({
                            id: `bundle-${bundle.id}`,
                            name: bundle.name,
                            brand: 'Convivia24',
                            price: bundle.price,
                            images: [''],
                            category: 'bundle',
                            tier: 'premium',
                            discount: bundle.discount
                          })}
                          className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
                        >
                          Add Bundle
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Premium Collection Tab */}
          {activeTab === 'vip' && (
            <motion.div
              key="vip"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Premium Collection</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Exclusive premium spirits and luxury collections for discerning hospitality businesses.
                </p>
              </div>
              <VIPDrops />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <BundleModal 
        bundle={selectedBundle} 
        isOpen={isBundleModalOpen} 
        onClose={() => {
          setIsBundleModalOpen(false);
          setSelectedBundle(null);
        }} 
      />

      {/* B2B Call to Action */}
      <div className="bg-gradient-to-r from-gray-900 to-purple-900 rounded-3xl shadow-2xl p-12 text-center text-white mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Scale Your Beverage Business?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Join hundreds of hospitality businesses already using Convivia24 for wholesale wine & spirits distribution. 
          Get started with bulk pricing, smart inventory, and 24-hour delivery.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/business-register')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-red-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Become a B2B Partner
          </button>
          <button 
            onClick={() => navigate('/conviviapass')}
            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
          >
            View Partnership Plans
          </button>
        </div>
      </div>

      {/* Notification */}
      <Notification
        message={notification.message}
        isVisible={notification.show}
        onClose={() => setNotification({ show: false, message: '' })}
        type="success"
      />
    </div>
  );
};

export default ModernShopping;
