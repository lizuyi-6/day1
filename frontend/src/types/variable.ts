export type VariableType = 'string' | 'number' | 'boolean' | 'object' | 'array'
export type VariableMode = 'custom' | 'upstream'

export interface Variable {
  name: string
  type: VariableType
  description?: string
  defaultValue?: any
  required?: boolean
  mode?: VariableMode // custom: 自定义变量, upstream: 上游变量
  sourceVariableName?: string // 上游变量名称（用于映射，仅在 upstream 模式下使用）
  sourceNodeId?: string // 上游节点 ID
}

export interface VariableContext {
  [key: string]: any
}

export interface VariableReference {
  variableName: string
  path?: string
}
