import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, User, LogOut, ChevronDown, Calendar } from 'lucide-react';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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

  return (
    <header className="bg-gradient-to-r from-black to-red-900 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/convivia24logo.png" 
              alt="Convivia24 Logo" 
              className="h-10 mr-3"
            />
            <span className="text-xl font-bold hidden md:block" style={{ fontFamily: 'Playfair Display, serif' }}>
              Convivia24
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium hover:text-red-300 transition-colors ${isActive('/') ? 'text-red-300' : 'text-white'}`}
            >
              Home
            </Link>
            <Link 
              to="/community" 
              className={`text-sm font-medium hover:text-red-300 transition-colors ${isActive('/community') ? 'text-red-300' : 'text-white'}`}
            >
              Community
            </Link>
            <Link 
              to="/events" 
              className={`text-sm font-medium hover:text-red-300 transition-colors ${location.pathname.includes('/event') ? 'text-red-300' : 'text-white'}`}
            >
              Events
            </Link>
            <Link 
              to="/events" 
              className={`text-sm font-medium hover:text-red-300 transition-colors flex items-center`}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Plan Your Celebration
            </Link>
          </nav>

          {/* User Menu (Desktop) */}
          <div className="hidden md:block">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 text-white hover:text-red-300 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-red-100 flex-shrink-0">
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

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-white hover:text-red-300 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-white text-red-600 hover:bg-red-50 px-4 py-2 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`text-sm font-medium hover:text-red-300 transition-colors ${isActive('/') ? 'text-red-300' : 'text-white'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/community" 
                className={`text-sm font-medium hover:text-red-300 transition-colors ${isActive('/community') ? 'text-red-300' : 'text-white'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Community
              </Link>
              <Link 
                to="/events" 
                className={`text-sm font-medium hover:text-red-300 transition-colors ${location.pathname.includes('/event') ? 'text-red-300' : 'text-white'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </Link>
              <Link 
                to="/events" 
                className={`text-sm font-medium hover:text-red-300 transition-colors flex items-center`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Plan Your Celebration
              </Link>

              {currentUser ? (
                <>
                  <div className="border-t border-gray-700 pt-4 mt-4"></div>
                  <Link
                    to="/profile"
                    className="flex items-center text-sm font-medium text-white hover:text-red-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center text-sm font-medium text-white hover:text-red-300 transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-700 pt-4 mt-4"></div>
                  <div className="flex flex-col space-y-2">
                    <Link
                      to="/login"
                      className="text-sm font-medium text-white hover:text-red-300 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="text-sm font-medium bg-white text-red-600 hover:bg-red-50 px-4 py-2 rounded-md transition-colors inline-block text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 