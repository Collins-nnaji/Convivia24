// Dummy Database for Convivia24 Events
// This simulates a real database with comprehensive event data

export const dummyDatabase = {
  // Users data
  users: [
    {
      id: 'user_1',
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      preferences: ['music', 'networking', 'tech'],
      location: 'New York, NY',
      joinedDate: '2024-01-15',
      totalEvents: 12,
      loyaltyPoints: 1250
    },
    {
      id: 'user_2',
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      preferences: ['art', 'culture', 'food'],
      location: 'San Francisco, CA',
      joinedDate: '2024-02-03',
      totalEvents: 8,
      loyaltyPoints: 890
    },
    {
      id: 'user_3',
      name: 'Marcus Rodriguez',
      email: 'marcus.rodriguez@email.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      preferences: ['sports', 'outdoor', 'fitness'],
      location: 'Miami, FL',
      joinedDate: '2024-01-28',
      totalEvents: 15,
      loyaltyPoints: 2100
    }
  ],

  // Venues data
  venues: [
    {
      id: 'venue_1',
      name: 'The Grand Ballroom',
      address: '123 Broadway, New York, NY 10001',
      capacity: 500,
      amenities: ['Parking', 'Catering', 'AV Equipment', 'WiFi'],
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f1426e1b1e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop'
      ],
      rating: 4.8,
      priceRange: '$$$'
    },
    {
      id: 'venue_2',
      name: 'Tech Hub Conference Center',
      address: '456 Silicon Valley Blvd, San Francisco, CA 94105',
      capacity: 300,
      amenities: ['High-Speed WiFi', 'Projectors', 'Whiteboards', 'Coffee Bar'],
      images: [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
      ],
      rating: 4.9,
      priceRange: '$$$$'
    },
    {
      id: 'venue_3',
      name: 'Sunset Rooftop Lounge',
      address: '789 Ocean Drive, Miami, FL 33139',
      capacity: 150,
      amenities: ['Ocean View', 'Full Bar', 'DJ Booth', 'Outdoor Seating'],
      images: [
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop'
      ],
      rating: 4.7,
      priceRange: '$$$'
    },
    {
      id: 'venue_4',
      name: 'Art Gallery & Event Space',
      address: '321 Creative District, Los Angeles, CA 90210',
      capacity: 200,
      amenities: ['Art Exhibits', 'Natural Lighting', 'Sound System', 'Catering Kitchen'],
      images: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
      ],
      rating: 4.6,
      priceRange: '$$'
    }
  ],

  // Events data
  events: [
    {
      id: 'event_1',
      title: 'Tech Innovation Summit 2024',
      description: 'Join industry leaders for a day of cutting-edge technology discussions, networking, and innovation showcases. Featuring keynote speakers from top tech companies.',
      category: 'Technology',
      subcategory: 'Conference',
      date: '2024-03-15',
      time: '09:00',
      duration: 8,
      venue: 'venue_2',
      organizer: {
        id: 'org_1',
        name: 'TechForward Inc.',
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
      },
      price: {
        general: 299,
        vip: 599,
        student: 149
      },
      capacity: 300,
      booked: 247,
      tags: ['AI', 'Machine Learning', 'Startups', 'Networking'],
      images: [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
      ],
      status: 'active',
      featured: true,
      rating: 4.8,
      reviews: 89,
      createdAt: '2024-01-10',
      updatedAt: '2024-02-15'
    },
    {
      id: 'event_2',
      title: 'Jazz & Wine Evening',
      description: 'An intimate evening of smooth jazz music paired with premium wine tastings. Featuring local jazz artists and curated wine selections from Napa Valley.',
      category: 'Music',
      subcategory: 'Jazz',
      date: '2024-03-20',
      time: '19:00',
      duration: 3,
      venue: 'venue_3',
      organizer: {
        id: 'org_2',
        name: 'Miami Music Society',
        logo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop'
      },
      price: {
        general: 89,
        vip: 149,
        student: 59
      },
      capacity: 150,
      booked: 98,
      tags: ['Jazz', 'Wine', 'Intimate', 'Live Music'],
      images: [
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
      ],
      status: 'active',
      featured: true,
      rating: 4.9,
      reviews: 67,
      createdAt: '2024-01-20',
      updatedAt: '2024-02-10'
    },
    {
      id: 'event_3',
      title: 'Contemporary Art Exhibition Opening',
      description: 'Experience the latest in contemporary art with works from emerging and established artists. Includes artist talks, guided tours, and networking reception.',
      category: 'Art',
      subcategory: 'Exhibition',
      date: '2024-03-25',
      time: '18:00',
      duration: 4,
      venue: 'venue_4',
      organizer: {
        id: 'org_3',
        name: 'LA Art Collective',
        logo: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop'
      },
      price: {
        general: 45,
        vip: 85,
        student: 25
      },
      capacity: 200,
      booked: 156,
      tags: ['Contemporary Art', 'Exhibition', 'Networking', 'Culture'],
      images: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
      ],
      status: 'active',
      featured: false,
      rating: 4.7,
      reviews: 43,
      createdAt: '2024-02-01',
      updatedAt: '2024-02-20'
    },
    {
      id: 'event_4',
      title: 'Startup Pitch Night',
      description: 'Watch innovative startups pitch their ideas to a panel of investors. Network with entrepreneurs, investors, and industry professionals.',
      category: 'Business',
      subcategory: 'Networking',
      date: '2024-03-18',
      time: '18:30',
      duration: 3,
      venue: 'venue_1',
      organizer: {
        id: 'org_4',
        name: 'Venture Capital Network',
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
      },
      price: {
        general: 75,
        vip: 125,
        student: 35
      },
      capacity: 500,
      booked: 423,
      tags: ['Startups', 'Pitching', 'Investors', 'Networking'],
      images: [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
      ],
      status: 'active',
      featured: true,
      rating: 4.6,
      reviews: 112,
      createdAt: '2024-01-25',
      updatedAt: '2024-02-18'
    },
    {
      id: 'event_5',
      title: 'Yoga & Meditation Retreat',
      description: 'A peaceful day of yoga sessions, meditation workshops, and wellness activities. Perfect for beginners and experienced practitioners.',
      category: 'Wellness',
      subcategory: 'Yoga',
      date: '2024-03-22',
      time: '08:00',
      duration: 6,
      venue: 'venue_4',
      organizer: {
        id: 'org_5',
        name: 'Zen Wellness Center',
        logo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop'
      },
      price: {
        general: 120,
        vip: 180,
        student: 80
      },
      capacity: 200,
      booked: 134,
      tags: ['Yoga', 'Meditation', 'Wellness', 'Mindfulness'],
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop'
      ],
      status: 'active',
      featured: false,
      rating: 4.9,
      reviews: 78,
      createdAt: '2024-02-05',
      updatedAt: '2024-02-25'
    },
    {
      id: 'event_6',
      title: 'Food & Wine Festival',
      description: 'Celebrate culinary excellence with tastings from top restaurants, wine pairings, cooking demonstrations, and live entertainment.',
      category: 'Food & Drink',
      subcategory: 'Festival',
      date: '2024-03-30',
      time: '12:00',
      duration: 8,
      venue: 'venue_1',
      organizer: {
        id: 'org_6',
        name: 'Culinary Arts Society',
        logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop'
      },
      price: {
        general: 95,
        vip: 165,
        student: 55
      },
      capacity: 500,
      booked: 387,
      tags: ['Food', 'Wine', 'Cooking', 'Entertainment'],
      images: [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
      ],
      status: 'active',
      featured: true,
      rating: 4.8,
      reviews: 156,
      createdAt: '2024-01-30',
      updatedAt: '2024-02-28'
    }
  ],

  // Bookings data
  bookings: [
    {
      id: 'booking_1',
      userId: 'user_1',
      eventId: 'event_1',
      ticketType: 'general',
      quantity: 2,
      totalPrice: 598,
      status: 'confirmed',
      bookingDate: '2024-02-10',
      paymentMethod: 'credit_card',
      paymentId: 'pay_123456789',
      attendees: [
        { name: 'Alex Johnson', email: 'alex.johnson@email.com' },
        { name: 'Emma Wilson', email: 'emma.wilson@email.com' }
      ]
    },
    {
      id: 'booking_2',
      userId: 'user_2',
      eventId: 'event_2',
      ticketType: 'vip',
      quantity: 1,
      totalPrice: 149,
      status: 'confirmed',
      bookingDate: '2024-02-15',
      paymentMethod: 'paypal',
      paymentId: 'pay_987654321',
      attendees: [
        { name: 'Sarah Chen', email: 'sarah.chen@email.com' }
      ]
    },
    {
      id: 'booking_3',
      userId: 'user_3',
      eventId: 'event_4',
      ticketType: 'general',
      quantity: 1,
      totalPrice: 75,
      status: 'confirmed',
      bookingDate: '2024-02-20',
      paymentMethod: 'credit_card',
      paymentId: 'pay_456789123',
      attendees: [
        { name: 'Marcus Rodriguez', email: 'marcus.rodriguez@email.com' }
      ]
    }
  ],

  // Categories for filtering
  categories: [
    { id: 'technology', name: 'Technology', icon: '💻', color: '#3B82F6' },
    { id: 'music', name: 'Music', icon: '🎵', color: '#8B5CF6' },
    { id: 'art', name: 'Art', icon: '🎨', color: '#EC4899' },
    { id: 'business', name: 'Business', icon: '💼', color: '#10B981' },
    { id: 'wellness', name: 'Wellness', icon: '🧘', color: '#06B6D4' },
    { id: 'food', name: 'Food & Drink', icon: '🍷', color: '#F59E0B' },
    { id: 'sports', name: 'Sports', icon: '⚽', color: '#EF4444' },
    { id: 'education', name: 'Education', icon: '📚', color: '#6366F1' }
  ],

  // Event statuses
  eventStatuses: [
    { id: 'active', name: 'Active', color: '#10B981' },
    { id: 'sold_out', name: 'Sold Out', color: '#EF4444' },
    { id: 'cancelled', name: 'Cancelled', color: '#6B7280' },
    { id: 'postponed', name: 'Postponed', color: '#F59E0B' }
  ],

  // Payment methods
  paymentMethods: [
    { id: 'credit_card', name: 'Credit Card', icon: '💳' },
    { id: 'paypal', name: 'PayPal', icon: '🅿️' },
    { id: 'apple_pay', name: 'Apple Pay', icon: '🍎' },
    { id: 'google_pay', name: 'Google Pay', icon: 'G' }
  ]
};

// Helper functions for database operations
export const dbHelpers = {
  // Get all events with venue and organizer details
  getEventsWithDetails: () => {
    return dummyDatabase.events.map(event => ({
      ...event,
      venue: dummyDatabase.venues.find(v => v.id === event.venue),
      organizer: event.organizer
    }));
  },

  // Get events by category
  getEventsByCategory: (category) => {
    return dbHelpers.getEventsWithDetails().filter(event => 
      event.category.toLowerCase() === category.toLowerCase()
    );
  },

  // Get featured events
  getFeaturedEvents: () => {
    return dbHelpers.getEventsWithDetails().filter(event => event.featured);
  },

  // Get event by ID with full details
  getEventById: (eventId) => {
    const event = dummyDatabase.events.find(e => e.id === eventId);
    if (!event) return null;
    
    return {
      ...event,
      venue: dummyDatabase.venues.find(v => v.id === event.venue),
      organizer: event.organizer
    };
  },

  // Get user bookings
  getUserBookings: (userId) => {
    return dummyDatabase.bookings
      .filter(booking => booking.userId === userId)
      .map(booking => ({
        ...booking,
        event: dbHelpers.getEventById(booking.eventId)
      }));
  },

  // Create new booking
  createBooking: (bookingData) => {
    const newBooking = {
      id: `booking_${Date.now()}`,
      ...bookingData,
      bookingDate: new Date().toISOString().split('T')[0],
      status: 'confirmed'
    };
    
    dummyDatabase.bookings.push(newBooking);
    
    // Update event booked count
    const event = dummyDatabase.events.find(e => e.id === bookingData.eventId);
    if (event) {
      event.booked += bookingData.quantity;
    }
    
    return newBooking;
  },

  // Search events
  searchEvents: (query) => {
    const searchTerm = query.toLowerCase();
    return dbHelpers.getEventsWithDetails().filter(event =>
      event.title.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      event.category.toLowerCase().includes(searchTerm)
    );
  },

  // Get events by date range
  getEventsByDateRange: (startDate, endDate) => {
    return dbHelpers.getEventsWithDetails().filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
    });
  }
};

export default dummyDatabase;
