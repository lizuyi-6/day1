<script setup lang="ts">
import { ref, computed } from 'vue'
import { History, Clock, CheckCircle, XCircle, Trash2, Eye, Calendar, Timer, List } from 'lucide-vue-next'

export interface ExecutionHistoryRecord {
  id: string
  timestamp: number
  workflowId: string
  duration: number
  status: 'success' | 'error'
  nodeCount: number
  logs: any[]
  result?: any
  error?: string
}

const props = defineProps<{
  history: ExecutionHistoryRecord[]
}>()

const emit = defineEmits<{
  view: [record: ExecutionHistoryRecord]
  clear: []
  delete: [id: string]
}>()

const expandedRecords = ref<Set<string>>(new Set())

const toggleExpand = (recordId: string) => {
  if (expandedRecords.value.has(recordId)) {
    expandedRecords.value.delete(recordId)
  } else {
    expandedRecords.value.add(recordId)
  }
}

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const formatRelativeTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`

  return formatDateTime(timestamp)
}

const groupedHistory = computed(() => {
  const groups: Record<string, ExecutionHistoryRecord[]> = {}

  if (props.history && props.history.length > 0) {
    props.history.forEach(record => {
      const date = new Date(record.timestamp)
      const dateKey = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(record)
    })
  }

  return groups
})
</script>

<template>
  <div class="execution-history-panel h-full flex flex-col bg-white dark:bg-[#1e1711]">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-sand/20">
      <div class="flex items-center gap-2">
        <History :size="18" class="text-primary" />
        <h3 class="font-bold text-sm text-charcoal dark:text-white">执行历史</h3>
        <span v-if="history.length > 0" class="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
          {{ history.length }}
        </span>
      </div>
      <button
        v-if="history.length > 0"
        @click="emit('clear')"
        class="text-xs text-khaki hover:text-red-500 transition-colors"
        title="清空历史"
      >
        <Trash2 :size="14" />
      </button>
    </div>

    <!-- History List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="history.length === 0" class="flex flex-col items-center justify-center h-full text-khaki/60">
        <History :size="48" class="mb-2 opacity-50" />
        <p class="text-sm">暂无执行历史</p>
      </div>

      <div v-else class="divide-y divide-sand/10">
        <div v-for="(records, date) in groupedHistory" :key="date">
          <!-- Date Header -->
          <div class="px-4 py-2 bg-sand/10 dark:bg-white/5">
            <span class="text-xs font-bold text-khaki">{{ date }}</span>
          </div>

          <!-- Records for this date -->
          <div
            v-for="record in records"
            :key="record.id"
            class="history-record px-4 py-3 hover:bg-sand/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            @click="toggleExpand(record.id)"
          >
            <!-- Record Summary -->
            <div class="flex items-start gap-3">
              <component
                :is="record.status === 'success' ? CheckCircle : XCircle"
                :size="18"
                :class="record.status === 'success' ? 'text-emerald-500' : 'text-red-500'"
              />

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-bold text-sm text-charcoal dark:text-white truncate">
                    {{ record.status === 'success' ? '执行成功' : '执行失败' }}
                  </span>
                  <span class="text-xs px-2 py-0.5 rounded-full"
                    :class="record.status === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'">
                    {{ record.status === 'success' ? '成功' : '失败' }}
                  </span>
                </div>

                <div class="flex items-center gap-3 text-xs text-khaki/80 mb-2">
                  <span class="flex items-center gap-1">
                    <Clock :size="12" />
                    {{ formatRelativeTime(record.timestamp) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Timer :size="12" />
                    {{ formatDuration(record.duration) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <List :size="12" />
                    {{ record.nodeCount }} 个节点
                  </span>
                </div>

                <div v-if="record.error" class="text-xs text-red-600 dark:text-red-400 truncate">
                  {{ record.error }}
                </div>
              </div>

              <button class="text-khaki hover:text-primary transition-colors">
                <Eye :size="16" />
              </button>
            </div>

            <!-- Expanded Details -->
            <div v-if="expandedRecords.has(record.id)" class="mt-3 pt-3 border-t border-sand/10">
              <div class="text-xs space-y-2">
                <div class="flex items-center gap-2 text-khaki">
                  <Calendar :size="12" />
                  <span>{{ formatDateTime(record.timestamp) }}</span>
                </div>

                <div class="flex items-center gap-2 text-khaki">
                  <span>工作流 ID:</span>
                  <code class="text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded">{{ record.workflowId }}</code>
                </div>

                <div class="flex gap-2">
                  <button
                    @click.stop="emit('view', record)"
                    class="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                  >
                    查看详情
                  </button>
                  <button
                    @click.stop="emit('delete', record.id)"
                    class="px-3 py-2 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                  >
                    删除
                  </button>
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
.execution-history-panel {
  font-family: var(--font-ui);
}

.history-record {
  transition: all 0.2s ease;
}

.history-record:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
