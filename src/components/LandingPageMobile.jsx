import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Star, Search, Users, Gift, Coffee, MessageCircle, ChevronDown, Truck, Shield,
  BarChart3, Briefcase, Handshake, Package, DollarSign, TrendingUp, Gamepad2, Crown,
  Sparkles, Heart
} from 'lucide-react';
import BusinessRegisterModal from './BusinessRegisterModal';
import BrandSpotlightSection from './BrandSpotlightSection';

const LandingPageMobile = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: <Users size={24} />,
      title: "Safe Social Connections",
      description: "Connect with like-minded people at events you're attending. Never feel socially awkward again with our smart matching system."
    },
    {
      icon: <Search size={24} />,
      title: "Smart Event Discovery",
      description: "AI-powered recommendations for events based on your interests, mood, and location preferences"
    },
    {
      icon: <MessageCircle size={24} />,
      title: "Icebreaker Prompts",
      description: "Pre-written conversation starters help you break the ice and start meaningful conversations naturally"
    },
    {
      icon: <Shield size={24} />,
      title: "Verified & Secure",
      description: "All users are verified event attendees with built-in safety features and easy reporting systems"
    }
  ];


  const AnimatedCounter = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let startTime;
      const animateCount = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        }
      };
      requestAnimationFrame(animateCount);
    }, [end, duration]);

    return <span>{count.toLocaleString()}</span>;
  };

  return (
    <div className="min-h-screen bg-white text-black overflow-hidden" style={{ fontFamily: 'Raleway, sans-serif' }}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3" 
            alt="Background" 
            className="w-full h-full object-cover blur-sm"
          />
        </div>
        
        <div className="px-4 relative z-20 text-center w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4 py-2 px-4 bg-gradient-to-r from-red-500/30 to-red-700/30 rounded-full backdrop-blur-sm"
          >
            <span className="text-white text-sm font-medium flex items-center">
              <Star size={16} className="mr-2" /> 
              Your Gateway to Amazing Events Worldwide
            </span>
          </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight px-4 drop-shadow-lg"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-red-100 drop-shadow-md">Social Life</span> with <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-red-100 drop-shadow-md">Convivia24</span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg text-gray-100 mb-8 px-4 drop-shadow-md"
                  >
                    Never feel socially awkward again. Discover amazing events, connect with like-minded people, and build meaningful relationships that last beyond the night. Your social transformation starts here.
                  </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col gap-4 px-4"
          >
            <button 
              onClick={() => navigate('/discover')}
              className="w-full px-8 py-4 text-base bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Star size={20} />
              Discover Events
            </button>
            <button 
              onClick={() => setIsBusinessModalOpen(true)}
              className="w-full px-8 py-4 text-base bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/30 flex items-center justify-center gap-2"
            >
              <Briefcase size={20} />
              Partner With Us
            </button>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col items-center"
          >
            <span className="text-white text-sm mb-2">Scroll Down</span>
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-2 h-2 bg-white rounded-full mt-2"
              ></motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Why Choose <span className="text-red-600">Convivia24</span>?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Transform your social life with safe connections, smart event discovery, and meaningful relationships.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 text-red-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Feature - Safe Social Connections */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles size={16} />
              Coming Soon
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Safe Social <span className="text-red-600">Connections</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Never feel socially awkward at events again. Connect with like-minded people safely and naturally.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 font-bold text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Event Check-in</h4>
                        <p className="text-gray-600 text-sm">Check into events you're attending to join the safe social space</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Smart Matching</h4>
                        <p className="text-gray-600 text-sm">AI matches you with people who share similar interests and vibes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 font-bold text-sm">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Safe Connection</h4>
                        <p className="text-gray-600 text-sm">Connect through our secure platform with built-in safety features</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Safety Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-red-600" />
                      <span className="text-gray-700 text-sm">Verified event attendees only</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-red-600" />
                      <span className="text-gray-700 text-sm">Anonymous until mutual interest</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-red-600" />
                      <span className="text-gray-700 text-sm">Easy block and report system</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-red-600" />
                      <span className="text-gray-700 text-sm">Event-based connections only</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-white rounded-lg border border-red-200">
                    <p className="text-sm text-gray-600 italic">
                      "Finally, a way to meet people at events without the awkward small talk. 
                      Convivia24 helped me connect with amazing people who actually share my interests!"
                    </p>
                    <p className="text-xs text-gray-500 mt-2">- Sarah M., Beta Tester</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Get Early Access</p>
                    <p className="text-xs text-gray-600">Be the first to experience safe social connections</p>
                  </div>
                  <button 
                    onClick={() => navigate('/event-companions')}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Convivia Works Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-800">
        <div className="px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              How <span className="text-red-200">Convivia24</span> Works
            </h2>
            <p className="text-red-100 max-w-2xl mx-auto mb-8 text-lg">
              Transform your social life in three simple steps. Discover amazing events, connect with like-minded people, and build meaningful relationships that last.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">1. Discover Events</h3>
                <p className="text-red-100 text-sm">
                  Find amazing events near you with AI-powered recommendations based on your interests and mood.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">2. Connect Safely</h3>
                <p className="text-red-100 text-sm">
                  Get matched with verified attendees who share your interests. Chat with icebreaker prompts to start conversations naturally.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">3. Build Relationships</h3>
                <p className="text-red-100 text-sm">
                  Meet up at events and build meaningful connections that extend beyond the night. Never feel socially awkward again.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-800">
        <div className="px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ready to Transform Your Social Life?
            </h2>
            <p className="text-red-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already building meaningful connections, discovering amazing events, and never feeling socially awkward again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/discover')}
                className="px-8 py-4 bg-white text-red-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Star size={20} />
                Start Exploring
              </button>
              <button 
                onClick={() => setIsBusinessModalOpen(true)}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/30 flex items-center justify-center gap-2"
              >
                <Briefcase size={20} />
                Partner With Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Business Modal */}
      <BusinessRegisterModal 
        isOpen={isBusinessModalOpen} 
        onClose={() => setIsBusinessModalOpen(false)} 
      />
    </div>
  );
};

export default LandingPageMobile;
