import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Users, Clock, Wine, Coffee } from 'lucide-react';

const PartyCalculator = () => {
  const [guestCount, setGuestCount] = useState(50);
  const [duration, setDuration] = useState(4);
  const [includeCoffee, setIncludeCoffee] = useState(false);
  const [eventType, setEventType] = useState('cocktail');

  const calculateSupplies = () => {
    // Basic calculations based on industry standards
    const drinksPerPersonPerHour = eventType === 'cocktail' ? 2 : 1;
    const totalDrinks = guestCount * duration * drinksPerPersonPerHour;
    
    return {
      softDrinks: Math.ceil(totalDrinks * 0.3),
      alcoholicDrinks: Math.ceil(totalDrinks * 0.7),
      ice: Math.ceil(guestCount * duration * 0.5), // kg
      coffee: includeCoffee ? Math.ceil(guestCount * 0.5) : 0 // cups
    };
  };

  const supplies = calculateSupplies();

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Party Supply Calculator
            </h2>
            <p className="text-gray-600">
              Plan your celebration perfectly with our smart beverage calculator
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-gray-700 mb-2">Number of Guests</label>
                <div className="flex items-center">
                  <Users className="text-red-600 mr-2" />
                  <input
                    type="range"
                    min="10"
                    max="500"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-4 min-w-[4rem] text-gray-700">{guestCount}</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Duration (hours)</label>
                <div className="flex items-center">
                  <Clock className="text-red-600 mr-2" />
                  <input
                    type="range"
                    min="2"
                    max="12"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-4 min-w-[4rem] text-gray-700">{duration}h</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-gray-700 mb-2">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                >
                  <option value="cocktail">Cocktail Party</option>
                  <option value="dinner">Dinner Party</option>
                  <option value="wedding">Wedding Reception</option>
                  <option value="corporate">Corporate Event</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Additional Options</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeCoffee}
                    onChange={(e) => setIncludeCoffee(e.target.checked)}
                    className="mr-2"
                  />
                  <Coffee className="text-red-600 mr-2" />
                  <span>Include Coffee Service</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Calculator className="text-red-600 mr-2" />
                Recommended Supplies
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <Wine className="text-red-600 mb-2" />
                  <p className="text-sm text-gray-600">Alcoholic Drinks</p>
                  <p className="text-xl font-bold">{supplies.alcoholicDrinks}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <Wine className="text-red-600 mb-2" />
                  <p className="text-sm text-gray-600">Soft Drinks</p>
                  <p className="text-xl font-bold">{supplies.softDrinks}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <Wine className="text-red-600 mb-2" />
                  <p className="text-sm text-gray-600">Ice (kg)</p>
                  <p className="text-xl font-bold">{supplies.ice}</p>
                </div>
                {includeCoffee && (
                  <div className="bg-white p-4 rounded-lg shadow">
                    <Coffee className="text-red-600 mb-2" />
                    <p className="text-sm text-gray-600">Coffee (cups)</p>
                    <p className="text-xl font-bold">{supplies.coffee}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PartyCalculator;