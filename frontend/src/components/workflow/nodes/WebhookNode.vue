<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Webhook } from 'lucide-vue-next'

defineProps<{
  data: any
  id: string
  selected?: boolean
}>()
</script>

<template>
  <div
    class="workflow-node px-4 py-3 rounded-xl shadow-md border-2 transition-all duration-200 min-w-[160px]"
    :class="selected ? 'border-violet-500 shadow-lg shadow-violet-200' : 'border-violet-200 hover:border-violet-300'"
  >
    <Handle type="target" :position="Position.Left" class="!bg-violet-500 !w-3 !h-3" />

    <div class="flex items-center gap-2 mb-2">
      <div class="p-1.5 bg-violet-100 rounded-lg">
        <Webhook :size="16" class="text-violet-600" />
      </div>
      <div class="font-bold text-sm text-charcoal">{{ data.label || 'Webhook' }}</div>
    </div>

    <div class="text-[10px] text-khaki space-y-1">
      <div>方法: {{ data.method || 'POST' }}</div>
      <div v-if="data.url" class="truncate">{{ data.url }}</div>
    </div>

    <Handle type="source" :position="Position.Right" class="!bg-violet-500 !w-3 !h-3" />
  </div>
</template>

<style scoped>
.workflow-node {
  background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
}
</style>
