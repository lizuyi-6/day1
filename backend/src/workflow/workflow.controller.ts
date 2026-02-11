import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { HybridAuthGuard } from '../auth/hybrid-auth.guard';
import { User } from '../auth/jwt-auth.decorator';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { PaginationDto } from './dto/pagination.dto';
import { DebugNodeDto } from './dto/debug-node.dto';
import { ResponseUtil } from '../common/interfaces/response.interface';
import { BrowserId } from '../common/decorators/browser-id.decorator';
import { WorkflowNotFoundException } from '../common/exceptions/app.exception';

/**
 * Workflow Controller
 *
 * Handles HTTP requests related to workflow management.
 * All endpoints require JWT authentication except where noted.
 *
 * @remarks
 * Base path: /workflow
 * All routes are protected by JWT authentication guard.
 */
@Controller('workflow')
@UseGuards(HybridAuthGuard)
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  /**
   * Create a new workflow
   *
   * Creates a new workflow with the provided data.
   * The workflow will be associated with the authenticated user.
   *
   * @param createWorkflowDto - Workflow creation data
   * @param user - Authenticated user from JWT token
   * @returns Promise<ApiResponse<Workflow>> Created workflow data
   *
   * @example
   * ```typescript
   * POST /workflow
   * {
   *   "name": "My Workflow"
   * }
   * ```
   */
  @Post()
  async create(
    @Body() createWorkflowDto: CreateWorkflowDto,
    @BrowserId() browserId: string,
  ) {
    const workflow = await this.workflowService.create(
      createWorkflowDto,
      browserId,
    );
    return ResponseUtil.created(workflow, 'Workflow created successfully');
  }

  /**
   * Retrieve all workflows with pagination
   *
   * Fetches workflows for authenticated user with pagination support.
   * Results are ordered by last update timestamp (most recent first).
   *
   * @param pagination - Pagination query parameters (page, limit)
   * @param status - Optional status filter (draft, published, archived)
   * @returns Promise<ApiResponse<PaginatedResult>> Paginated workflow data
   *
   * @example
   * ```typescript
   * GET /workflow?page=1&limit=20&status=published
   * ```
   */
  @Get()
  @SetMetadata('isPublic', true)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: 'draft' | 'published' | 'archived',
    @BrowserId() browserId?: string,
  ) {
    const pagination: PaginationDto = { page, limit };
    console.log('🔍 Controller.findAll called:', { pagination, status, browserId })
    const result = await this.workflowService.findAll(pagination, browserId, status);
    return ResponseUtil.success(result, 'Workflows retrieved successfully');
  }

  /**
   * Retrieve a single workflow by ID
   *
   * Fetches a specific workflow using its unique identifier.
   *
   * @param id - Workflow UUID
   * @returns Promise<ApiResponse<Workflow>> The workflow data
   *
   * @example
   * ```typescript
   * GET /workflow/123e4567-e89b-12d3-a456-426614174000
   * ```
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @BrowserId() browserId: string) {
    console.log('🔍 Controller.findOne called:', { id, browserId })
    const workflow = await this.workflowService.findOne(id, browserId);

    if (!workflow) {
      console.log('❌ Workflow not found:', id)
      throw new WorkflowNotFoundException(id);
    }

    console.log('✅ Workflow found:', { id: workflow.id, name: workflow.name, hasGraphData: !!workflow.graphData, graphDataKeys: workflow.graphData ? Object.keys(workflow.graphData) : [] })
    return ResponseUtil.success(workflow, 'Workflow retrieved successfully');
  }

  /**
   * Update a workflow
   *
   * Updates an existing workflow with the provided data.
   * Only updates fields that are present in the request body.
   *
   * @param id - Workflow UUID
   * @param updateWorkflowDto - Fields to update
   * @returns Promise<ApiResponse> Update confirmation
   *
   * @example
   * ```typescript
   * PUT /workflow/123e4567-e89b-12d3-a456-426614174000
   * {
   *   "name": "Updated Workflow Name"
   * }
   * ```
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
    @BrowserId() browserId: string,
  ) {
    console.log('💾 Controller.update called:', { id, browserId, hasGraphData: !!updateWorkflowDto.graphData })
    const result = await this.workflowService.update(id, updateWorkflowDto, browserId);
    console.log('✅ Update result:', result)
    return ResponseUtil.success(null, 'Workflow updated successfully');
  }

  /**
   * Delete a workflow
   *
   * Permanently removes a workflow from the database.
   * This operation cannot be undone.
   *
   * @param id - Workflow UUID
   * @returns Promise<ApiResponse> Deletion confirmation
   *
   * @example
   * ```typescript
   * DELETE /workflow/123e4567-e89b-12d3-a456-426614174000
   * ```
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @BrowserId() browserId: string) {
    await this.workflowService.remove(id, browserId);
  }

  /**
   * Execute a workflow
   *
   * Executes a workflow with the provided input parameters.
   * Returns the execution result including outputs and metadata.
   *
   * @param id - Workflow UUID
   * @param body - Input parameters for workflow execution
   * @returns Promise<ApiResponse> Workflow execution result
   *
   * @example
   * ```typescript
   * POST /workflow/123e4567-e89b-12d3-a456-426614174000/run
   * {
   *   "prompt": "Hello, world!",
   *   "temperature": 0.7
   * }
   * ```
   */
  @Post(':id/run')
  async run(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
    @BrowserId() browserId: string,
  ) {
    const result = await this.workflowService.executeWorkflow(
      id,
      body,
      browserId,
    );
    return ResponseUtil.success(result, 'Workflow executed successfully');
  }

  /**
   * Debug a single node in the workflow
   *
   * Executes a single node for debugging purposes without running the entire workflow.
   *
   * @param id - Workflow UUID
   * @param body - Node ID and optional input data
   * @returns Promise<ApiResponse> Node execution result with inputs and outputs
   *
   * @example
   * ```typescript
   * POST /workflow/123e4567-e89b-12d3-a456-426614174000/debug
   * {
   *   "nodeId": "node-abc123",
   *   "inputs": { "prompt": "test" }
   * }
   * ```
   */
  @Post(':id/debug')
  @UseGuards(HybridAuthGuard)
  async debug(
    @Param('id') id: string,
    @Body() body: DebugNodeDto,
    @BrowserId() browserId: string,
  ) {
    const result = await this.workflowService.debugNode(
      id,
      body.nodeId,
      body.inputs || {},
      browserId,
    );
    return ResponseUtil.success(result, 'Node debug completed');
  }

  @Get(':id/versions')
  async getVersions(@Param('id') id: string, @BrowserId() browserId: string) {
    const versions = await this.workflowService.getVersions(id, browserId);
    return ResponseUtil.success(versions, 'Versions retrieved successfully');
  }

  @Post(':id/versions/:versionId/restore')
  async restoreVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @BrowserId() browserId: string,
  ) {
    await this.workflowService.restoreVersion(id, versionId, browserId);
    return ResponseUtil.success(null, 'Version restored successfully');
  }

  @Post(':id/deploy')
  async deploy(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
    @BrowserId() browserId: string,
  ) {
    const result = await this.workflowService.deploy(id, body, browserId);
    const message = result.isUpdate
      ? '工作流重新部署成功（已覆盖之前的部署）'
      : '工作流首次部署成功';
    return ResponseUtil.success(result, message);
  }
}
