import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import IntroAnimation from './IntroAnimation';

// Helper: advance timers in small steps so React can flush state updates
// and effects between each step (effects schedule new timers).
const advanceTimers = (totalMs, stepMs = 100) => {
  const steps = Math.ceil(totalMs / stepMs);
  for (let i = 0; i < steps; i++) {
    act(() => { jest.advanceTimersByTime(stepMs); });
  }
};

beforeEach(() => {
  jest.useFakeTimers();
  window.matchMedia.mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('IntroAnimation', () => {
  test('starts in "off" phase — screen is not visible', () => {
    const onComplete = jest.fn();
    render(<IntroAnimation onComplete={onComplete} />);
    expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
  });

  test('transitions powerOn → boot with cursor visible', () => {
    const onComplete = jest.fn();
    render(<IntroAnimation onComplete={onComplete} />);

    advanceTimers(1600);
    advanceTimers(800);

    expect(screen.getByText(/Welcome/)).toBeInTheDocument();
  });

  test('types boot lines sequentially', () => {
    const onComplete = jest.fn();
    render(<IntroAnimation onComplete={onComplete} />);

    advanceTimers(6000);

    expect(screen.getByText(/boot giuseppe\.rumore/)).toBeInTheDocument();
    expect(screen.getByText(/load react/)).toBeInTheDocument();
  });

  test('shows ASCII logo after lines complete', () => {
    const onComplete = jest.fn();
    render(<IntroAnimation onComplete={onComplete} />);

    // Advance through boot typing. Check after each step for the logo.
    // The logo appears briefly (800ms) after all lines complete + 400ms delay.
    let logoFound = false;
    for (let ms = 0; ms < 15000; ms += 100) {
      act(() => { jest.advanceTimersByTime(100); });
      if (screen.queryByText(/██████╗/)) {
        logoFound = true;
        break;
      }
    }
    expect(logoFound).toBe(true);
  });

  test('calls onComplete after full sequence', () => {
    const onComplete = jest.fn();
    render(<IntroAnimation onComplete={onComplete} />);

    advanceTimers(20000, 100);

    expect(onComplete).toHaveBeenCalled();
  });

  test('skip button calls onComplete immediately', () => {
    const onComplete = jest.fn();
    render(<IntroAnimation onComplete={onComplete} />);

    fireEvent.click(screen.getByText('Skip'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('reduced-motion preference skips animation entirely', () => {
    window.matchMedia.mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const onComplete = jest.fn();
    render(<IntroAnimation onComplete={onComplete} />);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('static noise canvas renders during powerOn', () => {
    const onComplete = jest.fn();
    const { container } = render(<IntroAnimation onComplete={onComplete} />);

    act(() => { jest.advanceTimersByTime(300); });

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '320');
    expect(canvas).toHaveAttribute('height', '240');
  });
});
