<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { Terminal, Copy, Trash2, ChevronDown, ChevronUp, Search, Play, Square } from 'lucide-vue-next'

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
  logs: TerminalLog[]
  isExecuting: boolean
}>()

const emit = defineEmits<{
  clear: []
  copy: []
  toggle: []
}>()

const logContainer = ref<HTMLElement | null>(null)
const isExpanded = ref(true)
const autoScroll = ref(true)
const searchTerm = ref('')

const filteredLogs = computed(() => {
  if (!searchTerm.value) return props.logs
  const term = searchTerm.value.toLowerCase()
  return props.logs.filter(log => 
    log.message.toLowerCase().includes(term) ||
    log.nodeId?.toLowerCase().includes(term) ||
    log.nodeName?.toLowerCase().includes(term)
  )
})

const getLogIcon = (type: TerminalLog['type']) => {
  switch (type) {
    case 'info':
      return Terminal
    case 'warn':
      return Terminal
    case 'error':
      return Terminal
    case 'success':
      return Terminal
    case 'stream':
      return Terminal
  }
}

const getLogColor = (type: TerminalLog['type']) => {
  switch (type) {
    case 'info':
      return 'text-blue-400'
    case 'warn':
      return 'text-yellow-400'
    case 'error':
      return 'text-red-400'
    case 'success':
      return 'text-emerald-400'
    case 'stream':
      return 'text-purple-400'
  }
}

const getLogBg = (type: TerminalLog['type']) => {
  switch (type) {
    case 'info':
      return 'border-blue-500/30'
    case 'warn':
      return 'border-yellow-500/30'
    case 'error':
      return 'border-red-500/30'
    case 'success':
      return 'border-emerald-500/30'
    case 'stream':
      return 'border-purple-500/30'
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const clearLogs = () => {
  emit('clear')
  searchTerm.value = ''
}

const copyLogs = () => {
  const text = filteredLogs.value.map(log => {
    const time = formatTime(log.timestamp)
    const node = log.nodeName ? `[${log.nodeName}]` : ''
    return `[${time}] ${node} ${log.type.toUpperCase()}: ${log.message}`
  }).join('\n')
  
  navigator.clipboard.writeText(text)
}

const toggleExpand = () => {
  emit('toggle')
  isExpanded.value = !isExpanded.value
}

watch(() => filteredLogs.value.length, () => {
  if (autoScroll.value && logContainer.value) {
    nextTick(() => {
      logContainer.value?.scrollTo({
        top: logContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    })
  }
})
</script>

<template>
  <div class="terminal-output">
    <div class="terminal-container">
      <div class="terminal-header">
        <div class="terminal-title">
          <Terminal :size="16" />
          <span>终端输出</span>
          <span v-if="isExecuting" class="status-indicator">●</span>
        </div>
        <div class="terminal-controls">
          <button 
            v-if="searchTerm" 
            @click="searchTerm = ''" 
            class="control-btn"
            title="清除搜索"
          >
            ×
          </button>
          <button 
            v-if="!isExpanded" 
            @click="toggleExpand" 
            class="control-btn"
            title="展开"
          >
            <ChevronUp :size="14" />
          </button>
        </div>
      </div>

      <div v-if="isExpanded" class="terminal-body">
        <div class="terminal-toolbar">
          <div class="search-box">
            <Search :size="14" />
            <input 
              v-model="searchTerm" 
              type="text" 
              placeholder="搜索日志..." 
              class="search-input"
            />
          </div>
          <div class="toolbar-actions">
            <label class="auto-scroll-label">
              <input 
                v-model="autoScroll" 
                type="checkbox" 
                class="auto-scroll-checkbox"
              />
              <span>自动滚动</span>
            </label>
            <button 
              @click="copyLogs" 
              class="action-btn"
              title="复制日志"
            >
              <Copy :size="14" />
            </button>
            <button 
              @click="clearLogs" 
              class="action-btn danger"
              title="清空日志"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </div>

        <div 
          ref="logContainer"
          class="log-container custom-scrollbar"
        >
          <div 
            v-for="log in filteredLogs" 
            :key="log.id"
            class="log-entry"
            :class="[getLogBg(log.type), log.type === 'stream' ? 'stream-entry' : '']"
          >
            <div class="log-header">
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span v-if="log.nodeId" class="log-node">{{ log.nodeName || log.nodeId }}</span>
              <span class="log-type" :class="getLogColor(log.type)">{{ log.type.toUpperCase() }}</span>
            </div>
            <div class="log-message">{{ log.message }}</div>
            <pre v-if="log.data" class="log-data">{{ JSON.stringify(log.data, null, 2) }}</pre>
          </div>

          <div v-if="filteredLogs.length === 0" class="empty-state">
            <Terminal :size="48" />
            <p>{{ searchTerm ? '没有匹配的日志' : '暂无日志输出' }}</p>
            <p v-if="!isExecuting" class="hint">执行工作流或调试节点以查看输出</p>
          </div>
        </div>

        <div v-if="isExecuting" class="terminal-footer">
          <div class="executing-indicator">
            <div class="spinner"></div>
            <span>执行中...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.terminal-output {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.terminal-container {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
  user-select: none;
}

.terminal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #c9d1d9;
  font-size: 12px;
  font-weight: 600;
}

.status-indicator {
  color: #238636;
  animation: pulse 1.5s ease-in-out infinite;
  margin-left: 8px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.terminal-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 4px;
  color: #8b949e;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #30363d;
  color: #c9d1d9;
}

.terminal-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 300px;
}

.terminal-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
  gap: 8px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 4px;
  padding: 4px 8px;
  flex: 1;
  max-width: 200px;
}

.search-box input {
  background: transparent;
  border: none;
  outline: none;
  color: #c9d1d9;
  font-family: inherit;
  font-size: 11px;
  width: 100%;
}

.search-box input::placeholder {
  color: #484f58;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.auto-scroll-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8b949e;
  font-size: 11px;
  cursor: pointer;
  user-select: none;
}

.auto-scroll-checkbox {
  width: 14px;
  height: 14px;
  cursor: pointer;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 4px;
  color: #8b949e;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #30363d;
  color: #c9d1d9;
}

.action-btn.danger:hover {
  background: #8b3b3b;
  border-color: #da3633;
  color: #f85149;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  background: #0d1117;
}

.log-entry {
  padding: 6px 8px;
  border-left: 3px solid transparent;
  border-radius: 0 4px 4px 0;
  margin-bottom: 4px;
  background: rgba(22, 27, 34, 0.3);
  transition: all 0.2s;
}

.log-entry:hover {
  background: rgba(22, 27, 34, 0.5);
}

.stream-entry {
  border-left-style: dashed;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.log-time {
  color: #484f58;
  font-size: 10px;
}

.log-node {
  color: #7ee787;
  font-size: 10px;
  background: rgba(126, 231, 135, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
}

.log-type {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 3px;
  background: rgba(48, 54, 61, 0.3);
}

.log-message {
  color: #c9d1d9;
  word-break: break-word;
  white-space: pre-wrap;
}

.log-data {
  margin-top: 4px;
  padding: 8px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 4px;
  color: #8b949e;
  font-size: 11px;
  overflow-x: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #484f58;
}

.empty-state svg {
  opacity: 0.3;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 13px;
}

.empty-state .hint {
  font-size: 11px;
  margin-top: 8px;
  color: #6e7681;
}

.terminal-footer {
  padding: 8px 12px;
  background: #161b22;
  border-top: 1px solid #30363d;
}

.executing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #238636;
  font-size: 11px;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid #21262d;
  border-top-color: #238636;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #0d1117;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #484f58;
}
</style>
