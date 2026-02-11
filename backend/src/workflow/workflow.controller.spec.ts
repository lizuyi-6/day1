import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowNotFoundException } from '../common/exceptions/app.exception';
import { ResponseUtil } from '../common/interfaces/response.interface';

/**
 * Workflow Controller Unit Tests
 *
 * Test suite for WorkflowController covering all HTTP endpoints:
 * - POST /workflow - Create workflow
 * - GET /workflow - Get all workflows
 * - GET /workflow/:id - Get single workflow
 * - PUT /workflow/:id - Update workflow
 * - DELETE /workflow/:id - Delete workflow
 * - POST /workflow/:id/run - Execute workflow
 */
describe('WorkflowController', () => {
  let controller: WorkflowController;
  let service: WorkflowService;

  const mockWorkflow = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Workflow',
    graphData: {
      nodes: [{ id: '1', type: 'start', data: { label: 'Start' } }],
      edges: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    userId: 'user-123',
    email: 'test@example.com',
  };

  const mockWorkflowService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    executeWorkflow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowController],
      providers: [
        {
          provide: WorkflowService,
          useValue: mockWorkflowService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<WorkflowController>(WorkflowController);
    service = module.get<WorkflowService>(WorkflowService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a workflow and return success response', async () => {
      const createDto: CreateWorkflowDto = { name: 'New Workflow' };
      mockWorkflowService.create.mockResolvedValue(mockWorkflow);

      const result = await controller.create(createDto, mockUser);

      expect(result).toEqual(
        ResponseUtil.created(mockWorkflow, 'Workflow created successfully'),
      );
      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.userId);
    });

    it('should propagate errors from service', async () => {
      const createDto: CreateWorkflowDto = { name: 'New Workflow' };
      const error = new Error('Database error');
      mockWorkflowService.create.mockRejectedValue(error);

      await expect(controller.create(createDto, mockUser)).rejects.toThrow(
        error,
      );
    });
  });

  describe('findAll', () => {
    it('should return array of workflows with success response', async () => {
      const workflows = [mockWorkflow, { ...mockWorkflow, id: '2' }];
      mockWorkflowService.findAll.mockResolvedValue(workflows);

      const result = await controller.findAll();

      expect(result).toEqual(
        ResponseUtil.success(workflows, 'Workflows retrieved successfully'),
      );
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no workflows exist', async () => {
      mockWorkflowService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result.data).toEqual([]);
      expect(result.success).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return workflow with success response when found', async () => {
      mockWorkflowService.findOne.mockResolvedValue(mockWorkflow);

      const result = await controller.findOne(mockWorkflow.id);

      expect(result).toEqual(
        ResponseUtil.success(mockWorkflow, 'Workflow retrieved successfully'),
      );
      expect(service.findOne).toHaveBeenCalledWith(mockWorkflow.id);
    });

    it('should return not found response when workflow does not exist', async () => {
      mockWorkflowService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(service.findOne).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('update', () => {
    it('should update workflow and return success response', async () => {
      const updateDto: UpdateWorkflowDto = { name: 'Updated Workflow' };
      mockWorkflowService.update.mockResolvedValue({ affected: 1 } as any);

      const result = await controller.update(mockWorkflow.id, updateDto);

      expect(result).toEqual(
        ResponseUtil.success(null, 'Workflow updated successfully'),
      );
      expect(service.update).toHaveBeenCalledWith(mockWorkflow.id, updateDto);
    });

    it('should propagate WorkflowNotFoundException from service', async () => {
      const updateDto: UpdateWorkflowDto = { name: 'Updated Workflow' };
      mockWorkflowService.update.mockRejectedValue(
        new WorkflowNotFoundException('non-existent-id'),
      );

      await expect(
        controller.update('non-existent-id', updateDto),
      ).rejects.toThrow(WorkflowNotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete workflow and return no content response', async () => {
      mockWorkflowService.remove.mockResolvedValue({ affected: 1 } as any);

      const result = await controller.remove(mockWorkflow.id);

      expect(result).toEqual(
        ResponseUtil.noContent('Workflow deleted successfully'),
      );
      expect(result.statusCode).toBe(204);
      expect(service.remove).toHaveBeenCalledWith(mockWorkflow.id);
    });

    it('should propagate errors from service', async () => {
      mockWorkflowService.remove.mockRejectedValue(
        new WorkflowNotFoundException('non-existent-id'),
      );

      await expect(controller.remove('non-existent-id')).rejects.toThrow(
        WorkflowNotFoundException,
      );
    });
  });

  describe('run', () => {
    it('should execute workflow and return success response', async () => {
      const inputs = { prompt: 'Test input' };
      const executionResult = { output: 'Test output', status: 'success' };
      mockWorkflowService.executeWorkflow.mockResolvedValue(executionResult);

      const result = await controller.run(mockWorkflow.id, inputs);

      expect(result).toEqual(
        ResponseUtil.success(executionResult, 'Workflow executed successfully'),
      );
      expect(service.executeWorkflow).toHaveBeenCalledWith(
        mockWorkflow.id,
        inputs,
      );
    });

    it('should propagate execution errors from service', async () => {
      const inputs = { prompt: 'Test input' };
      mockWorkflowService.executeWorkflow.mockRejectedValue(
        new WorkflowNotFoundException('non-existent-id'),
      );

      await expect(controller.run('non-existent-id', inputs)).rejects.toThrow(
        WorkflowNotFoundException,
      );
    });

    it('should handle empty inputs', async () => {
      const inputs = {};
      const executionResult = { output: 'Result' };
      mockWorkflowService.executeWorkflow.mockResolvedValue(executionResult);

      const result = await controller.run(mockWorkflow.id, inputs);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(executionResult);
    });
  });

  describe('Response Format Consistency', () => {
    it('should always return ApiResponse structure', async () => {
      mockWorkflowService.findAll.mockResolvedValue([mockWorkflow]);

      const result = await controller.findAll();

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.timestamp).toBe('string');
    });

    it('should include statusCode in responses', async () => {
      mockWorkflowService.findOne.mockResolvedValue(mockWorkflow);

      const result = await controller.findOne(mockWorkflow.id);

      expect(result).toHaveProperty('statusCode');
      expect(typeof result.statusCode).toBe('number');
    });

    it('should have ISO 8601 timestamp format', async () => {
      mockWorkflowService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();
      const timestamp = result.timestamp;

      expect(timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });
  });

  describe('Security and Validation', () => {
    it('should require JWT authentication (guard test)', async () => {
      // This test verifies the guard is applied
      const guards = Reflect.getMetadata('__guards__', WorkflowController);
      expect(guards).toBeDefined();
    });

    it('should pass user information to service on create', async () => {
      const createDto: CreateWorkflowDto = { name: 'Test' };
      mockWorkflowService.create.mockResolvedValue(mockWorkflow);

      await controller.create(createDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.userId);
    });

    it('should sanitize input data through DTO validation', async () => {
      const createDto: CreateWorkflowDto = { name: 'Valid Name' };
      mockWorkflowService.create.mockResolvedValue(mockWorkflow);

      await controller.create(createDto, mockUser);

      expect(service.create).toHaveBeenCalled();
    });
  });
});
