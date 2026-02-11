import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ExecutionStatus } from '../entities/execution-history.entity';

export class CreateExecutionHistoryDto {
  @IsString()
  workflowId: string;

  @IsEnum(ExecutionStatus)
  @IsOptional()
  status?: ExecutionStatus;

  @IsNumber()
  duration: number;

  @IsNumber()
  nodeCount: number;

  @IsOptional()
  logs?: any[];

  @IsString()
  @IsOptional()
  result?: string;

  @IsString()
  @IsOptional()
  error?: string;
}
