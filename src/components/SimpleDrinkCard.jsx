import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, MapPin, Wine
} from 'lucide-react';
import { useLoyalty } from '../context/LoyaltyContext';

const SimpleDrinkCard = ({ drink, onAddToCart, featured = false }) => {
  const { loyaltyData } = useLoyalty();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const getTierDiscount = (price) => {
    const discountRate = loyaltyData.tier.id === 'gold' ? 0.10 : 
                        loyaltyData.tier.id === 'silver' ? 0.05 : 0.02;
    return price * discountRate;
  };

  const finalPrice = drink.price - getTierDiscount(drink.price);
  const totalSavings = (drink.originalPrice || drink.price) - finalPrice;

  const handleViewDetails = () => {
    navigate(`/drink/${drink.id}`);
  };

  return (
    <motion.div
      className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 ${
        featured ? 'ring-2 ring-red-100' : ''
      }`}
      whileHover={{ y: -4 }}
      layout
    >
      {/* Image */}
      <div className="relative h-64 bg-gray-50 flex items-center justify-center">
        <img 
          src={drink.images?.[0] || '/Convivia24-images-1.jpg'} 
          alt={drink.name}
          className="w-full h-full object-contain p-4"
          onClick={handleViewDetails}
          onError={(e) => { e.currentTarget.src = '/Convivia24-images-1.jpg'; }}
        />
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{drink.brand}</div>
          <h3 
            className="text-base font-semibold text-gray-900 mt-1 line-clamp-2 hover:text-red-600 cursor-pointer"
            onClick={handleViewDetails}
          >
            {drink.name}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span>{drink.origin}</span>
          </div>
          <div className="flex items-center gap-1">
            <Wine size={12} />
            <span>{drink.volume}ml</span>
          </div>
        </div>

        <div className="pt-2">
          {drink.discount > 0 && (
            <div className="text-xs text-gray-400 line-through">{formatPrice(drink.originalPrice)}</div>
          )}
          <div className="flex items-baseline gap-2">
            <div className="text-lg font-bold text-gray-900">{formatPrice(finalPrice)}</div>
            {loyaltyData.tier.id !== 'bronze' && (
              <span className="text-[11px] text-green-600 font-medium">+{loyaltyData.tier.name}</span>
            )}
          </div>
          {totalSavings > 0 && (
            <div className="text-[11px] text-green-600">Save {formatPrice(totalSavings)}</div>
          )}
        </div>

        <motion.button 
          onClick={(e) => { e.stopPropagation(); onAddToCart(drink); }}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <ShoppingCart size={16} />
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SimpleDrinkCard;
