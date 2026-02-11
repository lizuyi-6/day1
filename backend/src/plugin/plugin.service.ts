import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plugin, PluginCategory } from './entities/plugin.entity';
import { CreatePluginDto } from './dto/create-plugin.dto';
import { UpdatePluginDto } from './dto/update-plugin.dto';

@Injectable()
export class PluginService {
  constructor(
    @InjectRepository(Plugin)
    private readonly pluginRepository: Repository<Plugin>,
  ) {}

  async create(
    createPluginDto: CreatePluginDto,
    userId?: string,
  ): Promise<Plugin> {
    const plugin = this.pluginRepository.create({
      ...createPluginDto,
      userId,
      category: createPluginDto.category || PluginCategory.PRODUCTIVITY,
      enabled: false,
    });

    return await this.pluginRepository.save(plugin);
  }

  async findAll(userId?: string): Promise<Plugin[]> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    return await this.pluginRepository.find({
      where,
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Plugin> {
    const plugin = await this.pluginRepository.findOne({ where: { id } });
    if (!plugin) {
      throw new NotFoundException(`Plugin with ID '${id}' not found`);
    }
    return plugin;
  }

  async update(id: string, updatePluginDto: UpdatePluginDto): Promise<Plugin> {
    const plugin = await this.pluginRepository.findOne({ where: { id } });
    if (!plugin) {
      throw new NotFoundException(`Plugin with ID '${id}' not found`);
    }

    Object.assign(plugin, updatePluginDto);
    return await this.pluginRepository.save(plugin);
  }

  async remove(id: string): Promise<void> {
    const plugin = await this.pluginRepository.findOne({ where: { id } });
    if (!plugin) {
      throw new NotFoundException(`Plugin with ID '${id}' not found`);
    }
    await this.pluginRepository.remove(plugin);
  }

  async getAvailablePlugins(): Promise<any[]> {
    return [
      {
        id: '1',
        name: '网页抓取',
        description: '从任何网站抓取内容，自动提取文本和结构化数据',
        category: 'integration',
        packageName: '@aether-flow/web-scraper',
        version: '1.0.0',
      },
      {
        id: '2',
        name: '数据库连接',
        description: '连接 MySQL、PostgreSQL、MongoDB 等数据库',
        category: 'data',
        packageName: '@aether-flow/database',
        version: '1.0.0',
      },
      {
        id: '3',
        name: '定时任务',
        description: '设置 Cron 表达式，定时触发工作流',
        category: 'utility',
        packageName: '@aether-flow/scheduler',
        version: '1.0.0',
      },
      {
        id: '4',
        name: '内容安全',
        description: '自动检测和过滤敏感内容',
        category: 'security',
        packageName: '@aether-flow/content-safety',
        version: '1.0.0',
      },
      {
        id: '5',
        name: '智能摘要',
        description: '自动生成长文本摘要和关键点提取',
        category: 'productivity',
        packageName: '@aether-flow/summary',
        version: '1.0.0',
      },
      {
        id: '6',
        name: '快速执行',
        description: '缓存常用查询结果，提升响应速度',
        category: 'utility',
        packageName: '@aether-flow/cache',
        version: '1.0.0',
      },
    ];
  }
}
