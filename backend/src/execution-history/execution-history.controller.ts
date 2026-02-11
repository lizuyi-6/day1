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
} from '@nestjs/common';
import { ExecutionHistoryService } from './execution-history.service';
import { HybridAuthGuard } from '../auth/hybrid-auth.guard';
import { User } from '../auth/jwt-auth.decorator';
import { CreateExecutionHistoryDto } from './dto/create-execution-history.dto';
import { UpdateExecutionHistoryDto } from './dto/update-execution-history.dto';
import { ResponseUtil } from '../common/interfaces/response.interface';

@Controller('execution-history')
export class ExecutionHistoryController {
  constructor(
    private readonly executionHistoryService: ExecutionHistoryService,
  ) {}

  @Post()
  @UseGuards(HybridAuthGuard)
  async create(
    @Body() createExecutionHistoryDto: CreateExecutionHistoryDto,
    @User() user: any,
  ) {
    const history = await this.executionHistoryService.create(
      createExecutionHistoryDto,
      user?.userId,
    );
    return ResponseUtil.created(
      history,
      'Execution history created successfully',
    );
  }

  @Get()
  @UseGuards(HybridAuthGuard)
  async findAll(@User() user: any, @Query('workflowId') workflowId?: string) {
    const histories = await this.executionHistoryService.findAll(
      user?.userId,
      workflowId,
    );
    return ResponseUtil.success(
      histories,
      'Execution histories retrieved successfully',
    );
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard)
  async findOne(@Param('id') id: string) {
    const history = await this.executionHistoryService.findOne(id);
    return ResponseUtil.success(
      history,
      'Execution history retrieved successfully',
    );
  }

  @Put(':id')
  @UseGuards(HybridAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateExecutionHistoryDto: UpdateExecutionHistoryDto,
  ) {
    const history = await this.executionHistoryService.update(
      id,
      updateExecutionHistoryDto,
    );
    return ResponseUtil.success(
      history,
      'Execution history updated successfully',
    );
  }

  @Delete(':id')
  @UseGuards(HybridAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.executionHistoryService.remove(id);
  }

  @Delete('clear')
  @UseGuards(HybridAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async clear(@User() user: any, @Query('workflowId') workflowId?: string) {
    if (workflowId) {
      await this.executionHistoryService.clearByWorkflow(workflowId);
    } else {
      await this.executionHistoryService.clearByUser(user?.userId);
    }
  }
}
