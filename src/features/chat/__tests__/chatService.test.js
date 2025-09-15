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
        expect.stringContaining('/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            message: mockRequest.message,
            session_id: mockRequest.sessionId,
            history: mockRequest.history,
            max_context_chunks: mockRequest.topK || 4,
            min_confidence: 0.3
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
  });

  describe('checkHealth', () => {
    test('returns false when health endpoint fails', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await chatService.checkHealth();

      expect(result).toBe(false);
    });
  });
});