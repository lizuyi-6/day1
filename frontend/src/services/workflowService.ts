import { ref, computed } from 'vue'
import type { Node, Edge } from '@vue-flow/core'

export interface DeploymentConfig {
  environment: 'production' | 'staging' | 'development'
  version: string
  apiEnabled: boolean
  webhooks: string[]
}

export interface DebugSession {
  id: string
  isActive: boolean
  currentNode: string | null
  logs: DebugLog[]
  variables: Record<string, unknown>
}

export interface DebugLog {
  timestamp: number
  level: 'info' | 'warn' | 'error' | 'success'
  nodeId: string
  message: string
  data?: unknown
}

export interface APISpec {
  endpoint: string
  method: 'POST' | 'GET'
  headers: Record<string, string>
  authentication: 'none' | 'api_key' | 'oauth'
  rateLimit: number
}

class WorkflowService {
  private nodes = ref<Node[]>([])
  private edges = ref<Edge[]>([])
  private debugSession = ref<DebugSession | null>(null)
  private deploymentStatus = ref<'idle' | 'deploying' | 'deployed' | 'error'>('idle')
  private deploymentError = ref<string | null>(null)

  // 加载工作流数据
  loadWorkflow(nodes: Node[], edges: Edge[]) {
    this.nodes.value = nodes
    this.edges.value = edges
  }

  // 部署工作流
  async deployWorkflow(config: DeploymentConfig): Promise<{ success: boolean; url?: string; error?: string }> {
    this.deploymentStatus.value = 'deploying'
    this.deploymentError.value = null

    try {
      // 模拟部署过程
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 验证工作流
      const validation = this.validateWorkflow()
      if (!validation.valid) {
        this.deploymentStatus.value = 'error'
        this.deploymentError.value = validation.error
        return { success: false, error: validation.error }
      }

      // 模拟成功部署
      this.deploymentStatus.value = 'deployed'

      const url = config.environment === 'production'
        ? 'https://api.example.com/prod/v1/workflow'
        : `https://api.example.com/${config.environment}/v1/workflow`

      return {
        success: true,
        url
      }
    } catch (error) {
      this.deploymentStatus.value = 'error'
      this.deploymentError.value = error instanceof Error ? error.message : '部署失败'
      return { success: false, error: this.deploymentError.value }
    }
  }

  // 验证工作流
  validateWorkflow(): { valid: boolean; error?: string } {
    if (this.nodes.value.length === 0) {
      return { valid: false, error: '工作流至少需要一个节点' }
    }

    // 检查是否有开始节点
    const hasStartNode = this.nodes.value.some(n => n.type === 'start')
    if (!hasStartNode) {
      return { valid: false, error: '缺少开始节点' }
    }

    // 检查是否有结束节点
    const hasEndNode = this.nodes.value.some(n => n.type === 'end')
    if (!hasEndNode) {
      return { valid: false, error: '缺少结束节点' }
    }

    // 检查是否有孤立的节点（没有连接）
    const connectedNodeIds = new Set<string>()
    this.edges.value.forEach(edge => {
      connectedNodeIds.add(edge.source)
      connectedNodeIds.add(edge.target)
    })

    const orphanNodes = this.nodes.value.filter(n => !connectedNodeIds.has(n.id))
    if (orphanNodes.length > 0 && this.nodes.value.length > 1) {
      return { valid: false, error: `发现 ${orphanNodes.length} 个未连接的节点` }
    }

    return { valid: true }
  }

  // 启动调试模式
  startDebugSession(): DebugSession {
    const session: DebugSession = {
      id: Date.now().toString(),
      isActive: true,
      currentNode: null,
      logs: [],
      variables: {}
    }

    this.debugSession.value = session
    this.addLog('info', 'system', '调试会话已启动')

    return session
  }

  // 停止调试模式
  stopDebugSession() {
    if (this.debugSession.value) {
      this.addLog('info', 'system', '调试会话已结束')
      this.debugSession.value.isActive = false
    }
  }

  // 添加调试日志
  addLog(level: DebugLog['level'], nodeId: string, message: string, data?: unknown) {
    if (this.debugSession.value) {
      this.debugSession.value.logs.push({
        timestamp: Date.now(),
        level,
        nodeId,
        message,
        data
      })
    }
  }

  // 执行节点（调试模式）
  async executeNode(nodeId: string): Promise<{ success: boolean; output?: unknown; error?: string }> {
    if (!this.debugSession.value) {
      return { success: false, error: '调试会话未启动' }
    }

    const node = this.nodes.value.find(n => n.id === nodeId)
    if (!node) {
      return { success: false, error: '节点不存在' }
    }

    this.debugSession.value.currentNode = nodeId
    this.addLog('info', nodeId, `开始执行节点: ${node.data.label}`)

    try {
      // 模拟节点执行
      await new Promise(resolve => setTimeout(resolve, 500))

      // 根据节点类型执行不同的逻辑
      let output: unknown

      switch (node.type) {
        case 'llm':
          output = { text: '这是 LLM 生成的示例响应', tokens: 150 }
          this.addLog('success', nodeId, 'LLM 生成完成', output)
          break

        case 'code':
          output = { result: '代码执行成功', exitCode: 0 }
          this.addLog('success', nodeId, '代码执行完成', output)
          break

        case 'http':
          output = { status: 200, data: { message: 'API 调用成功' } }
          this.addLog('success', nodeId, 'HTTP 请求完成', output)
          break

        case 'condition':
          output = { condition: true, route: 'true_branch' }
          this.addLog('info', nodeId, '条件判断完成', output)
          break

        default:
          output = { executed: true }
          this.addLog('info', nodeId, '节点执行完成', output)
      }

      return { success: true, output }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '节点执行失败'
      this.addLog('error', nodeId, errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  // 发布为 API
  async publishAsAPI(spec: APISpec): Promise<{ success: boolean; endpoint?: string; documentation?: string; error?: string }> {
    try {
      // 验证工作流
      const validation = this.validateWorkflow()
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // 模拟 API 发布
      await new Promise(resolve => setTimeout(resolve, 1500))

      const endpoint = `https://api.example.com/v1/workflows/${Date.now()}`

      const documentation = `
# 工作流 API 文档

## 端点
${spec.method} ${endpoint}

## 认证
${spec.authentication === 'api_key' ? '需要 API Key' : '无需认证'}

## 请求体示例
\`\`\`json
{
  "input": "示例输入",
  "params": {}
}
\`\`\`

## 响应示例
\`\`\`json
{
  "success": true,
  "output": "结果",
  "executionTime": 1234
}
\`\`\`

## 速率限制
每分钟 ${spec.rateLimit} 次请求
      `.trim()

      return {
        success: true,
        endpoint,
        documentation
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'API 发布失败'
      }
    }
  }

  // 获取调试状态
  get debugState() {
    return computed(() => this.debugSession.value)
  }

  // 获取部署状态
  get deploymentState() {
    return computed(() => ({
      status: this.deploymentStatus.value,
      error: this.deploymentError.value
    }))
  }

  // 清除调试日志
  clearDebugLogs() {
    if (this.debugSession.value) {
      this.debugSession.value.logs = []
    }
  }
}

// 导出单例
export const workflowService = new WorkflowService()
