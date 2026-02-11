import type { Variable } from './variable'

export interface NodeData {
  inputs?: Variable[]
  outputs?: Variable[]
  [key: string]: any
}

export interface StartNodeData extends NodeData {
  triggerMessage?: string
  description?: string
}

export interface LlmNodeData extends NodeData {
  model?: string
  prompt?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  response?: string
  usage?: number
}

export interface CodeNodeData extends NodeData {
  code?: string
  runtime?: string
  timeout?: number
  result?: any
  error?: string
}

export interface ConditionNodeData extends NodeData {
  expression?: string
  trueResult?: any
  falseResult?: any
}

export interface VariableNodeData extends NodeData {
  variableName?: string
  value?: any
}

export interface KnowledgeNodeData extends NodeData {
  knowledgeBase?: string
  query?: string
  topK?: number
  results?: any[]
}

export interface HttpRequestNodeData extends NodeData {
  method?: string
  url?: string
  headers?: string
  body?: string
  response?: any
  status?: number
}

export interface LoopNodeData extends NodeData {
  loopType?: 'list' | 'count' | 'while'
  iterations?: number
  condition?: string
}

export interface FilterNodeData extends NodeData {
  condition?: string
}

export interface DelayNodeData extends NodeData {
  duration?: string
}

export interface NotificationNodeData extends NodeData {
  channel?: string
  message?: string
}

export interface EmailNodeData extends NodeData {
  to?: string
  subject?: string
  body?: string
}

export interface WebhookNodeData extends NodeData {
  method?: string
  url?: string
}
