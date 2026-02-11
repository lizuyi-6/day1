import { PartialType } from '@nestjs/mapped-types';
import { CreateExecutionHistoryDto } from './create-execution-history.dto';

export class UpdateExecutionHistoryDto extends PartialType(
  CreateExecutionHistoryDto,
) {}
