import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CalendarClock, MapPin, Info, Sparkles } from 'lucide-react';

const ConnectionRequestModal = ({ isOpen, onClose, person, hotspots }) => {
  const [message, setMessage] = useState('');
  const [selectedHotspot, setSelectedHotspot] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle the connection request
    // For example, send to an API or store in state
    onClose();
  };

  if (!person) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          {/* Decorative elements */}
          <motion.div 
            initial={{ opacity: 0, scale: 0, y: -100, x: 100 }}
            animate={{ opacity: 0.6, scale: 1, y: 0, x: 0 }}
            className="absolute top-20 right-20 w-20 h-20 bg-blue-400 rounded-full blur-2xl pointer-events-none"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0, y: 100, x: -100 }}
            animate={{ opacity: 0.6, scale: 1, y: 0, x: 0 }}
            className="absolute bottom-20 left-20 w-20 h-20 bg-indigo-400 rounded-full blur-2xl pointer-events-none"
          />
          
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-xl max-w-md w-full shadow-xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Sparkles className="mr-2 text-blue-200" size={20} />
                Connect with {person.name}
              </h3>
              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-white hover:text-blue-100 transition-colors rounded-full p-1 hover:bg-blue-500 focus:outline-none"
              >
                <X size={24} />
              </motion.button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Introduction Message
                  </label>
                  <motion.textarea
                    whileFocus={{ boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)" }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hi! I noticed we share an interest in photography. Would love to connect!"
                    className="w-full p-3 min-h-[100px] bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-shadow"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <MapPin size={16} className="mr-1 text-blue-500" />
                    Suggest a meeting place
                  </label>
                  <motion.select
                    whileFocus={{ boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)" }}
                    value={selectedHotspot}
                    onChange={(e) => setSelectedHotspot(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition-shadow"
                  >
                    <option value="">-- Select a location --</option>
                    {hotspots.map(hotspot => (
                      <option key={hotspot.id} value={hotspot.id}>
                        {hotspot.name}
                      </option>
                    ))}
                  </motion.select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <CalendarClock size={16} className="mr-1 text-blue-500" />
                    Suggest a date & time
                  </label>
                  <motion.input
                    whileFocus={{ boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)" }}
                    type="datetime-local"
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition-shadow"
                  />
                </div>
                
                <motion.div 
                  initial={{ opacity: 0.8, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
                  className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                >
                  <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                    <Info size={15} className="mr-1" />
                    Safety Reminder
                  </h4>
                  <p className="text-xs text-blue-600">
                    Always meet in public places for your first few meetups. This person will see your suggested meeting details.
                  </p>
                </motion.div>
                
                <div className="flex justify-end">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mr-2 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg flex items-center transition-colors shadow-sm"
                  >
                    <Send size={16} className="mr-2" />
                    Send Request
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionRequestModal; 