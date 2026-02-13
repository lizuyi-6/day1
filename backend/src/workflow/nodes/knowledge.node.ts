import { BaseNode, ExecutionContext } from './node.interface';
import { Injectable, Logger } from '@nestjs/common';
import { RegisterNode } from './node.decorator';
import { KnowledgeService } from '../../knowledge/knowledge.service';

/**
 * KnowledgeNode - 知识库检索节点
 * 从向量数据库中检索相关文档内容，支持 RAG（检索增强生成）
 */
@Injectable()
@RegisterNode()
export class KnowledgeNode extends BaseNode {
  private readonly logger = new Logger(KnowledgeNode.name);

  type = 'knowledge';
  label = 'Knowledge';
  category = 'data';

  constructor(private readonly knowledgeService: KnowledgeService) {
    super();
  }

  async execute(
    inputs: Record<string, any>,
    context: ExecutionContext,
  ): Promise<Record<string, any>> {
    const nodeData = context.variables as any;

    // 获取查询参数（优先级: inputs > nodeData > 默认值）
    const query = inputs.query || inputs.input || nodeData.query || '';
    const topK = inputs.topK || nodeData.topK || 3;

    // 验证查询参数
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error(
        'Knowledge node requires a query parameter. Please connect a node that provides a "query" or "input" output, or configure a default query in the node inspector.',
      );
    }

    // 验证 topK 参数
    const safeTopK = Math.max(1, Math.min(100, parseInt(String(topK)) || 3));

    this.logger.log(
      `Searching knowledge base with query: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}" (topK: ${safeTopK})`,
    );

    try {
      // 调用知识库服务进行向量搜索
      // TODO: Get browserId from execution context when workflow system supports it
      const results = await this.knowledgeService.search(query, 'workflow-anonymous', safeTopK);

      this.logger.log(`Found ${results.length} relevant documents`);

      // 返回多个输出字段以便节点连接
      return {
        // 主要输出
        results: results, // 完整结果数组
        count: results.length, // 结果数量
        query: query, // 使用的查询文本

        // 便捷输出字段
        firstResult: results[0] || null, // 第一个结果对象
        allResults: results, // 完整数组别名
        topResults: results.slice(0, safeTopK), // 前 N 个结果

        // 单个字段别名（便于简单连接）
        content: results[0]?.content || '', // 第一个结果的内容
        fileName: results[0]?.fileName || '', // 第一个结果的文件名

        // 元数据
        _searchedAt: new Date().toISOString(),
        _topK: safeTopK,
        _nodeType: this.type,
      };
    } catch (error: any) {
      this.logger.error(`Knowledge search failed: ${error.message}`);
      throw new Error(`Knowledge node execution failed: ${error.message}`);
    }
  }
}
