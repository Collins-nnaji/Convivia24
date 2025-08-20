import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Star, ShoppingCart, Heart, Crown, Sparkles,
  Minus, Plus, Truck, Shield, Clock, AlertCircle, Wine
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock product data - in real app this would come from API
  const mockProduct = {
    id: parseInt(id),
    name: "Dom Pérignon Vintage 2012",
    brand: "Moët & Chandon",
    category: "champagne",
    subcategory: "brut",
    tier: "premium",
    price: 250000,
    originalPrice: 280000,
    discount: 10,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
    ],
    rating: 4.9,
    reviewCount: 124,
    stockQuantity: 15,
    alcoholContent: 12.5,
    volume: 750,
    origin: "France",
    description: "A prestigious champagne with exceptional complexity and finesse. Dom Pérignon Vintage 2012 showcases the perfect balance of power and elegance, with notes of white flowers, citrus, and brioche. This exceptional vintage reflects the unique character of the 2012 growing season, offering a remarkable drinking experience that will continue to evolve beautifully over the next decade.",
    tastingNotes: {
      nose: "White flowers, citrus zest, and subtle brioche notes",
      palate: "Rich and complex with layers of stone fruits, honey, and minerality",
      finish: "Long and elegant with a perfect balance of acidity and richness"
    },
    foodPairings: [
      "Oysters and seafood",
      "Truffle dishes",
      "Aged cheeses",
      "Light desserts"
    ],
    awards: [
      "Wine Spectator 96 Points",
      "Decanter World Wine Awards - Gold Medal",
      "International Wine Challenge - Trophy"
    ],
    specifications: {
      vintage: "2012",
      region: "Champagne, France",
      grapeVarieties: ["Chardonnay", "Pinot Noir"],
      aging: "8+ years on lees",
      dosage: "Extra Brut",
      closure: "Cork"
    }
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProduct(mockProduct);
      setLoading(false);
    }, 1000);
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    // Show success message or notification
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Wine size={48} className="text-gray-400 mx-auto mb-4" />
          <p>Product not found</p>
        </div>
      </div>
    );
  }

  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/shopping')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft size={16} />
          Back to Premium Cellar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white/5 rounded-xl overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square w-20 bg-white/5 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-red-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand and Tier */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 uppercase">{product.brand}</span>
              {product.tier === 'premium' && (
                <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                  <Crown size={12} />
                  Premium
                </div>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                  />
                ))}
              </div>
              <span className="text-gray-400">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              {product.discount > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{formatPrice(discountedPrice)}</span>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                    -{product.discount}%
                  </span>
                </div>
              )}
              {product.discount === 0 && (
                <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                product.stockQuantity === 0 ? 'bg-red-100 text-red-800' :
                product.stockQuantity <= 10 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {product.stockQuantity === 0 ? 'Out of Stock' :
                 product.stockQuantity <= 10 ? 'Low Stock' : 'In Stock'}
              </span>
              <span className="text-gray-400 text-sm">
                {product.stockQuantity} units available
              </span>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-800">
              <div>
                <span className="text-gray-400 text-sm">Alcohol Content</span>
                <p className="font-medium">{product.alcoholContent}% ABV</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Volume</span>
                <p className="font-medium">{product.volume}ml</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Origin</span>
                <p className="font-medium">{product.origin}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Category</span>
                <p className="font-medium capitalize">{product.category}</p>
              </div>
            </div>

            {/* Add to Cart */}
            {product.stockQuantity > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-gray-400 text-sm">
                    Max: {product.stockQuantity}
                  </span>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-red-600 text-white py-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-semibold text-lg"
                >
                  <ShoppingCart size={20} />
                  Add to Cart - {formatPrice(discountedPrice * quantity)}
                </button>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="flex items-center gap-2 text-sm">
                <Truck size={16} className="text-green-400" />
                <span>24hr Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield size={16} className="text-blue-400" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle size={16} className="text-yellow-400" />
                <span>Age Verification</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-800">
            <nav className="flex space-x-8">
              {['Description', 'Tasting Notes', 'Food Pairings', 'Awards', 'Specifications'].map((tab) => (
                <button
                  key={tab}
                  className="py-4 px-1 border-b-2 border-transparent text-gray-400 hover:text-white hover:border-gray-300 transition-colors"
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-semibold mb-4">Description</h3>
              <p className="text-gray-300 leading-relaxed">{product.description}</p>
              
              <h3 className="text-xl font-semibold mb-4 mt-8">Tasting Notes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-red-400 mb-2">Nose</h4>
                  <p className="text-gray-300">{product.tastingNotes.nose}</p>
                </div>
                <div>
                  <h4 className="font-medium text-red-400 mb-2">Palate</h4>
                  <p className="text-gray-300">{product.tastingNotes.palate}</p>
                </div>
                <div>
                  <h4 className="font-medium text-red-400 mb-2">Finish</h4>
                  <p className="text-gray-300">{product.tastingNotes.finish}</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-4 mt-8">Food Pairings</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                {product.foodPairings.map((pairing, index) => (
                  <li key={index}>{pairing}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold mb-4 mt-8">Awards & Recognition</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.awards.map((award, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-yellow-400" />
                      <span className="font-medium">{award}</span>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-4 mt-8">Specifications</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="bg-white/5 p-4 rounded-lg">
                    <span className="text-gray-400 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <p className="font-medium">{Array.isArray(value) ? value.join(', ') : value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
