import { CircuitBreaker } from '../utils/circuitBreaker';

describe('CircuitBreaker', () => {
  let circuitBreaker;
  let mockFunction;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker({
      threshold: 3,
      timeout: 1000,
      resetTimeout: 5000
    });
    mockFunction = jest.fn();
  });

  test('initializes in closed state', () => {
    const status = circuitBreaker.getStatus();
    
    expect(status.state).toBe('CLOSED');
    expect(status.failureCount).toBe(0);
    expect(status.isOpen).toBe(false);
  });

  test('executes function successfully when closed', async () => {
    const expectedResult = 'success';
    mockFunction.mockResolvedValueOnce(expectedResult);

    const result = await circuitBreaker.call(mockFunction, 'arg1', 'arg2');

    expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2');
    expect(result).toBe(expectedResult);
    expect(circuitBreaker.getStatus().state).toBe('CLOSED');
  });

  test('increments failure count on error', async () => {
    mockFunction.mockRejectedValueOnce(new Error('Test error'));

    try {
      await circuitBreaker.call(mockFunction);
    } catch (error) {
      // Expected to throw
    }

    expect(circuitBreaker.getStatus().failureCount).toBe(1);
    expect(circuitBreaker.getStatus().state).toBe('CLOSED');
  });

  test('opens circuit after failure threshold', async () => {
    const error = new Error('Test error');
    
    // Trigger failures up to threshold
    for (let i = 0; i < 3; i++) {
      mockFunction.mockRejectedValueOnce(error);
      try {
        await circuitBreaker.call(mockFunction);
      } catch (e) {
        // Expected to throw
      }
    }

    const status = circuitBreaker.getStatus();
    expect(status.state).toBe('OPEN');
    expect(status.failureCount).toBe(3);
    expect(status.isOpen).toBe(true);
  });

  test('rejects immediately when circuit is open', async () => {
    // Force circuit to open
    circuitBreaker.state = 'OPEN';
    circuitBreaker.nextAttempt = Date.now() + 10000;

    await expect(circuitBreaker.call(mockFunction)).rejects.toThrow('Circuit breaker is open');
    expect(mockFunction).not.toHaveBeenCalled();
  });

  test('transitions to half-open after reset timeout', async () => {
    // Force circuit to open with past reset time
    circuitBreaker.state = 'OPEN';
    circuitBreaker.nextAttempt = Date.now() - 1000;

    mockFunction.mockResolvedValueOnce('success');

    const result = await circuitBreaker.call(mockFunction);

    expect(result).toBe('success');
    expect(circuitBreaker.getStatus().state).toBe('CLOSED');
  });

  test('resets failure count on successful execution', async () => {
    // Add some failures first
    circuitBreaker.failureCount = 2;
    
    mockFunction.mockResolvedValueOnce('success');

    await circuitBreaker.call(mockFunction);

    expect(circuitBreaker.getStatus().failureCount).toBe(0);
    expect(circuitBreaker.getStatus().state).toBe('CLOSED');
  });

  test('handles timeout errors', async () => {
    mockFunction.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 2000))
    );

    await expect(circuitBreaker.call(mockFunction)).rejects.toThrow('Circuit breaker timeout');
  });

  test('manually resets circuit breaker', () => {
    // Set some failure state
    circuitBreaker.state = 'OPEN';
    circuitBreaker.failureCount = 5;
    circuitBreaker.lastFailureTime = Date.now();

    circuitBreaker.reset();

    const status = circuitBreaker.getStatus();
    expect(status.state).toBe('CLOSED');
    expect(status.failureCount).toBe(0);
    expect(status.lastFailureTime).toBe(null);
  });

  test('provides detailed status information', () => {
    circuitBreaker.failureCount = 2;
    circuitBreaker.lastFailureTime = 12345;

    const status = circuitBreaker.getStatus();

    expect(status).toMatchObject({
      state: 'CLOSED',
      failureCount: 2,
      lastFailureTime: 12345,
      nextAttempt: expect.any(Number),
      isOpen: false
    });
  });

  test('half-open state allows single test call', async () => {
    // Force to half-open state
    circuitBreaker.state = 'HALF_OPEN';
    
    mockFunction.mockResolvedValueOnce('success');

    const result = await circuitBreaker.call(mockFunction);

    expect(result).toBe('success');
    expect(circuitBreaker.getStatus().state).toBe('CLOSED');
  });

  test('half-open state returns to open on failure', async () => {
    // Force to half-open state
    circuitBreaker.state = 'HALF_OPEN';
    circuitBreaker.failureCount = 2; // Just below threshold
    
    mockFunction.mockRejectedValueOnce(new Error('Test error'));

    try {
      await circuitBreaker.call(mockFunction);
    } catch (error) {
      // Expected to throw
    }

    expect(circuitBreaker.getStatus().state).toBe('OPEN');
    expect(circuitBreaker.getStatus().failureCount).toBe(3);
  });
});