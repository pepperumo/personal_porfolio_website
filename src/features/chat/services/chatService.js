import { CircuitBreaker } from '../utils/circuitBreaker';
import { 
  APIError, 
  RateLimitError, 
  NetworkError, 
  ServiceUnavailableError,
  TimeoutError
} from '../utils/errorTypes';

/**
 * Configuration for the chat service
 */
const CONFIG = {
  API_ENDPOINT: process.env.REACT_APP_PEPPEGPT_API || 'https://pepperumo-peppegpt.hf.space/api/chat',
  TIMEOUT: 30000, // 30 seconds for HF Spaces
  MAX_RETRIES: 2,
  RETRY_DELAY: 2000, // 2 second base delay
  MAX_MESSAGE_LENGTH: 800
};

/**
 * Chat Service for communicating with Hugging Face Spaces API
 * Implements comprehensive error handling, retry logic, and circuit breaker pattern
 */
class ChatService {
  constructor() {
    this.circuitBreaker = new CircuitBreaker({
      threshold: 5,
      timeout: 60000,
      resetTimeout: 300000
    });
    this.abortController = null;
  }

  /**
   * Send a message to the AI chat API
   * @param {Object} request - Chat request object
   * @param {string} request.sessionId - Unique session identifier
   * @param {string} request.message - User message
   * @param {Array} request.history - Previous conversation history
   * @param {number} request.topK - Number of context sources to retrieve
   * @param {number} request.maxTokens - Maximum tokens in response
   * @returns {Promise<Object>} API response
   */
  async sendMessage(request) {
    // Validate request
    if (!request.message || request.message.trim().length === 0) {
      throw new APIError(400, 'Message cannot be empty', 'BAD_REQUEST');
    }
    
    if (request.message.length > CONFIG.MAX_MESSAGE_LENGTH) {
      throw new APIError(400, `Message too long (max ${CONFIG.MAX_MESSAGE_LENGTH} characters)`, 'BAD_REQUEST');
    }

    try {
      return await this._executeWithRetry(request);
    } catch (error) {
      return this._handleError(error);
    }
  }

  /**
   * Execute request with retry logic and exponential backoff
   * @private
   * @param {Object} request - Chat request object
   * @returns {Promise<Object>} API response
   */
  async _executeWithRetry(request) {
    let lastError;
    
    for (let attempt = 0; attempt < CONFIG.MAX_RETRIES; attempt++) {
      try {
        return await this.circuitBreaker.call(
          this._makeRequest.bind(this),
          request
        );
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (
          error instanceof RateLimitError ||
          error.code === 'BAD_REQUEST'
        ) {
          throw error;
        }
        
        // Calculate exponential backoff delay
        if (attempt < CONFIG.MAX_RETRIES - 1) {
          const delay = CONFIG.RETRY_DELAY * Math.pow(2, attempt);
          await this._delay(delay);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Make the actual HTTP request to the API
   * @private
   * @param {Object} request - Chat request object
   * @returns {Promise<Object>} API response
   */
  async _makeRequest(request) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, CONFIG.TIMEOUT);

    try {
      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: request.message.trim(),
          session_id: request.sessionId,
          history: request.history || [],
          max_context_chunks: request.topK || 4,
          min_confidence: 0.3
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this._handleHttpError(response);
      }

      const data = await response.json();
      return this._validateResponse(data);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new TimeoutError();
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError(error);
      }
      
      throw error;
    }
  }

  /**
   * Handle HTTP error responses
   * @private
   * @param {Response} response - Fetch response object
   */
  async _handleHttpError(response) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    switch (response.status) {
      case 429:
        const retryAfter = response.headers.get('Retry-After');
        throw new RateLimitError(retryAfter ? parseInt(retryAfter) : null);
      
      case 503:
        throw new ServiceUnavailableError();
      
      case 400:
        throw new APIError(400, errorData.message || 'Bad request', 'BAD_REQUEST');
      
      default:
        throw new APIError(
          response.status, 
          errorData.message || `HTTP ${response.status}`,
          'API_ERROR'
        );
    }
  }

  /**
   * Validate and sanitize API response
   * @private
   * @param {Object} data - Raw API response
   * @returns {Object} Validated response
   */
  _validateResponse(data) {
    if (!data || typeof data !== 'object') {
      throw new APIError(500, 'Invalid response format', 'INVALID_RESPONSE');
    }

    return {
      text: data.response || data.text || '',  // Backend uses 'response' field, fallback to 'text'
      sources: Array.isArray(data.sources) ? data.sources : [],
      usage: data.usage || { latencyMs: 0, model: 'unknown', cached: false },
      confidence: typeof data.confidence === 'number' ? data.confidence : 0
    };
  }

  /**
   * Handle errors and return appropriate fallback responses
   * @private
   * @param {Error} error - Error object
   * @returns {Object} Fallback response
   */
  _handleError(error) {
    console.error('ChatService error:', error);

    // Return error response that the UI can handle
    throw error;
  }

  /**
   * Delay execution for retry logic
   * @private
   * @param {number} ms - Delay in milliseconds
   * @returns {Promise} Promise that resolves after delay
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if the service is healthy
   * @returns {Promise<boolean>} Service health status
   */
  async checkHealth() {
    try {
      const healthEndpoint = CONFIG.API_ENDPOINT.replace('/chat', '/health');
      const response = await fetch(healthEndpoint, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get circuit breaker status
   * @returns {Object} Circuit breaker status
   */
  getStatus() {
    return {
      circuitBreaker: this.circuitBreaker.getStatus(),
      isHealthy: true // Will be updated by health checks
    };
  }

  /**
   * Reset the circuit breaker
   */
  reset() {
    this.circuitBreaker.reset();
  }
}

// Export singleton instance
const chatService = new ChatService();
export default chatService;