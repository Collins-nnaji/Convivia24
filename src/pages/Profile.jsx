import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Calendar, Heart, Star, MapPin, Clock, Ticket, Crown, 
  Settings, Bell, CreditCard, Gift, Users, Camera, Edit3,
  ChevronRight, Phone, Mail, Globe, Award, TrendingUp
} from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data
  const userData = {
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+44 7123 456789",
    location: "London, UK",
    joinDate: "January 2024",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    membership: "Premium",
    points: 2450,
    level: "Gold",
    stats: {
      eventsAttended: 23,
      venuesVisited: 18,
      reviewsWritten: 15,
      friendsConnected: 47
    }
  };

  // Mock upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: "Neon Nights: Electronic Music Festival",
      date: "2024-02-15",
      time: "22:00",
      venue: "Skyline Rooftop Lounge",
      status: "confirmed",
      ticketType: "VIP"
    },
    {
      id: 2,
      title: "Jazz & Wine Tasting Evening",
      date: "2024-02-18",
      time: "19:30",
      venue: "Underground Speakeasy",
      status: "confirmed",
      ticketType: "Standard"
    },
    {
      id: 3,
      title: "Art Gallery Opening: Modern Expressions",
      date: "2024-02-20",
      time: "18:00",
      venue: "Cultural Haven",
      status: "waitlist",
      ticketType: "Free"
    }
  ];

  // Mock favorite venues
  const favoriteVenues = [
    {
      id: 1,
      name: "Skyline Rooftop Lounge",
      location: "London, UK",
      image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      rating: 4.9,
      lastVisited: "2024-01-28"
    },
    {
      id: 2,
      name: "Underground Speakeasy",
      location: "Lagos, Nigeria",
      image: "https://images.unsplash.com/photo-1528495612343-9ca9f4a4de28?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      rating: 4.8,
      lastVisited: "2024-01-15"
    },
    {
      id: 3,
      name: "Cultural Haven",
      location: "London, UK",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      rating: 4.7,
      lastVisited: "2024-01-10"
    }
  ];

  // Mock activity history
  const activityHistory = [
    {
      id: 1,
      type: "event_attended",
      title: "Attended Jazz & Wine Tasting Evening",
      venue: "Underground Speakeasy",
      date: "2024-01-28",
      points: 50
    },
    {
      id: 2,
      type: "review_written",
      title: "Wrote a review for Skyline Rooftop Lounge",
      venue: "Skyline Rooftop Lounge",
      date: "2024-01-25",
      points: 25
    },
    {
      id: 3,
      type: "venue_visited",
      title: "Visited Cultural Haven",
      venue: "Cultural Haven",
      date: "2024-01-20",
      points: 30
    },
    {
      id: 4,
      type: "friend_connected",
      title: "Connected with Sarah Wilson",
      venue: "Brew Café Social Hub",
      date: "2024-01-18",
      points: 20
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User size={16} /> },
    { id: 'events', label: 'My Events', icon: <Calendar size={16} /> },
    { id: 'venues', label: 'Favorites', icon: <Heart size={16} /> },
    { id: 'activity', label: 'Activity', icon: <TrendingUp size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'waitlist': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'event_attended': return <Ticket size={16} className="text-green-600" />;
      case 'review_written': return <Star size={16} className="text-yellow-600" />;
      case 'venue_visited': return <MapPin size={16} className="text-blue-600" />;
      case 'friend_connected': return <Users size={16} className="text-purple-600" />;
      default: return <Calendar size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <section className="bg-gradient-to-r from-black via-red-900 to-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <img
                src={userData.avatar}
                alt={userData.name}
                className="w-32 h-32 rounded-full border-4 border-white/20 object-cover"
              />
              <button className="absolute bottom-2 right-2 p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors">
                <Camera size={16} />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold">{userData.name}</h1>
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-sm px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  <Crown size={14} />
                  {userData.level}
                </span>
              </div>
              <p className="text-gray-300 mb-4">{userData.location} • Member since {userData.joinDate}</p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-yellow-400" />
                  <span className="text-sm">{userData.points} points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-blue-400" />
                  <span className="text-sm">{userData.stats.eventsAttended} events</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-green-400" />
                  <span className="text-sm">{userData.stats.venuesVisited} venues</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2">
                <Bell size={16} />
                Notifications
              </button>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white border-b sticky top-24 z-40">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats Cards */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-xl p-6 shadow-sm border"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar size={20} className="text-blue-600" />
                      </div>
                      <span className="text-2xl font-bold">{userData.stats.eventsAttended}</span>
                    </div>
                    <p className="text-gray-600 text-sm">Events Attended</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-sm border"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MapPin size={20} className="text-green-600" />
                      </div>
                      <span className="text-2xl font-bold">{userData.stats.venuesVisited}</span>
                    </div>
                    <p className="text-gray-600 text-sm">Venues Visited</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white rounded-xl p-6 shadow-sm border"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Star size={20} className="text-yellow-600" />
                      </div>
                      <span className="text-2xl font-bold">{userData.stats.reviewsWritten}</span>
                    </div>
                    <p className="text-gray-600 text-sm">Reviews Written</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-white rounded-xl p-6 shadow-sm border"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users size={20} className="text-purple-600" />
                      </div>
                      <span className="text-2xl font-bold">{userData.stats.friendsConnected}</span>
                    </div>
                    <p className="text-gray-600 text-sm">Friends Connected</p>
                  </motion.div>
                </div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white rounded-xl p-6 shadow-sm border"
                >
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {activityHistory.slice(0, 4).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-gray-600 text-xs">{activity.venue} • {activity.date}</p>
                        </div>
                        <span className="text-green-600 text-sm font-medium">+{activity.points} pts</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Upcoming Events */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-xl p-6 shadow-sm border"
                >
                  <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs mb-1">{event.venue}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{event.date} at {event.time}</span>
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded">{event.ticketType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 text-red-600 text-sm font-medium hover:text-red-700 transition-colors">
                    View All Events
                  </button>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-xl p-6 shadow-sm border"
                >
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-sm font-medium">Browse Events</span>
                      <ChevronRight size={16} />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-sm font-medium">Find Venues</span>
                      <ChevronRight size={16} />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-sm font-medium">Invite Friends</span>
                      <ChevronRight size={16} />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-sm font-medium">View Rewards</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Events</h2>
                <div className="flex gap-2">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option>All Events</option>
                    <option>Upcoming</option>
                    <option>Past</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-xl p-6 shadow-sm border"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{event.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{event.venue}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Calendar size={14} />
                      <span>{event.date}</span>
                      <Clock size={14} />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">{event.ticketType}</span>
                      <button className="text-red-600 text-sm font-medium hover:text-red-700 transition-colors">
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'venues' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Favorite Venues</h2>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Browse More Venues
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteVenues.map((venue) => (
                  <motion.div
                    key={venue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-xl overflow-hidden shadow-sm border"
                  >
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="font-semibold mb-2">{venue.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin size={14} />
                        <span>{venue.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Star size={14} className="text-yellow-400 fill-current" />
                        <span>{venue.rating}</span>
                        <span>• Last visited {venue.lastVisited}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                          View Details
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          <Heart size={16} className="fill-current" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Activity History</h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="space-y-4">
                  {activityHistory.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-gray-600 text-sm">{activity.venue} • {activity.date}</p>
                      </div>
                      <span className="text-green-600 font-medium">+{activity.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-2xl font-bold">Account Settings</h2>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue={userData.name}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={userData.email}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue={userData.phone}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      defaultValue={userData.location}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Event Reminders</p>
                      <p className="text-sm text-gray-600">Get notified about upcoming events</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Venues</p>
                      <p className="text-sm text-gray-600">Be the first to know about new venues</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Special Offers</p>
                      <p className="text-sm text-gray-600">Receive exclusive deals and promotions</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Privacy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Public Profile</p>
                      <p className="text-sm text-gray-600">Allow others to see your profile</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Activity Visibility</p>
                      <p className="text-sm text-gray-600">Show your activity to friends</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Save Changes
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Profile;
