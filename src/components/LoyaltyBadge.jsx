import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Crown, Award, ChevronDown } from 'lucide-react';
import { useLoyalty } from '../context/LoyaltyContext';
import LoyaltyDashboard from './LoyaltyDashboard';

const LoyaltyBadge = () => {
  const { loyaltyData, getProgressToNextTier } = useLoyalty();
  const [showDashboard, setShowDashboard] = useState(false);
  const { progress } = getProgressToNextTier();

  return (
    <>
      <motion.button
        onClick={() => setShowDashboard(true)}
        className="relative flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Tier Icon */}
        <div className="text-lg">{loyaltyData.tier.icon}</div>
        
        {/* Points Display */}
        <div className="hidden md:block">
          <div className="text-xs font-medium">{loyaltyData.points.toLocaleString()} pts</div>
          <div className="text-xs opacity-80">{loyaltyData.tier.name.split(' ')[0]}</div>
        </div>

        {/* Progress Ring */}
        <div className="relative w-8 h-8">
          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="12"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="16"
              cy="16"
              r="12"
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${(progress / 100) * 75.4} 75.4`}
              className="transition-all duration-500"
            />
          </svg>
          <Star className="absolute inset-0 m-auto text-white" size={12} />
        </div>

        <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />

        {/* Notification Dot for New Rewards */}
        {loyaltyData.points >= 500 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.button>

      {/* Loyalty Dashboard Modal */}
      <LoyaltyDashboard 
        isOpen={showDashboard} 
        onClose={() => setShowDashboard(false)} 
      />
    </>
  );
};

export default LoyaltyBadge;
