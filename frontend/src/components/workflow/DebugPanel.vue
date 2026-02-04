<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Bug, Play, Square, Trash2, ChevronDown, ChevronRight, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-vue-next'
import { workflowService, type DebugLog } from '@/services/workflowService'

const props = defineProps<{
  debugMode: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'executeNode', nodeId: string): void
}>()

const logs = computed(() => workflowService.debugState.value?.logs || [])
const currentNode = computed(() => workflowService.debugState.value?.currentNode)
const isExpanded = ref(true)
const autoScroll = ref(true)

const logContainer = ref<HTMLElement | null>(null)

// 自动滚动到底部
watch(() => logs.value.length, () => {
  if (autoScroll.value && logContainer.value) {
    setTimeout(() => {
      logContainer.value?.scrollTo({
        top: logContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }, 100)
  }
})

const getLogIcon = (level: DebugLog['level']) => {
  switch (level) {
    case 'info':
      return Info
    case 'warn':
      return AlertTriangle
    case 'error':
      return XCircle
    case 'success':
      return CheckCircle
  }
}

const getLogColor = (level: DebugLog['level']) => {
  switch (level) {
    case 'info':
      return 'text-blue-600 bg-blue-50'
    case 'warn':
      return 'text-amber-600 bg-amber-50'
    case 'error':
      return 'text-red-600 bg-red-50'
    case 'success':
      return 'text-emerald-600 bg-emerald-50'
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour12: false })
}

const clearLogs = () => {
  workflowService.clearDebugLogs()
}

const stopDebug = () => {
  workflowService.stopDebugSession()
  emit('toggle')
}
</script>

<template>
  <div v-if="props.debugMode" class="fixed bottom-4 left-4 right-4 z-50">
    <div class="bg-white rounded-lg shadow-2xl border border-light overflow-hidden slide-up-enter-active">
      <!-- Header -->
      <div class="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Bug :size="18" class="text-white" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">调试控制台</h3>
            <p class="text-[10px] text-white/70">实时查看工作流执行状态</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="isExpanded = !isExpanded"
            class="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <ChevronDown v-if="isExpanded" :size="18" />
            <ChevronRight v-else :size="18" />
          </button>
        </div>
      </div>

      <div v-if="isExpanded" class="max-h-96 flex flex-col">
        <!-- Toolbar -->
        <div class="px-4 py-2 bg-slate-50 border-b border-light flex items-center gap-2">
          <div class="flex items-center gap-1">
            <div class="h-2 w-2 rounded-full" :class="currentNode ? 'bg-green-500 animate-pulse' : 'bg-slate-300'"></div>
            <span class="text-[10px] text-slate-600">
              {{ currentNode ? `执行中: 节点 ${currentNode}` : '等待执行...' }}
            </span>
          </div>
          <div class="flex-1"></div>
          <label class="flex items-center gap-1.5 text-[10px] text-slate-600 cursor-pointer">
            <input
              v-model="autoScroll"
              type="checkbox"
              class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            自动滚动
          </label>
          <button
            @click="clearLogs"
            class="px-2 py-1 text-[10px] text-slate-600 hover:bg-slate-200 rounded transition-colors flex items-center gap-1"
          >
            <Trash2 :size="12" />
            清除
          </button>
          <button
            @click="stopDebug"
            class="px-2 py-1 text-[10px] bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors flex items-center gap-1"
          >
            <Square :size="12" />
            停止
          </button>
        </div>

        <!-- Logs -->
        <div
          ref="logContainer"
          class="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-900 custom-scrollbar"
        >
          <div
            v-for="(log, idx) in logs"
            :key="idx"
            class="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all group"
          >
            <!-- Icon -->
            <div
              class="h-6 w-6 rounded flex items-center justify-center shrink-0 mt-0.5"
              :class="getLogColor(log.level)"
            >
              <component :is="getLogIcon(log.level)" :size="14" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[9px] text-slate-400 font-mono">{{ formatTime(log.timestamp) }}</span>
                <span class="text-[10px] font-mono text-indigo-400">{{ log.nodeId }}</span>
              </div>
              <p class="text-[11px] text-slate-300 leading-relaxed">{{ log.message }}</p>
              <pre v-if="log.data" class="text-[9px] text-slate-400 font-mono mt-2 p-2 bg-slate-900 rounded overflow-x-auto">{{ JSON.stringify(log.data, null, 2) }}</pre>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="logs.length === 0" class="flex flex-col items-center justify-center py-12 text-slate-500">
            <Bug :size="48" class="mb-3 opacity-20" />
            <p class="text-xs">等待调试日志...</p>
            <p class="text-[10px] text-slate-600 mt-1">点击节点开始执行</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
