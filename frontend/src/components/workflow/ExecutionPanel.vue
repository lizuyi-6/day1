<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { 
  Play, Square, ChevronUp, ChevronDown, Maximize2, Minimize2, 
  Terminal, FileText, FileOutput, Clock, CheckCircle, XCircle, 
  AlertCircle, Copy, Trash2, Download, Upload, Save, Zap
} from 'lucide-vue-next'
import type { Variable } from '@/types/variable'

export interface ExecutionLogEntry {
  id: string
  timestamp: number
  nodeId: string
  nodeName: string
  status: 'pending' | 'running' | 'success' | 'error'
  message?: string
  duration?: number
  input?: Record<string, any>
  output?: Record<string, any>
  error?: string
}

export interface TerminalLog {
  id: string
  timestamp: number
  type: 'info' | 'warn' | 'error' | 'success' | 'stream'
  nodeId?: string
  nodeName?: string
  message: string
  data?: any
}

const props = defineProps<{
  inputs: Variable[]
  isExecuting: boolean
  executionResult: any
  executionLogs: ExecutionLogEntry[]
  terminalLogs: TerminalLog[]
  executionTime?: number
}>()

const emit = defineEmits<{
  execute: [data: Record<string, any>]
  clearLogs: []
  clearTerminal: []
}>()

const activeTab = ref<'input' | 'output' | 'logs' | 'terminal'>('input')
const isExpanded = ref(true)
const isMaximized = ref(false)
const inputValues = ref<Record<string, any>>({})
const autoScroll = ref(true)
const logContainer = ref<HTMLElement | null>(null)

watch(() => props.inputs, (newInputs) => {
  const newValues: Record<string, any> = {}
  newInputs.forEach(input => {
    newValues[input.name] = input.defaultValue !== undefined ? input.defaultValue : ''
  })
  inputValues.value = newValues
}, { immediate: true })

watch(() => props.executionLogs.length, () => {
  if (autoScroll.value && logContainer.value) {
    nextTick(() => {
      logContainer.value?.scrollTo({
        top: logContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    })
  }
})

watch(() => props.isExecuting, (executing, prevExecuting) => {
  if (executing) {
    activeTab.value = 'logs'
  } else if (prevExecuting && !executing) {
    activeTab.value = 'output'
  }
})

const isValid = computed(() => {
  // 如果没有定义输入变量，始终可以执行（使用默认输入框）
  if (props.inputs.length === 0) {
    return true
  }
  return props.inputs.every(input => {
    if (input.required && !inputValues.value[input.name]) return false
    return true
  })
})

const defaultPrompt = ref('')

const executionSummary = computed(() => {
  if (!props.executionLogs || props.executionLogs.length === 0) return null
  const total = props.executionLogs.length

  // 过滤掉系统错误日志（用于调试节点错误不应导致整个执行被标记为失败）
  const nodeLogs = props.executionLogs.filter(log => log.nodeId !== 'system')

  const success = nodeLogs.filter(log => log.status === 'success').length
  const failed = nodeLogs.filter(log => log.status === 'error').length
  const running = nodeLogs.filter(log => log.status === 'running').length

  // 只有当节点执行失败时才标记为失败，忽略系统错误日志
  return { total, success, failed, running, status: failed > 0 ? 'failed' : running > 0 ? 'running' : 'success' }
})

// Extract final result from end node
const finalResult = computed(() => {
  if (!props.executionResult) return null

  // Handle ResponseUtil wrapped format
  const executionData = props.executionResult.success ? props.executionResult.data : props.executionResult

  // Find end node's output
  const endNodeKey = Object.keys(executionData).find(key => {
    const nodeData = executionData[key]
    return nodeData && typeof nodeData === 'object' && 'result' in nodeData
  })

  if (endNodeKey && executionData[endNodeKey]) {
    return executionData[endNodeKey].result
  }

  // Fallback: if no end node with result, return the first output
  const firstKey = Object.keys(executionData)[0]
  if (firstKey && executionData[firstKey]) {
    return executionData[firstKey]
  }

  return executionData
})

const formatDuration = (ms: number) => {
  if (!ms) return '0ms'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return Clock
    case 'running': return AlertCircle
    case 'success': return CheckCircle
    case 'error': return XCircle
    default: return AlertCircle
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'text-khaki'
    case 'running': return 'text-blue-500 animate-pulse'
    case 'success': return 'text-emerald-500'
    case 'error': return 'text-red-500'
    default: return 'text-khaki'
  }
}

const getTerminalColor = (type: string) => {
  switch (type) {
    case 'info': return 'text-blue-400'
    case 'warn': return 'text-yellow-400'
    case 'error': return 'text-red-400'
    case 'success': return 'text-emerald-400'
    case 'stream': return 'text-purple-400'
    default: return 'text-slate-400'
  }
}

const execute = () => {
  // 如果没有定义输入变量，使用默认的 prompt 输入
  if (props.inputs.length === 0) {
    emit('execute', { prompt: defaultPrompt.value || '你好' })
  } else {
    emit('execute', inputValues.value)
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}

const downloadJSON = () => {
  const dataStr = JSON.stringify(props.executionResult, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `workflow-output-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const copyTerminalLogs = () => {
  const text = props.terminalLogs.map(log => {
    const time = formatTime(log.timestamp)
    const node = log.nodeName ? `[${log.nodeName}]` : ''
    return `[${time}] ${node} ${log.type.toUpperCase()}: ${log.message}`
  }).join('\n')
  navigator.clipboard.writeText(text)
}

const getInputComponent = (input: Variable) => {
  switch (input.type) {
    case 'string': return 'textarea'
    case 'number': return 'number'
    case 'boolean': return 'checkbox'
    case 'object':
    case 'array': return 'textarea'
    default: return 'text'
  }
}
</script>

<template>
  <div 
    class="execution-panel fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#1e1711] border-t border-sand/30 shadow-2xl transition-all duration-300"
    :class="{ 'h-[60vh]': isMaximized, 'h-[320px]': isExpanded && !isMaximized, 'h-12': !isExpanded }"
  >
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between px-4 h-12 bg-sand/10 dark:bg-white/5 border-b border-sand/20 shrink-0">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1 bg-sand/20 dark:bg-white/10 rounded-lg p-1">
            <button
              v-for="tab in [{ key: 'input', label: '输入', icon: FileText }, { key: 'output', label: '输出', icon: FileOutput }, { key: 'logs', label: '日志', icon: Clock }, { key: 'terminal', label: '终端', icon: Terminal }]"
              :key="tab.key"
              @click="activeTab = tab.key as any"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all"
              :class="activeTab === tab.key ? 'bg-white dark:bg-[#1e1711] text-primary shadow-sm' : 'text-khaki hover:text-charcoal dark:hover:text-sand'"
            >
              <component :is="tab.icon" :size="14" />
              <span>{{ tab.label }}</span>
              <span v-if="tab.key === 'logs' && executionLogs.length > 0" class="px-1.5 py-0.5 rounded-full text-[10px] bg-primary/20 text-primary">
                {{ executionLogs.length }}
              </span>
            </button>
          </div>
          
          <div v-if="isExecuting" class="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span class="text-xs font-bold text-blue-600 dark:text-blue-400">执行中</span>
          </div>
          
          <div v-else-if="executionSummary" class="flex items-center gap-2 px-3 py-1 rounded-full"
               :class="executionSummary.status === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'">
            <component :is="getStatusIcon(executionSummary.status)" :size="14" 
                       :class="executionSummary.status === 'success' ? 'text-emerald-500' : 'text-red-500'" />
            <span class="text-xs font-bold" :class="executionSummary.status === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
              {{ executionSummary.status === 'success' ? '执行成功' : '执行失败' }}
            </span>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <button v-if="activeTab === 'input'" @click="execute" :disabled="!isValid || isExecuting"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  :class="isValid && !isExecuting ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'">
            <Play :size="14" />
            <span>运行</span>
          </button>
          
          <button v-if="activeTab === 'logs' && executionLogs.length > 0" @click="emit('clearLogs')"
                  class="p-1.5 rounded-lg text-khaki hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 :size="14" />
          </button>
          
          <button v-if="activeTab === 'terminal' && terminalLogs.length > 0" @click="emit('clearTerminal')"
                  class="p-1.5 rounded-lg text-khaki hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 :size="14" />
          </button>
          
          <div class="w-px h-4 bg-sand/30 dark:bg-white/10 mx-1"></div>
          
          <button @click="isMaximized = !isMaximized" class="p-1.5 rounded-lg text-khaki hover:text-primary hover:bg-sand/20 transition-colors">
            <Minimize2 v-if="isMaximized" :size="14" />
            <Maximize2 v-else :size="14" />
          </button>
          
          <button @click="isExpanded = !isExpanded" class="p-1.5 rounded-lg text-khaki hover:text-primary hover:bg-sand/20 transition-colors">
            <ChevronDown v-if="isExpanded" :size="14" />
            <ChevronUp v-else :size="14" />
          </button>
        </div>
      </div>
      
      <div v-if="isExpanded" class="flex-1 overflow-hidden">
        <div v-show="activeTab === 'input'" class="h-full overflow-y-auto p-4">
          <div v-if="inputs.length === 0" class="max-w-2xl mx-auto space-y-4">
            <div class="text-center mb-4">
              <p class="text-sm text-khaki">未定义输入变量，使用默认提示词输入</p>
              <p class="text-xs text-khaki/60 mt-1">提示词将直接传递给 LLM 节点</p>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-charcoal dark:text-sand">提示词 (Prompt)</label>
              <textarea 
                v-model="defaultPrompt" 
                rows="6"
                class="w-full px-3 py-2 text-sm bg-sand/10 dark:bg-white/5 border border-sand/30 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none resize-none text-charcoal dark:text-sand"
                placeholder="请输入您的问题或提示词..."
              ></textarea>
            </div>
          </div>
          
          <div v-else class="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div v-for="input in inputs" :key="input.name" class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-bold text-charcoal dark:text-sand">
                  {{ input.name }}
                  <span v-if="input.required" class="text-red-500 ml-1">*</span>
                </label>
                <span class="text-[10px] font-mono text-khaki bg-sand/20 dark:bg-white/10 px-2 py-0.5 rounded">{{ input.type }}</span>
              </div>
              
              <input v-if="getInputComponent(input) === 'text'" v-model="inputValues[input.name]" type="text"
                     class="w-full px-3 py-2 text-sm bg-sand/10 dark:bg-white/5 border border-sand/30 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-charcoal dark:text-sand"
                     :placeholder="input.description || '请输入' + input.name" />
              
              <textarea v-else-if="getInputComponent(input) === 'textarea'" v-model="inputValues[input.name]" rows="3"
                        class="w-full px-3 py-2 text-sm bg-sand/10 dark:bg-white/5 border border-sand/30 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none resize-none text-charcoal dark:text-sand"
                        :placeholder="input.description || '请输入' + input.name" />
              
              <input v-else-if="getInputComponent(input) === 'number'" v-model="inputValues[input.name]" type="number"
                     class="w-full px-3 py-2 text-sm bg-sand/10 dark:bg-white/5 border border-sand/30 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-charcoal dark:text-sand"
                     :placeholder="input.description || '请输入' + input.name" />
              
              <div v-else-if="getInputComponent(input) === 'checkbox'" class="flex items-center gap-2">
                <input v-model="inputValues[input.name]" type="checkbox"
                       class="w-4 h-4 text-primary border-sand/30 rounded focus:ring-primary" />
                <span class="text-sm text-khaki">{{ input.description || input.name }}</span>
              </div>
              
              <div v-if="input.description" class="text-[10px] text-khaki/70">{{ input.description }}</div>
            </div>
          </div>
        </div>
        
        <div v-show="activeTab === 'output'" class="h-full overflow-y-auto p-4">
          <div v-if="!finalResult" class="flex flex-col items-center justify-center h-full text-khaki/60">
            <FileOutput :size="48" class="mb-3 opacity-30" />
            <p class="text-sm">暂无输出结果</p>
            <p class="text-xs mt-1">执行工作流后查看输出</p>
          </div>

          <div v-else class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-sm font-bold text-charcoal dark:text-sand">最终结果</span>
                <span v-if="executionTime" class="text-xs text-khaki bg-sand/20 dark:bg-white/10 px-2 py-0.5 rounded-full">
                  耗时 {{ formatDuration(executionTime) }}
                </span>
              </div>
              <div class="flex gap-2">
                <button @click="copyToClipboard(JSON.stringify(finalResult, null, 2))"
                        class="flex items-center gap-1 px-2 py-1 text-xs text-khaki hover:text-primary hover:bg-sand/20 rounded transition-colors">
                  <Copy :size="12" />
                  复制
                </button>
                <button @click="downloadJSON"
                        class="flex items-center gap-1 px-2 py-1 text-xs text-khaki hover:text-primary hover:bg-sand/20 rounded transition-colors">
                  <Download :size="12" />
                  下载
                </button>
              </div>
            </div>

            <div class="bg-[#0d1117] rounded-lg p-4 overflow-auto max-h-[calc(60vh-120px)]">
              <pre class="text-xs text-emerald-400 font-mono whitespace-pre-wrap">{{ JSON.stringify(finalResult, null, 2) }}</pre>
            </div>
          </div>
        </div>
        
        <div v-show="activeTab === 'logs'" class="h-full overflow-y-auto" ref="logContainer">
          <div v-if="executionLogs.length === 0" class="flex flex-col items-center justify-center h-full text-khaki/60">
            <Clock :size="48" class="mb-3 opacity-30" />
            <p class="text-sm">暂无执行日志</p>
            <p class="text-xs mt-1">执行工作流后查看日志</p>
          </div>
          
          <div v-else class="divide-y divide-sand/10">
            <div v-for="log in executionLogs" :key="log.id"
                 class="flex items-start gap-3 px-4 py-3 hover:bg-sand/10 dark:hover:bg-white/5 transition-colors">
              <component :is="getStatusIcon(log.status)" :size="16" :class="getStatusColor(log.status)" />
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-bold text-sm text-charcoal dark:text-sand truncate">{{ log.nodeName }}</span>
                  <span v-if="log.duration" class="text-[10px] text-khaki bg-sand/20 dark:bg-white/10 px-1.5 py-0.5 rounded">
                    {{ formatDuration(log.duration) }}
                  </span>
                </div>
                <div class="flex items-center gap-2 text-xs text-khaki/70">
                  <span>{{ formatTime(log.timestamp) }}</span>
                  <span v-if="log.message" class="truncate">{{ log.message }}</span>
                </div>
                <div v-if="log.error" class="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                  {{ log.error }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-show="activeTab === 'terminal'" class="h-full bg-[#0d1117] flex flex-col">
          <div class="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
            <div class="flex items-center gap-2 text-xs text-[#8b949e]">
              <Terminal :size="14" />
              <span>终端输出</span>
            </div>
            <div class="flex items-center gap-2">
              <label class="flex items-center gap-1.5 text-[10px] text-[#8b949e] cursor-pointer">
                <input v-model="autoScroll" type="checkbox" class="w-3 h-3" />
                自动滚动
              </label>
              <button @click="copyTerminalLogs" class="p-1 text-[#8b949e] hover:text-[#c9d1d9] transition-colors">
                <Copy :size="12" />
              </button>
            </div>
          </div>
          
          <div class="flex-1 overflow-y-auto p-3 font-mono text-xs custom-scrollbar">
            <div v-if="terminalLogs.length === 0" class="flex flex-col items-center justify-center h-full text-[#484f58]">
              <Terminal :size="32" class="mb-2 opacity-30" />
              <p>暂无终端输出</p>
            </div>
            
            <div v-else class="space-y-1">
              <div v-for="log in terminalLogs" :key="log.id" class="flex items-start gap-2 py-1">
                <span class="text-[#484f58] shrink-0">{{ formatTime(log.timestamp) }}</span>
                <span v-if="log.nodeName" class="text-[#7ee787] shrink-0">[{{ log.nodeName }}]</span>
                <span :class="getTerminalColor(log.type)" class="uppercase shrink-0">{{ log.type }}</span>
                <span class="text-[#c9d1d9] break-all">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.execution-panel {
  font-family: var(--font-ui);
}

pre {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.5;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #484f58;
}
</style>
