import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wine, Filter, Search, Star, ShoppingCart, Heart, 
  ChevronDown, ChevronUp, Minus, Plus, Crown, Sparkles,
  MapPin, Clock, Truck, Shield, CheckCircle, Eye, Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductModal from '../components/ProductModal';
import Notification from '../components/Notification';
import BottlePlaceholder from '../components/BottlePlaceholder';

const Shopping = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'bundles'
  const { addToCart } = useCart();

  const categories = [
    { id: 'all', name: 'All Products', icon: <Wine size={20} /> },
    { id: 'champagne', name: 'Champagne & Sparkling', icon: <Sparkles size={20} /> },
    { id: 'wine', name: 'Still Wines', icon: <Wine size={20} /> },
    { id: 'spirits', name: 'Spirits', icon: <Wine size={20} /> }
  ];

  const tiers = [
    { id: 'all', name: 'All Tiers', icon: <Wine size={20} /> },
    { id: 'premium', name: 'Premium', icon: <Crown size={20} /> },
    { id: 'mainstream', name: 'Mainstream', icon: <Wine size={20} /> }
  ];

  // Bundles data
  const bundles = [
    {
      id: 'party-starter',
      name: 'Party Starter Pack',
      description: 'Vodka, gin, mixers and cups for 10-12 people.',
      items: [
        { category: 'spirits', tier: 'premium' },
        { category: 'spirits', tier: 'premium' },
        { category: 'spirits', tier: 'mainstream' }
      ],
      price: 120000,
      originalPrice: 150000,
      discount: 20
    },
    {
      id: 'romantic-dinner',
      name: 'Romantic Dinner Wine Set',
      description: 'Champagne + still wine pairing for two.',
      items: [
        { category: 'champagne', tier: 'premium' },
        { category: 'wine', tier: 'premium' }
      ],
      price: 180000,
      originalPrice: 220000,
      discount: 18
    },
    {
      id: 'whiskey-collection',
      name: 'Premium Whiskey Collection',
      description: 'Three exceptional whiskeys for the connoisseur.',
      items: [
        { category: 'spirits', tier: 'premium' },
        { category: 'spirits', tier: 'premium' },
        { category: 'spirits', tier: 'premium' }
      ],
      price: 350000,
      originalPrice: 420000,
      discount: 17
    },
    {
      id: 'champagne-celebration',
      name: 'Champagne Celebration Set',
      description: 'Perfect for special occasions and celebrations.',
      items: [
        { category: 'champagne', tier: 'premium' },
        { category: 'champagne', tier: 'premium' }
      ],
      price: 280000,
      originalPrice: 320000,
      discount: 12
    }
  ];

  // Comprehensive product catalog with premium brands
  const mockProducts = [
    // 🍷 Champagne & Sparkling
    {
      id: 1,
      name: "Dom Pérignon Vintage 2012",
      brand: "Moët & Chandon",
      category: "champagne",
      subcategory: "brut",
      tier: "premium",
      price: 250000,
      originalPrice: 280000,
      discount: 10,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.9,
      reviewCount: 124,
      stockQuantity: 15,
      alcoholContent: 12.5,
      volume: 750,
      origin: "France",
      description: "A prestigious champagne with exceptional complexity and finesse."
    },
    {
      id: 2,
      name: "Perrier-Jouët Belle Epoque",
      brand: "Perrier-Jouët",
      category: "champagne",
      subcategory: "brut",
      tier: "premium",
      price: 180000,
      originalPrice: 200000,
      discount: 10,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.8,
      reviewCount: 89,
      stockQuantity: 12,
      alcoholContent: 12,
      volume: 750,
      origin: "France",
      description: "Elegant champagne with floral notes and exceptional craftsmanship."
    },
    {
      id: 3,
      name: "Veuve Clicquot Yellow Label",
      brand: "Veuve Clicquot",
      category: "champagne",
      subcategory: "brut",
      tier: "premium",
      price: 120000,
      originalPrice: 120000,
      discount: 0,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.7,
      reviewCount: 156,
      stockQuantity: 25,
      alcoholContent: 12,
      volume: 750,
      origin: "France",
      description: "Iconic champagne with rich, full-bodied character."
    },
    {
      id: 4,
      name: "Nyetimber Classic Cuvée",
      brand: "Nyetimber",
      category: "champagne",
      subcategory: "brut",
      tier: "premium",
      price: 95000,
      originalPrice: 110000,
      discount: 14,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.6,
      reviewCount: 67,
      stockQuantity: 18,
      alcoholContent: 12,
      volume: 750,
      origin: "England",
      description: "Award-winning English sparkling wine with exceptional quality."
    },

    // 🍷 Still Wines
    {
      id: 5,
      name: "Château d'Yquem Sauternes",
      brand: "Château d'Yquem",
      category: "wine",
      subcategory: "dessert",
      tier: "premium",
      price: 450000,
      originalPrice: 500000,
      discount: 10,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 5.0,
      reviewCount: 45,
      stockQuantity: 5,
      alcoholContent: 14,
      volume: 750,
      origin: "France",
      description: "The world's most prestigious dessert wine with unparalleled complexity."
    },
    {
      id: 6,
      name: "Cloudy Bay Sauvignon Blanc",
      brand: "Cloudy Bay",
      category: "wine",
      subcategory: "white",
      tier: "premium",
      price: 85000,
      originalPrice: 85000,
      discount: 0,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.8,
      reviewCount: 234,
      stockQuantity: 30,
      alcoholContent: 13.5,
      volume: 750,
      origin: "New Zealand",
      description: "Iconic New Zealand Sauvignon Blanc with vibrant tropical notes."
    },
    {
      id: 7,
      name: "Campo Viejo Reserva",
      brand: "Campo Viejo",
      category: "wine",
      subcategory: "red",
      tier: "mainstream",
      price: 35000,
      originalPrice: 40000,
      discount: 12,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.4,
      reviewCount: 189,
      stockQuantity: 45,
      alcoholContent: 13.5,
      volume: 750,
      origin: "Spain",
      description: "Rich and smooth Rioja with notes of vanilla and oak."
    },

    // 🥃 Scotch Whisky
    {
      id: 8,
      name: "The Macallan 18 Years",
      brand: "The Macallan",
      category: "spirits",
      subcategory: "whiskey",
      tier: "premium",
      price: 850000,
      originalPrice: 950000,
      discount: 11,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.9,
      reviewCount: 78,
      stockQuantity: 8,
      alcoholContent: 43,
      volume: 750,
      origin: "Scotland",
      description: "Exceptional single malt with rich sherry oak influence."
    },
    {
      id: 9,
      name: "Glenlivet 15 Years",
      brand: "Glenlivet",
      category: "spirits",
      subcategory: "whiskey",
      tier: "premium",
      price: 180000,
      originalPrice: 200000,
      discount: 10,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.7,
      reviewCount: 156,
      stockQuantity: 20,
      alcoholContent: 40,
      volume: 750,
      origin: "Scotland",
      description: "Smooth and complex single malt with notes of fruit and spice."
    },
    {
      id: 10,
      name: "Johnnie Walker Blue Label",
      brand: "Johnnie Walker",
      category: "spirits",
      subcategory: "whiskey",
      tier: "premium",
      price: 450000,
      originalPrice: 500000,
      discount: 10,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.8,
      reviewCount: 92,
      stockQuantity: 12,
      alcoholContent: 40,
      volume: 750,
      origin: "Scotland",
      description: "Ultra-premium blended Scotch with exceptional smoothness."
    },
    {
      id: 11,
      name: "Lagavulin 16 Years",
      brand: "Lagavulin",
      category: "spirits",
      subcategory: "whiskey",
      tier: "premium",
      price: 120000,
      originalPrice: 140000,
      discount: 14,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.6,
      reviewCount: 134,
      stockQuantity: 15,
      alcoholContent: 43,
      volume: 750,
      origin: "Scotland",
      description: "Intensely peated Islay single malt with maritime character."
    },

    // 🥃 Irish Whiskey
    {
      id: 12,
      name: "Jameson 18 Years",
      brand: "Jameson",
      category: "spirits",
      subcategory: "whiskey",
      tier: "premium",
      price: 150000,
      originalPrice: 170000,
      discount: 12,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.7,
      reviewCount: 89,
      stockQuantity: 18,
      alcoholContent: 40,
      volume: 750,
      origin: "Ireland",
      description: "Smooth and complex Irish whiskey with rich oak notes."
    },
    {
      id: 13,
      name: "Redbreast 21 Years",
      brand: "Redbreast",
      category: "spirits",
      subcategory: "whiskey",
      tier: "premium",
      price: 280000,
      originalPrice: 300000,
      discount: 7,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.9,
      reviewCount: 67,
      stockQuantity: 10,
      alcoholContent: 46,
      volume: 750,
      origin: "Ireland",
      description: "Exceptional single pot still Irish whiskey with incredible depth."
    },

    // 🥃 American & Bourbon
    {
      id: 14,
      name: "Woodford Reserve",
      brand: "Woodford Reserve",
      category: "spirits",
      subcategory: "whiskey",
      tier: "premium",
      price: 85000,
      originalPrice: 95000,
      discount: 11,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.6,
      reviewCount: 234,
      stockQuantity: 25,
      alcoholContent: 43.2,
      volume: 750,
      origin: "USA",
      description: "Premium Kentucky straight bourbon with rich, complex flavors."
    },
    {
      id: 15,
      name: "Bulleit Bourbon",
      brand: "Bulleit",
      category: "spirits",
      subcategory: "whiskey",
      tier: "mainstream",
      price: 45000,
      originalPrice: 50000,
      discount: 10,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.4,
      reviewCount: 189,
      stockQuantity: 35,
      alcoholContent: 45,
      volume: 750,
      origin: "USA",
      description: "High-rye bourbon with a bold, spicy character."
    },

    // 🥃 Japanese Whisky
    {
      id: 16,
      name: "Hibiki 21 Years",
      brand: "Hibiki",
      category: "spirits",
      subcategory: "whiskey",
      tier: "premium",
      price: 1200000,
      originalPrice: 1400000,
      discount: 14,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 5.0,
      reviewCount: 34,
      stockQuantity: 3,
      alcoholContent: 43,
      volume: 750,
      origin: "Japan",
      description: "Ultra-premium Japanese blended whisky with exceptional harmony."
    },
    {
      id: 17,
      name: "Yamazaki 12 Years",
      brand: "Yamazaki",
      category: "spirits",
      subcategory: "whiskey",
      tier: "premium",
      price: 280000,
      originalPrice: 320000,
      discount: 12,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.8,
      reviewCount: 156,
      stockQuantity: 12,
      alcoholContent: 43,
      volume: 750,
      origin: "Japan",
      description: "Smooth and elegant single malt with subtle fruit notes."
    },

    // 🍸 Vodka & Gin
    {
      id: 18,
      name: "Grey Goose Vodka",
      brand: "Grey Goose",
      category: "spirits",
      subcategory: "vodka",
      tier: "premium",
      price: 45000,
      originalPrice: 45000,
      discount: 0,
      images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"],
      rating: 4.6,
      reviewCount: 89,
      stockQuantity: 25,
      alcoholContent: 40,
      volume: 750,
      origin: "France",
      description: "Premium French vodka crafted from the finest ingredients."
    },
    {
      id: 19,
      name: "Belvedere Vodka",
      brand: "Belvedere",
      category: "spirits",
      subcategory: "vodka",
      tier: "premium",
      price: 55000,
      originalPrice: 60000,
      discount: 8,
      images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"],
      rating: 4.7,
      reviewCount: 134,
      stockQuantity: 20,
      alcoholContent: 40,
      volume: 750,
      origin: "Poland",
      description: "Premium Polish vodka with exceptional smoothness and purity."
    },
    {
      id: 20,
      name: "Monkey 47 Gin",
      brand: "Monkey 47",
      category: "spirits",
      subcategory: "gin",
      tier: "premium",
      price: 85000,
      originalPrice: 95000,
      discount: 11,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.8,
      reviewCount: 78,
      stockQuantity: 15,
      alcoholContent: 47,
      volume: 500,
      origin: "Germany",
      description: "Complex craft gin with 47 botanicals and exceptional character."
    },
    {
      id: 21,
      name: "Tanqueray No. Ten",
      brand: "Tanqueray",
      category: "spirits",
      subcategory: "gin",
      tier: "premium",
      price: 65000,
      originalPrice: 70000,
      discount: 7,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.6,
      reviewCount: 189,
      stockQuantity: 22,
      alcoholContent: 47.3,
      volume: 750,
      origin: "UK",
      description: "Premium gin with fresh citrus notes and exceptional smoothness."
    },

    // 🥂 Tequila & Mezcal
    {
      id: 22,
      name: "Don Julio 1942",
      brand: "Don Julio",
      category: "spirits",
      subcategory: "tequila",
      tier: "premium",
      price: 180000,
      originalPrice: 200000,
      discount: 10,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.8,
      reviewCount: 92,
      stockQuantity: 12,
      alcoholContent: 40,
      volume: 750,
      origin: "Mexico",
      description: "Ultra-premium añejo tequila with exceptional complexity and smoothness."
    },
    {
      id: 23,
      name: "Patrón Silver",
      brand: "Patrón",
      category: "spirits",
      subcategory: "tequila",
      tier: "premium",
      price: 95000,
      originalPrice: 110000,
      discount: 14,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.7,
      reviewCount: 156,
      stockQuantity: 18,
      alcoholContent: 40,
      volume: 750,
      origin: "Mexico",
      description: "Premium silver tequila with exceptional smoothness and purity."
    },

    // 🥃 Cognac & Brandy
    {
      id: 24,
      name: "Hennessy XO",
      brand: "Hennessy",
      category: "spirits",
      subcategory: "cognac",
      tier: "premium",
      price: 280000,
      originalPrice: 320000,
      discount: 12,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.9,
      reviewCount: 134,
      stockQuantity: 15,
      alcoholContent: 40,
      volume: 750,
      origin: "France",
      description: "Exceptional cognac with rich, complex flavors and exceptional smoothness."
    },
    {
      id: 25,
      name: "Rémy Martin XO",
      brand: "Rémy Martin",
      category: "spirits",
      subcategory: "cognac",
      tier: "premium",
      price: 320000,
      originalPrice: 350000,
      discount: 9,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.8,
      reviewCount: 89,
      stockQuantity: 12,
      alcoholContent: 40,
      volume: 750,
      origin: "France",
      description: "Premium cognac with exceptional depth and complexity."
    },

    // 🍹 Liqueurs & Aperitifs
    {
      id: 26,
      name: "Cointreau",
      brand: "Cointreau",
      category: "spirits",
      subcategory: "liqueur",
      tier: "premium",
      price: 45000,
      originalPrice: 50000,
      discount: 10,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.6,
      reviewCount: 234,
      stockQuantity: 30,
      alcoholContent: 40,
      volume: 750,
      origin: "France",
      description: "Premium orange liqueur with exceptional balance and complexity."
    },
    {
      id: 27,
      name: "Aperol",
      brand: "Aperol",
      category: "spirits",
      subcategory: "aperitif",
      tier: "mainstream",
      price: 25000,
      originalPrice: 30000,
      discount: 17,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      rating: 4.4,
      reviewCount: 189,
      stockQuantity: 40,
      alcoholContent: 11,
      volume: 750,
      origin: "Italy",
      description: "Refreshing Italian aperitif with bitter orange and herbal notes."
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesTier = selectedTier === 'all' || product.tier === selectedTier;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesTier && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });



  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const ProductCard = ({ product }) => {
    const discountedPrice = product.discount > 0 
      ? product.price * (1 - product.discount / 100) 
      : product.price;

    const handleViewDetails = (e) => {
      e.stopPropagation();
      setSelectedProduct(product);
      setIsModalOpen(true);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
      >
        <div className="relative bg-gradient-to-br from-gray-50 to-white">
          <div className="w-full h-48 flex items-center justify-center">
            <BottlePlaceholder category={product.category} tier={product.tier} size={84} />
          </div>
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              -{product.discount}%
            </div>
          )}
          {product.tier === 'premium' && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Crown size={12} />
              Premium
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col">
            <div className="flex-1 flex items-center justify-center gap-4">
              <button 
                onClick={handleViewDetails}
                className="bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              >
                <Eye size={20} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                  setNotification({ 
                    show: true, 
                    message: `${product.name} added to cart!` 
                  });
                  setTimeout(() => setNotification({ show: false, message: '' }), 3000);
                }}
                className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors shadow-lg"
              >
                <ShoppingCart size={20} />
              </button>
            </div>
            <div className="bg-white/95 text-gray-900 p-3 m-3 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold truncate mr-2">{product.name}</h4>
                <span className="text-sm font-bold">{formatPrice(discountedPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="truncate">{product.brand}</span>
                <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400 fill-current" /> {product.rating}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 uppercase font-medium">{product.brand}</span>
            {product.tier === 'premium' && (
              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                <Crown size={12} />
                Premium
              </div>
            )}
          </div>
          
          <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight">{product.name}</h3>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-900">{product.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({product.reviewCount})</span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              {product.discount > 0 && (
                <span className="text-sm text-gray-400 line-through mr-2">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="font-bold text-xl text-gray-900">
                {formatPrice(discountedPrice)}
              </span>
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{product.volume}ml</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{product.alcoholContent}% ABV</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              product.stockQuantity === 0 ? 'bg-red-100 text-red-700' :
              product.stockQuantity <= 10 ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {product.stockQuantity === 0 ? 'Out of Stock' :
               product.stockQuantity <= 10 ? 'Low Stock' : 'In Stock'}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Hero Section */}
      <div className="relative py-12 bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Premium Cellar
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-red-100 max-w-2xl mb-6"
          >
            Curated collection of the world's finest wines and spirits with 24-hour delivery
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-xl"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search Dom Pérignon, Macallan, Hennessy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full py-3 px-6 pl-12 text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-200" size={20} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                activeTab === 'products' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Wine size={16} />
              Individual Products
            </button>
            <button
              onClick={() => setActiveTab('bundles')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                activeTab === 'bundles' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Gift size={16} />
              Curated Bundles
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Filters and Categories */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      <Filter size={16} />
                      Filters
                      {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                    >
                      <option value="newest">Newest</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium ${
                        selectedCategory === category.id
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.icon}
                      {category.name}
                    </button>
                  ))}
                </div>

                {/* Tier Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {tiers.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium ${
                        selectedTier === tier.id
                          ? 'bg-yellow-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tier.icon}
                      {tier.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Brands Section */}
              <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Featured Premium Brands</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                  {['Dom Pérignon', 'The Macallan', 'Hennessy', 'Grey Goose', 'Hibiki', 'Château d\'Yquem'].map((brand, index) => (
                    <motion.div
                      key={brand}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100"
                      onClick={() => setSearchTerm(brand)}
                    >
                      <div className="text-lg font-semibold text-gray-900 mb-2">{brand}</div>
                      <div className="text-xs text-gray-500">Premium Selection</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {sortedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </AnimatePresence>
                </div>

                {sortedProducts.length === 0 && (
                  <div className="text-center py-12">
                    <Wine size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No products found matching your criteria.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'bundles' && (
            <motion.div
              key="bundles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Bundles Header */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="text-red-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">Curated Bundles</h2>
                </div>
                <p className="text-gray-600">Perfect combinations for every occasion. Save up to 20% when you buy our expertly curated bundles.</p>
              </div>

              {/* Bundles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bundles.map((bundle, index) => (
                  <motion.div 
                    key={bundle.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-shadow"
                  >
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {bundle.items.map((item, idx) => (
                        <div key={idx} className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center">
                          <BottlePlaceholder category={item.category} tier={item.tier} size={60} />
                        </div>
                      ))}
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{bundle.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{bundle.description}</p>
                      
                      {bundle.discount > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-gray-400 line-through">{formatPrice(bundle.originalPrice)}</span>
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                            -{bundle.discount}% OFF
                          </span>
                        </div>
                      )}
                      
                      <div className="text-2xl font-bold text-gray-900">{formatPrice(bundle.price)}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                        <Heart size={16} className="text-gray-600" />
                      </button>
                      <button 
                        onClick={() => {
                          addToCart({ 
                            id: `bundle-${bundle.id}`, 
                            name: bundle.name, 
                            brand: 'Convivia24', 
                            price: bundle.price, 
                            images: [''], 
                            category: 'bundle', 
                            tier: 'premium' 
                          });
                          setNotification({ 
                            show: true, 
                            message: `${bundle.name} added to cart!` 
                          });
                          setTimeout(() => setNotification({ show: false, message: '' }), 3000);
                        }}
                        className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-2 transition-colors"
                      >
                        <ShoppingCart size={16} /> 
                        Add Bundle
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Modal */}
      <ProductModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }} 
      />

      {/* Notification */}
      <Notification
        message={notification.message}
        isVisible={notification.show}
        onClose={() => setNotification({ show: false, message: '' })}
        type="success"
      />
    </div>
  );
};

export default Shopping;
