import { Injectable, Logger } from '@nestjs/common';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { WorkflowService } from '../workflow/workflow.service';
import { SessionService } from '../session/session.service';
import { Parser } from 'expr-eval'; // 安全的表达式解析器
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Observable } from 'rxjs';
import { NodeRegistry } from '../workflow/nodes/node-registry';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private llm: ChatOpenAI;

  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly workflowService: WorkflowService,
    private readonly sessionService: SessionService,
    private readonly nodeRegistry: NodeRegistry,
  ) {
    // 初始化 Qwen LLM
    // Demo Override: Force all LLM nodes to use Qwen
    const apiKey = 'sk-9dd62d22ea0b439eb96f6800d6c7749a';
    const baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    const modelName = 'qwen-flash';
    
    // const apiKey = process.env.OPENAI_API_KEY;
    // const baseURL = process.env.OPENAI_BASE_URL;
    // const modelName = process.env.LLM_MODEL || 'qwen-flash';

    if (apiKey) {
      const config: any = {
        modelName: modelName,
        temperature: 0.7,
      };

      if (baseURL) {
        config.configuration = {
          baseURL: baseURL,
        };
      }

      this.llm = new ChatOpenAI(config);
      this.logger.log(
        `✅ LLM initialized: ${modelName} @ ${baseURL || 'OpenAI'}`,
      );
    } else {
      this.logger.warn(
        '⚠️  OPENAI_API_KEY not configured, using mock responses',
      );
    }
  }

  async executeWorkflow(workflowId: string, inputMessage: string) {
    this.logger.log(
      `Executing workflow ${workflowId} with input: ${inputMessage}`,
    );

    // 1. Fetch Workflow
    const workflow = await this.workflowService.findOne(workflowId);
    if (!workflow || !workflow.graphData) {
      throw new Error('Workflow not found or empty');
    }

    // 2. Parse Graph
    const graph: any = workflow.graphData;
    let nodes: any[] = [];
    let edges: any[] = [];

    // Support Vue Flow structure (nodes/edges) OR X6 structure (cells)
    if (graph.nodes && graph.edges) {
      nodes = graph.nodes;
      edges = graph.edges;
    } else if (graph.cells) {
      nodes = graph.cells.filter((c: any) => c.shape !== 'edge');
      edges = graph.cells.filter((c: any) => c.shape === 'edge');
    }

    let currentNode = nodes.find((n: any) => n.data?.type === 'start');
    if (!currentNode) {
      return { response: 'ERROR: No START node found.' };
    }

    let executionResult = '';
    let nodeOutputs: Record<string, Record<string, any>> = {};
    let lastNodeOutput: Record<string, any> = { input: inputMessage };

    // Max steps to prevent infinite loops
    let steps = 0;
    while (currentNode && steps < 50) {
      const nodeType = currentNode.data?.type || 'unknown';
      const nodeId = currentNode.id;

      this.logger.log(`Executing node: ${nodeType} (${nodeId})`);

      // Execute the node using NodeRegistry
      if (nodeType === 'start' || nodeType === 'end') {
        // Start and End nodes just pass through the input
        executionResult += `[${nodeType.toUpperCase()}]\n`;
        nodeOutputs[nodeId] = lastNodeOutput;
      } else {
        // Get node from registry
        const node = this.nodeRegistry.getNode(nodeType);

        if (!node) {
          executionResult += `[ERROR] Unknown node type: ${nodeType}\n`;
          this.logger.warn(`Unknown node type: ${nodeType}, skipping...`);
        } else {
          try {
            // Merge node data with last node output as inputs
            const inputs = {
              ...currentNode.data,
              ...lastNodeOutput,
            };

            const context: any = {
              workflowId,
              nodeId,
              variables: currentNode.data || {},
              nodeOutputs,
            };

            this.logger.log(`Executing ${nodeType} node with inputs:`, Object.keys(inputs));

            const output = await node.execute(inputs, context);
            nodeOutputs[nodeId] = output;
            lastNodeOutput = output;

            const outputSummary = JSON.stringify(output)
              .substring(0, 100)
              .replace(/\n/g, ' ');

            executionResult += `> ${nodeType.toUpperCase()}: ${outputSummary}...\n`;
            this.logger.log(`${nodeType} node output:`, output);
          } catch (error: any) {
            executionResult += `[ERROR] ${nodeType} failed: ${error.message}\n`;
            this.logger.error(`Node execution failed:`, error.message);
            return {
              response: executionResult,
              status: 'error',
              error: error.message,
            };
          }
        }
      }

      // Find next node
      const outgoingEdges = edges.filter((e: any) => {
        const sourceId = e.source?.cell || e.source;
        return sourceId === currentNode.id;
      });

      if (outgoingEdges.length === 0) {
        executionResult += `\n[Workflow Complete]\n`;
        break;
      }

      // For simplicity, take the first outgoing edge
      const edge = outgoingEdges[0];
      const targetId = edge.target?.cell || edge.target;
      currentNode = nodes.find((n: any) => n.id === targetId);

      if (!currentNode) {
        executionResult += `\n[Workflow End] Next node not found.\n`;
        break;
      }

      steps++;
    }

    // Try to extract the final meaningful output
    let finalOutput = executionResult;
    if (lastNodeOutput.result || lastNodeOutput.response || lastNodeOutput.text || lastNodeOutput.content) {
      finalOutput = lastNodeOutput.result || lastNodeOutput.response || lastNodeOutput.text || lastNodeOutput.content || executionResult;
    }

    return {
      response: finalOutput,
      status: 'completed',
      nodeOutputs,
    };
  }

  async chat(message: string, sessionId?: string, browserId?: string) {
    // 获取或创建 Session
    const session = sessionId
      ? await this.sessionService.getOrCreateSession(sessionId)
      : await this.sessionService.createSession();

    // 保存用户消息
    await this.sessionService.addMessage(session.sessionId, 'user', message);

    if (message.startsWith('/run ') || message.startsWith('Run ')) {
      const workflowName = message.replace(/^\/run |^Run /i, '').trim();
      const allWorkflows = await this.workflowService.findAll();
      const workflow = allWorkflows.items.find((w) =>
        w.name.includes(workflowName),
      );

      if (workflow) {
        const result = await this.executeWorkflow(workflow.id, message);
        // 保存助手响应
        await this.sessionService.addMessage(
          session.sessionId,
          'assistant',
          result.response,
        );
        return { ...result, sessionId: session.sessionId };
      } else {
        const errorMsg = `Workflow with name containing "${workflowName}" not found.`;
        await this.sessionService.addMessage(
          session.sessionId,
          'assistant',
          errorMsg,
        );
        return { response: errorMsg, sessionId: session.sessionId };
      }
    }

    // 获取对话历史（最近 5 轮）
    const history = await this.sessionService.getConversationHistory(
      session.sessionId,
      10,
    );
    const historyContext = history
      .filter((m) => m.role !== 'system')
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    // RAG: 检索知识库
    const docs = await this.knowledgeService.search(message, browserId || 'anonymous', 3);
    const context = docs.map((d) => d.content).join('\n\n---\n\n');

    if (this.llm) {
      try {
        const systemPrompt = `你是一个智能助手，基于以下知识库内容回答用户问题。

知识库内容：
${context || '（暂无知识库内容）'}

对话历史：
${historyContext || '（暂无历史记录）'}

请根据知识库内容和对话历史给出准确、简洁的回答。如果知识库中没有相关信息，请明确告知用户。

要求：
1. 基于知识库内容回答
2. 参考对话历史进行多轮对话
3. 回答要简洁、准确
4. 可以适当引用知识库中的具体内容`;

        const response = await this.llm.invoke([
          new SystemMessage(systemPrompt),
          new HumanMessage(message),
        ]);

        const responseText = response.content as string;

        // 保存助手响应
        await this.sessionService.addMessage(
          session.sessionId,
          'assistant',
          responseText,
        );

        return {
          response: responseText,
          sources: docs.map((d) => d.fileName),
          sessionId: session.sessionId,
        };
      } catch (error) {
        this.logger.error(`LLM 调用失败: ${error.message}`);
        const errorMsg = `⚠️ LLM 服务暂时不可用\n\n基于知识库检索到 ${docs.length} 个相关片段：\n${context || '无相关内容'}`;
        await this.sessionService.addMessage(
          session.sessionId,
          'assistant',
          errorMsg,
        );
        return {
          response: errorMsg,
          sources: docs.map((d) => d.fileName),
          sessionId: session.sessionId,
        };
      }
    }

    // Fallback
    const fallbackMsg = `[RAG 检索结果]\n\n找到 ${docs.length} 个相关知识库片段：\n\n${context || '暂无相关内容'}\n\n💡 提示：配置 OPENAI_API_KEY 环境变量以启用真实的 LLM 回答生成`;
    await this.sessionService.addMessage(
      session.sessionId,
      'assistant',
      fallbackMsg,
    );
    return {
      response: fallbackMsg,
      sources: docs.map((d) => d.fileName),
      sessionId: session.sessionId,
    };
  }

  // 流式传输方法（返回 Observable）
  chatStream(message: string, sessionId?: string, browserId?: string): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      (async () => {
        try {
          // 获取或创建 Session
          const session = sessionId
            ? await this.sessionService.getOrCreateSession(sessionId)
            : await this.sessionService.createSession();

          // 保存用户消息
          await this.sessionService.addMessage(
            session.sessionId,
            'user',
            message,
          );

          // RAG 检索
          const docs = await this.knowledgeService.search(message, browserId || 'anonymous', 3);
          const context = docs.map((d) => d.content).join('\n\n---\n\n');

          // 获取历史
          const history = await this.sessionService.getConversationHistory(
            session.sessionId,
            10,
          );
          const historyContext = history
            .filter((m) => m.role !== 'system')
            .map((m) => `${m.role}: ${m.content}`)
            .join('\n');

          const systemPrompt = `你是一个智能助手，基于以下知识库内容回答用户问题。

知识库内容：
${context || '（暂无知识库内容）'}

对话历史：
${historyContext || '（暂无历史记录）'}

请根据知识库内容和对话历史给出准确、简洁的回答。`;

          if (this.llm) {
            // 使用流式 API
            const stream = await this.llm.stream([
              new SystemMessage(systemPrompt),
              new HumanMessage(message),
            ]);

            let fullResponse = '';

            for await (const chunk of stream) {
              const content = chunk.content as string;
              fullResponse += content;

              // 发送流式事件
              subscriber.next({
                data: JSON.stringify({
                  type: 'token',
                  content: content,
                  done: false,
                }),
              } as MessageEvent);
            }

            // 保存完整响应
            await this.sessionService.addMessage(
              session.sessionId,
              'assistant',
              fullResponse,
            );

            // 发送完成事件
            subscriber.next({
              data: JSON.stringify({
                type: 'done',
                content: '',
                response: fullResponse,
                sources: docs.map((d) => d.fileName),
                sessionId: session.sessionId,
                done: true,
              }),
            } as MessageEvent);

            subscriber.complete();
          } else {
            // Fallback without streaming
            const fallbackMsg = 'LLM 未配置，无法使用流式传输';
            subscriber.error(new Error(fallbackMsg));
          }
        } catch (error) {
          this.logger.error(`Stream error: ${error.message}`);
          subscriber.error(error);
        }
      })();
    });
  }
}
