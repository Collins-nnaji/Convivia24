import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, Search, Users, Gift, User, Plus
} from 'lucide-react';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: <Home size={20} />,
      activeIcon: <Home size={20} />
    },
    {
      path: '/discover',
      label: 'Events',
      icon: <Search size={20} />,
      activeIcon: <Search size={20} />
    },
    {
      path: '/event-companions',
      label: 'Companions',
      icon: <Users size={20} />,
      activeIcon: <Users size={20} />
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, index) => (
          <motion.button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
              isActive(item.path)
                ? 'text-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`transition-all duration-200 ${
              isActive(item.path) ? 'scale-110' : 'scale-100'
            }`}>
              {isActive(item.path) ? item.activeIcon : item.icon}
            </div>
            <span className={`text-xs mt-1 font-medium transition-all duration-200 ${
              isActive(item.path) ? 'text-red-600' : 'text-gray-500'
            }`}>
              {item.label}
            </span>
            {isActive(item.path) && (
              <motion.div
                layoutId="activeTab"
                className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-600 rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default MobileBottomNav;
