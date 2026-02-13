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
    defaultValue: props.data?.value ?? ''
  }
])

const isActive = computed(() => props.data?.status === 'running')
const variableName = computed(() => props.data?.variableName ?? 'var')
const variableValue = computed(() => props.data?.value ?? 'value')
</script>

<template>
  <div class="w-[180px] rounded-md bg-white dark:bg-gray-800 shadow-md z-20 transition-all duration-200" :class="{ 'opacity-50': !isActive }">
    <!-- 节点左侧：输入和输出 -->
    <div class="flex items-center gap-3 border-b border-sky-100 dark:border-sky-900/30 px-3 py-2 bg-white dark:bg-gray-800/50">
      <div class="flex items-center gap-2">
        <Handle
          type="source"
          :position="Position.Right"
          :class="{ '!bg-sky-500 !border-sky-600': isActive }"
        />
        <Package
          :size="16"
          class="text-sky-600 dark:text-sky-400"
        />
      </div>
      <div class="flex items-center gap-2">
        <div class="text-xs font-mono text-gray-500 dark:text-gray-400">
          {{ variableName }}
        </div>
        <div class="text-[10px] font-mono text-gray-600 dark:text-gray-300">
          {{ variableValue }}
        </div>
      </div>
    </div>

    <!-- 节点右侧：变量名和值标签 -->
    <div class="flex-1 flex flex-col items-center gap-2 border-b border-sky-100 dark:border-sky-900/30 px-3 py-2 bg-white dark:bg-gray-800/50">
      <div class="flex-1 grid grid-cols-[1fr_auto] items-center gap-3">
        <div class="flex items-center gap-2">
          <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">变量</h3>
          <p class="text-[10px] font-medium text-sky-600 dark:text-sky-400 mb-1 truncate">{{ variableName }}</p>
        </div>
        <div class="flex items-center gap-2">
          <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">值</h3>
          <p class="text-[10px] font-medium text-sky-600 dark:text-sky-400 mb-1 truncate">{{ variableValue }}</p>
        </div>
      </div>
    </div>

    <!-- 输出端口 -->
    <Handle
      type="target"
      :position="Position.Left"
      :class="{ '!bg-sky-500 !border-sky-600': isActive }"
    />
  </div>
</template>
