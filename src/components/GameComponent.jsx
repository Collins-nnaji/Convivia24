import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, Plus, Users, Trophy, Clock, Play, Pause, 
  Target, Brain, Wine, Music, Zap, Star, Crown
} from 'lucide-react';

const GameComponent = ({ roomId }) => {
  const [games, setGames] = useState([]);
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [newGame, setNewGame] = useState({
    name: '',
    description: '',
    type: 'trivia',
    maxParticipants: 10,
    duration: 15,
    difficulty: 'medium'
  });

  // Mock games data
  useEffect(() => {
    const mockGames = [
      {
        id: 1,
        name: "Music Trivia Night",
        description: "Test your knowledge of music from different eras and genres",
        type: 'trivia',
        status: 'active',
        participants: [
          { user: { name: 'Alex', profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg' }, score: 850 },
          { user: { name: 'Sarah', profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg' }, score: 720 },
          { user: { name: 'Mike', profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg' }, score: 680 }
        ],
        maxParticipants: 10,
        duration: 15,
        difficulty: 'medium',
        host: { name: 'Alex', profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg' },
        startedAt: new Date(Date.now() - 300000), // 5 minutes ago
        questions: [
          {
            question: "Which artist released 'Bohemian Rhapsody'?",
            options: ["The Beatles", "Queen", "Led Zeppelin", "Pink Floyd"],
            correctAnswer: 1
          },
          {
            question: "What year did Michael Jackson release 'Thriller'?",
            options: ["1980", "1982", "1984", "1986"],
            correctAnswer: 1
          }
        ],
        currentQuestion: 0
      },
      {
        id: 2,
        name: "Prediction Battle Royale",
        description: "Compete in real-time predictions about the event",
        type: 'prediction_battle',
        status: 'waiting',
        participants: [
          { user: { name: 'Emma', profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg' }, score: 0 },
          { user: { name: 'John', profilePicture: 'https://randomuser.me/api/portraits/men/5.jpg' }, score: 0 }
        ],
        maxParticipants: 8,
        duration: 20,
        difficulty: 'hard',
        host: { name: 'Emma', profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg' },
        startedAt: null
      },
      {
        id: 3,
        name: "Drinking Game: Never Have I Ever",
        description: "The classic party game with a twist - virtual drinks!",
        type: 'drinking_game',
        status: 'completed',
        participants: [
          { user: { name: 'Lisa', profilePicture: 'https://randomuser.me/api/portraits/women/6.jpg' }, score: 1200 },
          { user: { name: 'Tom', profilePicture: 'https://randomuser.me/api/portraits/men/7.jpg' }, score: 950 },
          { user: { name: 'Anna', profilePicture: 'https://randomuser.me/api/portraits/women/8.jpg' }, score: 1100 }
        ],
        maxParticipants: 12,
        duration: 25,
        difficulty: 'easy',
        host: { name: 'Lisa', profilePicture: 'https://randomuser.me/api/portraits/women/6.jpg' },
        startedAt: new Date(Date.now() - 1800000), // 30 minutes ago
        endedAt: new Date(Date.now() - 300000), // 5 minutes ago
        winner: { name: 'Lisa', profilePicture: 'https://randomuser.me/api/portraits/women/6.jpg' }
      }
    ];
    setGames(mockGames);
  }, []);

  const handleJoinGame = (gameId) => {
    setGames(games.map(game => {
      if (game.id === gameId) {
        const newParticipant = {
          user: { name: 'You', profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg' },
          score: 0
        };
        return {
          ...game,
          participants: [...game.participants, newParticipant]
        };
      }
      return game;
    }));
  };

  const handleStartGame = (gameId) => {
    setGames(games.map(game => {
      if (game.id === gameId) {
        return {
          ...game,
          status: 'active',
          startedAt: new Date()
        };
      }
      return game;
    }));
  };

  const handleCreateGame = () => {
    if (newGame.name.trim() && newGame.description.trim()) {
      const game = {
        id: games.length + 1,
        name: newGame.name,
        description: newGame.description,
        type: newGame.type,
        status: 'waiting',
        participants: [
          { user: { name: 'You', profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg' }, score: 0 }
        ],
        maxParticipants: newGame.maxParticipants,
        duration: newGame.duration,
        difficulty: newGame.difficulty,
        host: { name: 'You', profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg' },
        startedAt: null
      };
      setGames([game, ...games]);
      setNewGame({
        name: '',
        description: '',
        type: 'trivia',
        maxParticipants: 10,
        duration: 15,
        difficulty: 'medium'
      });
      setShowCreateGame(false);
    }
  };

  const getGameIcon = (type) => {
    switch (type) {
      case 'trivia': return <Brain className="w-5 h-5" />;
      case 'prediction_battle': return <Target className="w-5 h-5" />;
      case 'drinking_game': return <Wine className="w-5 h-5" />;
      case 'party_game': return <Music className="w-5 h-5" />;
      default: return <Gamepad2 className="w-5 h-5" />;
    }
  };

  const getGameColor = (type) => {
    switch (type) {
      case 'trivia': return 'text-blue-400 bg-blue-400/20';
      case 'prediction_battle': return 'text-orange-400 bg-orange-400/20';
      case 'drinking_game': return 'text-red-400 bg-red-400/20';
      case 'party_game': return 'text-purple-400 bg-purple-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'text-yellow-400 bg-yellow-400/20';
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'completed': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatDuration = (minutes) => {
    return `${minutes} min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Gamepad2 className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Party Games</h2>
            <p className="text-gray-400 text-sm">Join games and compete with other participants</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCreateGame(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus size={16} />
          Create Game
        </button>
      </div>

      {/* Create Game Modal */}
      <AnimatePresence>
        {showCreateGame && (
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
              <h3 className="text-xl font-bold text-white mb-4">Create New Game</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Game Name</label>
                  <input
                    type="text"
                    value={newGame.name}
                    onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                    placeholder="Enter game name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newGame.description}
                    onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
                    placeholder="Describe your game"
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Game Type</label>
                  <select
                    value={newGame.type}
                    onChange={(e) => setNewGame({ ...newGame, type: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="trivia">Trivia</option>
                    <option value="prediction_battle">Prediction Battle</option>
                    <option value="drinking_game">Drinking Game</option>
                    <option value="party_game">Party Game</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Max Players</label>
                    <input
                      type="number"
                      value={newGame.maxParticipants}
                      onChange={(e) => setNewGame({ ...newGame, maxParticipants: parseInt(e.target.value) })}
                      min="2"
                      max="20"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Duration (min)</label>
                    <input
                      type="number"
                      value={newGame.duration}
                      onChange={(e) => setNewGame({ ...newGame, duration: parseInt(e.target.value) })}
                      min="5"
                      max="60"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={newGame.difficulty}
                    onChange={(e) => setNewGame({ ...newGame, difficulty: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateGame(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGame}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Create Game
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Games List */}
      <div className="space-y-4">
        {games.map((game) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getGameColor(game.type)}`}>
                    {getGameIcon(game.type)}
                    {game.type.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
                    {game.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                    {game.difficulty}
                  </span>
                </div>
                
                <h3 className="text-white font-medium mb-2">{game.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{game.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    {game.participants.length}/{game.maxParticipants} players
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatDuration(game.duration)}
                  </div>
                  <div className="flex items-center gap-1">
                    <img
                      src={game.host.profilePicture}
                      alt={game.host.name}
                      className="w-4 h-4 rounded-full"
                    />
                    {game.host.name}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Participants */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-gray-400" />
                <span className="text-gray-400 text-sm">Participants</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {game.participants.map((participant, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                    <img
                      src={participant.user.profilePicture}
                      alt={participant.user.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-white text-sm">{participant.user.name}</span>
                    {participant.score > 0 && (
                      <span className="text-yellow-400 text-sm font-medium">{participant.score}</span>
                    )}
                    {game.winner && game.winner.name === participant.user.name && (
                      <Crown size={14} className="text-yellow-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Game Actions */}
            <div className="flex gap-3">
              {game.status === 'waiting' && (
                <>
                  <button
                    onClick={() => handleJoinGame(game.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Users size={16} />
                    Join Game
                  </button>
                  {game.host.name === 'You' && (
                    <button
                      onClick={() => handleStartGame(game.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Play size={16} />
                      Start Game
                    </button>
                  )}
                </>
              )}
              
              {game.status === 'active' && (
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm">Game in progress</span>
                </div>
              )}
              
              {game.status === 'completed' && game.winner && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Trophy size={16} />
                  <span className="text-sm">Winner: {game.winner.name}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      {games.length === 0 && (
        <div className="text-center py-12">
          <Gamepad2 size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-white font-medium mb-2">No games yet</h3>
          <p className="text-gray-400">Create a game and get the party started!</p>
        </div>
      )}
    </div>
  );
};

export default GameComponent;
