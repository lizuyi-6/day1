import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Query,
  Delete,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KnowledgeService } from './knowledge.service';
import { HybridAuthGuard } from '../auth/hybrid-auth.guard';
import { User } from '../auth/jwt-auth.decorator';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, ALLOWED_EXTENSIONS } from './dto/upload.dto';
import * as path from 'path';

/**
 * 安全地解码 UTF-8 文件名
 * Multer 在 Windows/Linux 跨平台环境下可能导致文件名编码错误
 */
function decodeFileName(encodedName: string): string {
  try {
    // 尝试使用 Buffer 解码（处理 Latin-1 编码的文件名）
    const decoded = Buffer.from(encodedName, 'latin1').toString('utf8');
    // 验证解码后是否包含有效的中文字符
    if (decoded !== encodedName && /[\u4e00-\u9fff]/.test(decoded)) {
      return decoded;
    }
  } catch (error) {
    console.warn('[FileName] Failed to decode filename:', error);
  }
  // 如果解码失败或没有中文字符，返回原始文件名
  return encodedName;
}

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
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @User() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // 解码文件名（修复中文文件名乱码问题）
    const decodedFileName = decodeFileName(file.originalname);

    // Validate file extension instead of MIME type (more reliable)
    const fileExtension = path.extname(decodedFileName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      throw new BadRequestException(
        `Invalid file extension: ${fileExtension}. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
      );
    }

    // 创建修复后的文件对象
    const fixedFile = {
      ...file,
      originalname: decodedFileName,
    };

    return this.knowledgeService.processDocument(fixedFile as Express.Multer.File);
  }

  @Get('search')
  async search(@Query('q') query: string, @User() user: any) {
    return this.knowledgeService.search(query);
  }

  @Get('documents')
  async getDocuments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @User() user: any,
  ) {
    return this.knowledgeService.getDocuments(page, limit);
  }

  @Delete('documents/:fileName')
  async deleteDocuments(@Param('fileName') fileName: string, @User() user: any) {
    return this.knowledgeService.deleteDocuments(fileName);
  }
}
