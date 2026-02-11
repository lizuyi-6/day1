import { IsString, IsOptional } from 'class-validator';

export class DebugNodeDto {
  @IsString()
  nodeId: string;

  @IsOptional()
  inputs?: Record<string, any>;
}
