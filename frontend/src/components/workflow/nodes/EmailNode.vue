<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Mail } from 'lucide-vue-next'

defineProps<{
  data: any
  id: string
  selected?: boolean
}>()
</script>

<template>
  <div
    class="workflow-node px-4 py-3 rounded-xl shadow-md border-2 transition-all duration-200 min-w-[160px]"
    :class="selected ? 'border-sky-500 shadow-lg shadow-sky-200' : 'border-sky-200 hover:border-sky-300'"
  >
    <Handle type="target" :position="Position.Left" class="!bg-sky-500 !w-3 !h-3" />

    <div class="flex items-center gap-2 mb-2">
      <div class="p-1.5 bg-sky-100 rounded-lg">
        <Mail :size="16" class="text-sky-600" />
      </div>
      <div class="font-bold text-sm text-charcoal">{{ data.label || '邮件' }}</div>
    </div>

    <div class="text-[10px] text-khaki space-y-1">
      <div v-if="data.to">收件人: {{ data.to }}</div>
      <div v-if="data.subject" class="truncate">主题: {{ data.subject }}</div>
    </div>

    <Handle type="source" :position="Position.Right" class="!bg-sky-500 !w-3 !h-3" />
  </div>
</template>

<style scoped>
.workflow-node {
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
}
</style>
