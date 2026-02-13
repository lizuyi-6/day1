import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Knowledge } from './entities/knowledge.entity';

// @ts-ignore
const pdf = require('pdf-parse');

/**
 * 简化的 UTF-8 文件名解码
 * 只尝试 UTF-8 和 Latin-1 解码
 */
function decodeFileName(encodedName: string): string {
  try {
    // 尝试 Latin-1 解码（Windows 常见）
    const latin1Decoded = Buffer.from(encodedName, 'latin1').toString('utf8');
    if (latin1Decoded !== encodedName && /[\u4e00-\u9fff]/.test(latin1Decoded)) {
      console.log(`[FileName] Latin-1 decode succeeded: ${encodedName} -> ${latin1Decoded}`);
      return latin1Decoded;
    }
  } catch (e) {
    console.warn('[FileName] Latin-1 decode failed:', e);
  }

  // 如果 Latin-1 失败，返回原始文件名
  console.warn(`[FileName] Using original filename: ${encodedName}`);
  return encodedName;
}

@Injectable()
export class KnowledgeService {
  private embeddings: OpenAIEmbeddings;
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    @InjectRepository(Knowledge)
    private knowledgeRepository: Repository<Knowledge>,
  ) {
    // 使用 Qwen (通义千问) API 配置
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL;

    if (!apiKey) {
      console.warn('⚠️  OPENAI_API_KEY 未配置，向量化功能将使用随机向量');
    }

    const config: any = {
      apiKey: apiKey || 'fallback-key-placeholder',
    };

    // 如果提供了自定义 base URL，使用它（兼容 Qwen API）
    if (baseURL) {
      config.configuration = {
        baseURL: baseURL,
      };
    }

    this.embeddings = new OpenAIEmbeddings({
      ...config,
      model: 'text-embedding-v3', // 使用 Qwen 兼容的 embedding 模型
    });
  }

  async processDocument(file: Express.Multer.File, browserId: string, groupId?: string) {
    let text: string;

    const decodedFileName = decodeFileName(file.originalname);
    this.logger.log(`[FileName] Processing file: ${file.originalname} -> ${decodedFileName}`);

    if (file.mimetype === 'application/pdf') {
      try {
        const data = await pdf(file.buffer);
        text = data.text;
        this.logger.log(`Extracted ${text.length} characters from PDF: ${decodedFileName}`);
      } catch (error) {
        this.logger.error(`PDF parsing failed: ${error.message}`);
        throw new Error(`Failed to parse PDF file: ${error.message}`);
      }
    } else {
      text = file.buffer.toString('utf-8');
    }

    if (!text || text.trim().length < 10) {
      throw new Error('Document content is too short or empty');
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });
    const chunks = await splitter.createDocuments([text]);

    const entities = [];
    for (const chunk of chunks) {
      let vector: number[];
      try {
        vector = await this.embeddings.embedQuery(chunk.pageContent);
      } catch {
        console.warn(
          'Embedding failed (likely no API key), using random vector for demo',
        );
        vector = new Array(1536).fill(0).map(() => Math.random());
      }

      const knowledge = this.knowledgeRepository.create({
        fileName: decodedFileName,
        content: chunk.pageContent,
        embedding: vector,
        groupId: groupId || undefined,
        browserId, // 用户隔离：关联到 browserId
      });
      entities.push(knowledge);
    }

    this.logger.log(`[KnowledgeService] Saved ${chunks.length} chunks for file: ${decodedFileName}${groupId ? ` in group: ${groupId}` : ''}`);

    return await this.knowledgeRepository.save(entities);
  }

  async search(query: string, browserId: string, topK = 3, groupId?: string) {
    if (!query || typeof query !== 'string') {
      throw new Error('Query must be a non-empty string');
    }

    if (query.length > 500) {
      throw new Error(
        'Query length exceeds maximum allowed length of 500 characters',
      );
    }

    const sanitizedQuery = query
      .replace(/[%_\\]/g, '\\$&')
      .trim();

    if (!sanitizedQuery) {
      return [];
    }

    const safeTopK = Math.min(Math.max(1, topK), 100);

    try {
      const queryVector = await this.embeddings.embedQuery(sanitizedQuery);

      const qb = this.knowledgeRepository
        .createQueryBuilder('knowledge')
        .where('knowledge.browserId = :browserId', { browserId }) // 用户隔离：只搜索当前用户的文档
        .orderBy('knowledge.embedding <=> :vector', 'ASC')
        .setParameters({ vector: JSON.stringify(queryVector) })
        .limit(safeTopK);

      if (groupId) {
        qb.andWhere('knowledge.groupId = :groupId', { groupId });
      }

      const results = await qb.getMany();

      if (results.length === 0) {
        const fallbackQb = this.knowledgeRepository
          .createQueryBuilder('knowledge')
          .where('knowledge.browserId = :browserId', { browserId }) // 用户隔离：只搜索当前用户的文档
          .andWhere('knowledge.content LIKE :query', { query: `%${sanitizedQuery}%` })
          .orWhere('knowledge.browserId = :browserId', { browserId })
          .andWhere('knowledge.fileName LIKE :query2', {
            query2: `%${sanitizedQuery}%`,
          })
          .limit(safeTopK);

        if (groupId) {
          fallbackQb.andWhere('knowledge.groupId = :groupId', { groupId });
        }

        return await fallbackQb.getMany();
      }

      return results;
    } catch (error) {
      console.error('Vector search failed, falling back to keyword search:', error);

      const fallbackQb = this.knowledgeRepository
        .createQueryBuilder('knowledge')
        .where('knowledge.browserId = :browserId', { browserId }) // 用户隔离：只搜索当前用户的文档
        .andWhere('knowledge.content LIKE :query', { query: `%${sanitizedQuery}%` })
        .orWhere('knowledge.browserId = :browserId2', { browserId2: browserId })
        .andWhere('knowledge.fileName LIKE :query2', {
          query2: `%${sanitizedQuery}%`,
        })
        .limit(safeTopK);

      if (groupId) {
        fallbackQb.andWhere('knowledge.groupId = :groupId', { groupId });
      }

      return await fallbackQb.getMany();
    }
  }

  async getDocuments(browserId: string, page: number = 1, limit: number = 20, fileName?: string, groupId?: string) {
    const skip = (page - 1) * limit;

    const where: any = { browserId }; // 用户隔离：只查询当前用户的文档
    if (fileName) {
      where.fileName = Like(`%${fileName}%`);
    }
    if (groupId) {
      where.groupId = groupId;
    }

    const [documents, total] = await this.knowledgeRepository.findAndCount({
      where,
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
      groupId: chunks[0].groupId,
    }));

    return {
      items,
      total: Object.keys(grouped).length,
      page,
      limit,
      totalPages: Math.ceil(Object.keys(grouped).length / limit),
    };
  }

  async deleteDocuments(browserId: string, fileName: string, groupId?: string) {
    const where: any = { browserId, fileName }; // 用户隔离：只能删除自己的文档
    if (groupId) {
      where.groupId = groupId;
    }

    const chunks = await this.knowledgeRepository.find({ where });

    if (chunks.length === 0) {
      throw new NotFoundException(`Document "${fileName}" not found`);
    }

    const result = await this.knowledgeRepository.remove(chunks);

    this.logger.log(`Deleted ${result.length} chunks for file "${fileName}"`);

    return {
      fileName,
      deletedChunks: result.length,
    };
  }
}