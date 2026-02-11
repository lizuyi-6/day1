<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Bell } from 'lucide-vue-next'

defineProps<{
  data: any
  id: string
  selected?: boolean
}>()
</script>

<template>
  <div
    class="workflow-node px-4 py-3 rounded-xl shadow-md border-2 transition-all duration-200 min-w-[160px]"
    :class="selected ? 'border-rose-500 shadow-lg shadow-rose-200' : 'border-rose-200 hover:border-rose-300'"
  >
    <Handle type="target" :position="Position.Left" class="!bg-rose-500 !w-3 !h-3" />

    <div class="flex items-center gap-2 mb-2">
      <div class="p-1.5 bg-rose-100 rounded-lg">
        <Bell :size="16" class="text-rose-600" />
      </div>
      <div class="font-bold text-sm text-charcoal">{{ data.label || '通知' }}</div>
    </div>

    <div class="text-[10px] text-khaki space-y-1">
      <div>渠道: {{ data.channel || '系统通知' }}</div>
      <div v-if="data.message" class="truncate">{{ data.message }}</div>
    </div>

    <Handle type="source" :position="Position.Right" class="!bg-rose-500 !w-3 !h-3" />
  </div>
</template>

<style scoped>
.workflow-node {
  background: linear-gradient(135deg, #ffffff 0%, #fff1f2 100%);
}
</style>
