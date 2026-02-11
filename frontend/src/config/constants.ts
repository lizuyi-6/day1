/**
 * Frontend Application Constants
 *
 * Centralized configuration for all magic numbers and constants used throughout the frontend application.
 */

// ============================================================================
// UI Animation Constants
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
 * Message sending simulation delay in milliseconds (1 second)
 * Used to simulate API response delay in chat interface
 */
export const MESSAGE_SIMULATION_DELAY = 1000;

// ============================================================================
// Workflow Service Constants
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

/**
 * Default API request timeout in milliseconds (30 seconds)
 */
export const DEFAULT_API_TIMEOUT = 30000;

/**
 * Maximum number of retry attempts for failed requests
 */
export const MAX_RETRY_ATTEMPTS = 1;

// ============================================================================
// Validation Constants
// ============================================================================

/**
 * Maximum allowed ID length for URL parameters
 * Used to detect and truncate potentially token-like strings
 */
export const MAX_ID_LENGTH = 50;

/**
 * Truncated ID length display (for security)
 */
export const ID_TRUNCATE_LENGTH = 20;

// ============================================================================
// UI Display Constants
// ============================================================================

/**
 * Maximum number of debug logs to keep in memory
 * Prevents memory overflow from excessive logging
 */
export const MAX_DEBUG_LOGS = 100;

/**
 * Maximum number of history items to keep
 * Used for chat history and navigation history
 */
export const MAX_HISTORY_SIZE = 50;

/**
 * Sidebar width in pixels (responsive units handled by CSS)
 */
export const SIDEBAR_WIDTH = 288; // 72 in rem (4rem base)

/**
 * Header height in pixels (64px = 16 in rem with 4rem base)
 */
export const HEADER_HEIGHT = 64;

/**
 * Maximum width for chat messages in pixels
 */
export const MAX_MESSAGE_WIDTH = 768; // 48rem with 1rem base

/**
 * Avatar size in pixels (36px = 9 in rem with 4rem base)
 */
export const AVATAR_SIZE = 36;

// ============================================================================
// Chart and Visualization Constants
// ============================================================================

/**
 * Default animation duration for charts and graphs in milliseconds
 */
export const CHART_ANIMATION_DURATION = 300;

/**
 * Default debounce delay for search inputs in milliseconds
 */
export const SEARCH_DEBOUNCE_DELAY = 300;

/**
 * Auto-save interval in milliseconds (30 seconds)
 * How often to auto-save workflow changes
 */
export const AUTO_SAVE_INTERVAL = 30000;

// ============================================================================
// File Upload Constants
// ============================================================================

/**
 * Maximum file upload size in bytes (10MB)
 */
export const MAX_FILE_UPLOAD_SIZE = 10 * 1024 * 1024;

/**
 * Allowed image file types for upload
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Maximum image dimensions (width/height in pixels)
 */
export const MAX_IMAGE_DIMENSIONS = 4096;

// ============================================================================
// Pagination Constants
// ============================================================================

/**
 * Default page size for paginated lists
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Maximum page size allowed
 */
export const MAX_PAGE_SIZE = 100;

// ============================================================================
// Workflow Execution Constants
// ============================================================================

/**
 * Maximum number of workflow steps to display in execution history
 */
export const MAX_WORKFLOW_STEPS_DISPLAY = 100;

/**
 * Polling interval for workflow execution status in milliseconds
 */
export const WORKFLOW_EXECUTION_POLL_INTERVAL = 1000;

/**
 * Maximum polling duration for workflow execution in milliseconds (5 minutes)
 */
export const MAX_WORKFLOW_EXECUTION_POLL_DURATION = 5 * 60 * 1000;

// ============================================================================
// Notification Constants
// ============================================================================

/**
 * Default notification display duration in milliseconds (5 seconds)
 */
export const NOTIFICATION_DISPLAY_DURATION = 5000;

/**
 * Success notification display duration in milliseconds (3 seconds)
 */
export const SUCCESS_NOTIFICATION_DURATION = 3000;

/**
 * Error notification display duration in milliseconds (7 seconds)
 */
export const ERROR_NOTIFICATION_DURATION = 7000;

// ============================================================================
// Color Constants (for dynamic theming)
// ============================================================================

/**
 * Default primary color (hex)
 */
export const DEFAULT_PRIMARY_COLOR = '#8B7355';

/**
 * Default background color for light mode (hex)
 */
export const DEFAULT_LIGHT_BACKGROUND = '#F5F5F0';

/**
 * Default background color for dark mode (hex)
 */
export const DEFAULT_DARK_BACKGROUND = '#1E1711';

// ============================================================================
// Storage Constants
// ============================================================================

/**
 * Local storage key for user preferences
 */
export const STORAGE_KEY_USER_PREFERENCES = 'aether_user_preferences';

/**
 * Local storage key for theme selection
 */
export const STORAGE_KEY_THEME = 'aether_theme';

/**
 * Local storage key for recent workflows
 */
export const STORAGE_KEY_RECENT_WORKFLOWS = 'aether_recent_workflows';

/**
 * Maximum number of recent workflows to store
 */
export const MAX_RECENT_WORKFLOWS = 10;

// ============================================================================
// API Rate Limiting
// ============================================================================

/**
 * Minimum delay between API requests in milliseconds (prevents spam)
 */
export const MIN_API_REQUEST_DELAY = 100;

/**
 * Number of requests allowed in the rate limit window
 */
export const RATE_LIMIT_MAX_REQUESTS = 100;

/**
 * Rate limit window duration in milliseconds (1 minute)
 */
export const RATE_LIMIT_WINDOW = 60000;
