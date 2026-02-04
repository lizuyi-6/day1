/**
 * Agent 相关类型定义
 */

import { WorkflowGraph } from './workflow.types';

/**
 * 聊天响应
 */
export interface ChatResponse {
  response: string;
  sources: string[];
  sessionId: string;
}

/**
 * 流式聊天消息
 */
export interface StreamMessage {
  type: 'data' | 'error' | 'done';
  content?: string;
  error?: string;
}

/**
 * RAG 上下文
 */
export interface RagContext {
  session: {
    id: string;
    sessionId: string;
  };
  historyContext: string;
  context: string;
  docs: Array<{
    id: string;
    fileName: string;
    content: string;
  }>;
}

/**
 * 工作流执行输入
 */
export interface WorkflowInput {
  inputMessage: string;
  sessionId?: string;
  variables?: Record<string, unknown>;
}

/**
 * 节点执行上下文
 */
export interface NodeExecutionContext {
  inputMessage: string;
  sessionId: string;
  graph: WorkflowGraph;
  visitedNodes: Set<string>;
  executionLog: string;
  variables: Record<string, unknown>;
}
