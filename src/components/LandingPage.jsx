// src/components/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Store, Clock, Activity,
  Smartphone, Truck, CheckCircle, MapPin,
  Calendar, Star, Users
} from 'lucide-react';
import InvestorSection from './InvestorSection';
import EventsSection from './EventsSection';
import AppPreview from './AppPreview';

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showInvestorSection, setShowInvestorSection] = useState(false);
  const [showEventsSection, setShowEventsSection] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Raleway:wght@400;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setIsLoaded(true);
  }, []);

  const workflowSteps = [
    {
      icon: <Smartphone size={32} color="#DC2626" />,
      title: "Place Your Order",
      description: "Use our mobile app or web platform to easily place orders anytime, anywhere"
    },
    {
      icon: <Activity size={32} color="#DC2626" />,
      title: "Real-Time Confirmation",
      description: "Get instant confirmation and track your order status live"
    },
    {
      icon: <Truck size={32} color="#DC2626" />,
      title: "Swift Delivery",
      description: "Receive your order within 2 hours through our optimized delivery network"
    },
    {
      icon: <CheckCircle size={32} color="#DC2626" />,
      title: "Inventory Updates",
      description: "Your stock levels automatically update in our system"
    }
  ];

  const cities = [
    {
      name: "Lagos",
      areas: "Victoria Island • Lekki • Ikoyi • Surulere • Ikeja",
      venues: "75+ venues"
    },
    {
      name: "Port Harcourt",
      areas: "GRA • Trans Amadi • Old GRA • Diobu",
      venues: "40+ venues"
    }
  ];

  const features = [
    {
      icon: <Star size={24} />,
      title: "Smart Order Management",
      description: "Automated inventory tracking and one-click reordering"
    },
    {
      icon: <Calendar size={24} />,
      title: "Event Integration",
      description: "Plan stock levels based on upcoming events and peak times"
    },
    {
      icon: <Users size={24} />,
      title: "Customer Insights",
      description: "Understand consumption patterns and optimize inventory"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black overflow-hidden" style={{ fontFamily: 'Raleway, sans-serif' }}>
      {/* Existing Hero Section */}
      <div className="relative z-10 bg-gradient-to-b from-black to-red-900 text-white">
        <header className="container mx-auto px-4 py-16 flex flex-col items-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src="/convivia24logo.png" 
              alt="Convivia24 Logo" 
              className="w-48 mb-8"
            />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold text-center mb-6"
            style={{
              fontFamily: 'Playfair Display, serif',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Smart Beverage
            <br />
            <span className="bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
              Distribution Platform
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-center text-gray-300 max-w-3xl font-light mb-6"
          >
            Connecting Nigerian bars, clubs, and restaurants with beverage suppliers through 
            an intelligent digital platform that streamlines ordering, delivery, and inventory management.
          </motion.p>

          {/* Key Features */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-wrap justify-center gap-4 mb-12 text-sm text-gray-300"
          >
            <div className="flex items-center gap-2">
              <Clock size={16} /> 2-Hour Delivery
            </div>
            <div className="flex items-center gap-2">
              <Store size={16} /> 115+ Partner Venues
            </div>
            <div className="flex items-center gap-2">
              <Activity size={16} /> Real-time Tracking
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={() => setShowEventsSection(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
            >
              Explore Events
            </button>
            <button 
              onClick={() => setShowInvestorSection(true)}
              className="bg-transparent border-2 border-white hover:bg-white hover:text-red-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
            >
              Investor Overview
            </button>
          </motion.div>
        </header>
      </div>

      {/* Rotating Logo Section */}
      <div className="bg-white py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="container mx-auto px-4"
        >
          <div className="w-full max-w-md mx-auto">
            <motion.img
              src="/Logo2.png"
              alt="Convivia24 Platform"
              className="w-full h-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>
      </div>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            How Convivia24 Works
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Experience seamless beverage ordering and delivery in just a few steps
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-red-200" />
            
            {workflowSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.2 }}
                className="relative bg-white p-6 rounded-lg shadow-lg z-10"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-red-50 p-4 rounded-full mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <AppPreview />

      {/* Service Areas */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Currently Serving
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Starting with Nigeria's major business hubs, with plans for nationwide expansion
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {cities.map((city, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                className="bg-gray-900 p-8 rounded-lg"
              >
                <div className="flex items-center mb-4">
                  <MapPin size={24} color="#DC2626" />
                  <h3 className="text-2xl font-bold ml-2">{city.name}</h3>
                </div>
                <p className="text-gray-400 mb-2">{city.areas}</p>
                <p className="text-red-500 font-semibold">{city.venues}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16" style={{ fontFamily: 'Playfair Display, serif' }}>
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.2 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
              >
                <div className="bg-red-50 p-4 rounded-full inline-block mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Sections */}
      <InvestorSection 
        isOpen={showInvestorSection} 
        onClose={() => setShowInvestorSection(false)} 
      />
      <EventsSection 
        isOpen={showEventsSection} 
        onClose={() => setShowEventsSection(false)} 
      />
    </div>
  );
};

export default LandingPage;