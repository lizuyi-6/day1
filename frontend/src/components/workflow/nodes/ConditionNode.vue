<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { GitFork } from 'lucide-vue-next'

defineProps(['data', 'selected'])
</script>

<template>
  <div class="w-[200px] rounded-md bg-white shadow-lg z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-teal-500 shadow-xl' : 'border border-teal-500 shadow-teal-100 ring-1 ring-teal-500/20'
       ]">

    <!-- Header -->
    <div class="flex items-center gap-3 border-b border-teal-100 bg-teal-50/50 px-3 py-2.5 rounded-t-md">
        <div class="flex h-8 w-8 items-center justify-center rounded bg-white text-teal-600 shadow-sm ring-1 ring-teal-200">
            <GitFork :size="16" />
        </div>
        <div>
            <h3 class="text-xs font-bold text-teal-950 uppercase tracking-wide">{{ data.label || 'ROUTER' }}</h3>
            <p class="text-[10px] font-medium text-teal-500/80">Logic Control</p>
        </div>
    </div>

    <!-- Body -->
    <div class="p-3">
         <div class="rounded border border-teal-100 bg-teal-50/30 p-2 relative overflow-hidden">
             <div class="text-[9px] font-mono text-teal-700 break-words leading-relaxed">
                 {{ data.expression || 'if (condition)...' }}
             </div>
        </div>
    </div>

    <!-- Inputs -->
    <Handle type="target" :position="Position.Left"
            class="!w-2.5 !h-2.5 !bg-teal-500 !border-2 !border-white !rounded-full !-ml-[5px]" />

    <!-- True Branch -->
    <div class="absolute -right-[5px] top-[40px] flex items-center">
         <span class="absolute right-4 text-[9px] font-bold text-emerald-600 pointer-events-none">TRUE</span>
         <Handle type="source" :position="Position.Right" id="true"
            class="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white !rounded-full !relative !right-0 !transform-none" />
    </div>

    <!-- False Branch -->
    <div class="absolute -right-[5px] top-[80px] flex items-center">
         <span class="absolute right-4 text-[9px] font-bold text-red-500 pointer-events-none">FALSE</span>
         <Handle type="source" :position="Position.Right" id="false"
            class="!w-2.5 !h-2.5 !bg-red-500 !border-2 !border-white !rounded-full !relative !right-0 !transform-none" />
    </div>
  </div>
</template>

