import { CircuitBreakerError } from './errorTypes';

/**
 * Circuit breaker states
 */
const STATES = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
};

/**
 * Circuit Breaker implementation for API resilience
 * Prevents overwhelming the backend when issues occur
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.threshold || 5;
    this.timeout = options.timeout || 60000; // 1 minute
    this.resetTimeout = options.resetTimeout || 300000; // 5 minutes
    
    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = Date.now();
  }

  /**
   * Execute a function with circuit breaker protection
   * @param {Function} fn - Function to execute
   * @param {...any} args - Arguments to pass to the function
   * @returns {Promise} Result of the function execution
   */
  async call(fn, ...args) {
    if (this.state === STATES.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new CircuitBreakerError();
      }
      
      // Transition to half-open to test if service is back
      this.state = STATES.HALF_OPEN;
    }

    try {
      const result = await Promise.race([
        fn(...args),
        this._createTimeoutPromise()
      ]);
      
      this._onSuccess();
      return result;
    } catch (error) {
      this._onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   * @private
   */
  _onSuccess() {
    this.failureCount = 0;
    this.state = STATES.CLOSED;
  }

  /**
   * Handle failed execution
   * @private
   */
  _onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = STATES.OPEN;
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }

  /**
   * Create a timeout promise
   * @private
   * @returns {Promise} Promise that rejects after timeout
   */
  _createTimeoutPromise() {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Circuit breaker timeout'));
      }, this.timeout);
    });
  }

  /**
   * Get current circuit breaker status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt,
      isOpen: this.state === STATES.OPEN
    };
  }

  /**
   * Reset the circuit breaker to closed state
   */
  reset() {
    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = Date.now();
  }
}