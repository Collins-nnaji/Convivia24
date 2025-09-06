import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

const Layout = ({ children }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Reset scroll position when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className={`flex-grow ${isMobile ? 'pt-16 pb-20' : 'pt-20'}`}>
        <div className="w-full">
          {children}
        </div>
      </main>
      {isMobile && <MobileBottomNav />}
      <Footer />
    </div>
  );
};

export default Layout; 