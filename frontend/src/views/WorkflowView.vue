<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'
import {
  MousePointer2, Hand, MessageCircle, MessageSquare, Sparkles, FileCode, GitBranch,
  Database, Globe, Layers, Search, Clock, RotateCcw, Sliders, CheckCircle, XCircle,
  LayoutGrid, Workflow, User, Save, Bug, Rocket, Code
} from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import Logo from '@/components/layout/Logo.vue'

// Components
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

const { onConnect, addEdges, addNodes, project, onNodeClick, onPaneReady, fitView } = useVueFlow()
const route = useRoute()

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
const searchQuery = ref('')
const selectedNode = ref<Node | null>(null)
const saveStatus = ref('saved') // saved, saving, unsaved
const lastSaved = ref<string | null>(null)
const debugMode = ref(false)
const showDemo = ref(false)
const showDeployModal = ref(false)
const showAPIModal = ref(false)
const deployResult = ref<{ success: boolean; url?: string; error?: string } | null>(null)

const isDraggingOver = ref(false)

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

  // 获取 VueFlow 画布的位置信息
  const position = project({
    x: event.clientX,
    y: event.clientY
  })

  console.log('Drop detected:', type, 'at', position)

  // 创建新节点
  const newNode: Node = {
    id: `${type}-${Date.now()}`,
    type: type,
    position: {
      x: position.x,
      y: position.y
    },
    data: {
      label: `${type} node` // Simple default, can be enhanced based on type
    }
  }

  addNodes([newNode])
  console.log('Node added successfully:', newNode)
}

const onDragStart = (event: DragEvent, nodeType: string) => {
  console.log('Drag started:', nodeType)
}

// 导航链接
const navLinks = [
  { name: '工作台', path: '/dashboard', icon: LayoutGrid },
  { name: '工作流', path: '/workflow', icon: Workflow },
  { name: '对话', path: '/chat', icon: MessageSquare },
  { name: '知识库', path: '/knowledge', icon: Database }
]

// 节点分类
const nodeCategories = [
  {
    name: '基础',
    items: [
      { type: 'start', label: '开始', icon: FileCode, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
      { type: 'end', label: '结束', icon: FileCode, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' }
    ]
  },
  {
    name: 'AI',
    items: [
      { type: 'llm', label: 'LLM', icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', meta: 'GPT-4' }
    ]
  },
  {
    name: '逻辑',
    items: [
      { type: 'condition', label: '条件', icon: GitBranch, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
      { type: 'code', label: '代码', icon: Code, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' }
    ]
  },
  {
    name: '数据',
    items: [
      { type: 'knowledge', label: '知识库', icon: Database, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
      { type: 'http', label: 'HTTP请求', icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-100', border: 'border-cyan-200' }
    ]
  }
]

// 其他函数
const toggleDebug = () => {
  debugMode.value = !debugMode.value
}

const saveWorkflow = () => {
  saveStatus.value = 'saving'
  // 模拟保存
  setTimeout(() => {
    saveStatus.value = 'saved'
    lastSaved.value = new Date().toLocaleTimeString()
  }, 1000)
}

const deployWorkflow = () => {
  showDeployModal.value = true
  // 模拟部署
  setTimeout(() => {
    deployResult.value = {
      success: true,
      url: 'https://api.example.com/workflow/abc123'
    }
  }, 2000)
}

const onNodeClickHandler = () => {
  // 节点点击处理
}

const executeNode = (nodeId: string) => {
  console.log('Executing node:', nodeId)
}

// ...

// Initialize when Vue Flow is ready
onPaneReady(({ fitView }) => {
    // 创建一个简单的示例工作流
    nodes.value = [
        {
            id: '1',
            type: 'start',
            position: { x: 100, y: 100 },
            data: { label: '开始' }
        },
        {
            id: '2',
            type: 'llm',
            position: { x: 400, y: 100 },
            data: { label: 'LLM 处理' }
        },
        {
            id: '3',
            type: 'end',
            position: { x: 700, y: 100 },
            data: { label: '结束' }
        }
    ]

    edges.value = [
        {
            id: 'e1-2',
            source: '1',
            target: '2',
            animated: true
        },
        {
            id: 'e2-3',
            source: '2',
            target: '3',
            animated: true
        }
    ]

    // 加载到服务
    workflowService.loadWorkflow(nodes.value, edges.value)

    // 自动保存
    saveStatus.value = 'saved'
    lastSaved.value = new Date().toLocaleTimeString()

    // 适配视图
    window.requestAnimationFrame(() => {
      fitView()
    })
})

// 监听节点和边的变化，标记为未保存
watch([nodes, edges], () => {
  if (saveStatus.value !== 'saving') {
    saveStatus.value = 'unsaved'
  }
}, { deep: true })

// 连接处理
onConnect((params) => {
  addEdges([params])
})

</script>

<template>
  <div class="flex h-screen w-full flex-col bg-background-light dark:bg-background-dark font-sans overflow-hidden">

    <!-- Internal App Header (Merged with Workflow Actions) -->
    <header class="h-16 px-6 border-b border-sand/30 dark:border-white/10 bg-white/80 dark:bg-[#1e1711]/80 backdrop-blur-md flex items-center justify-between z-40 shrink-0">
      <div class="flex items-center gap-12">
        <Logo class="scale-90 origin-left" />
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
      <div class="flex items-center gap-3">
         <!-- Save Indicator -->
         <div class="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-sand/20 dark:bg-white/5 border border-sand/30 dark:border-white/10">
              <div class="size-1.5 rounded-full transition-colors duration-300"
                   :class="saveStatus === 'saved' ? 'bg-emerald-500' : saveStatus === 'saving' ? 'bg-primary' : 'bg-charcoal/30'"></div>
              <span class="text-[10px] font-medium text-charcoal/60 dark:text-sand/60 w-12 text-center">
                  {{ saveStatus === 'saved' ? '已保存' : saveStatus === 'saving' ? '保存中' : '未保存' }}
              </span>
          </div>

          <div class="h-6 w-px bg-sand/30 dark:bg-white/10 mx-1"></div>

          <button @click="saveWorkflow"
                  class="flex items-center justify-center p-2 rounded-full text-charcoal/60 hover:text-primary hover:bg-sand/20 transition-colors" title="保存">
              <Save :size="18" />
          </button>

          <button
            @click="toggleDebug"
            class="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all border"
            :class="debugMode ? 'bg-primary/10 text-primary border-primary/20' : 'bg-transparent text-charcoal/60 hover:text-primary border-transparent hover:bg-sand/20'"
          >
              <Bug :size="16" />
              <span class="hidden sm:inline">{{ debugMode ? '调试中' : '调试' }}</span>
          </button>

          <button
            @click="deployWorkflow"
            class="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white shadow-md hover:shadow-lg hover:bg-primary/90 transition-all text-xs font-bold active:scale-95"
          >
              <Rocket :size="16" />
              <span class="hidden sm:inline">部署</span>
          </button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden relative flex flex-col">

        <!-- Demo Panel -->
        <Transition name="slide-down">
          <div v-if="showDemo" class="absolute top-0 left-0 right-0 z-30 p-2 pointer-events-none">
             <div class="bg-white/90 dark:bg-[#1e1711]/90 backdrop-blur-md rounded-xl shadow-lg border border-sand/30 max-w-4xl mx-auto p-4 pointer-events-auto">
                 <WorkflowDemo />
                 <button
                  @click="showDemo = false"
                  class="absolute top-2 right-2 p-1 text-khaki hover:text-charcoal"
                >
                  <XCircle :size="16" />
                </button>
             </div>
          </div>
        </Transition>

        <button
          v-if="!showDemo"
          @click="showDemo = true"
          class="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 bg-white/80 dark:bg-[#1e1711]/80 border border-sand/30 rounded-full shadow-md hover:shadow-lg transition-all text-xs font-bold text-khaki hover:text-primary flex items-center gap-1.5 backdrop-blur-sm"
        >
          <Sparkles :size="14" />
          <span>显示演示</span>
        </button>

        <!-- Sidebar (Absolute positioned for now or Flex) -->
        <!-- We use absolute to float over canvas or flex row -->
        <!-- Keeping Flex Layout as per original -->
        <div class="flex flex-1 relative overflow-hidden">
             <!-- Sidebar -->
            <WorkflowSidebar
                :node-categories="nodeCategories"
                v-model:search-query="searchQuery"
                @drag-start="onDragStart"
                class="z-10 shrink-0"
            />

            <!-- Main Canvas -->
            <main class="relative flex-1 bg-background-light dark:bg-background-dark overflow-hidden h-full w-full">

                <!-- Floating Controls -->
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
                    </div>
                </div>

                <VueFlow
                    v-model:nodes="nodes"
                    v-model:edges="edges"
                    @node-click="onNodeClickHandler"
                    @dragover="onDragOver"
                    @dragleave="onDragLeave"
                    @drop="onDrop"
                    :fit-view-on-init="true"
                    :default-edge-options="{ animated: true }"
                    class="vue-flow-container transition-colors duration-300"
                    :class="{ 'bg-primary/5': isDraggingOver }"
                >
                    <Background pattern-color="#e5e0dc" :gap="24" :size="1" />
                    <Controls :show-interactive="false" style="display: none;" />

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

    </div>

    <!-- Debug Panel -->
    <DebugPanel :debug-mode="debugMode" @toggle="toggleDebug" @execute-node="executeNode" />

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
  </div>
</template>

<style>
/* Global overrides for VueFlow */
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
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
