import React, { createContext, useContext, useState, useCallback } from 'react';
import { useApiClient } from '../hooks/useApiClient';

// Fallback UUID generator for test environments
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for test environment
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

/**
 * Context for managing chat state across multiple trigger points
 * (corner launcher and prominent button)
 */
const ChatContext = createContext();

/**
 * Custom hook to use chat context
 * @returns {Object} Chat state and controls
 */
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

/**
 * Provider component for chat state management
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 */
export const ChatProvider = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  
  // API client integration
  const { 
    isLoading, 
    error, 
    isConnected, 
    sendMessage: apiSendMessage, 
    clearError, 
    reset: resetApi,
    getStatus
  } = useApiClient();

  /**
   * Toggle chat panel open/closed state
   */
  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  /**
   * Open chat panel
   */
  const openChat = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  /**
   * Close chat panel
   */
  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  /**
   * Add a message to the conversation
   * @param {Object} message - Message object
   * @param {string} message.role - 'user' or 'assistant'
   * @param {string} message.content - Message content
   * @param {Array} message.sources - Optional sources for assistant messages
   * @param {number} message.confidence - Optional confidence score
   */
  const addMessage = useCallback((message) => {
    const newMessage = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      ...message
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  /**
   * Send a message through the API
   * @param {string} message - User message to send
   */
  const sendMessage = useCallback(async (message) => {
    if (!message || message.trim().length === 0) {
      return;
    }

    // Clear any existing errors
    clearError();

    // Add user message to conversation
    addMessage({
      role: 'user',
      content: message.trim()
    });

    try {
      // Prepare conversation history for API
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Send to API
      const response = await apiSendMessage(message, history);
      
      if (response) {
        // Add assistant response to conversation
        addMessage({
          role: 'assistant',
          content: response.text,
          sources: response.sources || [],
          confidence: response.confidence || 0,
          usage: response.usage
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      
      // Add error message to conversation for user feedback
      addMessage({
        role: 'assistant',
        content: error?.message || "I'm sorry, I couldn't process that message. Please try again.",
        isError: true
      });
    }
  }, [messages, addMessage, apiSendMessage, clearError, error]);

  /**
   * Update current message input
   * @param {string} message - Current input value
   */
  const updateCurrentMessage = useCallback((message) => {
    setCurrentMessage(message);
  }, []);

  /**
   * Clear the conversation history
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    clearError();
  }, [clearError]);

  /**
   * Reset entire chat state
   */
  const resetChat = useCallback(() => {
    setMessages([]);
    setCurrentMessage('');
    setIsChatOpen(false);
    resetApi();
  }, [resetApi]);

  /**
   * Get suggested conversation starters
   * @returns {Array} Array of suggestion objects
   */
  const getSuggestions = useCallback(() => {
    return [
      {
        category: 'Skills & Experience',
        questions: [
          "What programming languages do you know?",
          "Tell me about your recent projects",
          "What's your experience with React?"
        ]
      },
      {
        category: 'Career & Background',
        questions: [
          "What's your professional background?",
          "Where have you worked recently?",
          "What are you looking for in your next role?"
        ]
      },
      {
        category: 'Projects & Portfolio',
        questions: [
          "Show me your best project",
          "What technologies do you enjoy working with?",
          "Tell me about a challenging problem you solved"
        ]
      }
    ];
  }, []);

  const value = {
    // UI State
    isChatOpen,
    toggleChat,
    openChat,
    closeChat,
    
    // Message State
    messages,
    currentMessage,
    updateCurrentMessage,
    
    // API State
    isLoading,
    error,
    isConnected,
    
    // Actions
    sendMessage,
    addMessage,
    clearMessages,
    resetChat,
    clearError,
    getSuggestions,
    getStatus
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;