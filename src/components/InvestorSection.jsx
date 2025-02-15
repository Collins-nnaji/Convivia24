// src/components/InvestorSection.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, PieChart, Target,
  Briefcase, ChevronRight, X
} from 'lucide-react';

const InvestorSection = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'market', label: 'Market', icon: Target },
    { id: 'strategy', label: 'Strategy', icon: Briefcase }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <TrendingUp className="mr-2 text-red-600" /> Investment Highlights
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <ChevronRight className="text-red-600 mt-1 mr-2" size={16} />
                  <span>First tech-enabled beverage distribution platform in Nigeria</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="text-red-600 mt-1 mr-2" size={16} />
                  <span>₦400B+ total addressable market size</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="text-red-600 mt-1 mr-2" size={16} />
                  <span>115+ partner venues in key metropolitan areas</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Target className="mr-2 text-red-600" /> Current Traction
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-red-600">₦57M</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Partner Venues</p>
                  <p className="text-2xl font-bold text-red-600">115+</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Growth</p>
                  <p className="text-2xl font-bold text-red-600">25%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cities</p>
                  <p className="text-2xl font-bold text-red-600">2</p>
                </div>
              </div>
            </motion.div>
          </div>
        );

      case 'market':
        return (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold mb-6">Market Opportunity</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Market Size</p>
                  <p className="text-2xl font-bold text-red-600">₦400B+</p>
                  <p className="text-sm text-gray-500 mt-2">Annual beverage distribution market in Nigeria</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Target Market Share</p>
                  <p className="text-2xl font-bold text-red-600">15%</p>
                  <p className="text-sm text-gray-500 mt-2">Projected market share by 2027</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Growth Rate</p>
                  <p className="text-2xl font-bold text-red-600">25%</p>
                  <p className="text-sm text-gray-500 mt-2">Month-over-month revenue growth</p>
                </div>
              </div>
            </motion.div>
          </div>
        );

      case 'strategy':
        return (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold mb-6">Growth Strategy</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative p-6 bg-gray-50 rounded-lg">
                  <div className="absolute top-0 left-6 -translate-y-3 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                  <h4 className="font-bold mb-3 mt-3">Phase One</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <ChevronRight className="text-red-600 mt-1 mr-1" size={14} />
                      <span>Launch in Lagos with 2 hubs</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="text-red-600 mt-1 mr-1" size={14} />
                      <span>Onboard 30 initial venues</span>
                    </li>
                  </ul>
                </div>
                <div className="relative p-6 bg-gray-50 rounded-lg">
                  <div className="absolute top-0 left-6 -translate-y-3 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                  <h4 className="font-bold mb-3 mt-3">Phase Two</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <ChevronRight className="text-red-600 mt-1 mr-1" size={14} />
                      <span>Expand to Port Harcourt</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="text-red-600 mt-1 mr-1" size={14} />
                      <span>Scale to 50+ venues</span>
                    </li>
                  </ul>
                </div>
                <div className="relative p-6 bg-gray-50 rounded-lg">
                  <div className="absolute top-0 left-6 -translate-y-3 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
                  <h4 className="font-bold mb-3 mt-3">Phase Three</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <ChevronRight className="text-red-600 mt-1 mr-1" size={14} />
                      <span>Nationwide expansion</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="text-red-600 mt-1 mr-1" size={14} />
                      <span>115+ partner venues</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="min-h-screen bg-gray-50 rounded-t-3xl mt-20 p-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Investor Overview
                </h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-3 rounded-full transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-red-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon size={18} className="mr-2" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {renderTabContent()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InvestorSection;