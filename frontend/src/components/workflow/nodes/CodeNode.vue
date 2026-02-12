<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { FileCode, Play } from 'lucide-vue-next'
import { computed } from 'vue'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  data: any
  selected: boolean
}>()

const inputs = computed<Variable[]>(() => [
  {
    name: 'code',
    type: 'string',
    description: '代码脚本',
    defaultValue: props.data.code || ''
  },
  {
    name: 'inputData',
    type: 'object',
    description: '输入数据',
    defaultValue: props.data.inputData
  }
])

const outputs = computed<Variable[]>(() => [
  {
    name: 'result',
    type: 'any',
    description: '执行结果'
  },
  {
    name: 'error',
    type: 'string',
    description: '错误信息'
  }
])

const isActive = computed(() => props.data.status === 'running')
</script>

<template>
  <div class="w-[240px] rounded-md bg-white dark:bg-[#1e1711] shadow-md z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-orange-500 shadow-xl' : 'border border-orange-500/30 dark:border-orange-500/20 shadow-orange-100/50 dark:shadow-orange-900/20 ring-1 ring-orange-500/10',
         isActive ? 'ring-2 ring-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : ''
       ]">

    <div class="flex items-center gap-3 border-b border-orange-100 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/20 px-3 py-2.5 rounded-t-md">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-white dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 shadow-sm ring-1 ring-orange-200 dark:ring-orange-700">
        <FileCode :size="16" />
      </div>
      <div>
        <h3 class="text-xs font-bold text-orange-950 dark:text-orange-300 uppercase tracking-wide">{{ data.label || '代码' }}</h3>
        <p class="text-[10px] font-medium text-orange-500/80 dark:text-orange-400/60">Python Script</p>
      </div>
      <div class="ml-auto">
        <div class="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors">
          <Play :size="10" class="ml-0.5" />
        </div>
      </div>
    </div>

    <div class="p-3 space-y-2">
      <div v-for="(input, index) in inputs" :key="input.name"
           class="rounded border border-orange-100 dark:border-orange-800/50 bg-orange-50/30 dark:bg-orange-900/20 p-2">
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] font-bold text-orange-400 uppercase">{{ input.name }}</span>
          <span class="text-[10px] font-mono text-orange-300 dark:text-orange-500">{{ input.type }}</span>
        </div>
        <p class="text-[10px] text-orange-700 dark:text-orange-400/70 line-clamp-2 leading-relaxed">
          {{ input.description }}
        </p>
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-orange-100 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-900/10 px-3 py-2 rounded-b-md">
      <div class="flex items-center gap-1.5">
        <span class="text-[9px] font-medium text-orange-600 dark:text-orange-400">v3.10</span>
      </div>
      <div class="flex items-center gap-2 text-[9px] text-orange-500 dark:text-orange-400/60">
        <span>输出:</span>
        <span class="font-mono">result, error</span>
      </div>
    </div>

    <Handle 
      type="target" 
      :position="Position.Left"
      class="!w-2.5 !h-2.5 !bg-orange-500 !border-2 !border-white dark:!border-[#1e1711] !rounded-full !-ml-[5px]" />

    <Handle 
      type="source" 
      :position="Position.Right"
      class="!w-2.5 !h-2.5 !bg-white dark:!bg-orange-900 !border-2 !border-orange-500 !rounded-full !-mr-[5px]" />
  </div>
</template>
