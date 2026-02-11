import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsUUID,
} from 'class-validator';

/**
 * DTO for agent chat requests
 */
export class ChatDto {
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
