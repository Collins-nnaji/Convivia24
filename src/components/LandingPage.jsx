import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star,
  Heart, Crown, CheckCircle, MapPin,
  Users, Wine, Music,
  Building, Gift, Sparkles, Clock, Coffee, MessageCircle, ChevronDown, Truck, Shield,
  BarChart3, Briefcase, Handshake, Package, DollarSign
} from 'lucide-react';
import InvestorSection from './InvestorSection';
import AboutSection from './AboutSection';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BusinessRegisterModal from './BusinessRegisterModal';
import BrandSpotlightSection from './BrandSpotlightSection';

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showInvestorSection, setShowInvestorSection] = useState(false);
  const [showBrandSpotlight, setShowBrandSpotlight] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('nigeria');
  const [activeSlide, setActiveSlide] = useState(0);
  const [animateCount, setAnimateCount] = useState(false);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Raleway:wght@400;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setIsLoaded(true);
  }, []);

  // Animate statistics when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setAnimateCount(true);
        }
      },
      { threshold: 0.3 }
    );
    
    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }
    
    return () => {
      if (statsSection) {
        observer.unobserve(statsSection);
      }
    };
  }, []);
  
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  const celebrationTypes = [
    {
              icon: <Wine size={32} className="text-red-600" />,
      title: "Premium Selection",
      description: "Curated wine & spirits for discerning venues",
      features: ["Premium brands", "Bulk pricing", "Exclusive access"]
    },
    {
              icon: <Truck size={32} className="text-red-600" />,
      title: "Smart Logistics",
      description: "AI-powered delivery and inventory management",
      features: ["24-hour delivery", "Real-time tracking", "Smart reordering"]
    },
    {
              icon: <BarChart3 size={32} className="text-red-600" />,
      title: "Business Intelligence",
      description: "Data-driven insights for growth",
      features: ["Consumption trends", "Demand forecasting", "Revenue analytics"]
    },
    {
              icon: <Package size={32} className="text-red-600" />,
      title: "Private Label",
      description: "Custom branding for your business",
      features: ["Your branding", "Exclusive products", "Market differentiation"]
    }
  ];

  const serviceCategories = [
    {
      icon: <Wine size={32} color="#9333EA" />,
      title: "Wine & Spirits",
      description: "Premium selection with bulk pricing tiers"
    },
    {
      icon: <Truck size={32} color="#9333EA" />,
      title: "Smart Delivery",
      description: "Real-time tracking and 24-hour delivery"
    },
    {
      icon: <BarChart3 size={32} color="#9333EA" />,
      title: "AI Reordering",
      description: "Smart inventory management and forecasting"
    },
    {
      icon: <Package size={32} color="#9333EA" />,
      title: "Private Label",
      description: "Custom branding for venues and retailers"
    },
    {
      icon: <DollarSign size={32} color="#9333EA" />,
      title: "Flexible Payments",
      description: "Net-30/60 terms and multi-currency support"
    },
    {
      icon: <Users size={32} color="#9333EA" />,
      title: "Dedicated Support",
      description: "Account managers and 24/7 assistance"
    }
  ];

  const communityGroups = [
    {
              name: "Premium Bars Network",
      category: "Hospitality & Bars",
      members: "45 venues",
      description: "Premium bars and clubs sharing wine & spirits best practices and bulk ordering strategies.",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "London Fine Dining",
      category: "Restaurants & Hotels",
      members: "67 establishments",
      description: "Fine dining restaurants and luxury hotels collaborating on premium wine programs and inventory management.",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
              name: "Corporate Buyers Network",
      category: "Corporate Procurement",
      members: "89 businesses",
      description: "Corporate buyers and procurement teams sharing strategies for bulk wine & spirits purchasing.",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  const cityData = {
    "Nigeria": [
    {
              name: "Premium Hub",
        members: "150+"
    },
    {
              name: "Business Center",
        members: "45+"
    },
    {
              name: "Corporate Hub",
        members: "85+"
    },
    {
      name: "Benin",
        members: "35+"
    }
    ],
    "United Kingdom": [
    {
      name: "London",
        members: "120+"
    },
    {
      name: "Manchester",
        members: "70+"
    },
    {
      name: "Birmingham",
        members: "45+"
    },
    {
      name: "Leeds",
        members: "30+"
    }
    ]
  };

  const features = [
    {
      icon: <Wine size={24} />,
      title: "Premium Selection",
      description: "Curated wine & spirits with bulk pricing tiers"
    },
    {
      icon: <Music size={24} />,
      title: "Music Curation",
      description: "Mood-based playlists for every nightlife experience"
    },
    {
      icon: <Truck size={24} />,
      title: "Smart Delivery",
      description: "24-hour delivery with real-time tracking"
    },
    {
      icon: <BarChart3 size={24} />,
      title: "AI Reordering",
      description: "Smart inventory management and demand forecasting"
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
      name: "Emeka Chukwu",
      role: "Marketing Director, MTN Nigeria",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      quote: "We save hours every week by using the platform for reordering. The bulk pricing and 24-hour delivery are game-changers."
    },
    {
      name: "Fatima Abdullahi",
      role: "Executive Assistant to CEO, Dangote Group",
      image: "https://randomuser.me/api/portraits/women/33.jpg",
      quote: "Outstanding B2B service and attention to detail. The AI forecasting helps us optimize inventory perfectly."
    }
  ];

  const AnimatedCounter = ({ end, duration = 2 }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      if (!animateCount) return;
      
      let start = 0;
      const increment = end / (duration * 60);
      
      const timer = setInterval(() => {
        start += increment;
        setCount(Math.floor(start));
        
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        }
      }, 1000/60);
      
      return () => clearInterval(timer);
    }, [animateCount]);
    
    return <span>{count.toLocaleString()}</span>;
  };

  return (
    <div className="min-h-screen bg-white text-black overflow-hidden" style={{ fontFamily: 'Raleway, sans-serif' }}>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        {/* Background Video or Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-red-900/80 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3" 
            alt="Celebration Background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-3 py-1 px-3 bg-gradient-to-r from-red-500/30 to-red-700/30 rounded-full backdrop-blur-sm"
            >
              <span className="text-white/90 text-sm font-medium flex items-center">
                <Sparkles size={14} className="mr-1.5" /> 
                Discover, Connect, and Experience Nightlife Like Never Before
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" 
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-300">Exclusive Nightlife</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-300">Social Events</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl"
            >
              Connect with curated events, discover exclusive experiences, and unlock member-only benefits. Your gateway to the most vibrant nightlife and social experiences in your city.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex justify-center"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/shopping')}
                  className="px-10 py-4 text-base md:text-lg bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
                >
                  <Sparkles size={20} />
                  Explore Events
                </button>
                <button 
                  onClick={() => setIsBusinessModalOpen(true)}
                  className="px-10 py-4 text-base md:text-lg bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/30 flex items-center gap-2"
                >
                  <Building size={20} />
                  Partner With Us
                </button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="flex items-center gap-6 mt-12 bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/10"
            >
              <div className="flex -space-x-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-lg">
                    <img 
                      src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 20}.jpg`}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-white text-sm md:text-base">
                <span className="font-bold text-xl text-red-400">500+</span> exclusive events and experiences on Convivia24
              </div>
            </motion.div>
          </div>
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
      

      {/* Featured Events Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto w-16 h-1 bg-gradient-to-r from-red-500 to-red-700 mb-6 rounded-full"></div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800">
                  Featured Events This Week
                </span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-6">
                Discover this week's most popular events and trending nightlife experiences with exclusive access and special moments.
              </p>
            </motion.div>
            <div className="flex justify-center gap-2 mt-6">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="w-2 h-2 rounded-full bg-red-300"></span>
              <span className="w-2 h-2 rounded-full bg-red-300"></span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Featured Hotspot 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-gray-100"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60" 
                  alt="Brew Café Social Hub" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full">Popular</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white mb-1">
                    <MapPin size={16} />
                    <span className="text-sm">Premium Location</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Brew Café Social Hub</h3>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-gray-300 fill-current" />
                    <span className="text-sm text-gray-500 ml-1">4.2</span>
                  </div>
                  <span className="text-xs text-gray-500">42 active members</span>
                </div>
                <p className="text-gray-600 mb-4">A premium nightclub featuring live DJs, craft cocktails, and exclusive VIP experiences every weekend.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Nightclub</span>
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Live Music</span>
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">VIP</span>
                </div>
                <button className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 transition-colors group-hover:font-semibold">
                  View Venue <ChevronDown className="h-4 w-4 -rotate-90" />
                </button>
              </div>
            </motion.div>

            {/* Featured Hotspot 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-gray-100"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" 
                  alt="Skyline Lounge" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full">Premium</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white mb-1">
                    <MapPin size={16} />
                    <span className="text-sm">London, UK</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Skyline Lounge</h3>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-500 ml-1">4.9</span>
                  </div>
                  <span className="text-xs text-gray-500">67 active members</span>
                </div>
                <p className="text-gray-600 mb-4">Luxurious rooftop lounge with panoramic city views, premium cocktails, and exclusive social events.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Rooftop</span>
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Cocktails</span>
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Exclusive</span>
                </div>
                <button className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 transition-colors group-hover:font-semibold">
                  View Venue <ChevronDown className="h-4 w-4 -rotate-90" />
                </button>
              </div>
            </motion.div>

            {/* Featured Hotspot 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-gray-100"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1528495612343-9ca9f4a4de28?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" 
                  alt="Cultural Haven" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">New</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white mb-1">
                    <MapPin size={16} />
                    <span className="text-sm">Premium Location</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Cultural Haven</h3>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-gray-300 fill-current" />
                    <span className="text-sm text-gray-500 ml-1">4.3</span>
                  </div>
                  <span className="text-xs text-gray-500">35 active members</span>
                </div>
                <p className="text-gray-600 mb-4">An underground speakeasy featuring live jazz, craft cocktails, and intimate social gatherings.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Speakeasy</span>
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Jazz</span>
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Intimate</span>
                </div>
                <button className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 transition-colors group-hover:font-semibold">
                  View Venue <ChevronDown className="h-4 w-4 -rotate-90" />
                </button>
              </div>
            </motion.div>
          </div>
          
          <div className="text-center mt-12">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-red-600 border border-red-600 rounded-full font-medium hover:bg-red-50 transition-colors"
              onClick={() => navigate('/events')}
            >
              Browse All Events
            </motion.button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats-section" className="py-20 bg-white">
        <div className="container mx-auto px-4">
                        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-10 text-center text-white border-b md:border-b-0 md:border-r border-white/20"
              >
                <div className="text-5xl font-bold mb-2">
                  <AnimatedCounter end={500} /> +
                </div>
                <p className="text-white/80 text-lg">Partner Events</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="p-10 text-center text-white border-b md:border-b-0 md:border-r border-white/20"
              >
                <div className="text-5xl font-bold mb-2">
                  <AnimatedCounter end={25000} /> +
                </div>
                <p className="text-white/80 text-lg">Events Hosted</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-10 text-center text-white border-b lg:border-b-0 lg:border-r border-white/20"
              >
                <div className="text-5xl font-bold mb-2">
                  <AnimatedCounter end={150} /> +
                </div>
                <p className="text-white/80 text-lg">Active Members</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="p-10 text-center text-white"
              >
                <div className="text-5xl font-bold mb-2">
                  <AnimatedCounter end={24} />
                </div>
                <p className="text-white/80 text-lg">Cities Covered</p>
              </motion.div>
            </div>
          </div>
          
          <div className="mt-16 mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                How <span className="text-red-600">Convivia24</span> Works
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg mb-8">
                Discover & Connect – Find exclusive events and experiences tailored to your preferences. Book & Experience – Reserve your spot at the hottest nightlife events and social gatherings. Enjoy & Share – Create unforgettable memories and connect with like-minded people.
              </p>
              
              <div className="flex justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Exclusive Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Curated Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Member Benefits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Social Connection</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Service Promises Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto w-16 h-1 bg-gradient-to-r from-red-500 to-red-700 mb-6 rounded-full"></div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800">
                  Our Service Promises
                </span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-6">
                We guarantee exceptional experiences and exclusive access to the best nightlife and social events in your city.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-red-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <Clock className="text-red-600" size={24} />
                <h3 className="font-semibold text-gray-900">24/7 Access</h3>
              </div>
              <p className="text-gray-600 text-sm">Round-the-clock access to exclusive events and experiences!</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-blue-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <Crown className="text-blue-600" size={24} />
                <h3 className="font-semibold text-gray-900">VIP Access</h3>
              </div>
              <p className="text-gray-600 text-sm">Exclusive member benefits and priority access to premium events.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-green-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <Shield className="text-green-600" size={24} />
                <h3 className="font-semibold text-gray-900">Safe & Secure</h3>
              </div>
              <p className="text-gray-600 text-sm">Verified events and secure booking for all your nightlife experiences.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modal Components */}
      <AnimatePresence>
        {showInvestorSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          >
            <InvestorSection onClose={() => setShowInvestorSection(false)} />
          </motion.div>
        )}
        
        {showBrandSpotlight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          >
            <BrandSpotlightSection onClose={() => setShowBrandSpotlight(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Business Register Modal */}
      <BusinessRegisterModal 
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
      />
    </div>
  );
};

export default LandingPage;