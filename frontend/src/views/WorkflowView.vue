<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'
import { MousePointer2, Hand, MessageCircle, MessageSquare, Sparkles, FileCode, GitBranch, Database, Globe, Layers, Search, Clock, RotateCcw, Sliders, CheckCircle, XCircle } from 'lucide-vue-next'

// Components
import WorkflowHeader from '@/components/workflow/WorkflowHeader.vue'
import WorkflowSidebar from '@/components/workflow/WorkflowSidebar.vue'
import WorkflowInspector from '@/components/workflow/WorkflowInspector.vue'
import DebugPanel from '@/components/workflow/DebugPanel.vue'
import WorkflowDemo from '@/components/workflow/WorkflowDemo.vue'

// Custom Nodes
import LlmNode from '@/components/workflow/nodes/LlmNode.vue'
import StartNode from '@/components/workflow/nodes/StartNode.vue'
import CodeNode from '@/components/workflow/nodes/CodeNode.vue'
import ConditionNode from '@/components/workflow/nodes/ConditionNode.vue'
import EndNode from '@/components/workflow/nodes/EndNode.vue'
import KnowledgeNode from '@/components/workflow/nodes/KnowledgeNode.vue'
import HttpRequestNode from '@/components/workflow/nodes/HttpRequestNode.vue'
import CustomAnimatedEdge from '@/components/workflow/edges/CustomAnimatedEdge.vue'

// Services
import { workflowService } from '@/services/workflowService'

const { onConnect, addEdges, addNodes, project, onNodeClick } = useVueFlow()

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
const searchQuery = ref('')
const selectedNode = ref<Node | null>(null)
const saveStatus = ref('saved') // saved, saving, unsaved
const lastSaved = ref<string | null>(null)
const debugMode = ref(false)
const showDemo = ref(true)
const showDeployModal = ref(false)
const showAPIModal = ref(false)
const deployResult = ref<{ success: boolean; url?: string; error?: string } | null>(null)

// Node Categories Definition
const nodeCategories = [
  {
    name: '触发器',
    items: [
      { type: 'start', label: '对话输入', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
      { type: 'webhook', label: 'Webhook', icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', meta: 'HTTP' },
    ]
  },
  {
    name: '计算',
    items: [
      { type: 'llm', label: 'LLM 生成', icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', meta: 'GPT' },
      { type: 'code', label: 'Python 脚本', icon: FileCode, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', meta: 'Py' },
      { type: 'condition', label: '路由 / 条件判断', icon: GitBranch, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
      { type: 'transform', label: '数据转换', icon: Sliders, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100', meta: 'JSON' },
    ]
  },
  {
    name: '数据',
    items: [
      { type: 'knowledge', label: '向量搜索', icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
      { type: 'http', label: 'HTTP 请求', icon: Globe, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
      { type: 'search', label: '文本搜索', icon: Search, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    ]
  },
  {
    name: '流程控制',
    items: [
      { type: 'delay', label: '延迟等待', icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', meta: '秒' },
      { type: 'loop', label: '循环节点', icon: RotateCcw, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', border: 'border-fuchsia-100' },
    ]
  },
  {
    name: '输出',
    items: [
      { type: 'end', label: '结束 / 输出', icon: Layers, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' },
    ]
  }
]

// Drag & Drop
const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  const type = event.dataTransfer?.getData('application/vueflow')
  if (!type) return

  // Determine initial data based on type
  let initialData: Record<string, unknown> = { label: '新节点' }
  if (type === 'llm') initialData = { label: 'LLM 生成', model: 'gpt-4-turbo', status: 'idle', temperature: 0.7, maxTokens: 4096 }
  if (type === 'start') initialData = { label: '对话输入', status: 'ready' }
  if (type === 'code') initialData = { label: 'Python 脚本', code: '', timeout: 30 }
  if (type === 'condition') initialData = { label: '路由 / 条件判断', expression: '' }
  if (type === 'knowledge') initialData = { label: '向量搜索', query: '', topK: 3 }
  if (type === 'http') initialData = { label: 'HTTP 请求', method: 'GET', url: '', headers: '{"Content-Type": "application/json"}', body: '{}' }
  if (type === 'end') initialData = { label: '结束 / 输出' }
  if (type === 'webhook') initialData = { label: 'Webhook', url: '', method: 'POST' }
  if (type === 'transform') initialData = { label: '数据转换', transformations: [] }
  if (type === 'search') initialData = { label: '文本搜索', query: '', caseSensitive: false }
  if (type === 'delay') initialData = { label: '延迟等待', seconds: 1 }
  if (type === 'loop') initialData = { label: '循环节点', count: 3, breakCondition: '' }

  const { left, top } = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const position = project({
    x: event.clientX - left,
    y: event.clientY - top,
  })

  const newNode: Node = {
    id: `node-${nodes.value.length + 1}`,
    type,
    position,
    data: initialData,
  }

  addNodes([newNode])
  saveStatus.value = 'unsaved'
}

const onDragStart = (event: DragEvent, nodeType: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }
}

// Selection
const onNodeClickHandler = (event: { node: Node }) => {
    selectedNode.value = event.node
}

// Connections
onConnect((params) => {
  addEdges([
      {
          ...params,
          type: 'custom',
          animated: true,
          style: { stroke: '#cbd5e1', strokeWidth: 2 }
      }
  ])
  saveStatus.value = 'unsaved'
})

// Actions
const saveWorkflow = () => {
    saveStatus.value = 'saving'
    // Mock save
    setTimeout(() => {
        saveStatus.value = 'saved'
        lastSaved.value = new Date().toLocaleTimeString()
    }, 800)
}

const deployWorkflow = async () => {
    const result = await workflowService.deployWorkflow({
        environment: 'production',
        version: '1.0.0',
        apiEnabled: true,
        webhooks: []
    })

    deployResult.value = result
    showDeployModal.value = true

    if (result.success) {
        // 添加成功动画
        setTimeout(() => {
            showDeployModal.value = false
        }, 3000)
    }
}

const toggleDebug = () => {
    debugMode.value = !debugMode.value
    if (debugMode.value) {
        workflowService.startDebugSession()
    } else {
        workflowService.stopDebugSession()
    }
}

const publishAPI = async () => {
    const result = await workflowService.publishAsAPI({
        endpoint: '/api/v1/workflow',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        authentication: 'api_key',
        rateLimit: 100
    })

    if (result.success) {
        showAPIModal.value = true
    }
}

const executeNode = async (nodeId: string) => {
    if (debugMode.value) {
        await workflowService.executeNode(nodeId)
    }
}

// 节点点击时执行（调试模式）
onNodeClick((event) => {
    selectedNode.value = event.node
    if (debugMode.value) {
        executeNode(event.node.id)
    }
})

// Initialize
onMounted(() => {
    // 创建一个完整的智能客服工作流示例
    nodes.value = [
      {
        id: 'start',
        type: 'start',
        position: { x: 50, y: 200 },
        data: {
          label: '用户消息',
          status: 'ready',
          example: '你好，我想退货'
        }
      },
      {
        id: 'classify',
        type: 'llm',
        position: { x: 300, y: 100 },
        data: {
          label: '意图识别',
          model: 'gpt-4-turbo',
          status: 'idle',
          temperature: 0.3,
          maxTokens: 256,
          systemPrompt: '你是一个客服意图分类助手。请将用户消息分类为：退货、投诉、咨询、售后、其他。只返回分类结果。',
          exampleOutput: '退货'
        }
      },
      {
        id: 'search-kb',
        type: 'knowledge',
        position: { x: 600, y: 50 },
        data: {
          label: '查询知识库',
          query: '退货政策',
          topK: 3,
          exampleResult: [
            '7天无理由退货',
            '需要保留包装',
            '非质量问题买家承担运费'
          ]
        }
      },
      {
        id: 'check-order',
        type: 'http',
        position: { x: 600, y: 200 },
        data: {
          label: '查询订单',
          method: 'GET',
          url: 'https://api.example.com/orders/{order_id}',
          headers: '{"Authorization": "Bearer {api_key}"}',
          exampleResponse: {
            status: 'found',
            order: {
              id: 'ORD123456',
              status: '已发货',
              date: '2024-01-15'
            }
          }
        }
      },
      {
        id: 'condition',
        type: 'condition',
        position: { x: 900, y: 100 },
        data: {
          label: '判断订单状态',
          expression: 'order.status === "已完成"',
          description: '根据订单状态路由到不同处理流程'
        }
      },
      {
        id: 'refund-process',
        type: 'code',
        position: { x: 1200, y: 50 },
        data: {
          label: '处理退款',
          code: `# 处理退款逻辑
order_id = input.get('order_id')
refund_amount = input.get('amount')

# 计算退款
if refund_amount > 100:
    require_approval = True
else:
    require_approval = False

return {
    'order_id': order_id,
    'refund_amount': refund_amount,
    'require_approval': require_approval,
    'status': 'processed'
}`,
          timeout: 30,
          exampleResult: {
            order_id: 'ORD123456',
            refund_amount: 299,
            require_approval: True,
            status: 'processed'
          }
        }
      },
      {
        id: 'generate-reply',
        type: 'llm',
        position: { x: 1200, y: 200 },
        data: {
          label: '生成回复',
          model: 'gpt-4-turbo',
          status: 'idle',
          temperature: 0.8,
          maxTokens: 512,
          systemPrompt: '你是一个专业的客服助手。根据用户提供的信息和知识库内容，生成友好、专业的回复。',
          exampleOutput: '您好，关于您的退货申请，根据我们的政策，7天内可以无理由退货。由于您的订单已完成，我们需要您保持商品包装完整。请提供订单号，我们将为您处理。'
        }
      },
      {
        id: 'delay-1s',
        type: 'delay',
        position: { x: 1500, y: 125 },
        data: {
          label: '延迟1秒',
          seconds: 1,
          description: '模拟API调用延迟'
        }
      },
      {
        id: 'end',
        type: 'end',
        position: { x: 1750, y: 200 },
        data: {
          label: '返回结果',
          output: {
            message: '您好，关于您的退货申请，我们的客服人员会在24小时内联系您。',
            status: 'pending',
            ticketId: 'TKT789012'
          }
        }
      }
    ]

    edges.value = [
      { id: 'e-start-classify', source: 'start', target: 'classify', type: 'custom', animated: true, style: { stroke: '#cbd5e1', strokeWidth: 2 } },
      { id: 'e-classify-search', source: 'classify', target: 'search-kb', type: 'custom', animated: true, style: { stroke: '#cbd5e1', strokeWidth: 2 }, label: '退货/售后' },
      { id: 'e-classify-order', source: 'classify', target: 'check-order', type: 'custom', animated: true, style: { stroke: '#cbd5e1', strokeWidth: 2 }, label: '查询' },
      { id: 'e-search-condition', source: 'search-kb', target: 'condition', type: 'custom', animated: true, style: { stroke: '#cbd5e1', strokeWidth: 2 } },
      { id: 'e-order-condition', source: 'check-order', target: 'condition', type: 'custom', animated: true, style: { stroke: '#cbd5e1', strokeWidth: 2 } },
      { id: 'e-condition-true', source: 'condition', target: 'refund-process', type: 'custom', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, label: '是' },
      { id: 'e-condition-false', source: 'condition', target: 'generate-reply', type: 'custom', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 }, label: '否' },
      { id: 'e-refund-reply', source: 'refund-process', target: 'generate-reply', type: 'custom', animated: true, style: { stroke: '#cbd5e1', strokeWidth: 2 } },
      { id: 'e-reply-delay', source: 'generate-reply', target: 'delay-1s', type: 'custom', animated: true, style: { stroke: '#cbd5e1', strokeWidth: 2 } },
      { id: 'e-delay-end', source: 'delay-1s', target: 'end', type: 'custom', animated: true, style: { stroke: '#cbd5e1', strokeWidth: 2 } }
    ]

    // 加载到服务
    workflowService.loadWorkflow(nodes.value, edges.value)

    // 自动保存
    saveStatus.value = 'saved'
    lastSaved.value = new Date().toLocaleTimeString()
})

// 监听节点和边的变化，同步到服务
watch([nodes, edges], () => {
    workflowService.loadWorkflow(nodes.value, edges.value)
    saveStatus.value = 'unsaved'
}, { deep: true })
</script>

<template>
  <div class="flex h-screen w-full flex-col bg-app font-ui text-text-main overflow-hidden">

    <!-- Header -->
    <WorkflowHeader
        :save-status="saveStatus"
        :last-saved="lastSaved"
        @save="saveWorkflow"
        @deploy="deployWorkflow"
        @debug="toggleDebug"
        @publish="publishAPI"
    />

    <div class="flex flex-1 overflow-hidden relative flex flex-col">

        <!-- Demo Panel - 可折叠 -->
        <Transition name="slide-down">
          <div v-if="showDemo" class="p-4 border-b border-light bg-slate-50/50">
            <WorkflowDemo />
          </div>
        </Transition>

        <!-- Toggle Demo Button -->
        <button
          @click="showDemo = !showDemo"
          class="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 px-3 py-1.5 bg-white border border-light rounded-full shadow-md hover:shadow-lg hover:border-indigo-200 transition-all text-[10px] font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5"
        >
          <span>{{ showDemo ? '隐藏' : '显示' }}案例演示</span>
        </button>

        <!-- Sidebar -->
        <WorkflowSidebar
            :node-categories="nodeCategories"
            v-model:search-query="searchQuery"
            @drag-start="onDragStart"
        />

        <!-- Main Canvas -->
        <main class="relative flex-1 bg-app overflow-hidden" @dragover="onDragOver" @drop="onDrop">

            <!-- Floating Controls -->
            <div class="absolute top-4 left-4 flex flex-col gap-2 z-30">
                <div class="flex flex-col rounded-md bg-white border border-light shadow-sm">
                    <button class="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-md border-b border-light" title="选择">
                        <MousePointer2 :size="16" />
                    </button>
                    <button class="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-b border-light" title="平移">
                        <Hand :size="16" />
                    </button>
                    <button class="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-b-md" title="注释">
                        <MessageCircle :size="16" />
                    </button>
                </div>
            </div>

             <div class="absolute top-4 right-4 flex gap-2 z-30">
                <div class="px-2 py-1 rounded bg-white border border-light shadow-sm flex items-center gap-2">
                    <span class="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                    <span class="text-[10px] font-medium text-slate-600">只读模式</span>
                </div>
            </div>

            <VueFlow
                v-model:nodes="nodes"
                v-model:edges="edges"
                @node-click="onNodeClickHandler"
                :fit-view-on-init="true"
                :default-edge-options="{ animated: true }"
                class="vue-flow-container"
            >
                <Background pattern-color="#cbd5e1" :gap="24" :size="1" />
                <Controls :show-interactive="false" style="display: none;" /> <!-- Hiding default controls -->

                <template #node-llm="props"><LlmNode v-bind="props" /></template>
                <template #node-knowledge="props"><KnowledgeNode v-bind="props" /></template>
                <template #node-start="props"><StartNode v-bind="props" /></template>
                <template #node-end="props"><EndNode v-bind="props" /></template>
                <template #node-condition="props"><ConditionNode v-bind="props" /></template>
                <template #node-code="props"><CodeNode v-bind="props" /></template>
                <template #node-http="props"><HttpRequestNode v-bind="props" /></template>

                <template #edge-custom="props"><CustomAnimatedEdge v-bind="props" /></template>
            </VueFlow>
        </main>

        <!-- Inspector -->
        <WorkflowInspector v-model:selected-node="selectedNode" />

    </div>

    <!-- Debug Panel -->
    <DebugPanel :debug-mode="debugMode" @toggle="toggleDebug" @execute-node="executeNode" />

    <!-- Deploy Modal -->
    <Transition name="scale">
      <div
        v-if="showDeployModal && deployResult"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
        @click.self="showDeployModal = false"
      >
        <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
          <div class="text-center">
            <div
              class="h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              :class="deployResult.success ? 'bg-emerald-100' : 'bg-red-100'"
            >
              <component
                :is="deployResult.success ? CheckCircle : XCircle"
                :size="32"
                :class="deployResult.success ? 'text-emerald-600' : 'text-red-600'"
              />
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">
              {{ deployResult.success ? '部署成功！' : '部署失败' }}
            </h3>
            <p class="text-sm text-slate-600 mb-4">
              {{ deployResult.success ? '工作流已成功部署到生产环境' : deployResult.error }}
            </p>
            <div v-if="deployResult.success && deployResult.url" class="bg-slate-50 rounded-lg p-3 mb-4">
              <p class="text-[10px] text-slate-500 mb-1">API 端点</p>
              <p class="text-xs font-mono text-indigo-600 break-all">{{ deployResult.url }}</p>
            </div>
            <button
              @click="showDeployModal = false"
              class="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
/* Global overrides for VueFlow if needed */
.vue-flow__node {
    cursor: default;
}
.vue-flow__handle {
    border: none;
    background: transparent;
}
.vue-flow-container {
    height: 100% !important;
    width: 100% !important;
}
</style>
