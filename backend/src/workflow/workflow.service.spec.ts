import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowService } from './workflow.service';
import { Workflow } from './entities/workflow.entity';
import { WorkflowRunner } from './runner/workflow.runner';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import {
  WorkflowNotFoundException,
  InvalidWorkflowDataException,
  WorkflowExecutionException,
} from '../common/exceptions/app.exception';

/**
 * Workflow Service Unit Tests
 *
 * Test suite for WorkflowService covering all major operations:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Workflow execution
 * - Error handling
 * - Edge cases
 */
describe('WorkflowService', () => {
  let service: WorkflowService;
  let repository: Repository<Workflow>;
  let workflowRunner: WorkflowRunner;

  // Mock workflow data
  const mockWorkflow: Workflow = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Workflow',
    graphData: {
      nodes: [
        { id: '1', type: 'start', data: { label: 'Start' } },
        { id: '2', type: 'end', data: { label: 'End' } },
      ],
      edges: [{ id: 'e1', source: '1', target: '2' }],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWorkflowRunner = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowService,
        {
          provide: getRepositoryToken(Workflow),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: WorkflowRunner,
          useValue: mockWorkflowRunner,
        },
      ],
    }).compile();

    service = module.get<WorkflowService>(WorkflowService);
    repository = module.get<Repository<Workflow>>(getRepositoryToken(Workflow));
    workflowRunner = module.get<WorkflowRunner>(WorkflowRunner);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a workflow successfully', async () => {
      const createDto: CreateWorkflowDto = { name: 'New Workflow' };
      const savedWorkflow = { ...mockWorkflow, name: createDto.name };

      jest.spyOn(repository, 'create').mockReturnValue(savedWorkflow as any);
      jest.spyOn(repository, 'save').mockResolvedValue(savedWorkflow as any);

      const result = await service.create(createDto);

      expect(result).toEqual(savedWorkflow);
      expect(repository.create).toHaveBeenCalledWith({
        name: createDto.name,
      });
      expect(repository.save).toHaveBeenCalledWith(savedWorkflow);
    });

    it('should create a workflow with userId', async () => {
      const createDto: CreateWorkflowDto = { name: 'New Workflow' };
      const userId = 'user-123';
      const savedWorkflow = { ...mockWorkflow, name: createDto.name };

      jest.spyOn(repository, 'create').mockReturnValue(savedWorkflow as any);
      jest.spyOn(repository, 'save').mockResolvedValue(savedWorkflow as any);

      await service.create(createDto, userId);

      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw InvalidWorkflowDataException on database error', async () => {
      const createDto: CreateWorkflowDto = { name: 'New Workflow' };
      const error = new Error('Database connection failed');

      jest.spyOn(repository, 'create').mockReturnValue(mockWorkflow as any);
      jest.spyOn(repository, 'save').mockRejectedValue(error);

      await expect(service.create(createDto)).rejects.toThrow(
        InvalidWorkflowDataException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of workflows ordered by updatedAt DESC', async () => {
      const workflows = [mockWorkflow, { ...mockWorkflow, id: '2' }];
      jest.spyOn(repository, 'find').mockResolvedValue(workflows as any);

      const result = await service.findAll();

      expect(result).toEqual(workflows);
      expect(repository.find).toHaveBeenCalledWith({
        order: { updatedAt: 'DESC' },
      });
    });

    it('should return empty array when no workflows exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a workflow when found', async () => {
      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValue(mockWorkflow as any);

      const result = await service.findOne(mockWorkflow.id);

      expect(result).toEqual(mockWorkflow);
      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: mockWorkflow.id,
      });
    });

    it('should return null when workflow not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: 'non-existent-id',
      });
    });
  });

  describe('update', () => {
    it('should update workflow name successfully', async () => {
      const updateDto: UpdateWorkflowDto = { name: 'Updated Workflow' };
      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValue(mockWorkflow as any);
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as any);

      await service.update(mockWorkflow.id, updateDto);

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: mockWorkflow.id,
      });
      expect(repository.update).toHaveBeenCalledWith(mockWorkflow.id, {
        name: updateDto.name,
      });
    });

    it('should update workflow graphData successfully', async () => {
      const graphData = {
        nodes: [{ id: '1', type: 'start', data: { label: 'Start' } }],
        edges: [],
      };
      const updateDto: UpdateWorkflowDto = { name: 'Test' } as any;
      updateDto.graphData = graphData;

      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValue(mockWorkflow as any);
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as any);

      await service.update(mockWorkflow.id, updateDto);

      expect(repository.update).toHaveBeenCalledWith(mockWorkflow.id, {
        graphData,
      });
    });

    it('should throw WorkflowNotFoundException when workflow does not exist', async () => {
      const updateDto: UpdateWorkflowDto = { name: 'Updated Workflow' };
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateDto),
      ).rejects.toThrow(WorkflowNotFoundException);
    });

    it('should throw InvalidWorkflowDataException on database error', async () => {
      const updateDto: UpdateWorkflowDto = { name: 'Updated Workflow' };
      const error = new Error('Database error');

      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValue(mockWorkflow as any);
      jest.spyOn(repository, 'update').mockRejectedValue(error);

      await expect(service.update(mockWorkflow.id, updateDto)).rejects.toThrow(
        InvalidWorkflowDataException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a workflow successfully', async () => {
      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValue(mockWorkflow as any);
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      await service.remove(mockWorkflow.id);

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: mockWorkflow.id,
      });
      expect(repository.delete).toHaveBeenCalledWith(mockWorkflow.id);
    });

    it('should throw WorkflowNotFoundException when workflow does not exist', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        WorkflowNotFoundException,
      );
    });
  });

  describe('executeWorkflow', () => {
    it('should execute workflow successfully', async () => {
      const inputs = { prompt: 'Test input' };
      const executionResult = { output: 'Test output', status: 'success' };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkflow as any);
      jest.spyOn(workflowRunner, 'execute').mockResolvedValue(executionResult);

      const result = await service.executeWorkflow(mockWorkflow.id, inputs);

      expect(result).toEqual(executionResult);
      expect(service.findOne).toHaveBeenCalledWith(mockWorkflow.id);
      expect(workflowRunner.execute).toHaveBeenCalledWith(
        mockWorkflow.graphData,
        inputs,
      );
    });

    it('should throw WorkflowNotFoundException when workflow does not exist', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(
        service.executeWorkflow('non-existent-id', {}),
      ).rejects.toThrow(WorkflowNotFoundException);
    });

    it('should throw InvalidWorkflowDataException when graphData is missing', async () => {
      const workflowWithoutGraph = { ...mockWorkflow, graphData: null };
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(workflowWithoutGraph as any);

      await expect(
        service.executeWorkflow(mockWorkflow.id, {}),
      ).rejects.toThrow(InvalidWorkflowDataException);
    });

    it('should throw WorkflowExecutionException on execution failure', async () => {
      const inputs = { prompt: 'Test input' };
      const error = new Error('Execution failed');

      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkflow as any);
      jest.spyOn(workflowRunner, 'execute').mockRejectedValue(error);

      await expect(
        service.executeWorkflow(mockWorkflow.id, inputs),
      ).rejects.toThrow(WorkflowExecutionException);
    });

    it('should pass inputs correctly to workflow runner', async () => {
      const inputs = { prompt: 'Hello', temperature: 0.7 };
      const executionResult = { output: 'Response' };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkflow as any);
      jest.spyOn(workflowRunner, 'execute').mockResolvedValue(executionResult);

      await service.executeWorkflow(mockWorkflow.id, inputs);

      expect(workflowRunner.execute).toHaveBeenCalledWith(
        mockWorkflow.graphData,
        inputs,
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty graphData gracefully', async () => {
      const workflowWithEmptyGraph = {
        ...mockWorkflow,
        graphData: { nodes: [], edges: [] },
      };
      const inputs = {};

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(workflowWithEmptyGraph as any);
      jest.spyOn(workflowRunner, 'execute').mockResolvedValue({});

      const result = await service.executeWorkflow(mockWorkflow.id, inputs);

      expect(result).toBeDefined();
    });

    it('should handle update with no changes', async () => {
      const emptyUpdateDto: UpdateWorkflowDto = {};
      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValue(mockWorkflow as any);
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as any);

      await service.update(mockWorkflow.id, emptyUpdateDto);

      expect(repository.update).toHaveBeenCalledWith(mockWorkflow.id, {});
    });

    it('should handle multiple concurrent executions', async () => {
      const inputs1 = { prompt: 'Input 1' };
      const inputs2 = { prompt: 'Input 2' };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkflow as any);
      jest
        .spyOn(workflowRunner, 'execute')
        .mockResolvedValue({ output: 'Result' });

      const [result1, result2] = await Promise.all([
        service.executeWorkflow(mockWorkflow.id, inputs1),
        service.executeWorkflow(mockWorkflow.id, inputs2),
      ]);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(workflowRunner.execute).toHaveBeenCalledTimes(2);
    });
  });
});
