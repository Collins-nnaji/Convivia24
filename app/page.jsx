'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, ShieldCheck, Clock, Zap, Lock, 
  Sparkles, Droplet, AlertCircle, CheckCircle, MapPin, 
  Phone, ArrowDown, Star, Users, TrendingUp, Calculator,
  FlaskConical, Building2, Home, Key, Eye, Sparkle, Waves
} from 'lucide-react';
import ServiceCard from '@/components/ServiceCard';

// Modern animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 14,
      mass: 0.8
    }
  }
};

const LandingPage = () => {
  const router = useRouter();
  const { scrollY } = useScroll();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(0);
  const [selectedVertical, setSelectedVertical] = useState('all');
  const heroRef = useRef(null);
  const servicesRef = useRef(null);
  const isServicesInView = useInView(servicesRef, { once: true, margin: '-100px' });
  
  const locations = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Enugu'];

  // Parallax transforms (removed opacity to prevent disappearing effect)
  const heroY = useTransform(scrollY, [0, 800], [0, 100]);

  // Cleaning & Sanitation Services (Nigeria-focused pricing)
  const cleaningServices = [
    {
      name: 'Home Cleaning',
      category: 'cleaning',
      type: 'routine',
      description: 'Routine home cleaning including floors, bathrooms, and common areas. Instant pricing: ₦15,000–₦50,000 based on property size.',
      base_price: 15000,
      pricing_model: 'fixed',
      duration_hours: 3.0,
      price_range: { min: 15000, max: 50000 }
    },
    {
      name: 'Deep Cleaning & Disinfection',
      category: 'cleaning',
      type: 'deep',
      description: 'Comprehensive deep cleaning with fumigation and high-touch sanitation. End-of-tenancy speciality. ₦50,000–₦350,000.',
      base_price: 50000,
      pricing_model: 'fixed',
      duration_hours: 6.0,
      price_range: { min: 50000, max: 350000 }
    },
    {
      name: 'Estate Sanitation',
      category: 'cleaning',
      type: 'compliance',
      description: 'Regular sanitation for gated communities and estates. Compliance-ready with audit trails. Monthly retainers available.',
      base_price: 80000,
      pricing_model: 'monthly',
      duration_hours: 8.0,
      price_range: { min: 80000, max: 250000 }
    }
  ];

  // Security Services (Nigeria-focused pricing)
  const securityServices = [
    {
      name: 'Event Security',
      category: 'security',
      type: 'event',
      description: 'Licensed security guards for events, parties, and gatherings. Hourly rates from ₦3,000/hr per guard. Minimum 4 hours.',
      base_price: 3000,
      pricing_model: 'hourly',
      duration_hours: 4.0,
      price_range: { min: 12000, max: 60000 }
    },
    {
      name: 'Office & Night Guards',
      category: 'security',
      type: 'commercial',
      description: 'Dedicated security for offices, warehouses, and commercial properties. Monthly retainers from ₦300,000/month.',
      base_price: 300000,
      pricing_model: 'monthly',
      duration_hours: 168.0,
      price_range: { min: 300000, max: 600000 }
    },
    {
      name: 'Estate Patrols',
      category: 'security',
      type: 'estate',
      description: 'Regular patrols for gated communities and estates. Mobile security teams. Monthly contracts available.',
      base_price: 400000,
      pricing_model: 'monthly',
      duration_hours: 730.0,
      price_range: { min: 400000, max: 1000000 }
    }
  ];

  // Driver Services (Nigeria-focused pricing)
  const driverServices = [
    {
      name: 'Short-Term Driver Hire',
      category: 'drivers',
      type: 'short_term',
      description: 'Professional drivers for daily, weekly, or monthly assignments. Perfect for business trips, events, or temporary needs. ₦5,000–₦15,000/day.',
      base_price: 5000,
      pricing_model: 'daily',
      duration_hours: 8.0,
      price_range: { min: 5000, max: 15000 },
      requires_licensing: true
    },
    {
      name: 'Long-Term Driver Hire',
      category: 'drivers',
      type: 'long_term',
      description: 'Dedicated drivers for extended periods (3+ months). Ideal for executives, families, or businesses. Monthly retainers from ₦120,000/month.',
      base_price: 120000,
      pricing_model: 'monthly',
      duration_hours: 240.0,
      price_range: { min: 120000, max: 250000 },
      requires_licensing: true
    },
    {
      name: 'Chauffeur Service',
      category: 'drivers',
      type: 'premium',
      description: 'Premium chauffeur service with luxury vehicles. Perfect for VIP transport, airport transfers, and special occasions. ₦8,000–₦20,000/trip.',
      base_price: 8000,
      pricing_model: 'fixed',
      duration_hours: 2.0,
      price_range: { min: 8000, max: 20000 },
      requires_licensing: true
    }
  ];

  // Bundle Packages (Improved - combining all three services)
  const bundleServices = [
    {
      name: 'Estate Complete Care Package',
      category: 'bundle',
      type: 'estate',
      description: 'Full estate management: cleaning, security patrols, and driver services. Monthly retainers. Save 20%.',
      base_price: 800000,
      pricing_model: 'monthly',
      duration_hours: 730.0,
      price_range: { min: 800000, max: 1500000 }
    },
    {
      name: 'Corporate Office Complete',
      category: 'bundle',
      type: 'corporate',
      description: 'All-in-one office solution: daily cleaning, security guards, and corporate drivers. Perfect for businesses. Save 18%.',
      base_price: 500000,
      pricing_model: 'monthly',
      duration_hours: 730.0,
      price_range: { min: 500000, max: 1000000 }
    },
    {
      name: 'Event Premium Package',
      category: 'bundle',
      type: 'premium_event',
      description: 'Ultimate event package: cleaning, security, and chauffeur service. Perfect for high-end events. Save 25%.',
      base_price: 250000,
      pricing_model: 'event',
      duration_hours: 12.0,
      price_range: { min: 250000, max: 500000 }
    }
  ];

  const allServices = [...cleaningServices, ...securityServices, ...driverServices, ...bundleServices];

  const testimonials = [
    {
      name: 'Adebayo Okafor',
      role: 'Property Manager, Lekki Estate, Lagos',
      text: 'Having both cleaning and security in one platform is brilliant. It simplifies everything for us.',
      rating: 5
    },
    {
      name: 'Chioma Nwosu',
      role: 'Event Organiser, Abuja',
      text: 'The Clean + Secure Event Package was perfect. One platform, one invoice, seamless service.',
      rating: 5
    },
    {
      name: 'Dr. Ibrahim Musa',
      role: 'Short-let Host, Port Harcourt',
      text: 'Short-let security guards and cleaning services together - exactly what we needed.',
      rating: 5
    }
  ];

  const stats = [
    { value: '24/7', label: 'Availability', icon: Clock },
    { value: '100%', label: 'Vetted Professionals', icon: ShieldCheck },
    { value: '<2hrs', label: 'Response Time', icon: Zap },
    { value: 'Nigeria', label: 'Nationwide Service', icon: MapPin }
  ];

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentLocation((prev) => (prev + 1) % locations.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleRequestQuote = () => {
    router.push('/auth/register');
  };

  const displayedServices = selectedVertical === 'all' 
    ? allServices 
    : selectedVertical === 'cleaning' 
    ? cleaningServices 
    : selectedVertical === 'security'
    ? securityServices
    : selectedVertical === 'drivers'
    ? driverServices
    : bundleServices;

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden font-sans selection:bg-red-600 selection:text-white relative">
      {/* Hero Section - Modern & Compact Design */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20 lg:py-24 z-10 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50"
      >
        {/* Subtle Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-0 w-full h-full opacity-30"
            animate={{
              background: [
                'radial-gradient(circle at 20% 30%, rgba(239, 68, 68, 0.08) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 30%, rgba(239, 68, 68, 0.08) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <motion.div 
          style={{ y: heroY }}
          className="max-w-5xl mx-auto w-full text-center space-y-8 relative z-10"
        >
          {/* Logo with Glow Effect - KEPT ROTATING */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, type: 'spring', stiffness: 150 }}
            className="flex justify-center mb-6"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-20 animate-pulse" />
              <motion.img 
                src="/Logo2.png" 
                alt="Convivia 24 Logo" 
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 relative z-10 drop-shadow-lg"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </motion.div>

          {/* Compact Badges */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6"
          >
            {[
              { icon: Clock, text: '24/7', bg: 'bg-red-50/80', border: 'border-red-200/50', iconColor: 'text-red-600', textColor: 'text-red-700' },
              { icon: ShieldCheck, text: 'Vetted', bg: 'bg-green-50/80', border: 'border-green-200/50', iconColor: 'text-green-600', textColor: 'text-green-700' },
              { icon: Lock, text: 'Licensed', bg: 'bg-blue-50/80', border: 'border-blue-200/50', iconColor: 'text-blue-600', textColor: 'text-blue-700' },
            ].map((badge, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -2 }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl ${badge.bg} backdrop-blur-sm border ${badge.border} shadow-sm`}
              >
                <badge.icon size={14} className={badge.iconColor} />
                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${badge.textColor}`}>{badge.text}</span>
              </motion.div>
            ))}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gray-100/80 backdrop-blur-sm border border-gray-200 shadow-sm"
            >
              <MapPin size={14} className="text-gray-600" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentLocation}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.3 }}
                  className="text-[9px] sm:text-[10px] font-bold tracking-wider text-gray-700"
                >
                  {locations[currentLocation]}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Compact Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
            className="space-y-3 mb-6"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 leading-tight">
              <span className="block">Convivia</span>
              <motion.span 
                className="block bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                24
              </motion.span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-500 italic">
              Clean. Secure. Drive. On demand.
            </p>
          </motion.div>

          {/* Compact Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium mb-8"
          >
            Nigeria's leading on-demand platform connecting homes, businesses, and communities with trusted <span className="font-semibold text-red-600">cleaning</span>, <span className="font-semibold text-blue-600">security</span>, and <span className="font-semibold text-purple-600">driver</span> professionals.
          </motion.p>

          {/* Compact Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-8"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
              <Zap size={14} className="text-orange-500" />
              <span className="text-xs font-semibold text-gray-700">Instant Booking</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-xs font-semibold text-gray-700">Verified Pros</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
              <Star size={14} className="text-yellow-500" />
              <span className="text-xs font-semibold text-gray-700">5-Star Rated</span>
            </div>
          </motion.div>

          {/* Compact CTA Buttons - All Visible on Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, type: 'spring', stiffness: 100 }}
            className="flex flex-wrap gap-3 justify-center items-center pt-4 relative z-20"
          >
            <motion.button
              whileHover={{ 
                scale: 1.03, 
                y: -2,
                boxShadow: '0 12px 24px rgba(220, 38, 38, 0.25)'
              }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRequestQuote}
              className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl overflow-hidden shadow-lg text-sm sm:text-base"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <span className="relative flex items-center gap-2">
                Request Service
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <motion.button
              whileHover={{ 
                scale: 1.03,
                y: -2,
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/auth/login')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl transition-all text-sm sm:text-base shadow-sm hover:border-red-400 hover:bg-red-50/50"
            >
              Client Login
            </motion.button>

            <motion.button
              whileHover={{ 
                scale: 1.03,
                y: -2,
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/auth/register/staff')}
              className="px-5 sm:px-7 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg text-xs sm:text-sm flex items-center gap-2"
            >
              <Users size={16} />
              Join Team
            </motion.button>

            {/* Test Pages Button - Now Visible on Mobile */}
            {process.env.NODE_ENV === 'development' && (
              <motion.button
                whileHover={{ 
                  scale: 1.03,
                  y: -2,
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/test')}
                className="px-5 sm:px-7 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl shadow-lg text-xs sm:text-sm flex items-center gap-2"
              >
                <ShieldCheck size={16} />
                Test Pages
              </motion.button>
            )}
          </motion.div>

          {/* Compact Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <motion.span
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[9px] font-semibold uppercase tracking-widest text-gray-400"
            >
              Scroll
            </motion.span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown size={20} className="text-gray-400" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section with Modern Cards */}
      <StatsSection stats={stats} />

      {/* Services Section with Distinct Visual Styles */}
      <ServicesSection 
        ref={servicesRef}
        cleaningServices={cleaningServices}
        securityServices={securityServices}
        driverServices={driverServices}
        bundleServices={bundleServices}
        selectedVertical={selectedVertical}
        setSelectedVertical={setSelectedVertical}
        isInView={isServicesInView}
      />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Competitive Advantage Section */}
      <CompetitiveAdvantageSection />

      {/* Testimonials Section */}
      <TestimonialsSection testimonials={testimonials} />

      {/* Final CTA Section */}
      <CTASection onRequestQuote={handleRequestQuote} router={router} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

// Stats Section with Glassmorphism
const StatsSection = ({ stats }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="relative px-4 sm:px-6 py-12 sm:py-16 bg-gradient-to-b from-white via-gray-50/50 to-white z-10 overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ 
                delay: index * 0.08,
                type: 'spring',
                stiffness: 120
              }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="group relative"
            >
              <div className="relative p-5 sm:p-6 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-md hover:shadow-lg transition-all">
                <motion.div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white mb-3 mx-auto shadow-md"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon size={20} className="sm:w-6 sm:h-6" />
                </motion.div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-black mb-1 text-center">{stat.value}</div>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-600 text-center">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Services Section with Distinct Visual Styles
const ServicesSection = React.forwardRef(({ cleaningServices, securityServices, driverServices, bundleServices, selectedVertical, setSelectedVertical, isInView }, ref) => {
  const verticals = [
    { id: 'all', label: 'All Services', icon: Building2, color: 'gray', gradient: 'from-gray-500 to-gray-600' },
    { id: 'cleaning', label: 'Cleaning & Sanitation', icon: Sparkles, color: 'red', gradient: 'from-red-500 via-orange-500 to-amber-500' },
    { id: 'security', label: 'Security Services', icon: Lock, color: 'blue', gradient: 'from-blue-500 via-indigo-500 to-purple-500' },
    { id: 'drivers', label: 'Driver Services', icon: Key, color: 'purple', gradient: 'from-purple-500 via-pink-500 to-rose-500' },
    { id: 'bundle', label: 'Bundles', icon: Star, color: 'green', gradient: 'from-green-500 via-emerald-500 to-teal-500' },
  ];

  const services = selectedVertical === 'all' 
    ? [...cleaningServices, ...securityServices, ...driverServices, ...bundleServices]
    : selectedVertical === 'cleaning'
    ? cleaningServices
    : selectedVertical === 'security'
    ? securityServices
    : selectedVertical === 'drivers'
    ? driverServices
    : bundleServices;

  return (
    <section ref={ref} className="relative px-4 sm:px-6 py-12 sm:py-16 lg:py-20 z-10 bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {selectedVertical === 'cleaning' && (
          <motion.div
            className="absolute top-0 left-0 w-full h-full opacity-5"
            animate={{
              background: [
                'radial-gradient(circle at 20% 30%, rgba(239, 68, 68, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 70%, rgba(251, 146, 60, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 30%, rgba(239, 68, 68, 0.3) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {selectedVertical === 'security' && (
          <motion.div
            className="absolute top-0 left-0 w-full h-full opacity-5"
            animate={{
              background: [
                'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {selectedVertical === 'drivers' && (
          <motion.div
            className="absolute top-0 left-0 w-full h-full opacity-5"
            animate={{
              background: [
                'radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, type: 'spring' }}
          className="text-center space-y-2 sm:space-y-3"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase text-black">
            Our Services
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Three verticals. One platform. Complete property care across Nigeria.
          </p>
        </motion.div>

        {/* Compact Vertical Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg"
        >
          {verticals.map((vertical) => {
            const Icon = vertical.icon;
            const isActive = selectedVertical === vertical.id;
            return (
              <motion.button
                key={vertical.id}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedVertical(vertical.id)}
                className={`relative flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border-2 font-bold uppercase tracking-wide text-xs sm:text-sm transition-all shadow-sm overflow-hidden group ${
                  isActive
                    ? vertical.id === 'cleaning'
                      ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-400 text-red-700 shadow-red-200/50'
                      : vertical.id === 'security'
                      ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-400 text-blue-700 shadow-blue-200/50'
                      : vertical.id === 'drivers'
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400 text-purple-700 shadow-purple-200/50'
                      : vertical.id === 'bundle'
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400 text-green-700 shadow-green-200/50'
                      : 'bg-gray-100 border-gray-300 text-gray-700'
                    : 'bg-white/80 backdrop-blur-sm border-gray-200 text-gray-600 hover:border-red-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${vertical.gradient} opacity-20`}
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={18} className="relative z-10 sm:w-5 sm:h-5" />
                <span className="relative z-10">{vertical.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Services Grid with Distinct Styles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          <AnimatePresence mode="wait">
            {services.map((service, index) => (
              <motion.div
                key={`${service.category}-${index}`}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.6,
                  type: 'spring',
                  stiffness: 100
                }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="h-full"
              >
                <ServiceCard service={service} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
});

ServicesSection.displayName = 'ServicesSection';

// How It Works Section
const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    {
      number: '1',
      title: 'Choose Service',
      description: 'Select cleaning, security, or both. Pick from our catalog or request a custom bundle.',
      icon: Calculator,
      gradient: 'from-red-500 to-orange-500'
    },
    {
      number: '2',
      title: 'Get Instant Pricing',
      description: 'See transparent price ranges immediately. No hidden fees. Final quote confirmed before work.',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      number: '3',
      title: 'Vetted Professional Assigned',
      description: 'Licensed, background-checked professionals matched to your area and requirements.',
      icon: ShieldCheck,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      number: '4',
      title: 'Service Delivered',
      description: 'Work completed to standard. Digital sign-off. Single invoice for all services.',
      icon: CheckCircle,
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <section ref={ref} className="relative px-4 sm:px-6 py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50 z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center space-y-2 sm:space-y-3"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase text-black">
            How It Works
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Simple, transparent, fast. Complete property care in one platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -12, scale: 1.03, rotate: [0, -2, 2, 0] }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-2xl blur-xl opacity-10 group-hover:opacity-20 transition-all`} />
              <div className="relative p-5 sm:p-6 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-md hover:shadow-lg transition-all h-full">
                <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} text-white font-black text-lg flex items-center justify-center shadow-lg`}>
                  {step.number}
                </div>
                
                <div className="mt-6 mb-4">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                    <step.icon size={24} className="sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-orange-600 transition-all">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-transparent transform -translate-y-1/2 z-0">
                    <motion.div
                      className={`w-full h-full bg-gradient-to-r ${step.gradient} origin-left`}
                      initial={{ scaleX: 0 }}
                      animate={isInView ? { scaleX: 1 } : {}}
                      transition={{ delay: index * 0.15 + 0.4, duration: 0.6 }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Competitive Advantage Section
const CompetitiveAdvantageSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const advantages = [
    {
      title: 'Single Control Panel',
      description: 'Manage cleaning and security from one platform. No fragmented vendors or manual coordination.',
      icon: Building2,
      gradient: 'from-red-500 to-orange-500'
    },
    {
      title: 'Licensed & Vetted',
      description: 'All security staff are licensed and certified. All cleaning staff are background-checked. All drivers are licensed and verified.',
      icon: ShieldCheck,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'On-Demand Flexibility',
      description: 'No long-term contracts required. Book services as needed. Perfect for events, moves, and emergencies.',
      icon: Zap,
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Bundle Savings',
      description: 'Save 15-25% when booking cleaning, security, and drivers together. Perfect for events, estates, and properties.',
      icon: Star,
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <section ref={ref} className="relative px-4 sm:px-6 py-12 sm:py-16 lg:py-20 bg-white z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center space-y-2 sm:space-y-3"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase text-black">
            Why Convivia24?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Infrastructure for safe spaces. Not just a services app.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6, type: 'spring' }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${advantage.gradient} rounded-2xl blur-xl opacity-10 group-hover:opacity-20 transition-all`} />
              <div className="relative p-6 sm:p-7 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-md hover:shadow-lg transition-all">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${advantage.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                  <advantage.icon size={24} className="sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black mb-2 sm:mb-3">{advantage.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">{advantage.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = ({ testimonials }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative px-4 sm:px-6 py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-gray-50/50 to-white z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase text-black">
            Client Testimonials
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6, type: 'spring' }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative p-5 sm:p-6 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-md hover:shadow-lg transition-all h-full">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={14} className="sm:w-4 sm:h-4 text-orange-500 fill-orange-500" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-4 italic text-xs sm:text-sm font-medium">"{testimonial.text}"</p>
                <div>
                  <p className="font-black text-black text-sm sm:text-base">{testimonial.name}</p>
                  <p className="text-xs text-gray-600 font-medium mt-1">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = ({ onRequestQuote, router }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative px-4 sm:px-6 py-12 sm:py-16 lg:py-20 z-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, type: 'spring' }}
        className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 p-8 sm:p-10 md:p-12 rounded-3xl bg-gradient-to-br from-red-50/80 via-white/90 to-blue-50/80 backdrop-blur-xl border-2 border-red-200/50 shadow-xl relative overflow-hidden"
      >
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-400/30 to-orange-400/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, 50, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -40, 0],
            y: [0, -40, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />

        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase text-black mb-4 sm:mb-5">
            Ready to Get Started?
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-2xl mx-auto font-medium leading-relaxed mb-6 sm:mb-8">
            Request cleaning, security, or drivers. Get instant pricing and confirmed quotes in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <motion.button
              whileHover={{ 
                scale: 1.03, 
                y: -2,
                boxShadow: '0 12px 24px rgba(220, 38, 38, 0.3)'
              }}
              whileTap={{ scale: 0.97 }}
              onClick={onRequestQuote}
              className="group relative px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl overflow-hidden shadow-lg text-sm sm:text-base"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <span className="relative flex items-center gap-2">
                Request Service Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
            
            <motion.button
              whileHover={{ 
                scale: 1.03,
                y: -2,
              }}
              whileTap={{ scale: 0.97 }}
              className="px-8 sm:px-10 py-3 sm:py-4 bg-white/90 backdrop-blur-sm border-2 border-gray-300 text-black font-bold rounded-xl hover:bg-gray-50 transition-all text-sm sm:text-base shadow-md flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              Call Us
            </motion.button>
          </div>

          {/* Dev Mode Test Navigation */}
          {process.env.NODE_ENV === 'development' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/test')}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all uppercase tracking-wide text-xs sm:text-sm shadow-lg"
              >
                <FlaskConical size={16} />
                <ShieldCheck size={14} />
                Test All Pages (Dev Mode)
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

// Footer
const Footer = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <footer ref={ref} className="relative px-4 sm:px-6 py-10 sm:py-12 border-t-2 border-gray-200 bg-white z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6"
      >
        <div className="flex flex-col items-center md:items-start gap-2">
          <p className="text-black text-sm font-black uppercase tracking-wider">
            &copy; 2024 Convivia 24. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 flex items-center gap-2">
            <ShieldCheck size={12} className="text-green-600" />
            <span>Vetted Professionals • Licensed Security • 24/7 Support</span>
          </p>
        </div>
        <div className="flex gap-6">
          {['Services', 'About', 'Contact', 'Privacy'].map((item, index) => (
            <motion.button
              key={item}
              whileHover={{ scale: 1.1, y: -2, color: '#dc2626' }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="text-gray-600 hover:text-red-600 transition-colors text-xs font-black uppercase tracking-wider"
            >
              {item}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </footer>
  );
};

export default LandingPage;
