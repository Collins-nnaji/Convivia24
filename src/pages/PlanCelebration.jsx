import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Wine, CheckCircle, Sparkles, Clock, DollarSign, Loader2, PieChart, Camera, ArrowRight, ChevronDown, Coffee, GlassWater, Beer, AlertTriangle, Martini } from 'lucide-react';
import aiService from '../services/aiService';
import { motion, AnimatePresence } from 'framer-motion';

const PlanCelebration = () => {
  const navigate = useNavigate();
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState('');
  const [requirements, setRequirements] = useState('');
  const [budget, setBudget] = useState('');
  const [eventDuration, setEventDuration] = useState('4');
  
  // Beverages selection (replacing supplier field)
  const [beverages, setBeverages] = useState({
    wine: false,
    champagne: false,
    spirits: false,
    beer: false,
    cocktails: false,
    nonAlcoholic: false
  });
  
  // AI recommendation states
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState('');
  const [drinkMenu, setDrinkMenu] = useState('');
  const [budgetEstimation, setBudgetEstimation] = useState('');
  const [suggestedVenues, setSuggestedVenues] = useState('');
  const [activeTab, setActiveTab] = useState('recommendations');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  
  // Cost estimates
  const [costBreakdown, setCostBreakdown] = useState({
    venue: 0,
    catering: 0,
    beverages: 0,
    entertainment: 0,
    decor: 0,
    staffing: 0,
    total: 0
  });

  const handleBeverageChange = (beverage) => {
    setBeverages(prev => ({
      ...prev,
      [beverage]: !prev[beverage]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!eventType || !eventDate || !location || !guests) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Get selected beverage types
    const selectedBeverages = Object.entries(beverages)
      .filter(([_, isSelected]) => isSelected)
      .map(([beverage]) => beverage);
    
    const eventDetails = { 
      eventType, 
      eventDate, 
      location, 
      guests,
      budget,
      eventDuration, 
      requirements,
      beverages: selectedBeverages.join(', ')
    };
    
    try {
      // Generate recommendations in parallel
      const [recommendationsResult, drinkMenuResult, budgetEstimationResult, venuesResult] = await Promise.all([
        aiService.generateEventRecommendations(eventDetails),
        aiService.generateDrinkMenu(eventDetails),
        aiService.generateBudgetEstimation(eventDetails),
        aiService.generateVenueRecommendations(eventDetails)
      ]);
      
      setRecommendations(recommendationsResult);
      setDrinkMenu(drinkMenuResult);
      setBudgetEstimation(budgetEstimationResult);
      setSuggestedVenues(venuesResult);
      
      // Generate simplified cost breakdown based on inputs
      // In a real app, this would come from the AI or backend
      const guestCount = parseInt(guests);
      const durationHours = parseInt(eventDuration);
      const estimatedCosts = {
        venue: guestCount * 25,
        catering: guestCount * 35,
        beverages: selectedBeverages.length * guestCount * 12,
        entertainment: 1500 + (guestCount > 100 ? 500 : 0),
        decor: guestCount * 15,
        staffing: Math.ceil(guestCount / 20) * 100 * durationHours,
      };
      
      estimatedCosts.total = Object.values(estimatedCosts).reduce((sum, cost) => sum + cost, 0);
      setCostBreakdown(estimatedCosts);
      
      // Show budget alert if user specified a budget and our estimate exceeds it
      if (budget && parseInt(budget) < estimatedCosts.total) {
        setShowBudgetAlert(true);
      }
      
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
    navigate('/events');
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render the form based on current step
  const renderFormStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Event Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventType">
                  Event Type <span className="text-red-500">*</span>
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
                  <option value="birthday">Birthday Party</option>
                  <option value="engagement">Engagement Party</option>
                  <option value="traditional">Traditional Ceremony</option>
                  <option value="reunion">Family Reunion</option>
                  <option value="graduation">Graduation Party</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventDate">
                  Event Date <span className="text-red-500">*</span>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  id="location"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter city/location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guests">
                  Number of Guests <span className="text-red-500">*</span>
                </label>
                <input
                  id="guests"
                  type="number"
                  min="1"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter number of guests"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="budget">
                  Budget (₦ or £)
                </label>
                <input
                  id="budget"
                  type="number"
                  min="0"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Optional: Enter your budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventDuration">
                  Event Duration (hours)
                </label>
                <select
                  id="eventDuration"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={eventDuration}
                  onChange={(e) => setEventDuration(e.target.value)}
                >
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="5">5 hours</option>
                  <option value="6">6 hours</option>
                  <option value="8">8 hours</option>
                  <option value="12">12 hours (Full Day)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              >
                Next: Beverages & Requirements <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Beverages & Special Requirements</h3>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Beverage Types (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className={`border rounded-lg p-4 cursor-pointer transition-all ${beverages.wine ? 'border-red-500 bg-red-50' : 'hover:border-red-300'}`} onClick={() => handleBeverageChange('wine')}>
                  <div className="flex items-center">
                    <Wine className={`h-5 w-5 mr-2 ${beverages.wine ? 'text-red-500' : 'text-gray-500'}`} />
                    <span className="text-sm">Wine</span>
                  </div>
                  {beverages.wine && <CheckCircle className="w-4 h-4 text-red-500 ml-auto" />}
                </div>
                
                <div className={`border rounded-lg p-4 cursor-pointer transition-all ${beverages.champagne ? 'border-red-500 bg-red-50' : 'hover:border-red-300'}`} onClick={() => handleBeverageChange('champagne')}>
                  <div className="flex items-center">
                    <GlassWater className={`h-5 w-5 mr-2 ${beverages.champagne ? 'text-red-500' : 'text-gray-500'}`} />
                    <span className="text-sm">Champagne</span>
                  </div>
                  {beverages.champagne && <CheckCircle className="w-4 h-4 text-red-500 ml-auto" />}
                </div>
                
                <div className={`border rounded-lg p-4 cursor-pointer transition-all ${beverages.spirits ? 'border-red-500 bg-red-50' : 'hover:border-red-300'}`} onClick={() => handleBeverageChange('spirits')}>
                  <div className="flex items-center">
                    <Martini className={`h-5 w-5 mr-2 ${beverages.spirits ? 'text-red-500' : 'text-gray-500'}`} />
                    <span className="text-sm">Spirits</span>
                  </div>
                  {beverages.spirits && <CheckCircle className="w-4 h-4 text-red-500 ml-auto" />}
                </div>
                
                <div className={`border rounded-lg p-4 cursor-pointer transition-all ${beverages.beer ? 'border-red-500 bg-red-50' : 'hover:border-red-300'}`} onClick={() => handleBeverageChange('beer')}>
                  <div className="flex items-center">
                    <Beer className={`h-5 w-5 mr-2 ${beverages.beer ? 'text-red-500' : 'text-gray-500'}`} />
                    <span className="text-sm">Beer</span>
                  </div>
                  {beverages.beer && <CheckCircle className="w-4 h-4 text-red-500 ml-auto" />}
                </div>
                
                <div className={`border rounded-lg p-4 cursor-pointer transition-all ${beverages.cocktails ? 'border-red-500 bg-red-50' : 'hover:border-red-300'}`} onClick={() => handleBeverageChange('cocktails')}>
                  <div className="flex items-center">
                    <Wine className={`h-5 w-5 mr-2 ${beverages.cocktails ? 'text-red-500' : 'text-gray-500'}`} />
                    <span className="text-sm">Cocktails</span>
                  </div>
                  {beverages.cocktails && <CheckCircle className="w-4 h-4 text-red-500 ml-auto" />}
                </div>
                
                <div className={`border rounded-lg p-4 cursor-pointer transition-all ${beverages.nonAlcoholic ? 'border-red-500 bg-red-50' : 'hover:border-red-300'}`} onClick={() => handleBeverageChange('nonAlcoholic')}>
                  <div className="flex items-center">
                    <Coffee className={`h-5 w-5 mr-2 ${beverages.nonAlcoholic ? 'text-red-500' : 'text-gray-500'}`} />
                    <span className="text-sm">Non-Alcoholic</span>
                  </div>
                  {beverages.nonAlcoholic && <CheckCircle className="w-4 h-4 text-red-500 ml-auto" />}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requirements">
                Special Requirements
              </label>
              <textarea
                id="requirements"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter any specific requirements (e.g., theme, color scheme, dietary restrictions, entertainment preferences)"
                rows="4"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              >
                Next: Preview & Submit <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </motion.div>
        );
        
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Preview & Submit</h3>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-bold text-lg mb-4">Event Summary</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Event Type</p>
                    <p className="font-medium">{eventType ? eventType.charAt(0).toUpperCase() + eventType.slice(1) : 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Date & Duration</p>
                    <p className="font-medium">
                      {eventDate ? new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'} • {eventDuration} hours
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{location || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Guests</p>
                    <p className="font-medium">{guests || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Wine className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Beverages</p>
                    <p className="font-medium">
                      {Object.entries(beverages)
                        .filter(([_, isSelected]) => isSelected)
                        .map(([beverage]) => beverage.charAt(0).toUpperCase() + beverage.slice(1))
                        .join(', ') || 'None selected'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-medium">{budget ? `${budget} ${location && location.toLowerCase().includes('nigeria') ? '₦' : '£'}` : 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              {requirements && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Special Requirements</p>
                  <p className="font-medium">{requirements}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Event Plan
                  </>
                )}
              </button>
            </div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  const renderRecommendationTabs = () => {
    return (
      <div className="flex overflow-x-auto border-b">
        <button
          className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'recommendations' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <Sparkles className="h-4 w-4 inline mr-2" />
          Recommendations
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'venues' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('venues')}
        >
          <MapPin className="h-4 w-4 inline mr-2" />
          Venues
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
          Budget
        </button>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'recommendations':
        return (
          <div className="p-6">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: recommendations.replace(/\n/g, '<br />') }} />
          </div>
        );
        
      case 'venues':
        return (
          <div className="p-6">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: suggestedVenues.replace(/\n/g, '<br />') }} />
          </div>
        );
        
      case 'drinkMenu':
        return (
          <div className="p-6">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drinkMenu.replace(/\n/g, '<br />') }} />
          </div>
        );
        
      case 'budget':
        return (
          <div className="p-6">
            <AnimatePresence>
              {showBudgetAlert && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6"
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <span className="font-medium">Attention:</span> The estimated cost exceeds your specified budget by {(costBreakdown.total - parseInt(budget)).toLocaleString()} {location && location.toLowerCase().includes('nigeria') ? '₦' : '£'}. See the AI recommendations for cost-saving tips.
                      </p>
                      <button 
                        className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600"
                        onClick={() => setShowBudgetAlert(false)}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4">Cost Estimate Breakdown</h4>
              <div className="grid gap-4 mb-6">
                {Object.entries(costBreakdown).filter(([key]) => key !== 'total').map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getColorForCategory(key) }}></div>
                      <span className="capitalize">{key}</span>
                    </div>
                    <span className="font-medium">{value.toLocaleString()} {location && location.toLowerCase().includes('nigeria') ? '₦' : '£'}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center font-bold">
                  <span>Total Estimated Cost</span>
                  <span>{costBreakdown.total.toLocaleString()} {location && location.toLowerCase().includes('nigeria') ? '₦' : '£'}</span>
                </div>
              </div>
              
              <div className="relative h-60">
                <PieChart className="h-full w-full absolute" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{costBreakdown.total.toLocaleString()}</span>
                  <span className="text-gray-500">{location && location.toLowerCase().includes('nigeria') ? '₦' : '£'}</span>
                </div>
              </div>
            </div>
            
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: budgetEstimation.replace(/\n/g, '<br />') }} />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Helper function for pie chart colors
  const getColorForCategory = (category) => {
    const colors = {
      venue: '#ef4444',
      catering: '#f97316',
      beverages: '#3b82f6',
      entertainment: '#8b5cf6',
      decor: '#ec4899',
      staffing: '#10b981'
    };
    
    return colors[category] || '#6b7280';
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
                Fill in the details below and our AI assistant will generate personalized recommendations for your celebration, including theme ideas, venue suggestions, drink menus, and budget estimates.
              </p>
              
              <div className="flex items-center justify-center mt-6 space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-red-600' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-red-600' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
                  {error}
                </div>
              )}
              
              <AnimatePresence mode="wait">
                {renderFormStep()}
              </AnimatePresence>
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
            
            {renderRecommendationTabs()}
            {renderTabContent()}
            
            <div className="p-6 border-t bg-gray-50 flex flex-wrap justify-between">
              <button
                onClick={() => setShowRecommendations(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2 sm:mb-0"
              >
                Edit Details
              </button>
              <div className="space-x-4">
                <button
                  onClick={() => window.print()}
                  className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  <Camera className="h-4 w-4 inline mr-2" />
                  Export PDF
                </button>
                <button
                  onClick={handleSaveAndContinue}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Save Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanCelebration;