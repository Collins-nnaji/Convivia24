import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Building, 
  Users, 
  Gift, 
  Calendar, 
  Star,
  Percent,
  Crown,
  Medal,
  History,
  Check,
  ShoppingBag,
  Package,
  TrendingUp,
  Target,
  Coins,
  GiftIcon,
  MapPin,
  ArrowRight,
  ChevronRight,
  Ticket,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ConviviaPass = () => {
  // Member profile state
  const [activeTab, setActiveTab] = useState('overview');
  const [userPoints, setUserPoints] = useState(1250);
  const [membershipTier, setMembershipTier] = useState('premium');
  const [isFlipped, setIsFlipped] = useState(false);

  // Calculate membership tier based on points
  useEffect(() => {
    if (userPoints >= 2000) {
      setMembershipTier('vip');
    } else if (userPoints >= 500) {
      setMembershipTier('premium');
    } else {
      setMembershipTier('standard');
    }
  }, [userPoints]);

  // Member activity history
  const activityHistory = [
    { date: 'Jan 15, 2024', event: 'Bulk Order - Premium Whisky Collection', points: '+450', type: 'purchase', amount: '₦180,000' },
    { date: 'Jan 7, 2024', event: 'Corporate Event Package - 100 bottles', points: '+800', type: 'bulk', amount: '₦320,000' },
    { date: 'Dec 28, 2023', event: 'Holiday Bundle - Wine & Champagne', points: '+300', type: 'bundle', amount: '₦120,000' },
    { date: 'Dec 12, 2023', event: 'Restaurant Supply Order - 50 bottles', points: '+250', type: 'restaurant', amount: '₦95,000' },
    { date: 'Nov 25, 2023', event: 'Hotel Event Package - Premium Spirits', points: '+600', type: 'hotel', amount: '₦240,000' }
  ];

  // Membership tier data
  const tiers = [
    {
      id: 'standard',
      name: 'Bronze',
      pointsRequired: 0,
      color: 'from-blue-500 to-indigo-600',
      icon: <Star className="h-6 w-6" />,
      benefits: [
        '5% bulk order discount',
        'Standard delivery (48-72 hours)',
        'Access to basic wine & spirits catalog',
        'Email support',
        'Monthly newsletter with deals'
      ]
    },
    {
      id: 'premium',
      name: 'Silver',
      pointsRequired: 500,
      color: 'from-[#FF0000] to-rose-600',
      icon: <Medal className="h-6 w-6" />,
      benefits: [
        'All Bronze benefits',
        '10% bulk order discount',
        'Priority delivery (24-48 hours)',
        'Access to premium & rare spirits',
        'Dedicated account manager',
        'Exclusive bulk pricing tiers',
        'Quarterly business consultation'
      ]
    },
    {
      id: 'vip',
      name: 'Gold',
      pointsRequired: 2000,
      color: 'from-amber-400 to-yellow-600',
      icon: <Crown className="h-6 w-6" />,
      benefits: [
        'All Silver benefits',
        '15% bulk order discount',
        'Same-day delivery available',
        'Access to exclusive & vintage collections',
        'Personal sommelier consultation',
        'Custom packaging & branding',
        'Priority allocation for limited releases',
        'Annual business strategy session'
      ]
    }
  ];

  const currentTier = tiers.find(tier => tier.id === membershipTier);
  const nextTier = membershipTier === 'vip' ? null : tiers.find(tier => tier.id === (membershipTier === 'standard' ? 'premium' : 'vip'));
  
  // Calculate progress to next tier
  const calculateProgress = () => {
    if (membershipTier === 'vip') return 100;
    
    const currentTierPoints = currentTier.pointsRequired;
    const nextTierPoints = nextTier.pointsRequired;
    const pointsRange = nextTierPoints - currentTierPoints;
    const userProgress = userPoints - currentTierPoints;
    
    return Math.min(Math.floor((userProgress / pointsRange) * 100), 100);
  };

  const tabs = [
    { id: 'overview', name: 'Business Overview', icon: <Star /> },
    { id: 'activity', name: 'Purchase History', icon: <History /> },
    { id: 'how-it-works', name: 'How It Works', icon: <Target /> }
  ];

  // How it works steps
  const howItWorksSteps = [
    {
      icon: <ShoppingBag className="h-8 w-8 text-red-400" />,
      title: "Make Business Purchases",
      description: "Place bulk orders for your venue, events, or corporate needs. Every purchase earns you points based on the order value and type.",
      details: [
        "Bulk orders (36+ bottles): 100 points per ₦100k spent",
        "Premium spirits (₦150k+): 150 points per ₦100k spent",
        "Corporate packages: 200 points per package",
        "Monthly subscriptions: 300 points per month"
      ]
    },
    {
      icon: <Coins className="h-8 w-8 text-yellow-400" />,
      title: "Earn Reward Points",
      description: "Points are automatically calculated and added to your account. The more you spend, the faster you climb the loyalty ladder.",
      details: [
        "Points are calculated in real-time",
        "No expiration date on earned points",
        "Bonus points for seasonal promotions",
        "Referral bonuses for new business clients"
      ]
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-400" />,
      title: "Unlock Tier Benefits",
      description: "As you accumulate points, you automatically unlock higher membership tiers with exclusive benefits and discounts.",
      details: [
        "Bronze: 0 points (Basic benefits)",
        "Silver: 500 points (Enhanced benefits)",
        "Gold: 2000 points (Premium benefits)"
      ]
    },
    {
      icon: <GiftIcon className="h-8 w-8 text-purple-400" />,
      title: "Enjoy Exclusive Perks",
      description: "Redeem your tier benefits for better pricing, priority service, and exclusive access to premium products and services.",
      details: [
        "Tier-based bulk order discounts",
        "Priority allocation for limited releases",
        "Dedicated account management",
        "Custom packaging and branding options"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Enhanced Background decorations */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.08, 0.05]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full filter blur-3xl -z-10"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.08, 0.05]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-red-100 rounded-full filter blur-3xl -z-10"
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-50 to-red-100 border border-red-200 mb-6"
              >
                <Sparkles className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-red-700">Reward Points System</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-6xl font-bold mb-6 text-gray-900"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-500">
                  Convivia24 Rewards
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-gray-600 mb-8 max-w-xl"
              >
                Your reward points accumulate automatically with every business purchase. Unlock exclusive discounts, 
                priority access, and premium benefits as you climb the loyalty ladder through your spending.
              </motion.p>
              
              {/* Quick Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-3 gap-4 mb-8"
              >
                <div className="bg-white rounded-lg p-4 text-center border border-gray-200 shadow-sm">
                  <div className="text-2xl font-bold text-red-600">{userPoints}</div>
                  <div className="text-gray-600 text-sm">Total Points</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-gray-200 shadow-sm">
                  <div className="text-2xl font-bold text-red-500">{currentTier.name}</div>
                  <div className="text-gray-600 text-sm">Current Tier</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-gray-200 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">
                    {nextTier ? nextTier.pointsRequired - userPoints : 'MAX'}
                  </div>
                  <div className="text-gray-600 text-sm">To Next Tier</div>
                </div>
              </motion.div>
            </div>
            
            <div className="max-w-md mx-auto perspective-1000">
              {/* Enhanced Membership Card with Flip Effect */}
              <motion.div
                className="relative w-full h-64 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
                initial={{ opacity: 0, rotateY: -15 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute w-full h-full transition-all duration-700" style={{ 
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}>
                  {/* Front of the Card */}
                  <div className="absolute w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/50">
                  {/* Card Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      membershipTier === 'standard' ? 'from-blue-600 to-indigo-800' :
                      membershipTier === 'premium' ? 'from-[#FF0000] to-rose-600' :
                      'from-amber-400 to-amber-700'
                    }`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0)_60%)]"></div>
                      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/10 filter blur-3xl"></div>
                    </div>
                    
                      {/* Membership Badge */}
                    <div className="absolute top-6 right-6">
                        <motion.div 
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="flex space-x-1"
                        >
                          {membershipTier === 'vip' && (
                            <div className="h-8 w-8 rounded-full bg-yellow-300 flex items-center justify-center">
                              <Crown className="h-5 w-5 text-amber-800" />
                            </div>
                          )}
                          {membershipTier === 'premium' && (
                            <div className="h-8 w-8 rounded-full bg-[#FF0000] flex items-center justify-center">
                              <Medal className="h-5 w-5 text-white" />
                            </div>
                          )}
                          {membershipTier === 'standard' && (
                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                              <Star className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </motion.div>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="relative p-6 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                          <h3 className="text-xl font-bold text-white">Convivia24 Reward Card</h3>
                          <p className="text-white/70 text-sm capitalize">{membershipTier} Business Member</p>
                      </div>
                        <motion.div 
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="rounded-full bg-white/20 backdrop-blur-xl p-2"
                        >
                        <Sparkles className="h-6 w-6 text-white" />
                        </motion.div>
                    </div>
                    
                    <div className="pt-4">
                      {/* Barcode/Card Number */}
                      <div className="mb-4">
                        <div className="bg-white/10 backdrop-blur-xl p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-1">
                                {Array.from({ length: 8 }).map((_, i) => (
                                  <motion.div 
                                    key={i}
                                    animate={{ height: [32, 24, 32] }}
                                    transition={{ duration: 1, delay: i * 0.1, repeat: Infinity }}
                                    className={`w-${Math.random() > 0.5 ? '0.5' : '1'} bg-white/80`}
                                  />
                                ))}
                            </div>
                            <div className="text-white/80 text-xs">
                                {[...Array(4)].map((_, i) => (
                                  <span key={i}>{Math.floor(1000 + Math.random() * 9000)} </span>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div>
                            <p className="text-white/60 text-xs mb-1">BUSINESS NAME</p>
                            <p className="text-white font-medium">PREMIUM VENUES LTD</p>
                        </div>
                        <div>
                            <p className="text-white/60 text-xs mb-1">TIER LEVEL</p>
                            <p className="text-white font-medium uppercase">{membershipTier}</p>
                        </div>
                        <div>
                            <p className="text-white/60 text-xs mb-1">EXPIRES</p>
                          <p className="text-white font-medium">12/26</p>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                  {/* Back of the Card */}
                  <div className="absolute w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/50" style={{ transform: 'rotateY(180deg)' }}>
                    {/* Card Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      membershipTier === 'standard' ? 'from-blue-600 to-indigo-800' :
                      membershipTier === 'premium' ? 'from-rose-600 to-[#FF0000]' :
                      'from-amber-700 to-amber-400'
                    }`}>
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0)_60%)]"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/10 filter blur-3xl"></div>
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="relative p-6 h-full flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-4">Reward Benefits</h3>
                        <ul className="space-y-2">
                          {currentTier.benefits.slice(0, 4).map((benefit, i) => (
                            <motion.li 
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex gap-3 items-start"
                            >
                              <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-white/90 text-sm">{benefit}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="text-center">
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-2xl font-bold text-white mb-1"
                        >
                          {userPoints}
                        </motion.div>
                        <div className="text-white/70 text-sm">Total Points</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Tap to see back of card (mobile-only) */}
              <div className="md:hidden text-center mt-2 text-white/60 text-sm">
                Tap card to see business benefits
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Membership Dashboard Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50">
            {tabs.map((tab) => (
            <button 
                key={tab.id}
                className={`px-6 py-4 text-sm font-medium flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id ? 'text-red-600 border-b-2 border-red-500 bg-white' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.name}
            </button>
            ))}
          </div>
          
          <div className="p-6">
            {/* Business Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold mb-8 text-gray-900">Your Business Benefits</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: <Percent className="h-6 w-6 text-red-500" />,
                      title: "Bulk Order Discounts",
                      description: "Save up to 15% on bulk orders with tier-based pricing across all premium spirits.",
                      available: true,
                      details: `Current tier: ${currentTier.name} - ${membershipTier === 'standard' ? '5%' : membershipTier === 'premium' ? '10%' : '15%'} discount`
                    },
                    {
                      icon: <Star className="h-6 w-6 text-red-500" />,
                      title: "Priority Allocation",
                      description: "Get first access to limited releases and rare spirits before general availability.",
                      available: membershipTier !== 'standard',
                      details: `Available for ${membershipTier === 'premium' ? 'Silver' : membershipTier === 'vip' ? 'Gold' : 'Bronze'} tier and above`
                    },
                    {
                      icon: <Gift className="h-6 w-6 text-red-500" />,
                      title: "Custom Packaging",
                      description: "Personalized branding and packaging for corporate events and gifting.",
                      available: membershipTier !== 'standard',
                      details: `Available for ${membershipTier === 'premium' ? 'Silver' : membershipTier === 'vip' ? 'Gold' : 'Bronze'} tier and above`
                    },
                    {
                      icon: <Calendar className="h-6 w-6 text-red-500" />,
                      title: "Business Consultation",
                      description: "Quarterly strategy sessions with our spirits experts for optimal inventory planning.",
                      available: true,
                      details: `Next session: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
                    },
                    {
                      icon: <Check className="h-6 w-6 text-red-500" />,
                      title: "Dedicated Support",
                      description: "24/7 dedicated account management and priority customer service.",
                      available: membershipTier === 'vip',
                      details: "Available for Gold tier only"
                    },
                    {
                      icon: <Users className="h-6 w-6 text-red-500" />,
                      title: "Sommelier Services",
                      description: "Personal consultation for wine pairings and event planning expertise.",
                      available: membershipTier === 'vip',
                      details: "Available for Gold tier only"
                    }
                  ].map((benefit, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-5 rounded-xl border ${
                        benefit.available 
                          ? 'bg-white border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-300' 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                          {benefit.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
                            {!benefit.available && (
                              <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
                                Higher tier
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{benefit.description}</p>
                          <p className="text-red-600 text-xs mt-2 font-medium">{benefit.details}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Tier Progress Section */}
                {nextTier && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-red-200"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Progress to {nextTier.name} Tier</h3>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-gray-600 text-sm">Current: {userPoints} points</div>
                          <div className="text-gray-600 text-sm">Required: {nextTier.pointsRequired} points</div>
                      </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${calculateProgress()}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`h-full ${
                              membershipTier === 'standard' ? 'bg-blue-500' : 'bg-red-500'
                            }`}
                          />
                        </div>
                        <div className="text-gray-600 text-sm mt-2">
                          {nextTier.pointsRequired - userPoints} points needed to unlock {nextTier.name} benefits
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600 mb-2">{calculateProgress()}%</div>
                        <div className="text-gray-600 text-sm">Complete</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
            
            {/* Purchase History Tab */}
            {activeTab === 'activity' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">Purchase History</h2>
                  <div className="bg-white/5 rounded-full px-4 py-1.5 flex items-center gap-2">
                    <span className="text-white/80 text-sm">Total Points:</span>
                    <span className="text-white font-bold">{userPoints}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {activityHistory.map((activity, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'purchase' ? 'bg-blue-500/20' :
                            activity.type === 'bulk' ? 'bg-green-500/20' :
                            activity.type === 'bundle' ? 'bg-purple-500/20' :
                            activity.type === 'restaurant' ? 'bg-amber-500/20' :
                            'bg-red-500/20'
                          }`}>
                            {activity.type === 'purchase' ? <ShoppingBag className="h-4 w-4 text-blue-400" /> :
                             activity.type === 'bulk' ? <Package className="h-4 w-4 text-green-400" /> :
                             activity.type === 'bundle' ? <Gift className="h-4 w-4 text-purple-400" /> :
                             activity.type === 'restaurant' ? <Building className="h-4 w-4 text-amber-400" /> :
                             <Building className="h-4 w-4 text-red-400" />}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{activity.event}</h4>
                            <p className="text-white/60 text-sm">{activity.date}</p>
                            <p className="text-white/50 text-xs">{activity.amount}</p>
                          </div>
                        </div>
                        <div className="text-right">
                        <div className="text-green-400 font-bold">{activity.points}</div>
                          <div className="text-white/50 text-xs">points earned</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* How It Works Tab */}
            {activeTab === 'how-it-works' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold mb-8">How Convivia24 Rewards Work</h2>
                
                <div className="space-y-8">
                  {howItWorksSteps.map((step, index) => (
            <motion.div
              key={index}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="bg-white/5 rounded-xl p-6 border border-white/10"
                    >
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-600/20 to-purple-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                          {step.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <h3 className="text-xl font-bold text-white">{step.title}</h3>
              </div>
                          <p className="text-white/80 text-lg mb-4">{step.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {step.details.map((detail, i) => (
                              <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2 + i * 0.1 }}
                                className="flex items-center gap-2 text-white/70"
                              >
                                <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                                <span className="text-sm">{detail}</span>
            </motion.div>
          ))}
        </div>
      </div>
                      </div>
                    </motion.div>
                  ))}
        </div>
        
                {/* Quick Start Guide */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-12 bg-gradient-to-r from-red-900/20 to-purple-900/20 rounded-xl p-6 border border-red-500/20"
                >
                  <h3 className="text-xl font-bold text-white mb-4">🚀 Quick Start Guide</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ShoppingBag className="h-6 w-6 text-red-400" />
                      </div>
                      <h4 className="text-white font-semibold mb-2">1. Start Shopping</h4>
                      <p className="text-white/70 text-sm">Place your first bulk order to begin earning points</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="h-6 w-6 text-purple-400" />
                      </div>
                      <h4 className="text-white font-semibold mb-2">2. Watch Points Grow</h4>
                      <p className="text-white/70 text-sm">Points accumulate automatically with every purchase</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Gift className="h-6 w-6 text-green-400" />
                  </div>
                      <h4 className="text-white font-semibold mb-2">3. Enjoy Benefits</h4>
                      <p className="text-white/70 text-sm">Unlock exclusive perks as you reach new tiers</p>
              </div>
                  </div>
                </motion.div>
            </motion.div>
            )}
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default ConviviaPass;
