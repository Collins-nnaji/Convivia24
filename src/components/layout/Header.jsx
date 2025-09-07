import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// Auth context not needed while auth is disabled
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Search, Home, Users, Sparkles, Ticket, Gift, BarChart3, 
  Calendar, MapPin, User, Bell, Heart, Radio, Music
} from 'lucide-react';

const Header = () => {
  const currentUser = null;
  const logout = () => {};
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={16} /> },
    { path: '/discover', label: 'Events', icon: <Search size={16} /> },
    { path: '/event-companions', label: 'Companions', icon: <Users size={16} /> }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md py-2 shadow-lg border-b border-gray-200' 
          : 'bg-white py-3 border-b border-gray-100'
      }`}
    >
      <div className="px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ 
                opacity: isLoaded ? 1 : 0, 
                rotate: isLoaded ? 0 : -180 
              }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <motion.img 
                src="/Logo2.png" 
                alt="Convivia24 Logo" 
                className="h-8 sm:h-10"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -10 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Link 
                  to={item.path} 
                  className={`text-sm font-medium px-3 py-2 rounded-full flex items-center gap-1.5 transition-all ${
                    isActive(item.path)
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </motion.div>
            ))}
            
          </nav>

          {/* User Menu (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative"
            >
              <button 
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900"
              >
                <Search size={18} />
              </button>
            </motion.div>

          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 lg:hidden">
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600">
              <Search size={18} />
            </button>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600">
              <Bell size={18} />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header; 