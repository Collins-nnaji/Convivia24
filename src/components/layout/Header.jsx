import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// Auth context not needed while auth is disabled
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Search, Home, Calendar, Users, Sparkles
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
    { path: '/events', label: 'Events', icon: <Calendar size={16} /> },
    { path: '/venues', label: 'Venues', icon: <Users size={16} /> },
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
                    isActive(item.path)
                      ? 'bg-red-600/20 text-white' 
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </motion.div>
            ))}
            
            {/* ConviviaPass Special Link */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -10 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Link 
                to="/conviviapass" 
                className={`text-sm font-medium px-3 py-2 rounded-full flex items-center gap-1.5 transition-all ${
                  isActive('/conviviapass')
                    ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-lg shadow-purple-700/20' 
                    : 'bg-gradient-to-r from-red-600/20 to-purple-600/20 text-white hover:from-red-600/30 hover:to-purple-600/30'
                }`}
              >
                <Sparkles size={16} className="text-yellow-300" />
                ConviviaPass
              </Link>
            </motion.div>
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
            
            {/* Auth temporarily disabled: hide login/signup and user menu */}
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
                        isActive(item.path)
                          ? 'bg-red-600/20 text-white' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}

                  {/* ConviviaPass Link in Mobile Menu */}
                  <Link 
                    to="/conviviapass" 
                    className={`text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-3 transition-colors ${
                      isActive('/conviviapass')
                        ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white' 
                        : 'bg-gradient-to-r from-red-600/20 to-purple-600/20 text-white hover:from-red-600/30 hover:to-purple-600/30'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                    ConviviaPass
                  </Link>

                  {/* Auth temporarily disabled */}
                    <>
                      <div className="border-t border-gray-700/50 my-2"></div>
                      <div className="flex flex-col space-y-2 px-4 pt-2">
                        <span className="text-sm font-medium text-center py-2 px-4 rounded-lg text-gray-500">
                          Login (Coming Soon)
                        </span>
                        <span className="text-sm font-medium text-center py-2 px-4 rounded-lg text-gray-500">
                          Sign Up (Coming Soon)
                        </span>
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