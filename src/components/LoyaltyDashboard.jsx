import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, Star, Gift, Truck, Shield, Users, TrendingUp, 
  Award, Target, Zap, Copy, Share2, DollarSign, Calendar,
  Check, ChevronRight, Sparkles, Heart, Trophy
} from 'lucide-react';
import { useLoyalty } from '../context/LoyaltyContext';

const LoyaltyDashboard = ({ isOpen, onClose }) => {
  const { loyaltyData, ambassadorData, TIERS, getProgressToNextTier, becomeAmbassador } = useLoyalty();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAmbassadorSignup, setShowAmbassadorSignup] = useState(false);
  const [ambassadorForm, setAmbassadorForm] = useState({ name: '', phone: '', social: '' });

  const { progress, pointsNeeded, nextTier } = getProgressToNextTier();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(loyaltyData.referralCode);
    // Add notification here
  };

  const handleAmbassadorSignup = () => {
    if (ambassadorForm.name && ambassadorForm.phone) {
      const code = becomeAmbassador(ambassadorForm);
      setShowAmbassadorSignup(false);
      setAmbassadorForm({ name: '', phone: '', social: '' });
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-red-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{loyaltyData.tier.icon}</div>
              <div>
                <h2 className="text-2xl font-bold">Convivia24 Rewards</h2>
                <p className="text-white/80">Current Status: {loyaltyData.tier.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress to {nextTier?.name || 'Max Level'}</span>
              <span>{loyaltyData.points.toLocaleString()} points</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            {nextTier && (
              <p className="text-sm text-white/80 mt-2">
                {pointsNeeded.toLocaleString()} points to unlock {nextTier.name}
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{loyaltyData.points.toLocaleString()}</div>
              <div className="text-sm text-white/80">Points Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatCurrency(loyaltyData.totalSpent)}</div>
              <div className="text-sm text-white/80">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatCurrency(loyaltyData.totalCommissions)}</div>
              <div className="text-sm text-white/80">Commissions Earned</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: Star },
            { id: 'benefits', label: 'Benefits', icon: Gift },
            { id: 'ambassador', label: 'Ambassador', icon: Users },
            { id: 'history', label: 'History', icon: Calendar }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Current Tier Benefits */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Award className="text-yellow-500" size={24} />
                    Your {loyaltyData.tier.name} Benefits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {loyaltyData.tier.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="text-green-500" size={16} />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Redeem Points */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="text-purple-500" size={24} />
                    Redeem Points
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">₦5,000 Discount</span>
                        <span className="text-red-600 font-bold">500 pts</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Apply to any order</p>
                      <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                        Redeem
                      </button>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Free Delivery</span>
                        <span className="text-blue-600 font-bold">200 pts</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Next order delivery</p>
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Redeem
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'benefits' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* All Tiers Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.values(TIERS).map(tier => (
                    <div 
                      key={tier.id}
                      className={`border rounded-xl p-6 ${
                        loyaltyData.tier.id === tier.id 
                          ? 'border-2 border-purple-500 bg-purple-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="text-center mb-4">
                        <div className="text-3xl mb-2">{tier.icon}</div>
                        <h3 className="font-bold text-lg" style={{ color: tier.color }}>
                          {tier.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {tier.minPoints === 0 ? '0' : tier.minPoints.toLocaleString()}
                          {tier.maxPoints === Infinity ? '+' : ` - ${tier.maxPoints.toLocaleString()}`} points
                        </p>
                      </div>
                      <div className="space-y-2">
                        {tier.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Check className="text-green-500" size={14} />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'ambassador' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {!ambassadorData.isAmbassador ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">💼</div>
                    <h3 className="text-2xl font-bold mb-4">Become a Convivia24 Ambassador</h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                      Turn your social network into income! Earn 7% commission on every order from your referrals. 
                      Perfect for students, event promoters, and nightlife influencers.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <DollarSign className="text-green-600 mx-auto mb-2" size={32} />
                        <div className="font-bold text-lg">7% Commission</div>
                        <div className="text-sm text-gray-600">Per successful order</div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <Share2 className="text-blue-600 mx-auto mb-2" size={32} />
                        <div className="font-bold text-lg">Easy Sharing</div>
                        <div className="text-sm text-gray-600">Unique referral codes</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <TrendingUp className="text-purple-600 mx-auto mb-2" size={32} />
                        <div className="font-bold text-lg">Real-time Tracking</div>
                        <div className="text-sm text-gray-600">Monitor your earnings</div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setShowAmbassadorSignup(true)}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-red-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                    >
                      Join Ambassador Program
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Ambassador Dashboard */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={24} />
                        Ambassador Dashboard
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{formatCurrency(ambassadorData.totalEarnings)}</div>
                          <div className="text-sm text-gray-600">Total Earnings</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{ambassadorData.referralCount}</div>
                          <div className="text-sm text-gray-600">Referrals</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{(ambassadorData.commissionRate * 100).toFixed(0)}%</div>
                          <div className="text-sm text-gray-600">Commission Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{formatCurrency(ambassadorData.monthlyEarnings)}</div>
                          <div className="text-sm text-gray-600">This Month</div>
                        </div>
                      </div>
                    </div>

                    {/* Referral Code */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-4">Your Referral Code</h3>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <code className="flex-1 text-lg font-mono font-bold">{loyaltyData.referralCode}</code>
                        <button 
                          onClick={copyReferralCode}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <Copy size={16} />
                          Copy
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Share this code with friends. You earn 7% commission on every order they make!
                      </p>
                    </div>
                  </div>
                )}

                {/* Ambassador Signup Modal */}
                {showAmbassadorSignup && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                      <h3 className="text-xl font-bold mb-4">Join Ambassador Program</h3>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={ambassadorForm.name}
                          onChange={(e) => setAmbassadorForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={ambassadorForm.phone}
                          onChange={(e) => setAmbassadorForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                        <input
                          type="text"
                          placeholder="Social Media Handle (Optional)"
                          value={ambassadorForm.social}
                          onChange={(e) => setAmbassadorForm(prev => ({ ...prev, social: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button 
                          onClick={() => setShowAmbassadorSignup(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleAmbassadorSignup}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Join Program
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold">Transaction History</h3>
                {loyaltyData.transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No transactions yet. Start shopping to earn points!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {loyaltyData.transactions.slice(0, 10).map(transaction => (
                      <div key={transaction.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {transaction.type === 'purchase' ? 'Purchase' : 'Redemption'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          {transaction.pointsEarned && (
                            <div className="text-green-600 font-medium">+{transaction.pointsEarned} pts</div>
                          )}
                          {transaction.pointsRedeemed && (
                            <div className="text-red-600 font-medium">-{transaction.pointsRedeemed} pts</div>
                          )}
                          {transaction.amount && (
                            <div className="text-sm text-gray-600">{formatCurrency(transaction.amount)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoyaltyDashboard;
