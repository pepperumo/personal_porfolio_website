import { renderHook, act } from '@testing-library/react';
import { useApiClient } from '../hooks/useApiClient';
import chatService from '../services/chatService';
import { NetworkError, RateLimitError } from '../utils/errorTypes';

// Mock the chat service
jest.mock('../services/chatService', () => ({
  sendMessage: jest.fn(),
  checkHealth: jest.fn(),
  reset: jest.fn(),
  getStatus: jest.fn(() => ({ isHealthy: true }))
}));

describe('useApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-setup the getStatus mock after clearing
    chatService.getStatus.mockReturnValue({ isHealthy: true });
  });

  test('initializes with default state', () => {
    const { result } = renderHook(() => useApiClient());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isConnected).toBe(true);
  });

  test('successfully sends message', async () => {
    const mockResponse = {
      text: 'Hello!',
      sources: [],
      usage: { latencyMs: 100 },
      confidence: 0.95
    };

    chatService.sendMessage.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useApiClient());

    let response;
    await act(async () => {
      response = await result.current.sendMessage('Hello', []);
    });

    expect(chatService.sendMessage).toHaveBeenCalledWith({
      sessionId: expect.any(String),
      message: 'Hello',
      history: [],
      topK: 4,
      maxTokens: 256
    });

    expect(response).toEqual(mockResponse);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isConnected).toBe(true);
  });

  test('sets loading state during message sending', async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    chatService.sendMessage.mockReturnValueOnce(promise);

    const { result } = renderHook(() => useApiClient());

    act(() => {
      result.current.sendMessage('Hello', []);
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise({ text: 'Response' });
      await promise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  test('handles network errors', async () => {
    const networkError = new NetworkError();
    chatService.sendMessage.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useApiClient());

    await act(async () => {
      try {
        await result.current.sendMessage('Hello', []);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toMatchObject({
      message: expect.stringContaining('trouble connecting'),
      action: 'retry'
    });
    expect(result.current.isConnected).toBe(false);
  });

  test('handles rate limit errors', async () => {
    const rateLimitError = new RateLimitError(60);
    chatService.sendMessage.mockRejectedValueOnce(rateLimitError);

    const { result } = renderHook(() => useApiClient());

    await act(async () => {
      try {
        await result.current.sendMessage('Hello', []);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toMatchObject({
      message: expect.stringContaining('busy right now'),
      action: 'show_suggestions',
      cooldown: true
    });
  });

  test('trims conversation history to last 6 turns', async () => {
    const longHistory = Array.from({ length: 10 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i}`
    }));

    chatService.sendMessage.mockResolvedValueOnce({ text: 'Response' });

    const { result } = renderHook(() => useApiClient());

    await act(async () => {
      await result.current.sendMessage('Hello', longHistory);
    });

    expect(chatService.sendMessage).toHaveBeenCalledWith({
      sessionId: expect.any(String),
      message: 'Hello',
      history: longHistory.slice(-6),
      topK: 4,
      maxTokens: 256
    });
  });

  test('validates empty messages', async () => {
    const { result } = renderHook(() => useApiClient());

    await act(async () => {
      await expect(result.current.sendMessage('', [])).rejects.toThrow('Message cannot be empty');
    });
  });

  test('clears error state', async () => {
    const networkError = new NetworkError();
    chatService.sendMessage.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useApiClient());

    // Trigger error
    await act(async () => {
      try {
        await result.current.sendMessage('Hello', []);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBeTruthy();

    // Clear error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  test('checks health status', async () => {
    chatService.checkHealth.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useApiClient());

    let healthStatus;
    await act(async () => {
      healthStatus = await result.current.checkHealth();
    });

    expect(healthStatus).toBe(true);
    expect(result.current.isConnected).toBe(true);
  });

  test('resets client state', async () => {
    const { result } = renderHook(() => useApiClient());

    // Set some error state
    await act(async () => {
      try {
        chatService.sendMessage.mockRejectedValueOnce(new NetworkError());
        await result.current.sendMessage('Hello', []);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isConnected).toBe(false);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBe(null);
    expect(result.current.isConnected).toBe(true);
    expect(chatService.reset).toHaveBeenCalled();
  });

  test('provides status information', () => {
    const { result } = renderHook(() => useApiClient());

    const status = result.current.getStatus();

    expect(status).toMatchObject({
      isLoading: false,
      error: null,
      isConnected: true,
      sessionId: expect.any(String)
    });

    // Check that serviceStatus exists and has the expected shape
    expect(status.serviceStatus).toBeDefined();
    expect(status.serviceStatus).toEqual({ isHealthy: true });
  });
});