import "@testing-library/jest-dom";

// jsdom does not implement ResizeObserver; mock it so Radix UI components don't throw.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
