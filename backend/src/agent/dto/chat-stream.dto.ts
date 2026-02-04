import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
} from 'class-validator';

/**
 * 聊天流式请求 DTO
 */
export class ChatStreamDto {
  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message is required' })
  @MaxLength(5000, { message: 'Message must not exceed 5000 characters' })
  message: string;

  @IsOptional()
  @IsString({ message: 'Session ID must be a string' })
  @IsUUID('4', { message: 'Session ID must be a valid UUID v4' })
  sessionId?: string;
}
