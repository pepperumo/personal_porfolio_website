import {
  APIError,
  RateLimitError,
  NetworkError,
  ServiceUnavailableError,
  CircuitBreakerError,
  TimeoutError,
  getErrorHandler,
  ERROR_HANDLERS
} from '../utils/errorTypes';

describe('Error Types', () => {
  describe('APIError', () => {
    test('creates error with status and message', () => {
      const error = new APIError(500, 'Internal server error', 'SERVER_ERROR');
      
      expect(error.name).toBe('APIError');
      expect(error.status).toBe(500);
      expect(error.message).toBe('Internal server error');
      expect(error.code).toBe('SERVER_ERROR');
    });
  });

  describe('RateLimitError', () => {
    test('creates rate limit error with retry after', () => {
      const error = new RateLimitError(60);
      
      expect(error.name).toBe('RateLimitError');
      expect(error.status).toBe(429);
      expect(error.code).toBe('RATE_LIMIT');
      expect(error.retryAfter).toBe(60);
    });

    test('creates rate limit error without retry after', () => {
      const error = new RateLimitError();
      
      expect(error.retryAfter).toBe(null);
    });
  });

  describe('NetworkError', () => {
    test('creates network error with original error', () => {
      const originalError = new Error('Connection failed');
      const error = new NetworkError(originalError);
      
      expect(error.name).toBe('NetworkError');
      expect(error.status).toBe(0);
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('ServiceUnavailableError', () => {
    test('creates service unavailable error', () => {
      const error = new ServiceUnavailableError();
      
      expect(error.name).toBe('ServiceUnavailableError');
      expect(error.status).toBe(503);
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
    });
  });

  describe('CircuitBreakerError', () => {
    test('creates circuit breaker error', () => {
      const error = new CircuitBreakerError();
      
      expect(error.name).toBe('CircuitBreakerError');
      expect(error.code).toBe('CIRCUIT_BREAKER_OPEN');
      expect(error.message).toBe('Circuit breaker is open');
    });
  });

  describe('TimeoutError', () => {
    test('creates timeout error', () => {
      const error = new TimeoutError();
      
      expect(error.name).toBe('TimeoutError');
      expect(error.code).toBe('TIMEOUT');
      expect(error.message).toBe('Request timed out');
    });
  });

  describe('getErrorHandler', () => {
    test('returns specific handler for known error codes', () => {
      const networkError = new NetworkError();
      const handler = getErrorHandler(networkError);
      
      expect(handler).toEqual(ERROR_HANDLERS.NETWORK_ERROR);
    });

    test('returns rate limit handler for rate limit error', () => {
      const rateLimitError = new RateLimitError();
      const handler = getErrorHandler(rateLimitError);
      
      expect(handler).toEqual(ERROR_HANDLERS.RATE_LIMIT);
    });

    test('returns service unavailable handler', () => {
      const serviceError = new ServiceUnavailableError();
      const handler = getErrorHandler(serviceError);
      
      expect(handler).toEqual(ERROR_HANDLERS.SERVICE_UNAVAILABLE);
    });

    test('returns circuit breaker handler', () => {
      const circuitError = new CircuitBreakerError();
      const handler = getErrorHandler(circuitError);
      
      expect(handler).toEqual(ERROR_HANDLERS.CIRCUIT_BREAKER_OPEN);
    });

    test('returns timeout handler', () => {
      const timeoutError = new TimeoutError();
      const handler = getErrorHandler(timeoutError);
      
      expect(handler).toEqual(ERROR_HANDLERS.TIMEOUT);
    });

    test('returns default handler for unknown errors', () => {
      const unknownError = new Error('Unknown error');
      const handler = getErrorHandler(unknownError);
      
      expect(handler).toEqual({
        message: "Something went wrong. Please try again or explore the portfolio directly.",
        action: "retry",
        fallback: "portfolio_focus"
      });
    });
  });

  describe('ERROR_HANDLERS', () => {
    test('contains all expected error types', () => {
      expect(ERROR_HANDLERS).toHaveProperty('NETWORK_ERROR');
      expect(ERROR_HANDLERS).toHaveProperty('RATE_LIMIT');
      expect(ERROR_HANDLERS).toHaveProperty('SERVICE_UNAVAILABLE');
      expect(ERROR_HANDLERS).toHaveProperty('CIRCUIT_BREAKER_OPEN');
      expect(ERROR_HANDLERS).toHaveProperty('TIMEOUT');
    });

    test('all handlers have required properties', () => {
      Object.values(ERROR_HANDLERS).forEach(handler => {
        expect(handler).toHaveProperty('message');
        expect(handler).toHaveProperty('action');
        expect(typeof handler.message).toBe('string');
        expect(typeof handler.action).toBe('string');
      });
    });

    test('rate limit handler has cooldown property', () => {
      expect(ERROR_HANDLERS.RATE_LIMIT).toHaveProperty('cooldown', true);
    });

    test('handlers provide user-friendly messages', () => {
      expect(ERROR_HANDLERS.NETWORK_ERROR.message).toContain('trouble connecting');
      expect(ERROR_HANDLERS.RATE_LIMIT.message).toContain('busy right now');
      expect(ERROR_HANDLERS.SERVICE_UNAVAILABLE.message).toContain('temporarily unavailable');
      expect(ERROR_HANDLERS.CIRCUIT_BREAKER_OPEN.message).toContain('moment to recover');
      expect(ERROR_HANDLERS.TIMEOUT.message).toContain('taking longer than expected');
    });
  });
});