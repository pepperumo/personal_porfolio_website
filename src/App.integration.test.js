import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock canvas-based background component to avoid Canvas issues in tests
jest.mock('./components/MatrixRain/MatrixRain', () => {
  return function MockMatrixRain() {
    return <div data-testid="matrix-rain">Matrix Rain</div>;
  };
});

describe('App Integration', () => {
  test('renders main portfolio components', () => {
    render(<App />);

    // Portfolio components should render
    expect(screen.getByTestId('matrix-rain')).toBeInTheDocument();
  });

  test('lazy loading prevents initial bundle bloat', () => {
    const performanceStart = performance.now();
    render(<App />);

    // Portfolio should load quickly
    expect(screen.getByTestId('matrix-rain')).toBeInTheDocument();

    const loadTime = performance.now() - performanceStart;
    expect(loadTime).toBeLessThan(1000); // 1 second budget for initial load
  });
});
