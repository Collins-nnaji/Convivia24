import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add Google Fonts to document head
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Raleway:wght@400;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden" style={{ fontFamily: 'Raleway, sans-serif' }}>
      {/* Background SVG with overlay */}
      <div className="fixed inset-0 opacity-50">
        <img 
          src="/conviviabackground.svg" 
          alt="Background collage" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Hero section */}
        <header className="container mx-auto px-4 py-16 flex flex-col items-center">
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

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold text-center mb-6"
            style={{
              fontFamily: 'Playfair Display, serif',
              background: 'linear-gradient(135deg, #FF0000 0%, #FFFFFF 50%, #000000 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Transforming Nigeria's
            <br />
            Beverage Distribution
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-center text-gray-300 max-w-3xl font-light"
          >
            Empowering bars, clubs, and restaurants with smart distribution, 
            real-time analytics, and seamless supply chain solutions.
          </motion.p>
        </header>

        {/* Featured image section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="container mx-auto px-4 py-16"
        >
          <div className="relative w-full max-w-4xl mx-auto">
            <motion.img
              src="/Logo2.png"
              alt="Convivia24 Platform"
              className="w-full rounded-lg shadow-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>

        {/* Features section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Distribution",
                description: "Centralized platform for seamless ordering, tracking, and inventory management"
              },
              {
                title: "Data Analytics",
                description: "Leverage real-time data for predictive insights and optimal stock management"
              },
              {
                title: "Brand Partnerships",
                description: "Access to diverse, quality products through strategic brand collaborations"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 1.2 + index * 0.2 }}
                className="bg-gradient-to-br from-red-900/30 via-black/50 to-gray-900/30 p-6 rounded-lg backdrop-blur-sm"
              >
                <h3 className="text-xl font-bold mb-4" style={{
                  background: 'linear-gradient(to right, #FF0000, #FFFFFF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;