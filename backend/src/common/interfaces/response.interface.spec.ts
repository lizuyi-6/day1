import {
  ResponseUtil,
  ApiResponse,
  PaginatedResponse,
} from './response.interface';

/**
 * Response Utility Unit Tests
 *
 * Verifies that all response utility methods create properly formatted
 * API responses with correct structure and metadata.
 */
describe('ResponseUtil', () => {
  describe('success', () => {
    it('should create success response with data and message', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Success message';
      const result = ResponseUtil.success(data, message);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.message).toBe(message);
      expect(result.statusCode).toBe(200);
      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe('string');
    });

    it('should create success response without message', () => {
      const data = { test: 'data' };
      const result = ResponseUtil.success(data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.message).toBeUndefined();
    });

    it('should create success response with custom status code', () => {
      const data = { created: true };
      const result = ResponseUtil.success(data, 'Created', 201);

      expect(result.statusCode).toBe(201);
    });

    it('should have ISO 8601 timestamp', () => {
      const result = ResponseUtil.success({ test: 1 });
      const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

      expect(result.timestamp).toMatch(timestampRegex);
    });

    it('should handle null data', () => {
      const result = ResponseUtil.success(null, 'No content');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle undefined data', () => {
      const result = ResponseUtil.success(undefined, 'No data');

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });
  });

  describe('error', () => {
    it('should create error response with string message', () => {
      const errorMessage = 'Something went wrong';
      const result = ResponseUtil.error(errorMessage);

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
      expect(result.statusCode).toBe(500);
      expect(result.timestamp).toBeDefined();
    });

    it('should create error response with Error object', () => {
      const error = new Error('Database error');
      const result = ResponseUtil.error(error);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should create error response with custom status code', () => {
      const result = ResponseUtil.error('Not found', 404);

      expect(result.statusCode).toBe(404);
    });

    it('should create error response with requestId', () => {
      const requestId = 'req-123';
      const result = ResponseUtil.error('Error', 500, requestId);

      expect(result.requestId).toBe(requestId);
    });

    it('should have ISO 8601 timestamp', () => {
      const result = ResponseUtil.error('Error');
      const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

      expect(result.timestamp).toMatch(timestampRegex);
    });
  });

  describe('paginated', () => {
    const mockData = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
    ];

    it('should create paginated response with all metadata', () => {
      const result = ResponseUtil.paginated(mockData, 1, 10, 30);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
      expect(result.pagination.totalItems).toBe(30);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });

    it('should calculate totalPages correctly', () => {
      const result = ResponseUtil.paginated(mockData, 2, 10, 25);

      expect(result.pagination.totalPages).toBe(3); // 25 / 10 = 2.5 -> 3
    });

    it('should handle hasNextPage correctly', () => {
      const result1 = ResponseUtil.paginated(mockData, 1, 10, 30);
      expect(result1.pagination.hasNextPage).toBe(true);

      const result2 = ResponseUtil.paginated(mockData, 3, 10, 30);
      expect(result2.pagination.hasNextPage).toBe(false);
    });

    it('should handle hasPreviousPage correctly', () => {
      const result1 = ResponseUtil.paginated(mockData, 1, 10, 30);
      expect(result1.pagination.hasPreviousPage).toBe(false);

      const result2 = ResponseUtil.paginated(mockData, 2, 10, 30);
      expect(result2.pagination.hasPreviousPage).toBe(true);
    });

    it('should handle single page correctly', () => {
      const result = ResponseUtil.paginated(mockData, 1, 10, 5);

      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });

    it('should include message when provided', () => {
      const message = 'Items retrieved';
      const result = ResponseUtil.paginated(mockData, 1, 10, 30, message);

      expect(result.message).toBe(message);
    });

    it('should handle empty data array', () => {
      const result = ResponseUtil.paginated([], 1, 10, 0);

      expect(result.data).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe('validationError', () => {
    it('should create validation error response', () => {
      const errors = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short' },
      ];
      const result = ResponseUtil.validationError(errors);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
      expect(result.validationErrors).toEqual(errors);
      expect(result.statusCode).toBe(400);
    });

    it('should create validation error with custom message', () => {
      const errors = [{ field: 'name', message: 'Required' }];
      const customMessage = 'Please fix the errors';
      const result = ResponseUtil.validationError(errors, customMessage);

      expect(result.error).toBe(customMessage);
    });

    it('should handle errors with values', () => {
      const errors = [{ field: 'age', message: 'Must be positive', value: -5 }];
      const result = ResponseUtil.validationError(errors);

      expect(result.validationErrors[0].value).toBe(-5);
    });

    it('should handle empty errors array', () => {
      const result = ResponseUtil.validationError([]);

      expect(result.validationErrors).toEqual([]);
    });
  });

  describe('created', () => {
    it('should create response with 201 status code', () => {
      const data = { id: 'new-id', created: true };
      const result = ResponseUtil.created(data, 'Resource created');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(201);
      expect(result.data).toEqual(data);
      expect(result.message).toBe('Resource created');
    });

    it('should create response without message', () => {
      const data = { id: 'new-id' };
      const result = ResponseUtil.created(data);

      expect(result.statusCode).toBe(201);
      expect(result.message).toBeUndefined();
    });
  });

  describe('noContent', () => {
    it('should create response with 204 status code', () => {
      const result = ResponseUtil.noContent('Deleted successfully');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(204);
      expect(result.message).toBe('Deleted successfully');
      expect(result.data).toBeUndefined();
    });

    it('should create response without message', () => {
      const result = ResponseUtil.noContent();

      expect(result.statusCode).toBe(204);
      expect(result.message).toBeUndefined();
    });
  });

  describe('notFound', () => {
    it('should create not found response with resource and id', () => {
      const result = ResponseUtil.notFound('Workflow', 'wf-123');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toContain('Workflow');
      expect(result.error).toContain('wf-123');
    });

    it('should create not found response with only resource', () => {
      const result = ResponseUtil.notFound('User');

      expect(result.statusCode).toBe(404);
      expect(result.error).toContain('User');
    });
  });

  describe('badRequest', () => {
    it('should create bad request response', () => {
      const message = 'Invalid input data';
      const result = ResponseUtil.badRequest(message);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe(message);
    });
  });

  describe('unauthorized', () => {
    it('should create unauthorized response with default message', () => {
      const result = ResponseUtil.unauthorized();

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(401);
      expect(result.error).toBe('Unauthorized');
    });

    it('should create unauthorized response with custom message', () => {
      const customMessage = 'Invalid credentials';
      const result = ResponseUtil.unauthorized(customMessage);

      expect(result.error).toBe(customMessage);
    });
  });

  describe('forbidden', () => {
    it('should create forbidden response with default message', () => {
      const result = ResponseUtil.forbidden();

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(403);
      expect(result.error).toBe('Forbidden');
    });

    it('should create forbidden response with custom message', () => {
      const customMessage = 'Access denied';
      const result = ResponseUtil.forbidden(customMessage);

      expect(result.error).toBe(customMessage);
    });
  });

  describe('conflict', () => {
    it('should create conflict response', () => {
      const message = 'Resource already exists';
      const result = ResponseUtil.conflict(message);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(409);
      expect(result.error).toBe(message);
    });
  });

  describe('Response Structure Consistency', () => {
    it('should all responses have success property', () => {
      const responses = [
        ResponseUtil.success({ data: 1 }),
        ResponseUtil.error('Error'),
        ResponseUtil.paginated([], 1, 10, 0),
        ResponseUtil.created({ id: 1 }),
        ResponseUtil.noContent(),
        ResponseUtil.notFound('Resource'),
        ResponseUtil.badRequest('Bad'),
        ResponseUtil.unauthorized(),
        ResponseUtil.forbidden(),
        ResponseUtil.conflict('Conflict'),
      ];

      responses.forEach((response) => {
        expect(response).toHaveProperty('success');
        expect(typeof response.success).toBe('boolean');
      });
    });

    it('should all responses have timestamp', () => {
      const responses = [
        ResponseUtil.success({}),
        ResponseUtil.error('Error'),
        ResponseUtil.created({}),
      ];

      responses.forEach((response) => {
        expect(response).toHaveProperty('timestamp');
        expect(typeof response.timestamp).toBe('string');
      });
    });

    it('should all responses have statusCode', () => {
      const responses = [
        ResponseUtil.success({}, '', 200),
        ResponseUtil.error('Error', 500),
        ResponseUtil.created({}, ''),
        ResponseUtil.noContent(),
      ];

      responses.forEach((response) => {
        expect(response).toHaveProperty('statusCode');
        expect(typeof response.statusCode).toBe('number');
      });
    });

    it('should generate unique timestamps', async () => {
      const response1 = ResponseUtil.success({});
      await new Promise((resolve) => setTimeout(resolve, 10));
      const response2 = ResponseUtil.success({});

      expect(response1.timestamp).not.toBe(response2.timestamp);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type information in success response', () => {
      interface UserData {
        id: string;
        name: string;
      }

      const userData: UserData = { id: '1', name: 'Test' };
      const result = ResponseUtil.success<UserData>(userData);

      // TypeScript should infer the type correctly
      if (result.data) {
        expect(result.data.id).toBe('1');
        expect(result.data.name).toBe('Test');
      }
    });

    it('should work with generic data types', () => {
      const numbers = [1, 2, 3];
      const result = ResponseUtil.success<number[]>(numbers);

      expect(Array.isArray(result.data)).toBe(true);
      if (result.data) {
        expect(result.data[0]).toBe(1);
      }
    });
  });
});
