import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, PartyPopper,
  Heart, Crown, CheckCircle, MapPin,
  Calendar, Users, Wine, 
  GlassWater, Globe, Building, Gift, Sparkles, Utensils, Clock
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
      icon: <Users size={32} color="#DC2626" />,
      title: "Cultural Communities",
      description: "Connect with groups that celebrate and preserve cultural traditions"
    },
    {
      icon: <Building size={32} color="#DC2626" />,
      title: "Venue Networks",
      description: "Access exclusive venue partnerships through community membership"
    },
    {
      icon: <Gift size={32} color="#DC2626" />,
      title: "Service Providers",
      description: "Find trusted service providers vetted by community members"
    },
    {
      icon: <Globe size={32} color="#DC2626" />,
      title: "Global Connections",
      description: "Connect with diaspora communities for international celebrations"
    }
  ];

  const nigerianCities = [
    {
      name: "Lagos",
      areas: "Victoria Island • Lekki • Ikoyi • Surulere • Ikeja",
      events: "Traditional & Modern Celebrations",
      venues: "75+ venues"
    },
    {
      name: "Port Harcourt",
      areas: "GRA • Trans Amadi • Old GRA • Diobu",
      events: "Cultural Events & Weddings",
      venues: "40+ venues"
    },
    {
      name: "Abuja",
      areas: "Wuse • Garki • Maitama • Asokoro",
      events: "Corporate & Social Events",
      venues: "50+ venues"
    },
    {
      name: "Benin",
      areas: "Oredo • Ikpoba Hill • GRA • Ugbowo",
      events: "Traditional Ceremonies",
      venues: "30+ venues"
    }
  ];

  const ukCities = [
    {
      name: "London",
      areas: "Central • North • East • South • West",
      events: "Multicultural Celebrations",
      venues: "100+ venues"
    },
    {
      name: "Manchester",
      areas: "City Centre • Northern Quarter • Salford",
      events: "Urban & Contemporary Events",
      venues: "45+ venues"
    },
    {
      name: "Birmingham",
      areas: "City Centre • Jewellery Quarter • Edgbaston",
      events: "Diverse Cultural Celebrations",
      venues: "55+ venues"
    },
    {
      name: "Leeds",
      areas: "City Centre • Chapel Allerton • Headingley",
      events: "Modern & Traditional Events",
      venues: "35+ venues"
    }
  ];

  const features = [
    {
      icon: <Crown size={24} />,
      title: "Cultural Expertise",
      description: "Connect with communities that specialize in traditional ceremonies and cultural celebrations"
    },
    {
      icon: <Heart size={24} />,
      title: "Community Networks",
      description: "Join groups dedicated to different types of celebrations and events"
    },
    {
      icon: <Wine size={24} />,
      title: "Entertainment Services",
      description: "Find the perfect entertainment through community recommendations"
    }
  ];

  const testimonials = [
    {
      name: "David Okonkwo",
      role: "Community Leader",
      image: "/images/testimonials/person1.jpg",
      quote: "Convivia24 transformed how our community celebrates festivals. We connected with vendors, planned logistics, and created an unforgettable experience for over 500 attendees!"
    },
    {
      name: "Sarah Thompson",
      role: "Event Organizer",
      image: "/images/testimonials/person2.jpg",
      quote: "The AI-powered planning tools saved us countless hours. We received venue recommendations we hadn't even considered, and the budget calculator was spot-on for our corporate retreat."
    },
    {
      name: "Chinedu Eze",
      role: "Wedding Planner",
      image: "/images/testimonials/person3.jpg",
      quote: "The vendor connections through Convivia24 made planning my client's destination wedding in Lagos seamless, despite us being based in London. Exceptional service!"
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
              Your all-in-one platform for planning unforgettable events. Find venues, book services, arrange beverages, and create perfect celebrations, all in one place.
          </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={() => navigate('/events')}
                className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-900 text-white font-semibold rounded-lg hover:from-red-800 hover:to-red-950 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Find Venues & Services
              </button>
              <button 
                onClick={() => navigate('/social')}
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
                Joined by <span className="font-semibold">10,000+</span> celebration planners
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
      
      {/* Featured Venues Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Featured Venues & Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our hand-picked selection of premium venues and exclusive services for your next celebration.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Featured Venue 1 */}
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbnVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60" 
                  alt="The Grand Ballroom" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white mb-1">
                    <MapPin size={16} />
                    <span className="text-sm">Lagos, Nigeria</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">The Grand Ballroom</h3>
                </div>
                <div className="absolute top-4 right-4 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                  Featured
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
                  Luxury ballroom perfect for weddings and corporate events, with stunning chandeliers and state-of-the-art facilities.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Capacity: 200-500</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Catering Available</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Sound System</span>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg hover:from-red-800 hover:to-red-950 transition-colors">
                  View Details
                </button>
              </div>
            </motion.div>
            
            {/* Featured Venue 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1513278974582-3e1b4a4fa5e5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                  alt="Garden Oasis" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white mb-1">
                    <MapPin size={16} />
                    <span className="text-sm">Abuja, Nigeria</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Garden Oasis</h3>
                </div>
                <div className="absolute top-4 right-4 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  New
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
                  Beautiful outdoor venue with lush gardens and a covered pavilion, perfect for garden weddings and daytime events.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Capacity: 100-300</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Outdoor</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Parking</span>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg hover:from-red-800 hover:to-red-950 transition-colors">
                  View Details
            </button>
              </div>
            </motion.div>
            
            {/* Featured Service */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1556035511-3168381ea4d4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80" 
                  alt="Premium Catering" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white mb-1">
                    <Utensils size={16} />
                    <span className="text-sm">Service Provider</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Premium Catering</h3>
                </div>
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
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
                  <span className="text-sm text-gray-500">4.9 (148 reviews)</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Luxury catering service offering bespoke menus for all types of events, with professional staff and exceptional presentation.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">International Cuisine</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Custom Menus</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Staffing Included</span>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg hover:from-red-800 hover:to-red-950 transition-colors">
                  View Details
                </button>
              </div>
            </motion.div>
          </div>
          
          <div className="text-center mt-12">
            <button className="px-8 py-3 border-2 border-red-700 text-red-700 rounded-lg hover:bg-red-50 font-medium transition-colors">
              View All Venues & Services
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-xl bg-red-50 dark:bg-gray-800">
              <h3 className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
                <AnimatedCounter end={15000} />+
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Community Members</p>
            </div>
            
            <div className="p-6 rounded-xl bg-red-50 dark:bg-gray-800">
              <h3 className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
                <AnimatedCounter end={750} />+
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Events Monthly</p>
            </div>
            
            <div className="p-6 rounded-xl bg-red-50 dark:bg-gray-800">
              <h3 className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
                <AnimatedCounter end={98} />%
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Client Satisfaction</p>
            </div>
            
            <div className="p-6 rounded-xl bg-red-50 dark:bg-gray-800">
              <h3 className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
                <AnimatedCounter end={25} />+
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Cities Covered</p>
            </div>
          </div>
      </div>
      </section>

      {/* Celebration Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Celebration Services
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            From intimate gatherings to grand celebrations, connect with communities for every occasion
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {celebrationTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    {type.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{type.title}</h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <ul className="space-y-2">
                    {type.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center text-sm text-gray-500">
                        <CheckCircle size={16} className="mr-2 text-red-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button 
                    onClick={() => navigate('/events')}
                    className="text-red-600 font-semibold flex items-center hover:text-red-700 transition-colors"
                  >
                    Learn More
                    <Calendar size={16} className="ml-2" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Entertainment CTA */}
      <section className="py-16 bg-gradient-to-r from-red-900 to-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Complete Your Celebration
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Order drinks, book caterers, arrange entertainment, and more - all through our trusted service providers
              </p>
              <div className="flex justify-center gap-6">
                <button 
                  onClick={() => navigate('/providers')}
                  className="bg-white text-red-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center"
                >
                  <Wine className="mr-2" /> Discover Entertainment
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - New animated section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                What Our Community Says
          </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Read about the experiences of communities and event planners who have used Convivia24 to create memorable celebrations.
              </p>
            </motion.div>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-800 dark:to-red-900/30 p-8 md:p-12 rounded-2xl shadow-xl"
              >
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-md flex-shrink-0">
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
                  
                  <div className="text-center md:text-left">
                    <div className="mb-4 text-red-600 dark:text-red-400">
                      ★★★★★
                    </div>
                    <blockquote className="text-lg md:text-xl text-gray-700 dark:text-gray-300 italic mb-6">
                      "{testimonials[activeSlide].quote}"
                    </blockquote>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{testimonials[activeSlide].name}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{testimonials[activeSlide].role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    activeSlide === index 
                      ? 'bg-red-600 w-6' 
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-red-700 to-red-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Your Next Memorable Celebration?</h2>
              <p className="text-xl text-gray-200 mb-10">
                Join our community of celebration planners and cultural groups to create experiences that bring people together.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/events" className="bg-white text-red-700 hover:bg-gray-100 px-8 py-4 rounded-full font-medium shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                  Plan Your Celebration
                </Link>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-transparent border-2 border-white hover:bg-white/10 px-8 py-4 rounded-full font-medium transition-all transform hover:-translate-y-1">
                  Join Our Community
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand Spotlight Button */}
      <section className="py-16 bg-gradient-to-r from-red-100 to-orange-100 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Discover Our Premium Partners</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Explore top-tier restaurants, beverage suppliers, and catering services that can elevate your celebration experience.
            </p>
            
            <button 
              onClick={() => setShowBrandSpotlight(true)}
              className="bg-gradient-to-r from-red-700 to-red-900 text-white px-8 py-4 rounded-full font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              Explore Featured Brands
            </button>
          </motion.div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Celebration Destinations
          </h2>
          <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">
            Discover communities across our service areas
          </p>

          <div className="flex justify-center gap-6 mb-12">
            <button
              onClick={() => setSelectedLocation('nigeria')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-lg ${
                selectedLocation === 'nigeria' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">🇳🇬</span> Nigeria
            </button>
            <button
              onClick={() => setSelectedLocation('uk')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-lg ${
                selectedLocation === 'uk' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">🇬🇧</span> United Kingdom
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {(selectedLocation === 'nigeria' ? nigerianCities : ukCities).map((city, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-gray-900 p-8 rounded-lg"
              >
                <div className="flex items-center mb-4">
                  <MapPin size={24} color="#DC2626" />
                  <h3 className="text-2xl font-bold ml-2">{city.name}</h3>
                </div>
                <p className="text-gray-400 mb-2">{city.areas}</p>
                <p className="text-gray-400 mb-2">{city.events}</p>
                <p className="text-red-500 font-semibold flex items-center">
                  <Users size={16} className="mr-2" />
                  {city.venues}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16" style={{ fontFamily: 'Playfair Display, serif' }}>
            Community Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.2 }}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow"
              >
                <div className="bg-red-50 p-4 rounded-full inline-block mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-b from-red-900 to-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl font-bold mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Start Planning Your Perfect Celebration
              </h2>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                Join thousands of people who trust us to make their special moments extraordinary
              </p>
              <div className="flex justify-center gap-6">
                <button 
                  onClick={() => navigate('/signup')}
                  className="bg-white text-red-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105"
                >
                  Sign Up Now
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all"
                >
                  Log In
                </button>
              </div>
            </motion.div>
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