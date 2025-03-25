import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, PartyPopper,
  Heart, Crown, CheckCircle, MapPin,
  Calendar, Users, Wine, 
  GlassWater, Globe, Building, Gift, Sparkles, Utensils, Clock, Coffee, Mountain, MessageCircle
} from 'lucide-react';
import InvestorSection from './InvestorSection';
import EventsSection from './EventsSection';
import AboutSection from './AboutSection';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandSpotlightSection from './BrandSpotlightSection';

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
      description: "Connect with top-rated caterers for your special event",
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
      description: "Connect with top-rated food and beverage providers"
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
      title: "Connect with Like-Minded People",
      description: "Find people who share your interests, hobbies, and passions within your local area"
    },
    {
      icon: <Heart size={24} />,
      title: "Discover Popular Hotspots",
      description: "Explore favorite local hangouts where community members meet and socialize"
    },
    {
      icon: <MessageCircle size={24} />,
      title: "Meaningful Conversations",
      description: "Create connections that go beyond digital interaction through real-world meetups"
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
          <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6" 
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Connecting People Through Celebrations
          </motion.h1>

          <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 mb-8"
            >
              Your all-in-one platform for meeting and connecting with people. Find like-minded individuals, chat with them, and meet up at popular hotspots for meaningful conversations.
          </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={() => navigate('/experiences')}
                className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-900 text-white font-semibold rounded-lg hover:from-red-800 hover:to-red-950 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Connect with People
              </button>
              <button 
                onClick={() => navigate('/hotspots')}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/30 font-semibold rounded-lg hover:bg-white/20 transition-all duration-300"
              >
                Explore Hotspots
              </button>
            </motion.div>
            
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="flex items-center gap-6 mt-12"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                    <img 
                      src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 20}.jpg`}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-white/90 text-sm">
                Joined by <span className="font-semibold">10,000+</span> people looking to connect
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
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800">
                  Discover Vibrant Hotspots
                </span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Explore carefully curated venues and communities where meaningful connections happen naturally.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Featured Hotspot 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-500"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60" 
                  alt="Brew Café Social Hub" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white mb-1">
                    <MapPin size={16} />
                    <span className="text-sm">Lagos, Nigeria</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Brew Café Social Hub</h3>
                </div>
                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
                  Top Rated
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">4.8 (120 reviews)</span>
                </div>
                <p className="text-gray-600 mb-4">
                  A vibrant café where book lovers, digital nomads, and coffee enthusiasts meet to connect and share ideas daily.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full font-medium">Active Community</span>
                  <span className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full font-medium">Quiet Spaces</span>
                  <span className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full font-medium">Wi-Fi</span>
                </div>
                <Link to="/hotspots" className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 transition-colors flex items-center justify-center gap-2 shadow-md">
                  <Globe size={18} />
                  Explore This Hotspot
                </Link>
              </div>
            </motion.div>
            
            {/* Featured Hotspot 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-500"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1513278974582-3e1b4a4fa5e5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                  alt="Highland Trekkers Club" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white mb-1">
                    <MapPin size={16} />
                    <span className="text-sm">Abuja, Nigeria</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Highland Trekkers Club</h3>
                </div>
                <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
                  Trending
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} size={16} className="text-yellow-400 fill-yellow-400" />
                    ))}
                    <Star size={16} className="text-yellow-400" />
                  </div>
                  <span className="text-sm text-gray-500">4.5 (86 reviews)</span>
                </div>
                <p className="text-gray-600 mb-4">
                  A community for outdoor enthusiasts to connect, plan adventures, and meet like-minded nature lovers weekly.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">Weekly Meetups</span>
                  <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">Outdoor</span>
                  <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">Active</span>
                </div>
                <Link to="/hotspots" className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 transition-colors flex items-center justify-center gap-2 shadow-md">
                  <Globe size={18} />
                  Explore This Hotspot
                </Link>
              </div>
            </motion.div>
            
            {/* Featured Community */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-500"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1556035511-3168381ea4d4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80" 
                  alt="Lagos Book Club" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white mb-1">
                    <Users size={16} />
                    <span className="text-sm">Active Community</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Lagos Book Club</h3>
                </div>
                <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
                  Featured Group
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">4.9 (148 reviews)</span>
                </div>
                <p className="text-gray-600 mb-4">
                  A thriving community of book lovers who meet monthly for discussions and build lasting friendships over literature.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">240+ Members</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">Monthly Meetings</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">All Welcome</span>
                </div>
                <Link to="/experiences" className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 transition-colors flex items-center justify-center gap-2 shadow-md">
                  <Users size={18} />
                  Join Community
                </Link>
              </div>
            </motion.div>
          </div>
          
          <div className="text-center mt-16">
            <Link to="/hotspots">
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 font-semibold transition-colors shadow-md inline-flex items-center gap-2"
              >
                Explore All Hotspots & Communities
                <Globe size={20} />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="py-24 bg-gradient-to-b from-red-900/5 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-500/5 rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-red-500/5 rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800">
                Our Growing Community
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Join thousands of people who are making meaningful connections across Nigeria and the UK
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-red-600 mb-2 flex items-center justify-center">
                <AnimatedCounter end={15000} />+
              </h3>
              <p className="text-gray-500 text-center">Community Members</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-red-600 mb-2 flex items-center justify-center">
                <AnimatedCounter end={750} />+
              </h3>
              <p className="text-gray-500 text-center">Events Monthly</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-red-600 mb-2 flex items-center justify-center">
                <AnimatedCounter end={98} />%
              </h3>
              <p className="text-gray-500 text-center">Client Satisfaction</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-red-600 mb-2 flex items-center justify-center">
                <AnimatedCounter end={25} />+
              </h3>
              <p className="text-gray-500 text-center">Cities Covered</p>
            </motion.div>
          </div>
          
          <div className="mt-16 text-center">
            <Link to="/conviviapass">
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Sparkles size={20} className="text-yellow-300" />
                Join ConviviaPass for Premium Benefits
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Connect Your Way Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-50 rounded-full opacity-70"></div>
          <div className="absolute bottom-0 -left-24 w-96 h-96 bg-red-50 rounded-full opacity-70"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800">
                Connect Your Way
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Discover multiple ways to meet and connect with interesting people around you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 border border-gray-100"
            >
              <div className="h-36 bg-gradient-to-br from-red-600/10 to-red-800/10 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center">
                  <Coffee size={36} className="text-red-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Coffee Meetups</h3>
                <p className="text-gray-600 mb-4">Connect with others over casual coffee chats in local cafés and hotspots</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={18} className="mt-0.5 text-red-600 flex-shrink-0" />
                    <span>Quick 30-minute connections for busy professionals</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={18} className="mt-0.5 text-red-600 flex-shrink-0" />
                    <span>Low-pressure social settings in cozy environments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={18} className="mt-0.5 text-red-600 flex-shrink-0" />
                    <span>Find conversation partners with shared interests</span>
                  </li>
                </ul>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Link to="/experiences" className="text-red-600 font-semibold flex items-center justify-center gap-2 hover:text-red-700 transition-colors py-2">
                  Find Coffee Buddies
                  <Coffee size={18} />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 border border-gray-100"
            >
              <div className="h-36 bg-gradient-to-br from-blue-600/10 to-blue-800/10 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center">
                  <Users size={36} className="text-blue-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Interest Groups</h3>
                <p className="text-gray-600 mb-4">Join communities of people who share your specific passions and hobbies</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={18} className="mt-0.5 text-blue-600 flex-shrink-0" />
                    <span>Book clubs, photography groups, fitness enthusiasts and more</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={18} className="mt-0.5 text-blue-600 flex-shrink-0" />
                    <span>Regular scheduled meetups with like-minded individuals</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={18} className="mt-0.5 text-blue-600 flex-shrink-0" />
                    <span>Share skills and learn from other community members</span>
                  </li>
                </ul>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Link to="/experiences" className="text-blue-600 font-semibold flex items-center justify-center gap-2 hover:text-blue-700 transition-colors py-2">
                  Explore Groups
                  <Users size={18} />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 border border-gray-100"
            >
              <div className="h-36 bg-gradient-to-br from-green-600/10 to-green-800/10 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center">
                  <Mountain size={36} className="text-green-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Adventure Buddies</h3>
                <p className="text-gray-600 mb-4">Find companions for outdoor activities and weekend adventures</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={18} className="mt-0.5 text-green-600 flex-shrink-0" />
                    <span>Hiking, cycling, and urban exploring with safety in groups</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={18} className="mt-0.5 text-green-600 flex-shrink-0" />
                    <span>Form bonds through shared experiences in nature</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={18} className="mt-0.5 text-green-600 flex-shrink-0" />
                    <span>Discover hidden local gems and breathtaking locations</span>
                  </li>
                </ul>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Link to="/experiences" className="text-green-600 font-semibold flex items-center justify-center gap-2 hover:text-green-700 transition-colors py-2">
                  Find Adventures
                  <Mountain size={18} />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 border border-gray-100"
            >
              <div className="h-36 bg-gradient-to-br from-purple-600/10 to-purple-800/10 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center">
                  <MessageCircle size={36} className="text-purple-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Conversation Circles</h3>
                <p className="text-gray-600 mb-4">Join facilitated discussions on topics that matter to you</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={18} className="mt-0.5 text-purple-600 flex-shrink-0" />
                    <span>Thought-provoking discussions in welcoming environments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={18} className="mt-0.5 text-purple-600 flex-shrink-0" />
                    <span>Cultural and intellectual exchange with diverse perspectives</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={18} className="mt-0.5 text-purple-600 flex-shrink-0" />
                    <span>Build deeper connections through meaningful dialogue</span>
                  </li>
                </ul>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Link to="/experiences" className="text-purple-600 font-semibold flex items-center justify-center gap-2 hover:text-purple-700 transition-colors py-2">
                  Join Discussions
                  <MessageCircle size={18} />
                </Link>
              </div>
            </motion.div>
          </div>
          
          <div className="mt-16 text-center">
            <Link to="/experiences">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex flex-col items-center gap-2 px-8 py-6 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-2xl shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Users size={24} className="text-white" />
                  <span className="text-xl font-bold">Explore All Connection Opportunities</span>
                </div>
                <p className="text-white/80 text-sm max-w-md">
                  Find the perfect way to meet like-minded people and build meaningful relationships
                </p>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-0 w-64 h-64 bg-red-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-10 right-0 w-80 h-80 bg-red-50 rounded-full blur-3xl opacity-70"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800">
                  What Our Community Says
                </span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Hear from people who have found meaningful connections and experiences through Convivia24
              </p>
            </motion.div>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-12">
                  {/* Image Column */}
                  <div className="md:col-span-5 relative h-64 md:h-auto">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent md:bg-none z-10"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                      alt="People connecting" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 md:top-8 md:left-8 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs px-4 py-2 rounded-full shadow-lg z-20">
                      Real Stories
                    </div>
                  </div>
                  
                  {/* Content Column */}
                  <div className="md:col-span-7 p-6 md:p-10 flex flex-col justify-center">
                    <div className="mb-6 text-red-600">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={20} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    
                    <blockquote className="text-xl md:text-2xl text-gray-700 italic mb-8 leading-relaxed">
                      "{testimonials[activeSlide].quote}"
                    </blockquote>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-red-100">
                        <img 
                          src={testimonials[activeSlide].image} 
                          alt={testimonials[activeSlide].name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=Person';
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{testimonials[activeSlide].name}</h4>
                        <p className="text-gray-500">{testimonials[activeSlide].role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            <div className="flex justify-center mt-10 gap-4">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    activeSlide === index 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 w-10' 
                      : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                ></motion.button>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/experiences">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 font-medium transition-colors shadow-md"
                >
                  Join Our Community
                  <Users size={20} />
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Updated for social connection */}
      <section className="py-24 bg-gradient-to-b from-red-900 to-black text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3')] bg-cover bg-center opacity-20"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl font-bold mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Start Making Real Connections Today
              </h2>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                Join thousands of people who are breaking out of digital isolation and building meaningful real-world relationships
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/signup" className="bg-white text-red-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2 justify-center w-full">
                    Sign Up Now
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/experiences" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2 justify-center w-full">
                    Explore Connections
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Update the Brand Spotlight Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800">
                Premium Partners
              </span>
            </h2>
            <p className="text-gray-600 mb-10 text-lg">
              Discover handpicked venues, services and brands that offer exclusive benefits to Convivia24 members
            </p>
            
            <motion.button 
              onClick={() => setShowBrandSpotlight(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
            >
              Explore Featured Partners
              <Globe size={20} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Update Active Communities section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Active Communities
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
              Discover thriving social scenes in our most active locations
            </p>
          </motion.div>

          <div className="flex justify-center gap-6 mb-12">
            <motion.button
              onClick={() => setSelectedLocation('nigeria')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-lg ${
                selectedLocation === 'nigeria' 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">🇳🇬</span> Nigeria
            </motion.button>
            <motion.button
              onClick={() => setSelectedLocation('uk')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-lg ${
                selectedLocation === 'uk' 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">🇬🇧</span> United Kingdom
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {(selectedLocation === 'nigeria' ? cityData["Nigeria"] : cityData["United Kingdom"]).map((city, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -10 }}
                className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition-all duration-300 shadow-md"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                    <MapPin size={20} className="text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold">{city.name}</h3>
                </div>
                <p className="text-gray-400 mb-4 text-sm">Popular areas for connections and meetups</p>
                <div className="flex items-center gap-2 text-red-400 font-medium">
                  <Users size={16} />
                  <span>{city.members}</span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/experiences">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-semibold shadow-lg"
              >
                Find Communities Near You
                <Globe size={18} />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Update Community Benefits section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800">
                Community Benefits
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Discover how Convivia24 helps you build meaningful relationships
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/conviviapass">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 font-medium transition-colors shadow-md"
              >
                Unlock Premium Benefits
                <Sparkles size={18} className="text-red-600" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Business Section */}
      <section className="py-24 bg-gradient-to-r from-gray-900 to-black text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3')] bg-cover bg-center opacity-20"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  For Venues & Businesses
                </h2>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Join our network of premium venues and service providers. List your business, promote your events, and connect with potential customers looking for unique experiences.
                </p>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <Building size={24} className="text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Venue Registration</h3>
                      <p className="text-gray-400">List your venue or business on our platform and get discovered by thousands of potential customers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <Calendar size={24} className="text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Event Publishing</h3>
                      <p className="text-gray-400">Create and promote your events to our engaged community of social enthusiasts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={24} className="text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Partnership Program</h3>
                      <p className="text-gray-400">Become a ConviviaPass partner and offer exclusive benefits to our premium members</p>
                    </div>
                  </div>
                </div>
                
                <Link to="/business-register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-semibold shadow-lg inline-flex items-center gap-2"
                  >
                    Register Your Business
                    <Building size={18} />
                  </motion.button>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h3 className="text-2xl font-bold mb-1">Business Dashboard</h3>
                        <p className="text-gray-400">Manage your venue profile and events</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                        <Building size={20} className="text-red-400" />
                      </div>
                    </div>
                    
                    <div className="space-y-6 mb-8">
                      <div className="bg-gray-700/30 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <div className="font-medium">Brew Café Dashboard</div>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                            Active
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mb-4">
                          Manage your café's profile, events, and promotions
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-gray-800/50 p-2 rounded">
                            <div className="text-xl font-bold text-red-400">12</div>
                            <div className="text-xs text-gray-500">Events</div>
                          </div>
                          <div className="bg-gray-800/50 p-2 rounded">
                            <div className="text-xl font-bold text-red-400">1.4k</div>
                            <div className="text-xs text-gray-500">Views</div>
                          </div>
                          <div className="bg-gray-800/50 p-2 rounded">
                            <div className="text-xl font-bold text-red-400">231</div>
                            <div className="text-xs text-gray-500">Bookings</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-700/30 p-4 rounded-lg">
                        <div className="flex justify-between mb-3">
                          <div className="font-medium">Monthly Performance</div>
                          <div className="text-sm text-gray-400">April 2023</div>
                        </div>
                        <div className="h-32 flex items-end gap-1">
                          {[35, 28, 45, 65, 38, 75, 50].map((height, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-red-600 to-red-500 rounded-t" style={{ height: `${height}%` }}></div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                          <div>Mon</div>
                          <div>Tue</div>
                          <div>Wed</div>
                          <div>Thu</div>
                          <div>Fri</div>
                          <div>Sat</div>
                          <div>Sun</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-2">
                        Ready to grow your business with us?
                      </div>
                      <Link to="/business-demo">
                        <span className="text-red-400 font-medium inline-flex items-center">
                          Request A Demo <span className="ml-1">→</span>
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Sections */}
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