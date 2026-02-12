<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Hourglass } from 'lucide-vue-next'
import { computed } from 'vue'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  data: any
  selected: boolean
}>()

const inputs = computed<Variable[]>(() => [
  {
    name: 'duration',
    type: 'number',
    description: '延时时间（秒）',
    defaultValue: props.data.duration || 5
  }
])

const outputs = computed<Variable[]>(() => [
  {
    name: 'output',
    type: 'any',
    description: '传递上游数据'
  }
])

const isActive = computed(() => props.data.status === 'running')
const duration = computed(() => props.data.duration || 5)
</script>

<template>
  <div class="w-[180px] rounded-full bg-white dark:bg-[#1e1711] shadow-md z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-slate-500 shadow-xl' : 'border border-slate-500/30 dark:border-slate-500/20 ring-1 ring-slate-500/10',
         isActive ? 'ring-2 ring-slate-400 shadow-[0_0_15px_rgba(100,116,139,0.5)]' : ''
       ]">

    <div class="flex items-center gap-3 px-4 py-3">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-sm">
        <Hourglass :size="16" />
      </div>
      <div class="flex-1">
        <h3 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{{ data.label || '延时' }}</h3>
        <p class="text-[10px] font-mono text-slate-500 dark:text-slate-400">{{ duration }}s</p>
      </div>
    </div>

    <Handle 
      type="target" 
      :position="Position.Left"
      class="!w-2.5 !h-2.5 !bg-slate-500 !border-2 !border-white dark:!border-[#1e1711] !rounded-full !-ml-[5px]" />

    <Handle 
      type="source" 
      :position="Position.Right"
      class="!w-2.5 !h-2.5 !bg-white dark:!bg-slate-800 !border-2 !border-slate-500 !rounded-full !-mr-[5px]" />
  </div>
</template>
