import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the ThreeBackground component to avoid WebGL issues in tests
jest.mock('./components/ThreeBackground/ThreeBackground', () => {
  return function MockThreeBackground() {
    return <div data-testid="three-background">Three Background</div>;
  };
});

test('renders portfolio app', () => {
  render(<App />);
  
  // Check that the main background component renders
  const backgroundElement = screen.getByTestId('three-background');
  expect(backgroundElement).toBeInTheDocument();
});
