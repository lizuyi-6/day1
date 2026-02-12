<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { Sparkles, Activity, Clock } from 'lucide-vue-next'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  data: any
  selected: boolean
}>()

const modelDisplay = computed(() => props.data.model || 'qwen-flash')

const isStreaming = computed(() => props.data.status === 'streaming')
const isActive = computed(() => props.data.status === 'running')

const inputs = computed<Variable[]>(() => [
  {
    name: 'prompt',
    type: 'string',
    description: '提示词（支持变量引用）',
    defaultValue: props.data.prompt || ''
  },
  {
    name: 'systemPrompt',
    type: 'string',
    description: '系统提示词',
    defaultValue: props.data.systemPrompt || ''
  },
  {
    name: 'temperature',
    type: 'number',
    description: '温度参数',
    defaultValue: props.data.temperature || 0.7
  },
  {
    name: 'maxTokens',
    type: 'number',
    description: '最大令牌数',
    defaultValue: props.data.maxTokens || 4096
  }
])

const outputs = computed<Variable[]>(() => [
  {
    name: 'response',
    type: 'string',
    description: '模型响应'
  },
  {
    name: 'usage',
    type: 'object',
    description: '令牌使用量'
  }
])

const localPrompt = shallowRef(props.data.prompt || '')
const localTemperature = shallowRef(props.data.temperature || 0.7)
const localMaxTokens = shallowRef(props.data.maxTokens || 4096)

const updatePrompt = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  localPrompt.value = value
  props.data.prompt = value
}

const updateTemperature = (event: Event) => {
  const value = parseFloat((event.target as HTMLInputElement).value)
  localTemperature.value = value
  props.data.temperature = value
}

const updateMaxTokens = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value)
  localMaxTokens.value = value
  props.data.maxTokens = value
}
</script>

<template>
  <div class="w-[260px] rounded-md bg-white dark:bg-[#1e1711] shadow-md z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-indigo-500 shadow-xl' : 'border border-indigo-500/30 dark:border-indigo-500/20 shadow-indigo-100/50 dark:shadow-indigo-900/20 ring-1 ring-indigo-500/10',
         isActive || isStreaming ? 'ring-2 ring-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : ''
       ]">

    <div class="flex items-center gap-3 border-b border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/20 px-3 py-2.5 rounded-t-md">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-white dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-700">
        <Sparkles :size="16" />
      </div>
      <div>
        <h3 class="text-xs font-bold text-indigo-950 dark:text-indigo-300 uppercase tracking-wide">{{ data.label || 'LLM' }}</h3>
        <p class="text-[10px] font-medium text-indigo-500/80 dark:text-indigo-400/60">{{ modelDisplay }}</p>
      </div>
      <div class="ml-auto flex gap-1">
        <div v-if="isStreaming" class="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
      </div>
    </div>

    <div class="p-3 space-y-2">
      <div v-for="(input, index) in inputs" :key="input.name"
           class="rounded border border-indigo-100 dark:border-indigo-800/50 bg-indigo-50/30 dark:bg-indigo-900/20 p-2">
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] font-bold text-indigo-400 dark:text-indigo-400 uppercase">{{ input.name }}</span>
          <span class="text-[9px] font-mono text-indigo-300 dark:text-indigo-500">{{ input.type }}</span>
        </div>
        <p class="text-[10px] text-indigo-700 dark:text-indigo-400/70 line-clamp-2 leading-relaxed">
          {{ input.description }}
        </p>
        <input type="text"
               v-if="input.name === 'prompt'"
               :value="localPrompt"
               @input="updatePrompt"
               class="w-full text-[10px] text-indigo-900 dark:text-indigo-300 bg-indigo-100/50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded px-2 py-1 outline-none focus:border-indigo-500"
               placeholder="输入提示词..." />
        <input type="range"
               v-if="input.name === 'temperature'"
               :value="localTemperature"
               @input="updateTemperature"
               min="0" max="1" step="0.1"
               class="w-full accent-indigo-600" />
        <input type="number"
               v-if="input.name === 'maxTokens'"
               :value="localMaxTokens"
               @input="updateMaxTokens"
               class="w-full text-[10px] text-indigo-900 dark:text-indigo-300 bg-indigo-100/50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded px-2 py-1 outline-none focus:border-indigo-500"
               placeholder="4096" />
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-900/10 px-3 py-2 rounded-b-md">
      <div class="flex items-center gap-1.5">
        <Activity :size="10" class="text-indigo-400" />
        <span class="text-[9px] font-medium text-indigo-600 dark:text-indigo-400">Idle</span>
      </div>
      <div class="flex items-center gap-1.5">
        <Clock :size="10" class="text-indigo-400" />
        <span class="text-[9px] font-mono text-indigo-600 dark:text-indigo-400">0.05s</span>
      </div>
    </div>

    <Handle 
      v-for="(input, index) in inputs" 
      :key="`input-${index}`"
      type="target" 
      :position="Position.Left"
      :id="input.name"
      :style="{ top: `${60 + index * 60}px` }"
      class="!w-2.5 !h-2.5 !bg-indigo-500 !border-2 !border-white dark:!border-[#1e1711] !rounded-full !-ml-[5px]" />
    
    <Handle 
      type="target" 
      :position="Position.Left"
      class="!w-2.5 !h-2.5 !bg-indigo-500 !border-2 !border-white dark:!border-[#1e1711] !rounded-full !-ml-[5px]" />

    <Handle 
      v-for="(output, index) in outputs" 
      :key="`output-${index}`"
      type="source" 
      :position="Position.Right"
      :id="output.name"
      :style="{ top: `${60 + index * 30}px` }"
      class="!w-2.5 !h-2.5 !bg-white dark:!bg-indigo-900 !border-2 !border-indigo-500 !rounded-full !-mr-[5px]" />
    
    <Handle 
      type="source" 
      :position="Position.Right"
      class="!w-2.5 !h-2.5 !bg-white dark:!bg-indigo-900 !border-2 !border-indigo-500 !rounded-full !-mr-[5px]" />
  </div>
</template>
