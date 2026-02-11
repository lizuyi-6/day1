import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { PluginCategory } from '../entities/plugin.entity';

export class CreatePluginDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(PluginCategory)
  @IsOptional()
  category?: PluginCategory;

  @IsString()
  @IsOptional()
  packageName?: string;

  @IsString()
  @IsOptional()
  version?: string;
}
