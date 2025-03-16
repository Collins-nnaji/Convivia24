import React, { createContext, useContext, useState, useCallback } from 'react';

// Create context
const AIContext = createContext();

/**
 * AI Provider Component
 * Provides AI-related state and functionality to the application
 */
export const AIProvider = ({ children }) => {
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [aiHistory, setAiHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to add an interaction to history
  const addToHistory = useCallback((query, response) => {
    setAiHistory(prev => [
      ...prev,
      {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        query,
        response
      }
    ]);
  }, []);

  // Function to clear history
  const clearHistory = useCallback(() => {
    setAiHistory([]);
  }, []);

  // Function to toggle AI features
  const toggleAI = useCallback(() => {
    setIsAIEnabled(prev => !prev);
  }, []);

  // Context value
  const value = {
    isAIEnabled,
    toggleAI,
    aiHistory,
    addToHistory,
    clearHistory,
    isProcessing,
    setIsProcessing
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

// Custom hook to use the AI context
export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export default AIContext; 