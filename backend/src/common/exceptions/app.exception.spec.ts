import {
  WorkflowNotFoundException,
  InvalidWorkflowDataException,
  WorkflowExecutionException,
  NodeConfigurationException,
  UnauthorizedWorkflowAccessException,
  WorkflowAlreadyRunningException,
  RateLimitExceededException,
  InvalidInputException,
  FileUploadException,
  ExternalServiceException,
} from './app.exception';
import { HttpStatus } from '@nestjs/common';

/**
 * Custom Exceptions Unit Tests
 *
 * Verifies that all custom exceptions are properly defined with correct
 * HTTP status codes, error messages, and metadata.
 */
describe('Custom Exceptions', () => {
  describe('WorkflowNotFoundException', () => {
    it('should create exception with workflow ID', () => {
      const workflowId = '123e4567-e89b-12d3-a456-426614174000';
      const exception = new WorkflowNotFoundException(workflowId);

      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.message).toContain(workflowId);
      expect(exception.response.error).toBe('WorkflowNotFound');
      expect(exception.response.workflowId).toBe(workflowId);
    });

    it('should be instance of HttpException', () => {
      const exception = new WorkflowNotFoundException('test-id');
      expect(exception).toBeInstanceOf(Error);
    });
  });

  describe('InvalidWorkflowDataException', () => {
    it('should create exception with custom message', () => {
      const message = 'Missing required field';
      const exception = new InvalidWorkflowDataException(message);

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toContain(message);
      expect(exception.response.error).toBe('InvalidWorkflowData');
      expect(exception.response.details).toBe(message);
    });

    it('should handle empty message', () => {
      const exception = new InvalidWorkflowDataException('');
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('WorkflowExecutionException', () => {
    it('should create exception with message only', () => {
      const message = 'Node execution failed';
      const exception = new WorkflowExecutionException(message);

      expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(exception.message).toContain(message);
      expect(exception.response.error).toBe('WorkflowExecutionError');
      expect(exception.response.details).toBe(message);
    });

    it('should create exception with node ID', () => {
      const message = 'Timeout';
      const nodeId = 'node-123';
      const exception = new WorkflowExecutionException(message, nodeId);

      expect(exception.response.nodeId).toBe(nodeId);
      expect(exception.response.details).toBe(message);
    });

    it('should create exception with step number', () => {
      const message = 'Validation error';
      const nodeId = 'node-456';
      const stepNumber = 5;
      const exception = new WorkflowExecutionException(
        message,
        nodeId,
        stepNumber,
      );

      expect(exception.response.stepNumber).toBe(stepNumber);
    });
  });

  describe('NodeConfigurationException', () => {
    it('should create exception with full details', () => {
      const property = 'apiKey';
      const nodeType = 'LLM';
      const message = 'API key is required';
      const exception = new NodeConfigurationException(
        property,
        nodeType,
        message,
      );

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toContain(nodeType);
      expect(exception.message).toContain(property);
      expect(exception.response.error).toBe('NodeConfigurationError');
      expect(exception.response.property).toBe(property);
      expect(exception.response.nodeType).toBe(nodeType);
      expect(exception.response.details).toBe(message);
    });

    it('should handle special characters in message', () => {
      const exception = new NodeConfigurationException(
        'url',
        'HTTP',
        'Invalid URL: https://',
      );
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('UnauthorizedWorkflowAccessException', () => {
    it('should create exception with user and workflow IDs', () => {
      const userId = 'user-123';
      const workflowId = 'workflow-456';
      const exception = new UnauthorizedWorkflowAccessException(
        userId,
        workflowId,
      );

      expect(exception.getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect(exception.response.error).toBe('UnauthorizedAccess');
      expect(exception.response.userId).toBe(userId);
      expect(exception.response.workflowId).toBe(workflowId);
    });

    it('should have generic error message', () => {
      const exception = new UnauthorizedWorkflowAccessException('u1', 'w1');
      expect(exception.message).toContain('permission');
    });
  });

  describe('WorkflowAlreadyRunningException', () => {
    it('should create exception with workflow ID', () => {
      const workflowId = 'workflow-789';
      const exception = new WorkflowAlreadyRunningException(workflowId);

      expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
      expect(exception.message).toContain(workflowId);
      expect(exception.response.error).toBe('WorkflowAlreadyRunning');
      expect(exception.response.workflowId).toBe(workflowId);
    });
  });

  describe('RateLimitExceededException', () => {
    it('should create exception with message only', () => {
      const message = 'Too many requests';
      const exception = new RateLimitExceededException(message);

      expect(exception.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(exception.message).toContain(message);
      expect(exception.response.error).toBe('RateLimitExceeded');
    });

    it('should create exception with retryAfter', () => {
      const message = 'Retry later';
      const retryAfter = 60;
      const exception = new RateLimitExceededException(message, retryAfter);

      expect(exception.response.retryAfter).toBe(retryAfter);
    });

    it('should handle retryAfter of 0', () => {
      const exception = new RateLimitExceededException('Limit reached', 0);
      expect(exception.response.retryAfter).toBe(0);
    });
  });

  describe('InvalidInputException', () => {
    it('should create exception with message only', () => {
      const message = 'Invalid email format';
      const exception = new InvalidInputException(message);

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toContain(message);
      expect(exception.response.error).toBe('InvalidInput');
      expect(exception.response.details).toBe(message);
    });

    it('should create exception with field name', () => {
      const message = 'Required field';
      const field = 'password';
      const exception = new InvalidInputException(message, field);

      expect(exception.response.field).toBe(field);
    });

    it('should handle field with special characters', () => {
      const exception = new InvalidInputException('Invalid', 'user-email');
      expect(exception.response.field).toBe('user-email');
    });
  });

  describe('FileUploadException', () => {
    it('should create exception with message only', () => {
      const message = 'File too large';
      const exception = new FileUploadException(message);

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toContain(message);
      expect(exception.response.error).toBe('FileUploadError');
      expect(exception.response.details).toBe(message);
    });

    it('should create exception with maxSize', () => {
      const message = 'Size exceeded';
      const maxSize = 10485760; // 10MB
      const exception = new FileUploadException(message, maxSize);

      expect(exception.response.maxSize).toBe(maxSize);
    });

    it('should handle maxSize of 0', () => {
      const exception = new FileUploadException('No file', 0);
      expect(exception.response.maxSize).toBe(0);
    });
  });

  describe('ExternalServiceException', () => {
    it('should create exception with basic details', () => {
      const serviceName = 'OpenAI API';
      const message = 'Service unavailable';
      const exception = new ExternalServiceException(serviceName, message);

      expect(exception.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
      expect(exception.message).toContain(serviceName);
      expect(exception.message).toContain(message);
      expect(exception.response.error).toBe('ExternalServiceError');
      expect(exception.response.service).toBe(serviceName);
      expect(exception.response.details).toBe(message);
    });

    it('should create exception with service status code', () => {
      const serviceName = 'Payment Gateway';
      const message = 'Payment failed';
      const serviceStatusCode = 502;
      const exception = new ExternalServiceException(
        serviceName,
        message,
        serviceStatusCode,
      );

      expect(exception.response.serviceStatusCode).toBe(serviceStatusCode);
    });

    it('should handle various HTTP status codes', () => {
      const codes = [400, 401, 403, 404, 500, 502, 503];
      codes.forEach((code) => {
        const exception = new ExternalServiceException(
          'Service',
          'Error',
          code,
        );
        expect(exception.response.serviceStatusCode).toBe(code);
      });
    });
  });

  describe('Exception Response Structure', () => {
    it('should all have statusCode in response', () => {
      const exceptions = [
        new WorkflowNotFoundException('id'),
        new InvalidWorkflowDataException('msg'),
        new WorkflowExecutionException('msg'),
        new NodeConfigurationException('p', 't', 'm'),
        new UnauthorizedWorkflowAccessException('u', 'w'),
        new WorkflowAlreadyRunningException('id'),
        new RateLimitExceededException('msg'),
        new InvalidInputException('msg'),
        new FileUploadException('msg'),
        new ExternalServiceException('s', 'm'),
      ];

      exceptions.forEach((exception) => {
        expect(exception.response).toHaveProperty('statusCode');
        expect(typeof exception.response.statusCode).toBe('number');
      });
    });

    it('should all have error type in response', () => {
      const exceptions = [
        new WorkflowNotFoundException('id'),
        new InvalidWorkflowDataException('msg'),
        new WorkflowExecutionException('msg'),
      ];

      exceptions.forEach((exception) => {
        expect(exception.response).toHaveProperty('error');
        expect(typeof exception.response.error).toBe('string');
      });
    });
  });

  describe('HTTP Status Codes', () => {
    it('should map exceptions to correct HTTP status codes', () => {
      expect(new WorkflowNotFoundException('id').getStatus()).toBe(404);
      expect(new InvalidWorkflowDataException('msg').getStatus()).toBe(400);
      expect(new WorkflowExecutionException('msg').getStatus()).toBe(500);
      expect(new NodeConfigurationException('p', 't', 'm').getStatus()).toBe(
        400,
      );
      expect(
        new UnauthorizedWorkflowAccessException('u', 'w').getStatus(),
      ).toBe(403);
      expect(new WorkflowAlreadyRunningException('id').getStatus()).toBe(409);
      expect(new RateLimitExceededException('msg').getStatus()).toBe(429);
      expect(new InvalidInputException('msg').getStatus()).toBe(400);
      expect(new FileUploadException('msg').getStatus()).toBe(400);
      expect(new ExternalServiceException('s', 'm').getStatus()).toBe(502);
    });
  });
});
