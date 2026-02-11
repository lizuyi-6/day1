import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkflowDto } from './create-workflow.dto';

/**
 * DTO for updating a workflow
 * All fields are optional
 */
export class UpdateWorkflowDto extends PartialType(CreateWorkflowDto) {}
