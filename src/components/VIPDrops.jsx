import React, { useState } from 'react';
import { Crown, Lock, Sparkles, Star, Shield, Award, Truck, BarChart3, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLoyalty } from '../context/LoyaltyContext';
import { drinksDatabase } from '../data/drinksDatabase';
import SimpleDrinkCard from './SimpleDrinkCard';

const VIPDrops = () => {
  const { loyaltyData } = useLoyalty();
  const [selectedCollection, setSelectedCollection] = useState('luxury');
  const isGold = loyaltyData?.tier?.id === 'gold';
  
  // Premium Collections
  const collections = {
    luxury: {
      name: 'Luxury Collection',
      description: 'Ultra-premium spirits for luxury hotels and high-end establishments',
      minPrice: 250000,
      icon: Crown
    },
    rare: {
      name: 'Rare & Limited',
      description: 'Rare finds and limited editions for exclusive venues',
      minPrice: 300000,
      icon: Star
    },
    aged: {
      name: 'Aged Spirits',
      description: 'Exceptionally aged whiskeys, cognacs, and premium spirits',
      minPrice: 180000,
      icon: Award
    }
  };

  const getCollectionDrinks = (collection) => {
    return drinksDatabase.filter(d => d.price >= collections[collection].minPrice).slice(0, 8);
  };

  const currentDrinks = getCollectionDrinks(selectedCollection);

  return (
    <div>
      {/* Premium Collection Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold mb-6 shadow-lg">
          <Crown size={20} className="text-yellow-300" /> 
          Premium Collection
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Exclusive Premium Spirits</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Curated luxury collections and rare bottles for discerning hospitality businesses seeking exceptional quality and prestige.
        </p>
      </div>

      {/* Premium Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 text-center border border-red-200">
          <Shield className="mx-auto text-red-600 mb-3" size={32} />
          <h3 className="font-semibold text-gray-900 mb-2">Authenticity Guaranteed</h3>
          <p className="text-sm text-gray-600">Verified provenance and certificates of authenticity</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 text-center border border-red-200">
          <Truck className="mx-auto text-red-600 mb-3" size={32} />
          <h3 className="font-semibold text-gray-900 mb-2">White Glove Service</h3>
          <p className="text-sm text-gray-600">Specialized handling and premium delivery service</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 text-center border border-red-200">
          <BarChart3 className="mx-auto text-red-600 mb-3" size={32} />
          <h3 className="font-semibold text-gray-900 mb-2">Investment Value</h3>
          <p className="text-sm text-gray-600">Collectible spirits with appreciation potential</p>
        </div>
      </div>

      {/* Collection Selector */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {Object.entries(collections).map(([key, collection]) => {
          const IconComponent = collection.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedCollection(key)}
              className={`px-6 py-3 rounded-2xl font-medium flex items-center gap-2 transition-all duration-300 ${
                selectedCollection === key
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <IconComponent size={18} />
              {collection.name}
            </button>
          );
        })}
      </div>

      {/* Collection Description */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{collections[selectedCollection].name}</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">{collections[selectedCollection].description}</p>
      </div>

      {/* Premium Access Check */}
      {!isGold ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-red-900 border rounded-3xl p-12 text-center text-white"
        >
          <Lock className="mx-auto text-yellow-400 mb-4" size={48} />
          <h3 className="text-2xl font-bold mb-4">Premium Partnership Required</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Access our exclusive premium collections, rare finds, and luxury spirits. 
            Upgrade to Premium Partnership for white-glove service and investment-grade selections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg">
              Upgrade to Premium
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 font-semibold rounded-xl hover:bg-white/20 transition-all duration-300">
              Learn More
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Premium Drinks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentDrinks.map((drink, index) => (
              <motion.div
                key={drink.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SimpleDrinkCard 
                  drink={drink} 
                  onAddToCart={() => {}} 
                  featured={true}
                />
              </motion.div>
            ))}
          </div>
          
          {currentDrinks.length === 0 && (
            <div className="text-center py-16">
              <Crown className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Collection Coming Soon</h3>
              <p className="text-gray-600">New {collections[selectedCollection].name.toLowerCase()} arriving monthly</p>
            </div>
          )}

          {/* Premium Services */}
          <div className="bg-gradient-to-r from-gray-900 to-red-900 rounded-3xl p-8 text-white">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Premium Partnership Benefits</h3>
              <p className="text-red-200">Exclusive services for our premium collection customers</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <Users className="mx-auto text-red-300 mb-3" size={24} />
                <h4 className="font-semibold mb-1">Personal Sommelier</h4>
                <p className="text-sm text-red-200">Dedicated expert consultation</p>
              </div>
              <div className="text-center">
                <Shield className="mx-auto text-red-300 mb-3" size={24} />
                <h4 className="font-semibold mb-1">Insurance Coverage</h4>
                <p className="text-sm text-red-200">Full value protection included</p>
              </div>
              <div className="text-center">
                <Truck className="mx-auto text-red-300 mb-3" size={24} />
                <h4 className="font-semibold mb-1">Climate Controlled</h4>
                <p className="text-sm text-red-200">Temperature-controlled delivery</p>
              </div>
              <div className="text-center">
                <Award className="mx-auto text-red-300 mb-3" size={24} />
                <h4 className="font-semibold mb-1">Certificates</h4>
                <p className="text-sm text-red-200">Authenticity documentation</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Collections Footer */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-red-100 to-red-200 text-red-800 font-medium border border-red-300">
          <Sparkles size={18} className="text-red-600" /> 
          New premium collections and rare finds added monthly
        </div>
      </div>
    </div>
  );
};

export default VIPDrops;
