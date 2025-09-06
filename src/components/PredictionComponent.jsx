import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Plus, Clock, Users, Trophy, Coins, Target, Zap } from 'lucide-react';

const PredictionComponent = ({ roomId }) => {
  const [predictions, setPredictions] = useState([]);
  const [showCreatePrediction, setShowCreatePrediction] = useState(false);
  const [newPrediction, setNewPrediction] = useState({
    title: '',
    description: '',
    options: [{ text: '', odds: 2.0 }, { text: '', odds: 2.0 }],
    category: 'general',
    expiresAt: null
  });

  // Mock predictions data
  useEffect(() => {
    const mockPredictions = [
      {
        id: 1,
        title: "Who will win the Champions League Final?",
        description: "Place your bets on the ultimate football showdown",
        options: [
          { text: "Real Madrid", odds: 1.8, totalBets: 150, bets: [] },
          { text: "Manchester City", odds: 2.1, totalBets: 120, bets: [] },
          { text: "Draw", odds: 3.2, totalBets: 45, bets: [] }
        ],
        category: 'sports',
        totalBets: 315,
        isActive: true,
        expiresAt: new Date(Date.now() + 7200000), // 2 hours from now
        creator: { name: 'Alex', profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg' },
        createdAt: new Date(Date.now() - 1800000) // 30 minutes ago
      },
      {
        id: 2,
        title: "Will the DJ play your favorite song tonight?",
        description: "Predict if your most requested track will make it to the playlist",
        options: [
          { text: "Yes, definitely!", odds: 1.5, totalBets: 200, bets: [] },
          { text: "Maybe", odds: 2.8, totalBets: 80, bets: [] },
          { text: "No way", odds: 4.0, totalBets: 30, bets: [] }
        ],
        category: 'entertainment',
        totalBets: 310,
        isActive: true,
        expiresAt: new Date(Date.now() + 10800000), // 3 hours from now
        creator: { name: 'Sarah', profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg' },
        createdAt: new Date(Date.now() - 900000) // 15 minutes ago
      }
    ];
    setPredictions(mockPredictions);
  }, []);

  const handlePlaceBet = (predictionId, optionIndex, amount) => {
    setPredictions(predictions.map(prediction => {
      if (prediction.id === predictionId) {
        const updatedOptions = prediction.options.map((option, index) => {
          if (index === optionIndex) {
            return { ...option, totalBets: option.totalBets + amount };
          }
          return option;
        });
        return {
          ...prediction,
          options: updatedOptions,
          totalBets: prediction.totalBets + amount
        };
      }
      return prediction;
    }));
  };

  const handleCreatePrediction = () => {
    if (newPrediction.title.trim() && newPrediction.options.every(opt => opt.text.trim())) {
      const prediction = {
        id: predictions.length + 1,
        title: newPrediction.title,
        description: newPrediction.description,
        options: newPrediction.options.map(opt => ({ 
          text: opt.text, 
          odds: opt.odds, 
          totalBets: 0, 
          bets: [] 
        })),
        category: newPrediction.category,
        totalBets: 0,
        isActive: true,
        expiresAt: newPrediction.expiresAt,
        creator: { name: 'You', profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg' },
        createdAt: new Date()
      };
      setPredictions([prediction, ...predictions]);
      setNewPrediction({
        title: '',
        description: '',
        options: [{ text: '', odds: 2.0 }, { text: '', odds: 2.0 }],
        category: 'general',
        expiresAt: null
      });
      setShowCreatePrediction(false);
    }
  };

  const addOption = () => {
    setNewPrediction({ 
      ...newPrediction, 
      options: [...newPrediction.options, { text: '', odds: 2.0 }] 
    });
  };

  const updateOption = (index, field, value) => {
    const options = [...newPrediction.options];
    options[index][field] = value;
    setNewPrediction({ ...newPrediction, options });
  };

  const removeOption = (index) => {
    if (newPrediction.options.length > 2) {
      const options = newPrediction.options.filter((_, i) => i !== index);
      setNewPrediction({ ...newPrediction, options });
    }
  };

  const formatTimeRemaining = (expiresAt) => {
    if (!expiresAt) return 'No expiry';
    const now = new Date();
    const diff = expiresAt - now;
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'sports': return <Trophy className="w-4 h-4" />;
      case 'entertainment': return <Zap className="w-4 h-4" />;
      case 'event-specific': return <Target className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'sports': return 'text-yellow-400 bg-yellow-400/20';
      case 'entertainment': return 'text-purple-400 bg-purple-400/20';
      case 'event-specific': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Prediction Battles</h2>
            <p className="text-gray-400 text-sm">Make predictions and win loyalty points</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCreatePrediction(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus size={16} />
          Create Prediction
        </button>
      </div>

      {/* Create Prediction Modal */}
      <AnimatePresence>
        {showCreatePrediction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-white mb-4">Create New Prediction</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={newPrediction.title}
                    onChange={(e) => setNewPrediction({ ...newPrediction, title: e.target.value })}
                    placeholder="What are you predicting?"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newPrediction.description}
                    onChange={(e) => setNewPrediction({ ...newPrediction, description: e.target.value })}
                    placeholder="Add more details about your prediction"
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Category</label>
                  <select
                    value={newPrediction.category}
                    onChange={(e) => setNewPrediction({ ...newPrediction, category: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="general">General</option>
                    <option value="sports">Sports</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="event-specific">Event Specific</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Options</label>
                  {newPrediction.options.map((option, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="number"
                        value={option.odds}
                        onChange={(e) => updateOption(index, 'odds', parseFloat(e.target.value))}
                        min="1.01"
                        step="0.1"
                        className="w-20 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      {newPrediction.options.length > 2 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    onClick={addOption}
                    className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    <Plus size={16} />
                    Add Option
                  </button>
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Expires In</label>
                  <select
                    value={newPrediction.expiresAt ? 'custom' : 'never'}
                    onChange={(e) => {
                      if (e.target.value === 'never') {
                        setNewPrediction({ ...newPrediction, expiresAt: null });
                      } else {
                        const hours = parseInt(e.target.value);
                        setNewPrediction({ ...newPrediction, expiresAt: new Date(Date.now() + hours * 3600000) });
                      }
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="never">Never</option>
                    <option value="1">1 Hour</option>
                    <option value="2">2 Hours</option>
                    <option value="6">6 Hours</option>
                    <option value="24">24 Hours</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreatePrediction(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePrediction}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Create Prediction
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Predictions List */}
      <div className="space-y-4">
        {predictions.map((prediction) => (
          <motion.div
            key={prediction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getCategoryColor(prediction.category)}`}>
                    {getCategoryIcon(prediction.category)}
                    {prediction.category}
                  </span>
                  {prediction.isActive && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                      Active
                    </span>
                  )}
                </div>
                
                <h3 className="text-white font-medium mb-2">{prediction.title}</h3>
                {prediction.description && (
                  <p className="text-gray-400 text-sm mb-3">{prediction.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Coins size={14} />
                    {prediction.totalBets} total bets
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatTimeRemaining(prediction.expiresAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <img
                      src={prediction.creator.profilePicture}
                      alt={prediction.creator.name}
                      className="w-4 h-4 rounded-full"
                    />
                    {prediction.creator.name}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {prediction.options.map((option, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">{option.text}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-400 font-bold">{option.odds}x</span>
                      <span className="text-gray-400 text-sm">{option.totalBets} bets</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {[10, 25, 50, 100].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handlePlaceBet(prediction.id, index, amount)}
                        className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors text-sm"
                      >
                        {amount}
                      </button>
                    ))}
                    <button className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                      Custom
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      
      {predictions.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-white font-medium mb-2">No predictions yet</h3>
          <p className="text-gray-400">Start a prediction battle and see who's the best at forecasting!</p>
        </div>
      )}
    </div>
  );
};

export default PredictionComponent;
