<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Database } from 'lucide-vue-next'
import { computed } from 'vue'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  data: any
  selected: boolean
}>()

const inputs = computed<Variable[]>(() => [
  {
    name: 'query',
    type: 'string',
    description: '搜索查询',
    defaultValue: props.data.query || ''
  }
])

const outputs = computed<Variable[]>(() => [
  {
    name: 'results',
    type: 'array',
    description: '搜索结果'
  },
  {
    name: 'context',
    type: 'string',
    description: '上下文文本'
  }
])

const isActive = computed(() => props.data.status === 'running')
const collection = computed(() => props.data.collection || 'default_kb')
</script>

<template>
  <div class="w-[220px] rounded-md bg-white dark:bg-[#1e1711] shadow-md z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-emerald-500 shadow-xl' : 'border border-emerald-500/30 dark:border-emerald-500/20 shadow-emerald-100/50 dark:shadow-emerald-900/20 ring-1 ring-emerald-500/10',
         isActive ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : ''
       ]">

    <div class="flex items-center gap-3 border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/20 px-3 py-2.5 rounded-t-md">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-white dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-200 dark:ring-emerald-700">
        <Database :size="16" />
      </div>
      <div>
        <h3 class="text-xs font-bold text-emerald-950 dark:text-emerald-300 uppercase tracking-wide">{{ data.label || '知识库' }}</h3>
        <p class="text-[10px] font-medium text-emerald-500/80 dark:text-emerald-400/60">Data Retrieval</p>
      </div>
    </div>

    <div class="p-3">
      <div class="bg-emerald-50/30 dark:bg-emerald-900/20 rounded border border-emerald-100 dark:border-emerald-800/50 p-2 text-[10px] text-emerald-800 dark:text-emerald-400">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span class="font-semibold uppercase text-[9px]">Collection</span>
        </div>
        <div class="truncate font-mono text-emerald-700 dark:text-emerald-300">{{ collection }}</div>
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10 px-3 py-2 rounded-b-md">
      <div class="flex items-center gap-2 text-[9px] text-emerald-500 dark:text-emerald-400/60">
        <span>输出:</span>
        <span class="font-mono">results, context</span>
      </div>
    </div>

    <Handle 
      type="target" 
      :position="Position.Left"
      class="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white dark:!border-[#1e1711] !rounded-full !-ml-[5px]" />

    <Handle 
      type="source" 
      :position="Position.Right"
      class="!w-2.5 !h-2.5 !bg-white dark:!bg-emerald-900 !border-2 !border-emerald-500 !rounded-full !-mr-[5px]" />
  </div>
</template>
