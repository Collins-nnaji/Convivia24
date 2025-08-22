import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Star, ShoppingCart, Crown, Sparkles, Minus, Plus, 
  Truck, Shield, AlertCircle, Heart, Share2, Users, Clock, Gift, CheckCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import BottlePlaceholder from './BottlePlaceholder';

const BundleModal = ({ bundle, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!bundle) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart({ 
      id: `bundle-${bundle.id}`, 
      name: bundle.name, 
      brand: 'Convivia24', 
      price: bundle.price, 
      images: [''], 
      category: 'bundle', 
      tier: 'premium',
      quantity 
    });
    onClose();
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gift className="text-red-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">{bundle.name}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Bundle Preview */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {bundle.items.map((item, idx) => (
                  <div key={idx} className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center">
                    <BottlePlaceholder category={item.category} tier={item.tier} size={60} />
                  </div>
                ))}
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6">{bundle.description}</p>

              {/* Bundle Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="text-gray-500" size={16} />
                    <span className="text-sm text-gray-600">Party Size: <strong>{bundle.partySize}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="text-gray-500" size={16} />
                    <span className="text-sm text-gray-600">Delivery: <strong>{bundle.delivery}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-gray-500" size={16} />
                    <span className="text-sm text-gray-600">Preparation: <strong>Ready to serve</strong></span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="text-gray-500" size={16} />
                    <span className="text-sm text-gray-600">Age Verified: <strong>Required</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="text-gray-500" size={16} />
                    <span className="text-sm text-gray-600">Tier: <strong>Premium</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="text-gray-500" size={16} />
                    <span className="text-sm text-gray-600">Digital Extras: <strong>Included</strong></span>
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">What's Included:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {bundle.includes.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={16} />
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  {bundle.discount > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-gray-400 line-through">{formatPrice(bundle.originalPrice)}</span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-semibold">
                        -{bundle.discount}% OFF
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-gray-900">{formatPrice(bundle.price)}</div>
                <p className="text-sm text-gray-600 mt-1">Perfect for {bundle.partySize}</p>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors"
                >
                  <ShoppingCart size={16} />
                  Add Bundle ({quantity})
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BundleModal;
