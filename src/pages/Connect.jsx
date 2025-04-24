import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Users, User, Search, MessageCircle, 
  Calendar, ArrowLeft, Filter, ChevronRight,
  Bell, UserPlus, Check, X, Star, Heart,
  Clock, Sparkles, ChevronsUpDown, PlusCircle,
  Map, Compass
} from 'lucide-react';

// Import mock events data
import eventsData from '../data/eventsData';

// Mock hotspots data
const hotspotsData = [
  {
    id: 1,
    name: "Shoreditch Central",
    location: "Shoreditch, London",
    type: "Bar & Nightlife",
    activeUsers: 48,
    mutualConnections: 3,
    image: "https://images.unsplash.com/photo-1546622891-02c72c1537b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    description: "Popular area with trendy bars, restaurants and cafes",
    coordinates: { lat: 51.523, lng: -0.077 }
  },
  {
    id: 2,
    name: "South Bank",
    location: "South Bank, London",
    type: "Cultural & Leisure",
    activeUsers: 72,
    mutualConnections: 5,
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    description: "Vibrant area along the Thames with cultural venues and food markets",
    coordinates: { lat: 51.507, lng: -0.116 }
  },
  {
    id: 3,
    name: "Camden Market",
    location: "Camden, London",
    type: "Market & Shopping",
    activeUsers: 63,
    mutualConnections: 2,
    image: "https://images.unsplash.com/photo-1563292769-4a2fb34b3c14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    description: "Eclectic market with street food, clothing and crafts",
    coordinates: { lat: 51.541, lng: -0.148 }
  },
  {
    id: 4,
    name: "Liverpool Street Hub",
    location: "Liverpool Street, London",
    type: "Business & Social",
    activeUsers: 105,
    mutualConnections: 8,
    image: "https://images.unsplash.com/photo-1603009137503-a11ccd600c1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    description: "Financial district with busy bars and restaurants",
    coordinates: { lat: 51.518, lng: -0.081 }
  }
];

const Connect = () => {
  const navigate = useNavigate();
  const [connectionMode, setConnectionMode] = useState('events'); // 'events' or 'hotspots'
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modified events data with attendee information
  const events = eventsData.map(event => ({
    ...event,
    attendees: event.attendees || {
      count: Math.floor(Math.random() * 200) + 50,
      mutual: Math.floor(Math.random() * 10),
      profiles: Array(8).fill().map((_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        image: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i + 10}.jpg`,
        mutual: i < 3,
        status: i % 3 === 0 ? 'Online now' : `Active ${Math.floor(Math.random() * 12) + 1}h ago`,
        interests: ['Music', 'Events', 'Networking'].slice(0, Math.floor(Math.random() * 3) + 1),
        compatibility: Math.floor(Math.random() * 30) + 70
      }))
    }
  }));

  // Add profiles to hotspots
  const hotspots = hotspotsData.map(hotspot => ({
    ...hotspot,
    profiles: Array(hotspot.activeUsers > 10 ? 10 : hotspot.activeUsers).fill().map((_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      image: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i + 15}.jpg`,
      mutual: i < hotspot.mutualConnections,
      status: i % 3 === 0 ? 'Online now' : `Active ${Math.floor(Math.random() * 12) + 1}h ago`,
      interests: ['Nightlife', 'Food', 'Arts', 'Meetups', 'Networking'].slice(0, Math.floor(Math.random() * 3) + 1),
      compatibility: Math.floor(Math.random() * 30) + 70
    }))
  }));

  // Filter events based on search and tab
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || event.category === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // Filter hotspots based on search and type
  const filteredHotspots = hotspots.filter(hotspot => {
    const matchesSearch = !searchQuery || 
      hotspot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotspot.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotspot.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || hotspot.type === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const handleBackFromDetail = () => {
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Mode Selector */}
        {!selectedItem && (
          <div className="mb-6">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Connect with People</h1>
                <p className="text-white/70">Discover and interact with new people at events and popular hotspots.</p>
              </div>
              <img 
                src="https://cdn-icons-png.flaticon.com/512/8058/8058892.png" 
                alt="People connecting" 
                className="w-28 h-28 object-contain"
              />
            </div>
            
            <div className="bg-white/5 p-1 rounded-lg inline-flex mb-4">
              <button 
                onClick={() => setConnectionMode('events')}
                className={`px-5 py-2 rounded-md font-medium text-sm flex items-center gap-2 ${
                  connectionMode === 'events' 
                    ? 'bg-red-600 text-white' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Calendar size={16} />
                <span>Events</span>
              </button>
              <button 
                onClick={() => setConnectionMode('hotspots')}
                className={`px-5 py-2 rounded-md font-medium text-sm flex items-center gap-2 ${
                  connectionMode === 'hotspots' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Map size={16} />
                <span>Hotspots</span>
              </button>
            </div>
          </div>
        )}

        {selectedItem ? (
          connectionMode === 'events' ? (
            <EventConnectView 
              event={selectedItem} 
              onBack={handleBackFromDetail} 
            />
          ) : (
            <HotspotConnectView 
              hotspot={selectedItem} 
              onBack={handleBackFromDetail} 
            />
          )
        ) : connectionMode === 'events' ? (
          <EventsList 
            events={filteredEvents} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            onSelectEvent={setSelectedItem}
          />
        ) : (
          <HotspotsList
            hotspots={filteredHotspots}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            onSelectHotspot={setSelectedItem}
          />
        )}
      </div>
    </div>
  );
};

// List of all events with attendees to connect with
const EventsList = ({ 
  events, 
  searchQuery, 
  setSearchQuery, 
  activeTab, 
  setActiveTab,
  showFilters,
  setShowFilters,
  onSelectEvent 
}) => {
  const categories = ['all', ...new Set(events.map(event => event.category))];

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <div className="bg-red-600/20 p-2 rounded-lg">
            <Calendar size={20} className="text-red-400" />
          </div>
          Events Near You
        </h1>
        <p className="text-white/70">Discover exciting events and connect with like-minded attendees</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-red-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white/10 hover:bg-white/15 rounded-full py-3 px-5 text-white flex items-center gap-2"
          >
            <Filter size={18} />
            <span>Filters</span>
            <ChevronsUpDown size={16} className="ml-1" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="overflow-x-auto hide-scrollbar mb-6">
          <div className="flex gap-2 min-w-max py-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                  activeTab === category 
                    ? 'bg-red-600 text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {category === 'all' ? 'All Events' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png" 
              alt="No events found" 
              className="w-24 h-24 mx-auto mb-4 opacity-60"
            />
            <p>No events found matching your criteria.</p>
          </div>
        ) : (
          events.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onClick={() => onSelectEvent(event)} 
            />
          ))
        )}
      </div>
    </>
  );
};

// Event card showing basic info and attendee count
const EventCard = ({ event, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-colors cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-2/5 md:w-1/3 aspect-video sm:aspect-square overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 p-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block bg-red-600/20 text-red-400 text-xs px-2 py-0.5 rounded-full mb-2">
                {event.category}
              </span>
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
            </div>
            <span className="bg-white/10 text-white/80 text-xs px-2 py-1 rounded-full">
              {event.date}
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-white/70 mb-4">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-red-400" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-red-400" />
              <span>{event.time}</span>
            </div>
          </div>
          
          {/* Attendee preview */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {event.attendees.profiles.slice(0, 4).map((person, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-gray-900 overflow-hidden shadow-md">
                    <img 
                      src={person.image} 
                      alt={person.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {event.attendees.count > 4 && (
                  <div className="w-9 h-9 rounded-full bg-red-600 border-2 border-gray-900 flex items-center justify-center text-xs font-medium shadow-md">
                    +{event.attendees.count - 4}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{event.attendees.count} Attending</p>
                {event.attendees.mutual > 0 && (
                  <p className="text-xs text-red-400">{event.attendees.mutual} mutual connections</p>
                )}
              </div>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-4 py-2 text-sm flex items-center gap-1.5 transition-colors">
              <MessageCircle size={14} />
              <span>Meet People</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Detailed view of people attending a specific event
const EventConnectView = ({ event, onBack }) => {
  const [activeSection, setActiveSection] = useState('attendees');
  const [searchAttendees, setSearchAttendees] = useState('');
  
  // Filter attendees based on search
  const filteredAttendees = event.attendees.profiles.filter(person => 
    !searchAttendees || 
    person.name.toLowerCase().includes(searchAttendees.toLowerCase()) ||
    (person.interests && person.interests.some(i => i.toLowerCase().includes(searchAttendees.toLowerCase())))
  );

  return (
    <div>
      {/* Header with back button */}
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
        >
          <ArrowLeft size={18} />
          <span>Back to events</span>
        </button>
        
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-1">{event.title}</h2>
            <div className="flex items-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-red-400" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-red-400" />
                <span>{event.date} • {event.time}</span>
              </div>
            </div>
          </div>
          <Link 
            to={`/events/${event.id}`}
            className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-full text-sm"
          >
            View Event
          </Link>
        </div>
      </div>
      
      {/* Navigation tabs */}
      <div className="flex border-b border-white/10 mb-6">
        <button 
          onClick={() => setActiveSection('attendees')}
          className={`px-4 py-3 ${activeSection === 'attendees' ? 'border-b-2 border-red-500 text-white' : 'text-white/60'}`}
        >
          People Attending ({event.attendees.count})
        </button>
        <button 
          onClick={() => setActiveSection('chat')}
          className={`px-4 py-3 ${activeSection === 'chat' ? 'border-b-2 border-red-500 text-white' : 'text-white/60'}`}
        >
          Event Chat
        </button>
      </div>
      
      {activeSection === 'attendees' && (
        <div>
          {/* Attendee search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              placeholder="Search people by name or interests..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-red-500"
              value={searchAttendees}
              onChange={(e) => setSearchAttendees(e.target.value)}
            />
          </div>
          
          {/* Stats card */}
          <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-xl p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Total Attendees</p>
                  <p className="text-2xl font-bold">{event.attendees.count}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <UserPlus size={24} className="text-red-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Mutual Connections</p>
                  <p className="text-2xl font-bold text-red-400">{event.attendees.mutual}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg relative">
                  <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                  <User size={24} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Online Now</p>
                  <p className="text-2xl font-bold text-green-400">
                    {event.attendees.profiles.filter(p => p.status === 'Online now').length}
                  </p>
                </div>
              </div>
              <div className="sm:ml-auto">
                <button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-3 flex items-center gap-2 transition-colors">
                  <PlusCircle size={18} />
                  <span>RSVP to Event</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Attendees list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAttendees.length === 0 ? (
              <div className="col-span-2 text-center py-6 text-white/60">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076445.png" 
                  alt="No people found" 
                  className="w-20 h-20 mx-auto mb-3 opacity-60"
                />
                <p>No attendees found matching your search.</p>
              </div>
            ) : (
              filteredAttendees.map((person, index) => (
                <AttendeeCard key={index} person={person} />
              ))
            )}
          </div>
        </div>
      )}
      
      {activeSection === 'chat' && (
        <div>
          <div className="bg-white/5 rounded-xl p-6 text-center">
            <div className="mb-4 relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded-full animate-pulse"></div>
              <img
                src="https://cdn-icons-png.flaticon.com/512/6659/6659895.png"
                alt="Event chat"
                className="w-full h-full object-contain relative z-10"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Event Group Chat</h3>
            <p className="text-white/70 mb-6">
              Join the conversation with {event.attendees.count} people attending this event
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-3 font-medium">
              Enter Chat Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Individual attendee card
const AttendeeCard = ({ person }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connected, setConnected] = useState(person.mutual);
  
  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate API call
    setTimeout(() => {
      setIsConnecting(false);
      setConnected(true);
    }, 1000);
  };

  return (
    <div className="bg-white/5 hover:bg-white/8 rounded-xl p-4 transition-colors">
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-700">
            <img 
              src={person.image} 
              alt={person.name} 
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
            />
          </div>
          {person.status === 'Online now' && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900"></div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold flex items-center gap-1">
                {person.name}
                {person.compatibility && (
                  <span className="ml-1 text-xs bg-gradient-to-r from-blue-600/20 to-indigo-600/20 px-1.5 py-0.5 rounded text-blue-400 flex items-center gap-1">
                    <Sparkles size={10} className="text-yellow-400" />
                    {person.compatibility}% match
                  </span>
                )}
              </h4>
              <p className="text-sm text-white/60">
                {person.status === 'Online now' ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Online now
                  </span>
                ) : (
                  person.status
                )}
              </p>
            </div>
            
            {connected ? (
              <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                <Check size={12} />
                Connected
              </span>
            ) : (
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className={`text-xs ${
                  isConnecting 
                    ? 'bg-white/10 text-white/60' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } px-3 py-1.5 rounded-full transition-colors flex items-center gap-1`}
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>
          
          {person.interests && (
            <div className="flex flex-wrap gap-1 mt-2">
              {person.interests.map((interest, i) => (
                <span 
                  key={i} 
                  className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/80"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex mt-3 gap-2">
            <button className="flex-1 bg-white/10 hover:bg-white/15 text-xs py-1.5 rounded text-white/80 transition-colors">
              Message
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/15 rounded text-white/80 transition-colors">
              <Heart size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// List of all hotspots with people to connect with
const HotspotsList = ({ 
  hotspots, 
  searchQuery, 
  setSearchQuery, 
  activeTab, 
  setActiveTab,
  showFilters,
  setShowFilters,
  onSelectHotspot 
}) => {
  const types = ['all', ...new Set(hotspots.map(hotspot => hotspot.type))];

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <div className="bg-blue-600/20 p-2 rounded-lg">
            <Map size={20} className="text-blue-400" />
          </div>
          Trending Hotspots
        </h1>
        <p className="text-white/70">Connect with people at popular locations happening right now</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              placeholder="Search hotspots..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white/10 hover:bg-white/15 rounded-full py-3 px-5 text-white flex items-center gap-2"
          >
            <Filter size={18} />
            <span>Filters</span>
            <ChevronsUpDown size={16} className="ml-1" />
          </button>
        </div>

        {/* Type Tabs */}
        <div className="overflow-x-auto hide-scrollbar mb-6">
          <div className="flex gap-2 min-w-max py-2">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                  activeTab === type 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {type === 'all' ? 'All Hotspots' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hotspots List */}
      <div className="space-y-4">
        {hotspots.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png" 
              alt="No hotspots found" 
              className="w-24 h-24 mx-auto mb-4 opacity-60"
            />
            <p>No hotspots found matching your criteria.</p>
          </div>
        ) : (
          hotspots.map(hotspot => (
            <HotspotCard 
              key={hotspot.id} 
              hotspot={hotspot} 
              onClick={() => onSelectHotspot(hotspot)} 
            />
          ))
        )}
      </div>
    </>
  );
};

// Hotspot card showing basic info and active users
const HotspotCard = ({ hotspot, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-colors cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-2/5 md:w-1/3 aspect-video sm:aspect-square overflow-hidden">
          <img 
            src={hotspot.image} 
            alt={hotspot.name} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 p-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block bg-blue-600/20 text-blue-400 text-xs px-2 py-0.5 rounded-full mb-2">
                {hotspot.type}
              </span>
              <h3 className="text-xl font-semibold mb-2">{hotspot.name}</h3>
            </div>
            <span className="bg-white/10 text-white/80 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Clock size={12} />
              <span>Active Now</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-white/70 mb-4">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-blue-400" />
              <span>{hotspot.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Compass size={14} className="text-blue-400" />
              <span>1.2 miles away</span>
            </div>
          </div>
          
          {/* Active Users preview */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {hotspot.profiles.slice(0, 4).map((person, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-gray-900 overflow-hidden shadow-md">
                    <img 
                      src={person.image} 
                      alt={person.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {hotspot.activeUsers > 4 && (
                  <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-gray-900 flex items-center justify-center text-xs font-medium shadow-md">
                    +{hotspot.activeUsers - 4}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{hotspot.activeUsers} People Here</p>
                {hotspot.mutualConnections > 0 && (
                  <p className="text-xs text-blue-400">{hotspot.mutualConnections} mutual connections</p>
                )}
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 text-sm flex items-center gap-1.5 transition-colors">
              <Users size={14} />
              <span>Join Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Detailed view of a hotspot with people currently there
const HotspotConnectView = ({ hotspot, onBack }) => {
  const [activeSection, setActiveSection] = useState('people');
  const [searchPeople, setSearchPeople] = useState('');
  
  // Filter people based on search
  const filteredPeople = hotspot.profiles.filter(person => 
    !searchPeople || 
    person.name.toLowerCase().includes(searchPeople.toLowerCase()) ||
    (person.interests && person.interests.some(i => i.toLowerCase().includes(searchPeople.toLowerCase())))
  );

  return (
    <div>
      {/* Header with back button */}
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
        >
          <ArrowLeft size={18} />
          <span>Back to hotspots</span>
        </button>
        
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-1">{hotspot.name}</h2>
            <div className="flex items-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-blue-400" />
                <span>{hotspot.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-blue-400" />
                <span>{hotspot.activeUsers} people here now</span>
              </div>
            </div>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2"
          >
            <MapPin size={16} />
            <span>Get Directions</span>
          </button>
        </div>
      </div>
      
      {/* Navigation tabs */}
      <div className="flex border-b border-white/10 mb-6">
        <button 
          onClick={() => setActiveSection('people')}
          className={`px-4 py-3 ${activeSection === 'people' ? 'border-b-2 border-blue-500 text-white' : 'text-white/60'}`}
        >
          People Here Now ({hotspot.activeUsers})
        </button>
        <button 
          onClick={() => setActiveSection('about')}
          className={`px-4 py-3 ${activeSection === 'about' ? 'border-b-2 border-blue-500 text-white' : 'text-white/60'}`}
        >
          About This Place
        </button>
      </div>
      
      {activeSection === 'people' && (
        <div>
          {/* Person search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              placeholder="Search people by name or interests..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchPeople}
              onChange={(e) => setSearchPeople(e.target.value)}
            />
          </div>
          
          {/* Stats card */}
          <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-xl p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">People Here Now</p>
                  <p className="text-2xl font-bold">{hotspot.activeUsers}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <UserPlus size={24} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Mutual Connections</p>
                  <p className="text-2xl font-bold text-blue-400">{hotspot.mutualConnections}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg relative">
                  <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                  <User size={24} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Online Now</p>
                  <p className="text-2xl font-bold text-green-400">
                    {hotspot.profiles.filter(p => p.status === 'Online now').length}
                  </p>
                </div>
              </div>
              <div className="sm:ml-auto">
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-3 flex items-center gap-2 transition-colors">
                  <PlusCircle size={18} />
                  <span>Check In Here</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* People list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPeople.length === 0 ? (
              <div className="col-span-2 text-center py-6 text-white/60">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076445.png" 
                  alt="No people found" 
                  className="w-20 h-20 mx-auto mb-3 opacity-60"
                />
                <p>No people found matching your search.</p>
              </div>
            ) : (
              filteredPeople.map((person, index) => (
                <AttendeeCard key={index} person={person} />
              ))
            )}
          </div>
        </div>
      )}
      
      {activeSection === 'about' && (
        <div className="bg-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600/20 p-2 rounded-lg">
              <Compass size={24} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold">About {hotspot.name}</h3>
          </div>
          <p className="text-white/80 mb-6">{hotspot.description}</p>
          
          <div className="aspect-video rounded-lg overflow-hidden mb-6">
            <img 
              src={`https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/pin-l+3b82f6(${hotspot.coordinates.lng},${hotspot.coordinates.lat})/${hotspot.coordinates.lng},${hotspot.coordinates.lat},14,0,0/800x400@2x?access_token=pk.dummy`}
              alt="Map location"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-white flex items-center justify-center gap-2">
              <MapPin size={18} />
              <span>Get Directions</span>
            </button>
            <button className="flex-1 bg-white/10 hover:bg-white/15 py-3 rounded-lg text-white flex items-center justify-center gap-2">
              <MessageCircle size={18} />
              <span>Join Hotspot Chat</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom styles
const styles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export default Connect;