<script setup lang="ts">
import { ref, computed } from 'vue'
import { Play, AlertTriangle, CheckCircle, FileText, Zap, Settings, X, Loader2, ArrowRight } from 'lucide-vue-next'
import InputPanel from './InputPanel.vue'
import type { Node, Edge } from '@vue-flow/core'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  nodes: Node[]
  edges: Edge[]
  inputs: Variable[]
  workflowName?: string
  isExecuting?: boolean
  executionResult?: any
  executionLogs?: Array<{ nodeId: string; status: string; message: string }>
}>()

const emit = defineEmits<{
  execute: [data: Record<string, any>]
  close: []
}>()

const showInputPanel = ref(true)
const inputValues = ref<Record<string, any>>({})
const executionMode = ref<'normal' | 'debug'>('normal')

const nodeStats = computed(() => {
  return {
    total: props.nodes.length,
    llm: props.nodes.filter(n => n.type === 'llm').length,
    code: props.nodes.filter(n => n.type === 'code').length,
    condition: props.nodes.filter(n => n.type === 'condition').length,
    other: props.nodes.filter(n => !['llm', 'code', 'condition'].includes(n.type as string)).length
  }
})

const isValid = computed(() => {
  return props.inputs.every(input => {
    if (input.required && !inputValues.value[input.name]) return false
    return true
  })
})

const handleExecute = (data: Record<string, any>) => {
  inputValues.value = data
  emit('execute', { ...data, mode: executionMode.value })
}

const close = () => {
  emit('close')
}

const showExecutionProgress = () => {
  showInputPanel.value = false
}

const showInputPanelView = () => {
  showInputPanel.value = true
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 flex items-center justify-center rounded-lg" :class="isExecuting ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'">
            <Loader2 v-if="isExecuting" :size="20" class="animate-spin" />
            <Play v-else :size="20" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">
              {{ isExecuting ? '正在执行工作流...' : '执行工作流' }}
            </h2>
            <p class="text-sm text-slate-600">{{ workflowName || '未命名工作流' }}</p>
          </div>
        </div>
        <button @click="close" class="text-slate-400 hover:text-slate-600 transition-colors">
          <X :size="24" />
        </button>
      </div>

      <div class="flex flex-1 overflow-hidden">
        <div v-if="showInputPanel" class="flex-1 border-r border-slate-200 overflow-y-auto">
          <InputPanel
            :inputs="inputs"
            :executing="isExecuting || false"
            @execute="handleExecute"
            @close="showInputPanel = false"
          />
        </div>

        <div v-else class="w-[500px] bg-slate-50 border-l border-slate-200 overflow-y-auto">
          <div class="p-6 space-y-6">
            <div v-if="isExecuting">
              <div class="flex flex-col items-center justify-center py-12">
                <Loader2 :size="48" class="text-blue-600 animate-spin" />
                <p class="text-sm text-slate-600 mt-4">正在执行工作流，请稍候...</p>
              </div>
            </div>

            <div v-else-if="executionResult">
              <div class="space-y-6">
                <div>
                  <h3 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <CheckCircle :size="16" class="text-emerald-600" />
                    执行结果
                  </h3>
                  <div class="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <pre class="text-xs text-emerald-400 font-mono whitespace-pre-wrap break-words">{{ JSON.stringify(executionResult, null, 2) }}</pre>
                  </div>
                </div>

                <div v-if="executionLogs && executionLogs.length > 0">
                  <h3 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <FileText :size="16" class="text-indigo-600" />
                    执行日志
                  </h3>
                  <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                    <div
                      v-for="(log, index) in executionLogs"
                      :key="index"
                      class="flex items-start gap-2 text-sm"
                      :class="log.status === 'error' ? 'text-red-600' : log.status === 'success' ? 'text-emerald-600' : 'text-slate-600'"
                    >
                      <span class="font-mono">{{ log.nodeId }}</span>
                      <span class="text-slate-400">-</span>
                      <span>{{ log.message }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!isExecuting && !executionResult" class="p-6">
              <h3 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <AlertTriangle :size="16" class="text-amber-600" />
                工作流信息
              </h3>
              <div class="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-600">节点总数</span>
                  <span class="text-sm font-bold text-slate-900">{{ nodeStats.total }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-600">LLM 节点</span>
                  <span class="text-sm font-bold text-slate-900">{{ nodeStats.llm }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-600">代码节点</span>
                  <span class="text-sm font-bold text-slate-900">{{ nodeStats.code }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-600">条件节点</span>
                  <span class="text-sm font-bold text-slate-900">{{ nodeStats.condition }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-600">其他节点</span>
                  <span class="text-sm font-bold text-slate-900">{{ nodeStats.other }}</span>
                </div>
              </div>

              <div v-if="!isValid" class="p-4 bg-amber-50 border border-amber-200 rounded-lg mt-4">
                <div class="flex items-start gap-3">
                  <AlertTriangle :size="20" class="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 class="text-sm font-bold text-amber-900 mb-1">注意</h4>
                    <p class="text-xs text-amber-700">
                      请确保所有必填项都已填写后再执行工作流。
                    </p>
                  </div>
                </div>
              </div>

              <div v-if="!isExecuting && isValid" class="p-4 bg-emerald-50 border border-emerald-200 rounded-lg mt-4">
                <div class="flex items-start gap-3">
                  <CheckCircle :size="20" class="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 class="text-sm font-bold text-emerald-900 mb-1">准备好了吗？</h4>
                    <p class="text-xs text-slate-700">
                      点击"执行工作流"按钮开始执行，或者选择不同的执行模式。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showInputPanel && !isExecuting" class="absolute bottom-0 left-0 right-0 p-4 bg-slate-50 border-t border-slate-200">
        <button
          @click="showExecutionProgress"
          class="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors"
        >
          <ArrowRight :size="16" />
          查看执行状态
        </button>
      </div>

      <div v-if="!showInputPanel" class="absolute bottom-0 left-0 right-0 p-4 bg-slate-50 border-t border-slate-200">
        <button
          @click="showInputPanelView"
          class="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors"
        >
          <ArrowRight :size="16" class="rotate-180" />
          返回输入面板
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.execution-dialog {
  font-family: var(--font-ui);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
