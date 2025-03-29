import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  CheckCircle, 
  Building, 
  Globe, 
  Ticket, 
  Users, 
  Gift, 
  Calendar, 
  CreditCard,
  Zap,
  Clock,
  MapPin,
  Star,
  Percent,
  Crown,
  Trophy,
  Medal,
  Award,
  ArrowRight,
  History,
  Check,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const ConviviaPass = () => {
  // Member profile state
  const [activeTab, setActiveTab] = useState('benefits');
  const [userPoints, setUserPoints] = useState(1250);
  const [membershipTier, setMembershipTier] = useState('premium');
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);

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
    { date: 'May 15, 2023', event: 'Visited The Grand Lounge', points: '+50', type: 'visit' },
    { date: 'May 7, 2023', event: 'Booked event at The Zen Garden', points: '+100', type: 'booking' },
    { date: 'April 28, 2023', event: 'Referred a friend', points: '+200', type: 'referral' },
    { date: 'April 12, 2023', event: 'Special discount used at The Rooftop Bar', points: '+75', type: 'discount' },
    { date: 'March 25, 2023', event: 'Weekend stay at Lagos Beach Resort', points: '+150', type: 'stay' }
  ];

  // Membership tier data
  const tiers = [
    {
      id: 'standard',
      name: 'Standard',
      pointsRequired: 0,
      color: 'from-blue-500 to-indigo-600',
      benefits: [
        'Access to member-only events',
        '10% discount at partner venues',
        'Special birthday offer',
        'Digital membership card'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      pointsRequired: 500,
      color: 'from-[#FF0000] to-rose-600',
      benefits: [
        'All Standard benefits',
        '20% discount at partner venues',
        'Priority bookings',
        'Complimentary welcome drinks',
        'Free entry to select nightclubs'
      ]
    },
    {
      id: 'vip',
      name: 'VIP',
      pointsRequired: 2000,
      color: 'from-amber-400 to-yellow-600',
      benefits: [
        'All Premium benefits',
        '30% discount at partner venues',
        'Exclusive VIP areas access',
        'Dedicated concierge service',
        'Complimentary room upgrades',
        'Priority event invitations'
      ]
    }
  ];

  // Get current tier data
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

  return (
    <div className="bg-gradient-to-b from-black to-purple-900/20 min-h-screen">
      {/* Header Section with Enhanced Badge */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/30 to-purple-900/30 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-20 z-0"></div>
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 text-center md:text-left">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 mb-6"
              >
                <Sparkles className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-white">Exclusive Membership</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-6xl font-bold mb-6"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-400">
                  ConviviaPass
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-white/80 mb-8 max-w-xl"
              >
                Your exclusive membership for premium experiences at partner venues across Nigeria and the UK.
                Unlock special discounts, VIP access, and exceptional benefits.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-700/30 transition-all duration-300"
                >
                  Join ConviviaPass
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-300"
                >
                  Learn More
                </motion.button>
              </motion.div>
            </div>
            
            <div className="md:w-1/2 max-w-md mx-auto perspective-1000">
              {/* Enhanced Membership Card with Flip Effect */}
              <motion.div 
                className="relative w-full h-64 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
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
                      membershipTier === 'premium' ? 'from-[#FF0000] to-purple-800' :
                      'from-amber-400 to-amber-700'
                    }`}>
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0)_60%)]"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/10 filter blur-3xl"></div>
                      </div>
                      
                      {/* Membership Badge */}
                      <div className="absolute top-6 right-6">
                        <div className="flex space-x-1">
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
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="relative p-6 h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-white">ConviviaPass</h3>
                          <p className="text-white/70 text-sm capitalize">{membershipTier} Member</p>
                        </div>
                        <div className="rounded-full bg-white/20 backdrop-blur-xl p-2">
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        {/* Barcode/Card Number */}
                        <div className="mb-4">
                          <div className="bg-white/10 backdrop-blur-xl p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div className="flex space-x-1">
                                {Array.from({ length: 8 }).map((_, i) => (
                                  <div key={i} className={`h-8 w-${Math.random() > 0.5 ? '0.5' : '1'} bg-white/80`}></div>
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
                            <p className="text-white/60 text-xs mb-1">MEMBER NAME</p>
                            <p className="text-white font-medium">JOHN SMITH</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-xs mb-1">MEMBERSHIP</p>
                            <p className="text-white font-medium uppercase">{membershipTier}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-xs mb-1">VALID THROUGH</p>
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
                      membershipTier === 'premium' ? 'from-purple-800 to-[#FF0000]' :
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
                        <h3 className="text-lg font-bold text-white mb-4">Membership Benefits</h3>
                        <ul className="space-y-2">
                          {currentTier.benefits.slice(0, 4).map((benefit, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-white/90">
                              <CheckCircle className="h-4 w-4 text-white" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-white/60">POINTS BALANCE</span>
                          <span className="text-white font-bold">{userPoints}</span>
                        </div>
                        
                        {membershipTier !== 'vip' && (
                          <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="text-white/70">Next tier: {nextTier.name}</span>
                              <span className="text-white/70">{nextTier.pointsRequired - userPoints} points needed</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  membershipTier === 'standard' ? 'bg-blue-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${calculateProgress()}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hint to flip */}
                <div className="text-white/50 text-xs text-center mt-4">
                  Click card to flip
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tap to see back of card (mobile-only) */}
      <div className="md:hidden text-center mt-2 text-white/60 text-sm">
        Tap card to see benefits
      </div>
      
      {/* Membership Dashboard Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex border-b border-white/10">
            <button 
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'benefits' ? 'text-white border-b-2 border-red-500' : 'text-white/60 hover:text-white/80'}`}
              onClick={() => setActiveTab('benefits')}
            >
              Member Benefits
            </button>
            <button 
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'tiers' ? 'text-white border-b-2 border-red-500' : 'text-white/60 hover:text-white/80'}`}
              onClick={() => setActiveTab('tiers')}
            >
              Membership Tiers
            </button>
            <button 
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'activity' ? 'text-white border-b-2 border-red-500' : 'text-white/60 hover:text-white/80'}`}
              onClick={() => setActiveTab('activity')}
            >
              Activity History
            </button>
          </div>
          
          <div className="p-6">
            {/* Benefits Tab */}
            {activeTab === 'benefits' && (
              <div>
                <h2 className="text-2xl font-bold mb-8">Your Member Benefits</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: <Percent className="h-6 w-6 text-red-400" />,
                      title: "Exclusive Discounts",
                      description: "Save up to 30% at all partner venues across Nigeria and the UK.",
                      available: true
                    },
                    {
                      icon: <Star className="h-6 w-6 text-red-400" />,
                      title: "VIP Access",
                      description: "Skip the lines with priority entry at popular venues and events.",
                      available: membershipTier !== 'standard'
                    },
                    {
                      icon: <Gift className="h-6 w-6 text-red-400" />,
                      title: "Welcome Drinks",
                      description: "Enjoy complimentary drinks upon arrival at participating venues.",
                      available: membershipTier !== 'standard'
                    },
                    {
                      icon: <Calendar className="h-6 w-6 text-red-400" />,
                      title: "Member Events",
                      description: "Access to exclusive events and experiences throughout the year.",
                      available: true
                    },
                    {
                      icon: <Ticket className="h-6 w-6 text-red-400" />,
                      title: "Reserved Areas",
                      description: "Guaranteed seating in premium areas at select partner venues.",
                      available: membershipTier === 'vip'
                    },
                    {
                      icon: <Users className="h-6 w-6 text-red-400" />,
                      title: "Guest Privileges",
                      description: "Extend your benefits to guests at participating venues.",
                      available: membershipTier === 'vip'
                    }
                  ].map((benefit, index) => (
                    <div 
                      key={index}
                      className={`p-5 rounded-xl border ${benefit.available 
                        ? 'bg-white/5 border-white/10' 
                        : 'bg-white/2 border-white/5 opacity-40'}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-600/20 to-purple-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                          {benefit.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                            {!benefit.available && (
                              <span className="px-2 py-0.5 text-xs bg-white/10 rounded-full text-white/70">
                                Higher tier
                              </span>
                            )}
                          </div>
                          <p className="text-white/70 text-sm mt-1">{benefit.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {membershipTier !== 'vip' && (
                  <div className="mt-8 bg-gradient-to-r from-red-900/20 to-purple-900/20 rounded-xl p-6 border border-red-500/20">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">Upgrade Your Membership</h3>
                        <p className="text-white/70 mt-2">
                          Unlock all benefits by upgrading to our {membershipTier === 'standard' ? 'Premium' : 'VIP'} tier.
                          You're {nextTier.pointsRequired - userPoints} points away from the next level.
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowTierModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0"
                      >
                        View Upgrade Options
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Membership Tiers Tab */}
            {activeTab === 'tiers' && (
              <div>
                <h2 className="text-2xl font-bold mb-8">Membership Tiers</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {tiers.map((tier, index) => (
                    <div 
                      key={index}
                      className={`rounded-xl overflow-hidden ${
                        tier.id === membershipTier 
                          ? 'border-2 border-red-500 relative' 
                          : 'border border-white/10'
                      }`}
                    >
                      {tier.id === membershipTier && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
                          CURRENT
                        </div>
                      )}
                      
                      <div className={`bg-gradient-to-br ${tier.color} p-6`}>
                        <h3 className="text-2xl font-bold text-white mb-1">{tier.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white">
                            {tier.id === 'standard' ? 'Free' : tier.id === 'premium' ? '₦25,000' : '₦45,000'}
                          </span>
                          {tier.id !== 'standard' && (
                            <span className="text-white/80 text-sm">/ year</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-6 bg-black/40">
                        <div className="mb-6">
                          <div className="text-white/80 mb-2">Requires</div>
                          <div className="flex items-center gap-2">
                            {tier.id === 'standard' ? (
                              <span className="text-white">Sign up</span>
                            ) : (
                              <>
                                <span className="text-white font-bold">{tier.pointsRequired}</span>
                                <span className="text-white/80">membership points</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <ul className="space-y-3 mb-6">
                          {tier.benefits.map((benefit, i) => (
                            <li key={i} className="flex gap-3 items-start">
                              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-white/90">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {tier.id !== membershipTier ? (
                          <button 
                            className={`w-full py-3 rounded-lg font-medium ${
                              tier.id === 'standard' 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : tier.id === 'premium'
                                ? 'bg-[#FF0000] hover:bg-red-700 text-white'
                                : 'bg-amber-400 hover:bg-amber-500 text-amber-900'
                            } transition-colors`}
                          >
                            {tier.id === 'standard' ? 'Sign Up Now' : `Upgrade to ${tier.name}`}
                          </button>
                        ) : (
                          <div className="w-full py-3 bg-white/10 text-center text-white/70 rounded-lg">
                            Current Tier
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-10 bg-black/40 p-6 rounded-xl border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">How to Earn Points</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { action: 'Visit partner venues', points: '50 points per visit' },
                      { action: 'Book events through Convivia', points: '100 points per booking' },
                      { action: 'Refer friends', points: '200 points per referral' },
                      { action: 'Review venues', points: '25 points per review' }
                    ].map((item, i) => (
                      <div key={i} className="bg-white/5 p-4 rounded-lg">
                        <div className="text-white font-medium mb-1">{item.action}</div>
                        <div className="text-red-400 text-sm">{item.points}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Activity History Tab */}
            {activeTab === 'activity' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">Activity History</h2>
                  <div className="bg-white/5 rounded-full px-4 py-1.5 flex items-center gap-2">
                    <span className="text-white/80 text-sm">Total Points:</span>
                    <span className="text-white font-bold">{userPoints}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {activityHistory.map((activity, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'visit' ? 'bg-blue-500/20' :
                            activity.type === 'booking' ? 'bg-green-500/20' :
                            activity.type === 'referral' ? 'bg-purple-500/20' :
                            activity.type === 'discount' ? 'bg-amber-500/20' :
                            'bg-red-500/20'
                          }`}>
                            {activity.type === 'visit' ? <MapPin className="h-4 w-4 text-blue-400" /> :
                             activity.type === 'booking' ? <Calendar className="h-4 w-4 text-green-400" /> :
                             activity.type === 'referral' ? <Users className="h-4 w-4 text-purple-400" /> :
                             activity.type === 'discount' ? <Percent className="h-4 w-4 text-amber-400" /> :
                             <Building className="h-4 w-4 text-red-400" />}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{activity.event}</h4>
                            <p className="text-white/60 text-sm">{activity.date}</p>
                          </div>
                        </div>
                        <div className="text-green-400 font-bold">{activity.points}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg text-sm transition-colors flex items-center gap-2 mx-auto">
                    View Full History
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Benefits of ConviviaPass</h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Enjoy exclusive privileges that elevate your event experiences across Nigeria and the UK.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Percent className="h-10 w-10 text-red-400" />,
              title: "Exclusive Discounts",
              description: "Enjoy up to 30% off at partner venues including premium event spaces, hotels, and restaurants."
            },
            {
              icon: <Ticket className="h-10 w-10 text-red-400" />,
              title: "Priority Access",
              description: "Get early access to events, venue bookings, and limited-time offers before they're available to the public."
            },
            {
              icon: <Star className="h-10 w-10 text-red-400" />,
              title: "VIP Treatment",
              description: "Receive personalized service, complimentary upgrades, and special attention at partner establishments."
            },
            {
              icon: <Calendar className="h-10 w-10 text-red-400" />,
              title: "Special Events",
              description: "Access to exclusive member-only events, tastings, and experiences throughout the year."
            },
            {
              icon: <Globe className="h-10 w-10 text-red-400" />,
              title: "International Recognition",
              description: "Your membership is valid at all partner locations in both Nigeria and the UK."
            },
            {
              icon: <Gift className="h-10 w-10 text-red-400" />,
              title: "Complimentary Perks",
              description: "Enjoy welcome drinks, free services, and special amenities at participating venues."
            }
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-black/60 to-purple-900/40 backdrop-blur-sm p-8 rounded-xl border border-white/10 hover:border-red-500/30 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-red-600/20 to-purple-600/20 rounded-full flex items-center justify-center mb-6">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{benefit.title}</h3>
              <p className="text-white/70">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Partner Venues Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        {/* Background decorations */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-red-500 rounded-full filter blur-3xl opacity-5 -z-10"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-5 -z-10"></div>
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Partner Venues</h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            ConviviaPass gives you access to exclusive benefits at these premium partner venues.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "The Grand Lounge",
              location: "Victoria Island, Lagos",
              image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1430&q=80",
              discount: "25% off food & drinks",
              type: "Nightclub"
            },
            {
              name: "The Rooftop Bar",
              location: "Lekki, Lagos",
              image: "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cm9vZnRvcCUyMGJhcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
              discount: "Free welcome cocktail",
              type: "Rooftop Bar"
            },
            {
              name: "Ocean View Resort",
              location: "Epe, Lagos",
              image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
              discount: "20% off accommodation",
              type: "Beach Resort"
            },
            {
              name: "The Jazz Club",
              location: "Ajah, Lagos",
              image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8amF6eiUyMGNsdWJ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
              discount: "VIP seating & no cover charge",
              type: "Live Music Venue"
            },
            {
              name: "The Zen Garden",
              location: "Ikoyi, Lagos",
              image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8emVuJTIwZ2FyZGVufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
              discount: "15% off all bookings",
              type: "Lounge & Restaurant"
            },
            {
              name: "Sunset Beach Club",
              location: "Lekki, Lagos",
              image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHN1bnNldCUyMGJlYWNofGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
              discount: "Priority beach access & 10% off",
              type: "Beach Club"
            }
          ].map((venue, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-red-500/30 transition-all duration-300"
            >
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={venue.image} 
                  alt={venue.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">
                        {venue.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{venue.name}</h3>
                    <div className="flex items-center gap-1.5 text-white/70 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-red-400" />
                      <span>{venue.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500/10 to-purple-500/10 rounded-full">
                    <Star className="h-3.5 w-3.5 text-red-400" />
                    <span className="text-xs text-white">{venue.discount}</span>
                  </div>
                  <div className="text-white/70 text-xs">ConviviaPass Exclusive</div>
                </div>
                
                <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-purple-600">
                  View Venue Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link to="/hotspots" className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-medium transition-colors">
            View all partner venues
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      
      {/* Call-to-Action Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-red-900/20 to-purple-900/20 rounded-2xl overflow-hidden border border-white/10 relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80')] bg-cover bg-center opacity-10"></div>
          
          <div className="relative p-12 md:p-16 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-white">Join Today</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 max-w-3xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-400">
                Unlock Premium Experiences with ConviviaPass
              </span>
            </h2>
            
            <p className="text-xl text-white/70 mb-10 max-w-2xl">
              Join thousands of members who enjoy exclusive benefits, special discounts,
              and unforgettable experiences at the finest venues across Nigeria and the UK.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-700/30 transition-all duration-300"
              >
                Become a Member
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-300"
              >
                View Membership Plans
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tier Comparison Modal */}
      <AnimatePresence>
        {showTierModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-black/90 to-purple-900/50 rounded-xl border border-white/10 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Compare Membership Tiers</h3>
                <button 
                  onClick={() => setShowTierModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/70 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-3 text-white/70 font-normal">Feature</th>
                      {tiers.map(tier => (
                        <th key={tier.id} className="p-3">
                          <div className={`text-center p-3 rounded-lg ${
                            tier.id === 'standard' ? 'bg-blue-600/20' : 
                            tier.id === 'premium' ? 'bg-red-600/20' : 
                            'bg-amber-500/20'
                          }`}>
                            <div className="text-white font-bold">{tier.name}</div>
                            <div className="text-white/70 text-sm">
                              {tier.id === 'standard' ? 'Free' : tier.id === 'premium' ? '₦25,000/yr' : '₦45,000/yr'}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'Member Events Access', standard: true, premium: true, vip: true },
                      { feature: 'Digital Membership Card', standard: true, premium: true, vip: true },
                      { feature: 'Partner Venue Discounts', standard: '10%', premium: '20%', vip: '30%' },
                      { feature: 'Priority Entry', standard: false, premium: true, vip: true },
                      { feature: 'Welcome Drinks', standard: false, premium: true, vip: true },
                      { feature: 'VIP Area Access', standard: false, premium: false, vip: true },
                      { feature: 'Concierge Service', standard: false, premium: false, vip: true },
                      { feature: 'Room Upgrades', standard: false, premium: false, vip: true },
                      { feature: 'Guest Privileges', standard: false, premium: false, vip: true },
                    ].map((row, i) => (
                      <tr key={i} className="border-t border-white/10">
                        <td className="p-4 text-white">{row.feature}</td>
                        {tiers.map(tier => (
                          <td key={tier.id} className="p-4 text-center">
                            {typeof row[tier.id] === 'boolean' ? (
                              row[tier.id] ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <span className="text-white/30">-</span>
                              )
                            ) : (
                              <span className="text-white">{row[tier.id]}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => setShowTierModal(false)} 
                  className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
                <button 
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
