import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Calendar, MapPin, Clock, ChevronLeft,
  User
} from 'lucide-react';

const EventDetail = () => {
  const { eventId } = useParams();
  const { currentUser } = useAuth();
  const { 
    events, 
    communities,
    loading, 
    joinEvent, 
    leaveEvent 
  } = useCommunity();
  const navigate = useNavigate();
  
  // Find the current event
  const event = events.find(e => e.id === eventId);
  
  // Find the community this event belongs to
  const community = event ? communities.find(c => c.id === event.communityId) : null;
  
  const handleJoinEvent = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    joinEvent(eventId);
  };
  
  const handleLeaveEvent = () => {
    leaveEvent(eventId);
  };
  
  if (loading || !event || !community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  // Format date and time
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Raleway, sans-serif' }}>
      {/* Header Image */}
      <div className="h-64 md:h-96 relative">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate(`/community/${community.id}`)}
            className="flex items-center text-white bg-black bg-opacity-50 px-3 py-2 rounded-md hover:bg-opacity-70 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to {community.name}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden -mt-16 md:-mt-24 relative z-10">
          <div className="p-6">
            <h1 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {event.title}
            </h1>
            
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2 text-red-600" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2 text-red-600" />
                <span>{formattedTime}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2 text-red-600" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-2 text-red-600" />
                <span>{event.attendees} attending</span>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this event</h2>
              <p className="text-gray-600 whitespace-pre-line">
                {event.description}
              </p>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-red-100 flex-shrink-0 mr-3">
                  {community.image ? (
                    <img
                      src={community.image}
                      alt={community.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Users className="h-5 w-5 m-auto text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Organized by</p>
                  <p className="font-medium text-gray-900">{community.name}</p>
                </div>
              </div>
              
              {event.isJoined ? (
                <button
                  onClick={handleLeaveEvent}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  Cancel Attendance
                </button>
              ) : (
                <button
                  onClick={handleJoinEvent}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  Attend Event
                </button>
              )}
            </div>
          </div>
          
          {/* Attendees Section */}
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Attendees</h2>
            
            {event.attendees === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No attendees yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Be the first to attend this event!
                </p>
                {!event.isJoined && (
                  <button
                    onClick={handleJoinEvent}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Attend Event
                  </button>
                )}
              </div>
            ) : (
              <div className="text-gray-600">
                <p>This event has {event.attendees} attendees.</p>
                {/* In a real app, you would display the list of attendees here */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail; 