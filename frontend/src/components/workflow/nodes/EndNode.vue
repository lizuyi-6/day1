<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Layers } from 'lucide-vue-next'
import { computed } from 'vue'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  data: any
  selected: boolean
}>()

const inputs = computed<Variable[]>(() => [
  {
    name: 'result',
    type: 'any',
    description: '工作流输出结果',
    defaultValue: props.data.result
  }
])

const outputs = computed<Variable[]>(() => [])

const isCompleted = computed(() => props.data.status === 'completed')
</script>

<template>
  <div class="w-[180px] rounded-md bg-white dark:bg-[#1e1711] shadow-md z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-slate-500 shadow-xl' : 'border border-slate-500/30 dark:border-slate-500/20 shadow-slate-100/50 dark:shadow-slate-900/20 ring-1 ring-slate-500/10',
         isCompleted ? 'ring-2 ring-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-900/10' : ''
       ]">

    <div class="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 px-3 py-2.5 rounded-t-md">
      <div class="flex h-6 w-6 items-center justify-center rounded bg-slate-900 dark:bg-slate-700 text-white shadow-sm">
        <Layers :size="12" />
      </div>
      <div class="flex-1">
        <h3 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{{ data.label || 'END' }}</h3>
      </div>
    </div>

    <div class="px-3 py-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
      <span>Output</span>
      <span class="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">JSON</span>
    </div>

    <Handle 
      type="target" 
      :position="Position.Left"
      class="!w-2.5 !h-2.5 !bg-slate-500 !border-2 !border-white dark:!border-[#1e1711] !rounded-full !-ml-[5px]" />
  </div>
</template>
