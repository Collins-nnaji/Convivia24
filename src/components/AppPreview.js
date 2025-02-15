// src/components/AppPreview.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    BarChart2, Bell,
    Truck, Package,
    ArrowRight, Battery, Signal, Wifi,
    Plus, Minus, Menu
  } from 'lucide-react';

const AppInterface = () => {
  const [selectedScreen, setSelectedScreen] = useState('order');

  const screens = {
    order: {
      title: "Place Order",
      content: (
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Heineken</h3>
              <div className="flex items-center gap-2">
                <button className="bg-gray-700 p-1 rounded-full">
                  <Minus size={16} />
                </button>
                <span>24</span>
                <button className="bg-red-600 p-1 rounded-full">
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full">
              <motion.div 
                className="h-full bg-red-600 rounded-full"
                initial={{ width: "40%" }}
                animate={{ width: "60%" }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="text-sm text-gray-400">Current Stock: 48 bottles</div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Jameson</h3>
              <div className="flex items-center gap-2">
                <button className="bg-gray-700 p-1 rounded-full">
                  <Minus size={16} />
                </button>
                <span>6</span>
                <button className="bg-red-600 p-1 rounded-full">
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full">
              <motion.div 
                className="h-full bg-yellow-500 rounded-full"
                initial={{ width: "20%" }}
                animate={{ width: "30%" }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="text-sm text-gray-400">Current Stock: 12 bottles</div>
          </div>

          <button className="w-full bg-red-600 py-3 rounded-lg font-bold mt-4">
            Place Order
          </button>
        </div>
      )
    },
    tracking: {
      title: "Track Delivery",
      content: (
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-600 p-2 rounded-full">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="font-bold">Order #1234</h3>
                <p className="text-sm text-gray-400">Estimated: 35 mins</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-3 h-3 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="text-sm">
                  <div className="font-bold">Order Confirmed</div>
                  <div className="text-gray-400">10:30 AM</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-3 h-3 bg-red-500 rounded-full"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <div className="text-sm">
                  <div className="font-bold">Out for Delivery</div>
                  <div className="text-gray-400">10:45 AM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="w-[300px] h-[600px] bg-black rounded-[40px] p-4 relative">
      {/* Phone Frame */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl" />
      
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2">
        <div>9:41</div>
        <div className="flex items-center gap-2">
          <Signal size={16} />
          <Wifi size={16} />
          <Battery size={16} />
        </div>
      </div>

      {/* App Content */}
      <div className="bg-gray-900 h-[calc(100%-24px)] rounded-3xl p-4 text-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Menu size={20} />
          <Bell size={20} />
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          {Object.entries(screens).map(([key, screen]) => (
            <button
              key={key}
              onClick={() => setSelectedScreen(key)}
              className={`px-4 py-2 rounded-lg ${
                selectedScreen === key 
                  ? 'bg-red-600' 
                  : 'bg-gray-800'
              }`}
            >
              {screen.title}
            </button>
          ))}
        </div>

        {/* Screen Content */}
        {screens[selectedScreen].content}
      </div>
    </div>
  );
};

const AppPreview = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Experience The Platform
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Everything you need to manage your venue's beverage operations in one place
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* App Interface */}
          <div className="lg:w-1/2 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AppInterface />
            </motion.div>
          </div>

          {/* Features List */}
          <div className="lg:w-1/2">
            <div className="grid gap-8">
              {[
                {
                  icon: <Package size={24} color="#DC2626" />,
                  title: "Smart Inventory",
                  description: "Real-time stock tracking with automatic reorder suggestions"
                },
                {
                  icon: <Truck size={24} color="#DC2626" />,
                  title: "Live Delivery Tracking",
                  description: "Monitor your orders with real-time updates and ETAs"
                },
                {
                  icon: <BarChart2 size={24} color="#DC2626" />,
                  title: "Advanced Analytics",
                  description: "Make data-driven decisions with detailed insights"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex gap-6 p-6 bg-gray-800 rounded-xl hover:bg-gray-700/50 transition-colors group cursor-pointer"
                >
                  <div className="bg-red-600/10 p-3 rounded-lg group-hover:bg-red-600/20 transition-colors">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      {feature.title}
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPreview;