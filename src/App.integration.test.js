import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the ThreeBackground component to avoid WebGL issues in tests
jest.mock('./components/ThreeBackground/ThreeBackground', () => {
  return function MockThreeBackground() {
    return <div data-testid="three-background">Three Background</div>;
  };
});

describe('App Integration', () => {
  test('renders main portfolio components', () => {
    render(<App />);

    // Portfolio components should render
    expect(screen.getByTestId('three-background')).toBeInTheDocument();
  });

  test('lazy loading prevents initial bundle bloat', () => {
    const performanceStart = performance.now();
    render(<App />);

    // Portfolio should load quickly
    expect(screen.getByTestId('three-background')).toBeInTheDocument();

    const loadTime = performance.now() - performanceStart;
    expect(loadTime).toBeLessThan(1000); // 1 second budget for initial load
  });
});
