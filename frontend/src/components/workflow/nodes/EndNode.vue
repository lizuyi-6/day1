<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Layers } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps(['data', 'selected'])
const isCompleted = computed(() => props.data.status === 'completed')
</script>

<template>
  <div class="w-[180px] rounded-md bg-white shadow-md z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-slate-500 shadow-xl' : 'border border-slate-500 shadow-slate-100 ring-1 ring-slate-500/20',
         isCompleted ? 'ring-2 ring-emerald-500/50 bg-emerald-50/20' : ''
       ]">

    <!-- Header -->
    <div class="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-3 py-2 rounded-t-md">
        <div class="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-white shadow-sm">
            <Layers :size="12" />
        </div>
        <div class="flex-1">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wide">{{ data.label || 'END' }}</h3>
        </div>
    </div>

    <!-- Body -->
    <div class="px-3 py-2 flex items-center justify-between text-[10px] text-slate-500">
        <span>Output</span>
        <span class="font-mono bg-slate-100 px-1 rounded text-slate-600">JSON</span>
    </div>

    <!-- Inputs Only -->
    <Handle type="target" :position="Position.Left"
            class="!w-2.5 !h-2.5 !bg-slate-500 !border-2 !border-white !rounded-full !-ml-[5px]" />
  </div>
</template>

