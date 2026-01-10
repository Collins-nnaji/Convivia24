'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Zap, ShieldCheck, Moon, Lock, Key,
  Droplet, Trash2, Calendar, Clock, DollarSign,
  Building2, Home, Eye, Star, Sparkle, Waves
} from 'lucide-react';

// Icons by category and type
const serviceIcons = {
  // Cleaning icons
  routine: <Sparkles size={28} />,
  rapid: <Zap size={28} />,
  deep: <Droplet size={28} />,
  compliance: <ShieldCheck size={28} />,
  night: <Moon size={28} />,
  addon: <Trash2 size={28} />,
  // Security icons
  event: <Calendar size={28} />,
  residential: <Home size={28} />,
  commercial: <Building2 size={28} />,
  estate: <ShieldCheck size={28} />,
  emergency: <Zap size={28} />,
  // Bundle icons
  bundle: <Star size={28} />,
};

// Distinct visual styles for each category
const categoryStyles = {
  cleaning: {
    // Warm, soft, rounded - like a clean, fresh space
    gradient: 'from-red-500 via-orange-500 to-amber-500',
    gradientLight: 'from-red-50 via-orange-50 to-amber-50',
    bg: 'bg-gradient-to-br from-red-500 to-orange-500',
    bgLight: 'bg-gradient-to-br from-red-50/80 to-orange-50/80',
    border: 'border-red-300/50',
    borderHover: 'border-red-400',
    text: 'text-red-700',
    textHover: 'text-red-600',
    iconBg: 'bg-gradient-to-br from-red-500 to-orange-500',
    badgeBg: 'bg-gradient-to-r from-red-100 to-orange-100',
    badgeText: 'text-red-700',
    priceBg: 'bg-gradient-to-br from-red-50 to-orange-50',
    shadow: 'shadow-red-200/50',
    shadowHover: 'shadow-red-300/60',
    rounded: 'rounded-3xl', // More rounded for soft feel
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
  },
  security: {
    // Cool, sharp, professional - like security
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    gradientLight: 'from-blue-50 via-indigo-50 to-purple-50',
    bg: 'bg-gradient-to-br from-blue-600 to-indigo-600',
    bgLight: 'bg-gradient-to-br from-blue-50/80 to-indigo-50/80',
    border: 'border-blue-300/50',
    borderHover: 'border-blue-400',
    text: 'text-blue-700',
    textHover: 'text-blue-600',
    iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-600',
    badgeBg: 'bg-gradient-to-r from-blue-100 to-indigo-100',
    badgeText: 'text-blue-700',
    priceBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    shadow: 'shadow-blue-200/50',
    shadowHover: 'shadow-blue-300/60',
    rounded: 'rounded-2xl', // Less rounded for professional feel
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
  },
  bundle: {
    // Energetic, premium - combination of both
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    gradientLight: 'from-green-50 via-emerald-50 to-teal-50',
    bg: 'bg-gradient-to-br from-green-500 to-emerald-500',
    bgLight: 'bg-gradient-to-br from-green-50/80 to-emerald-50/80',
    border: 'border-green-300/50',
    borderHover: 'border-green-400',
    text: 'text-green-700',
    textHover: 'text-green-600',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
    badgeBg: 'bg-gradient-to-r from-green-100 to-emerald-100',
    badgeText: 'text-green-700',
    priceBg: 'bg-gradient-to-br from-green-50 to-emerald-50',
    shadow: 'shadow-green-200/50',
    shadowHover: 'shadow-green-300/60',
    rounded: 'rounded-3xl',
    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]',
  },
};

export default function ServiceCard({ service, index = 0 }) {
  const { name, category = 'cleaning', type, description, base_price, pricing_model, duration_hours, price_range, requires_licensing } = service;
  
  const styles = categoryStyles[category] || categoryStyles.cleaning;

  // Format price range for Nigeria pricing (NGN)
  const formatPriceRange = () => {
    if (price_range && price_range.min && price_range.max) {
      return `₦${price_range.min.toLocaleString('en-NG')} – ₦${price_range.max.toLocaleString('en-NG')}`;
    }
    if (base_price > 0) {
      if (pricing_model === 'hourly') {
        return `From ₦${base_price.toLocaleString('en-NG')}/hr`;
      }
      if (pricing_model === 'daily') {
        return `From ₦${base_price.toLocaleString('en-NG')}/day`;
      }
      if (pricing_model === 'monthly') {
        return `From ₦${base_price.toLocaleString('en-NG')}/month`;
      }
      if (pricing_model === 'event') {
        return `From ₦${base_price.toLocaleString('en-NG')}/event`;
      }
      return `From ₦${base_price.toLocaleString('en-NG')}`;
    }
    return 'Price on request';
  };

  // Get category badge label
  const getCategoryBadge = () => {
    if (category === 'cleaning') return 'CONVIVIA24 CLEAN';
    if (category === 'security') return 'CONVIVIA24 SECURE';
    if (category === 'bundle') return 'BUNDLE PACKAGE';
    return 'SERVICE';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.6, type: 'spring' }}
      whileHover={{ y: -12, scale: 1.02, rotate: category === 'cleaning' ? [0, -1, 1, 0] : 0 }}
      className={`group relative ${styles.rounded} overflow-hidden h-full flex flex-col backdrop-blur-sm`}
    >
      {/* Animated Background Glow */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${styles.gradientLight} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main Card */}
      <div className={`relative z-10 p-8 ${styles.rounded} bg-white/95 backdrop-blur-xl border-2 ${styles.border} ${styles.shadow} group-hover:${styles.borderHover} group-hover:${styles.shadowHover} transition-all duration-500 h-full flex flex-col`}>
        {/* Category Badge with Gradient */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`inline-block px-4 py-1.5 ${styles.rounded} ${styles.badgeBg} border ${styles.border} mb-4 backdrop-blur-sm`}
        >
          <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${styles.badgeText}`}>
            {getCategoryBadge()}
          </span>
        </motion.div>

        {/* Icon with Distinct Style */}
        <motion.div
          whileHover={{ 
            scale: 1.15, 
            rotate: category === 'cleaning' ? [0, 10, -10, 0] : [0, -5, 5, 0]
          }}
          transition={{ type: 'spring', stiffness: 200 }}
          className={`w-20 h-20 ${styles.rounded} ${styles.iconBg} flex items-center justify-center text-white shadow-xl mb-6 ${styles.glow} group-hover:shadow-2xl transition-all`}
        >
          {serviceIcons[type] || <Sparkles size={28} />}
        </motion.div>

        {/* Content */}
        <div className="space-y-4 flex-1 flex flex-col">
          <h3 className={`text-2xl font-black uppercase tracking-tight leading-tight ${styles.text} group-hover:${styles.textHover} transition-colors duration-300`}>
            {name}
          </h3>
          
          <p className="text-sm text-gray-700 leading-relaxed font-medium flex-1">
            {description}
          </p>

          {/* Licensing Badge for Security */}
          {requires_licensing && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 pt-2"
            >
              <Lock size={16} className="text-blue-600" />
              <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                Licensed Security Required
              </span>
            </motion.div>
          )}

          {/* Price Range - Prominent with Gradient Background */}
          <div className="pt-4 mt-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-4 ${styles.rounded} ${styles.priceBg} border ${styles.border} backdrop-blur-sm group-hover:shadow-lg transition-all`}
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className={`${styles.text} font-black`} />
                <span className={`text-lg font-black ${styles.text}`}>
                  {formatPriceRange()}
                </span>
              </div>
              {duration_hours && (
                <div className="flex items-center gap-2 text-gray-600 text-xs mt-2">
                  <Clock size={12} className="text-gray-500" />
                  <span className="font-medium">
                    {duration_hours >= 24 
                      ? `${Math.round(duration_hours / 24)} days typical`
                      : `${duration_hours} hours typical`}
                  </span>
                </div>
              )}
              {category === 'bundle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 mt-3 pt-3 border-t border-green-200"
                >
                  <Star size={14} className="text-orange-500 fill-orange-500" />
                  <span className="text-xs font-black text-orange-600 uppercase tracking-wider">
                    Bundle Savings Applied
                  </span>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Decorative Element - Different for each category */}
        {category === 'cleaning' && (
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 opacity-10"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Sparkle className="w-full h-full text-red-500" />
          </motion.div>
        )}
        {category === 'security' && (
          <motion.div
            className="absolute bottom-0 right-0 w-24 h-24 opacity-10"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <ShieldCheck className="w-full h-full text-blue-500" />
          </motion.div>
        )}
        {category === 'bundle' && (
          <motion.div
            className="absolute top-0 left-0 w-28 h-28 opacity-10"
            animate={{
              rotate: [0, -360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Star className="w-full h-full text-green-500 fill-green-500" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
