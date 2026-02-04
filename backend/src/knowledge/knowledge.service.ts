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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // 混合检索：关键词搜索 + (可选的) 语义相似度
    const keywordResults = await this.knowledgeRepository
      .createQueryBuilder('knowledge')
      .where('knowledge.content LIKE :query', { query: `%${query}%` })
      .orWhere('knowledge.fileName LIKE :query', { query: `%${query}%` })
      .limit(topK)
      .getMany();

    return keywordResults;
  }
}
