import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

/**
 * DTO for knowledge file upload validation
 * Note: File validation is handled at the controller level with FileInterceptor
 */
export class UploadKnowledgeDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}

/**
 * Allowed file types for knowledge upload
 */
export const ALLOWED_FILE_TYPES = [
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream', // Fallback for unknown file types
];

/**
 * Maximum file size: 10MB
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Allowed file extensions
 */
export const ALLOWED_EXTENSIONS = ['.txt', '.md', '.markdown', '.pdf', '.doc', '.docx'];
