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

  // Bundle Packages (Nigeria-focused pricing)
  const bundleServices = [
    {
      name: 'Clean + Secure Event Package',
      category: 'bundle',
      type: 'event',
      description: 'Complete event solution: venue cleaning + security guards. Perfect for weddings, corporate events, and parties. Save 15%.',
      base_price: 100000,
      pricing_model: 'event',
      duration_hours: 8.0,
      price_range: { min: 100000, max: 350000 }
    }
  ];

  const allServices = [...cleaningServices, ...securityServices, ...bundleServices];

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
    : bundleServices;

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden font-sans selection:bg-red-600 selection:text-white relative">
      {/* Hero Section with Modern Glassmorphism */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 lg:py-32 z-10 overflow-hidden"
      >
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            animate={{
              background: [
                'radial-gradient(circle at 20% 30%, rgba(239, 68, 68, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 30%, rgba(239, 68, 68, 0.15) 0%, transparent 50%)',
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Floating Orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-red-200/40 to-orange-200/40 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -80, 0],
              y: [0, -60, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </div>

        <motion.div 
          style={{ y: heroY }}
          className="max-w-6xl mx-auto w-full text-center space-y-10 relative z-10"
        >
          {/* Logo with Glow Effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
            animate={isLoaded ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, type: 'spring', stiffness: 150 }}
            className="flex justify-center mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-30 animate-pulse" />
              <motion.img 
                src="/Logo2.png" 
                alt="Convivia 24 Logo" 
                className="w-24 h-24 lg:w-32 lg:h-32 relative z-10 drop-shadow-2xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </motion.div>

          {/* Modern Badges with Glassmorphism */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            className="flex flex-wrap items-center justify-center gap-3 mb-8"
          >
            {[
              { icon: Clock, text: '24/7 Service', color: 'red', bg: 'bg-red-500/10', border: 'border-red-500/20', textColor: 'text-red-700' },
              { icon: ShieldCheck, text: 'Vetted Professionals', color: 'green', bg: 'bg-green-500/10', border: 'border-green-500/20', textColor: 'text-green-700' },
              { icon: Lock, text: 'Licensed & Certified', color: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/20', textColor: 'text-blue-700' },
            ].map((badge, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.08, y: -3 }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl ${badge.bg} backdrop-blur-md border ${badge.border} shadow-lg`}
              >
                <badge.icon size={16} className={badge.textColor} />
                <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${badge.textColor}`}>{badge.text}</span>
              </motion.div>
            ))}
            
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.08, y: -3 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-500/10 backdrop-blur-md border border-gray-500/20 shadow-lg"
            >
              <MapPin size={16} className="text-gray-700" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentLocation}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.4 }}
                  className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-700"
                >
                  {locations[currentLocation]}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Main Heading with Gradient Text */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
            className="text-6xl md:text-7xl lg:text-9xl font-black tracking-tighter text-black leading-[0.9] mb-6"
          >
            <span className="block">CONVIVIA</span>
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
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-500 italic tracking-tight mb-6"
          >
            Clean. Secure. On demand.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium mb-12"
          >
            On-demand platform for cleanliness, safety, and property care—connecting homes, businesses, and communities across Nigeria with trusted cleaning and security professionals in minutes.
          </motion.p>

          {/* Modern CTA Buttons with Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7, type: 'spring', stiffness: 100 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-6 relative z-20"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                y: -4,
                boxShadow: '0 20px 40px rgba(220, 38, 38, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRequestQuote}
              className="group relative px-12 py-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-black rounded-2xl overflow-hidden shadow-2xl z-10 backdrop-blur-sm"
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
              <span className="relative uppercase tracking-[0.15em] flex items-center gap-3 text-base">
                Request Service
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight size={22} />
                </motion.div>
              </span>
            </motion.button>

            <motion.button
              whileHover={{ 
                scale: 1.05,
                borderColor: '#dc2626',
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth/login')}
              className="px-12 py-6 bg-white/80 backdrop-blur-md border-2 border-gray-300 text-black font-black rounded-2xl transition-all text-base uppercase tracking-[0.15em] shadow-xl relative overflow-hidden group z-10"
            >
              <span className="relative z-10">Client Login</span>
              <motion.div
                className="absolute inset-0 bg-red-50/50"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            </motion.button>

            {/* Work With Us Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.75 }}
              whileHover={{ 
                scale: 1.05,
                y: -3,
                boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth/register/staff')}
              className="px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black rounded-2xl transition-all text-sm uppercase tracking-[0.15em] shadow-xl relative overflow-hidden group z-10 flex items-center gap-2 backdrop-blur-sm"
            >
              <Users size={18} />
              <span className="relative z-10">Join Our Team</span>
            </motion.button>

            {/* Dev Mode Test Pages Button */}
            {process.env.NODE_ENV === 'development' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.8 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -3,
                  boxShadow: '0 10px 25px rgba(249, 115, 22, 0.3)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/test')}
                className="px-8 py-6 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black rounded-2xl transition-all text-xs uppercase tracking-[0.15em] shadow-xl relative overflow-hidden group z-10 flex items-center gap-2 backdrop-blur-sm"
              >
                <ShieldCheck size={18} />
                <span className="relative z-10">Test Pages</span>
              </motion.button>
            )}
          </motion.div>

          {/* Scroll Indicator with Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[10px] font-bold uppercase tracking-widest text-gray-500"
            >
              Scroll
            </motion.span>
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown size={24} className="text-red-600 drop-shadow-lg" />
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
    <section ref={ref} className="relative px-6 py-20 lg:py-28 bg-gradient-to-b from-white via-gray-50/50 to-white z-10 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ 
                delay: index * 0.1,
                type: 'spring',
                stiffness: 120
              }}
              whileHover={{ scale: 1.08, y: -8, rotate: [0, -2, 2, 0] }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white mb-4 mx-auto shadow-lg"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon size={28} />
                </motion.div>
                <div className="text-4xl md:text-5xl font-black text-black mb-2 text-center">{stat.value}</div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-600 text-center">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Services Section with Distinct Visual Styles
const ServicesSection = React.forwardRef(({ cleaningServices, securityServices, bundleServices, selectedVertical, setSelectedVertical, isInView }, ref) => {
  const verticals = [
    { id: 'all', label: 'All Services', icon: Building2, color: 'gray', gradient: 'from-gray-500 to-gray-600' },
    { id: 'cleaning', label: 'Cleaning & Sanitation', icon: Sparkles, color: 'red', gradient: 'from-red-500 via-orange-500 to-amber-500' },
    { id: 'security', label: 'Security Services', icon: Lock, color: 'blue', gradient: 'from-blue-500 via-indigo-500 to-purple-500' },
    { id: 'bundle', label: 'Bundles', icon: Star, color: 'green', gradient: 'from-green-500 via-emerald-500 to-teal-500' },
  ];

  const services = selectedVertical === 'all' 
    ? [...cleaningServices, ...securityServices, ...bundleServices]
    : selectedVertical === 'cleaning'
    ? cleaningServices
    : selectedVertical === 'security'
    ? securityServices
    : bundleServices;

  return (
    <section ref={ref} className="relative px-6 py-24 lg:py-32 z-10 bg-white overflow-hidden">
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
      </div>

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, type: 'spring' }}
          className="text-center space-y-4"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase italic text-black">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Two verticals. One platform. Complete property care across Nigeria.
          </p>
        </motion.div>

        {/* Modern Vertical Selector with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 p-6 rounded-3xl bg-white/60 backdrop-blur-xl border border-gray-200/50 shadow-2xl"
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
                className={`relative flex items-center gap-3 px-8 py-4 rounded-2xl border-2 font-black uppercase tracking-wider text-sm transition-all shadow-lg overflow-hidden group ${
                  isActive
                    ? vertical.id === 'cleaning'
                      ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-400 text-red-700 shadow-red-200/50'
                      : vertical.id === 'security'
                      ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-400 text-blue-700 shadow-blue-200/50'
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
                <Icon size={22} className="relative z-10" />
                <span className="relative z-10">{vertical.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Services Grid with Distinct Styles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
    <section ref={ref} className="relative px-6 py-24 lg:py-32 bg-gradient-to-b from-gray-50 via-white to-gray-50 z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase italic text-black">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Simple, transparent, fast. Complete property care in one platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -12, scale: 1.03, rotate: [0, -2, 2, 0] }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-all`} />
              <div className="relative p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all h-full">
                <div className={`absolute -top-6 -left-6 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} text-white font-black text-2xl flex items-center justify-center shadow-2xl`}>
                  {step.number}
                </div>
                
                <div className="mt-8 mb-6">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <step.icon size={36} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-black mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-orange-600 transition-all">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
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
      description: 'All security staff are licensed and certified. All cleaning staff are background-checked and certified.',
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
      description: 'Save 15-20% when booking cleaning and security together. Perfect for events, estates, and properties.',
      icon: Star,
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <section ref={ref} className="relative px-6 py-24 lg:py-32 bg-white z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase italic text-black">
            Why Convivia24?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Infrastructure for safe spaces. Not just a services app.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6, type: 'spring' }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${advantage.gradient} rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-all`} />
              <div className="relative p-10 rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${advantage.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                  <advantage.icon size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-black mb-4">{advantage.title}</h3>
                <p className="text-base text-gray-600 leading-relaxed font-medium">{advantage.description}</p>
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
    <section ref={ref} className="relative px-6 py-24 lg:py-32 bg-gradient-to-b from-white via-gray-50/50 to-white z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase italic text-black">
            Client Testimonials
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6, type: 'spring' }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all h-full">
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} className="text-orange-500 fill-orange-500" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic text-base font-medium">"{testimonial.text}"</p>
                <div>
                  <p className="font-black text-black text-lg">{testimonial.name}</p>
                  <p className="text-sm text-gray-600 font-medium mt-1">{testimonial.role}</p>
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
    <section ref={ref} className="relative px-6 py-24 lg:py-32 z-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, type: 'spring' }}
        className="max-w-5xl mx-auto text-center space-y-12 p-12 md:p-16 rounded-[4rem] bg-gradient-to-br from-red-50/80 via-white/90 to-blue-50/80 backdrop-blur-2xl border-2 border-red-200/50 shadow-2xl relative overflow-hidden"
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
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase italic text-black mb-6">
            Ready to Get Started?
          </h2>
          
          <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
            Request cleaning, security, or both. Get instant pricing and confirmed quotes in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <motion.button
              whileHover={{ 
                scale: 1.06, 
                y: -4,
                boxShadow: '0 25px 50px rgba(220, 38, 38, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onRequestQuote}
              className="group relative px-14 py-7 bg-gradient-to-r from-red-600 to-red-700 text-white font-black rounded-3xl overflow-hidden shadow-2xl text-lg uppercase tracking-[0.15em]"
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
              <span className="relative flex items-center gap-3">
                Request Service Now
                <motion.div
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight size={24} />
                </motion.div>
              </span>
            </motion.button>
            
            <motion.button
              whileHover={{ 
                scale: 1.05,
                borderColor: '#dc2626',
                backgroundColor: 'rgba(255, 255, 255, 0.95)'
              }}
              whileTap={{ scale: 0.95 }}
              className="px-14 py-7 bg-white/90 backdrop-blur-md border-2 border-gray-300 text-black font-black rounded-3xl hover:bg-gray-50 transition-all text-lg uppercase tracking-[0.15em] shadow-xl flex items-center justify-center gap-3"
            >
              <Phone size={22} />
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
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/test')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black rounded-2xl hover:from-orange-600 hover:to-amber-700 transition-all uppercase tracking-wider text-sm shadow-xl"
              >
                <FlaskConical size={18} />
                <ShieldCheck size={16} />
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
    <footer ref={ref} className="relative px-6 py-16 border-t-2 border-gray-200 bg-white z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6"
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
