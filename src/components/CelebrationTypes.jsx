import React from 'react';
import { motion } from 'framer-motion';
import { 
  GlassWater, 
  PartyPopper, 
  Gift, 
  Music, 

  Crown,
  Calendar 
} from 'lucide-react';

const CelebrationTypes = () => {
  const celebrations = [
    {
      icon: <Crown size={32} className="text-red-600" />,
      title: "Traditional Ceremonies",
      description: "Custom packages for traditional weddings and cultural celebrations",
      features: ["Cultural drink selections", "Ceremony-specific arrangements", "Traditional servers"]
    },
    {
      icon: <PartyPopper size={32} className="text-red-600" />,
      title: "Corporate Events",
      description: "Sophisticated beverage services for corporate gatherings",
      features: ["Premium drink selection", "Professional service staff", "Branded experiences"]
    },
    {
      icon: <Gift size={32} className="text-red-600" />,
      title: "Private Celebrations",
      description: "Personalized packages for birthdays and special moments",
      features: ["Custom cocktail menus", "Party size planning", "Theme-based selections"]
    },
    {
      icon: <Music size={32} className="text-red-600" />,
      title: "Festival & Concerts",
      description: "Large-scale beverage management for entertainment events",
      features: ["High-volume capability", "Multiple service points", "Quick-serve solutions"]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Your Celebration Partner
        </h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          From intimate gatherings to grand celebrations, we provide tailored beverage solutions for every occasion
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {celebrations.map((celebration, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  {celebration.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{celebration.title}</h3>
                <p className="text-gray-600 mb-4">{celebration.description}</p>
                <ul className="space-y-2">
                  {celebration.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-sm text-gray-500">
                      <GlassWater size={16} className="mr-2 text-red-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button className="text-red-600 font-semibold flex items-center hover:text-red-700 transition-colors">
                  Learn More
                  <Calendar size={16} className="ml-2" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CelebrationTypes;