import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, PartyPopper,
  Heart, Crown, CheckCircle, MapPin,
  Calendar, Users, Music, Wine, 
  GlassWater
} from 'lucide-react';
import InvestorSection from './InvestorSection';
import EventsSection from './EventsSection';
import EntertainmentSection from './EntertainmentSection';
import AppPreview from './AppPreview';
import AboutSection from './AboutSection';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showInvestorSection, setShowInvestorSection] = useState(false);
  const [showEventsSection, setShowEventsSection] = useState(false);
  const [showEntertainmentSection, setShowEntertainmentSection] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Raleway:wght@400;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setIsLoaded(true);
  }, []);

  const celebrationTypes = [
    {
      icon: <Crown size={32} className="text-red-600" />,
      title: "Traditional Ceremonies",
      description: "Custom packages for traditional weddings and cultural celebrations",
      features: ["Palm wine service", "Traditional servers", "Cultural presentations"]
    },
    {
      icon: <Heart size={32} className="text-red-600" />,
      title: "Wedding Services",
      description: "Complete beverage solutions for the perfect wedding celebration",
      features: ["Premium drink selection", "Professional service", "Custom packages"]
    },
    {
      icon: <Star size={32} className="text-red-600" />,
      title: "Corporate Events",
      description: "Sophisticated beverage services for corporate functions",
      features: ["High-end spirits", "Branded experiences", "Full-service bars"]
    },
    {
      icon: <PartyPopper size={32} className="text-red-600" />,
      title: "Private Celebrations",
      description: "Personalized service for birthdays and special moments",
      features: ["Custom cocktails", "Party supplies", "Event staffing"]
    }
  ];

  const celebrationSteps = [
    {
      icon: <Calendar size={32} color="#DC2626" />,
      title: "Plan Your Celebration",
      description: "Choose from our range of celebration packages and customization options"
    },
    {
      icon: <Wine size={32} color="#DC2626" />,
      title: "Select Your Package",
      description: "Customize your beverage selection for any type of celebration"
    },
    {
      icon: <CheckCircle size={32} color="#DC2626" />,
      title: "Instant Confirmation",
      description: "Get immediate confirmation and dedicated event support"
    },
    {
      icon: <PartyPopper size={32} color="#DC2626" />,
      title: "Celebrate!",
      description: "Enjoy your event with our premium beverage service"
    }
  ];

  const cities = [
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

  const features = [
    {
      icon: <Crown size={24} />,
      title: "Cultural Expertise",
      description: "Specialized service for traditional ceremonies and cultural celebrations"
    },
    {
      icon: <Heart size={24} />,
      title: "Wedding Packages",
      description: "Complete beverage solutions for wedding ceremonies and receptions"
    },
    {
      icon: <Music size={24} />,
      title: "Entertainment Services",
      description: "Book DJs, MCs, and Live Bands for your celebration"
    }
  ];

  const venues = [
    {
      name: "Royal Palm Hall",
      type: "Wedding Venue",
      capacity: "500-1000",
      features: ["Full Bar Service", "Garden Space", "Valet Parking"]
    },
    {
      name: "The Glass House",
      type: "Corporate Events",
      capacity: "200-400",
      features: ["Premium Bar", "AV Equipment", "Catering Kitchen"]
    },
    {
      name: "Cultural Center",
      type: "Traditional Ceremonies",
      capacity: "300-600",
      features: ["Traditional Setup", "Multiple Halls", "Outdoor Space"]
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black overflow-hidden" style={{ fontFamily: 'Raleway, sans-serif' }}>
      {/* Hero Section */}
      <div className="relative z-10 bg-gradient-to-b from-black to-red-900 text-white">
        <header className="container mx-auto px-4 py-16 flex flex-col items-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <img 
              src="/convivia24logo.png" 
              alt="Convivia24 Logo" 
              className="w-48 mx-auto"
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
            Your Celebration
            <br />
            <span className="bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
              Partner
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-center text-gray-300 max-w-3xl font-light mb-6"
          >
            Premium beverage service for all your celebrations - from traditional ceremonies 
            to modern events, weddings to corporate gatherings.
          </motion.p>

          {/* Key Features */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-wrap justify-center gap-4 mb-12 text-sm text-gray-300"
          >
            <div className="flex items-center gap-2">
              <Crown size={16} /> Traditional Ceremonies
            </div>
            <div className="flex items-center gap-2">
              <Heart size={16} /> Wedding Services
            </div>
            <div className="flex items-center gap-2">
              <Music size={16} /> Entertainment
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
              onClick={() => navigate('/events')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
            >
              Plan Your Celebration
            </button>
            <button 
              onClick={() => setShowInvestorSection(true)}
              className="bg-transparent border-2 border-white hover:bg-white hover:text-red-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
            >
              Investor Overview
            </button>
            <button 
              onClick={() => navigate('/community')}
              className="bg-transparent border-2 border-white hover:bg-white hover:text-red-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
            >
              Join Our Community
            </button>
          </motion.div>
        </header>
      </div>

      {/* About Section */}
      <AboutSection />

      {/* Celebration Types Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Celebration Services
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            From intimate gatherings to grand celebrations, we provide tailored beverage solutions for every occasion
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
                        <GlassWater size={16} className="mr-2 text-red-600" />
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
                Book professional DJs, Hype Men, and Live Bands for your event
              </p>
              <div className="flex justify-center gap-6">
                <button 
                  onClick={() => setShowEntertainmentSection(true)}
                  className="bg-white text-red-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center"
                >
                  <Music className="mr-2" /> Book Entertainment
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Your Celebration Journey
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            We make celebrating special moments seamless and memorable
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-red-200" />
            
            {celebrationSteps.map((step, index) => (
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

      {/* Venues Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Premium Venues
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Discover perfect spaces for your celebrations
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {venues.map((venue, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y:20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.2 }}
                className="bg-gray-900 rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{venue.name}</h3>
                  <div className="flex items-center text-red-500 mb-4">
                    <Users className="mr-2" size={16} />
                    <span>{venue.capacity} guests</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{venue.type}</p>
                  <ul className="space-y-2">
                    {venue.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center text-gray-400 text-sm">
                        <CheckCircle size={14} className="mr-2 text-red-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Celebration Destinations
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Creating memorable celebrations across Nigeria's major cities
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
                <p className="text-gray-400 mb-2">{city.events}</p>
                <p className="text-red-500 font-semibold flex items-center">
                  <Star size={16} className="mr-2" />
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
            Premium Services
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

      {/* App Download Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl font-bold mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Download Our App
              </h2>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                Plan your celebrations, manage bookings, and track your orders all in one place
              </p>
              <div className="flex justify-center gap-6">
                <button className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center">
                  <Star className="mr-2" size={20} /> App Store
                </button>
                <button className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center">
                  <Star className="mr-2" size={20} /> Play Store
                </button>
              </div>
            </motion.div>
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
      <EntertainmentSection 
        isOpen={showEntertainmentSection} 
        onClose={() => setShowEntertainmentSection(false)} 
      />
    </div>
  );
};

export default LandingPage;