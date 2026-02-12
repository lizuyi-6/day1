<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Globe } from 'lucide-vue-next'
import { computed } from 'vue'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  data: any
  selected: boolean
}>()

const inputs = computed<Variable[]>(() => [
  {
    name: 'url',
    type: 'string',
    description: '请求 URL',
    defaultValue: props.data.url || ''
  },
  {
    name: 'body',
    type: 'object',
    description: '请求体',
    defaultValue: props.data.body
  },
  {
    name: 'headers',
    type: 'object',
    description: '请求头',
    defaultValue: props.data.headers
  }
])

const outputs = computed<Variable[]>(() => [
  {
    name: 'response',
    type: 'object',
    description: '响应数据'
  },
  {
    name: 'status',
    type: 'number',
    description: '状态码'
  }
])

const isActive = computed(() => props.data.status === 'running')
const method = computed(() => props.data.method || 'GET')
</script>

<template>
  <div class="w-[220px] rounded-md bg-white dark:bg-[#1e1711] shadow-md z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-amber-500 shadow-xl' : 'border border-amber-500/30 dark:border-amber-500/20 shadow-amber-100/50 dark:shadow-amber-900/20 ring-1 ring-amber-500/10',
         isActive ? 'ring-2 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : ''
       ]">

    <div class="flex items-center gap-3 border-b border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/20 px-3 py-2.5 rounded-t-md">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-white dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shadow-sm ring-1 ring-amber-200 dark:ring-amber-700">
        <Globe :size="16" />
      </div>
      <div>
        <h3 class="text-xs font-bold text-amber-950 dark:text-amber-300 uppercase tracking-wide">{{ data.label || 'HTTP 请求' }}</h3>
        <p class="text-[10px] font-medium text-amber-500/80 dark:text-amber-400/60">External Data</p>
      </div>
    </div>

    <div class="p-3 space-y-2">
      <div class="flex items-center gap-2">
        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold text-white bg-amber-500 shadow-sm"
              :class="{'bg-emerald-500': method === 'POST', 'bg-sky-500': method === 'PUT', 'bg-rose-500': method === 'DELETE'}">
          {{ method }}
        </span>
        <span class="text-[10px] font-mono text-slate-600 dark:text-slate-400 truncate flex-1">{{ data.url || 'https://api...' }}</span>
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10 px-3 py-2 rounded-b-md">
      <div class="flex items-center gap-2 text-[9px] text-amber-500 dark:text-amber-400/60">
        <span>输出:</span>
        <span class="font-mono">response, status</span>
      </div>
    </div>

    <Handle 
      type="target" 
      :position="Position.Left"
      class="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white dark:!border-[#1e1711] !rounded-full !-ml-[5px]" />

    <Handle 
      type="source" 
      :position="Position.Right"
      class="!w-2.5 !h-2.5 !bg-white dark:!bg-amber-900 !border-2 !border-amber-500 !rounded-full !-mr-[5px]" />
  </div>
</template>
