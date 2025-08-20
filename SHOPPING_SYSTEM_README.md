# Wine & Spirits Shopping System

A comprehensive e-commerce platform for wine and spirits with advanced inventory management, built for Convivia24.

## Features

### 🛍️ Shopping Experience
- **Product Categories**: Wine, Spirits, Champagne, Beer, Cocktails, Mixers
- **Tier System**: Premium and Mainstream product tiers
- **Advanced Filtering**: By category, subcategory, tier, price range, and search
- **Shopping Cart**: Persistent cart with local storage
- **Checkout Process**: Multi-step checkout with shipping and payment options
- **Stock Management**: Real-time stock tracking and low stock alerts

### 🏪 Product Management
- **Product Catalog**: Comprehensive product database with images, descriptions, and specifications
- **Inventory Tracking**: Real-time stock quantity management
- **Pricing**: Support for discounts, original prices, and tier-based pricing
- **Product Details**: Alcohol content, volume, origin, brand information
- **Ratings & Reviews**: Product rating system with review counts

### 📦 Order Management
- **Order Processing**: Complete order lifecycle from creation to delivery
- **Status Tracking**: Pending, confirmed, processing, shipped, delivered, cancelled
- **Payment Methods**: Card, bank transfer, mobile money, cash on delivery
- **Shipping**: Address management with delivery instructions
- **Order History**: User order tracking and management

### 🔧 Admin Dashboard
- **Overview**: Key metrics and statistics
- **Product Management**: Add, edit, delete products
- **Inventory Control**: Stock updates and alerts
- **Order Management**: View and update order statuses
- **Analytics**: Sales and inventory reports

## Backend Architecture

### Database Models

#### Product Model
```javascript
{
  name: String,
  description: String,
  category: String, // wine, spirits, beer, champagne, cocktails, mixers
  subcategory: String, // red, white, vodka, whiskey, etc.
  tier: String, // premium, mainstream
  price: Number,
  originalPrice: Number,
  discount: Number,
  images: [String],
  brand: String,
  origin: String,
  alcoholContent: Number,
  volume: Number,
  stockQuantity: Number,
  minOrderQuantity: Number,
  maxOrderQuantity: Number,
  isAvailable: Boolean,
  isFeatured: Boolean,
  tags: [String],
  rating: Number,
  reviewCount: Number
}
```

#### Order Model
```javascript
{
  user: ObjectId,
  items: [{
    product: ObjectId,
    quantity: Number,
    price: Number,
    totalPrice: Number
  }],
  subtotal: Number,
  tax: Number,
  shipping: Number,
  total: Number,
  status: String, // pending, confirmed, processing, shipped, delivered, cancelled
  paymentStatus: String, // pending, paid, failed, refunded
  paymentMethod: String, // card, bank_transfer, cash_on_delivery, mobile_money
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  deliveryInstructions: String,
  estimatedDelivery: Date,
  actualDelivery: Date
}
```

### API Endpoints

#### Products
- `GET /api/products` - Get all products with filters
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured` - Get featured products
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `PATCH /api/products/:id/stock` - Update stock (Admin)

#### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/admin/all` - Get all orders (Admin)
- `PATCH /api/orders/:id/status` - Update order status (Admin)

## Frontend Components

### Pages
- **Shopping Page** (`/shopping`): Main product catalog with filtering and cart
- **Checkout Page** (`/checkout`): Multi-step checkout process
- **Admin Dashboard** (`/admin`): Product and order management

### Key Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Animations**: Smooth transitions with Framer Motion
- **Real-time Updates**: Stock levels and cart synchronization
- **Search & Filter**: Advanced product discovery
- **Shopping Cart**: Persistent cart with quantity management

## Stock Management System

### Features
- **Real-time Tracking**: Stock quantities updated automatically
- **Low Stock Alerts**: Notifications when stock is running low
- **Out of Stock Handling**: Products marked as unavailable
- **Minimum/Maximum Order Quantities**: Configurable limits per product
- **Stock Operations**: Add, remove, or set stock quantities

### Stock Status
- **In Stock**: Normal availability
- **Low Stock**: ≤ 10 items remaining
- **Out of Stock**: 0 items available

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd server
npm install
npm start
```

### Frontend Setup
```bash
npm install
npm start
```

### Environment Variables
Create a `.env` file in the server directory:
```env
MONGODB_URI=mongodb://localhost:27017/convivia24
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Usage

### For Customers
1. Browse products by category or search
2. Filter by tier (Premium/Mainstream)
3. Add items to cart
4. Complete checkout process
5. Track order status

### For Admins
1. Access admin dashboard at `/admin`
2. Manage products and inventory
3. Process orders and update statuses
4. Monitor stock levels and sales

## Security Features

- **Age Verification**: Required for alcohol purchases
- **Authentication**: JWT-based user authentication
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Secure error responses

## Payment Integration

The system supports multiple payment methods:
- Credit/Debit Cards
- Bank Transfers
- Mobile Money
- Cash on Delivery

## Delivery System

- **24-hour Delivery**: Fast delivery promise
- **Free Shipping**: On orders over ₦50,000
- **Address Management**: Complete shipping address system
- **Delivery Instructions**: Custom delivery notes
- **Order Tracking**: Real-time order status updates

## Future Enhancements

- **Payment Gateway Integration**: Stripe, Paystack, etc.
- **Email Notifications**: Order confirmations and updates
- **Inventory Alerts**: Automated low stock notifications
- **Analytics Dashboard**: Advanced reporting and insights
- **Mobile App**: Native mobile application
- **Loyalty Program**: Customer rewards system
- **Bulk Ordering**: Special pricing for large orders
- **Subscription Service**: Regular delivery subscriptions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the Convivia24 platform and is proprietary software.

## Support

For support and questions, please contact the development team or create an issue in the repository.
