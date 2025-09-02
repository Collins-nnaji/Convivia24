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
  SlidersHorizontal,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { drinksDatabase, getByCategory, getByOccasion, getFeaturedPremium } from '../data/drinksDatabase';
import SimpleDrinkCard from '../components/SimpleDrinkCard';
import BundleModal from '../components/BundleModal';
import VIPDrops from '../components/VIPDrops';
import Notification from '../components/Notification';
import BusinessRegisterModal from '../components/BusinessRegisterModal';


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
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [activeTab, setActiveTab] = useState('drinks'); // 'drinks' or 'bundles'
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
      price: 485000,
      originalPrice: 625000,
      discount: 22,
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
      price: 750000,
      originalPrice: 985000,
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
      price: 1250000,
      originalPrice: 1650000,
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
                { id: 'bundles', label: 'B2B Bundles', icon: Gift }
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
              {/* Compact Premium Hero Section */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative overflow-hidden rounded-2xl shadow-xl mb-8"
              >
                {/* Background with red gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800"></div>
                
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      x: [0, 30, 0],
                      y: [0, -20, 0]
                    }}
                    transition={{ 
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute top-4 right-4 w-24 h-24 bg-white/20 rounded-full blur-xl"
                  />
                  <motion.div 
                    animate={{ 
                      scale: [1.2, 1, 1.2],
                      x: [0, -20, 0],
                      y: [0, 15, 0]
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 2
                    }}
                    className="absolute bottom-4 left-4 w-16 h-16 bg-red-300/30 rounded-full blur-lg"
                  />
                </div>

                {/* Content */}
                <div className="relative px-6 py-10 text-white">
                  <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      {/* Left Content */}
                      <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      >
                        {/* Badge */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-4"
                        >
                          <Crown size={16} className="text-yellow-300" />
                          <span className="text-sm font-medium">Premium B2B Distribution</span>
                        </motion.div>

                        {/* Main Headline */}
                        <motion.h1 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.6 }}
                          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
                        >
                          <span className="bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
                            Premium Wine & Spirits
                          </span>
                          <br />
                          <span className="text-white text-2xl md:text-3xl">
                            B2B Marketplace
                          </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.8 }}
                          className="text-lg text-white/90 mb-6 max-w-lg"
                        >
                          Curated selection of world-class spirits and premium wines with wholesale pricing and smart inventory management.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 1.0 }}
                          className="flex justify-center"
                        >
                          <motion.button 
                            onClick={() => setActiveTab('bundles')}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-white text-red-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg"
                          >
                            View B2B Bundles
                          </motion.button>
                        </motion.div>
                      </motion.div>
                      
                      {/* Right Stats Grid */}
                      <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="grid grid-cols-2 gap-4"
                      >
                        {[
                          { value: "500+", label: "Business Partners", icon: Users, delay: 0.6 },
                          { value: "25K+", label: "Bottles Delivered", icon: Package, delay: 0.8 },
                          { value: "24hr", label: "Delivery Time", icon: Truck, delay: 1.0 },
                          { value: "150+", label: "Premium Brands", icon: Crown, delay: 1.2 }
                        ].map((stat, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: stat.delay }}
                            whileHover={{ 
                              scale: 1.05, 
                              y: -5,
                              transition: { duration: 0.2 }
                            }}
                            className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.5, delay: stat.delay + 0.2, type: "spring" }}
                              className="flex justify-center mb-2"
                            >
                              <stat.icon size={20} className="text-white" />
                            </motion.div>
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5, delay: stat.delay + 0.4 }}
                              className="text-xl font-bold text-white mb-1"
                            >
                              {stat.value}
                            </motion.div>
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5, delay: stat.delay + 0.6 }}
                              className="text-white/70 text-xs"
                            >
                              {stat.label}
                            </motion.div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Modern Filters */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900">B2B Wholesale Wine & Spirits</h2>
                    <p className="text-gray-600 mt-2">Premium selection, bulk pricing, and smart inventory management for hospitality businesses.</p>
                  </motion.div>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    <motion.div
                      animate={{ rotate: showFilters ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SlidersHorizontal size={18} />
                    </motion.div>
                    Filters
                  </motion.button>
                </div>

                {/* Search Bar */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="relative mb-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.0 }}
                  >
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </motion.div>
                  <motion.input
                    initial={{ width: "50%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    type="text"
                    placeholder="Search spirits, brands, or occasions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg transition-all duration-300 hover:shadow-md focus:shadow-lg"
                  />
                </motion.div>

                {/* Category Pills */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  className="flex flex-wrap gap-3 mb-6"
                >
                  {categories.map((category, index) => (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 1.2 + (index * 0.1),
                        type: "spring",
                        stiffness: 200
                      }}
                      whileHover={{ 
                        scale: 1.05, 
                        y: -2,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-6 py-3 rounded-2xl font-medium flex items-center gap-2 transition-all duration-300 ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: selectedCategory === category.id ? 360 : 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {category.icon}
                      </motion.div>
                      {category.name}
                    </motion.button>
                  ))}
                </motion.div>

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
              </motion.div>

              {/* Results Summary */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center justify-between"
              >
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-gray-600"
                >
                  Showing <span className="font-semibold text-gray-900">{filteredDrinks.length}</span> premium spirits
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="text-sm text-gray-500"
                >
                  {selectedCategory !== 'all' && `Filtered by ${categories.find(c => c.id === selectedCategory)?.name}`}
                </motion.div>
              </motion.div>

              {/* Drinks Grid */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className={`grid gap-8 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {filteredDrinks.map((drink, index) => (
                    <motion.div
                      key={drink.id}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -30, scale: 0.9 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 100
                      }}
                      layout
                    >
                      <SimpleDrinkCard
                        drink={drink}
                        onAddToCart={handleAddToCart}
                        featured={index < 3 && sortBy === 'featured'}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

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

          {/* Enhanced B2B Bundles Tab */}
          {activeTab === 'bundles' && (
            <motion.div
              key="bundles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              {/* Hero Section for Bundles */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-16"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-50 to-red-100 rounded-full border border-red-200 mb-6"
                >
                  <Package className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-semibold text-red-700">Premium Business Solutions</span>
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-5xl font-bold text-gray-900 mb-6"
                >
                  <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                    B2B Hospitality Bundles
                  </span>
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                >
                  Curated premium packages designed for hospitality businesses. Get wholesale pricing, bulk discounts, 
                  and comprehensive solutions for restaurants, bars, hotels, and events.
                </motion.p>

                {/* Bundle Stats */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto"
                >
                  {[
                    { value: "3", label: "Bundle Types", icon: "📦" },
                    { value: "22-24%", label: "Wholesale Discount", icon: "💰" },
                    { value: "24hr", label: "Delivery Time", icon: "🚚" },
                    { value: "Premium", label: "Quality Guarantee", icon: "⭐" }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.2 + (index * 0.1) }}
                      className="text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className="text-2xl font-bold text-red-600 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
              
              {/* Enhanced Bundles Grid */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
              >
                {bundles.map((bundle, index) => (
                  <motion.div
                    key={bundle.id}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      delay: 1.2 + (index * 0.2),
                      duration: 0.6,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      y: -15, 
                      scale: 1.03,
                      transition: { duration: 0.3 }
                    }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-gray-100 relative"
                  >
                    {/* Premium Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        -{bundle.discount}% OFF
                      </div>
                    </div>

                    {/* Enhanced Header with Gradient */}
                    <div className="h-48 bg-gradient-to-br from-red-50 via-red-100 to-red-200 relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-24 h-24 bg-red-300 rounded-full blur-xl"></div>
                        <div className="absolute bottom-4 left-4 w-16 h-16 bg-red-400 rounded-full blur-lg"></div>
                      </div>
                      
                      <div className="relative h-full flex items-center justify-center px-4">
                        <div className="text-center">
                          <div className="text-3xl md:text-4xl mb-3">🍷</div>
                          <div className="text-base md:text-lg font-semibold text-red-800 mb-2 line-clamp-2">{bundle.name}</div>
                          <div className="text-xs md:text-sm text-red-700 bg-white/60 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full">
                            Premium Selection
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 md:p-6 lg:p-8">
                      {/* Bundle Title & Business Type */}
                      <div className="mb-4 md:mb-6">
                        <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">{bundle.name}</h3>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                          <Building size={14} className="text-red-500 flex-shrink-0" />
                          <span className="truncate">{bundle.businessSize}</span>
                        </div>
                      </div>
                      
                      {/* Enhanced Description */}
                      <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed line-clamp-3">{bundle.description}</p>
                      
                      {/* Key Features Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                        <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users size={14} className="text-red-600 md:w-[18px] md:h-[18px]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-gray-500">Business Size</div>
                            <div className="text-xs md:text-sm font-medium text-gray-900 truncate">{bundle.businessSize}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Truck size={14} className="text-green-600 md:w-[18px] md:h-[18px]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-gray-500">Delivery</div>
                            <div className="text-xs md:text-sm font-medium text-gray-900 truncate">{bundle.delivery}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* What's Included */}
                      <div className="mb-4 md:mb-6">
                        <div className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                          What's Included
                        </div>
                        <div className="grid grid-cols-1 gap-1 md:gap-2">
                          {bundle.includes.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs md:text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></div>
                              <span className="break-words">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Enhanced Pricing Section */}
                      <div className="bg-gradient-to-r from-gray-50 to-red-50 rounded-xl p-3 md:p-4 mb-4 md:mb-6 border border-red-100">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 md:gap-0">
                          <div className="flex-1">
                            <div className="text-xs md:text-sm text-gray-500 mb-1">Original Price</div>
                            <div className="text-sm md:text-lg text-gray-400 line-through">{formatPrice(bundle.originalPrice)}</div>
                          </div>
                          <div className="text-center flex-1">
                            <div className="text-xs text-green-600 font-medium mb-1">Wholesale Price</div>
                            <div className="text-xl md:text-2xl lg:text-3xl font-extrabold text-red-600">{formatPrice(bundle.price)}</div>
                            <div className="text-xs text-gray-500">B2B Exclusive</div>
                          </div>
                          <div className="text-center md:text-right flex-1">
                            <div className="text-xs md:text-sm text-green-600 font-semibold mb-1">Save {formatPrice(bundle.originalPrice - bundle.price)}</div>
                            <div className="text-xs text-gray-500">Bulk discount applied</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                        <motion.button 
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedBundle(bundle);
                            setIsBundleModalOpen(true);
                          }}
                          className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                          <Eye size={14} className="md:w-4 md:h-4" />
                          <span className="truncate">View Details</span>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
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
                          className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm md:text-base"
                        >
                          <ShoppingCart size={14} className="md:w-4 md:h-4" />
                          <span className="truncate">Add to Cart</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Bundle CTA Section */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.5 }}
                className="mt-16 text-center"
              >
                <div className="bg-gradient-to-r from-gray-50 to-red-50 rounded-3xl p-12 border border-red-100">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.7 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-100 rounded-full border border-red-200 mb-6"
                  >
                    <Sparkles className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-semibold text-red-700">Custom Solutions</span>
                  </motion.div>
                  
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.9 }}
                    className="text-3xl font-bold text-gray-900 mb-4"
                  >
                    Need a Custom Bundle?
                  </motion.h3>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 2.1 }}
                    className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
                  >
                    Our team can create personalized beverage packages tailored to your specific business needs, 
                    event requirements, or budget constraints.
                  </motion.p>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 2.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                    <motion.button 
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsBusinessModalOpen(true)}
                      className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Building className="inline-block mr-2" size={20} />
                      Contact Sales Team
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('drinks')}
                      className="px-8 py-4 bg-white text-red-600 border-2 border-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all duration-300"
                    >
                      <Wine className="inline-block mr-2" size={20} />
                      Browse Individual Products
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
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

      <BusinessRegisterModal 
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
      />

      {/* B2B Call to Action */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-gray-900 to-red-900 rounded-3xl shadow-2xl p-12 text-center text-white mb-8"
      >
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold mb-6"
        >
          Ready to Scale Your Beverage Business?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
        >
          Join hundreds of hospitality businesses already using Convivia24 for wholesale wine & spirits distribution. 
          Get started with bulk pricing, smart inventory, and 24-hour delivery.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsBusinessModalOpen(true)}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Become a B2B Partner
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/conviviapass')}
            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
          >
            View Partnership Plans
          </motion.button>
        </motion.div>
      </motion.div>

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
