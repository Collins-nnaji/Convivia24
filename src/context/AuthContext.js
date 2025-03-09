import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Create an axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in from token on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Verify token with backend
          const res = await api.get('/auth/me');
          setCurrentUser(res.data.data);
        }
      } catch (err) {
        // If token is invalid, remove it
        localStorage.removeItem('token');
        setCurrentUser(null);
        setError(err.response?.data?.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      const res = await api.post('/auth/login', credentials);
      
      // Save token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set current user
      setCurrentUser(res.data.data);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      setError(null);
      const res = await api.post('/auth/register', userData);
      
      // Save token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set current user
      setCurrentUser(res.data.data);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Clear current user
      setCurrentUser(null);
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const res = await api.put('/auth/updatedetails', userData);
      
      // Update current user
      setCurrentUser(res.data.data);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      return false;
    }
  };

  // Update password function
  const updatePassword = async (passwordData) => {
    try {
      setError(null);
      await api.put('/auth/updatepassword', passwordData);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed');
      return false;
    }
  };

  // Update profile picture function
  const updateProfilePicture = async (imageUrl) => {
    try {
      setError(null);
      const res = await api.put('/users/profile-picture', { profilePicture: imageUrl });
      
      // Update current user
      setCurrentUser(res.data.data);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile picture update failed');
      return false;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    updatePassword,
    updateProfilePicture
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 