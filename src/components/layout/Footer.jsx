import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Sparkles, Globe, Calendar, Heart, Users, Home } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-black to-gray-900 text-white border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/convivia24logo.png" alt="Convivia24 Logo" className="h-10" />
              <h3 className="text-lg font-bold bg-gradient-to-r from-white to-red-300 bg-clip-text text-transparent">Convivia24</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Creating memorable experiences and connections across Nigeria and the UK.
              From events and hotspots to social connections and celebrations.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Navigation</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Events & Celebrations
                </Link>
              </li>
              <li>
                <Link to="/venues" className="hover:text-white transition-colors flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Venues
                </Link>
              </li>
              <li>
                <Link to="/conviviapass" className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 hover:from-red-300 hover:to-red-500 font-medium transition-colors flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  Convivia Rewards
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><span className="text-gray-500">About Us</span></li>
              <li><span className="text-gray-500">Careers</span></li>
              <li><span className="text-gray-500">Partner With Us</span></li>
              <li><span className="text-gray-500">Privacy Policy</span></li>
              <li><span className="text-gray-500">Terms of Service</span></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <address className="text-gray-400 not-italic space-y-2">
              <div className="flex items-start gap-2">
                <Globe className="h-5 w-5 mt-0.5 text-red-400" />
                <div>
                  <p>Nigeria Office:</p>
                  <p>Premium Business District</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="h-5 w-5 mt-0.5 text-red-400" />
                <div>
                  <p>UK Office:</p>
                  <p>456 Oxford Street, London</p>
                </div>
              </div>
              <div>
                <a href="mailto:info@convivia24.com" className="hover:text-white transition-colors block">info@convivia24.com</a>
                <a href="tel:+2341234567890" className="hover:text-white transition-colors block">+234 123 456 7890</a>
              </div>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Convivia24. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 