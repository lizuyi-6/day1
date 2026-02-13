<script setup lang="ts">
import { ref, shallowRef, onMounted, watch, onUnmounted, defineAsyncComponent, computed, nextTick } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge } from '@vue-flow/core'
import { io, Socket } from 'socket.io-client'

import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'
import {
  MousePointer2, Hand, MessageCircle, MessageSquare, Sparkles, FileCode, GitBranch,
  Database, Globe, Layers, Search, Clock, RotateCcw, Sliders, CheckCircle, XCircle,
  LayoutGrid, Workflow, User, Save, Bug, Rocket, Code, Play, Copy, Trash2, Timer,
  Bell, Variable, Repeat, Mail, Webhook, Filter, Loader2, History, List, FileText, Terminal, Camera, Download, X
} from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import Logo from '@/components/layout/Logo.vue'

const vueFlow = useVueFlow()
const { onConnect, addEdges, addNodes, project: vueFlowProject, onNodeClick, onPaneReady, fitView, removeNodes, removeEdges, getSelectedNodes, getSelectedEdges } = vueFlow

import WorkflowSidebar from '@/components/workflow/WorkflowSidebar.vue'
import WorkflowInspector from '@/components/workflow/WorkflowInspector.vue'
import DebugPanel from '@/components/workflow/DebugPanel.vue'
import ExecutionPanel from '@/components/workflow/ExecutionPanel.vue'
import VersionHistoryDialog from '@/components/workflow/VersionHistoryDialog.vue'
import ErrorToast, { type ToastMessage } from '@/components/common/ErrorToast.vue'
import { executionHistoryService, type ExecutionHistory as BackendExecutionHistory } from '@/services/executionHistoryService'
import * as workflowService from '@/services/workflowService'
import type { ExecutionLogEntry } from '@/components/workflow/ExecutionPanel.vue'

// Imports cleared - force Vite recompilation

// Toast messages
const toastMessages = ref<ToastMessage[]>([])

const showToast = (level: ToastMessage['level'], title: string, message?: string, duration = 5000) => {
  const id = Date.now().toString()
  toastMessages.value.push({ id, level, title, message, duration })
  setTimeout(() => {
    toastMessages.value = toastMessages.value.filter(m => m.id !== id)
  }, duration)
}

const showError = (title: string, message?: string) => showToast('error', title, message)
const showWarning = (title: string, message?: string) => showToast('warning', title, message)
const showSuccess = (title: string, message?: string) => showToast('success', title, message)
const showInfo = (title: string, message?: string) => showToast('info', title, message)

const dismissToast = (id: string) => {
  toastMessages.value = toastMessages.value.filter(m => m.id !== id)
}

// Thumbnail generation
const generateThumbnail = async () => {
  if (!vueFlowRef.value) {
    showError('生成失败', '无法访问工作流画布')
    return
  }

  isGeneratingThumbnail.value = true
  showInfo('正在生成缩略图', '请稍候...')

  try {
    const html2canvas = (await import('html2canvas')).default
    const vueFlowElement = vueFlowRef.value.$el?.querySelector('.vue-flow')

    if (!vueFlowElement) {
      throw new Error('工作流画布元素未找到')
    }

    // Generate thumbnail with optimized settings
    const canvas = await html2canvas(vueFlowElement, {
      backgroundColor: '#f8fafc',
      scale: 0.5, // Lower scale for smaller file size
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: vueFlowElement.offsetWidth,
      height: vueFlowElement.offsetHeight,
    })

    thumbnailData.value = canvas.toDataURL('image/png', 0.8)
    showThumbnailPreview.value = true
    showSuccess('缩略图生成成功', '点击可保存图片')
  } catch (error: any) {
    console.error('Failed to generate thumbnail:', error)
    showError('生成失败', error.message || '无法生成缩略图')
  } finally {
    isGeneratingThumbnail.value = false
  }
}

const downloadThumbnail = () => {
  if (!thumbnailData.value) return

  const link = document.createElement('a')
  link.download = `workflow-${route.params.id || 'new'}-${Date.now()}.png`
  link.href = thumbnailData.value
  link.click()
  showSuccess('下载成功', '缩略图已保存')
}

const closeThumbnailPreview = () => {
  showThumbnailPreview.value = false
}

// Auto layout functionality
const isAutoLayouting = ref(false)

const autoLayout = async () => {
  if (nodes.value.length === 0) {
    showWarning('自动布局', '当前没有节点可以布局')
    return
  }

  isAutoLayouting.value = true
  showInfo('正在自动布局', '正在优化节点位置...')

  try {
    const dagre = (await import('dagre')).default
    const g = new dagre.graphlib.Graph()
    g.setDefaultEdgeLabel(() => ({}))
    g.setGraph({
      rankdir: 'LR', // Left to Right
      nodesep: 100,  // Horizontal spacing
      ranksep: 150,  // Vertical spacing
      edgesep: 50,   // Edge spacing
    })

    // Add nodes to graph
    nodes.value.forEach((node) => {
      g.setNode(node.id, { width: 200, height: 80 })
    })

    // Add edges to graph
    edges.value.forEach((edge) => {
      g.setEdge(edge.source, edge.target)
    })

    // Run layout
    dagre.layout(g, {rankdir: 'LR'})

    // Apply new positions
    const newNodes = nodes.value.map((node) => {
      const gNode = g.node(node.id)
      if (gNode) {
        return {
          ...node,
          position: {
            x: gNode.x - 100, // Center the node (width/2)
            y: gNode.y - 40,  // Center the node (height/2)
          },
        }
      }
      return node
    })

    nodes.value = newNodes

    // Fit view to show all nodes
    await nextTick()
    await fitView({ padding: 0.2, duration: 500 })

    showSuccess('布局完成', `已优化 ${nodes.value.length} 个节点和 ${edges.value.length} 条连线`)
  } catch (error: any) {
    console.error('Auto layout failed:', error)
    showError('布局失败', error.message || '无法自动布局节点')
  } finally {
    isAutoLayouting.value = false
  }
}

// 动态导入节点组件（性能优化：按需加载）
const LlmNode = defineAsyncComponent(() => import('@/components/workflow/nodes/LlmNode.vue'))
const StartNode = defineAsyncComponent(() => import('@/components/workflow/nodes/StartNode.vue'))
const CodeNode = defineAsyncComponent(() => import('@/components/workflow/nodes/CodeNode.vue'))
const ConditionNode = defineAsyncComponent(() => import('@/components/workflow/nodes/ConditionNode.vue'))
const EndNode = defineAsyncComponent(() => import('@/components/workflow/nodes/EndNode.vue'))
const KnowledgeNode = defineAsyncComponent(() => import('@/components/workflow/nodes/KnowledgeNode.vue'))
const HttpRequestNode = defineAsyncComponent(() => import('@/components/workflow/nodes/HttpRequestNode.vue'))
const LoopNode = defineAsyncComponent(() => import('@/components/workflow/nodes/LoopNode.vue'))
const FilterNode = defineAsyncComponent(() => import('@/components/workflow/nodes/FilterNode.vue'))
const VariableNode = defineAsyncComponent(() => import('@/components/workflow/nodes/VariableNode.vue'))
const WebhookNode = defineAsyncComponent(() => import('@/components/workflow/nodes/WebhookNode.vue'))
const DelayNode = defineAsyncComponent(() => import('@/components/workflow/nodes/DelayNode.vue'))
const NotificationNode = defineAsyncComponent(() => import('@/components/workflow/nodes/NotificationNode.vue'))
const EmailNode = defineAsyncComponent(() => import('@/components/workflow/nodes/EmailNode.vue'))
const CustomAnimatedEdge = defineAsyncComponent(() => import('@/components/workflow/edges/CustomAnimatedEdge.vue'))

const route = useRoute()

const nodes = shallowRef<Node[]>([])
const edges = shallowRef<Edge[]>([])
const searchQuery = ref('')
const selectedNode = ref<Node | null>(null)
const saveStatus = ref('saved') // saved, saving, unsaved
const lastSaved = ref<string | null>(null)
const debugMode = ref(false)
const showDeployModal = ref(false)
const showAPIModal = ref(false)
const deployResult = ref<{ success: boolean; url?: string; error?: string } | null>(null)
const sidebarCollapsed = ref(false) // 侧边栏收起状态

// Execution state for animation
const isExecuting = ref(false)
const currentExecutingNode = ref<string | null>(null)
const executedNodes = ref<Set<string>>(new Set()) // 已执行的节点集合
const executionProgress = ref(0)

// Execution logs
const executionLogs = ref<ExecutionLogEntry[]>([])

// WebSocket connection
const socket = ref<Socket | null>(null)

// Execution result
const executionResult = ref<any>(null)
const executionTime = ref(0)

// Check if this is a new workflow that should show example
const isNewWorkflow = computed(() => route.query.new === 'true')

// Execution history
interface ExecutionHistory {
  id: string
  timestamp: number
  workflowId: string
  duration: number
  status: 'success' | 'error'
  nodeCount: number
  logs: ExecutionLogEntry[]
  result?: any
  error?: string
}
const executionHistory = ref<ExecutionHistory[]>([])
const showVersionHistory = ref(false)

// Current workflow ID
const workflowId = computed(() => (route.params.id as string) || '')

// Thumbnail management
const showThumbnailPreview = ref(false)
const thumbnailData = ref<string | null>(null)
const isGeneratingThumbnail = ref(false)
const vueFlowRef = ref<InstanceType<typeof VueFlow> | null>(null)

const isDraggingOver = ref(false)

// 历史记录（撤销/重做）
const history = shallowRef<{ nodes: Node[], edges: Edge[] }[]>([])
const historyIndex = ref(-1)
const maxHistorySize = 50
const isUndoRedoing = ref(false)
const isInitializing = ref(false)

// 剪贴板
const clipboard = shallowRef<Node[]>([])

// 右键菜单
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  node: null as Node | null,
  edge: null as Edge | null
})

// 拖放处理函数
const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
    isDraggingOver.value = true
  }
}

const onDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDraggingOver.value = false
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  isDraggingOver.value = false

  const type = event.dataTransfer?.getData('application/vueflow') || event.dataTransfer?.getData('text/plain')
  if (!type) {
    console.warn('Dropped element has no valid type data')
    return
  }

  // 获取 VueFlow 画布的位置信息，将屏幕坐标转换为画布坐标
  const position = vueFlowProject({
    x: event.clientX,
    y: event.clientY
  })

  // 计算节点偏移（节点中心点对齐鼠标位置）
  // 假设节点大小约为 180x60，我们让鼠标指向节点中心
  const nodeOffset = {
    x: 90,  // 节点宽度的一半
    y: 30   // 节点高度的一半
  }

  const adjustedPosition = {
    x: position.x - nodeOffset.x,
    y: position.y - nodeOffset.y
  }

  console.log('Drop detected:', type, 'at screen:', { x: event.clientX, y: event.clientY })
  console.log('Canvas position:', position)
  console.log('Adjusted position (with offset):', adjustedPosition)
  console.log('📌 Before addNodes - 当前节点数:', nodes.value.length, '历史索引:', historyIndex.value)

  // 创建新节点
  const newNode: Node = {
    id: `${type}-${Date.now()}`,
    type: type,
    position: adjustedPosition,
    data: {
      label: type === 'start' ? '开始' : type === 'end' ? '结束' : type === 'llm' ? 'LLM' : `${type} node`,
      ...(type === 'start' ? {
        inputs: [
          { name: 'prompt', type: 'string', description: '用户输入的提示词', defaultValue: '', required: true }
        ],
        outputs: [
          { name: 'prompt', type: 'string', description: '传递给下游节点的提示词' }
        ]
      } : {}),
      ...(type === 'llm' ? {
        provider: 'qwen',
        apiKey: 'sk-9dd62d22ea0b439eb96f6800d6c7749a',
        model: 'qwen-flash',
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        temperature: 0.7,
        maxTokens: 4096,
        systemPrompt: '',
        prompt: ''
      } : {})
    }
  }

  addNodes([newNode])
  console.log('📌 After addNodes - 当前节点数:', nodes.value.length)

  // 保存到历史记录（在添加节点之后）
  saveWorkflowEditHistory()
  console.log('📌 After saveHistory - 历史索引:', historyIndex.value, '总记录数:', history.value.length)
  console.log('Node added successfully:', newNode)
}

const onDragStart = (event: DragEvent, nodeType: string) => {
  console.log('Drag started:', nodeType)
}

// 导航链接
const navLinks = [
  { name: '仪表盘', path: '/dashboard', icon: LayoutGrid },
  { name: '工作流', path: '/workflows', icon: Workflow },
  { name: '对话', path: '/chat', icon: MessageSquare },
  { name: '知识库', path: '/knowledge', icon: Database }
]

// 节点分类（扩展后）
const nodeCategories = [
  {
    name: '基础',
    items: [
      { type: 'start', label: '开始', icon: FileCode, color: 'text-cycle-1', bg: 'bg-cycle-1/10', border: 'border-cycle-1/20' },
      { type: 'end', label: '结束', icon: FileCode, color: 'text-cycle-2', bg: 'bg-cycle-2/10', border: 'border-cycle-2/20' }
    ]
  },
  {
    name: 'AI',
    items: [
      { type: 'llm', label: 'LLM', icon: Sparkles, color: 'text-cycle-3', bg: 'bg-cycle-3/10', border: 'border-cycle-3/20', meta: 'GPT-4' }
    ]
  },
  {
    name: '逻辑',
    items: [
      { type: 'condition', label: '条件', icon: GitBranch, color: 'text-cycle-4', bg: 'bg-cycle-4/10', border: 'border-cycle-4/20' },
      { type: 'code', label: '代码', icon: Code, color: 'text-cycle-5', bg: 'bg-cycle-5/10', border: 'border-cycle-5/20' },
      { type: 'loop', label: '循环', icon: Repeat, color: 'text-cycle-1', bg: 'bg-cycle-1/10', border: 'border-cycle-1/20' },
      { type: 'filter', label: '过滤', icon: Filter, color: 'text-cycle-2', bg: 'bg-cycle-2/10', border: 'border-cycle-2/20' }
    ]
  },
  {
    name: '数据',
    items: [
      { type: 'knowledge', label: '知识库', icon: Database, color: 'text-cycle-3', bg: 'bg-cycle-3/10', border: 'border-cycle-3/20' },
      { type: 'http', label: 'HTTP请求', icon: Globe, color: 'text-cycle-4', bg: 'bg-cycle-4/10', border: 'border-cycle-4/20' },
      { type: 'variable', label: '变量', icon: Variable, color: 'text-cycle-5', bg: 'bg-cycle-5/10', border: 'border-cycle-5/20' },
      { type: 'webhook', label: 'Webhook', icon: Webhook, color: 'text-cycle-1', bg: 'bg-cycle-1/10', border: 'border-cycle-1/20' }
    ]
  },
  {
    name: '工具',
    items: [
      { type: 'delay', label: '延时', icon: Timer, color: 'text-cycle-2', bg: 'bg-cycle-2/10', border: 'border-cycle-2/20' },
      { type: 'notification', label: '通知', icon: Bell, color: 'text-cycle-3', bg: 'bg-cycle-3/10', border: 'border-cycle-3/20' },
      { type: 'email', label: '邮件', icon: Mail, color: 'text-cycle-4', bg: 'bg-cycle-4/10', border: 'border-cycle-4/20' }
    ]
  }
]

// 其他函数
const toggleDebug = () => {
  debugMode.value = !debugMode.value

  if (debugMode.value) {
    // 启动调试会话
    workflowService.startDebugSession()
    console.log('🐛 调试会话已启动')
  } else {
    // 停止调试会话
    workflowService.stopDebugSession()
    console.log('🐛 调试会话已停止')
  }
}

const saveWorkflow = async () => {
  saveStatus.value = 'saving'
  let workflowId = (route.params.id as string) || ''

  // 如果没有ID或是临时ID，先创建新工作流
  if (!workflowId || workflowId === 'temp-workflow' || workflowId === 'temp-id') {
    console.log('📝 创建新工作流...')
    const createResult = await workflowService.createWorkflow('未命名工作流', '通过编辑器创建')

    if (createResult.success && createResult.workflow) {
      workflowId = createResult.workflow.id
      console.log('  新工作流创建成功，ID:', workflowId)

      // 更新URL（不刷新页面）
      window.history.replaceState({}, '', `/workflow/${workflowId}`)

      // 使用新的workflowId继续保存
      const result = await workflowService.saveWorkflow(workflowId, {
        graphData: { nodes: nodes.value, edges: edges.value }
      })

      if (result.success) {
        saveStatus.value = 'saved'
        lastSaved.value = new Date().toLocaleTimeString()
        console.log('工作流保存成功！')
        // 使用更友好的提示
        const notification = document.createElement('div')
        notification.textContent = '工作流保存成功！'
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999; animation: slideIn 0.3s ease;'
        document.body.appendChild(notification)
        setTimeout(() => notification.remove(), 3000)
      } else {
        saveStatus.value = 'unsaved'
        console.error('  保存失败:', result.error)
        showError('保存失败', result.error)
      }
    } else {
      saveStatus.value = 'unsaved'
      console.error('  创建工作流失败:', createResult.error)
      showError('创建工作流失败', createResult.error)
      return
    }
  } else {
    // 已有ID，直接保存
    try {
      const result = await workflowService.saveWorkflow(workflowId, {
        graphData: { nodes: nodes.value, edges: edges.value }
      })

      if (result.success) {
        saveStatus.value = 'saved'
        lastSaved.value = new Date().toLocaleTimeString()
        console.log('工作流保存成功！')
        showSuccess('工作流保存成功')
      } else {
        saveStatus.value = 'unsaved'
        console.error('  保存失败:', result.error)
        showError('保存失败', result.error)
      }
    } catch (error) {
      saveStatus.value = 'unsaved'
      console.error('  保存出错:', error)
      alert('保存失败，请检查后端服务是否启动')
    }
  }
}

const deployWorkflow = async () => {
  showDeployModal.value = true
  deployResult.value = null

  let workflowId = (route.params.id as string);

  // 如果没有工作流ID，提示用户先保存
  if (!workflowId || workflowId === 'temp-workflow' || workflowId === 'temp-id') {
    showError('无法部署', '请先保存工作流后再进行部署')
    showDeployModal.value = false
    return
  }

  try {
    console.log('🚀 开始部署工作流:', workflowId)

    const result = await workflowService.deployWorkflow(workflowId, {
      environment: 'production',
      version: '1.0.0',
      apiEnabled: true,
      webhooks: []
    })

    deployResult.value = result
    console.log(result.success ? '  部署成功!' : '  部署失败:', result)
  } catch (error) {
    console.error('  部署出错:', error)
    deployResult.value = {
      success: false,
      error: error instanceof Error ? error.message : '部署失败'
    }
  }
}

const runWorkflow = async (inputData?: Record<string, any>, mode: 'normal' | 'debug' = 'normal') => {
  let workflowId = (route.params.id as string);

  // 执行前自动保存工作流，确保后端有最新数据
  try {
    // 如果是临时ID，先创建新工作流
    if (!workflowId || workflowId === 'temp-workflow' || workflowId === 'temp-id') {
      console.log('📝 临时工作流，创建新工作流...')
      const createResult = await workflowService.createWorkflow('未命名工作流', '通过执行创建')

      if (createResult.success && createResult.workflow) {
        workflowId = createResult.workflow.id
        console.log('  新工作流创建成功，ID:', workflowId)

        // 更新URL（不刷新页面）
        window.history.replaceState({}, '', `/workflow/${workflowId}`)
      } else {
        showError('创建工作流失败', createResult.error)
        return
      }
    }

    // 保存工作流数据
    const saveResult = await workflowService.saveWorkflow(workflowId, {
      graphData: { nodes: nodes.value, edges: edges.value }
    })
    if (saveResult.success) {
      saveStatus.value = 'saved'
      lastSaved.value = new Date().toLocaleTimeString()
      console.log('  执行前工作流保存成功')
    }
  } catch (error) {
    console.error('  执行前保存失败:', error)
    showError('保存失败', '执行前保存工作流失败，请检查后端服务')
    return
  }

  // 初始化执行日志
  executionLogs.value = []
  const executionId = `exec-${Date.now()}`
  const startTime = Date.now()

  // 设置执行状态
  isExecuting.value = true
  executionProgress.value = 0
  currentExecutingNode.value = null
  executedNodes.value.clear()

  // 计算节点执行顺序
  const executionOrder = calculateExecutionOrder()
  console.log('📋 节点执行顺序:', executionOrder)

  if (executionOrder.length === 0) {
      const errorMsg = '未找到可执行的节点。请确保工作流中包含节点，并且连接关系正确。'
      console.warn(errorMsg)
      showWarning('无法运行', errorMsg)
      isExecuting.value = false
      return
  }

  // 为每个节点创建初始日志
  const nodeLogMap = new Map<string, ExecutionLogEntry>()
  executionOrder.forEach((nodeId, index) => {
    const node = nodes.value.find(n => n.id === nodeId)
    const log: ExecutionLogEntry = {
      id: `${executionId}-${nodeId}`,
      timestamp: Date.now(),
      nodeId,
      nodeName: node?.data?.label || nodeId,
      status: 'pending',
      message: '等待执行...',
      input: node?.data?.inputs || undefined
    }
    nodeLogMap.set(nodeId, log)
    executionLogs.value.push(log)
  })

  let result: any = null
  let totalExecutionTime = 0

  try {
    console.log('🚀 开始执行工作流...')
    console.log('📥 输入数据:', inputData)

    // ✅ FIX: 通过WebSocket加入workflow房间以接收实时更新 - 必须在执行前加入
    // 通过WebSocket加入workflow房间以接收实时更新
    if (socket.value) {
      socket.value.emit('join-workflow', workflowId)
      console.log('📡 加入workflow房间:', workflowId)
    }

    addExecutionLog({
      id: `${executionId}-system`,
      timestamp: Date.now(),
      nodeId: 'system',
      nodeName: '系统',
      status: 'running',
      message: '开始执行工作流'
    })

    // 执行工作流（不再使用setInterval模拟，WebSocket会实时推送节点状态）
    result = await workflowService.executeWorkflow(workflowId, inputData || { input: 'Test Input from UI' })

    // 执行完成后离开workflow房间
    if (socket.value) {
      socket.value.emit('leave-workflow', workflowId)
      console.log('📡 离开workflow房间:', workflowId)
    }

    // 不再需要清除高亮动画，因为WebSocket会实时更新节点状态
    currentExecutingNode.value = null

    // 标记所有节点为成功
    executionOrder.forEach((nodeId, index) => {
      const log = nodeLogMap.get(nodeId)
      if (log) {
        log.status = 'success'
        log.message = '执行成功'

        const nodeOutput = result?.[nodeId]

        if (nodeOutput !== undefined && nodeOutput !== null) {
          if (typeof nodeOutput === 'object' && !Array.isArray(nodeOutput)) {
            const keys = Object.keys(nodeOutput).filter(k => !k.startsWith('_'))

            if (keys.length === 1) {
              log.output = nodeOutput[keys[0]]
            } else if (keys.length > 1) {
              log.output = keys.reduce((acc, key) => {
                acc[key] = nodeOutput[key]
                return acc
              }, {} as Record<string, any>)
            } else {
              log.output = nodeOutput
            }
          } else {
            log.output = nodeOutput
          }
        } else {
          log.output = nodeOutput
        }
      }
      executedNodes.value.add(nodeId)
    })

    totalExecutionTime = Date.now() - startTime
    console.log(`  工作流执行成功，耗时: ${totalExecutionTime}ms`)

    // 添加系统日志
    addExecutionLog({
      id: `${executionId}-complete`,
      timestamp: Date.now(),
      nodeId: 'system',
      nodeName: '系统',
      status: 'success',
      message: `工作流执行成功 (耗时 ${totalExecutionTime}ms)`
    })

    // 保存到执行历史
    saveToHistory({
      id: executionId,
      timestamp: startTime,
      workflowId,
      duration: totalExecutionTime,
      status: 'success',
      nodeCount: executionOrder.length,
      logs: [...executionLogs.value],
      result
    })

    // 显示成功结果
    showSuccess('执行成功', `执行时间: ${totalExecutionTime}ms`)
  } catch (e) {
    console.error('  工作流执行失败:', e)

    const errorMsg = e instanceof Error ? e.message : '未知错误'

    // 添加系统错误日志（只有在执行失败时才有这个日志）
    addExecutionLog({
      id: `${executionId}-error`,
      timestamp: Date.now(),
      nodeId: 'system',
      nodeName: '系统',
      status: 'error',
      message: '工作流执行失败',
      error: errorMsg
    })

    // 保存到执行历史
    totalExecutionTime = Date.now() - startTime
    saveToHistory({
      id: executionId,
      timestamp: startTime,
      workflowId,
      duration: totalExecutionTime,
      status: 'error',
      nodeCount: executionOrder.length,
      logs: [...executionLogs.value],
      error: errorMsg
    })

    showError('执行失败', `${errorMsg}\n\n请检查：\n1. 后端服务是否启动 (http://localhost:3000)\n2. 工作流配置是否正确\n3. 浏览器控制台查看详细错误`)
  } finally {
    isExecuting.value = false
    executionProgress.value = 0
    executionResult.value = result
    executionTime.value = totalExecutionTime
  }
}

// 获取 Start 节点的输入变量
const getStartNodeInputs = () => {
  const startNode = nodes.value.find(n => n.type === 'start')
  if (startNode?.data?.outputs) {
    return startNode.data.outputs
  }
  return []
}

// 添加执行日志
const addExecutionLog = (log: ExecutionLogEntry) => {
  executionLogs.value.push(log)
}

// 清空执行日志
const clearExecutionLogs = () => {
  executionLogs.value = []
}

/**
 * 获取节点的执行状态类名
 */
const getNodeExecutionClass = (nodeId: string): string => {
  // 检查执行日志中是否有该节点的错误记录
  const errorLog = executionLogs.value.find(log =>
    log.nodeId === nodeId && log.status === 'error'
  )

  if (errorLog) {
    return 'error' // 错误状态
  } else if (currentExecutingNode.value === nodeId) {
    return 'executing' // 正在执行
  } else if (executedNodes.value.has(nodeId)) {
    return 'executed' // 已执行
  }
  return '' // 未执行
}

// 保存到执行历史
const saveToHistory = async (record: ExecutionHistory) => {
  try {
    const backendRecord = {
      workflowId: record.workflowId,
      status: record.status,
      duration: record.duration,
      nodeCount: record.nodeCount,
      logs: record.logs,
      result: record.result ? JSON.stringify(record.result) : undefined,
      error: record.error,
    }
    
    await executionHistoryService.create(backendRecord)
    
    executionHistory.value.unshift(record)
    // 限制历史记录数量
    if (executionHistory.value.length > 50) {
      executionHistory.value = executionHistory.value.slice(0, 50)
    }
  } catch (error) {
    console.error('Failed to save execution history to backend:', error)
    // Fallback to localStorage
    executionHistory.value.unshift(record)
    if (executionHistory.value.length > 50) {
      executionHistory.value = executionHistory.value.slice(0, 50)
    }
  }
}

// ============ 执行动画相关 ============

/**
 * 计算节点的拓扑排序顺序（用于执行动画）
 */
const calculateExecutionOrder = (): string[] => {
  const nodeMap = new Map(nodes.value.map(n => [n.id, n]))
  const inDegree = new Map<string, number>()
  const adjacencyList = new Map<string, string[]>()

  // 初始化
  nodes.value.forEach(node => {
    inDegree.set(node.id, 0)
    adjacencyList.set(node.id, [])
  })

  // 构建图
  edges.value.forEach(edge => {
    const targets = adjacencyList.get(edge.source) || []
    targets.push(edge.target)
    adjacencyList.set(edge.source, targets)

    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
  })

  // 拓扑排序
  const queue: string[] = []
  const result: string[] = []

  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId)
    }
  })

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    result.push(nodeId)

    const successors = adjacencyList.get(nodeId) || []
    for (const successor of successors) {
      const newDegree = (inDegree.get(successor) || 0) - 1
      inDegree.set(successor, newDegree)

      if (newDegree === 0) {
        queue.push(successor)
      }
    }
  }

  return result
}

// 节点点击处理（通过 onNodeClick 监听器统一处理，见底部）

const executeNode = async (nodeId: string) => {
  const workflowId = (route.params.id as string) || 'temp'
  try {
    const result = await workflowService.debugNode(workflowId, nodeId, {})
    
    console.log('Node execution result:', result)
    
    return result
  } catch (error: any) {
    console.error('Failed to execute node:', error)
    throw error
  }
}

// ============ 历史记录管理 ============
const saveWorkflowEditHistory = () => {
  if (isInitializing.value || isUndoRedoing.value) {
    return
  }

  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }

  const snapshot = {
    nodes: JSON.parse(JSON.stringify(nodes.value)),
    edges: JSON.parse(JSON.stringify(edges.value))
  }

  history.value.push(snapshot)

  if (history.value.length > maxHistorySize) {
    history.value.shift()
  } else {
    historyIndex.value++
  }

  console.log('📝 历史记录保存:', {
    index: historyIndex.value,
    total: history.value.length,
    nodesCount: snapshot.nodes.length,
    edgesCount: snapshot.edges.length
  })
}

const undo = () => {
  console.log('↩️ 撤销开始:', {
    currentIndex: historyIndex.value,
    historyLength: history.value.length,
    currentNodes: nodes.value.length,
    currentEdges: edges.value.length
  })

  if (historyIndex.value > 0) {
    isUndoRedoing.value = true
    historyIndex.value--
    const state = history.value[historyIndex.value]

    console.log('📦 恢复状态:', {
      newIndex: historyIndex.value,
      stateNodes: state.nodes.length,
      stateEdges: state.edges.length
    })

    nodes.value = JSON.parse(JSON.stringify(state.nodes))
    edges.value = JSON.parse(JSON.stringify(state.edges))
    nextTick(() => {
      isUndoRedoing.value = false
    })
  }
}

const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    isUndoRedoing.value = true
    historyIndex.value++
    const state = history.value[historyIndex.value]
    nodes.value = JSON.parse(JSON.stringify(state.nodes))
    edges.value = JSON.parse(JSON.stringify(state.edges))
    nextTick(() => {
      isUndoRedoing.value = false
    })
  }
}

// ============ 节点操作 ============
const deleteSelectedNodes = () => {
  const selected = nodes.value.filter(n => n.selected)
  if (selected.length > 0) {
    saveWorkflowEditHistory()
    removeNodes(selected.map(n => n.id))
  }
}

const deleteSelectedEdges = () => {
  const selected = edges.value.filter(e => e.selected)
  if (selected.length > 0) {
    saveWorkflowEditHistory()
    removeEdges(selected.map(e => e.id))
  }
}

const copySelectedNodes = () => {
  const selected = nodes.value.filter(n => n.selected)
  if (selected.length > 0) {
    clipboard.value = JSON.parse(JSON.stringify(selected))
    console.log('已复制', selected.length, '个节点')
  }
}

const pasteNodes = () => {
  if (clipboard.value.length > 0) {
    saveWorkflowEditHistory()
    const offset = 50
    const newNodes = clipboard.value.map(node => ({
      ...node,
      id: `${node.type}-${Date.now()}-${Math.random()}`,
      position: {
        x: node.position.x + offset,
        y: node.position.y + offset
      },
      selected: false
    }))
    addNodes(newNodes)
  }
}

const duplicateSelectedNodes = () => {
  copySelectedNodes()
  pasteNodes()
}

// ============ 右键菜单 ============
const showContextMenu = (event: MouseEvent, node?: Node, edge?: Edge) => {
  event.preventDefault()
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    node: node || null,
    edge: edge || null
  }
}

const hideContextMenu = () => {
  contextMenu.value.show = false
}

const deleteNode = (nodeId: string) => {
  saveWorkflowEditHistory()
  removeNodes([nodeId])
  hideContextMenu()
}

const deleteEdge = (edgeId: string) => {
  saveWorkflowEditHistory()
  removeEdges([edgeId])
  hideContextMenu()
}

const duplicateNode = (node: Node) => {
  saveWorkflowEditHistory()
  const newNode = {
    ...JSON.parse(JSON.stringify(node)),
    id: `${node.type}-${Date.now()}`,
    position: {
      x: node.position.x + 50,
      y: node.position.y + 50
    },
    selected: false
  }
  addNodes([newNode])
  hideContextMenu()
}

// ============ 键盘快捷键 ============
const handleKeyDown = (event: KeyboardEvent) => {
  // Delete - 删除选中的节点和边
  if (event.key === 'Delete' || event.key === 'Backspace') {
    deleteSelectedNodes()
    deleteSelectedEdges()
  }

  // Ctrl/Cmd + S - 保存
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    saveWorkflow()
  }

  // Ctrl/Cmd + C - 复制
  if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
    event.preventDefault()
    copySelectedNodes()
  }

  // Ctrl/Cmd + V - 粘贴
  if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
    event.preventDefault()
    pasteNodes()
  }

  // Ctrl/Cmd + D - 复制
  if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
    event.preventDefault()
    duplicateSelectedNodes()
  }

  // Ctrl/Cmd + Z - 撤销
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    undo()
  }

  // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y - 重做
  if ((event.ctrlKey || event.metaKey) && (event.shiftKey && event.key === 'z' || event.key === 'y')) {
    event.preventDefault()
    redo()
  }
}

const handleResize = () => {
  if (window.innerWidth < 1024) {
    sidebarCollapsed.value = true
  } else {
    sidebarCollapsed.value = false
  }
}

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('click', hideContextMenu)
  window.removeEventListener('resize', handleResize)
})
// 暴露全局方法，用于测试目的onMounted(() => {  window.addKnowledgeNode = () => {    console.log("🎯 直接添加知识节点到工作区")    const newNode = {      id: `knowledge-${Date.now()}`,      type: "knowledge",      position: { x: 300, y: 200 },      data: {        label: "知识库",        inputs: [          { id: "query", name: "查询内容", type: "string", value: "测试查询", required: true },          { id: "topK", name: "返回数量", type: "number", value: 3 }        ],        outputs: [          { id: "results", name: "查询结果", type: "array" }        ]      }    }    addNodes([newNode])    saveWorkflowEditHistory()    console.log("✅ 知识节点添加成功:", newNode)    return newNode  }})

// Initialize when Vue Flow is ready
onPaneReady(({ fitView }) => {
    console.log('🎯 onPaneReady called, fitView:', fitView)
    
    // 获取当前工作流ID
    const workflowId = (route.params.id as string);
    console.log('📝 Workflow ID:', workflowId)
    console.log('🆕 Is new workflow:', isNewWorkflow.value)

    // 延迟加载工作流，等待页面转换动画完成
    setTimeout(() => {
        if (workflowId) {
            console.log('📂 加载已有工作流:', workflowId)
            loadWorkflow(workflowId, fitView)
        }
    }, 500)
})

// Load workflow from backend
const loadWorkflow = async (workflowId: string, fitView?: any) => {
    console.log('🔄 开始加载工作流:', workflowId)
    console.log('📌 isNewWorkflow:', isNewWorkflow.value)
    console.log('📌 route.query:', JSON.stringify(route.query))
    isInitializing.value = true

    try {
        const result = await workflowService.fetchWorkflow(workflowId)

        if (result.success && result.workflow) {
            console.log('  工作流加载成功:', result.workflow)
            console.log('📊 graphData:', JSON.stringify(result.workflow.graphData))

            const graphData = result.workflow.graphData
            const hasNodes = graphData?.nodes && graphData.nodes.length > 0
            const hasEdges = graphData?.edges && graphData.edges.length > 0

            console.log('📦 hasNodes:', hasNodes, 'hasEdges:', hasEdges)
            console.log('📦 nodesCount:', graphData?.nodes?.length || 0, 'edgesCount:', graphData?.edges?.length || 0)

            // 只有在新建工作流且没有节点数据时才加载示例
            // if (isNewWorkflow.value && !hasNodes) {
            //     console.log('🆕 新建空工作流，加载示例')
            //     initializeExampleWorkflow()
            // } else {
                // 清空当前状态
                nodes.value = []
                edges.value = []

                // 强制触发响应式更新
                await nextTick()

                // 加载节点和边
                if (graphData) {
                    const loadedNodes = graphData.nodes || []
                    const loadedEdges = graphData.edges || []

                    console.log('📥 加载节点:', JSON.stringify(loadedNodes))
                    console.log('📥 加载边:', JSON.stringify(loadedEdges))

                    // 使用 shallowRef 包装以避免 Vue Flow 的深度响应式问题
                    nodes.value = loadedNodes.map(node => ({ ...node }))
                    edges.value = loadedEdges.map(edge => ({ ...edge }))

                    workflowService.loadWorkflow(nodes.value, edges.value)

                    console.log('📥 加载节点数:', nodes.value.length, '边数:', edges.value.length)

                    // 清空历史记录并初始化
                    history.value = []
                    historyIndex.value = -1

                    await nextTick()
                    saveWorkflowEditHistory()

                    // 适配视图
                    if (fitView) {
                        setTimeout(() => {
                            fitView()
                        }, 100)
                    }
                } else {
                    console.warn('没有graphData，画布将保持空状态')
                }
            // }
        } else {
            console.error('  工作流加载失败:', result.error)
            showError('加载失败', result.error || '无法加载工作流')
        }
    } catch (error) {
        console.error('  加载工作流出错:', error)
        showError('加载失败', error instanceof Error ? error.message : '加载工作流时发生错误')
    } finally {
        isInitializing.value = false
    }
}

// 监听节点和边的变化，标记为未保存
watch([nodes, edges], () => {
  if (saveStatus.value !== 'saving') {
    saveStatus.value = 'unsaved'
  }
}, { deep: true })

// 初始化示例工作流
const initializeExampleWorkflow = () => {
  console.log('🔨 初始化示例工作流，当前节点数:', nodes.value.length)
  isInitializing.value = true
  
  const exampleNodes = [
      {
          id: 'start-1',
          type: 'start',
          position: { x: 50, y: 150 },
          data: { 
              label: '开始',
              inputs: [
                  { id: 'query', name: '查询内容', type: 'string', value: '', required: true }
              ]
          }
      },
      {
          id: 'var-1',
          type: 'variable',
          position: { x: 250, y: 150 },
          data: { 
              label: '变量配置',
              inputs: [
                  { id: 'apiKey', name: 'API Key', type: 'string', value: '' },
                  { id: 'endpoint', name: 'API Endpoint', type: 'string', value: 'https://api.example.com/v1' }
              ],
              outputs: [
                  { id: 'apiKey', name: 'API Key', type: 'string' },
                  { id: 'endpoint', name: 'API Endpoint', type: 'string' }
              ]
          }
      },
      {
          id: 'kb-1',
          type: 'knowledge',
          position: { x: 450, y: 50 },
          data: { 
              label: '知识库查询',
              inputs: [
                  { id: 'query', name: '查询内容', type: 'string', value: '' },
                  { id: 'topK', name: '返回数量', type: 'number', value: 3 }
              ],
              outputs: [
                  { id: 'results', name: '查询结果', type: 'array' }
              ]
          }
      },
      {
          id: 'llm-1',
          type: 'llm',
          position: { x: 650, y: 150 },
          data: { 
              label: '大模型处理',
              inputs: [
                  { id: 'prompt', name: '提示词', type: 'string', value: '基于以下知识库结果回答问题：\n{knowledge_results}' },
                  { id: 'model', name: '模型', type: 'string', value: 'gpt-4' },
                  { id: 'temperature', name: '温度', type: 'number', value: 0.7 }
              ],
              outputs: [
                  { id: 'response', name: '响应内容', type: 'string' },
                  { id: 'tokens', name: 'Token数', type: 'number' }
              ]
          }
      },
      {
          id: 'cond-1',
          type: 'condition',
          position: { x: 850, y: 150 },
          data: { 
              label: '条件判断',
              inputs: [
                  { id: 'condition', name: '判断条件', type: 'string', value: '{response}.length > 100' }
              ],
              outputs: [
                  { id: 'yes', name: '是', type: 'boolean' },
                  { id: 'no', name: '否', type: 'boolean' }
              ]
          }
      },
      {
          id: 'http-1',
          type: 'http',
          position: { x: 1050, y: 50 },
          data: { 
              label: 'HTTP请求',
              inputs: [
                  { id: 'url', name: 'URL', type: 'string', value: 'https://api.example.com/notify' },
                  { id: 'method', name: '方法', type: 'string', value: 'POST' },
                  { id: 'headers', name: 'Headers', type: 'object', value: '{"Content-Type": "application/json"}' },
                  { id: 'body', name: '请求体', type: 'object', value: '{"message": "{response}"}' }
              ],
              outputs: [
                  { id: 'response', name: '响应', type: 'object' },
                  { id: 'status', name: '状态码', type: 'number' }
              ]
          }
      },
      {
          id: 'email-1',
          type: 'email',
          position: { x: 1250, y: 50 },
          data: { 
              label: '发送邮件',
              inputs: [
                  { id: 'to', name: '收件人', type: 'string', value: 'user@example.com' },
                  { id: 'subject', name: '主题', type: 'string', value: '工作流处理结果' },
                  { id: 'content', name: '内容', type: 'string', value: '{response}' }
              ],
              outputs: [
                  { id: 'success', name: '发送成功', type: 'boolean' }
              ]
          }
      },
      {
          id: 'end-1',
          type: 'end',
          position: { x: 1450, y: 150 },
          data: { 
              label: '结束',
              outputs: [
                  { id: 'result', name: '最终结果', type: 'string' }
              ]
          }
      },
      {
          id: 'end-2',
          type: 'end',
          position: { x: 1050, y: 280 },
          data: { 
              label: '结束(简短)',
              outputs: [
                  { id: 'result', name: '最终结果', type: 'string' }
              ]
          }
      }
  ]

  const exampleEdges = [
      {
          id: 'e-start-var',
          source: 'start-1',
          target: 'var-1',
          animated: true
      },
      {
          id: 'e-var-kb',
          source: 'var-1',
          target: 'kb-1',
          animated: true
      },
      {
          id: 'e-var-llm',
          source: 'var-1',
          target: 'llm-1',
          animated: true
      },
      {
          id: 'e-kb-llm',
          source: 'kb-1',
          target: 'llm-1',
          animated: true
      },
      {
          id: 'e-llm-cond',
          source: 'llm-1',
          target: 'cond-1',
          animated: true
      },
      {
          id: 'e-cond-yes',
          source: 'cond-1',
          sourceHandle: 'true',
          target: 'http-1',
          animated: true,
          label: '是'
      },
      {
          id: 'e-cond-no',
          source: 'cond-1',
          sourceHandle: 'false',
          target: 'end-2',
          animated: true,
          label: '否'
      },
      {
          id: 'e-http-email',
          source: 'http-1',
          target: 'email-1',
          animated: true
      },
      {
          id: 'e-email-end',
          source: 'email-1',
          target: 'end-1',
          animated: true
      }
  ]

  console.log('📊 示例节点数:', exampleNodes.length, '示例边数:', exampleEdges.length)
  
  // 使用 Vue Flow 的方法添加节点和边
  addNodes(exampleNodes)
  addEdges(exampleEdges)

  // 同时更新 workflowService
  workflowService.loadWorkflow(nodes.value, edges.value)

  // 自动保存
  saveStatus.value = 'saved'
  lastSaved.value = new Date().toLocaleTimeString()

  // 初始化历史记录
  saveWorkflowEditHistory()

  // 适配视图
  window.requestAnimationFrame(() => {
    fitView()
  })

  isInitializing.value = false

  console.log('  示例工作流初始化完成，当前节点数:', nodes.value.length)
}

// 连接处理
    // 自动映射变量：将上游节点的输出变量映射到下游节点的输入变量
  const sourceNode = nodes.value.find(n => n.id === params.source)
  const targetNode = nodes.value.find(n => n.id === params.target)

  if (sourceNode && targetNode) {
    const sourceOutputs = sourceNode.data.outputs || []
    const targetInputs = targetNode.data.inputs || []

    // 初始化 variableMappings
    if (!targetNode.data.variableMappings) {
      targetNode.data.variableMappings = {}
    }

    // 按顺序映射变量
    sourceOutputs.forEach((output, index) => {
      if (index < targetInputs.length) {
        const targetInput = targetInputs[index]
        const targetVariableMappings = targetNode.data.variableMappings

        // 确保对象存在后再访问属性
        if (targetInput && targetVariableMappings && output) {
          targetVariableMappings[targetInput.name] = {
            sourceNodeId: sourceNode.id,
            sourceVariableName: output.name
          }
        }
      }
    }
  }
onConnect((params) => {
    // 自动映射变量：将上游节点的输出变量映射到下游节点的输入变量
  const sourceNode = nodes.value.find(n => n.id === params.source)
  const targetNode = nodes.value.find(n => n.id === params.target)

  if (sourceNode && targetNode) {
    const sourceOutputs = sourceNode.data.outputs || []
    const targetInputs = targetNode.data.inputs || []

    // 初始化 variableMappings
    if (!targetNode.data.variableMappings) {
      targetNode.data.variableMappings = {}
    }

    // 按顺序映射变量
    sourceOutputs.forEach((output, index) => {
      if (index < targetInputs.length) {
        const targetInput = targetInputs[index]
        const targetVariableMappings = targetNode.data.variableMappings

        // 确保对象存在后再访问属性
        if (targetInput && targetVariableMappings && output) {
          targetVariableMappings[targetInput.name] = {
            sourceNodeId: sourceNode.id,
            sourceVariableName: output.name
          }
        }
      }
    }
  }
  saveWorkflowEditHistory()
    // 自动映射变量：将上游节点的输出变量映射到下游节点的输入变量
  const sourceNode = nodes.value.find(n => n.id === params.source)
  const targetNode = nodes.value.find(n => n.id === params.target)

  if (sourceNode && targetNode) {
    const sourceOutputs = sourceNode.data.outputs || []
    const targetInputs = targetNode.data.inputs || []

    // 初始化 variableMappings
    if (!targetNode.data.variableMappings) {
      targetNode.data.variableMappings = {}
    }

    // 按顺序映射变量
    sourceOutputs.forEach((output, index) => {
      if (index < targetInputs.length) {
        const targetInput = targetInputs[index]
        const targetVariableMappings = targetNode.data.variableMappings

        // 确保对象存在后再访问属性
        if (targetInput && targetVariableMappings && output) {
          targetVariableMappings[targetInput.name] = {
            sourceNodeId: sourceNode.id,
            sourceVariableName: output.name
          }
        }
      }
    }
  }
  addEdges([params])
    // 自动映射变量：将上游节点的输出变量映射到下游节点的输入变量
  const sourceNode = nodes.value.find(n => n.id === params.source)
  const targetNode = nodes.value.find(n => n.id === params.target)

  if (sourceNode && targetNode) {
    const sourceOutputs = sourceNode.data.outputs || []
    const targetInputs = targetNode.data.inputs || []

    // 初始化 variableMappings
    if (!targetNode.data.variableMappings) {
      targetNode.data.variableMappings = {}
    }

    // 按顺序映射变量
    sourceOutputs.forEach((output, index) => {
      if (index < targetInputs.length) {
        const targetInput = targetInputs[index]
        const targetVariableMappings = targetNode.data.variableMappings

        // 确保对象存在后再访问属性
        if (targetInput && targetVariableMappings && output) {
          targetVariableMappings[targetInput.name] = {
            sourceNodeId: sourceNode.id,
            sourceVariableName: output.name
          }
        }
      }
    }
  }

    // 自动映射变量：将上游节点的输出变量映射到下游节点的输入变量
  const sourceNode = nodes.value.find(n => n.id === params.source)
  const targetNode = nodes.value.find(n => n.id === params.target)

  if (sourceNode && targetNode) {
    const sourceOutputs = sourceNode.data.outputs || []
    const targetInputs = targetNode.data.inputs || []

    // 初始化 variableMappings
    if (!targetNode.data.variableMappings) {
      targetNode.data.variableMappings = {}
    }

    // 按顺序映射变量
    sourceOutputs.forEach((output, index) => {
      if (index < targetInputs.length) {
        const targetInput = targetInputs[index]
        const targetVariableMappings = targetNode.data.variableMappings

        // 确保对象存在后再访问属性
        if (targetInput && targetVariableMappings && output) {
          targetVariableMappings[targetInput.name] = {
            sourceNodeId: sourceNode.id,
            sourceVariableName: output.name
          }
        }
      }
    }
  }
  // 自动映射变量：将上游节点的输出变量映射到下游节点的输入变量
    // 自动映射变量：将上游节点的输出变量映射到下游节点的输入变量
  const sourceNode = nodes.value.find(n => n.id === params.source)
  const targetNode = nodes.value.find(n => n.id === params.target)

  if (sourceNode && targetNode) {
    const sourceOutputs = sourceNode.data.outputs || []
    const targetInputs = targetNode.data.inputs || []

    // 初始化 variableMappings
    if (!targetNode.data.variableMappings) {
      targetNode.data.variableMappings = {}
    }

    // 按顺序映射变量
    sourceOutputs.forEach((output, index) => {
      if (index < targetInputs.length) {
        const targetInput = targetInputs[index]
        const targetVariableMappings = targetNode.data.variableMappings

        // 确保对象存在后再访问属性
        if (targetInput && targetVariableMappings && output) {
          targetVariableMappings[targetInput.name] = {
            sourceNodeId: sourceNode.id,
            sourceVariableName: output.name
          }
        }
      }
    }
  }
  const sourceNode = nodes.value.find(n => n.id === params.source)
    // 自动映射变量：将上游节点的输出变量映射到下游节点的输入变量
  const sourceNode = nodes.value.find(n => n.id === params.source)
  const targetNode = nodes.value.find(n => n.id === params.target)

  if (sourceNode && targetNode) {
    const sourceOutputs = sourceNode.data.outputs || []
    const targetInputs = targetNode.data.inputs || []

    // 初始化 variableMappings
    if (!targetNode.data.variableMappings) {
      targetNode.data.variableMappings = {}
    }

    // 按顺序映射变量
    sourceOutputs.forEach((output, index) => {
      if (index < targetInputs.length) {
        const targetInput = targetInputs[index]
        const targetVariableMappings = targetNode.data.variableMappings

        // 确保对象存在后再访问属性
        if (targetInput && targetVariableMappings && output) {
          targetVariableMappings[targetInput.name] = {
            sourceNodeId: sourceNode.id,
            sourceVariableName: output.name
          }
        }
      }
    }
  }
  const targetNode = nodes.value.find(n => n.id === params.target)
    // 自动映射变量：将上游节点的输出变量映射到下游节点的输入变量
  const sourceNode = nodes.value.find(n => n.id === params.source)
  const targetNode = nodes.value.find(n => n.id === params.target)

  if (sourceNode && targetNode) {
    const sourceOutputs = sourceNode.data.outputs || []
    const targetInputs = targetNode.data.inputs || []

    // 初始化 variableMappings
    if (!targetNode.data.variableMappings) {
      targetNode.data.variableMappings = {}
    }

    // 按顺序映射变量
    sourceOutputs.forEach((output, index) => {
      if (index < targetInputs.length) {
        const targetInput = targetInputs[index]
        const targetVariableMappings = targetNode.data.variableMappings

        // 确保对象存在后再访问属性
        if (targetInput && targetVariableMappings && output) {
          targetVariableMappings[targetInput.name] = {
            sourceNodeId: sourceNode.id,
            sourceVariableName: output.name
          }
        }
      }
    }
  }

    // 自动映射变量：将上游节点的输出变量映射到下游节点的输入变量
  const sourceNode = nodes.value.find(n => n.id === params.source)
  const targetNode = nodes.value.find(n => n.id === params.target)

  if (sourceNode && targetNode) {
    const sourceOutputs = sourceNode.data.outputs || []
    const targetInputs = targetNode.data.inputs || []

    // 初始化 variableMappings
    if (!targetNode.data.variableMappings) {
      targetNode.data.variableMappings = {}
    }

    // 按顺序映射变量
    sourceOutputs.forEach((output, index) => {
      if (index < targetInputs.length) {
        const targetInput = targetInputs[index]
        const targetVariableMappings = targetNode.data.variableMappings

        // 确保对象存在后再访问属性
        if (targetInput && targetVariableMappings && output) {
          targetVariableMappings[targetInput.name] = {
            sourceNodeId: sourceNode.id,
            sourceVariableName: output.name
          }
        }
      }
    }
  }
  if (sourceNode && targetNode) {
    // 自动映射变量：将上游节点的输出变量映射到下游节点的输入变量
  const sourceNode = nodes.value.find(n => n.id === params.source)
  const targetNode = nodes.value.find(n => n.id === params.target)

  if (sourceNode && targetNode) {
    const sourceOutputs = sourceNode.data.outputs || []
    const targetInputs = targetNode.data.inputs || []

    // 初始化 variableMappings
    if (!targetNode.data.variableMappings) {
      targetNode.data.variableMappings = {}
    }

    // 按顺序映射变量
    sourceOutputs.forEach((output, index) => {
      if (index < targetInputs.length) {
        const targetInput = targetInputs[index]
        const targetVariableMappings = targetNode.data.variableMappings

        // 确保对象存在后再访问属性
        if (targetInput && targetVariableMappings && output) {
          targetVariableMappings[targetInput.name] = {
            sourceNodeId: sourceNode.id,
            sourceVariableName: output.name
          }
        }
      }
    }
  }
    const sourceOutputs = sourceNode.data.outputs || []
    const targetInputs = targetNode.data.inputs || []

    // 初始化 variableMappings
    if (!targetNode.data.variableMappings) {
      targetNode.data.variableMappings = {}
    }

    // 按顺序映射变量
    sourceOutputs.forEach((output, index) => {
      if (index < targetInputs.length) {
        const targetInput = targetInputs[index]
        if (targetInput && output && output.name) {
          targetNode.data.variableMappings[targetInput.name] = {
            sourceNodeId: sourceNode.id,
            sourceVariableName: output.name
          }
        }
      }
    })

    // 标记为未保存
    saveStatus.value = 'unsaved'
  }
})

// 节点点击处理：左键选中，右键菜单
onNodeClick((event) => {
  if (event.event instanceof MouseEvent) {
    if (event.event.button === 0) {
      // 左键：选中节点，打开检查器
      selectedNode.value = event.node
    } else if (event.event.button === 2) {
      // 右键：显示上下文菜单
      showContextMenu(event.event, event.node)
    }
  }
})

const handleVersionRestored = async () => {
  showVersionHistory.value = false
  if (workflowId.value) {
    await loadWorkflow(workflowId.value)
  }
  showSuccess('版本恢复成功', '工作流已恢复到选定版本')
}

// 加载执行历史
onMounted(() => {
  try {
    const saved = localStorage.getItem('workflow-execution-history')
    if (saved) {
      executionHistory.value = JSON.parse(saved)
    }
  } catch (e) {
    console.warn('无法加载执行历史:', e)
  }

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('click', hideContextMenu)
  document.body.classList.add('page-loaded')

  handleResize()
  window.addEventListener('resize', handleResize)

  const workflowId = (route.params.id as string);
  // if (!workflowId && nodes.value.length === 0) {
  //   console.log('🚀 onMounted: 初始化示例工作流')
  //   setTimeout(() => {
  //     initializeExampleWorkflow()
  //   }, 100)
  // }

  // 初始化WebSocket连接
  try {
    socket.value = io('http://localhost:3001/workflow', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5
    })

    socket.value.on('connect', () => {
      console.log('✅ WebSocket已连接')
    })

    socket.value.on('disconnect', () => {
      console.log('❌ WebSocket已断开')
    })

    // ✅ FIX: 组件挂载时立即加入workflow房间，确保接收到所有实时更新
    onMounted(() => {
      // 立即加入workflow房间，而不是等到执行时
      if (socket.value && workflowId.value) {
        socket.value.emit('join-workflow', workflowId.value)
        console.log('📡 加入workflow房间 (onMounted):', workflowId.value)
      }
    })

    // 监听节点状态更新
    socket.value.on('node-status', (data: any) => {
      console.log('📡 收到节点状态更新:', data)
      
      // 详细调试信息
      if (data.status === 'running') {
        console.log('🚀 执行节点:', data.nodeId)
      } else if (data.status === 'success') {
        console.log('✅ 节点执行成功:', data.nodeId)
      } else if (data.status === 'error') {
        console.log('❌ 节点执行失败:', data.nodeId, '错误:', data.error)
      }

      const { nodeId, status, timestamp, outputs } = data
      const log = executionLogs.value.find(l => l.nodeId === nodeId)

      if (log) {
        // ✅ FIX: Vue 3 不需要Vue.set()，直接赋值即可触发响应式更新
        // 因为executionLogs.value是ref，Vue 3的Proxy会自动处理响应式
        log.status = status
        log.timestamp = timestamp || Date.now()

        if (status === 'running') {
          log.message = '正在执行...'
        } else if (status === 'success') {
          log.message = '执行成功'
          if (outputs) {
            log.output = outputs
          }
        } else if (status === 'error') {
          log.message = '执行失败'
        }
      } else {
        // ✅ FIX: 如果节点不存在于日志中，创建新日志条目
        const newLog = {
          nodeId,
          status,
          timestamp: timestamp || Date.now(),
          message: '正在执行...',
        }
        executionLogs.value.push(newLog)
      }

      // 更新当前执行节点
      if (status === 'running') {
        currentExecutingNode.value = nodeId
        console.log('🎯 当前执行节点:', nodeId)
      } else if (status === 'success' || status === 'error') {
        executedNodes.value.add(nodeId)
        console.log('✅ 节点执行完成:', nodeId)
      }
    })

    // 监听执行日志
    socket.value.on('execution-log', (data: any) => {
      console.log('📡 收到执行日志:', data)
      workflowService.addTerminalLog({
        id: Date.now().toString(),
        type: data.type || 'info',
        nodeId: data.nodeId,
        nodeName: data.nodeName,
        message: data.message,
        timestamp: data.timestamp || Date.now()
      })
    })
  } catch (error) {
    console.error('WebSocket连接失败:', error)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('click', hideContextMenu)
  window.removeEventListener('resize', handleResize)

  // 断开WebSocket连接
  if (socket.value) {
    socket.value.disconnect()
    socket.value = null
    console.log('🔌 WebSocket已断开连接')
  }
})
</script>

<template>
  <div class="flex h-screen w-full flex-col bg-background-light dark:bg-background-dark font-sans overflow-hidden">

    <!-- Internal App Header (Merged with Workflow Actions) -->
    <header class="h-16 px-6 border-b border-sand/30 dark:border-white/10 bg-white/80 dark:bg-[#1e1711]/80 backdrop-blur-md flex items-center justify-between z-40 shrink-0 overflow-visible">
      <div class="flex items-center gap-12 min-w-0">
        <Logo class="scale-90 origin-left flex-shrink-0" />
        <nav class="hidden md:flex items-center gap-6">
          <RouterLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="flex items-center gap-2 text-sm font-medium transition-colors duration-200"
            :class="route.path === link.path ? 'text-primary font-bold' : 'text-charcoal/60 dark:text-sand/60 hover:text-charcoal dark:hover:text-sand'"
          >
            <component :is="link.icon" :size="16" />
            {{ link.name }}
          </RouterLink>
        </nav>
      </div>

      <!-- Workflow Specific Actions -->
      <div class="flex items-center gap-3 overflow-visible">
         <!-- Toggle Sidebar -->
         <button @click="sidebarCollapsed = !sidebarCollapsed"
                 class="flex items-center justify-center p-2 rounded-full transition-colors text-charcoal/60 hover:text-primary hover:bg-sand/20"
                 :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'">
             <LayoutGrid :size="18" />
         </button>

         <button @click="autoLayout"
                 :disabled="isAutoLayouting || nodes.length === 0"
                 class="flex items-center justify-center p-2 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                 :class="isAutoLayouting ? 'text-primary animate-pulse' : 'text-charcoal/60 hover:text-indigo-600 hover:bg-sand/20'"
                 title="自动布局">
             <Loader2 v-if="isAutoLayouting" :size="18" class="animate-spin" />
             <Workflow v-else :size="18" />
         </button>

         <div class="h-6 w-px bg-sand/30 dark:bg-white/10 mx-1"></div>

         <!-- Save Indicator -->
         <div class="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-sand/20 dark:bg-white/5 border border-sand/30 dark:border-white/10">
              <div class="size-1.5 rounded-full transition-colors duration-300"
                   :class="saveStatus === 'saved' ? 'bg-emerald-500' : saveStatus === 'saving' ? 'bg-primary' : 'bg-charcoal/30'"></div>
              <span class="text-[10px] font-medium text-charcoal/60 dark:text-sand/60 w-12 text-center">
                  {{ saveStatus === 'saved' ? '已保存' : saveStatus === 'saving' ? '保存中' : '未保存' }}
              </span>
          </div>

          <div class="h-6 w-px bg-sand/30 dark:bg-white/10 mx-1"></div>

          <button @click="undo" :disabled="historyIndex <= 0"
                  class="flex items-center justify-center p-2 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  :class="historyIndex > 0 ? 'text-charcoal/60 hover:text-primary hover:bg-sand/20' : 'text-charcoal/30'"
                  title="撤销 (Ctrl+Z)">
              <RotateCcw :size="18" />
          </button>

          <button @click="redo" :disabled="!history || historyIndex >= history.length - 1"
                  class="flex items-center justify-center p-2 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  :class="history && historyIndex < history.length - 1 ? 'text-charcoal/60 hover:text-primary hover:bg-sand/20' : 'text-charcoal/30'"
                  title="重做 (Ctrl+Shift+Z)">
              <RotateCcw :size="18" class="scale-x-[-1]" />
          </button>

          <div class="h-6 w-px bg-sand/30 dark:bg-white/10 mx-1"></div>

          <button @click="saveWorkflow"
                  class="flex items-center justify-center p-2 rounded-full text-charcoal/60 hover:text-primary hover:bg-sand/20 transition-colors" title="保存">
              <Save :size="18" />
          </button>

          <button
            @click="showVersionHistory = true"
            class="flex items-center justify-center p-2 rounded-full text-charcoal/60 hover:text-indigo-600 hover:bg-sand/20 transition-colors" title="版本历史">
              <History :size="18" />
          </button>

          <button
            @click="generateThumbnail"
            :disabled="isGeneratingThumbnail"
            class="flex items-center justify-center p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="isGeneratingThumbnail ? 'text-primary animate-pulse' : 'text-charcoal/60 hover:text-pink-600 hover:bg-sand/20'"
            title="生成缩略图">
              <Loader2 v-if="isGeneratingThumbnail" :size="18" class="animate-spin" />
              <Camera v-else :size="18" />
          </button>

          <div class="h-6 w-px bg-sand/30 dark:bg-white/10 mx-1"></div>

          <button
            @click="toggleDebug"
            class="flex items-center justify-center p-2 rounded-full transition-colors"
            :class="debugMode ? 'text-primary bg-primary/10' : 'text-charcoal/60 hover:text-primary hover:bg-sand/20'"
            :title="debugMode ? '停止调试' : '调试'">
              <Bug :size="18" />
          </button>

          <button
            @click="showVersionHistory = true"
            class="flex items-center justify-center p-2 rounded-full text-charcoal/60 hover:text-primary hover:bg-sand/20 transition-colors"
            title="版本历史">
              <History :size="18" />
          </button>

          <div class="h-6 w-px bg-sand/30 dark:bg-white/10 mx-1"></div>

          <button
            @click="deployWorkflow"
            class="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary text-white shadow-md hover:shadow-lg hover:bg-primary/90 transition-all text-xs font-bold active:scale-95 flex-shrink-0"
            title="部署">
              <Rocket :size="16" />
              <span class="hidden md:inline">部署</span>
          </button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden relative flex-col">

        <div class="flex flex-1 relative overflow-hidden pb-[320px]">
             <WorkflowSidebar
                :node-categories="nodeCategories"
                v-model:search-query="searchQuery"
                :collapsed="sidebarCollapsed"
                @drag-start="onDragStart"
                class="z-10 shrink-0"
            />

            <main class="relative flex-1 bg-background-light dark:bg-background-dark overflow-hidden h-full w-full">

                <Transition name="fade">
                    <div v-if="isInitializing" class="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-[#1e1711]/80 backdrop-blur-sm">
                        <div class="flex flex-col items-center gap-4">
                            <Loader2 :size="48" class="animate-spin text-primary" />
                            <p class="text-sm font-medium text-charcoal/70 dark:text-sand/70">加载工作流中...</p>
                        </div>
                    </div>
                </Transition>

                <div class="absolute top-4 left-4 flex flex-col gap-2 z-30">
                    <div class="flex flex-col rounded-xl bg-white/80 dark:bg-[#1e1711]/80 backdrop-blur border border-sand/30 dark:border-white/10 shadow-sm overflow-hidden">
                        <button class="p-2.5 text-khaki hover:text-primary hover:bg-sand/20 transition-colors" title="选择">
                            <MousePointer2 :size="18" />
                        </button>
                        <button class="p-2.5 text-khaki hover:text-primary hover:bg-sand/20 transition-colors border-t border-sand/10" title="平移">
                            <Hand :size="18" />
                        </button>
                        <button class="p-2.5 text-khaki hover:text-primary hover:bg-sand/20 transition-colors border-t border-sand/10" title="注释">
                            <MessageCircle :size="18" />
                        </button>
                        <button class="p-2.5 text-khaki hover:text-primary hover:bg-sand/20 transition-colors border-t border-sand/10" title="缩放">
                            <Layers :size="18" />
                        </button>
                    </div>
                </div>

                <VueFlow
                    ref="vueFlowRef"
                    v-model:nodes="nodes"
                    v-model:edges="edges"
                    @node-context-menu="(event) => showContextMenu(event.event as MouseEvent, event.node)"
                    @edge-context-menu="(event) => showContextMenu(event.event as MouseEvent, undefined, event.edge)"
                    @pane-context-menu="(event) => showContextMenu(event as MouseEvent)"
                    @dragover="onDragOver"
                    @dragleave="onDragLeave"
                    @drop="onDrop"
                    @pane-ready="onPaneReady"
                    :fit-view-on-init="true"
                    :default-edge-options="{ animated: true }"
                    :node-class="getNodeExecutionClass"
                    class="vue-flow-container transition-colors duration-300"
                    :class="{ 'bg-primary/5': isDraggingOver }"
                >
                    <Background variant="dots" color="#e5e0dc" :gap="24" :size="1" />
                    <Controls class="bg-white/80 dark:bg-[#1e1711]/80 backdrop-blur border border-sand/30 dark:border-white/10 shadow-sm rounded-lg" />

                    <template #node-llm="props"><LlmNode v-bind="props" /></template>
                    <template #node-knowledge="props"><KnowledgeNode v-bind="props" /></template>
                    <template #node-start="props"><StartNode v-bind="props" /></template>
                    <template #node-end="props"><EndNode v-bind="props" /></template>
                    <template #node-condition="props"><ConditionNode v-bind="props" /></template>
                    <template #node-code="props"><CodeNode v-bind="props" /></template>
                    <template #node-http="props"><HttpRequestNode v-bind="props" /></template>
                    <template #node-loop="props"><LoopNode v-bind="props" /></template>
                    <template #node-filter="props"><FilterNode v-bind="props" /></template>
                    <template #node-variable="props"><VariableNode v-bind="props" /></template>
                    <template #node-webhook="props"><WebhookNode v-bind="props" /></template>
                    <template #node-delay="props"><DelayNode v-bind="props" /></template>
                    <template #node-notification="props"><NotificationNode v-bind="props" /></template>
                    <template #node-email="props"><EmailNode v-bind="props" /></template>

                    <template #edge-custom="props"><CustomAnimatedEdge v-bind="props" /></template>
                </VueFlow>
            </main>

            <!-- Inspector -->
            <WorkflowInspector v-model:selected-node="selectedNode" />
        </div>

        <!-- Execution Panel (Bottom) -->
        <ExecutionPanel
          :inputs="getStartNodeInputs()"
          :is-executing="isExecuting"
          :execution-result="executionResult"
          :execution-logs="executionLogs"
          :terminal-logs="workflowService.getTerminalLogs()"
          :execution-time="executionTime"
          @execute="runWorkflow"
          @clear-logs="clearExecutionLogs"
          @clear-terminal="workflowService.clearTerminalLogs()"
        />
    </div>

    <!-- Debug Panel -->
    <DebugPanel :debug-mode="debugMode" @toggle="toggleDebug" @execute-node="executeNode" />

    <!-- 右键菜单 -->
    <Transition name="fade">
      <div
        v-if="contextMenu.show"
        :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
        class="fixed z-[200] bg-white dark:bg-[#1e1711] rounded-lg shadow-2xl border border-sand/30 dark:border-white/10 py-1 min-w-[180px]"
        @click.stop
      >
        <!-- 节点菜单 -->
        <template v-if="contextMenu.node">
          <button
            @click="duplicateNode(contextMenu.node)"
            class="w-full px-4 py-2 text-left text-sm hover:bg-sand/20 dark:hover:bg-white/5 flex items-center gap-2 text-charcoal dark:text-sand transition-colors"
          >
            <Copy :size="14" />
            <span>复制节点</span>
            <span class="ml-auto text-xs text-khaki">Ctrl+D</span>
          </button>
          <button
            @click="deleteNode(contextMenu.node.id)"
            class="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 text-red-600 transition-colors"
          >
            <Trash2 :size="14" />
            <span>删除节点</span>
            <span class="ml-auto text-xs text-red-400">Delete</span>
          </button>
        </template>

        <!-- 边菜单 -->
        <template v-else-if="contextMenu.edge">
          <button
            @click="deleteEdge(contextMenu.edge.id)"
            class="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 text-red-600 transition-colors"
          >
            <Trash2 :size="14" />
            <span>删除连接</span>
            <span class="ml-auto text-xs text-red-400">Delete</span>
          </button>
        </template>

        <!-- 画布菜单 -->
        <template v-else>
          <button
            @click="pasteNodes(); hideContextMenu()"
            :disabled="!clipboard || clipboard.length === 0"
            class="w-full px-4 py-2 text-left text-sm hover:bg-sand/20 dark:hover:bg-white/5 flex items-center gap-2 text-charcoal dark:text-sand transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Copy :size="14" />
            <span>粘贴</span>
            <span class="ml-auto text-xs text-khaki">Ctrl+V</span>
          </button>
        </template>
      </div>
    </Transition>

    <!-- Deploy Modal -->
    <Transition name="scale">
      <div
        v-if="showDeployModal && deployResult"
        class="fixed inset-0 bg-charcoal/20 backdrop-blur-sm flex items-center justify-center z-[100]"
        @click.self="showDeployModal = false"
      >
        <div class="bg-white dark:bg-[#1e1711] rounded-2xl shadow-2xl p-8 max-w-md w-full mx-6 border border-white/20">
          <div class="text-center">
            <div
              class="size-16 mx-auto mb-6 rounded-full flex items-center justify-center shadow-inner"
              :class="deployResult.success ? 'bg-emerald-100/50 text-emerald-600' : 'bg-red-100/50 text-red-600'"
            >
              <component
                :is="deployResult.success ? CheckCircle : XCircle"
                :size="32"
              />
            </div>
            <h3 class="text-xl font-serif font-bold text-charcoal dark:text-white mb-2">
              {{ deployResult.success ? '部署成功' : '部署失败' }}
            </h3>
            <p class="text-base text-khaki dark:text-sand/70 mb-6 leading-relaxed">
              {{ deployResult.success ? '您的工作流已成功部署到生产环境，随时可以被调用。' : deployResult.error }}
            </p>
            <div v-if="deployResult.success && deployResult.url" class="bg-background-light dark:bg-white/5 rounded-xl p-4 mb-6 text-left border border-sand/20">
              <p class="text-[10px] font-bold uppercase tracking-wider text-khaki mb-2">API 端点</p>
              <p class="text-xs font-mono text-primary break-all select-all">{{ deployResult.url }}</p>
            </div>
            <button
              @click="showDeployModal = false"
              class="w-full py-3.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-all font-bold text-sm shadow-lg shadow-primary/20"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <ErrorToast :messages="toastMessages" @dismiss="dismissToast" />

    <VersionHistoryDialog
      v-if="showVersionHistory"
      :is-open="showVersionHistory"
      :workflow-id="workflowId"
      @close="showVersionHistory = false"
      @restored="handleVersionRestored"
    />

    <!-- Thumbnail Preview Dialog -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showThumbnailPreview" class="fixed inset-0 z-50 flex items-center justify-center p-4"
             @click.self="closeThumbnailPreview">
          <div class="relative bg-white dark:bg-[#1e1711] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-sand/30 dark:border-white/10">
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <Camera :size="20" class="text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-charcoal dark:text-white">工作流缩略图</h3>
                  <p class="text-xs text-khaki">预览和下载工作流可视化图</p>
                </div>
              </div>
              <button @click="closeThumbnailPreview"
                      class="flex items-center justify-center p-2 rounded-full hover:bg-sand/20 dark:hover:bg-white/10 transition-colors">
                <X :size="20" class="text-charcoal/60 dark:text-sand/60" />
              </button>
            </div>

            <!-- Image Preview -->
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)] bg-sand/30 dark:bg-white/5">
              <div class="flex items-center justify-center">
                <img v-if="thumbnailData"
                     :src="thumbnailData"
                     alt="Workflow Thumbnail"
                     class="max-w-full h-auto rounded-lg shadow-lg border border-sand/20 dark:border-white/10" />
                <div v-else class="text-center text-khaki">
                  暂无缩略图
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 p-6 border-t border-sand/30 dark:border-white/10 bg-white/50 dark:bg-[#1e1711]/50">
              <button @click="closeThumbnailPreview"
                      class="px-4 py-2 rounded-lg text-sm font-medium text-charcoal/60 dark:text-sand/60 hover:text-charcoal dark:hover:text-white hover:bg-sand/20 dark:hover:bg-white/10 transition-colors">
                关闭
              </button>
              <button @click="downloadThumbnail"
                      class="px-4 py-2 rounded-lg text-sm font-medium bg-pink-600 hover:bg-pink-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                <Download :size="16" />
                下载图片
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
/* Global overrides for VueFlow */
.vue-flow__node {
    cursor: default;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.vue-flow__handle {
    border: none;
    background: transparent;
}

.vue-flow-container {
    height: 100% !important;
    width: 100% !important;
}

/* 节点执行状态样式 */
.vue-flow__node.executing {
    position: relative;
    z-index: 10;
}

.vue-flow__node.executing::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: inherit;
    background: linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6);
    background-size: 200% 200%;
    animation: executing-pulse 1.5s ease infinite;
    z-index: -1;
    opacity: 0.6;
}

.vue-flow__node.executing .custom-node {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
    transform: scale(1.02);
}

.vue-flow__node.executed {
    opacity: 0.7;
}

.vue-flow__node.executed .custom-node {
    border-color: #10b981 !important;
}

@keyframes executing-pulse {
    0%, 100% {
        background-position: 0% 50%;
        opacity: 0.6;
    }
    50% {
        background-position: 100% 50%;
        opacity: 0.8;
    }
}

/* 边的流动动画 */
.vue-flow__edge-path.animated {
    stroke-dasharray: 10;
    animation: edge-flow 1s linear infinite;
    stroke: #10b981;
}

@keyframes edge-flow {
    from {
        stroke-dashoffset: 20;
    }
    to {
        stroke-dashoffset: 0;
    }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 节点错误状态样式 */
.vue-flow__node.error {
    position: relative;
    z-index: 10;
}

.vue-flow__node.error::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: inherit;
    background: #ef4444;
    opacity: 0.3;
    z-index: -1;
    animation: error-pulse 1s ease-in-out infinite;
}

.vue-flow__node.error .custom-node {
    border-color: #ef4444 !important;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
}

@keyframes error-pulse {
    0%, 100% {
        opacity: 0.3;
    }
    50% {
        opacity: 0.6;
    }
}

/* slide-left动画 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease-out;
}
.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* scale动画 */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease-out;
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
