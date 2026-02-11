import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';

/**
 * DTO for streaming chat requests
 */
export class ChatStreamDto {
  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message is required' })
  @MinLength(1, { message: 'Message must be at least 1 character long' })
  @MaxLength(5000, { message: 'Message must not exceed 5000 characters' })
  message: string;

  @IsOptional()
  @IsString({ message: 'Session ID must be a string' })
  @IsUUID('4', { message: 'Session ID must be a valid UUID v4' })
  sessionId?: string;
}
