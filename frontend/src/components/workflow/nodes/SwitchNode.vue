<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Shuffle } from 'lucide-vue-next'
import { computed } from 'vue'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  data: any
  selected: boolean
}>()

const inputs = computed<Variable[]>(() => [
  {
    name: 'value',
    type: 'any',
    description: '要匹配的值',
    defaultValue: props.data.value
  }
])

const outputs = computed<Variable[]>(() => [
  { name: 'default', type: 'any', description: '默认分支' },
  { name: 'case1', type: 'any', description: '分支 1' },
  { name: 'case2', type: 'any', description: '分支 2' }
])

const isActive = computed(() => props.data.status === 'running')

const branches = computed(() => props.data.branches || [
  { id: 'default', label: 'Default' },
  { id: 'case1', label: 'Branch 1' },
  { id: 'case2', label: 'Branch 2' }
])
</script>

<template>
  <div class="w-[200px] rounded-md bg-white dark:bg-[#1e1711] shadow-md z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-rose-500 shadow-xl' : 'border border-rose-500/30 dark:border-rose-500/20 shadow-rose-100/50 dark:shadow-rose-900/20 ring-1 ring-rose-500/10',
         isActive ? 'ring-2 ring-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : ''
       ]">

    <div class="flex items-center gap-3 border-b border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/20 px-3 py-2.5 rounded-t-md">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-white dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 shadow-sm ring-1 ring-rose-200 dark:ring-rose-700">
        <Shuffle :size="16" />
      </div>
      <div>
        <h3 class="text-xs font-bold text-rose-950 dark:text-rose-300 uppercase tracking-wide">{{ data.label || '多路分支' }}</h3>
        <p class="text-[10px] font-medium text-rose-500/80 dark:text-rose-400/60">Switch</p>
      </div>
    </div>

    <div class="p-0">
      <div 
        v-for="(branch, index) in branches" 
        :key="branch.id"
        class="flex items-center justify-between px-3 py-2 border-b border-rose-100/50 dark:border-rose-900/20 last:border-b-0 relative"
        :class="{ 'bg-rose-50/30 dark:bg-rose-900/10': index % 2 === 0 }">
        <span class="text-[10px] font-medium text-rose-600 dark:text-rose-400">{{ branch.label }}</span>
        <Handle 
          type="source" 
          :position="Position.Right"
          :id="branch.id"
          class="!w-2.5 !h-2.5 !bg-white dark:!bg-rose-900 !border-2 !border-rose-500 !rounded-full !-mr-[5px]" />
      </div>
    </div>

    <Handle 
      type="target" 
      :position="Position.Left"
      class="!w-2.5 !h-2.5 !bg-rose-500 !border-2 !border-white dark:!border-[#1e1711] !rounded-full !-ml-[5px]" />
  </div>
</template>
