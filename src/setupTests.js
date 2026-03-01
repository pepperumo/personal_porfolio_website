// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock HTMLVideoElement methods
HTMLVideoElement.prototype.play = jest.fn().mockResolvedValue(undefined);
HTMLVideoElement.prototype.pause = jest.fn();
HTMLVideoElement.prototype.load = jest.fn();

// Mock IntersectionObserver for framer-motion and other components
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock HTMLCanvasElement.getContext for Three.js and Canvas 2D
const _origGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(contextType) {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    // Return a comprehensive mock WebGL context
    return {
      canvas: document.createElement('canvas'),
      getExtension: jest.fn(() => ({})),
      getParameter: jest.fn((param) => {
        // Return appropriate values for common parameters
        if (param === 0x1F00) return 'WebKit'; // VENDOR
        if (param === 0x1F01) return 'WebKit WebGL'; // RENDERER
        if (param === 0x1F02) return 'WebGL 1.0'; // VERSION
        if (param === 0x8B8C) return ['GL_OES_texture_float']; // EXTENSIONS
        return 1;
      }),
      createShader: jest.fn(() => ({})),
      shaderSource: jest.fn(),
      compileShader: jest.fn(),
      createProgram: jest.fn(() => ({})),
      attachShader: jest.fn(),
      linkProgram: jest.fn(),
      useProgram: jest.fn(),
      createBuffer: jest.fn(() => ({})),
      bindBuffer: jest.fn(),
      bufferData: jest.fn(),
      getAttribLocation: jest.fn(() => 0),
      enableVertexAttribArray: jest.fn(),
      vertexAttribPointer: jest.fn(),
      drawArrays: jest.fn(),
      clearColor: jest.fn(),
      clear: jest.fn(),
      viewport: jest.fn(),
      activeTexture: jest.fn(),
      bindTexture: jest.fn(),
      createTexture: jest.fn(() => ({})),
      texImage2D: jest.fn(),
      texParameteri: jest.fn(),
      getUniformLocation: jest.fn(() => ({})),
      uniform1i: jest.fn(),
      uniform1f: jest.fn(),
      uniform2f: jest.fn(),
      uniform3f: jest.fn(),
      uniform4f: jest.fn(),
      uniformMatrix4fv: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn(),
      blendFunc: jest.fn(),
      depthFunc: jest.fn(),
      depthMask: jest.fn(),
      cullFace: jest.fn(),
      frontFace: jest.fn(),
      // Add more methods as needed
      getShaderParameter: jest.fn(() => true),
      getProgramParameter: jest.fn(() => true),
      deleteShader: jest.fn(),
      deleteProgram: jest.fn(),
      deleteBuffer: jest.fn(),
      deleteTexture: jest.fn(),
    };
  }
  if (contextType === '2d') {
    return {
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
      putImageData: jest.fn(),
      createImageData: jest.fn((w, h) => ({ data: new Uint8ClampedArray(w * h * 4) })),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      fillText: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      transform: jest.fn(),
      rect: jest.fn(),
      clip: jest.fn(),
      canvas: document.createElement('canvas'),
    };
  }
  return null;
};

// Mock performance.now if not available
if (!global.performance) {
  global.performance = {
    now: () => Date.now(),
  };
}

// Suppress WebGL context creation errors in tests
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('THREE.WebGLRenderer: Error creating WebGL context') ||
     args[0].includes('Not implemented: HTMLCanvasElement.prototype.getContext'))
  ) {
    return;
  }
  originalError.apply(console, args);
};