<script setup lang="ts">
import { ref, computed } from 'vue'
import { Download, Copy, CheckCircle, XCircle, AlertCircle, FileText, BarChart3, Clock, Zap } from 'lucide-vue-next'

const props = defineProps<{
  result: any
  logs: any[]
  executionTime?: number
}>()

const emit = defineEmits<{
  close: []
}>()

const activeTab = ref<'summary' | 'output' | 'logs'>('summary')

const executionSummary = computed(() => {
  if (!props.logs || props.logs.length === 0) return null

  const total = props.logs.length
  const success = props.logs.filter((log: any) => log.status === 'success').length
  const failed = props.logs.filter((log: any) => log.status === 'error').length
  const running = props.logs.filter((log: any) => log.status === 'running').length
  const pending = props.logs.filter((log: any) => log.status === 'pending').length

  const totalDuration = props.logs.reduce((sum: number, log: any) => sum + (log.duration || 0), 0)
  const avgDuration = totalDuration > 0 ? totalDuration / total : 0

  return {
    total,
    success,
    failed,
    running,
    pending,
    totalDuration,
    avgDuration,
    status: failed > 0 ? 'failed' : running > 0 ? 'running' : 'success'
  }
})

const formatDuration = (ms: number) => {
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

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  alert('已复制到剪贴板')
}

const downloadJSON = () => {
  const dataStr = JSON.stringify(props.result, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `workflow-output-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const downloadCSV = () => {
  if (!props.result || typeof props.result !== 'object') {
    alert('无法导出为 CSV：结果不是有效的对象')
    return
  }

  const flatData = flattenObject(props.result)
  const headers = Object.keys(flatData).join(',')
  const values = Object.values(flatData).map(v => `"${v}"`).join(',')
  const csv = `${headers}\n${values}`

  const dataBlob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `workflow-output-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
  const result: Record<string, any> = {}

  for (const key in obj) {
    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey))
    } else if (Array.isArray(value)) {
      result[newKey] = JSON.stringify(value)
    } else {
      result[newKey] = value
    }
  }

  return result
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return CheckCircle
    case 'failed':
      return XCircle
    case 'running':
      return AlertCircle
    default:
      return AlertCircle
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    case 'failed':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'running':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200'
  }
}
</script>

<template>
  <div class="output-panel flex flex-col h-full bg-white border-l border-slate-200">
    <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
      <div class="flex items-center gap-2">
        <FileText :size="16" class="text-emerald-600" />
        <h3 class="font-bold text-sm text-slate-800">输出面板</h3>
      </div>
      <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 transition-colors">
        ✕
      </button>
    </div>

    <div class="flex border-b border-slate-200">
      <button
        @click="activeTab = 'summary'"
        class="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
        :class="activeTab === 'summary' ? 'border-emerald-600 text-emerald-900' : 'border-transparent text-slate-400 hover:text-slate-600'"
      >
        摘要
      </button>
      <button
        @click="activeTab = 'output'"
        class="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
        :class="activeTab === 'output' ? 'border-emerald-600 text-emerald-900' : 'border-transparent text-slate-400 hover:text-slate-600'"
      >
        输出
      </button>
      <button
        @click="activeTab = 'logs'"
        class="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
        :class="activeTab === 'logs' ? 'border-emerald-600 text-emerald-900' : 'border-transparent text-slate-400 hover:text-slate-600'"
      >
        日志
      </button>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-if="activeTab === 'summary'" class="p-6 space-y-6">
        <div v-if="!executionSummary" class="text-center py-12 text-slate-400">
          <AlertCircle :size="48" class="mb-4 opacity-50" />
          <p class="text-sm">暂无执行数据</p>
        </div>

        <div v-else class="space-y-6">
          <div class="flex items-center justify-center">
            <component
              :is="getStatusIcon(executionSummary.status)"
              :size="64"
              :class="getStatusColor(executionSummary.status)"
              class="rounded-full p-4 border-2"
            />
          </div>

          <div class="text-center">
            <h2 class="text-2xl font-bold text-slate-800">
              {{ executionSummary.status === 'success' ? '执行成功' : executionSummary.status === 'failed' ? '执行失败' : '执行中' }}
            </h2>
            <p v-if="executionTime" class="text-sm text-slate-600 mt-2">
              总耗时: {{ formatDuration(executionTime) }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <CheckCircle :size="20" class="text-emerald-600" />
                <span class="text-sm font-bold text-emerald-900">成功节点</span>
              </div>
              <p class="text-3xl font-bold text-emerald-700">{{ executionSummary.success }}</p>
            </div>

            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <XCircle :size="20" class="text-red-600" />
                <span class="text-sm font-bold text-red-900">失败节点</span>
              </div>
              <p class="text-3xl font-bold text-red-700">{{ executionSummary.failed }}</p>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <Clock :size="20" class="text-blue-600" />
                <span class="text-sm font-bold text-blue-900">平均耗时</span>
              </div>
              <p class="text-3xl font-bold text-blue-700">{{ formatDuration(executionSummary.avgDuration) }}</p>
            </div>

            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <Zap :size="20" class="text-purple-600" />
                <span class="text-sm font-bold text-purple-900">总节点数</span>
              </div>
              <p class="text-3xl font-bold text-purple-700">{{ executionSummary.total }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'output'" class="p-4">
        <div v-if="!result" class="text-center py-12 text-slate-400">
          <FileText :size="48" class="mb-4 opacity-50" />
          <p class="text-sm">暂无输出结果</p>
        </div>

        <div v-else class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-800">最终输出</h3>
            <div class="flex gap-2">
              <button
                @click="copyToClipboard(JSON.stringify(result, null, 2))"
                class="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
              >
                <Copy :size="12" />
                复制
              </button>
              <button
                @click="downloadJSON"
                class="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
              >
                <Download :size="12" />
                JSON
              </button>
              <button
                @click="downloadCSV"
                class="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
              >
                <Download :size="12" />
                CSV
              </button>
            </div>
          </div>

          <div class="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <pre class="text-xs text-emerald-400 font-mono">{{ JSON.stringify(result, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'logs'" class="divide-y divide-slate-100">
        <div v-if="logs.length === 0" class="text-center py-12 text-slate-400">
          <Clock :size="48" class="mb-4 opacity-50" />
          <p class="text-sm">暂无执行日志</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="(log, index) in logs"
            :key="index"
            class="px-4 py-3 hover:bg-slate-50 transition-colors"
          >
            <div class="flex items-start gap-3">
              <component
                :is="getStatusIcon(log.status)"
                :size="18"
                :class="getStatusColor(log.status)"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-bold text-sm text-slate-800">{{ log.nodeName }}</span>
                  <span v-if="log.duration" class="text-xs text-slate-600">
                    {{ formatDuration(log.duration) }}
                  </span>
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-500">
                  <span>{{ formatTime(log.timestamp) }}</span>
                  <span v-if="log.message" class="truncate">{{ log.message }}</span>
                </div>
                <div v-if="log.error" class="mt-2 text-xs text-red-600">
                  {{ log.error }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.output-panel {
  font-family: var(--font-ui);
}

pre {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.5;
}
</style>
