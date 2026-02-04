<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { Sparkles, Activity, Clock } from 'lucide-vue-next'

const props = defineProps(['data', 'selected'])

const modelDisplay = computed(() => {
    return props.data.model || 'gpt-4-turbo'
})

const isStreaming = computed(() => props.data.status === 'streaming')
</script>

<template>
  <div class="w-[260px] rounded-md bg-white shadow-lg z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-indigo-500 shadow-xl' : 'border border-indigo-500 shadow-indigo-100 ring-1 ring-indigo-500/20'
       ]">

    <!-- Header -->
    <div class="flex items-center gap-3 border-b border-indigo-100 bg-indigo-50/50 px-3 py-2.5 rounded-t-md">
        <div class="flex h-8 w-8 items-center justify-center rounded bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-200">
            <Sparkles :size="16" />
        </div>
        <div>
            <h3 class="text-xs font-bold text-indigo-950 uppercase tracking-wide">{{ data.label || 'LLM GENERATION' }}</h3>
            <p class="text-[10px] font-medium text-indigo-500/80">{{ modelDisplay }}</p>
        </div>
        <div class="ml-auto flex gap-1">
             <div v-if="isStreaming" class="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
        </div>
    </div>

    <!-- Body -->
    <div class="p-3 space-y-2">
        <div class="rounded border border-indigo-100 bg-indigo-50/30 p-2">
            <div class="flex items-center justify-between mb-1">
                <span class="text-[9px] font-bold text-indigo-400 uppercase">Input</span>
                <span class="text-[9px] font-mono text-indigo-300">str</span>
            </div>
            <p class="text-[10px] text-indigo-900 line-clamp-2 leading-relaxed">
                {{ data.prompt || 'Waiting for prompt...' }}
            </p>
        </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between border-t border-indigo-50 bg-indigo-50/30 px-3 py-2 rounded-b-md">
        <div class="flex items-center gap-1.5">
            <Activity :size="10" class="text-indigo-400" />
            <span class="text-[9px] font-medium text-indigo-600">Idle</span>
        </div>
        <div class="flex items-center gap-1.5">
            <Clock :size="10" class="text-indigo-400" />
            <span class="text-[9px] font-mono text-indigo-600">0.05s</span>
        </div>
    </div>

    <!-- Inputs -->
    <Handle type="target" :position="Position.Left"
            class="!w-2.5 !h-2.5 !bg-indigo-500 !border-2 !border-white !rounded-full !-ml-[5px]" />

    <!-- Outputs -->
    <Handle type="source" :position="Position.Right"
            class="!w-2.5 !h-2.5 !bg-white !border-2 !border-indigo-500 !rounded-full !-mr-[5px]" />
  </div>
</template>

