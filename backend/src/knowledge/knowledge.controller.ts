import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KnowledgeService } from './knowledge.service';
import { HybridAuthGuard } from '../auth/hybrid-auth.guard';
import { User } from '../auth/jwt-auth.decorator';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from './dto/upload.dto';

@Controller('knowledge')
@UseGuards(HybridAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @User() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.knowledgeService.processDocument(file);
  }

  @Get('search')
  async search(@Query('q') query: string, @User() user: any) {
    return this.knowledgeService.search(query);
  }
}
