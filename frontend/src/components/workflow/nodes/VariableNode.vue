<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Package } from 'lucide-vue-next'
import { computed } from 'vue'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  data: any
  selected: boolean
}>()

const inputs = computed<Variable[]>(() => [])

const outputs = computed<Variable[]>(() => [
  {
    name: 'value',
    type: 'any',
    description: '变量值',
    defaultValue: props.data.value || ''
  }
])

const isActive = computed(() => props.data.status === 'running')
const variableName = computed(() => props.data.variableName || 'var')
const variableValue = computed(() => props.data.value || 'value')
</script>

<template>
  <div class="w-[180px] rounded-md bg-white dark:bg-[#1e1711] shadow-md z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-sky-500 shadow-xl' : 'border border-sky-500/30 dark:border-sky-500/20 shadow-sky-100/50 dark:shadow-sky-900/20 ring-1 ring-sky-500/10',
         isActive ? 'ring-2 ring-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.5)]' : ''
       ]">

    <div class="flex items-center gap-3 border-b border-sky-100 dark:border-sky-900/30 bg-sky-50/50 dark:bg-sky-900/20 px-3 py-2.5 rounded-t-md">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-white dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 shadow-sm ring-1 ring-sky-200 dark:ring-sky-700">
        <Package :size="16" />
      </div>
      <div>
        <h3 class="text-xs font-bold text-sky-950 dark:text-sky-300 uppercase tracking-wide">{{ data.label || '变量' }}</h3>
        <p class="text-[10px] font-medium text-sky-500/80 dark:text-sky-400/60">Variable</p>
      </div>
    </div>

    <div class="p-3 text-center">
      <div class="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 mb-1">{{ variableName }}</div>
      <div class="text-[9px] text-slate-400 dark:text-slate-500 mb-2">↓</div>
      <div class="bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 text-[10px] text-slate-700 dark:text-slate-300 truncate">
        {{ variableValue }}
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-sky-100 dark:border-sky-900/30 bg-sky-50/30 dark:bg-sky-900/10 px-3 py-2 rounded-b-md">
      <div class="flex items-center gap-2 text-[9px] text-sky-500 dark:text-sky-400/60">
        <span>输出:</span>
        <span class="font-mono">value</span>
      </div>
    </div>

    <Handle 
      type="target" 
      :position="Position.Left"
      class="!w-2.5 !h-2.5 !bg-sky-500 !border-2 !border-white dark:!border-[#1e1711] !rounded-full !-ml-[5px]" />

    <Handle 
      type="source" 
      :position="Position.Right"
      class="!w-2.5 !h-2.5 !bg-white dark:!bg-sky-900 !border-2 !border-sky-500 !rounded-full !-mr-[5px]" />
  </div>
</template>
