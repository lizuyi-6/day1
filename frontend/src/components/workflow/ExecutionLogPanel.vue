<script setup lang="ts">
import { ref, computed } from 'vue'
import { Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-vue-next'

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

const props = defineProps<{
  logs: ExecutionLogEntry[]
  isExecuting: boolean
}>()

const emit = defineEmits<{
  clear: []
}>()

const expandedLogs = ref<Set<string>>(new Set())

const toggleExpand = (logId: string) => {
  if (expandedLogs.value.has(logId)) {
    expandedLogs.value.delete(logId)
  } else {
    expandedLogs.value.add(logId)
  }
}

const isExpanded = (logId: string) => expandedLogs.value.has(logId)

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

const getStatusIcon = (status: ExecutionLogEntry['status']) => {
  switch (status) {
    case 'pending':
      return Clock
    case 'running':
      return AlertCircle
    case 'success':
      return CheckCircle
    case 'error':
      return XCircle
  }
}

const getStatusColor = (status: ExecutionLogEntry['status']) => {
  switch (status) {
    case 'pending':
      return 'text-gray-400'
    case 'running':
      return 'text-blue-500 animate-spin'
    case 'success':
      return 'text-emerald-500'
    case 'error':
      return 'text-red-500'
  }
}

const getStatusBg = (status: ExecutionLogEntry['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-gray-100 dark:bg-gray-800'
    case 'running':
      return 'bg-blue-100 dark:bg-blue-900/20'
    case 'success':
      return 'bg-emerald-100 dark:bg-emerald-900/20'
    case 'error':
      return 'bg-red-100 dark:bg-red-900/20'
  }
}
</script>

<template>
  <div class="execution-log-panel h-full flex flex-col bg-white dark:bg-[#1e1711] border-l border-sand/20">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-sand/20">
      <div class="flex items-center gap-2">
        <h3 class="font-bold text-sm text-charcoal dark:text-white">执行日志</h3>
        <span v-if="logs.length > 0" class="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
          {{ logs.length }}
        </span>
      </div>
      <button
        v-if="logs.length > 0 && !isExecuting"
        @click="emit('clear')"
        class="text-xs text-khaki hover:text-primary transition-colors"
      >
        清空
      </button>
    </div>

    <!-- Logs List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="logs.length === 0" class="flex flex-col items-center justify-center h-full text-khaki/60">
        <Clock :size="48" class="mb-2 opacity-50" />
        <p class="text-sm">暂无执行日志</p>
      </div>

      <div v-else class="divide-y divide-sand/10">
        <div
          v-for="log in logs"
          :key="log.id"
          class="log-entry"
          :class="[getStatusBg(log.status), { 'opacity-60': log.status === 'pending' }]"
        >
          <!-- Log Summary -->
          <div
            class="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-black/5 transition-colors"
            @click="toggleExpand(log.id)"
          >
            <component
              :is="getStatusIcon(log.status)"
              :size="18"
              :class="getStatusColor(log.status)"
            />

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-sm text-charcoal dark:text-white truncate">
                  {{ log.nodeName }}
                </span>
                <span v-if="log.duration" class="text-xs text-khaki whitespace-nowrap">
                  {{ formatDuration(log.duration) }}
                </span>
              </div>

              <div class="flex items-center gap-2 text-xs text-khaki/80">
                <span>{{ formatTime(log.timestamp) }}</span>
                <span v-if="log.message" class="truncate">{{ log.message }}</span>
              </div>

              <div v-if="log.status === 'error' && log.error" class="mt-2 text-xs text-red-600 dark:text-red-400">
                {{ log.error }}
              </div>
            </div>

            <button class="text-khaki hover:text-primary transition-colors">
              <ChevronDown v-if="!isExpanded(log.id)" :size="16" />
              <ChevronUp v-else :size="16" />
            </button>
          </div>

          <!-- Expanded Details -->
          <div v-if="isExpanded(log.id)" class="px-4 pb-3 border-t border-black/5">
            <!-- Input -->
            <div v-if="log.input" class="mt-3">
              <div class="text-xs font-bold text-khaki mb-1">输入</div>
              <pre class="text-xs bg-black/5 dark:bg-white/5 p-2 rounded overflow-x-auto">{{ JSON.stringify(log.input, null, 2) }}</pre>
            </div>

            <!-- Output -->
            <div v-if="log.output" class="mt-3">
              <div class="text-xs font-bold text-khaki mb-1">输出</div>
              <pre class="text-xs bg-black/5 dark:bg-white/5 p-2 rounded overflow-x-auto">{{ JSON.stringify(log.output, null, 2) }}</pre>
            </div>

            <!-- Error Details -->
            <div v-if="log.error" class="mt-3">
              <div class="text-xs font-bold text-red-600 dark:text-red-400 mb-1">错误详情</div>
              <pre class="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-2 rounded overflow-x-auto">{{ log.error }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Status -->
    <div v-if="isExecuting" class="px-4 py-2 border-t border-sand/20 bg-blue-50 dark:bg-blue-900/20">
      <div class="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
        <AlertCircle :size="14" class="animate-spin" />
        <span>正在执行...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.execution-log-panel {
  font-family: var(--font-ui);
}

.log-entry {
  transition: all 0.2s ease;
}

pre {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
  line-height: 1.5;
}
</style>
