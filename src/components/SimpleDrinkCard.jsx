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

  // B2B Bulk Pricing Logic
  const isPremium = drink.price >= 150000; // Premium threshold
  const bulkMinimum = isPremium ? 6 : 36; // 6 for premium, 36 for regular
  const bulkDiscount = isPremium ? 0.15 : 0.20; // 15% premium, 20% regular
  const bulkPrice = drink.price * (1 - bulkDiscount);
  
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

        <div className="pt-2 space-y-2">
          {/* B2B Bulk Pricing */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-red-700">BULK PRICING</span>
              <span className="text-xs text-red-600">Min {bulkMinimum} bottles</span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-sm font-bold text-red-800">{formatPrice(bulkPrice)}</div>
              <span className="text-xs text-red-600">per bottle</span>
            </div>
            <div className="text-xs text-green-600 font-medium">
              Save {Math.round(bulkDiscount * 100)}% in bulk
            </div>
          </div>
          
          {/* Individual Pricing */}
          <div>
            {drink.discount > 0 && (
              <div className="text-xs text-gray-400 line-through">{formatPrice(drink.originalPrice)}</div>
            )}
            <div className="flex items-baseline gap-2">
              <div className="text-lg font-bold text-gray-900">{formatPrice(finalPrice)}</div>
              {loyaltyData.tier.id !== 'bronze' && (
                <span className="text-[11px] text-green-600 font-medium">+{loyaltyData.tier.name}</span>
              )}
            </div>
            <div className="text-xs text-gray-500">Individual bottle price</div>
            {totalSavings > 0 && (
              <div className="text-[11px] text-green-600">Save {formatPrice(totalSavings)}</div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <motion.button 
            onClick={(e) => { 
              e.stopPropagation(); 
              // Add bulk quantity to cart
              for(let i = 0; i < bulkMinimum; i++) {
                onAddToCart(drink);
              }
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingCart size={16} />
            Add Bulk ({bulkMinimum} bottles)
          </motion.button>
          
          <motion.button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(drink); }}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingCart size={14} />
            Add Single Bottle
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SimpleDrinkCard;
