import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Target, Briefcase, ChevronRight, 
  X, PieChart, BarChart2, Users, Percent, Globe,  Crown,
  PartyPopper, Heart
} from 'lucide-react';

const InvestorSection = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Investment Highlights', icon: PieChart },
    { id: 'market', label: 'Market Size', icon: Target },
    { id: 'financials', label: 'Financial Data', icon: BarChart2 },
    { id: 'roadmap', label: 'Growth Plan', icon: Briefcase }
  ];

  const keyMetrics = {
    marketSize: "₦600B+",
    monthlyRevenue: "₦75M",
    growth: "35%",
    venues: "150+"
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                  <TrendingUp className="mr-2 text-red-600" size={24} />
                  Current Traction
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-red-600">{keyMetrics.monthlyRevenue}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Monthly Growth</p>
                    <p className="text-2xl font-bold text-green-600">{keyMetrics.growth}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Event Partners</p>
                    <p className="text-2xl font-bold text-blue-600">{keyMetrics.venues}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Cities Live</p>
                    <p className="text-2xl font-bold text-purple-600">4</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Key Differentiators</h3>
                <ul className="space-y-3">
                  {[
                    "First celebration-focused beverage service platform in Nigeria",
                    "Specialized in traditional and modern celebrations",
                    "Premium event planning integration",
                    "Cultural celebration expertise"
                  ].map((point, index) => (
                    <li key={index} className="flex items-start">
                      <ChevronRight className="text-red-600 mt-1 mr-2 shrink-0" size={16} />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <h3 className="text-xl font-bold mb-6 text-gray-800">Service Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Traditional Ceremonies", icon: <Crown />, events: "45+" },
                  { label: "Wedding Services", icon: <Heart />, events: "60+" },
                  { label: "Corporate Events", icon: <Users />, events: "35+" },
                  { label: "Private Celebrations", icon: <PartyPopper />, events: "80+" }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-red-600 mb-2">{item.icon}</div>
                    <p className="text-sm text-gray-600">{item.label}</p>
                    <p className="text-xl font-bold text-gray-800">{item.events}</p>
                  </div>
                ))}
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
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Nigerian Celebration Market</h3>
                  <p className="text-gray-600">Total Addressable Market</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-red-600">{keyMetrics.marketSize}</p>
                  <p className="text-gray-500">Annual Market Size</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-2">Key Markets</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Traditional Ceremonies</span>
                      <span className="font-bold text-gray-800">₦250B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wedding Industry</span>
                      <span className="font-bold text-gray-800">₦180B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Corporate Events</span>
                      <span className="font-bold text-gray-800">₦170B</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-2">Market Growth</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">YoY Growth</span>
                      <span className="font-bold text-green-600">22%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">5-Year CAGR</span>
                      <span className="font-bold text-green-600">18.5%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-2">Target Share</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year 1</span>
                      <span className="font-bold text-blue-600">5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year 3</span>
                      <span className="font-bold text-blue-600">20%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );

      case 'financials':
        return (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Current Financials</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-gray-600">Monthly Revenue</p>
                      <p className="text-xl font-bold text-gray-800">₦75M</p>
                    </div>
                    <div className="text-green-600 flex items-center">
                      <TrendingUp size={16} className="mr-1" />
                      35%
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-gray-600">Average Event Value</p>
                      <p className="text-xl font-bold text-gray-800">₦850K</p>
                    </div>
                    <div className="text-green-600 flex items-center">
                      <TrendingUp size={16} className="mr-1" />
                      28%
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-gray-600">Net Margin</p>
                      <p className="text-xl font-bold text-gray-800">22%</p>
                    </div>
                    <div className="text-green-600 flex items-center">
                      <Percent size={16} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Projections (Year 1)</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-gray-600">Revenue Target</p>
                      <p className="text-xl font-bold text-gray-800">₦1.2B</p>
                    </div>
                    <div className="text-blue-600">
                      <Target size={16} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-gray-600">Events Served</p>
                      <p className="text-xl font-bold text-gray-800">500+</p>
                    </div>
                    <div className="text-blue-600">
                      <PartyPopper size={16} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-gray-600">Cities Covered</p>
                      <p className="text-xl font-bold text-gray-800">8</p>
                    </div>
                    <div className="text-blue-600">
                      <Globe size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );

      case 'roadmap':
        return (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <h3 className="text-xl font-bold mb-6 text-gray-800">Growth Strategy</h3>
              <div className="space-y-6">
                {[
                  {
                    phase: "Phase 1: Launch (Months 1-6)",
                    goals: [
                      "Establish presence in key celebration venues",
                      "Build relationships with event planners",
                      "Launch cultural ceremony services",
                      "Develop event planning integration"
                    ],
                    metrics: {
                      revenue: "₦300M",
                      events: "100+",
                      cities: "2"
                    }
                  },
                  {
                    phase: "Phase 2: Growth (Months 7-12)",
                    goals: [
                      "Expand to additional cities",
                      "Launch premium celebration packages",
                      "Integrate with top event venues",
                      "Develop cultural ceremony expertise"
                    ],
                    metrics: {
                      revenue: "₦600M",
                      events: "250+",
                      cities: "4"
                    }
                  },
                  {
                    phase: "Phase 3: Scale (Year 2)",
                    goals: [
                      "National expansion",
                      "Full-service celebration platform",
                      "Cultural celebration marketplace",
                      "Event planning ecosystem"
                    ],
                    metrics: {
                      revenue: "₦1.8B+",
                      events: "500+",
                      cities: "8"
                    }
                  }
                ].map((phase, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-red-600">
                    <div className="absolute left-0 top-0 w-3 h-3 -translate-x-[7px] rounded-full bg-red-600" />
                    <h4 className="font-bold text-gray-800 mb-2">{phase.phase}</h4>
                    <ul className="space-y-2 mb-4">
                      {phase.goals.map((goal, gIndex) => (
                        <li key={gIndex} className="flex items-start text-gray-700">
                          <ChevronRight className="text-red-600 mt-1 mr-2 shrink-0" size={16} />
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Target Revenue</p>
                        <p className="font-bold text-gray-800">{phase.metrics.revenue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Events</p>
                        <p className="font-bold text-gray-800">{phase.metrics.events}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Cities</p>
                        <p className="font-bold text-gray-800">{phase.metrics.cities}</p>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-6 rounded-xl shadow-lg"
                >
                  <h3 className="text-xl font-bold mb-4 text-gray-800">Exit Strategy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-800">Strategic Partnerships</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <ChevronRight className="text-red-600 mt-1 mr-2 shrink-0" size={16} />
                          <span className="text-gray-700">Integration with major event planning platforms</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="text-red-600 mt-1 mr-2 shrink-0" size={16} />
                          <span className="text-gray-700">Partnership with premium beverage brands</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-800">Expansion Opportunities</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <ChevronRight className="text-red-600 mt-1 mr-2 shrink-0" size={16} />
                          <span className="text-gray-700">Pan-African celebration services platform</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="text-red-600 mt-1 mr-2 shrink-0" size={16} />
                          <span className="text-gray-700">Full-service event technology provider</span>
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
                <div className="flex justify-between items-center mb-8">
                <div>
                <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                Investor Overview
                </h2>
                <p className="text-gray-600">Nigeria's Premier Celebration Services Platform</p>
                </div>
                <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                <X size={24} />
                </button>
                </div>
                
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
                
                {renderTabContent()}
                
                <div className="mt-12 text-center">
                <button className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors">
                Request Investor Deck
                </button>
                </div>
                </div>
                </motion.div>
                </motion.div>
                )}
                </AnimatePresence>
                );
                };
                
                export default InvestorSection;