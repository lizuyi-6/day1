import { io, Socket } from 'socket.io-client'
import { ref, computed } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import { API_BASE_URL } from '../config/api';
import { get, post, put, del } from '../utils/api';
import { debounce } from 'lodash-es';
import type { TerminalLog } from '@/components/workflow/TerminalOutput.vue';
import {
  DEPLOYMENT_SIMULATION_DELAY,
  NODE_EXECUTION_DELAY,
  API_PUBLISH_DELAY,
  DEFAULT_API_TIMEOUT,
  MAX_RETRY_ATTEMPTS,
  SEARCH_DEBOUNCE_DELAY,
} from '../config/constants';

type NodeStatus = 'pending' | 'running' | 'success' | 'error'

export interface DeploymentConfig {
  environment: 'production' | 'staging' | 'development'
  version: string
  apiEnabled: boolean
  webhooks: string[]
}

export interface DebugSession {
  id: string
  workflowId?: string
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
  private abortControllers = new Map<string, AbortController>();
  private nodes = ref<Node[]>([]);
  private edges = ref<Edge[]>([]);
  private debugSession = ref<DebugSession | null>(null);
  private deploymentStatus = ref<'idle' | 'deploying' | 'deployed' | 'error'>('idle');
  private deploymentError = ref<string | null>(null);
  private terminalLogs = ref<TerminalLog[]>([]);
  private socket: Socket;
  private debouncedSave = debounce(async (id: string, nodes: Node[], edges: Edge[]) => {
    return this.saveWorkflow(id, nodes, edges);
  }, SEARCH_DEBOUNCE_DELAY);

  constructor() {
    this.socket = io(API_BASE_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.setupSocketListeners()
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id)
      this.addTerminalLog('system', '已连接到服务器', 'info')
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
      this.addTerminalLog('system', '与服务器断开连接', 'warning')
    })

    // 监听节点状态变更事件
    this.socket.on('node-status', (data: { workflowId: string; nodeId: string; status: NodeStatus; output?: any; error?: string }) => {
      // 只有当前调试的工作流匹配时才更新
      if (this.debugSession.value && this.debugSession.value.workflowId === data.workflowId) {
        this.updateNodeStatus(data.nodeId, data.status)
        
        if (data.status === 'running') {
           this.addTerminalLog('info', `节点 ${data.nodeId} 开始执行...`, data.nodeId)
           // 确保 debugLogs 中有记录，以便 DebugPanel 显示
           this.debugSession.value.logs.push({
             nodeId: data.nodeId,
             level: 'info',
             message: '开始执行',
             timestamp: Date.now()
           })
        } else if (data.status === 'success') {
           this.addTerminalLog('success', `节点 ${data.nodeId} 执行成功`, data.nodeId, undefined, data.output)
           this.debugSession.value.logs.push({
             nodeId: data.nodeId,
             level: 'success',
             message: '执行成功',
             timestamp: Date.now(),
             data: data.output
           })
        } else if (data.status === 'error') {
           this.addTerminalLog('error', `节点 ${data.nodeId} 执行失败: ${data.error}`, data.nodeId)
           this.debugSession.value.logs.push({
             nodeId: data.nodeId,
             level: 'error',
             message: data.error || '执行失败',
             timestamp: Date.now()
           })
        }
      }
    })
    
    // 监听工作流日志事件
    this.socket.on('workflow-log', (data: { workflowId: string; nodeId?: string; level: 'info' | 'warn' | 'error'; message: string; timestamp: number }) => {
        if (this.debugSession.value && this.debugSession.value.workflowId === data.workflowId) {
             this.addTerminalLog(data.level === 'warn' ? 'warning' : data.level, data.message, data.nodeId || 'system')
        }
    })
  }
  
  private updateNodeStatus(nodeId: string, status: NodeStatus) {
      // 如果需要可以在这里更新节点的可视化状态，例如改变颜色
      // 目前主要依赖日志更新
  }

  // 加载工作流数据
  loadWorkflow(nodes: Node[], edges: Edge[]) {
    this.nodes.value = nodes
    this.edges.value = edges
  }

  // 从后端获取工作流
  async fetchWorkflow(id: string): Promise<{ success: boolean; workflow?: { graphData: { nodes: Node[], edges: Edge[] } }; error?: string }> {
    const response = await get(`${API_BASE_URL}/workflow/${id}`,
    {
      timeout: DEFAULT_API_TIMEOUT,
    },
  );

    console.log('📥 fetchWorkflow response success:', response.success);
    console.log('📥 fetchWorkflow has data:', !!response.data);

    if (response.success && response.data) {
      // 后端返回: { success: true, data: { id, name, graphData, ... } }
      const backendResponse = response.data as any;
      const workflow = backendResponse.data;

      console.log('📦 Got workflow:', workflow ? workflow.name : 'no workflow data');
      console.log('📦 Has graphData:', !!workflow?.graphData);

      if (workflow?.graphData) {
        this.nodes.value = workflow.graphData.nodes || [];
        this.edges.value = workflow.graphData.edges || [];
        console.log('✅ Loaded graph:', this.nodes.value.length, 'nodes,', this.edges.value.length, 'edges');
      }
      return { success: true, workflow }
    }

    console.error('❌ Workflow fetch error:', response.error);
    return {
      success: false,
      error: response.error || '获取工作流失败'
    }
  }

  // 创建新工作流
  async createWorkflow(name: string, description?: string): Promise<{ success: boolean; workflow?: { id: string }; error?: string }> {
    const response = await post(`${API_BASE_URL}/workflow`, {
      name,
      description: description || '',
      graphData: { nodes: [], edges: [] }
    });

    if (response.success && response.data) {
      // Backend returns { success: true, data: { workflow }, ... }
      // Frontend apiRequest wraps it as { success: true, data: { success: true, data: { workflow }, ... } }
      // So we need response.data.data to get the actual workflow
      const backendResponse = response.data as { success: boolean; data: { id: string } };
      if (backendResponse.success && backendResponse.data) {
        return { success: true, workflow: backendResponse.data };
      }
    }

    console.error('Workflow creation error:', response.error)
    return {
      success: false,
      error: response.error || '创建工作流失败'
    }
  }

  // 部署工作流
  async deployWorkflow(workflowId: string, config: DeploymentConfig): Promise<{ success: boolean; url?: string; error?: string }> {
    this.deploymentStatus.value = 'deploying'
    this.deploymentError.value = null

    try {
      // 验证工作流 ID
      if (!workflowId) {
        throw new Error('工作流 ID 不能为空')
      }

      // 调用真实后端 API
      const response = await post(`${API_BASE_URL}/workflow/${workflowId}/deploy`, config, {
        timeout: DEFAULT_API_TIMEOUT
      })

      console.log('📥 部署响应:', response)

      if (response.success) {
        this.deploymentStatus.value = 'deployed'
        // 从后端响应中获取 URL
        const resultData = response.data as any
        const url = resultData?.data?.url || (resultData?.url)
        
        console.log('✅ 部署成功, URL:', url)
        return {
          success: true,
          url
        }
      } else {
        throw new Error(response.error || '部署请求失败')
      }
    } catch (error) {
      this.deploymentStatus.value = 'error'
      this.deploymentError.value = error instanceof Error ? error.message : '部署失败'
      console.error('❌ 部署失败:', this.deploymentError.value)
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

    // 检查是否有循环依赖
    const hasCycle = this.detectCycle()
    if (hasCycle) {
      return { valid: false, error: '工作流中存在循环依赖' }
    }

    // 检查节点配置是否完整
    for (const node of this.nodes.value) {
      const validation = this.validateNode(node)
      if (!validation.valid) {
        return { valid: false, error: `节点 "${node.type}" 配置错误: ${validation.error}` }
      }
    }

    // 检查数据类型兼容性
    const typeErrors = this.checkTypeCompatibility()
    if (typeErrors.length > 0) {
      return { valid: false, error: `数据类型不兼容: ${typeErrors.join(', ')}` }
    }

    return { valid: true }
  }

  private validateNode(node: WorkflowNode): { valid: boolean; error?: string } {
    switch (node.type) {
      case 'llm':
        if (!node.data?.model) return { valid: false, error: '缺少模型配置' }
        // Relaxed validation: Allow missing system prompt if user knows what they are doing
        // if (!node.data?.prompt) return { valid: false, error: '缺少提示词' }
        break
      case 'httpRequest':
        if (!node.data?.url) return { valid: false, error: '缺少请求 URL' }
        if (!node.data?.method) return { valid: false, error: '缺少请求方法' }
        break
      case 'code':
        if (!node.data?.code) return { valid: false, error: '缺少代码' }
        break
      case 'condition':
        if (!node.data?.condition) return { valid: false, error: '缺少条件表达式' }
        break
      case 'loop':
        if (!node.data?.loopCount && node.data?.loopCount !== 0) {
          return { valid: false, error: '缺少循环次数' }
        }
        break
    }
    return { valid: true }
  }

  private detectCycle(): boolean {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const getNeighbors = (nodeId: string): string[] => {
      return this.edges.value.filter(e => e.source === nodeId).map(e => e.target)
    }

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId)
      recursionStack.add(nodeId)

      const neighbors = getNeighbors(nodeId)
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true
        } else if (recursionStack.has(neighbor)) {
          return true
        }
      }

      recursionStack.delete(nodeId)
      return false
    }

    for (const node of this.nodes.value) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) return true
      }
    }

    return false
  }

  private checkTypeCompatibility(): string[] {
    const errors: string[] = []
    
    for (const edge of this.edges.value) {
      const sourceNode = this.nodes.value.find(n => n.id === edge.source)
      const targetNode = this.nodes.value.find(n => n.id === edge.target)
      
      if (!sourceNode || !targetNode) continue

      const sourceOutputType = this.getNodeOutputType(sourceNode.type)
      const targetInputType = this.getNodeInputType(targetNode.type)

      if (sourceOutputType && targetInputType && sourceOutputType !== 'any' && targetInputType !== 'any') {
        if (!this.isTypeCompatible(sourceOutputType, targetInputType)) {
          // Relax type checking for Start -> LLM connection as LLM can take object inputs via templating
          if ((sourceNode.type === 'start' || sourceNode.type === 'httpRequest') && (targetNode.type === 'llm' || targetNode.type === 'httpRequest')) {
            continue;
          }
          // Extra check: allow start/http -> llm/http
          if ((sourceNode.type === 'start' || sourceNode.type === 'httpRequest') && (targetNode.type === 'llm' || targetNode.type === 'httpRequest')) {
            continue;
          }
          errors.push(`从 ${sourceNode.type} 到 ${targetNode.type} 的连接类型不匹配`)
        }
      }
    }

    return errors
  }

  private getNodeOutputType(nodeType: string): string {
    const typeMap: Record<string, string> = {
      'start': 'object',
      'llm': 'string',
      'code': 'any',
      'httpRequest': 'object',
      'condition': 'boolean',
      'loop': 'array',
      'filter': 'array',
      'variable': 'any',
    }
    return typeMap[nodeType] || 'any'
  }

  private getNodeInputType(nodeType: string): string {
    const typeMap: Record<string, string> = {
      'llm': 'string',
      'code': 'any',
      'httpRequest': 'string',
      'condition': 'any',
      'loop': 'array',
      'filter': 'array',
      'variable': 'any',
      'end': 'any',
    }
    return typeMap[nodeType] || 'any'
  }

  private isTypeCompatible(source: string, target: string): boolean {
    if (source === 'any' || target === 'any') return true
    if (source === target) return true
    if (source === 'string' && target === 'object') return true
    return false
  }

  // 启动调试模式
  startDebugSession(workflowId?: string): DebugSession {
    const session: DebugSession = {
      id: Date.now().toString(),
      workflowId: workflowId,
      isActive: true,
      currentNode: null,
      logs: [],
      variables: {}
    }

    this.debugSession.value = session
    this.addTerminalLog('info', '调试会话已启动', 'system')

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
      // Simulate node execution
      await new Promise((resolve) => setTimeout(resolve, NODE_EXECUTION_DELAY));

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

      // Simulate API publishing
      await new Promise((resolve) => setTimeout(resolve, API_PUBLISH_DELAY));

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

  // 保存工作流到后端
  async saveWorkflow(id: string, nodes: Node[], edges: Edge[], comment?: string): Promise<{ success: boolean; error?: string }> {
    const graphData = {
      nodes,
      edges
    }

    console.log('💾 保存工作流:', id)
    console.log('📊 节点数:', nodes.length, '边数:', edges.length)
    console.log('📤 发送数据:', JSON.stringify(graphData))
    if (comment) {
      console.log('📝 版本备注:', comment)
    }

    const response = await put(`${API_BASE_URL}/workflow/${id}`, { graphData, comment }, {
      timeout: DEFAULT_API_TIMEOUT,
    });

    console.log('📥 保存响应:', JSON.stringify(response))

    if (response.success) {
      console.log('✅ 保存成功')
      return { success: true }
    }

    console.error('❌ Workflow save error:', response.error)
    return {
      success: false,
      error: response.error || '保存失败'
    }
  }

  // 执行完整工作流
  async executeWorkflow(id: string, inputs: Record<string, unknown> = {}): Promise<any> {
    this.clearTerminalLogs()
    // 启动调试会话，以便接收实时日志
    this.startDebugSession(id)

    this.addTerminalLog('info', '开始执行工作流', id, `Workflow-${id}`)

    try {
      const response = await post(`${API_BASE_URL}/workflow/${id}/run`, inputs, {
        timeout: DEFAULT_API_TIMEOUT,
        retries: MAX_RETRY_ATTEMPTS,
      });

      if (response.success) {
        this.addTerminalLog('success', '工作流执行完成', id, `Workflow-${id}`)
        // Backend returns: { success: true, data: { nodeOutputs }, message: "..." }
        // Our apiRequest wraps it as: { success: true, data: { success: true, data: nodeOutputs, message: "..." } }
        // So we need response.data.data to get the actual nodeOutputs
        const backendResponse = response.data as any;
        return backendResponse.data || backendResponse;
      }

      console.error('Workflow execution error:', response.error)
      this.addTerminalLog('error', response.error || '工作流执行失败', id, `Workflow-${id}`)
      throw new Error(response.error || '工作流执行失败')
    } catch (error: any) {
      this.addTerminalLog('error', error.message || '工作流执行失败', id, `Workflow-${id}`)
      throw error
    }
  }

  // 调试单个节点
  async debugNode(workflowId: string, nodeId: string, inputs: Record<string, unknown> = {}): Promise<any> {
    const node = this.nodes.value.find(n => n.id === nodeId)
    const nodeName = node?.data?.label || nodeId
    
    this.addTerminalLog('info', `开始调试节点: ${nodeName}`, nodeId, nodeName)
    
    try {
      const response = await post(`${API_BASE_URL}/workflow/${workflowId}/debug`, {
        nodeId,
        inputs
      }, {
        timeout: DEFAULT_API_TIMEOUT,
        retries: MAX_RETRY_ATTEMPTS,
      });

      if (response.success) {
        this.addTerminalLog('success', `节点调试完成: ${nodeName}`, nodeId, nodeName, response.data)
        return response.data
      }

      console.error('Node debug error:', response.error)
      this.addTerminalLog('error', response.error || '节点调试失败', nodeId, nodeName)
      throw new Error(response.error || '节点调试失败')
    } catch (error: any) {
      this.addTerminalLog('error', error.message || '节点调试失败', nodeId, nodeName)
      throw error
    }
  }

  // 取消保存请求
  cancelSave(id: string) {
    const controller = this.abortControllers.get(id);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(id);
    }
  }

  // 添加终端日志
  addTerminalLog(type: TerminalLog['type'], message: string, nodeId?: string, nodeName?: string, data?: any) {
    const log: TerminalLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      nodeId,
      nodeName,
      message,
      data
    }
    this.terminalLogs.value.push(log)
  }

  // 清空终端日志
  clearTerminalLogs() {
    this.terminalLogs.value = []
  }

  // 获取终端日志
  getTerminalLogs() {
    return this.terminalLogs.value
  }

  // 取消所有请求
  cancelAllRequests() {
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });
    this.abortControllers.clear();
  }

  // 使用防抖保存（性能优化）
  async saveWithDebounce(id: string, nodes: Node[], edges: Edge[]) {
    return this.debouncedSave(id, nodes, edges)
  }

  // 获取所有工作流列表
  async getAllWorkflows(page: number = 1, limit: number = 20, status?: 'draft' | 'published' | 'archived'): Promise<{ success: boolean; workflows?: any[]; total?: number; error?: string }> {
    let url = `${API_BASE_URL}/workflow?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }

    console.log('🔄 Fetching workflows from:', url);
    const response = await get(url, { timeout: DEFAULT_API_TIMEOUT });

    // 后端返回: { success: true, data: { items: [...], total: N, ... }, message: "..." }
    // apiRequest 包装后: response.data = { success: true, data: { items: [...], total: N, ... }, message: "..." }

    console.log('📥 Response success:', response.success);
    console.log('📥 Response has data:', !!response.data);

    if (response.success && response.data) {
      const backendResponse = response.data as any;
      console.log('📦 Backend response.data:', backendResponse.data);
      console.log('📦 Has items:', !!backendResponse.data?.items);

      // 访问后端的 data 字段
      if (backendResponse.data && backendResponse.data.items) {
        const workflows = backendResponse.data.items;
        const total = backendResponse.data.total || 0;
        console.log('✅ Found workflows:', workflows.length, 'Total:', total);
        return {
          success: true,
          workflows: workflows || [],
          total: total
        };
      }
    }

    console.error('❌ Workflows fetch error - Response structure:', {
      success: response.success,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : 'no data',
      error: response.error
    });

    return {
      success: false,
      error: response.error || '获取工作流列表失败'
    };
  }

  // 删除工作流
  async deleteWorkflow(id: string): Promise<{ success: boolean; error?: string }> {
    const response = await del(`${API_BASE_URL}/workflow/${id}`,
    {
      timeout: DEFAULT_API_TIMEOUT,
    },
  );

    if (response.success) {
      return { success: true }
    }

    console.error('Workflow deletion error:', response.error)
    return {
      success: false,
      error: response.error || '删除工作流失败'
    }
  }

  // 获取工作流版本列表
  async getVersions(workflowId: string): Promise<{ success: boolean; versions?: any[]; error?: string }> {
    const response = await get(`${API_BASE_URL}/workflow/${workflowId}/versions`,
    {
      timeout: DEFAULT_API_TIMEOUT,
    },
  );

    if (response.success) {
      return {
        success: true,
        versions: response.data || []
      }
    }

    console.error('Versions fetch error:', response.error)
    return {
      success: false,
      error: response.error || '获取版本历史失败'
    }
  }

  // 恢复工作流到指定版本
  async restoreVersion(workflowId: string, versionId: string): Promise<{ success: boolean; error?: string }> {
    const response = await post(`${API_BASE_URL}/workflow/${workflowId}/versions/${versionId}/restore`, {},
    {
      timeout: DEFAULT_API_TIMEOUT,
    },
  );

    if (response.success) {
      return { success: true }
    }

    console.error('Version restore error:', response.error)
    return {
      success: false,
      error: response.error || '恢复版本失败'
    }
  }
}

// 导出单例
export const workflowService = new WorkflowService()
