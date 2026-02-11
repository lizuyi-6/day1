import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsObject,
} from 'class-validator';

/**
 * DTO for creating a new workflow
 */
export class CreateWorkflowDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(1, { message: 'Name must be at least 1 character long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsObject({ message: 'GraphData must be an object' })
  @IsOptional()
  graphData?: {
    nodes: any[];
    edges: any[];
  };

  @IsString({ message: 'Comment must be a string' })
  @IsOptional()
  comment?: string;
}
