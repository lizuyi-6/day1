import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Query,
  Delete,
  Param,
  Put,
  Body,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KnowledgeService } from './knowledge.service';
import { DocumentGroupService } from './document-group.service';
import { HybridAuthGuard } from '../auth/hybrid-auth.guard';
import { User } from '../auth/jwt-auth.decorator';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, ALLOWED_EXTENSIONS } from './dto/upload.dto';
import { CreateDocumentGroupDto, UpdateDocumentGroupDto } from './dto/document-group.dto';
import * as path from 'path';

function decodeFileName(encodedName: string): string {
  try {
    const decoded = Buffer.from(encodedName, 'latin1').toString('utf8');
    if (decoded !== encodedName && /[\u4e00-\u9fff]/.test(decoded)) {
      return decoded;
    }
  } catch (error) {
    console.warn('[FileName] Failed to decode filename:', error);
  }
  return encodedName;
}

@Controller('knowledge')
@UseGuards(HybridAuthGuard)
export class KnowledgeController {
  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly documentGroupService: DocumentGroupService,
  ) {}

  // ==================== 文档组 API ====================

  @Post('groups')
  async createGroup(@Body() dto: CreateDocumentGroupDto, @User() user: any) {
    return this.documentGroupService.create(dto.name, dto.description);
  }

  @Get('groups')
  async getAllGroups(@User() user: any) {
    return this.documentGroupService.findAll();
  }

  @Get('groups/:id')
  async getGroup(@Param('id') id: string, @User() user: any) {
    return this.documentGroupService.findOne(id);
  }

  @Put('groups/:id')
  async updateGroup(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentGroupDto,
    @User() user: any,
  ) {
    return this.documentGroupService.update(id, dto.name, dto.description);
  }

  @Delete('groups/:id')
  async deleteGroup(@Param('id') id: string, @User() user: any) {
    return this.documentGroupService.remove(id);
  }

  @Get('groups/:id/documents')
  async getGroupDocuments(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @User() user: any,
  ) {
    return this.documentGroupService.getDocuments(id, page, limit);
  }

  // ==================== 文档 API ====================

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
    @Query('groupId') groupId: string,
    @User() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const decodedFileName = decodeFileName(file.originalname);

    const fileExtension = path.extname(decodedFileName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      throw new BadRequestException(
        `Invalid file extension: ${fileExtension}. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
      );
    }

    const fixedFile = {
      ...file,
      originalname: decodedFileName,
    };

    return this.knowledgeService.processDocument(fixedFile as Express.Multer.File, groupId);
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('groupId') groupId: string,
    @Query('topK') topK: number,
    @User() user: any,
  ) {
    return this.knowledgeService.search(query, topK || 3, groupId);
  }

  @Get('documents')
  async getDocuments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('groupId') groupId: string,
    @User() user: any,
  ) {
    return this.knowledgeService.getDocuments(page, limit, undefined, groupId);
  }

  @Delete('documents/:fileName')
  async deleteDocuments(
    @Param('fileName') fileName: string,
    @Query('groupId') groupId: string,
    @User() user: any,
  ) {
    return this.knowledgeService.deleteDocuments(fileName, groupId);
  }
}
