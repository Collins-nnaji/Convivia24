import React from 'react';
import { motion } from 'framer-motion';

const drinkImages = [
  '/DrinkPics/Absolut-1-600x900.webp',
  '/DrinkPics/Absolut-3-600x900.webp',
  '/DrinkPics/Ciroc-Vodka-600x900.webp',
  '/DrinkPics/Grey-Goose-Vodka-600x900.webp',
  '/DrinkPics/Johnnie-Walker-1-600x900.webp',
  '/DrinkPics/The-Macallan-12-Year-Old-Double-Cask-Whisky-70cl-600x900.webp',
  '/DrinkPics/Hennessy-VSOP-600x900.webp',
  '/DrinkPics/Remy-Martin-VSOP-600x900.webp',
  '/DrinkPics/Martell-3-1-600x900.webp',
  '/DrinkPics/Don-Julio-1942-Tequila-70cl-600x900.webp',
  '/DrinkPics/Glenfiddich-12-Year-Old-Whisky-5cl-600x900.webp',
  '/DrinkPics/The-Glenlivet-12-Year-Old-Whisky-70cl-600x900.webp'
];

const MarqueeRow = () => {
  const items = [...drinkImages, ...drinkImages];
  return (
    <motion.div
      className="flex gap-6"
      initial={{ x: '0%' }}
      animate={{ x: '-50%' }}
      transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
    >
      {items.map((src, idx) => (
        <div key={idx} className="h-44 w-32 rounded-xl overflow-hidden bg-white shadow">
          <img
            src={src}
            alt="drink"
            className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.src = '/Convivia24-images-1.jpg'; }}
          />
        </div>
      ))}
    </motion.div>
  );
};

const DrinksMarquee = () => {
  return (
    <div className="relative bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-6">
          <h1 className="font-stylish text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-red-700 to-gray-900 bg-clip-text text-transparent tracking-tight">
            The Premium Spirits Collection
          </h1>
          <p className="text-gray-600 mt-3">Shop authentic bottles curated for celebrations, gifting, and great nights</p>
        </div>
        <div className="overflow-hidden">
          <MarqueeRow />
        </div>
      </div>
    </div>
  );
};

export default DrinksMarquee;
