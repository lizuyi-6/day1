/**
 * Application Constants
 *
 * Centralized configuration for all magic numbers and constants used throughout the application.
 * This improves maintainability and makes the codebase more readable.
 */

// ============================================================================
// History and Logging Limits
// ============================================================================

/**
 * Maximum number of history items to keep in memory
 * Used for chat history, workflow execution history, etc.
 */
export const MAX_HISTORY_SIZE = 50;

/**
 * Maximum number of error logs to store
 * Prevents memory overflow from excessive error logging
 */
export const MAX_ERROR_LOGS = 100;

/**
 * Maximum number of network requests to track
 * Used for debugging and monitoring network activity
 */
export const MAX_NETWORK_REQUESTS = 50;

// ============================================================================
// HTTP and CORS Configuration
// ============================================================================

/**
 * CORS max age in seconds (1 hour)
 * Indicates how long the results of a preflight request can be cached
 */
export const CORS_MAX_AGE = 3600;

/**
 * Default timeout for HTTP requests in milliseconds (30 seconds)
 * Used for API calls, workflow execution, etc.
 */
export const REQUEST_TIMEOUT = 30000;

// ============================================================================
// Pagination and Query Limits
// ============================================================================

/**
 * Default page size for paginated queries
 * Used in list endpoints and database queries
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Maximum allowed query length for search operations
 * Prevents excessively long queries that could impact performance
 */
export const MAX_QUERY_LENGTH = 500;

// ============================================================================
// Workflow Configuration
// ============================================================================

/**
 * Maximum number of steps allowed in a workflow execution
 * Prevents infinite loops and excessive resource consumption
 */
export const MAX_WORKFLOW_STEPS = 100;

// ============================================================================
// File Upload Configuration
// ============================================================================

/**
 * Maximum file upload size in bytes (10MB)
 * Used for file upload validation and middleware configuration
 */
export const FILE_UPLOAD_MAX_SIZE = 10 * 1024 * 1024;

// ============================================================================
// Rate Limiting
// ============================================================================

/**
 * Rate limit time-to-live in milliseconds (60 seconds)
 * Defines the window for rate limiting
 */
export const RATE_LIMIT_TTL = 60000;

/**
 * Maximum number of requests allowed within the rate limit window
 * Used to prevent API abuse and ensure fair usage
 */
export const RATE_LIMIT_MAX = 100;

// ============================================================================
// Security Configuration
// ============================================================================

/**
 * HSTS max age in seconds (1 year)
 * HTTP Strict Transport Security cache duration
 */
export const HSTS_MAX_AGE = 31536000;

/**
 * Default port for the backend server
 * Used when PORT environment variable is not set
 */
export const DEFAULT_SERVER_PORT = 3001;

// ============================================================================
// UI and Animation Constants
// ============================================================================

/**
 * Typing animation chunk size for character-by-character text display
 * Number of characters to display per animation frame
 */
export const TYPING_CHUNK_SIZE = 2;

/**
 * Typing animation delay in milliseconds
 * Delay between each chunk of characters during typing animation
 */
export const TYPING_DELAY = 20;

/**
 * Debounce delay for search operations in milliseconds
 * Prevents excessive API calls during user input
 */
export const SEARCH_DEBOUNCE_DELAY = 300;

// ============================================================================
// Simulation and Mock Data
// ============================================================================

/**
 * Deployment simulation delay in milliseconds (2 seconds)
 * Used to simulate workflow deployment process in development
 */
export const DEPLOYMENT_SIMULATION_DELAY = 2000;

/**
 * Node execution simulation delay in milliseconds (500ms)
 * Used to simulate workflow node execution in development
 */
export const NODE_EXECUTION_DELAY = 500;

/**
 * API publishing simulation delay in milliseconds (1.5 seconds)
 * Used to simulate API publishing process in development
 */
export const API_PUBLISH_DELAY = 1500;

// ============================================================================
// Token and Authentication
// ============================================================================

/**
 * Maximum number of retry attempts for failed requests
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Base delay for retry attempts in milliseconds
 * Uses exponential backoff strategy
 */
export const RETRY_BASE_DELAY = 1000;

// ============================================================================
// Validation Constants
// ============================================================================

/**
 * Minimum length for user passwords
 */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Maximum length for user names
 */
export const MAX_NAME_LENGTH = 100;

/**
 * Maximum length for email addresses
 */
export const MAX_EMAIL_LENGTH = 254;

// ============================================================================
// Cache Configuration
// ============================================================================

/**
 * Default cache time-to-live in milliseconds (5 minutes)
 * Used for caching frequently accessed data
 */
export const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Maximum number of items in memory cache
 * Prevents memory overflow from excessive caching
 */
export const MAX_CACHE_SIZE = 1000;
