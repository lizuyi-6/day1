<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Bell } from 'lucide-vue-next'
import { computed } from 'vue'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  data: any
  selected: boolean
}>()

const inputs = computed<Variable[]>(() => [
  {
    name: 'message',
    type: 'string',
    description: '通知内容',
    defaultValue: props.data.message || ''
  },
  {
    name: 'channel',
    type: 'string',
    description: '通知渠道',
    defaultValue: props.data.channel || 'system'
  }
])

const outputs = computed<Variable[]>(() => [
  {
    name: 'success',
    type: 'boolean',
    description: '发送是否成功'
  }
])

const isActive = computed(() => props.data.status === 'running')
const channel = computed(() => props.data.channel || '系统通知')
</script>

<template>
  <div class="w-[200px] rounded-md bg-white dark:bg-[#1e1711] shadow-md z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-rose-500 shadow-xl' : 'border border-rose-500/30 dark:border-rose-500/20 shadow-rose-100/50 dark:shadow-rose-900/20 ring-1 ring-rose-500/10',
         isActive ? 'ring-2 ring-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : ''
       ]">

    <div class="flex items-center gap-3 border-b border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/20 px-3 py-2.5 rounded-t-md">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-white dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 shadow-sm ring-1 ring-rose-200 dark:ring-rose-700">
        <Bell :size="16" />
      </div>
      <div>
        <h3 class="text-xs font-bold text-rose-950 dark:text-rose-300 uppercase tracking-wide">{{ data.label || '通知' }}</h3>
        <p class="text-[10px] font-medium text-rose-500/80 dark:text-rose-400/60">Notification</p>
      </div>
    </div>

    <div class="p-3 space-y-1.5">
      <div class="text-[10px] text-rose-700 dark:text-rose-400/70">
        渠道: {{ channel }}
      </div>
      <div v-if="data.message" class="text-[10px] text-rose-600/70 dark:text-rose-400/50 truncate">
        {{ data.message }}
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/10 px-3 py-2 rounded-b-md">
      <div class="flex items-center gap-2 text-[9px] text-rose-500 dark:text-rose-400/60">
        <span>输出:</span>
        <span class="font-mono">success</span>
      </div>
    </div>

    <Handle 
      type="target" 
      :position="Position.Left"
      class="!w-2.5 !h-2.5 !bg-rose-500 !border-2 !border-white dark:!border-[#1e1711] !rounded-full !-ml-[5px]" />

    <Handle 
      type="source" 
      :position="Position.Right"
      class="!w-2.5 !h-2.5 !bg-white dark:!bg-rose-900 !border-2 !border-rose-500 !rounded-full !-mr-[5px]" />
  </div>
</template>
