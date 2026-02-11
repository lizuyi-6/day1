import { IsUUID, IsNotEmpty, IsObject, validate } from 'class-validator';
import { ValidationError } from 'class-validator';

/**
 * DTO for executing a workflow
 */
export class ExecuteWorkflowDto {
  @IsUUID('4', { message: 'Workflow ID must be a valid UUID v4' })
  @IsNotEmpty({ message: 'Workflow ID is required' })
  workflowId: string;

  @IsObject({ message: 'Inputs must be an object' })
  inputs: Record<string, any>;

  /**
   * Custom validation to ensure inputs is a valid object
   */
  async validate(): Promise<ValidationError[]> {
    return validate(this);
  }
}
