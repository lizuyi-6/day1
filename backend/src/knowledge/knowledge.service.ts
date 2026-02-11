import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Knowledge } from './entities/knowledge.entity';

@Injectable()
export class KnowledgeService {
  private embeddings: OpenAIEmbeddings;

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

  async processDocument(file: Express.Multer.File) {
    const text = file.buffer.toString('utf-8'); // Simple TXT support for now

    // 1. Chunking
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });
    const chunks = await splitter.createDocuments([text]);

    // 2. Embedding & Save
    const entities = [];
    for (const chunk of chunks) {
      // Mock embedding if no key provided/valid to prevent runtime crash in demo without credits
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
        fileName: file.originalname,
        content: chunk.pageContent,
        embedding: vector,
      });
      entities.push(knowledge);
    }

    return await this.knowledgeRepository.save(entities);
  }

  async search(query: string, topK = 3) {
    // 输入验证：防止SQL注入和DoS攻击
    if (!query || typeof query !== 'string') {
      throw new Error('Query must be a non-empty string');
    }

    if (query.length > 500) {
      throw new Error(
        'Query length exceeds maximum allowed length of 500 characters',
      );
    }

    // 转义特殊字符以防止SQL注入
    const sanitizedQuery = query
      .replace(/[%_\\]/g, '\\$&') // 转义LIKE通配符和反斜杠
      .trim();

    if (!sanitizedQuery) {
      return [];
    }

    // 限制topK以防止性能问题
    const safeTopK = Math.min(Math.max(1, topK), 100);

    try {
      // 生成查询向量
      const queryVector = await this.embeddings.embedQuery(sanitizedQuery);
      
      // 使用 pgvector 进行余弦相似度搜索
      const results = await this.knowledgeRepository
        .createQueryBuilder('knowledge')
        .orderBy('knowledge.embedding <=> :vector', 'ASC')
        .setParameters({ vector: JSON.stringify(queryVector) })
        .limit(safeTopK)
        .getMany();

      // 如果向量检索没有结果（例如 embedding 为空），降级到关键词搜索
      if (results.length === 0) {
        return await this.knowledgeRepository
          .createQueryBuilder('knowledge')
          .where('knowledge.content LIKE :query', { query: `%${sanitizedQuery}%` })
          .orWhere('knowledge.fileName LIKE :query2', {
            query2: `%${sanitizedQuery}%`,
          })
          .limit(safeTopK)
          .getMany();
      }

      return results;
    } catch (error) {
      console.error('Vector search failed, falling back to keyword search:', error);
      
      // 降级方案：使用 LIKE 进行关键词搜索
      return await this.knowledgeRepository
        .createQueryBuilder('knowledge')
        .where('knowledge.content LIKE :query', { query: `%${sanitizedQuery}%` })
        .orWhere('knowledge.fileName LIKE :query2', {
          query2: `%${sanitizedQuery}%`,
        })
        .limit(safeTopK)
        .getMany();
    }
  }
}
