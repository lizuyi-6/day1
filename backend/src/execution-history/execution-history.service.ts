import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ExecutionHistory,
  ExecutionStatus,
} from './entities/execution-history.entity';
import { CreateExecutionHistoryDto } from './dto/create-execution-history.dto';
import { UpdateExecutionHistoryDto } from './dto/update-execution-history.dto';

@Injectable()
export class ExecutionHistoryService {
  constructor(
    @InjectRepository(ExecutionHistory)
    private readonly executionHistoryRepository: Repository<ExecutionHistory>,
  ) {}

  async create(
    createExecutionHistoryDto: CreateExecutionHistoryDto,
    userId?: string,
  ): Promise<ExecutionHistory> {
    const history = this.executionHistoryRepository.create({
      ...createExecutionHistoryDto,
      userId,
      status: createExecutionHistoryDto.status || ExecutionStatus.RUNNING,
    });

    return await this.executionHistoryRepository.save(history);
  }

  async findAll(
    userId?: string,
    workflowId?: string,
  ): Promise<ExecutionHistory[]> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (workflowId) {
      where.workflowId = workflowId;
    }

    return await this.executionHistoryRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ExecutionHistory> {
    const history = await this.executionHistoryRepository.findOne({
      where: { id },
    });
    if (!history) {
      throw new NotFoundException(`ExecutionHistory with ID '${id}' not found`);
    }
    return history;
  }

  async update(
    id: string,
    updateExecutionHistoryDto: UpdateExecutionHistoryDto,
  ): Promise<ExecutionHistory> {
    const history = await this.executionHistoryRepository.findOne({
      where: { id },
    });
    if (!history) {
      throw new NotFoundException(`ExecutionHistory with ID '${id}' not found`);
    }

    Object.assign(history, updateExecutionHistoryDto);
    return await this.executionHistoryRepository.save(history);
  }

  async remove(id: string): Promise<void> {
    const history = await this.executionHistoryRepository.findOne({
      where: { id },
    });
    if (!history) {
      throw new NotFoundException(`ExecutionHistory with ID '${id}' not found`);
    }
    await this.executionHistoryRepository.remove(history);
  }

  async clearByWorkflow(workflowId: string): Promise<void> {
    await this.executionHistoryRepository.delete({ workflowId });
  }

  async clearByUser(userId: string): Promise<void> {
    await this.executionHistoryRepository.delete({ userId });
  }
}
