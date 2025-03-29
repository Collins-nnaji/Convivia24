import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex-grow pt-24 md:pt-28"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default Layout; 