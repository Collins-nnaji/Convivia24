const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Something went wrong');
  }
  return response.json();
};

// Product API calls
export const productService = {
  // Get all products with filters
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/products?${params}`);
    return handleResponse(response);
  },

  // Get single product
  getProduct: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return handleResponse(response);
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    const response = await fetch(`${API_BASE_URL}/products/featured?limit=${limit}`);
    return handleResponse(response);
  },

  // Get products by category
  getProductsByCategory: async (category, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/products/category/${category}?${params}`);
    return handleResponse(response);
  },

  // Create product (Admin only)
  createProduct: async (productData, token) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },

  // Update product (Admin only)
  updateProduct: async (id, productData, token) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },

  // Delete product (Admin only)
  deleteProduct: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  // Update stock (Admin only)
  updateStock: async (id, quantity, operation, token) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity, operation })
    });
    return handleResponse(response);
  }
};

// Order API calls
export const orderService = {
  // Create new order
  createOrder: async (orderData, token) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    return handleResponse(response);
  },

  // Get user orders
  getUserOrders: async (filters = {}, token) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/orders?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  // Get single order
  getOrder: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  // Cancel order
  cancelOrder: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  // Get all orders (Admin only)
  getAllOrders: async (filters = {}, token) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/orders/admin/all?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  // Update order status (Admin only)
  updateOrderStatus: async (id, status, token) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  }
};

// Cart management (local storage)
export const cartService = {
  getCart: () => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  },

  addToCart: (product, quantity = 1) => {
    const cart = cartService.getCart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  },

  updateCartItem: (productId, quantity) => {
    const cart = cartService.getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
      if (quantity <= 0) {
        cart.splice(itemIndex, 1);
      } else {
        cart[itemIndex].quantity = quantity;
      }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  },

  removeFromCart: (productId) => {
    const cart = cartService.getCart();
    const updatedCart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    return updatedCart;
  },

  clearCart: () => {
    localStorage.removeItem('cart');
  },

  getCartTotal: () => {
    const cart = cartService.getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getCartItemCount: () => {
    const cart = cartService.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  }
};

// Utility functions
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(price);
};

export const calculateTax = (subtotal, rate = 0.075) => {
  return subtotal * rate;
};

export const calculateShipping = (subtotal, threshold = 50000, cost = 2000) => {
  return subtotal >= threshold ? 0 : cost;
};

export const calculateTotal = (subtotal, tax, shipping) => {
  return subtotal + tax + shipping;
};
