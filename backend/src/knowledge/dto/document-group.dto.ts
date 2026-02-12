import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateDocumentGroupDto {
  @IsString()
  @IsNotEmpty({ message: '文档组名称不能为空' })
  @MaxLength(100, { message: '文档组名称不能超过100个字符' })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '描述不能超过500个字符' })
  description?: string;
}

export class UpdateDocumentGroupDto {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: '文档组名称不能超过100个字符' })
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '描述不能超过500个字符' })
  description?: string;
}
