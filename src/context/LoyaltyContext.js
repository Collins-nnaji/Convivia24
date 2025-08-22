import React, { createContext, useContext, useState, useEffect } from 'react';

const LoyaltyContext = createContext();

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
};

// Tier configurations
const TIERS = {
  BRONZE: {
    id: 'bronze',
    name: 'Bronze Starter',
    minPoints: 0,
    maxPoints: 999,
    benefits: ['Basic discounts', '2% cashback on orders'],
    color: '#CD7F32',
    icon: '🥉'
  },
  SILVER: {
    id: 'silver',
    name: 'Silver Regular',
    minPoints: 1000,
    maxPoints: 4999,
    benefits: ['5% cashback on orders', 'Free delivery on orders over ₦50,000', 'Birthday month bonus'],
    color: '#C0C0C0',
    icon: '🥈'
  },
  GOLD: {
    id: 'gold',
    name: 'Gold VIP',
    minPoints: 5000,
    maxPoints: Infinity,
    benefits: ['10% cashback on orders', 'Priority delivery', 'Exclusive VIP drops', 'Dedicated concierge', 'Split payment options'],
    color: '#FFD700',
    icon: '🥇'
  }
};

export const LoyaltyProvider = ({ children }) => {
  const [loyaltyData, setLoyaltyData] = useState({
    points: 0,
    totalEarned: 0,
    totalSpent: 0,
    tier: TIERS.BRONZE,
    referralCode: '',
    referrals: [],
    totalCommissions: 0,
    transactions: []
  });

  const [ambassadorData, setAmbassadorData] = useState({
    isAmbassador: false,
    commissionRate: 0.07, // 7% default
    totalEarnings: 0,
    referralCount: 0,
    monthlyEarnings: 0
  });

  // Calculate current tier based on points
  const calculateTier = (points) => {
    if (points >= TIERS.GOLD.minPoints) return TIERS.GOLD;
    if (points >= TIERS.SILVER.minPoints) return TIERS.SILVER;
    return TIERS.BRONZE;
  };

  // Generate unique referral code
  const generateReferralCode = (name) => {
    const prefix = name.substring(0, 3).toUpperCase();
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${suffix}`;
  };

  // Add points for purchase
  const addPoints = (amount, orderId) => {
    const pointsEarned = Math.floor(amount); // 1 point per ₦1
    const cashback = Math.floor(amount * (loyaltyData.tier.id === 'gold' ? 0.10 : loyaltyData.tier.id === 'silver' ? 0.05 : 0.02));
    
    setLoyaltyData(prev => {
      const newPoints = prev.points + pointsEarned;
      const newTier = calculateTier(newPoints);
      
      return {
        ...prev,
        points: newPoints,
        totalEarned: prev.totalEarned + pointsEarned,
        totalSpent: prev.totalSpent + amount,
        tier: newTier,
        transactions: [
          ...prev.transactions,
          {
            id: orderId,
            type: 'purchase',
            amount,
            pointsEarned,
            cashback,
            date: new Date().toISOString(),
            tier: newTier.name
          }
        ]
      };
    });

    return { pointsEarned, cashback, newTier: calculateTier(loyaltyData.points + pointsEarned) };
  };

  // Redeem points
  const redeemPoints = (pointsToRedeem, rewardType) => {
    if (loyaltyData.points >= pointsToRedeem) {
      setLoyaltyData(prev => ({
        ...prev,
        points: prev.points - pointsToRedeem,
        transactions: [
          ...prev.transactions,
          {
            id: Date.now().toString(),
            type: 'redemption',
            pointsRedeemed: pointsToRedeem,
            rewardType,
            date: new Date().toISOString()
          }
        ]
      }));
      return true;
    }
    return false;
  };

  // Process referral
  const processReferral = (referrerCode, newUserOrder) => {
    // Add commission for referrer
    if (ambassadorData.isAmbassador) {
      const commission = newUserOrder * ambassadorData.commissionRate;
      setAmbassadorData(prev => ({
        ...prev,
        totalEarnings: prev.totalEarnings + commission,
        monthlyEarnings: prev.monthlyEarnings + commission,
        referralCount: prev.referralCount + 1
      }));
    }

    // Add referral to user's list
    setLoyaltyData(prev => ({
      ...prev,
      referrals: [
        ...prev.referrals,
        {
          id: Date.now().toString(),
          code: referrerCode,
          orderAmount: newUserOrder,
          commission: newUserOrder * ambassadorData.commissionRate,
          date: new Date().toISOString()
        }
      ],
      totalCommissions: prev.totalCommissions + (newUserOrder * ambassadorData.commissionRate)
    }));
  };

  // Become ambassador
  const becomeAmbassador = (userDetails) => {
    const referralCode = generateReferralCode(userDetails.name);
    
    setLoyaltyData(prev => ({
      ...prev,
      referralCode
    }));

    setAmbassadorData(prev => ({
      ...prev,
      isAmbassador: true
    }));

    return referralCode;
  };

  // Calculate progress to next tier
  const getProgressToNextTier = () => {
    const currentTier = loyaltyData.tier;
    if (currentTier.id === 'gold') {
      return { progress: 100, pointsNeeded: 0, nextTier: null };
    }

    const nextTierKey = currentTier.id === 'bronze' ? 'SILVER' : 'GOLD';
    const nextTier = TIERS[nextTierKey];
    const pointsNeeded = nextTier.minPoints - loyaltyData.points;
    const progress = Math.min(100, (loyaltyData.points / nextTier.minPoints) * 100);

    return { progress, pointsNeeded, nextTier };
  };

  // Load from localStorage on mount
  useEffect(() => {
    const savedLoyalty = localStorage.getItem('convivia24_loyalty');
    const savedAmbassador = localStorage.getItem('convivia24_ambassador');
    
    if (savedLoyalty) {
      const parsed = JSON.parse(savedLoyalty);
      parsed.tier = calculateTier(parsed.points);
      setLoyaltyData(parsed);
    }
    
    if (savedAmbassador) {
      setAmbassadorData(JSON.parse(savedAmbassador));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('convivia24_loyalty', JSON.stringify(loyaltyData));
  }, [loyaltyData]);

  useEffect(() => {
    localStorage.setItem('convivia24_ambassador', JSON.stringify(ambassadorData));
  }, [ambassadorData]);

  const value = {
    loyaltyData,
    ambassadorData,
    TIERS,
    addPoints,
    redeemPoints,
    processReferral,
    becomeAmbassador,
    getProgressToNextTier,
    calculateTier
  };

  return (
    <LoyaltyContext.Provider value={value}>
      {children}
    </LoyaltyContext.Provider>
  );
};
