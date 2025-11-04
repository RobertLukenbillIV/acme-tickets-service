// Test setup file
// Mock uuid module for Jest to handle ES module imports
jest.mock('uuid', () => ({
  v4: jest.fn(() => '00000000-0000-0000-0000-000000000000'),
}));

// Prevent this file from being counted as a test suite
export {};
