/**
 * Test setup file
 * Loaded before each test file
 */

import '@testing-library/jest-dom';

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
    value: {
        VITE_GEMINI_API_KEY: 'test-api-key',
        VITE_METALS_API_KEY: 'test-metals-key',
    },
});

// Mock fetch globally
global.fetch = vi.fn();

// Reset mocks between tests
beforeEach(() => {
    vi.clearAllMocks();
});
