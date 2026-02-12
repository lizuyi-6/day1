<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Repeat } from 'lucide-vue-next'
import { computed } from 'vue'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  data: any
  selected: boolean
}>()

const inputs = computed<Variable[]>(() => [
  {
    name: 'items',
    type: 'array',
    description: '要循环的数组',
    defaultValue: props.data.items || []
  }
])

const outputs = computed<Variable[]>(() => [
  {
    name: 'item',
    type: 'any',
    description: '当前循环项'
  },
  {
    name: 'index',
    type: 'number',
    description: '当前索引'
  }
])

const isActive = computed(() => props.data.status === 'running')
</script>

<template>
  <div class="w-[200px] rounded-md bg-white dark:bg-[#1e1711] shadow-md z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-amber-500 shadow-xl' : 'border border-amber-500/30 dark:border-amber-500/20 shadow-amber-100/50 dark:shadow-amber-900/20 ring-1 ring-amber-500/10',
         isActive ? 'ring-2 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : ''
       ]">

    <div class="flex items-center gap-3 border-b border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/20 px-3 py-2.5 rounded-t-md">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-white dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shadow-sm ring-1 ring-amber-200 dark:ring-amber-700">
        <Repeat :size="16" />
      </div>
      <div>
        <h3 class="text-xs font-bold text-amber-950 dark:text-amber-300 uppercase tracking-wide">{{ data.label || '循环' }}</h3>
        <p class="text-[10px] font-medium text-amber-500/80 dark:text-amber-400/60">ForEach Item</p>
      </div>
    </div>

    <div class="p-3 space-y-2">
      <div class="text-[10px] text-amber-700 dark:text-amber-400/70">
        遍历数组中的每个元素
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10 px-3 py-2 rounded-b-md">
      <div class="flex items-center gap-2 text-[9px] text-amber-500 dark:text-amber-400/60">
        <span>输出:</span>
        <span class="font-mono">item, index</span>
      </div>
    </div>

    <Handle 
      type="target" 
      :position="Position.Left"
      class="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white dark:!border-[#1e1711] !rounded-full !-ml-[5px]" />

    <div class="absolute right-0 top-[50px] flex items-center">
      <span class="absolute right-5 text-[9px] font-bold text-amber-600 dark:text-amber-400 pointer-events-none">BODY</span>
      <Handle 
        type="source" 
        :position="Position.Right"
        id="body"
        class="!w-2.5 !h-2.5 !bg-amber-400 !border-2 !border-white dark:!border-[#1e1711] !rounded-full !-mr-[5px]" />
    </div>

    <div class="absolute right-0 top-[90px] flex items-center">
      <span class="absolute right-5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 pointer-events-none">DONE</span>
      <Handle 
        type="source" 
        :position="Position.Right"
        id="done"
        class="!w-2.5 !h-2.5 !bg-white dark:!bg-amber-900 !border-2 !border-amber-500 !rounded-full !-mr-[5px]" />
    </div>
  </div>
</template>
