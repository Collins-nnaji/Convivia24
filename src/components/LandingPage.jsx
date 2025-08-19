import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, PartyPopper,
  Heart, Crown, CheckCircle, MapPin,
  Calendar, Users, Wine, 
  GlassWater, Globe, Building, Gift, Sparkles, Utensils, Clock, Coffee, Mountain, MessageCircle, ChevronDown
} from 'lucide-react';
import InvestorSection from './InvestorSection';
import EventsSection from './EventsSection';
import AboutSection from './AboutSection';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandSpotlightSection from './BrandSpotlightSection';
import HomeEventsSection from './HomeEventsSection';

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showInvestorSection, setShowInvestorSection] = useState(false);
  const [showEventsSection, setShowEventsSection] = useState(false);
  const [showBrandSpotlight, setShowBrandSpotlight] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('nigeria');
  const [activeSlide, setActiveSlide] = useState(0);
  const [animateCount, setAnimateCount] = useState(false);
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
      icon: <Crown size={32} className="text-red-600" />,
      title: "Premium Venues",
      description: "Discover exceptional venues for all types of celebrations",
      features: ["Premium locations", "Customizable spaces", "Expert venue staff"]
    },
    {
      icon: <Utensils size={32} className="text-red-600" />,
      title: "Catering Services",
      description: "Work with top-rated caterers for your special event",
      features: ["Diverse cuisine options", "Custom menus", "Professional service"]
    },
    {
      icon: <Wine size={32} className="text-red-600" />,
      title: "Beverage Packages",
      description: "Find the perfect drinks package for your celebration",
      features: ["Premium selections", "Custom cocktails", "Professional bartenders"]
    },
    {
      icon: <PartyPopper size={32} className="text-red-600" />,
      title: "Event Planning",
      description: "All-in-one platform for seamless celebration planning",
      features: ["End-to-end planning", "Vendor coordination", "Day-of management"]
    }
  ];

  const serviceCategories = [
    {
      icon: <Users size={32} color="#DC2626" />,
      title: "Venue Booking",
      description: "Find and book the perfect venue for any occasion"
    },
    {
      icon: <Utensils size={32} color="#DC2626" />,
      title: "Catering Services",
      description: "Work with top-rated food and beverage providers"
    },
    {
      icon: <Clock size={32} color="#DC2626" />,
      title: "Planning Tools",
      description: "Powerful tools to organize every aspect of your celebration"
    },
    {
      icon: <Sparkles size={32} color="#DC2626" />,
      title: "Decoration Services",
      description: "Transform your venue with professional decoration services"
    },
    {
      icon: <Wine size={32} color="#DC2626" />,
      title: "Beverage Packages",
      description: "Custom drink packages for any type of celebration"
    },
    {
      icon: <Calendar size={32} color="#DC2626" />,
      title: "Event Management",
      description: "Professional coordination for flawless celebrations"
    }
  ];

  const communityGroups = [
    {
      name: "Lagos Coffee Enthusiasts",
      category: "Social & Lifestyle",
      members: "325 members",
      description: "A vibrant community of coffee lovers who meet weekly to share brewing techniques and meaningful conversations.",
      image: "https://images.unsplash.com/photo-1517231925375-bf2cb42917a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "London Photography Walks",
      category: "Photography",
      members: "187 members",
      description: "Photographers of all skill levels exploring London's hidden gems together and building lasting friendships.",
      image: "https://images.unsplash.com/photo-1452587925148-ce544e77262d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Abuja Hikers Network",
      category: "Outdoors",
      members: "312 members",
      description: "Adventure seekers connecting on weekly hikes, forming bonds through shared experiences in nature.",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  const cityData = {
    "Nigeria": [
    {
      name: "Lagos",
        members: "2,450+"
    },
    {
      name: "Port Harcourt",
        members: "1,250+"
    },
    {
      name: "Abuja",
        members: "1,850+"
    },
    {
      name: "Benin",
        members: "950+"
    }
    ],
    "United Kingdom": [
    {
      name: "London",
        members: "3,200+"
    },
    {
      name: "Manchester",
        members: "1,700+"
    },
    {
      name: "Birmingham",
        members: "1,450+"
    },
    {
      name: "Leeds",
        members: "1,100+"
    }
    ]
  };

  const features = [
    {
      icon: <Users size={24} />,
      title: "Smart Beverage Ordering",
      description: "Bulk orders for weddings, birthdays, and corporate events"
    },
    {
      icon: <Heart size={24} />,
      title: "Venue Suggestions & Booking",
      description: "Find and book venues by city, size, and budget"
    },
    {
      icon: <MessageCircle size={24} />,
      title: "Live Chatbot Concierge",
      description: "Pairings, quantities, and event Q&A in seconds"
    }
  ];

  const testimonials = [
    {
      name: "David Okonkwo",
      role: "Community Member",
      image: "https://randomuser.me/api/portraits/men/54.jpg",
      quote: "I moved to Lagos last year and didn't know anyone. Through this platform, I've met incredible people who share my love for jazz music. I now have a whole new social circle!"
    },
    {
      name: "Sarah Thompson",
      role: "Social Butterfly",
      image: "https://randomuser.me/api/portraits/women/45.jpg",
      quote: "The hotspot feature is brilliant! I discovered a local café where photographers gather every Tuesday. I've improved my skills and made amazing friends at the same time."
    },
    {
      name: "Chinedu Eze",
      role: "Working Professional",
      image: "https://randomuser.me/api/portraits/men/33.jpg",
      quote: "As someone who works remotely, I was feeling isolated. Now I have a community of other remote workers I meet with regularly. It's changed my social life completely!"
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
                <PartyPopper size={14} className="mr-1.5" /> 
                Celebrate Smarter, Celebrate Faster
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" 
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Drinks, Venues & Vibes – <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-300">Sorted in 24</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl"
            >
              Your all-in-one event and beverage partner: bulk beverage ordering, venue suggestions and booking, live chatbot concierge, and age-verified checkout with 24-hour delivery.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={() => navigate('/hotspots')}
                className="px-8 py-4 text-base md:text-lg bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
              >
                <Heart size={20} />
                Order Beverages
              </button>
              <button 
                onClick={() => navigate('/venues')}
                className="px-8 py-4 text-base md:text-lg bg-white/10 backdrop-blur-sm text-white border border-white/30 font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
              >
                <MapPin size={20} />
                Find Venues
              </button>
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
                <span className="font-bold text-xl text-red-400">10,000+</span> events powered by Convivia24
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
      
      {/* Featured Hotspots Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
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
                  Discover Venues & Partners
                </span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-6">
                Browse event venues by city, size, and budget. Book directly or connect with trusted partners.
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
                    <span className="text-sm">Lagos, Nigeria</span>
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
                <p className="text-gray-600 mb-4">A vibrant café where entrepreneurs and creatives connect over specialty coffee and ideas.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Coffee</span>
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Networking</span>
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Cozy</span>
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
                  <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">Premium</span>
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
                <p className="text-gray-600 mb-4">Luxurious rooftop venue perfect for professional networking and upscale social events.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Rooftop</span>
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Cocktails</span>
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Luxury</span>
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
                    <span className="text-sm">Port Harcourt, Nigeria</span>
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
                <p className="text-gray-600 mb-4">A cultural center where art enthusiasts and creative minds share passions and projects.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Art</span>
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Culture</span>
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Creative</span>
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
              onClick={() => navigate('/venues')}
            >
              Browse All Venues
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
                  <AnimatedCounter end={10000} /> +
                </div>
                <p className="text-white/80 text-lg">Orders Delivered</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="p-10 text-center text-white border-b md:border-b-0 md:border-r border-white/20"
              >
                <div className="text-5xl font-bold mb-2">
                  <AnimatedCounter end={2500} /> +
                </div>
                <p className="text-white/80 text-lg">Events Served</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-10 text-center text-white border-b lg:border-b-0 lg:border-r border-white/20"
              >
                <div className="text-5xl font-bold mb-2">
                  <AnimatedCounter end={800} /> +
                </div>
                <p className="text-white/80 text-lg">Verified Venues</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="p-10 text-center text-white"
              >
                <div className="text-5xl font-bold mb-2">
                  <AnimatedCounter end={350} /> +
                </div>
                <p className="text-white/80 text-lg">Planner Accounts</p>
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
                Why <span className="text-red-600">Convivia24</span> Works
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg mb-8">
                Bulk beverage ordering. 24-hour delivery. Age-verified checkout. Live chatbot for pairings, guest counts, and planning.
              </p>
              
              <div className="flex justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Bulk Beverage Ordering</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">24-Hour Turnaround</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Age-Verified Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Live Chatbot Concierge</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Add HomeEventsSection here */}
      <HomeEventsSection />
      
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
        
        {showEventsSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          >
            <EventsSection onClose={() => setShowEventsSection(false)} />
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
    </div>
  );
};

export default LandingPage;