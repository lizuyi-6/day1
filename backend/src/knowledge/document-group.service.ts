import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentGroup } from './entities/document-group.entity';
import { Knowledge } from './entities/knowledge.entity';

@Injectable()
export class DocumentGroupService {
  private readonly logger = new Logger(DocumentGroupService.name);

  constructor(
    @InjectRepository(DocumentGroup)
    private groupRepository: Repository<DocumentGroup>,
    @InjectRepository(Knowledge)
    private knowledgeRepository: Repository<Knowledge>,
  ) {}

  async create(name: string, description?: string): Promise<DocumentGroup> {
    const group = this.groupRepository.create({ name, description });
    return this.groupRepository.save(group);
  }

  async findAll(): Promise<(DocumentGroup & { documentCount: number; chunkCount: number })[]> {
    const groups = await this.groupRepository.find({
      order: { createdAt: 'DESC' },
    });

    const groupsWithStats = await Promise.all(
      groups.map(async (group) => {
        const documents = await this.knowledgeRepository.find({
          where: { groupId: group.id },
        });

        const uniqueFiles = new Set(documents.map((d) => d.fileName));

        return {
          ...group,
          documentCount: uniqueFiles.size,
          chunkCount: documents.length,
        };
      }),
    );

    return groupsWithStats;
  }

  async findOne(id: string): Promise<DocumentGroup & { documentCount: number; chunkCount: number }> {
    const group = await this.groupRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException(`Document group with ID "${id}" not found`);
    }

    const documents = await this.knowledgeRepository.find({
      where: { groupId: id },
    });

    const uniqueFiles = new Set(documents.map((d) => d.fileName));

    return {
      ...group,
      documentCount: uniqueFiles.size,
      chunkCount: documents.length,
    };
  }

  async update(id: string, name?: string, description?: string): Promise<DocumentGroup> {
    const group = await this.groupRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException(`Document group with ID "${id}" not found`);
    }

    if (name !== undefined) {
      group.name = name;
    }
    if (description !== undefined) {
      group.description = description;
    }

    return this.groupRepository.save(group);
  }

  async remove(id: string): Promise<{ id: string; deletedChunks: number }> {
    const group = await this.groupRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException(`Document group with ID "${id}" not found`);
    }

    const documents = await this.knowledgeRepository.find({
      where: { groupId: id },
    });

    if (documents.length > 0) {
      await this.knowledgeRepository.remove(documents);
    }

    await this.groupRepository.remove(group);

    this.logger.log(`Deleted group "${group.name}" with ${documents.length} chunks`);

    return {
      id,
      deletedChunks: documents.length,
    };
  }

  async getDocuments(
    groupId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    items: { fileName: string; chunkCount: number; firstChunkId: string; uploadedAt: Date }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [documents, total] = await this.knowledgeRepository.findAndCount({
      where: { groupId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const grouped = documents.reduce((acc, doc) => {
      if (!acc[doc.fileName]) {
        acc[doc.fileName] = [];
      }
      acc[doc.fileName].push(doc);
      return acc;
    }, {} as Record<string, Knowledge[]>);

    const items = Object.entries(grouped).map(([fileName, chunks]) => ({
      fileName,
      chunkCount: chunks.length,
      firstChunkId: chunks[0].id,
      uploadedAt: chunks[0].createdAt,
    }));

    return {
      items,
      total: Object.keys(grouped).length,
      page,
      limit,
      totalPages: Math.ceil(Object.keys(grouped).length / limit),
    };
  }
}
