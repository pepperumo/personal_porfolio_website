import chatService from '../services/chatService';
import { APIError, RateLimitError, NetworkError, ServiceUnavailableError, TimeoutError } from '../utils/errorTypes';

// Mock fetch
global.fetch = jest.fn();

describe('ChatService', () => {
  const mockRequest = {
    sessionId: 'test-session',
    message: 'Hello',
    history: [],
    topK: 4,
    maxTokens: 256
  };

  const mockResponse = {
    text: 'Hello! How can I help you?',
    sources: [],
    usage: { latencyMs: 100, model: 'test', cached: false },
    confidence: 0.95
  };

  beforeEach(() => {
    fetch.mockClear();
    chatService.reset();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('sendMessage', () => {
    test('successfully sends message and returns response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await chatService.sendMessage(mockRequest);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            sessionId: mockRequest.sessionId,
            message: mockRequest.message,
            history: mockRequest.history,
            topK: mockRequest.topK,
            maxTokens: mockRequest.maxTokens
          })
        })
      );

      expect(result).toEqual(mockResponse);
    });

    test('validates empty message', async () => {
      await expect(chatService.sendMessage({
        ...mockRequest,
        message: ''
      })).rejects.toThrow('Message cannot be empty');
    });

    test('validates message length', async () => {
      const longMessage = 'a'.repeat(801);
      
      await expect(chatService.sendMessage({
        ...mockRequest,
        message: longMessage
      })).rejects.toThrow('Message too long');
    });

    test('handles rate limit error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Map([['Retry-After', '60']]),
        json: async () => ({ code: 'RATE_LIMIT', message: 'Rate limit exceeded' })
      });

      await expect(chatService.sendMessage(mockRequest)).rejects.toThrow(RateLimitError);
    });

    test('handles service unavailable error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({ message: 'Service unavailable' })
      });

      await expect(chatService.sendMessage(mockRequest)).rejects.toThrow(ServiceUnavailableError);
    });

    test('handles network error', async () => {
      fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(chatService.sendMessage(mockRequest)).rejects.toThrow(NetworkError);
    });

    test('handles timeout error', async () => {
      fetch.mockImplementationOnce(() => 
        new Promise(resolve => {
          // Never resolve to simulate timeout
        })
      );

      const sendPromise = chatService.sendMessage(mockRequest);
      
      // Fast-forward time to trigger timeout
      jest.advanceTimersByTime(8001);
      
      await expect(sendPromise).rejects.toThrow();
    });

    test('implements retry logic', async () => {
      fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

      const result = await chatService.sendMessage(mockRequest);

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockResponse);
    });

    test('cancels previous request when new one starts', async () => {
      let abortCalled = false;
      
      fetch.mockImplementationOnce((_url, options) => {
        options.signal.addEventListener('abort', () => {
          abortCalled = true;
        });
        return new Promise(() => {}); // Never resolve
      });

      // Start first request
      const firstRequest = chatService.sendMessage(mockRequest);
      
      // Start second request (should abort first)
      fetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: async () => mockResponse
      }));
      
      const secondRequest = chatService.sendMessage({
        ...mockRequest,
        message: 'Second message'
      });

      await secondRequest;
      
      expect(abortCalled).toBe(true);
    });
  });

  describe('checkHealth', () => {
    test('returns true when health endpoint is healthy', async () => {
      fetch.mockResolvedValueOnce({ ok: true });

      const result = await chatService.checkHealth();

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    test('returns false when health endpoint fails', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await chatService.checkHealth();

      expect(result).toBe(false);
    });
  });

  describe('circuit breaker', () => {
    test('opens circuit after failure threshold', async () => {
      // Simulate multiple failures
      for (let i = 0; i < 5; i++) {
        fetch.mockRejectedValueOnce(new Error('Service error'));
        try {
          await chatService.sendMessage(mockRequest);
        } catch (error) {
          // Expected to fail
        }
      }

      const status = chatService.getStatus();
      expect(status.circuitBreaker.state).toBe('OPEN');
    });

    test('prevents requests when circuit is open', async () => {
      // Force circuit to open
      chatService.circuitBreaker.state = 'OPEN';
      chatService.circuitBreaker.nextAttempt = Date.now() + 60000;

      await expect(chatService.sendMessage(mockRequest)).rejects.toThrow('Circuit breaker is open');
    });
  });
});