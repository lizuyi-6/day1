import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { Workflow } from './entities/workflow.entity';
import { WorkflowVersion } from './entities/workflow-version.entity';
import { WorkflowRunner } from './runner/workflow.runner';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto';
import { PaginationDto } from './dto/pagination.dto';
import {
  WorkflowNotFoundException,
  InvalidWorkflowDataException,
  WorkflowExecutionException,
} from '../common/exceptions/app.exception';
import { ResponseUtil } from '../common/interfaces/response.interface';

/**
 * Workflow Service
 *
 * Handles all business logic related to workflow management including
 * creation, retrieval, update, deletion, and execution of workflows.
 *
 * @remarks
 * This service serves as the primary interface for workflow operations,
 * coordinating between the database layer (via TypeORM repositories) and
 * the execution layer (via WorkflowRunner).
 */
@Injectable()
export class WorkflowService implements OnModuleInit {
  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowVersion)
    private workflowVersionRepository: Repository<WorkflowVersion>,
    private workflowRunner: WorkflowRunner,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.workflowRunner.setModuleRef(this.moduleRef);
  }

  /**
   * Create a new workflow
   *
   * Creates a new workflow with the provided data and associates it with
   * the specified user if a userId is provided.
   *
   * @param createWorkflowDto - DTO containing workflow creation data
   * @param userId - Optional user ID to associate with the workflow
   * @returns Promise<Workflow> The created workflow entity
   *
   * @throws {BadRequestException} If workflow data is invalid
   *
   * @example
   * ```typescript
   * const workflow = await workflowService.create(
   *   { name: 'My Workflow' },
   *   'user-123'
   * );
   * ```
   */
  async create(
    createWorkflowDto: CreateWorkflowDto,
    browserId?: string,
    userId?: string,
  ): Promise<Workflow> {
    try {
      const workflowData: Partial<Workflow> = {
        browserId: browserId,
        name: createWorkflowDto.name,
        description: createWorkflowDto.description,
        graphData: createWorkflowDto.graphData,
      };

      const workflow = this.workflowRepository.create(workflowData);
      return await this.workflowRepository.save(workflow);
    } catch (error) {
      throw new InvalidWorkflowDataException(
        error instanceof Error ? error.message : 'Failed to create workflow',
      );
    }
  }

  /**
   * Retrieve all workflows with pagination
   *
   * Fetches workflows from the database with pagination support, ordered by their last
   * update timestamp in descending order (most recent first).
   *
   * @param pagination - Pagination parameters (page and limit)
   * @returns Promise containing paginated workflow data with metadata
   *
   * @example
   * ```typescript
   * const result = await workflowService.findAll({ page: 1, limit: 20 });
   * // Returns { items: Workflow[], total: number, page: 1, limit: 20, totalPages: 5 }
   * ```
   */
  async findAll(pagination: PaginationDto = {}, browserId?: string, status?: 'draft' | 'published' | 'archived') {
    const { page = 1, limit = 20 } = pagination;

    // Build where clause: either browserId matches OR browserId is null (public/seed workflows)
    // IMPORTANT: When browserId is provided, we must explicitly query for (browserId = X OR browserId IS NULL)
    // TypeORM's find options syntax for OR condition requires an array of objects
    
    // DEBUG: Log to confirm query parameters
    console.log(`🔍 findAll called with browserId: "${browserId}", page: ${page}, limit: ${limit}, status: "${status}"`);

    let where: any = browserId
      ? [
          { browserId, ...(status ? { status } : {}) },
          { browserId: null, ...(status ? { status } : {}) },
        ]
      : (status ? { status } : {}); 

    // Execute query
    let [items, total] = await this.workflowRepository.findAndCount({
      where,
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      cache: false, 
    });

    // Auto-seed sample workflow if database is completely empty (no workflows at all)
    if (total === 0 && !browserId) {
      const globalCount = await this.workflowRepository.count();
      if (globalCount === 0) {
        console.log('🌱 Database is empty. Seeding sample workflow...');
        const sampleWorkflow = await this.createSampleWorkflow();
        items = [sampleWorkflow];
        total = 1;
      }
    }

    console.log(`📊 Found ${total} workflows with strict filter.`);

    // Fallback: If strict filter returns nothing, try fetching everything to debug
    if (total === 0) {
        console.log('⚠️ No workflows found with strict filter. Attempting to fetch ALL workflows for debugging...');
        const [allItems, allTotal] = await this.workflowRepository.findAndCount({
            order: { updatedAt: 'DESC' },
            take: 5, // Just peek at a few
        });
        console.log(`🌍 Total workflows in DB (ignoring owner): ${allTotal}`);
        if (allTotal > 0) {
            console.log('👀 Sample workflow owners:', allItems.map(w => w.browserId));
            // OPTIONAL: Return these items anyway so the user sees *something*
            // items = allItems;
            // total = allTotal;
        }
    }

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Retrieve a single workflow by ID
   *
   * Fetches a specific workflow from the database using its unique identifier.
   * Allows access to workflows owned by the user OR public workflows (browserId IS NULL).
   *
   * @param id - The unique identifier of the workflow (UUID v4 format)
   * @returns Promise<Workflow | null> The workflow if found, null otherwise
   *
   * @example
   * ```typescript
   * const workflow = await workflowService.findOne('123e4567-e89b-12d3-a456-426614174000');
   * if (workflow) {
   *   console.log('Found:', workflow.name);
   * }
   * ```
   */
  async findOne(id: string, browserId?: string): Promise<Workflow | null> {
    // Build OR condition: (id AND browserId) OR (id AND browserId IS NULL)
    // This allows users to access their own workflows AND public workflows
    let where: any;

    if (browserId) {
      where = [
        { id, browserId },
        { id, browserId: null }  // Allow access to public workflows
      ];
    } else {
      where = { id };
    }

    console.log('🔍 查找工作流:', { id, browserId, where: JSON.stringify(where) })
    const result = await this.workflowRepository.findOne({
      where
    });

    console.log('📦 查找结果:', result ? { id: result.id, name: result.name, hasGraphData: !!result.graphData } : 'null')
    return result;
  }

  /**
   * Update an existing workflow
   *
   * Updates a workflow with the provided data. Only updates fields that
   * are present in the updateDto. Handles graphData updates separately.
   *
   * @param id - The unique identifier of the workflow to update
   * @param updateWorkflowDto - DTO containing fields to update
   * @returns Promise<UpdateResult> The TypeORM update result
   *
   * @throws {WorkflowNotFoundException} If the workflow doesn't exist
   * @throws {InvalidWorkflowDataException} If update data is invalid
   *
   * @example
   * ```typescript
   * await workflowService.update('workflow-id', {
   *   name: 'Updated Workflow Name'
   * });
   * ```
   */
  async update(
    id: string,
    updateWorkflowDto: UpdateWorkflowDto,
    browserId?: string,
  ) {
    const workflow = await this.findOne(id, browserId);
    if (!workflow) {
      throw new WorkflowNotFoundException(id);
    }

    const updateData: Partial<Workflow> = {};

    if (updateWorkflowDto.name) {
      updateData.name = updateWorkflowDto.name;
    }

    if (updateWorkflowDto.description) {
      updateData.description = updateWorkflowDto.description;
    }

    if ('graphData' in updateWorkflowDto && updateWorkflowDto.graphData) {
      // Only create version if existing graphData is not null/empty to avoid validation errors
      if (workflow.graphData && Object.keys(workflow.graphData).length > 0) {
        await this.createVersion(id, workflow.graphData, (updateWorkflowDto as any).comment);
      }
      updateData.graphData = (updateWorkflowDto as any).graphData;
    }

    try {
      return await this.workflowRepository.update(id, updateData);
    } catch (error) {
      throw new InvalidWorkflowDataException(
        error instanceof Error ? error.message : 'Failed to update workflow',
      );
    }
  }

  /**
   * Delete a workflow
   *
   * Permanently removes a workflow from the database.
   *
   * @param id - The unique identifier of the workflow to delete
   * @returns Promise<DeleteResult> The TypeORM delete result
   *
   * @throws {WorkflowNotFoundException} If the workflow doesn't exist
   *
   * @example
   * ```typescript
   * await workflowService.remove('workflow-id');
   * ```
   */
  async remove(id: string, browserId?: string) {
    const workflow = await this.findOne(id, browserId);
    if (!workflow) {
      throw new WorkflowNotFoundException(id);
    }
    return await this.workflowRepository.delete(id);
  }

  /**
   * Execute a workflow
   *
   * Executes a workflow with the provided input parameters. Validates that
   * the workflow exists before executing and passes the graph data to the
   * workflow runner for execution.
   *
   * @param id - The unique identifier of the workflow to execute (UUID v4 format)
   * @param inputs - Input parameters to pass to the workflow execution
   * @returns Promise<any> The result of the workflow execution
   *
   * @throws {WorkflowNotFoundException} If the workflow doesn't exist
   * @throws {InvalidWorkflowDataException} If the workflow graph data is invalid
   * @throws {WorkflowExecutionException} If workflow execution fails
   *
   * @example
   * ```typescript
   * const result = await workflowService.executeWorkflow(
   *   '123e4567-e89b-12d3-a456-426614174000',
   *   { prompt: 'Hello, world!', temperature: 0.7 }
   * );
   * console.log('Execution result:', result);
   * ```
   */
  async executeWorkflow(
    id: string,
    inputs: Record<string, any>,
    browserId?: string,
  ): Promise<any> {
    const workflow = await this.findOne(id, browserId);

    if (!workflow) {
      throw new WorkflowNotFoundException(id);
    }

    if (!workflow.graphData) {
      throw new InvalidWorkflowDataException(
        'Workflow has no graph data configured',
      );
    }

    try {
      return await this.workflowRunner.execute(
        workflow.graphData as any,
        inputs,
        id // Pass workflow ID for real-time updates
      );
    } catch (error) {
      throw new WorkflowExecutionException(
        error instanceof Error ? error.message : 'Unknown execution error',
      );
    }
  }

  async debugNode(
    workflowId: string,
    nodeId: string,
    inputs: Record<string, any>,
    browserId?: string,
  ): Promise<any> {
    const workflow = await this.findOne(workflowId, browserId);

    if (!workflow) {
      throw new WorkflowNotFoundException(workflowId);
    }

    if (!workflow.graphData) {
      throw new InvalidWorkflowDataException(
        'Workflow has no graph data configured',
      );
    }

    const graphData = workflow.graphData as any;
    const node = graphData.nodes.find((n: any) => n.id === nodeId);

    if (!node) {
      throw new NotFoundException(
        `Node with ID '${nodeId}' not found in workflow`,
      );
    }

    try {
      return await this.workflowRunner.debugNode(node, inputs, graphData);
    } catch (error) {
      throw new WorkflowExecutionException(
        error instanceof Error ? error.message : 'Unknown execution error',
      );
    }
  }

  async createVersion(
    workflowId: string,
    graphData: object,
    comment?: string,
  ): Promise<WorkflowVersion> {
    const versions = await this.workflowVersionRepository.find({
      where: { workflowId },
      order: { versionNumber: 'DESC' },
      take: 1,
    });

    const nextVersionNumber = versions.length > 0 ? versions[0].versionNumber + 1 : 1;

    const version = this.workflowVersionRepository.create({
      workflowId,
      versionNumber: nextVersionNumber,
      graphData,
      comment,
    });

    return await this.workflowVersionRepository.save(version);
  }

  async getVersions(workflowId: string, browserId?: string): Promise<WorkflowVersion[]> {
    const workflow = await this.findOne(workflowId, browserId);
    if (!workflow) {
      throw new WorkflowNotFoundException(workflowId);
    }

    return await this.workflowVersionRepository.find({
      where: { workflowId },
      order: { versionNumber: 'DESC' },
    });
  }

  async restoreVersion(
    workflowId: string,
    versionId: string,
    browserId?: string,
  ): Promise<void> {
    const workflow = await this.findOne(workflowId, browserId);
    if (!workflow) {
      throw new WorkflowNotFoundException(workflowId);
    }

    const version = await this.workflowVersionRepository.findOneBy({ id: versionId });
    if (!version || version.workflowId !== workflowId) {
      throw new NotFoundException(`Version ${versionId} not found`);
    }

    await this.workflowRepository.update(workflowId, { graphData: version.graphData });
  }

  async deploy(
    id: string,
    config: Record<string, any>,
    browserId?: string,
  ): Promise<{ success: boolean; url: string; isUpdate: boolean }> {
    const workflow = await this.findOne(id, browserId);
    if (!workflow) {
      throw new WorkflowNotFoundException(id);
    }

    // 检查是否已经部署过
    const isUpdate = workflow.status === 'published';

    // 生成生产环境 URL
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const productionUrl = `${baseUrl}/api/v1/run/${id}`;

    // 更新部署时间戳（即使是重新部署也要更新时间）
    const deploymentData = {
      status: 'published' as const,
      deploymentUrl: productionUrl,
      deployedAt: new Date(),
    };

    await this.workflowRepository.update(id, deploymentData);

    console.log(`${isUpdate ? '♻️ 重新部署' : '✅ 首次部署'} 工作流 ${id} (${workflow.name}) - URL: ${productionUrl}`);

    return {
      success: true,
      url: productionUrl,
      isUpdate,
    };
  }

  private async createSampleWorkflow(): Promise<Workflow> {
    const sampleGraph = {
      "nodes": [
        {
          "id": "node-1",
          "type": "start",
          "position": { "x": 100, "y": 200 },
          "data": { "label": "开始" }
        },
        {
          "id": "node-2",
          "type": "llm",
          "position": { "x": 400, "y": 200 },
          "data": { 
            "label": "LLM 对话",
            "model": "gpt-3.5-turbo",
            "systemPrompt": "你是一个有用的助手。",
            "userPrompt": "{{userQuestion}}"
          }
        },
        {
          "id": "node-3",
          "type": "end",
          "position": { "x": 700, "y": 200 },
          "data": { "label": "结束" }
        }
      ],
      "edges": [
        {
          "id": "edge-1",
          "source": "node-1",
          "target": "node-2"
        },
        {
          "id": "edge-2",
          "source": "node-2",
          "target": "node-3"
        }
      ]
    };

    const workflow = this.workflowRepository.create({
      name: '示例工作流 (Sample)',
      description: '这是一个自动生成的示例工作流，展示了基本的 LLM 对话流程。',
      graphData: sampleGraph,
      status: 'draft',
      // No browserId means it's public/system
    });

    return await this.workflowRepository.save(workflow);
  }
}
