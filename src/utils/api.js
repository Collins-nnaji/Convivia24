// API utility for backend integration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Get headers for API requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// User API methods
export const userApi = {
  // Get current user profile
  getProfile: () => apiClient.get('/users/profile'),
  
  // Update user profile
  updateProfile: (data) => apiClient.put('/users/profile', data),
  
  // Get user stats
  getStats: () => apiClient.get('/users/stats'),
  
  // Update user preferences
  updatePreferences: (data) => apiClient.patch('/users/preferences', data),
  
  // Get user activity
  getActivity: (params = {}) => apiClient.get(`/users/activity?${new URLSearchParams(params)}`),
  
  // Get user badges
  getBadges: () => apiClient.get('/users/badges'),
  
  // Get user connections
  getConnections: () => apiClient.get('/users/connections'),
};

// Rewards API methods
export const rewardsApi = {
  // Get user rewards
  getRewards: (params = {}) => apiClient.get(`/rewards?${new URLSearchParams(params)}`),
  
  // Redeem reward
  redeemReward: (rewardId) => apiClient.post(`/rewards/${rewardId}/redeem`),
  
  // Get points history
  getPointsHistory: (params = {}) => apiClient.get(`/rewards/points/history?${new URLSearchParams(params)}`),
  
  // Get available rewards
  getAvailableRewards: (category = 'all') => apiClient.get(`/rewards/available?category=${category}`),
};

// Events API methods
export const eventsApi = {
  // Get events
  getEvents: (params = {}) => apiClient.get(`/events?${new URLSearchParams(params)}`),
  
  // Get event details
  getEvent: (eventId) => apiClient.get(`/events/${eventId}`),
  
  // Check in to event
  checkIn: (eventId, data) => apiClient.post(`/events/${eventId}/checkin`, data),
  
  // Get user's events
  getUserEvents: (params = {}) => apiClient.get(`/events/user?${new URLSearchParams(params)}`),
  
  // Join event hangout room
  joinHangoutRoom: (eventId) => apiClient.post(`/events/${eventId}/hangout/join`),
};

// Hangout Rooms API methods
export const hangoutApi = {
  // Get hangout rooms
  getRooms: (params = {}) => apiClient.get(`/hangout-rooms?${new URLSearchParams(params)}`),
  
  // Get room details
  getRoom: (roomId) => apiClient.get(`/hangout-rooms/${roomId}`),
  
  // Join room
  joinRoom: (roomId) => apiClient.post(`/hangout-rooms/${roomId}/join`),
  
  // Leave room
  leaveRoom: (roomId) => apiClient.post(`/hangout-rooms/${roomId}/leave`),
  
  // Send message
  sendMessage: (roomId, message) => apiClient.post(`/hangout-rooms/${roomId}/messages`, { message }),
  
  // Get room messages
  getMessages: (roomId, params = {}) => apiClient.get(`/hangout-rooms/${roomId}/messages?${new URLSearchParams(params)}`),
};

// Polls API methods
export const pollsApi = {
  // Get polls for room
  getPolls: (roomId) => apiClient.get(`/polls/room/${roomId}`),
  
  // Create poll
  createPoll: (roomId, data) => apiClient.post(`/polls/room/${roomId}`, data),
  
  // Vote on poll
  votePoll: (pollId, optionId) => apiClient.post(`/polls/${pollId}/vote`, { optionId }),
  
  // End poll
  endPoll: (pollId) => apiClient.post(`/polls/${pollId}/end`),
};

// Predictions API methods
export const predictionsApi = {
  // Get predictions for room
  getPredictions: (roomId) => apiClient.get(`/predictions/room/${roomId}`),
  
  // Create prediction
  createPrediction: (roomId, data) => apiClient.post(`/predictions/room/${roomId}`, data),
  
  // Place bet
  placeBet: (predictionId, data) => apiClient.post(`/predictions/${predictionId}/bet`, data),
  
  // Resolve prediction
  resolvePrediction: (predictionId, data) => apiClient.post(`/predictions/${predictionId}/resolve`, data),
};

// Authentication API methods
export const authApi = {
  // Login
  login: (credentials) => apiClient.post('/auth/login', credentials),
  
  // Register
  register: (userData) => apiClient.post('/auth/register', userData),
  
  // Logout
  logout: () => apiClient.post('/auth/logout'),
  
  // Refresh token
  refreshToken: () => apiClient.post('/auth/refresh'),
  
  // Forgot password
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
};

// Partner API methods
export const partnerApi = {
  // Get partner dashboard data
  getDashboard: () => apiClient.get('/partner/dashboard'),
  
  // Get partner events
  getEvents: (params = {}) => apiClient.get(`/partner/events?${new URLSearchParams(params)}`),
  
  // Create event
  createEvent: (data) => apiClient.post('/partner/events', data),
  
  // Update event
  updateEvent: (eventId, data) => apiClient.put(`/partner/events/${eventId}`, data),
  
  // Get analytics
  getAnalytics: (params = {}) => apiClient.get(`/partner/analytics?${new URLSearchParams(params)}`),
  
  // Get venue profile
  getVenueProfile: () => apiClient.get('/partner/venue'),
  
  // Update venue profile
  updateVenueProfile: (data) => apiClient.put('/partner/venue', data),
};

// QR Code API methods
export const qrApi = {
  // Generate QR code
  generateQR: (data) => apiClient.post('/qr/generate', data),
  
  // Verify QR code
  verifyQR: (qrData) => apiClient.post('/qr/verify', { qrData }),
  
  // Check in with QR
  checkInQR: (qrData) => apiClient.post('/qr/checkin', { qrData }),
};

// WebSocket connection for real-time features
export class WebSocketClient {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
  }

  connect(token) {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
    this.socket = new WebSocket(`${wsUrl}?token=${token}`);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return this.socket;
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
          this.connect(token);
        }
      }, this.reconnectInterval * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  onMessage(callback) {
    if (this.socket) {
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        callback(data);
      };
    }
  }
}

// Create singleton WebSocket instance
export const wsClient = new WebSocketClient();

// Export the main API client
export default apiClient;
