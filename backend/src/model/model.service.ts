import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelConfig, ModelProvider } from './entities/model.entity';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import axios from 'axios';

@Injectable()
export class ModelService {
  constructor(
    @InjectRepository(ModelConfig)
    private readonly modelRepository: Repository<ModelConfig>,
  ) {}

  async create(
    createModelDto: CreateModelDto,
    userId?: string,
  ): Promise<ModelConfig> {
    const model = this.modelRepository.create({
      ...createModelDto,
      userId,
      provider: createModelDto.provider || ModelProvider.OPENAI,
    });

    const saved = await this.modelRepository.save(model);
    await this.testConnection(saved.id);
    return saved;
  }

  async findAll(userId?: string): Promise<ModelConfig[]> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const models = await this.modelRepository.find({
      where,
      order: { updatedAt: 'DESC' },
    });

    return models.map((m) => ({ ...m, apiKey: this.maskApiKey(m.apiKey) }));
  }

  async findOne(id: string): Promise<ModelConfig> {
    const model = await this.modelRepository.findOne({ where: { id } });
    if (!model) {
      throw new NotFoundException(`Model with ID '${id}' not found`);
    }
    return { ...model, apiKey: this.maskApiKey(model.apiKey) };
  }

  async update(
    id: string,
    updateModelDto: UpdateModelDto,
  ): Promise<ModelConfig> {
    const model = await this.modelRepository.findOne({ where: { id } });
    if (!model) {
      throw new NotFoundException(`Model with ID '${id}' not found`);
    }

    Object.assign(model, updateModelDto);
    const saved = await this.modelRepository.save(model);
    await this.testConnection(saved.id);
    return { ...saved, apiKey: this.maskApiKey(saved.apiKey) };
  }

  async remove(id: string): Promise<void> {
    const model = await this.modelRepository.findOne({ where: { id } });
    if (!model) {
      throw new NotFoundException(`Model with ID '${id}' not found`);
    }
    await this.modelRepository.remove(model);
  }

  async testConnection(id: string): Promise<{
    success: boolean;
    message: string;
    status: 'connected' | 'error';
  }> {
    const model = await this.modelRepository.findOne({ where: { id } });
    if (!model) {
      throw new NotFoundException(`Model with ID '${id}' not found`);
    }

    try {
      const baseUrl = this.getBaseUrl(model.provider, model.baseUrl);
      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model: model.model,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${model.apiKey}`,
          },
          timeout: 10000,
        },
      );

      return {
        success: true,
        message: '连接成功',
        status: 'connected',
      };
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error?.message || error.message || '连接失败';
      return {
        success: false,
        message: errorMsg,
        status: 'error',
      };
    }
  }

  async getModelForUse(id: string): Promise<ModelConfig> {
    const model = await this.modelRepository.findOne({ where: { id } });
    if (!model) {
      throw new NotFoundException(`Model with ID '${id}' not found`);
    }
    return model;
  }

  private getBaseUrl(provider: ModelProvider, customBaseUrl?: string): string {
    switch (provider) {
      case ModelProvider.OPENAI:
        return 'https://api.openai.com/v1';
      case ModelProvider.ANTHROPIC:
        return 'https://api.anthropic.com/v1';
      case ModelProvider.AZURE:
        return 'https://api.openai.azure.com';
      case ModelProvider.CUSTOM:
        return customBaseUrl || 'https://api.openai.com/v1';
      default:
        return 'https://api.openai.com/v1';
    }
  }

  private maskApiKey(apiKey?: string): string {
    if (!apiKey) return '';
    if (apiKey.length <= 8) return '***';
    return apiKey.slice(0, 8) + '***';
  }
}
