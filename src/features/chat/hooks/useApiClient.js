import { useState, useCallback, useRef } from 'react';
import chatService from '../services/chatService';
import { getErrorHandler } from '../utils/errorTypes';

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
 * Custom hook for managing API client state and operations
 * Provides loading states, error handling, and message sending functionality
 */
export const useApiClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const sessionIdRef = useRef(generateUUID());

  /**
   * Send a message to the chat API
   * @param {string} message - User message
   * @param {Array} history - Conversation history
   * @returns {Promise<Object|null>} API response or null if cancelled
   */
  const sendMessage = useCallback(async (message, history = []) => {
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage({
        sessionId: sessionIdRef.current,
        message: message.trim(),
        history: history.slice(-6), // Keep last 6 turns for free-tier compliance
        topK: 4,
        maxTokens: 256
      });

      setIsConnected(true);
      return response;
    } catch (err) {
      console.error('API client error:', err);
      
      // Handle different error types
      const errorHandler = getErrorHandler(err);
      setError({
        ...errorHandler,
        originalError: err
      });

      // Update connection status based on error type
      if (err.code === 'NETWORK_ERROR' || err.code === 'SERVICE_UNAVAILABLE') {
        setIsConnected(false);
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check API health status
   * @returns {Promise<boolean>} Health status
   */
  const checkHealth = useCallback(async () => {
    try {
      const isHealthy = await chatService.checkHealth();
      setIsConnected(isHealthy);
      return isHealthy;
    } catch {
      setIsConnected(false);
      return false;
    }
  }, []);

  /**
   * Clear current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset the API client state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setIsConnected(true);
    sessionIdRef.current = generateUUID();
    chatService.reset();
  }, []);

  /**
   * Get current API client status
   * @returns {Object} Status information
   */
  const getStatus = useCallback(() => {
    return {
      isLoading,
      error,
      isConnected,
      sessionId: sessionIdRef.current,
      serviceStatus: chatService.getStatus()
    };
  }, [isLoading, error, isConnected]);

  return {
    // State
    isLoading,
    error,
    isConnected,
    
    // Actions
    sendMessage,
    checkHealth,
    clearError,
    reset,
    getStatus
  };
};