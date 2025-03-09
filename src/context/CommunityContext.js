import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CommunityContext = createContext();

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

export const useCommunity = () => {
  return useContext(CommunityContext);
};

export const CommunityProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [events, setEvents] = useState([]);
  const [chats, setChats] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [activeCommunity, setActiveCommunity] = useState(null);

  // Load communities on initial load
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const res = await api.get('/communities');
        setCommunities(res.data.data);
      } catch (err) {
        console.error('Error fetching communities:', err);
        // Fallback to mock data if API fails
        const mockCommunities = [
          {
            id: '1',
            _id: '1',
            name: 'Wedding Planners',
            description: 'A community for wedding planners and enthusiasts',
            members: 245,
            memberCount: 245,
            image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
            tags: ['wedding', 'planning', 'celebration']
          },
          {
            id: '2',
            _id: '2',
            name: 'Traditional Ceremonies',
            description: 'Discuss and share traditional ceremony practices',
            members: 189,
            memberCount: 189,
            image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
            tags: ['traditional', 'cultural', 'ceremonies']
          },
          {
            id: '3',
            _id: '3',
            name: 'Corporate Event Organizers',
            description: 'Network with other corporate event professionals',
            members: 132,
            memberCount: 132,
            image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
            tags: ['corporate', 'business', 'networking']
          },
          {
            id: '4',
            _id: '4',
            name: 'Party Enthusiasts',
            description: 'For those who love to party and celebrate life',
            members: 312,
            memberCount: 312,
            image: 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
            tags: ['party', 'celebration', 'fun']
          }
        ];
        setCommunities(mockCommunities);
        setError('Using mock data: ' + (err.response?.data?.message || 'Failed to fetch communities'));
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  // Load events on initial load
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data.data);
      } catch (err) {
        console.error('Error fetching events:', err);
        // Fallback to mock data if API fails
        const mockEvents = [
          {
            id: '1',
            _id: '1',
            communityId: '1',
            community: '1',
            title: 'Wedding Planning Workshop',
            description: 'Learn the essentials of planning a perfect wedding',
            date: '2023-08-15T14:00:00',
            location: 'Virtual',
            attendees: 45,
            attendeeCount: 45,
            image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'
          },
          {
            id: '2',
            _id: '2',
            communityId: '2',
            community: '2',
            title: 'Traditional Ceremony Showcase',
            description: 'Explore different traditional ceremonies from around the world',
            date: '2023-09-05T10:00:00',
            location: 'Cultural Center, Lagos',
            attendees: 78,
            attendeeCount: 78,
            image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'
          },
          {
            id: '3',
            _id: '3',
            communityId: '3',
            community: '3',
            title: 'Corporate Event Networking',
            description: 'Connect with other corporate event professionals',
            date: '2023-08-25T18:00:00',
            location: 'Business Hub, Lagos',
            attendees: 32,
            attendeeCount: 32,
            image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'
          },
          {
            id: '4',
            _id: '4',
            communityId: '4',
            community: '4',
            title: 'Summer Party Extravaganza',
            description: 'The biggest summer party of the year',
            date: '2023-07-30T20:00:00',
            location: 'Beach Resort, Lagos',
            attendees: 120,
            attendeeCount: 120,
            image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'
          }
        ];
        setEvents(mockEvents);
        setError('Using mock data: ' + (err.response?.data?.message || 'Failed to fetch events'));
      }
    };

    fetchEvents();
  }, []);

  // Join a community
  const joinCommunity = async (communityId) => {
    try {
      setError(null);
      const res = await api.put(`/communities/${communityId}/join`);
      
      // Update communities list
      setCommunities(prevCommunities => 
        prevCommunities.map(community => 
          community._id === communityId 
            ? { ...community, ...res.data.data } 
            : community
        )
      );
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join community');
      return false;
    }
  };

  // Leave a community
  const leaveCommunity = async (communityId) => {
    try {
      setError(null);
      const res = await api.put(`/communities/${communityId}/leave`);
      
      // Update communities list
      setCommunities(prevCommunities => 
        prevCommunities.map(community => 
          community._id === communityId 
            ? { ...community, ...res.data.data } 
            : community
        )
      );
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave community');
      return false;
    }
  };

  // Send a message in a chat
  const sendMessage = async (communityId, content) => {
    try {
      setError(null);
      
      if (!currentUser) return false;
      
      const res = await api.post(`/communities/${communityId}/messages`, { content });
      
      // Update chats
      setChats(prevChats => ({
        ...prevChats,
        [communityId]: [...(prevChats[communityId] || []), res.data.data]
      }));
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      return false;
    }
  };

  // Get messages for a community
  const getMessages = async (communityId) => {
    try {
      setError(null);
      const res = await api.get(`/communities/${communityId}/messages`);
      
      // Update chats
      setChats(prevChats => ({
        ...prevChats,
        [communityId]: res.data.data
      }));
      
      return res.data.data;
    } catch (err) {
      console.error('Error fetching messages:', err);
      // Fallback to mock data if API fails
      const mockMessages = [
        {
          id: '1',
          _id: '1',
          userId: 'user1',
          sender: 'user1',
          userName: 'Sarah Johnson',
          userImage: 'https://randomuser.me/api/portraits/women/44.jpg',
          message: 'Has anyone used Convivia24 for a destination wedding?',
          content: 'Has anyone used Convivia24 for a destination wedding?',
          timestamp: '2023-07-10T10:30:00',
          createdAt: '2023-07-10T10:30:00'
        },
        {
          id: '2',
          _id: '2',
          userId: 'user2',
          sender: 'user2',
          userName: 'Michael Chen',
          userImage: 'https://randomuser.me/api/portraits/men/32.jpg',
          message: 'Yes! I used them for my beach wedding in Bali. The service was excellent!',
          content: 'Yes! I used them for my beach wedding in Bali. The service was excellent!',
          timestamp: '2023-07-10T10:35:00',
          createdAt: '2023-07-10T10:35:00'
        },
        {
          id: '3',
          _id: '3',
          userId: 'user3',
          sender: 'user3',
          userName: 'Jessica Williams',
          userImage: 'https://randomuser.me/api/portraits/women/63.jpg',
          message: "I'm planning a wedding in Santorini next year. Would love to hear more about your experience @Michael",
          content: "I'm planning a wedding in Santorini next year. Would love to hear more about your experience @Michael",
          timestamp: '2023-07-10T10:40:00',
          createdAt: '2023-07-10T10:40:00'
        }
      ];
      
      // Update chats with mock data
      setChats(prevChats => ({
        ...prevChats,
        [communityId]: mockMessages
      }));
      
      setError('Using mock data: ' + (err.response?.data?.message || 'Failed to get messages'));
      return mockMessages;
    }
  };

  // Create an event
  const createEvent = async (communityId, eventData) => {
    try {
      setError(null);
      const res = await api.post(`/communities/${communityId}/events`, eventData);
      
      // Add new event to events list
      setEvents(prevEvents => [...prevEvents, res.data.data]);
      
      return res.data.data._id;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
      return null;
    }
  };

  // Join an event
  const joinEvent = async (eventId) => {
    try {
      setError(null);
      const res = await api.put(`/events/${eventId}/attend`);
      
      // Update events list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === eventId 
            ? { ...event, ...res.data.data } 
            : event
        )
      );
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join event');
      return false;
    }
  };

  // Leave an event
  const leaveEvent = async (eventId) => {
    try {
      setError(null);
      const res = await api.put(`/events/${eventId}/cancel`);
      
      // Update events list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === eventId 
            ? { ...event, ...res.data.data } 
            : event
        )
      );
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave event');
      return false;
    }
  };

  // Create a community
  const createCommunity = async (communityData) => {
    try {
      setError(null);
      const res = await api.post('/communities', communityData);
      
      // Add new community to communities list
      setCommunities(prevCommunities => [...prevCommunities, res.data.data]);
      
      return res.data.data._id;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create community');
      return null;
    }
  };

  const value = {
    communities,
    setCommunities,
    events,
    setEvents,
    chats,
    setChats,
    activeChat,
    setActiveChat,
    activeCommunity,
    setActiveCommunity,
    loading,
    error,
    joinCommunity,
    leaveCommunity,
    sendMessage,
    getMessages,
    createEvent,
    joinEvent,
    leaveEvent,
    createCommunity
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}; 