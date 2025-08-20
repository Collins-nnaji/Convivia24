import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Star, ShoppingCart, Crown, Sparkles, Minus, Plus, 
  Truck, Shield, AlertCircle, Heart, Share2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import BottlePlaceholder from './BottlePlaceholder';

const ProductModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  if (!product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'tasting', label: 'Tasting Notes' },
    { id: 'specs', label: 'Specifications' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with key details */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100 gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 uppercase font-medium truncate">{product.brand}</span>
                  {product.tier === 'premium' && (
                    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-[10px] font-semibold">
                      <Crown size={12} /> Premium
                    </div>
                  )}
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{product.name}</h1>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400 fill-current" /> {product.rating} ({product.reviewCount})</span>
                  <span>•</span>
                  <span>{product.alcoholContent}% ABV</span>
                  <span>•</span>
                  <span>{product.volume}ml</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  {product.discount > 0 ? (
                    <>
                      <div className="text-xs text-gray-400 line-through">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(product.originalPrice)}</div>
                      <div className="text-lg font-extrabold text-gray-900">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(discountedPrice)}</div>
                    </>
                  ) : (
                    <div className="text-lg font-extrabold text-gray-900">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(product.price)}</div>
                  )}
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Heart size={18} className="text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Share2 size={18} className="text-gray-400" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)] overflow-hidden">
              {/* Product Visual */}
              <div className="lg:w-1/2 p-6">
                <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                  <BottlePlaceholder category={product.category} tier={product.tier} size={140} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[0,1,2].map((i) => (
                    <div key={i} className={`aspect-square bg-gray-50 rounded-lg border ${i === 0 ? 'border-red-500' : 'border-transparent'} flex items-center justify-center`}>
                      <BottlePlaceholder category={product.category} tier={product.tier} size={40} />
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-white rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>
                </div>
              </div>

              {/* Product Info */}
              <div className="lg:w-1/2 p-6 flex flex-col">
                {/* Product Name */}
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h2>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm">({product.reviewCount} reviews)</span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {product.discount > 0 ? (
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-gray-900">{formatPrice(discountedPrice)}</span>
                      <span className="text-xl text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        -{product.discount}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-4 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.stockQuantity === 0 ? 'bg-red-100 text-red-700' :
                    product.stockQuantity <= 10 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {product.stockQuantity === 0 ? 'Out of Stock' :
                     product.stockQuantity <= 10 ? 'Low Stock' : 'In Stock'}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {product.stockQuantity} units available
                  </span>
                </div>

                {/* Product Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <span className="text-gray-500 text-sm">Alcohol Content</span>
                    <p className="font-semibold text-gray-900">{product.alcoholContent}% ABV</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Volume</span>
                    <p className="font-semibold text-gray-900">{product.volume}ml</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Origin</span>
                    <p className="font-semibold text-gray-900">{product.origin}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Category</span>
                    <p className="font-semibold text-gray-900 capitalize">{product.category}</p>
                  </div>
                </div>

                {/* Add to Cart */}
                {product.stockQuantity > 0 && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                        <button
                          onClick={() => handleQuantityChange(quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-semibold">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <span className="text-gray-500 text-sm">
                        Max: {product.stockQuantity}
                      </span>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-red-600 text-white py-4 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-semibold text-lg"
                    >
                      <ShoppingCart size={20} />
                      Add to Cart - {formatPrice(discountedPrice * quantity)}
                    </button>
                  </div>
                )}

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck size={16} className="text-green-500" />
                    <span>24hr Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield size={16} className="text-blue-500" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle size={16} className="text-yellow-500" />
                    <span>Age Verification</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Tabs */}
            <div className="border-t border-gray-100">
              <div className="flex border-b border-gray-100">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-red-600 border-b-2 border-red-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 max-h-48 overflow-y-auto">
                {activeTab === 'description' && (
                  <div className="text-gray-700 leading-relaxed">
                    {product.description}
                  </div>
                )}

                {activeTab === 'tasting' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Nose</h4>
                      <p className="text-gray-700">{product.tastingNotes?.nose || 'Aromatic notes with subtle complexity.'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Palate</h4>
                      <p className="text-gray-700">{product.tastingNotes?.palate || 'Rich and balanced with excellent structure.'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Finish</h4>
                      <p className="text-gray-700">{product.tastingNotes?.finish || 'Long and elegant with lingering notes.'}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 text-sm">Vintage</span>
                      <p className="font-semibold text-gray-900">{product.specifications?.vintage || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Region</span>
                      <p className="font-semibold text-gray-900">{product.specifications?.region || product.origin}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Grape Varieties</span>
                      <p className="font-semibold text-gray-900">
                        {Array.isArray(product.specifications?.grapeVarieties) 
                          ? product.specifications.grapeVarieties.join(', ') 
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Aging</span>
                      <p className="font-semibold text-gray-900">{product.specifications?.aging || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
