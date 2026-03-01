import React from 'react';
import { render, act } from '@testing-library/react';
import useScrollTyping from './useScrollTyping';

let intersectionCallback;

beforeEach(() => {
  jest.useFakeTimers();
  intersectionCallback = null;
  global.IntersectionObserver = class {
    constructor(cb) { intersectionCallback = cb; }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  jest.useRealTimers();
});

// Wrapper that attaches the ref to a real DOM element
function TestComponent({ text, options }) {
  const { displayed, done, ref } = useScrollTyping(text, options);
  return (
    <div ref={ref} data-testid="output" data-done={String(done)}>
      {displayed}
    </div>
  );
}

describe('useScrollTyping', () => {
  test('returns empty string before intersection', () => {
    const { getByTestId } = render(<TestComponent text="Hello" />);
    expect(getByTestId('output').textContent).toBe('');
    expect(getByTestId('output').getAttribute('data-done')).toBe('false');
  });

  test('types text after intersection triggers', () => {
    const { getByTestId } = render(
      <TestComponent text="Hi" options={{ speed: 50 }} />
    );

    // Simulate intersection
    act(() => {
      intersectionCallback([{ isIntersecting: true }]);
    });

    // Advance through startDelay (0 default) + typing
    act(() => { jest.advanceTimersByTime(50); }); // 1 char
    expect(getByTestId('output').textContent).toBe('H');

    act(() => { jest.advanceTimersByTime(50); }); // 2nd char -> done
    expect(getByTestId('output').textContent).toBe('Hi');
    expect(getByTestId('output').getAttribute('data-done')).toBe('true');
  });

  test('respects startDelay option', () => {
    const { getByTestId } = render(
      <TestComponent text="AB" options={{ speed: 50, startDelay: 200 }} />
    );

    act(() => {
      intersectionCallback([{ isIntersecting: true }]);
    });

    // Before delay expires
    act(() => { jest.advanceTimersByTime(100); });
    expect(getByTestId('output').textContent).toBe('');

    // After delay expires + first char
    act(() => { jest.advanceTimersByTime(150); });
    expect(getByTestId('output').textContent).toBe('A');
  });
});
