import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Plus, Clock, Users, CheckCircle } from 'lucide-react';

const PollComponent = ({ roomId }) => {
  const [polls, setPolls] = useState([]);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    expiresAt: null
  });

  // Mock polls data
  useEffect(() => {
    const mockPolls = [
      {
        id: 1,
        question: "What's your favorite part of this event?",
        options: [
          { text: "The music", votes: 15, voters: [] },
          { text: "The atmosphere", votes: 8, voters: [] },
          { text: "Meeting new people", votes: 12, voters: [] },
          { text: "The drinks", votes: 6, voters: [] }
        ],
        totalVotes: 41,
        isActive: true,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        creator: { name: 'Alex', profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg' },
        createdAt: new Date(Date.now() - 1800000) // 30 minutes ago
      },
      {
        id: 2,
        question: "Should we have more events like this?",
        options: [
          { text: "Absolutely!", votes: 25, voters: [] },
          { text: "Maybe", votes: 3, voters: [] },
          { text: "Not really", votes: 1, voters: [] }
        ],
        totalVotes: 29,
        isActive: true,
        expiresAt: new Date(Date.now() + 7200000), // 2 hours from now
        creator: { name: 'Sarah', profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg' },
        createdAt: new Date(Date.now() - 900000) // 15 minutes ago
      }
    ];
    setPolls(mockPolls);
  }, []);

  const handleVote = (pollId, optionIndex) => {
    setPolls(polls.map(poll => {
      if (poll.id === pollId) {
        const updatedOptions = poll.options.map((option, index) => {
          if (index === optionIndex) {
            return { ...option, votes: option.votes + 1 };
          }
          return option;
        });
        return {
          ...poll,
          options: updatedOptions,
          totalVotes: poll.totalVotes + 1
        };
      }
      return poll;
    }));
  };

  const handleCreatePoll = () => {
    if (newPoll.question.trim() && newPoll.options.every(opt => opt.trim())) {
      const poll = {
        id: polls.length + 1,
        question: newPoll.question,
        options: newPoll.options.map(opt => ({ text: opt, votes: 0, voters: [] })),
        totalVotes: 0,
        isActive: true,
        expiresAt: newPoll.expiresAt,
        creator: { name: 'You', profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg' },
        createdAt: new Date()
      };
      setPolls([poll, ...polls]);
      setNewPoll({ question: '', options: ['', ''], expiresAt: null });
      setShowCreatePoll(false);
    }
  };

  const addOption = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
  };

  const updateOption = (index, value) => {
    const options = [...newPoll.options];
    options[index] = value;
    setNewPoll({ ...newPoll, options });
  };

  const removeOption = (index) => {
    if (newPoll.options.length > 2) {
      const options = newPoll.options.filter((_, i) => i !== index);
      setNewPoll({ ...newPoll, options });
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

  const getPercentage = (votes, total) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <BarChart3 className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Live Polls</h2>
            <p className="text-gray-400 text-sm">Vote and see real-time results</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCreatePoll(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <Plus size={16} />
          Create Poll
        </button>
      </div>

      {/* Create Poll Modal */}
      <AnimatePresence>
        {showCreatePoll && (
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
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">Create New Poll</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Question</label>
                  <input
                    type="text"
                    value={newPoll.question}
                    onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                    placeholder="What would you like to ask?"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Options</label>
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      {newPoll.options.length > 2 && (
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
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Plus size={16} />
                    Add Option
                  </button>
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Expires In</label>
                  <select
                    value={newPoll.expiresAt ? 'custom' : 'never'}
                    onChange={(e) => {
                      if (e.target.value === 'never') {
                        setNewPoll({ ...newPoll, expiresAt: null });
                      } else {
                        const hours = parseInt(e.target.value);
                        setNewPoll({ ...newPoll, expiresAt: new Date(Date.now() + hours * 3600000) });
                      }
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  onClick={() => setShowCreatePoll(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePoll}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Create Poll
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Polls List */}
      <div className="space-y-4">
        {polls.map((poll) => (
          <motion.div
            key={poll.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-white font-medium mb-2">{poll.question}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    {poll.totalVotes} votes
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatTimeRemaining(poll.expiresAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <img
                      src={poll.creator.profilePicture}
                      alt={poll.creator.name}
                      className="w-4 h-4 rounded-full"
                    />
                    {poll.creator.name}
                  </div>
                </div>
              </div>
              
              {poll.isActive && (
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Live
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {poll.options.map((option, index) => {
                const percentage = getPercentage(option.votes, poll.totalVotes);
                return (
                  <div key={index} className="relative">
                    <button
                      onClick={() => handleVote(poll.id, index)}
                      className="w-full text-left p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{option.text}</span>
                        <span className="text-gray-400 text-sm">{option.votes} votes</span>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5 }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        />
                      </div>
                      
                      <div className="text-right mt-1">
                        <span className="text-gray-400 text-sm">{percentage}%</span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
      
      {polls.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-white font-medium mb-2">No polls yet</h3>
          <p className="text-gray-400">Be the first to create a poll and get the conversation started!</p>
        </div>
      )}
    </div>
  );
};

export default PollComponent;
