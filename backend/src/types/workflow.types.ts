/**
 * 工作流相关类型定义
 */

/**
 * 工作流节点
 */
export interface WorkflowNode {
  id: string;
  type: string;
  data: NodeData;
  position: Position;
}

/**
 * 节点数据
 */
export interface NodeData {
  [key: string]: unknown;
  prompt?: string;
  type?: string;
  expression?: string;
  delay?: number;
  variableName?: string;
  variableValue?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

/**
 * 位置信息
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 工作流边（连线）
 */
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

/**
 * 工作流图数据
 */
export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata?: Record<string, unknown>;
}

/**
 * LLM 配置
 */
export interface LLMConfig {
  modelName: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

/**
 * 工作流执行结果
 */
export interface WorkflowExecutionResult {
  success: boolean;
  result?: string;
  error?: string;
  executionLog?: string;
  metadata?: Record<string, unknown>;
}
