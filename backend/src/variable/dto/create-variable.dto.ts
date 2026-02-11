import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { VariableType } from '../entities/variable.entity';

export class CreateVariableDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(VariableType)
  @IsOptional()
  type?: VariableType;

  @IsString()
  @IsOptional()
  value?: string;

  @IsBoolean()
  @IsOptional()
  isSecret?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}
