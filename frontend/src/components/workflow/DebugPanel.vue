<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bug, X, Play, Square, ChevronDown, ChevronUp } from 'lucide-vue-next'
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

const stopDebug = () => {
  workflowService.stopDebugSession()
  emit('toggle')
}

const getLogColor = (level: DebugLog['level']) => {
  switch (level) {
    case 'info': return 'text-blue-500'
    case 'warn': return 'text-amber-500'
    case 'error': return 'text-red-500'
    case 'success': return 'text-emerald-500'
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <Transition name="debug-panel">
    <div v-if="props.debugMode" class="fixed bottom-[340px] right-4 w-80 z-50">
      <div class="bg-white dark:bg-[#1e1711] rounded-xl shadow-2xl border border-sand/30 overflow-hidden">
        <div class="flex items-center justify-between px-3 py-2 bg-primary/10 border-b border-sand/20">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bug :size="14" class="text-primary" />
            </div>
            <div>
              <h3 class="text-xs font-bold text-charcoal dark:text-sand">调试模式</h3>
              <p v-if="currentNode" class="text-[10px] text-khaki">节点: {{ currentNode }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button @click="isExpanded = !isExpanded" class="p-1 text-khaki hover:text-primary transition-colors">
              <ChevronDown v-if="isExpanded" :size="14" />
              <ChevronUp v-else :size="14" />
            </button>
            <button @click="stopDebug" class="p-1 text-khaki hover:text-red-500 transition-colors">
              <X :size="14" />
            </button>
          </div>
        </div>
        
        <div v-if="isExpanded" class="max-h-48 overflow-y-auto">
          <div v-if="logs.length === 0" class="flex flex-col items-center justify-center py-6 text-khaki/50">
            <Bug :size="24" class="mb-2 opacity-30" />
            <p class="text-[10px]">点击节点开始调试</p>
          </div>
          
          <div v-else class="divide-y divide-sand/10">
            <div v-for="(log, idx) in logs.slice(-10)" :key="idx" 
                 class="flex items-start gap-2 px-3 py-2 hover:bg-sand/10 transition-colors">
              <div :class="getLogColor(log.level)" class="mt-0.5">
                <div class="w-1.5 h-1.5 rounded-full bg-current"></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1 mb-0.5">
                  <span class="text-[9px] text-khaki/60 font-mono">{{ formatTime(log.timestamp) }}</span>
                  <span v-if="log.nodeId" class="text-[9px] text-primary font-mono">{{ log.nodeId }}</span>
                </div>
                <p class="text-[10px] text-charcoal dark:text-sand leading-relaxed">{{ log.message }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="px-3 py-2 bg-sand/10 border-t border-sand/20 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <div class="w-1.5 h-1.5 rounded-full animate-pulse" :class="currentNode ? 'bg-emerald-500' : 'bg-khaki/30'"></div>
            <span class="text-[10px] text-khaki">{{ currentNode ? '调试中' : '就绪' }}</span>
          </div>
          <button @click="stopDebug" class="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
            <Square :size="10" />
            停止
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.debug-panel-enter-active,
.debug-panel-leave-active {
  transition: all 0.3s ease;
}

.debug-panel-enter-from,
.debug-panel-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
