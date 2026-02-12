<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { GitFork } from 'lucide-vue-next'
import { computed } from 'vue'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  data: any
  selected: boolean
}>()

const inputs = computed<Variable[]>(() => [
  {
    name: 'expression',
    type: 'string',
    description: '条件表达式',
    defaultValue: props.data.expression || ''
  }
])

const outputs = computed<Variable[]>(() => [
  {
    name: 'trueResult',
    type: 'any',
    description: '条件为真时的输出'
  },
  {
    name: 'falseResult',
    type: 'any',
    description: '条件为假时的输出'
  }
])

const isActive = computed(() => props.data.status === 'running')
</script>

<template>
  <div class="w-[220px] rounded-md bg-white dark:bg-[#1e1711] shadow-md z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-teal-500 shadow-xl' : 'border border-teal-500/30 dark:border-teal-500/20 shadow-teal-100/50 dark:shadow-teal-900/20 ring-1 ring-teal-500/10',
         isActive ? 'ring-2 ring-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.5)]' : ''
       ]">

    <div class="flex items-center gap-3 border-b border-teal-100 dark:border-teal-900/30 bg-teal-50/50 dark:bg-teal-900/20 px-3 py-2.5 rounded-t-md">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-white dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 shadow-sm ring-1 ring-teal-200 dark:ring-teal-700">
        <GitFork :size="16" />
      </div>
      <div>
        <h3 class="text-xs font-bold text-teal-950 dark:text-teal-300 uppercase tracking-wide">{{ data.label || '条件' }}</h3>
        <p class="text-[10px] font-medium text-teal-500/80 dark:text-teal-400/60">Logic Control</p>
      </div>
    </div>

    <div class="p-3 space-y-2">
      <div class="rounded border border-teal-100 dark:border-teal-800/50 bg-teal-50/30 dark:bg-teal-900/20 p-2">
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] font-bold text-teal-400 uppercase">expression</span>
          <span class="text-[10px] font-mono text-teal-300 dark:text-teal-500">string</span>
        </div>
        <p class="text-[10px] text-teal-700 dark:text-teal-400/70 break-words leading-relaxed">
          条件表达式（支持变量引用）
        </p>
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-teal-100 dark:border-teal-900/30 bg-teal-50/30 dark:bg-teal-900/10 px-3 py-2 rounded-b-md">
      <div class="flex items-center gap-2 text-[9px] text-teal-500 dark:text-teal-400/60">
        <span>输出:</span>
        <span class="font-mono">true, false</span>
      </div>
    </div>

    <Handle 
      type="target" 
      :position="Position.Left"
      class="!w-2.5 !h-2.5 !bg-teal-500 !border-2 !border-white dark:!border-[#1e1711] !rounded-full !-ml-[5px]" />

    <div class="absolute right-0 top-[45px] flex items-center">
      <span class="absolute right-5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 pointer-events-none">TRUE</span>
      <Handle 
        type="source" 
        :position="Position.Right"
        id="true"
        class="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white dark:!border-[#1e1711] !rounded-full !-mr-[5px]" />
    </div>

    <div class="absolute right-0 top-[85px] flex items-center">
      <span class="absolute right-5 text-[9px] font-bold text-rose-500 dark:text-rose-400 pointer-events-none">FALSE</span>
      <Handle 
        type="source" 
        :position="Position.Right"
        id="false"
        class="!w-2.5 !h-2.5 !bg-rose-500 !border-2 !border-white dark:!border-[#1e1711] !rounded-full !-mr-[5px]" />
    </div>
  </div>
</template>
