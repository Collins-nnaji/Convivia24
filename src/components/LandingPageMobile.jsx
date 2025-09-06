import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Star, Search, Users, Gift, Coffee, MessageCircle, ChevronDown, Truck, Shield,
  BarChart3, Briefcase, Handshake, Package, DollarSign, TrendingUp, Gamepad2, Crown
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
      icon: <Search size={24} />,
      title: "Smart Event Discovery",
      description: "AI-powered recommendations for events based on your interests, mood, and location"
    },
    {
      icon: <Star size={24} />,
      title: "Exclusive Access",
      description: "Get early access to tickets, VIP experiences, and exclusive events before they sell out"
    },
    {
      icon: <Gift size={24} />,
      title: "Rewards & Perks",
      description: "Earn points for attending events and redeem exclusive perks at partner venues"
    },
    {
      icon: <Crown size={24} />,
      title: "Membership Tiers",
      description: "Free, Premium, and VIP memberships with escalating benefits and event access"
    }
  ];

  const testimonials = [
    {
      name: "Adaora Okafor",
      role: "Head of Corporate Affairs, Zenith Bank",
      image: "https://randomuser.me/api/portraits/women/54.jpg",
      quote: "Convivia24 cut our stockouts by 30%. Their premium wine selection and smart reordering keep our corporate events perfectly stocked!"
    },
    {
      name: "James Mitchell",
      role: "Event Manager, The Shard",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      quote: "The platform's real-time inventory tracking and automated reordering have revolutionized our event management process."
    },
    {
      name: "Sarah Chen",
      role: "Operations Director, Sky Lounge",
      image: "https://randomuser.me/api/portraits/women/28.jpg",
      quote: "Convivia24's predictive analytics help us anticipate demand and maintain perfect stock levels for every event."
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
            className="w-full h-full object-cover"
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
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-red-100 drop-shadow-md">Amazing Events</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-red-100 drop-shadow-md">Worldwide</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-gray-100 mb-8 px-4 drop-shadow-md"
          >
            Find the best events, concerts, festivals, and experiences near you or around the world. Get exclusive access, earn rewards, and never miss out on the events that matter to you.
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
              Experience the future of social events with our innovative platform
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

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-800">
        <div className="px-4">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-2 gap-4 p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center text-red-600"
              >
                <div className="text-3xl font-bold mb-2">
                  <AnimatedCounter end={500} /> +
                </div>
                <p className="text-red-600/80 text-sm">Events Discovered</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center text-red-600"
              >
                <div className="text-3xl font-bold mb-2">
                  <AnimatedCounter end={25000} /> +
                </div>
                <p className="text-red-600/80 text-sm">Rewards Earned</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center text-red-600"
              >
                <div className="text-3xl font-bold mb-2">
                  <AnimatedCounter end={150} /> +
                </div>
                <p className="text-red-600/80 text-sm">Partner Venues</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center text-red-600"
              >
                <div className="text-3xl font-bold mb-2">
                  <AnimatedCounter end={24} />
                </div>
                <p className="text-red-600/80 text-sm">Countries Active</p>
              </motion.div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                How <span className="text-yellow-300">Convivia24</span> Works
              </h2>
              <p className="text-red-100 max-w-2xl mx-auto mb-6">
                Discover & Explore – Find amazing events worldwide with AI-powered recommendations. Connect & Socialize – Join live hangout rooms, chat with attendees, and make new connections. Earn & Redeem – Get rewarded for your social activities and unlock exclusive perks at partner venues.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white text-sm">Smart Event Discovery</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white text-sm">Social Hangout Rooms</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white text-sm">Rewards & Perks</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white text-sm">Membership Tiers</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              What Our <span className="text-red-600">Partners</span> Say
            </h2>
            <p className="text-gray-600 text-lg">
              Trusted by venues and event organizers worldwide
            </p>
          </motion.div>

          <div className="space-y-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
              Join thousands of users who are already discovering amazing events, making new connections, and earning exclusive rewards.
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
