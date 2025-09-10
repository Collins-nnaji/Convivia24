// Event Service - Simulates real API calls to backend
import { dummyDatabase, dbHelpers } from '../data/dummyDatabase';

// Simulate API delay
const simulateApiCall = (data, delay = 800) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    }, delay);
  });
};

// Simulate API error
const simulateApiError = (message, delay = 500) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message));
    }, delay);
  });
};

export const eventService = {
  // Get all events with pagination
  getEvents: async (page = 1, limit = 10, filters = {}) => {
    try {
      let events = dbHelpers.getEventsWithDetails();
      
      // Apply filters
      if (filters.category) {
        events = events.filter(event => 
          event.category.toLowerCase() === filters.category.toLowerCase()
        );
      }
      
      if (filters.featured) {
        events = events.filter(event => event.featured);
      }
      
      if (filters.search) {
        events = dbHelpers.searchEvents(filters.search);
      }
      
      if (filters.dateRange) {
        events = dbHelpers.getEventsByDateRange(
          filters.dateRange.start, 
          filters.dateRange.end
        );
      }
      
      // Sort events
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'date':
            events.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
          case 'price':
            events.sort((a, b) => a.price.general - b.price.general);
            break;
          case 'rating':
            events.sort((a, b) => b.rating - a.rating);
            break;
          case 'popularity':
            events.sort((a, b) => b.booked - a.booked);
            break;
          default:
            events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
      }
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedEvents = events.slice(startIndex, endIndex);
      
      return await simulateApiCall({
        events: paginatedEvents,
        pagination: {
          page,
          limit,
          total: events.length,
          totalPages: Math.ceil(events.length / limit),
          hasNext: endIndex < events.length,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      return simulateApiError('Failed to fetch events');
    }
  },

  // Get single event by ID
  getEventById: async (eventId) => {
    try {
      const event = dbHelpers.getEventById(eventId);
      if (!event) {
        return simulateApiError('Event not found');
      }
      
      return await simulateApiCall(event);
    } catch (error) {
      return simulateApiError('Failed to fetch event');
    }
  },

  // Get featured events
  getFeaturedEvents: async () => {
    try {
      const events = dbHelpers.getFeaturedEvents();
      return await simulateApiCall(events);
    } catch (error) {
      return simulateApiError('Failed to fetch featured events');
    }
  },

  // Get events by category
  getEventsByCategory: async (category) => {
    try {
      const events = dbHelpers.getEventsByCategory(category);
      return await simulateApiCall(events);
    } catch (error) {
      return simulateApiError('Failed to fetch events by category');
    }
  },

  // Search events
  searchEvents: async (query) => {
    try {
      const events = dbHelpers.searchEvents(query);
      return await simulateApiCall(events);
    } catch (error) {
      return simulateApiError('Failed to search events');
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      return await simulateApiCall(dummyDatabase.categories);
    } catch (error) {
      return simulateApiError('Failed to fetch categories');
    }
  },

  // Get venues
  getVenues: async () => {
    try {
      return await simulateApiCall(dummyDatabase.venues);
    } catch (error) {
      return simulateApiError('Failed to fetch venues');
    }
  }
};

export const bookingService = {
  // Create new booking
  createBooking: async (bookingData) => {
    try {
      // Validate booking data
      if (!bookingData.userId || !bookingData.eventId || !bookingData.ticketType) {
        return simulateApiError('Missing required booking information');
      }
      
      // Check if event exists and has capacity
      const event = dbHelpers.getEventById(bookingData.eventId);
      if (!event) {
        return simulateApiError('Event not found');
      }
      
      if (event.booked + bookingData.quantity > event.capacity) {
        return simulateApiError('Not enough tickets available');
      }
      
      // Create booking
      const booking = dbHelpers.createBooking(bookingData);
      
      return await simulateApiCall({
        booking,
        event: dbHelpers.getEventById(bookingData.eventId)
      });
    } catch (error) {
      return simulateApiError('Failed to create booking');
    }
  },

  // Get user bookings
  getUserBookings: async (userId) => {
    try {
      const bookings = dbHelpers.getUserBookings(userId);
      return await simulateApiCall(bookings);
    } catch (error) {
      return simulateApiError('Failed to fetch user bookings');
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    try {
      const bookingIndex = dummyDatabase.bookings.findIndex(b => b.id === bookingId);
      if (bookingIndex === -1) {
        return simulateApiError('Booking not found');
      }
      
      const booking = dummyDatabase.bookings[bookingIndex];
      booking.status = 'cancelled';
      
      // Update event booked count
      const event = dummyDatabase.events.find(e => e.id === booking.eventId);
      if (event) {
        event.booked -= booking.quantity;
      }
      
      return await simulateApiCall(booking);
    } catch (error) {
      return simulateApiError('Failed to cancel booking');
    }
  }
};

export const userService = {
  // Get user profile
  getUserProfile: async (userId) => {
    try {
      const user = dummyDatabase.users.find(u => u.id === userId);
      if (!user) {
        return simulateApiError('User not found');
      }
      
      return await simulateApiCall(user);
    } catch (error) {
      return simulateApiError('Failed to fetch user profile');
    }
  },

  // Update user preferences
  updateUserPreferences: async (userId, preferences) => {
    try {
      const user = dummyDatabase.users.find(u => u.id === userId);
      if (!user) {
        return simulateApiError('User not found');
      }
      
      user.preferences = preferences;
      return await simulateApiCall(user);
    } catch (error) {
      return simulateApiError('Failed to update user preferences');
    }
  }
};

export const paymentService = {
  // Process payment
  processPayment: async (paymentData) => {
    try {
      // Simulate payment processing
      const paymentResult = {
        id: `pay_${Date.now()}`,
        status: 'succeeded',
        amount: paymentData.amount,
        currency: 'USD',
        method: paymentData.method,
        timestamp: new Date().toISOString()
      };
      
      return await simulateApiCall(paymentResult);
    } catch (error) {
      return simulateApiError('Payment processing failed');
    }
  },

  // Get payment methods
  getPaymentMethods: async () => {
    try {
      return await simulateApiCall(dummyDatabase.paymentMethods);
    } catch (error) {
      return simulateApiError('Failed to fetch payment methods');
    }
  }
};

export default {
  eventService,
  bookingService,
  userService,
  paymentService
};
