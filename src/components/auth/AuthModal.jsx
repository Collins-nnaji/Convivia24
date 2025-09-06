import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Mail, Phone, Eye, EyeOff, User, Lock, 
  Chrome, Facebook, Apple, Crown, Star, Sparkles
} from 'lucide-react';

const AuthModal = ({ isOpen, onClose, mode = 'login' }) => {
  const [currentMode, setCurrentMode] = useState(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTier, setSelectedTier] = useState('free');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    interests: []
  });

  const membershipTiers = [
    {
      id: 'free',
      name: 'Free Explorer',
      price: 'Free',
      icon: <User className="w-6 h-6" />,
      color: 'from-gray-500 to-gray-600',
      features: [
        'Basic event discovery',
        'Standard hangout rooms',
        'Basic rewards points',
        '5 events per month'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Socialite',
      price: '£9.99/month',
      icon: <Star className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      features: [
        'Unlimited events',
        'Priority recommendations',
        'VIP hangout rooms',
        '2x rewards points',
        'Early event access'
      ]
    },
    {
      id: 'vip',
      name: 'VIP Globetrotter',
      price: '£24.99/month',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-yellow-500 to-yellow-600',
      features: [
        'All Premium features',
        'VIP queue skip',
        'Free drinks at events',
        '3x rewards points',
        'Global partner access',
        'Personal concierge'
      ]
    }
  ];

  const interests = [
    'Nightlife', 'Sports', 'Music Festivals', 'Cultural Events',
    'Fine Dining', 'Rooftop Parties', 'Underground Scene', 'Art & Culture',
    'Tech Meetups', 'Networking', 'Adventure Sports', 'Food & Wine'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle authentication logic here
    console.log('Form submitted:', { ...formData, tier: selectedTier });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentMode === 'login' ? 'Welcome Back' : 'Join Convivia24'}
              </h2>
              <p className="text-gray-600">
                {currentMode === 'login' 
                  ? 'Sign in to access your social hub' 
                  : 'Create your account and start exploring'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            {currentMode === 'signup' && (
              <>
                {/* Membership Tier Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Choose Your Membership</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {membershipTiers.map((tier) => (
                      <motion.div
                        key={tier.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedTier(tier.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedTier === tier.id
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white bg-gradient-to-r ${tier.color} mb-3`}>
                          {tier.icon}
                          <span className="font-medium">{tier.name}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-2">{tier.price}</div>
                        <ul className="space-y-1">
                          {tier.features.map((feature, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <Sparkles size={12} className="text-red-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Social Login Options */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Chrome size={20} />
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Facebook size={20} />
                    Facebook
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Apple size={20} />
                    Apple
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-gray-500 text-sm">or continue with</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentMode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </>
                )}
                
                <div className={currentMode === 'login' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {currentMode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                )}

                <div className={currentMode === 'login' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {currentMode === 'signup' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Interests Selection for Signup */}
              {currentMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Your Interests (Select at least 3)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {interests.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-2 rounded-full text-sm transition-colors ${
                          formData.interests.includes(interest)
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300"
              >
                {currentMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              {/* Switch Mode */}
              <div className="text-center">
                <span className="text-gray-600">
                  {currentMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentMode(currentMode === 'login' ? 'signup' : 'login')}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  {currentMode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
