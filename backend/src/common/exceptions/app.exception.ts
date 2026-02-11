import { HttpException, HttpStatus } from '@nestjs/common';

// Standard Error Codes
export enum AppErrorCode {
  WORKFLOW_NOT_FOUND = 'E_WORKFLOW_NOT_FOUND',
  INVALID_WORKFLOW_DATA = 'E_INVALID_WORKFLOW_DATA',
  WORKFLOW_EXECUTION_FAILED = 'E_WORKFLOW_EXECUTION_FAILED',
  NODE_CONFIGURATION_ERROR = 'E_NODE_CONFIGURATION_ERROR',
  UNAUTHORIZED_ACCESS = 'E_UNAUTHORIZED_ACCESS',
  WORKFLOW_ALREADY_RUNNING = 'E_WORKFLOW_ALREADY_RUNNING',
  RATE_LIMIT_EXCEEDED = 'E_RATE_LIMIT_EXCEEDED',
  INVALID_INPUT = 'E_INVALID_INPUT',
  FILE_UPLOAD_ERROR = 'E_FILE_UPLOAD_ERROR',
  EXTERNAL_SERVICE_ERROR = 'E_EXTERNAL_SERVICE_ERROR',
  KNOWLEDGE_INDEX_FAILED = 'E_KNOWLEDGE_INDEX_FAILED',
}

/**
 * Workflow Not Found Exception
 *
 * Thrown when a requested workflow cannot be found in the database.
 * Provides a clear error message with the workflow ID for debugging.
 *
 * @example
 * ```typescript
 * throw new WorkflowNotFoundException('123e4567-e89b-12d3-a456-426614174000');
 * // HTTP 404: "Workflow with ID 123e4567-e89b-12d3-a456-426614174000 not found"
 * ```
 */
export class WorkflowNotFoundException extends HttpException {
  constructor(id: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `Workflow with ID ${id} not found`,
        error: 'WorkflowNotFound',
        code: AppErrorCode.WORKFLOW_NOT_FOUND,
        workflowId: id,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Invalid Workflow Data Exception
 *
 * Thrown when workflow data fails validation or contains invalid structure.
 * Helps identify specific validation issues with workflow configuration.
 *
 * @example
 * ```typescript
 * throw new InvalidWorkflowDataException('Missing required start node');
 * // HTTP 400: "Invalid workflow data: Missing required start node"
 * ```
 */
export class InvalidWorkflowDataException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Invalid workflow data: ${message}`,
        error: 'InvalidWorkflowData',
        code: AppErrorCode.INVALID_WORKFLOW_DATA,
        details: message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Workflow Execution Exception
 *
 * Thrown when workflow execution fails due to runtime errors.
 * Captures execution-specific errors with context for debugging.
 *
 * @example
 * ```typescript
 * throw new WorkflowExecutionException('Node execution timeout', nodeId);
 * // HTTP 500: "Workflow execution failed: Node execution timeout"
 * ```
 */
export class WorkflowExecutionException extends HttpException {
  constructor(message: string, nodeId?: string, stepNumber?: number) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Workflow execution failed: ${message}`,
        error: 'WorkflowExecutionError',
        code: AppErrorCode.WORKFLOW_EXECUTION_FAILED,
        details: message,
        nodeId,
        stepNumber,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

/**
 * Node Configuration Exception
 *
 * Thrown when a workflow node is configured incorrectly.
 * Provides details about which node and configuration property is invalid.
 *
 * @example
 * ```typescript
 * throw new NodeConfigurationException('apiKey', 'LLM node', 'Missing API key');
 * // HTTP 400: "Invalid node configuration for LLM node: apiKey - Missing API key"
 * ```
 */
export class NodeConfigurationException extends HttpException {
  constructor(property: string, nodeType: string, message: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Invalid node configuration for ${nodeType}: ${property} - ${message}`,
        error: 'NodeConfigurationError',
        code: AppErrorCode.NODE_CONFIGURATION_ERROR,
        property,
        nodeType,
        details: message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Unauthorized Workflow Access Exception
 *
 * Thrown when a user attempts to access a workflow they don't have permission to access.
 * Used for access control and security.
 *
 * @example
 * ```typescript
 * throw new UnauthorizedWorkflowAccessException(userId, workflowId);
 * // HTTP 403: "User does not have permission to access this workflow"
 * ```
 */
export class UnauthorizedWorkflowAccessException extends HttpException {
  constructor(userId: string, workflowId: string) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'User does not have permission to access this workflow',
        error: 'UnauthorizedAccess',
        code: AppErrorCode.UNAUTHORIZED_ACCESS,
        userId,
        workflowId,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Workflow Already Running Exception
 *
 * Thrown when attempting to execute a workflow that is already running.
 * Prevents concurrent executions of the same workflow instance.
 *
 * @example
 * ```typescript
 * throw new WorkflowAlreadyRunningException(workflowId);
 * // HTTP 409: "Workflow is already running"
 * ```
 */
export class WorkflowAlreadyRunningException extends HttpException {
  constructor(workflowId: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `Workflow ${workflowId} is already running`,
        error: 'WorkflowAlreadyRunning',
        code: AppErrorCode.WORKFLOW_ALREADY_RUNNING,
        workflowId,
      },
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Rate Limit Exceeded Exception
 *
 * Thrown when a user exceeds the allowed rate limit for API requests.
 * Includes information about when the limit will reset.
 *
 * @example
 * ```typescript
 * throw new RateLimitExceededException('Retry after 60 seconds');
 * // HTTP 429: "Rate limit exceeded: Retry after 60 seconds"
 * ```
 */
export class RateLimitExceededException extends HttpException {
  constructor(message: string, retryAfter?: number) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: `Rate limit exceeded: ${message}`,
        error: 'RateLimitExceeded',
        code: AppErrorCode.RATE_LIMIT_EXCEEDED,
        retryAfter,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

/**
 * Invalid Input Exception
 *
 * Thrown when input data fails validation.
 * Provides detailed information about validation failures.
 *
 * @example
 * ```typescript
 * throw new InvalidInputException('Invalid email format', 'email');
 * // HTTP 400: "Invalid input: Invalid email format"
 * ```
 */
export class InvalidInputException extends HttpException {
  constructor(message: string, field?: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Invalid input: ${message}`,
        error: 'InvalidInput',
        code: AppErrorCode.INVALID_INPUT,
        field,
        details: message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * File Upload Exception
 *
 * Thrown when file upload fails validation or encounters errors.
 * Used for file size, type, or upload errors.
 *
 * @example
 * ```typescript
 * throw new FileUploadException('File size exceeds maximum limit', 10485760);
 * // HTTP 400: "File upload failed: File size exceeds maximum limit"
 * ```
 */
export class FileUploadException extends HttpException {
  constructor(message: string, maxSize?: number) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `File upload failed: ${message}`,
        error: 'FileUploadError',
        code: AppErrorCode.FILE_UPLOAD_ERROR,
        details: message,
        maxSize,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * External Service Exception
 *
 * Thrown when an external service call fails.
 * Wraps external API errors with consistent formatting.
 *
 * @example
 * ```typescript
 * throw new ExternalServiceException('OpenAI API', 'Service unavailable', 503);
 * // HTTP 502: "External service error: OpenAI API - Service unavailable"
 * ```
 */
export class ExternalServiceException extends HttpException {
  constructor(
    serviceName: string,
    message: string,
    serviceStatusCode?: number,
  ) {
    super(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        message: `External service error: ${serviceName} - ${message}`,
        error: 'ExternalServiceError',
        code: AppErrorCode.EXTERNAL_SERVICE_ERROR,
        service: serviceName,
        details: message,
        serviceStatusCode,
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}

/**
 * Knowledge Index Exception
 *
 * Thrown when knowledge indexing (embedding generation or vector storage) fails.
 *
 * @example
 * ```typescript
 * throw new KnowledgeIndexException('Failed to generate embeddings');
 * // HTTP 500: "Knowledge indexing failed: Failed to generate embeddings"
 * ```
 */
export class KnowledgeIndexException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Knowledge indexing failed: ${message}`,
        error: 'KnowledgeIndexError',
        code: AppErrorCode.KNOWLEDGE_INDEX_FAILED,
        details: message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
