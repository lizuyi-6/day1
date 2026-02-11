/**
 * API Response Interfaces
 *
 * Standardized response formats for all API endpoints.
 * Ensures consistency across the application and improves API usability.
 */

/**
 * Base API Response Interface
 *
 * Standard structure for all API responses.
 * Includes success status, optional data, error information, and metadata.
 *
 * @template T - The type of data returned in the response
 *
 * @example
 * ```typescript
 * const response: ApiResponse<User> = {
 *   success: true,
 *   data: { id: '1', name: 'John' },
 *   message: 'User retrieved successfully',
 *   timestamp: '2024-01-01T00:00:00.000Z'
 * }
 * ```
 */
export interface ApiResponse<T = any> {
  /**
   * Indicates whether the request was successful
   */
  success: boolean;

  /**
   * Response data (present on successful requests)
   */
  data?: T;

  /**
   * Error message (present on failed requests)
   */
  error?: string;

  /**
   * Additional information about the response
   */
  message?: string;

  /**
   * ISO 8601 timestamp of when the response was generated
   */
  timestamp: string;

  /**
   * Unique identifier for the request (useful for debugging)
   */
  requestId?: string;

  /**
   * HTTP status code
   */
  statusCode?: number;
}

/**
 * Paginated Response Interface
 *
 * Used for list endpoints that return paginated data.
 * Includes pagination metadata for navigation.
 *
 * @template T - The type of items in the data array
 *
 * @example
 * ```typescript
 * const response: PaginatedResponse<Workflow> = {
 *   success: true,
 *   data: [...],
 *   pagination: {
 *     page: 1,
 *     pageSize: 20,
 *     totalItems: 100,
 *     totalPages: 5
 *   },
 *   timestamp: '2024-01-01T00:00:00.000Z'
 * }
 * ```
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  /**
   * Pagination metadata
   */
  pagination: {
    /**
     * Current page number (1-indexed)
     */
    page: number;

    /**
     * Number of items per page
     */
    pageSize: number;

    /**
     * Total number of items across all pages
     */
    totalItems: number;

    /**
     * Total number of pages
     */
    totalPages: number;

    /**
     * Whether there is a next page
     */
    hasNextPage: boolean;

    /**
     * Whether there is a previous page
     */
    hasPreviousPage: boolean;
  };
}

/**
 * Validation Error Response Interface
 *
 * Used for detailed validation error responses.
 * Provides field-level error information.
 *
 * @example
 * ```typescript
 * const response: ValidationErrorResponse = {
 *   success: false,
 *   error: 'Validation failed',
 *   validationErrors: [
 *     { field: 'email', message: 'Invalid email format' },
 *     { field: 'password', message: 'Password too short' }
 *   ],
 *   timestamp: '2024-01-01T00:00:00.000Z'
 * }
 * ```
 */
export interface ValidationErrorResponse extends ApiResponse {
  /**
   * Array of validation errors
   */
  validationErrors: Array<{
    /**
     * Field name that failed validation
     */
    field: string;

    /**
     * Error message for the field
     */
    message: string;

    /**
     * Current value that failed validation (optional)
     */
    value?: any;
  }>;
}

/**
 * Response Utility Class
 *
 * Provides helper methods for creating standardized API responses.
 * Ensures consistency and reduces boilerplate code.
 */
export class ResponseUtil {
  /**
   * Create a successful response with data
   *
   * @template T - The type of data being returned
   * @param data - The response data
   * @param message - Optional success message
   * @param statusCode - Optional HTTP status code (defaults to 200)
   * @returns A standardized success response
   *
   * @example
   * ```typescript
   * return ResponseUtil.success(user, 'User retrieved successfully');
   * // Returns: { success: true, data: user, message: '...', timestamp: '...' }
   * ```
   */
  static success<T>(
    data: T,
    message?: string,
    statusCode: number = 200,
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create an error response
   *
   * @param error - Error message or Error object
   * @param statusCode - HTTP status code (defaults to 500)
   * @param requestId - Optional request ID for tracking
   * @returns A standardized error response
   *
   * @example
   * ```typescript
   * return ResponseUtil.error('Workflow not found', 404);
   * // Returns: { success: false, error: 'Workflow not found', statusCode: 404, timestamp: '...' }
   * ```
   */
  static error(
    error: string | Error,
    statusCode: number = 500,
    requestId?: string,
  ): ApiResponse {
    const errorMessage = error instanceof Error ? error.message : error;
    return {
      success: false,
      error: errorMessage,
      statusCode,
      requestId,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create a paginated response
   *
   * @template T - The type of items in the data array
   * @param data - Array of items
   * @param page - Current page number
   * @param pageSize - Number of items per page
   * @param totalItems - Total number of items
   * @param message - Optional success message
   * @returns A standardized paginated response
   *
   * @example
   * ```typescript
   * return ResponseUtil.paginated(workflows, 1, 20, 100);
   * // Returns: { success: true, data: [...], pagination: {...}, timestamp: '...' }
   * ```
   */
  static paginated<T>(
    data: T[],
    page: number,
    pageSize: number,
    totalItems: number,
    message?: string,
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      success: true,
      data,
      message,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create a validation error response
   *
   * @param errors - Array of validation errors
   * @param message - Optional error message
   * @returns A standardized validation error response
   *
   * @example
   * ```typescript
   * return ResponseUtil.validationError([
   *   { field: 'email', message: 'Invalid email format' }
   * ]);
   * ```
   */
  static validationError(
    errors: Array<{ field: string; message: string; value?: any }>,
    message: string = 'Validation failed',
  ): ValidationErrorResponse {
    return {
      success: false,
      error: message,
      validationErrors: errors,
      statusCode: 400,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create a created response (HTTP 201)
   *
   * @template T - The type of data being returned
   * @param data - The created resource
   * @param message - Optional success message
   * @returns A standardized created response
   *
   * @example
   * ```typescript
   * return ResponseUtil.created(newWorkflow, 'Workflow created successfully');
   * // Returns: { success: true, data: {...}, message: '...', statusCode: 201, timestamp: '...' }
   * ```
   */
  static created<T>(data: T, message?: string): ApiResponse<T> {
    return this.success(data, message, 201);
  }

  /**
   * Create a no content response (HTTP 204)
   *
   * @param message - Optional message describing what was deleted
   * @returns A standardized no content response
   *
   * @example
   * ```typescript
   * return ResponseUtil.noContent('Workflow deleted successfully');
   * // Returns: { success: true, message: '...', statusCode: 204, timestamp: '...' }
   * ```
   */
  static noContent(message?: string): ApiResponse {
    return {
      success: true,
      message,
      statusCode: 204,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create a not found error response (HTTP 404)
   *
   * @param resource - The resource type that was not found
   * @param id - Optional ID of the resource
   * @returns A standardized not found response
   *
   * @example
   * ```typescript
   * return ResponseUtil.notFound('Workflow', '123');
   * // Returns: { success: false, error: 'Workflow 123 not found', statusCode: 404, timestamp: '...' }
   * ```
   */
  static notFound(resource: string, id?: string): ApiResponse {
    const message = id
      ? `${resource} ${id} not found`
      : `${resource} not found`;
    return this.error(message, 404);
  }

  /**
   * Create a bad request error response (HTTP 400)
   *
   * @param message - Error message describing what was invalid
   * @returns A standardized bad request response
   *
   * @example
   * ```typescript
   * return ResponseUtil.badRequest('Invalid workflow data');
   * // Returns: { success: false, error: 'Invalid workflow data', statusCode: 400, timestamp: '...' }
   * ```
   */
  static badRequest(message: string): ApiResponse {
    return this.error(message, 400);
  }

  /**
   * Create an unauthorized error response (HTTP 401)
   *
   * @param message - Optional error message
   * @returns A standardized unauthorized response
   *
   * @example
   * ```typescript
   * return ResponseUtil.unauthorized('Invalid credentials');
   * // Returns: { success: false, error: 'Invalid credentials', statusCode: 401, timestamp: '...' }
   * ```
   */
  static unauthorized(message: string = 'Unauthorized'): ApiResponse {
    return this.error(message, 401);
  }

  /**
   * Create a forbidden error response (HTTP 403)
   *
   * @param message - Optional error message
   * @returns A standardized forbidden response
   *
   * @example
   * ```typescript
   * return ResponseUtil.forbidden('Access denied');
   * // Returns: { success: false, error: 'Access denied', statusCode: 403, timestamp: '...' }
   * ```
   */
  static forbidden(message: string = 'Forbidden'): ApiResponse {
    return this.error(message, 403);
  }

  /**
   * Create a conflict error response (HTTP 409)
   *
   * @param message - Error message describing the conflict
   * @returns A standardized conflict response
   *
   * @example
   * ```typescript
   * return ResponseUtil.conflict('Workflow already exists');
   * // Returns: { success: false, error: 'Workflow already exists', statusCode: 409, timestamp: '...' }
   * ```
   */
  static conflict(message: string): ApiResponse {
    return this.error(message, 409);
  }
}
