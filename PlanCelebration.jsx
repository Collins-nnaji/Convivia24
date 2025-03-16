import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Wine, CheckCircle, Sparkles, Clock, DollarSign, Loader2 } from 'lucide-react';
import aiService from './services/aiService';

const PlanCelebration = () => {
  const navigate = useNavigate();
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState('');
  const [requirements, setRequirements] = useState('');
  const [supplier, setSupplier] = useState('');
  
  // AI recommendation states
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState('');
  const [drinkMenu, setDrinkMenu] = useState('');
  const [budgetEstimation, setBudgetEstimation] = useState('');
  const [activeTab, setActiveTab] = useState('recommendations');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!eventType || !eventDate || !location || !guests) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    const eventDetails = { 
      eventType, 
      eventDate, 
      location, 
      guests, 
      requirements, 
      supplier 
    };
    
    try {
      // Generate recommendations in parallel
      const [recommendationsResult, drinkMenuResult, budgetEstimationResult] = await Promise.all([
        aiService.generateEventRecommendations(eventDetails),
        aiService.generateDrinkMenu(eventDetails),
        aiService.generateBudgetEstimation(eventDetails)
      ]);
      
      setRecommendations(recommendationsResult);
      setDrinkMenu(drinkMenuResult);
      setBudgetEstimation(budgetEstimationResult);
      setShowRecommendations(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating AI content:', error);
      setError('Failed to generate recommendations. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleSaveAndContinue = () => {
    // Here you would typically save the event details and recommendations to your backend
    // For now, we'll just redirect to the homepage
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" style={{ fontFamily: 'Raleway, sans-serif' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          Plan Your Celebration
        </h1>
        
        {!showRecommendations ? (
          <>
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Sparkles className="h-5 w-5 text-red-500 mr-2" />
                AI-Powered Event Planning
              </h2>
              <p className="text-gray-600 mb-4">
                Fill in the details below and our AI assistant will generate personalized recommendations for your celebration, including theme ideas, decoration suggestions, drink menus, and budget estimates.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventType">
                  Event Type
                </label>
                <select
                  id="eventType"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  required
                >
                  <option value="">Select an event type</option>
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="party">Private Party</option>
                  <option value="traditional">Traditional Ceremony</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventDate">
                  Event Date
                </label>
                <input
                  id="eventDate"
                  type="date"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guests">
                  Number of Guests
                </label>
                <input
                  id="guests"
                  type="number"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter number of guests"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requirements">
                  Specific Requirements
                </label>
                <textarea
                  id="requirements"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter any specific requirements or preferences (e.g., theme, color scheme, dietary restrictions)"
                  rows="4"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supplier">
                  Preferred Liquor Supplier
                </label>
                <select
                  id="supplier"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  required
                >
                  <option value="">Select a supplier</option>
                  <option value="supplier1">Supplier 1</option>
                  <option value="supplier2">Supplier 2</option>
                  <option value="supplier3">Supplier 3</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Recommendations...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get AI Recommendations
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Your {eventType.charAt(0).toUpperCase() + eventType.slice(1)} Celebration Plan
              </h2>
              <p className="text-gray-600">
                {new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {location} • {guests} Guests
              </p>
            </div>
            
            <div className="border-b">
              <div className="flex overflow-x-auto">
                <button
                  className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'recommendations' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('recommendations')}
                >
                  <Sparkles className="h-4 w-4 inline mr-2" />
                  Recommendations
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'drinkMenu' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('drinkMenu')}
                >
                  <Wine className="h-4 w-4 inline mr-2" />
                  Drink Menu
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'budget' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('budget')}
                >
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  Budget Estimation
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {activeTab === 'recommendations' && (
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">Event Recommendations</h3>
                  <div className="whitespace-pre-line">
                    {recommendations}
                  </div>
                </div>
              )}
              
              {activeTab === 'drinkMenu' && (
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">Customized Drink Menu</h3>
                  <div className="whitespace-pre-line">
                    {drinkMenu}
                  </div>
                </div>
              )}
              
              {activeTab === 'budget' && (
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">Budget Estimation</h3>
                  <div className="whitespace-pre-line">
                    {budgetEstimation}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-gray-50 flex justify-between">
              <button
                onClick={() => setShowRecommendations(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Edit Details
              </button>
              <button
                onClick={handleSaveAndContinue}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Save & Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanCelebration; 