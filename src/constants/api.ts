// API Configuration for different environments
export const API_CONFIG = {
  // Base URL for the backend API
  BASE_URL: __DEV__ ? 'http://localhost:8080' : 'https://your-production-api.com',
  
  // API endpoints
  ENDPOINTS: {
    CONNECTIONS: '/api/users',
    POSTS: '/api/posts',
    USERS: '/api/users',
    HEALTH: '/api/feed/health'
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Default headers
  HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Development flags
  DEV_CONFIG: {
    // Set to true to force use of mock data (useful when backend is not running)
    FORCE_MOCK_DATA: false,
    // Enable verbose logging for API calls
    ENABLE_API_LOGGING: __DEV__,
  }
};