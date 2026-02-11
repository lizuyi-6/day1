<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Filter } from 'lucide-vue-next'

defineProps<{
  data: any
  id: string
  selected?: boolean
}>()
</script>

<template>
  <div
    class="workflow-node px-4 py-3 rounded-xl shadow-md border-2 transition-all duration-200 min-w-[160px]"
    :class="selected ? 'border-teal-500 shadow-lg shadow-teal-200' : 'border-teal-200 hover:border-teal-300'"
  >
    <Handle type="target" :position="Position.Left" class="!bg-teal-500 !w-3 !h-3" />

    <div class="flex items-center gap-2 mb-2">
      <div class="p-1.5 bg-teal-100 rounded-lg">
        <Filter :size="16" class="text-teal-600" />
      </div>
      <div class="font-bold text-sm text-charcoal">{{ data.label || '过滤' }}</div>
    </div>

    <div class="text-[10px] text-khaki space-y-1">
      <div>条件: {{ data.condition || '未设置' }}</div>
    </div>

    <Handle type="source" :position="Position.Right" class="!bg-teal-500 !w-3 !h-3" />
  </div>
</template>

<style scoped>
.workflow-node {
  background: linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%);
}
</style>
