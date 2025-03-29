import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Clock, Users, Bell, Globe } from 'lucide-react';

const TabsNavigator = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 border border-gray-200">
      <div className="flex overflow-x-auto hide-scrollbar relative">
        <TabButton 
          active={activeTab === 'suggested'} 
          onClick={() => setActiveTab('suggested')}
          icon={<Sparkles size={18} />}
          label="For You"
        />
        <TabButton 
          active={activeTab === 'new'} 
          onClick={() => setActiveTab('new')}
          icon={<Zap size={18} />}
          label="New People"
        />
        <TabButton 
          active={activeTab === 'active'} 
          onClick={() => setActiveTab('active')}
          icon={<Clock size={18} />}
          label="Active Now"
        />
        <TabButton 
          active={activeTab === 'communities'} 
          onClick={() => setActiveTab('communities')}
          icon={<Globe size={18} />}
          label="Communities"
        />
        <TabButton 
          active={activeTab === 'connections'} 
          onClick={() => setActiveTab('connections')}
          icon={<Users size={18} />}
          label="My Connections"
        />
        <TabButton 
          active={activeTab === 'requests'} 
          onClick={() => setActiveTab('requests')}
          icon={<Bell size={18} />}
          label="Requests"
          badge="3"
        />
        
        {/* Animated highlighter that follows the active tab */}
        <div 
          className="absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
          style={{ 
            left: `${activeTab === 'suggested' ? 0 : 
                  activeTab === 'new' ? 16.67 : 
                  activeTab === 'active' ? 33.33 : 
                  activeTab === 'communities' ? 50 :
                  activeTab === 'connections' ? 66.67 : 
                  83.33}%`, 
            width: '16.67%'
          }}
        />
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label, badge = null }) => (
  <motion.button
    onClick={onClick}
    className={`flex-1 min-w-[100px] py-3 px-2 text-sm font-medium whitespace-nowrap transition-colors ${
      active
        ? 'text-blue-600 bg-gradient-to-b from-blue-50/60 to-white'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`}
    whileTap={{ scale: 0.97 }}
  >
    <div className="flex flex-col items-center justify-center">
      <motion.div 
        animate={{ y: active ? [0, -5, 0] : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`mb-1 ${active ? 'text-blue-600' : 'text-gray-500'}`}
      >
        {icon}
      </motion.div>
      <div className="flex items-center">
        {label}
        {badge && (
          <motion.span 
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
            className="ml-1 px-1.5 py-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full shadow-sm"
          >
            {badge}
          </motion.span>
        )}
      </div>
    </div>
  </motion.button>
);

export default TabsNavigator; 