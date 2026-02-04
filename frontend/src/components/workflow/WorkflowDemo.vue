<script setup lang="ts">
import { ref, computed } from 'vue'
import { Play, RotateCcw, Zap, MessageSquare } from 'lucide-vue-next'
import { workflowService } from '@/services/workflowService'

const isRunning = ref(false)
const currentStep = ref(0)
const testInput = ref('你好，我想退货')
const executionResult = ref<any>(null)
const executionLogs = ref<Array<{ step: number; node: string; message: string; output?: any }>>([])

const steps = [
  { node: 'start', name: '接收用户消息', icon: MessageSquare, color: 'text-blue-600' },
  { node: 'classify', name: '意图识别', icon: Zap, color: 'text-indigo-600' },
  { node: 'search-kb', name: '查询知识库', icon: 'file-text', color: 'text-emerald-600' },
  { node: 'condition', name: '判断订单状态', icon: 'git-branch', color: 'text-teal-600' },
  { node: 'refund-process', name: '处理退款', icon: 'code', color: 'text-orange-600' },
  { node: 'generate-reply', name: '生成回复', icon: 'sparkles', color: 'text-purple-600' },
  { node: 'end', name: '返回结果', icon: 'check-circle', color: 'text-green-600' }
]

const canRun = computed(() => testInput.value.trim().length > 0)

const runWorkflow = async () => {
  if (!canRun.value || isRunning.value) return

  isRunning.value = true
  currentStep.value = 0
  executionLogs.value = []
  executionResult.value = null

  // 模拟工作流执行
  const executionSteps = [
    {
      step: 1,
      node: 'start',
      message: `收到用户消息: "${testInput.value}"`,
      output: { input: testInput.value }
    },
    {
      step: 2,
      node: 'classify',
      message: '识别意图: 退货',
      output: { intent: '退货', confidence: 0.95 }
    },
    {
      step: 3,
      node: 'search-kb',
      message: '查询知识库找到 3 条相关内容',
      output: {
        results: [
          '7天无理由退货政策',
          '需要保持商品包装完整',
          '非质量问题买家承担运费'
        ]
      }
    },
    {
      step: 4,
      node: 'condition',
      message: '判断订单状态: 未完成订单',
      output: { condition: false, route: 'generate-reply' }
    },
    {
      step: 5,
      node: 'generate-reply',
      message: '生成客服回复',
      output: {
        reply: '您好，关于您的退货申请，根据我们的政策，7天内可以无理由退货。由于您的订单还在处理中，退货流程会比较简单。请保持商品包装完整，我们将为您安排上门取件。'
      }
    },
    {
      step: 6,
      node: 'end',
      message: '工作流执行完成',
      output: {
        success: true,
        ticketId: 'TKT' + Date.now(),
        status: 'pending'
      }
    }
  ]

  for (const stepData of executionSteps) {
    await new Promise(resolve => setTimeout(resolve, 800))

    currentStep.value = stepData.step
    executionLogs.value.push(stepData)

    // 更新调试服务
    workflowService.addLog('info', stepData.node, stepData.message, stepData.output)
  }

  executionResult.value = {
    success: true,
    message: executionLogs.value[executionLogs.value.length - 1].output.reply,
    ticketId: 'TKT' + Date.now(),
    executionTime: (executionSteps.length * 0.8).toFixed(2) + 's'
  }

  isRunning.value = false
}

const resetWorkflow = () => {
  currentStep.value = 0
  executionLogs.value = []
  executionResult.value = null
  isRunning.value = false
}

const getStepStatus = (step: number) => {
  if (step < currentStep.value) return 'completed'
  if (step === currentStep.value && isRunning.value) return 'running'
  if (step <= currentStep.value) return 'completed'
  return 'pending'
}
</script>

<template>
  <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-bold text-slate-900 mb-1">🤖 智能客服助手工作流</h3>
        <p class="text-sm text-slate-600">完整的客服自动化流程，包含意图识别、知识库查询、订单处理等</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="!isRunning && currentStep > 0"
          @click="resetWorkflow"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
        >
          <RotateCcw :size="14" />
          重置
        </button>
        <button
          @click="runWorkflow"
          :disabled="!canRun || isRunning"
          class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded transition-all"
          :class="canRun && !isRunning ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
        >
          <Play v-if="!isRunning" :size="14" fill="currentColor" />
          <div v-else class="flex items-center gap-2">
            <div class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full spin"></div>
            运行中...
          </div>
          {{ isRunning ? '' : '运行工作流' }}
        </button>
      </div>
    </div>

    <!-- Input -->
    <div class="mb-6">
      <label class="block text-xs font-bold text-slate-700 mb-2">测试输入</label>
      <input
        v-model="testInput"
        type="text"
        :disabled="isRunning"
        class="w-full px-4 py-2.5 text-sm border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
        placeholder="输入用户消息，例如：你好，我想退货"
      />
    </div>

    <!-- Progress Steps -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold text-slate-700">执行步骤</span>
        <span class="text-[10px] text-slate-500">{{ currentStep }} / {{ steps.length }}</span>
      </div>
      <div class="relative">
        <!-- Progress Line -->
        <div class="absolute top-3 left-0 right-0 h-0.5 bg-slate-200"></div>
        <div
          class="absolute top-3 left-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
          :style="{ width: ((currentStep - 1) / (steps.length - 1)) * 100 + '%' }"
        ></div>

        <!-- Steps -->
        <div class="relative flex justify-between">
          <div
            v-for="(step, idx) in steps"
            :key="step.node"
            class="flex flex-col items-center"
          >
            <div
              class="relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
              :class="{
                'bg-white border-2 border-slate-300 text-slate-400': getStepStatus(idx + 1) === 'pending',
                'bg-indigo-600 border-2 border-indigo-600 text-white shadow-lg': getStepStatus(idx + 1) === 'running',
                'bg-emerald-500 border-2 border-emerald-500 text-white': getStepStatus(idx + 1) === 'completed'
              }"
            >
              <span v-if="getStepStatus(idx + 1) === 'completed'">✓</span>
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <span class="text-[9px] text-slate-500 mt-1 text-center w-12">{{ step.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Execution Logs -->
    <div v-if="executionLogs.length > 0" class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
      <div
        v-for="(log, idx) in executionLogs"
        :key="idx"
        class="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100 hover:border-indigo-200 transition-all slide-up-enter-active"
      >
        <div class="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
          <span class="text-[10px] font-bold">{{ log.step }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] font-bold text-slate-900">{{ log.node }}</span>
            <span class="text-[10px] text-slate-400">{{ new Date().toLocaleTimeString() }}</span>
          </div>
          <p class="text-[11px] text-slate-600">{{ log.message }}</p>
          <pre v-if="log.output" class="text-[9px] text-slate-500 font-mono mt-2 p-2 bg-slate-50 rounded overflow-x-auto">{{ JSON.stringify(log.output, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Result -->
    <Transition name="scale">
      <div
        v-if="executionResult"
        class="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg"
      >
        <div class="flex items-start gap-3">
          <div class="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle :size="20" />
          </div>
          <div class="flex-1">
            <h4 class="text-sm font-bold text-emerald-900 mb-2">✨ 工作流执行成功！</h4>
            <p class="text-[11px] text-emerald-800 leading-relaxed mb-3">{{ executionResult.message }}</p>
            <div class="flex items-center gap-4 text-[10px] text-emerald-700">
              <span class="font-mono">工单号: {{ executionResult.ticketId }}</span>
              <span>执行时间: {{ executionResult.executionTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts">
import { CheckCircle } from 'lucide-vue-next'
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
