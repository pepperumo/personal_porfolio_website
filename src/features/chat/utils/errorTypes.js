/**
 * Custom error types for chat API communication
 */

/**
 * Base API Error class
 */
export class APIError extends Error {
  constructor(status, message, code = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Rate limiting error
 */
export class RateLimitError extends APIError {
  constructor(retryAfter = null) {
    super(429, 'Rate limit exceeded', 'RATE_LIMIT');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Network connectivity error
 */
export class NetworkError extends APIError {
  constructor(originalError = null) {
    super(0, 'Network connection failed', 'NETWORK_ERROR');
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

/**
 * Service unavailable error
 */
export class ServiceUnavailableError extends APIError {
  constructor() {
    super(503, 'Service temporarily unavailable', 'SERVICE_UNAVAILABLE');
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Circuit breaker open error
 */
export class CircuitBreakerError extends Error {
  constructor() {
    super('Circuit breaker is open');
    this.name = 'CircuitBreakerError';
    this.code = 'CIRCUIT_BREAKER_OPEN';
  }
}

/**
 * Request timeout error
 */
export class TimeoutError extends Error {
  constructor() {
    super('Request timed out');
    this.name = 'TimeoutError';
    this.code = 'TIMEOUT';
  }
}

/**
 * Error response handlers for user-friendly messages
 */
export const ERROR_HANDLERS = {
  NETWORK_ERROR: {
    message: "I'm having trouble connecting. You can browse the portfolio directly.",
    action: "retry",
    fallback: "portfolio_navigation"
  },
  RATE_LIMIT: {
    message: "I'm busy right now. Try these suggested questions or explore the portfolio.",
    action: "show_suggestions",
    cooldown: true
  },
  SERVICE_UNAVAILABLE: {
    message: "I'm temporarily unavailable. Please use the portfolio sections above.",
    action: "disable_widget",
    fallback: "portfolio_focus"
  },
  CIRCUIT_BREAKER_OPEN: {
    message: "I need a moment to recover. Please try again shortly.",
    action: "disable_input",
    recovery: "automatic"
  },
  TIMEOUT: {
    message: "That's taking longer than expected. Please try again.",
    action: "retry",
    fallback: "show_suggestions"
  }
};

/**
 * Get user-friendly error response for a given error
 * @param {Error} error - The error object
 * @returns {Object} Error handler configuration
 */
export const getErrorHandler = (error) => {
  if (error.code && ERROR_HANDLERS[error.code]) {
    return ERROR_HANDLERS[error.code];
  }
  
  // Default fallback
  return {
    message: "Something went wrong. Please try again or explore the portfolio directly.",
    action: "retry",
    fallback: "portfolio_focus"
  };
};