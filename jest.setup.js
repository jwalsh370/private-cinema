// Use require instead of import for CommonJS
require('@testing-library/jest-dom');

// Mock fetch globally
global.fetch = jest.fn();

// Mock environment variables
process.env.TMDB_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-public-api-key';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock Next.js headers
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
}));

// Silence console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
