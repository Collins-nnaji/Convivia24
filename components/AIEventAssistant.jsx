import React, { useState } from 'react';
import { Sparkles, Loader2, MessageSquare, Send } from 'lucide-react';
import aiService from '../services/aiService';

/**
 * AI Event Assistant Component
 * A chat-like interface for users to ask questions about event planning
 */
const AIEventAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI Event Assistant. Ask me anything about planning your celebration, drink recommendations, or budget tips!'
    }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user message to conversation
    const userMessage = { role: 'user', content: query };
    setConversation(prev => [...prev, userMessage]);
    
    // Clear input and show loading
    setQuery('');
    setIsLoading(true);
    
    try {
      // Call Azure OpenAI API
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
              content: 'You are an AI assistant for Convivia24, a platform specializing in celebration planning and liquor supply. Provide helpful, concise, and friendly responses to user queries about event planning, drink recommendations, celebration ideas, and budget planning. Keep responses under 150 words unless more detail is specifically requested.'
            },
            ...conversation.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: query }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      const data = await response.json();
      const assistantMessage = { 
        role: 'assistant', 
        content: data.choices[0].message.content 
      };
      
      // Add assistant response to conversation
      setConversation(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling AI service:', error);
      // Add error message to conversation
      setConversation(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again later.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
        aria-label="Open AI Event Assistant"
      >
        {isOpen ? (
          <MessageSquare className="h-6 w-6" />
        ) : (
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            <span className="mr-1">AI Assistant</span>
          </div>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-black to-red-900 text-white p-4 flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            <h3 className="font-medium">AI Event Assistant</h3>
          </div>
          
          {/* Conversation */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96 space-y-4">
            {conversation.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-red-600 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Thinking...
                </div>
              </div>
            )}
          </div>
          
          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 flex">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about event planning..."
              className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="bg-red-600 hover:bg-red-700 text-white rounded-r-md px-4 py-2 flex items-center justify-center disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIEventAssistant; 