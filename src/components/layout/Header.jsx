import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, User, LogOut, ChevronDown, 
  Calendar, Music, Heart, Crown, 
  Bell, Search, Home, Users, MessageCircle
} from 'lucide-react';

const Header = () => {
  const { currentUser, logout } = useAuth();
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
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={16} /> },
    { path: '/events', label: 'Events', icon: <Calendar size={16} /> },
    { path: '/hotspots', label: 'Hotspots', icon: <Users size={16} /> },
    { path: '/providers', label: 'Providers', icon: <MessageCircle size={16} /> },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/90 backdrop-blur-md py-2 shadow-lg' 
          : 'bg-gradient-to-r from-black to-red-900 py-4'
      }`}
    >
      <div className="container mx-auto px-4">
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
                src="/convivia24logo.png" 
                alt="Convivia24 Logo" 
                className="h-10 md:h-12 mr-3"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent rounded-full blur-xl -z-10"></div>
            </motion.div>
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl font-bold hidden md:block bg-gradient-to-r from-white to-red-300 bg-clip-text text-transparent" 
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Convivia24
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
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
                    (item.path === '/' ? isActive(item.path) : location.pathname.includes(item.path.substring(1)))
                      ? 'bg-red-600/20 text-white' 
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative"
            >
              <button 
                className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-gray-300 hover:text-white"
              >
                <Search size={18} />
              </button>
            </motion.div>
            
            {currentUser ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="relative"
              >
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full pl-2 pr-4 py-1.5 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-red-100 flex-shrink-0 border-2 border-red-500">
                    {currentUser.profilePicture ? (
                      <img
                        src={currentUser.profilePicture}
                        alt={currentUser.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 m-auto text-red-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{currentUser.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-xl shadow-xl py-1 z-10"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User size={16} />
                        Profile
                      </Link>
                      <Link
                        to="/notifications"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Bell size={16} />
                        Notifications
                      </Link>
                      <div className="border-t border-gray-800 my-1"></div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center gap-3"
              >
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-full transition-colors shadow-lg shadow-red-900/20"
                >
                  Sign Up
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:hidden p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-white focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="mt-4 pb-4 bg-gray-900/50 backdrop-blur-md rounded-xl p-4 border border-gray-800/50">
                <nav className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <Link 
                      key={item.path}
                      to={item.path} 
                      className={`text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-3 transition-colors ${
                        (item.path === '/' ? isActive(item.path) : location.pathname.includes(item.path.substring(1)))
                          ? 'bg-red-600/20 text-white' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}

                  {currentUser ? (
                    <>
                      <div className="border-t border-gray-700/50 my-2"></div>
                      <Link
                        to="/profile"
                        className="text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/notifications"
                        className="text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Bell className="h-4 w-4" />
                        Notifications
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="border-t border-gray-700/50 my-2"></div>
                      <div className="flex flex-col space-y-2 px-4 pt-2">
                        <Link
                          to="/login"
                          className="text-sm font-medium text-center py-2 px-4 rounded-lg text-gray-300 border border-gray-700 hover:bg-gray-800 hover:text-white transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          to="/signup"
                          className="text-sm font-medium text-center py-2 px-4 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </div>
                    </>
                  )}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header; 