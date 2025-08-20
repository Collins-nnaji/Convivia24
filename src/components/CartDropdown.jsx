import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Minus, Plus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import BottlePlaceholder from './BottlePlaceholder';

const CartDropdown = () => {
  const { 
    items, 
    isCartVisible, 
    setCartVisible, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal, 
    getCartItemCount 
  } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const handleCheckout = () => {
    setCartVisible(false);
    navigate('/checkout');
  };

  if (!isCartVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Shopping Cart</h3>
          <button
            onClick={() => setCartVisible(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="max-h-64 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-center">
              <ShoppingCart size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Your cart is empty</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <BottlePlaceholder category={item.category} tier={item.tier} size={30} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">{item.name}</h4>
                    <p className="text-xs text-gray-500">{item.brand}</p>
                    <p className="font-semibold text-sm">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-bold text-lg">{formatPrice(getCartTotal())}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-semibold"
            >
              Checkout
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/shopping')}
              className="w-full mt-2 text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CartDropdown;
