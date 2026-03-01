import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock canvas-based background component to avoid Canvas issues in tests
jest.mock('./components/MatrixRain/MatrixRain', () => {
  return function MockMatrixRain() {
    return <div data-testid="matrix-rain">Matrix Rain</div>;
  };
});

test('renders portfolio app', () => {
  render(<App />);

  // Check that the main background component renders
  const backgroundElement = screen.getByTestId('matrix-rain');
  expect(backgroundElement).toBeInTheDocument();
});
