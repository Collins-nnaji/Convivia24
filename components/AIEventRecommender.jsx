import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Calendar, MapPin, Users, ThumbsUp, ThumbsDown } from 'lucide-react';

/**
 * AI Event Recommender Component
 * Provides personalized event recommendations based on user preferences
 */
const AIEventRecommender = ({ userPreferences = {} }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});

  // Default preferences if none provided
  const preferences = {
    location: userPreferences.location || 'Lagos',
    eventTypes: userPreferences.eventTypes || ['party', 'wedding', 'corporate'],
    maxDistance: userPreferences.maxDistance || 50,
    ...userPreferences
  };

  useEffect(() => {
    generateRecommendations();
  }, [preferences]);

  const generateRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://convivia24ai.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-07-18', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': '3SgC8UUeEaDXuo14repegc5wvoAz4aaTfeTtYIqxfzauJSRDbGyfJQQJ99BCACYeBjFXJ3w3AAAAACOGI0tT'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an AI event recommendation system for Convivia24, a platform specializing in celebration planning and liquor supply. 
              Generate 3 personalized event recommendations based on the user's preferences. 
              Each recommendation should include: event name, type, date, location, description, and an image URL.
              Format your response as a JSON array of objects with the following structure:
              [
                {
                  "id": "unique-id-1",
                  "name": "Event Name",
                  "type": "Event Type",
                  "date": "YYYY-MM-DD",
                  "location": "Event Location",
                  "description": "Brief description of the event",
                  "imageUrl": "https://example.com/image.jpg"
                }
              ]
              Make sure the response is valid JSON that can be parsed. Use realistic dates in the near future.`
            },
            {
              role: 'user',
              content: `Generate event recommendations for a user with the following preferences:
              - Location: ${preferences.location}
              - Event Types: ${preferences.eventTypes.join(', ')}
              - Maximum Distance: ${preferences.maxDistance} km
              ${preferences.interests ? `- Interests: ${preferences.interests.join(', ')}` : ''}
              ${preferences.budget ? `- Budget: ${preferences.budget}` : ''}
              
              Please provide 3 personalized event recommendations.`
            }
          ],
          temperature: 0.7,
          max_tokens: 800,
          response_format: { type: "json_object" }
        })
      });
      
      const data = await response.json();
      
      // Parse the JSON string from the response
      const recommendationsData = JSON.parse(data.choices[0].message.content);
      
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setError('Failed to generate recommendations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (id, isPositive) => {
    setFeedbackGiven(prev => ({
      ...prev,
      [id]: isPositive
    }));
    
    // In a real app, you would send this feedback to your backend
    console.log(`User ${isPositive ? 'liked' : 'disliked'} recommendation ${id}`);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-black to-red-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          <h3 className="font-medium">AI-Powered Event Recommendations</h3>
        </div>
        <button 
          onClick={generateRecommendations}
          disabled={isLoading}
          className="text-sm bg-white text-red-600 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
            <span className="ml-3 text-gray-600">Generating personalized recommendations...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 p-4 text-center">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map(event => (
              <div key={event.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div 
                  className="h-40 bg-gray-200 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${event.imageUrl})` }}
                ></div>
                <div className="p-4">
                  <h4 className="font-semibold text-lg mb-1">{event.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{event.type}</p>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {event.location}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {event.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <button className="text-sm bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors">
                      View Details
                    </button>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleFeedback(event.id, true)}
                        className={`p-1 rounded-full ${feedbackGiven[event.id] === true ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                        aria-label="Like"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleFeedback(event.id, false)}
                        className={`p-1 rounded-full ${feedbackGiven[event.id] === false ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                        aria-label="Dislike"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIEventRecommender; 