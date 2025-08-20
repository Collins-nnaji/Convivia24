const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [200, 'Name cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['wine', 'spirits', 'beer', 'champagne', 'cocktails', 'mixers'],
    default: 'wine'
  },
  subcategory: {
    type: String,
    required: [true, 'Please add a subcategory'],
    enum: {
      wine: ['red', 'white', 'rose', 'sparkling', 'dessert', 'fortified'],
      spirits: ['vodka', 'whiskey', 'rum', 'gin', 'tequila', 'brandy', 'cognac', 'liqueur'],
      beer: ['lager', 'ale', 'stout', 'ipa', 'wheat', 'craft'],
      champagne: ['brut', 'extra-brut', 'sec', 'demi-sec', 'rose'],
      cocktails: ['pre-mixed', 'syrups', 'bitters'],
      mixers: ['tonic', 'soda', 'juice', 'soda']
    }
  },
  tier: {
    type: String,
    required: [true, 'Please add a tier'],
    enum: ['premium', 'mainstream'],
    default: 'mainstream'
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  images: [{
    type: String,
    required: [true, 'Please add at least one image']
  }],
  brand: {
    type: String,
    required: [true, 'Please add a brand'],
    trim: true
  },
  origin: {
    type: String,
    trim: true
  },
  alcoholContent: {
    type: Number,
    min: [0, 'Alcohol content cannot be negative'],
    max: [100, 'Alcohol content cannot exceed 100%']
  },
  volume: {
    type: Number,
    required: [true, 'Please add volume in ml'],
    min: [0, 'Volume cannot be negative']
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },
  minOrderQuantity: {
    type: Number,
    min: [1, 'Minimum order quantity must be at least 1'],
    default: 1
  },
  maxOrderQuantity: {
    type: Number,
    min: [1, 'Maximum order quantity must be at least 1'],
    default: 100
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0
  },
  reviewCount: {
    type: Number,
    min: [0, 'Review count cannot be negative'],
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for discounted price
ProductSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function() {
  if (this.stockQuantity === 0) return 'out-of-stock';
  if (this.stockQuantity <= 10) return 'low-stock';
  return 'in-stock';
});

module.exports = mongoose.model('Product', ProductSchema);
