<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Webhook } from 'lucide-vue-next'
import { computed } from 'vue'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  data: any
  selected: boolean
}>()

const inputs = computed<Variable[]>(() => [])

const outputs = computed<Variable[]>(() => [
  {
    name: 'payload',
    type: 'object',
    description: 'Webhook 载荷'
  },
  {
    name: 'headers',
    type: 'object',
    description: '请求头'
  }
])

const isActive = computed(() => props.data.status === 'running')
const method = computed(() => props.data.method || 'POST')
</script>

<template>
  <div class="w-[200px] rounded-md bg-white dark:bg-[#1e1711] shadow-md z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-violet-500 shadow-xl' : 'border border-violet-500/30 dark:border-violet-500/20 shadow-violet-100/50 dark:shadow-violet-900/20 ring-1 ring-violet-500/10',
         isActive ? 'ring-2 ring-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.5)]' : ''
       ]">

    <div class="flex items-center gap-3 border-b border-violet-100 dark:border-violet-900/30 bg-violet-50/50 dark:bg-violet-900/20 px-3 py-2.5 rounded-t-md">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-white dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 shadow-sm ring-1 ring-violet-200 dark:ring-violet-700">
        <Webhook :size="16" />
      </div>
      <div>
        <h3 class="text-xs font-bold text-violet-950 dark:text-violet-300 uppercase tracking-wide">{{ data.label || 'Webhook' }}</h3>
        <p class="text-[10px] font-medium text-violet-500/80 dark:text-violet-400/60">Trigger</p>
      </div>
    </div>

    <div class="p-3 space-y-2">
      <div class="flex items-center gap-2">
        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold text-white bg-violet-500 shadow-sm"
              :class="{'bg-emerald-500': method === 'GET', 'bg-sky-500': method === 'PUT', 'bg-rose-500': method === 'DELETE'}">
          {{ method }}
        </span>
        <span class="text-[10px] font-mono text-slate-600 dark:text-slate-400 truncate flex-1">{{ data.url || '/webhook/...' }}</span>
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-violet-100 dark:border-violet-900/30 bg-violet-50/30 dark:bg-violet-900/10 px-3 py-2 rounded-b-md">
      <div class="flex items-center gap-2 text-[9px] text-violet-500 dark:text-violet-400/60">
        <span>输出:</span>
        <span class="font-mono">payload</span>
      </div>
    </div>

    <Handle 
      type="source" 
      :position="Position.Right"
      class="!w-2.5 !h-2.5 !bg-white dark:!bg-violet-900 !border-2 !border-violet-500 !rounded-full !-mr-[5px]" />
  </div>
</template>
