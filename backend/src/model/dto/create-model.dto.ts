import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { ModelProvider } from '../entities/model.entity';

export class CreateModelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ModelProvider)
  @IsOptional()
  provider?: ModelProvider;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  baseUrl?: string;
}
