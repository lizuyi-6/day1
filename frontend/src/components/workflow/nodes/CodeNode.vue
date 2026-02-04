<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { FileCode, Play } from 'lucide-vue-next'

defineProps(['data', 'selected'])
</script>

<template>
  <div class="w-[240px] rounded-md bg-white shadow-lg z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-orange-500 shadow-xl' : 'border border-orange-500 shadow-orange-100 ring-1 ring-orange-500/20'
       ]">

    <!-- Header -->
    <div class="flex items-center gap-3 border-b border-orange-100 bg-orange-50/50 px-3 py-2.5 rounded-t-md">
        <div class="flex h-8 w-8 items-center justify-center rounded bg-white text-orange-600 shadow-sm ring-1 ring-orange-200">
            <FileCode :size="16" />
        </div>
        <div>
            <h3 class="text-xs font-bold text-orange-950 uppercase tracking-wide">{{ data.label || 'PYTHON SCRIPT' }}</h3>
            <p class="text-[10px] font-medium text-orange-500/80">Compute</p>
        </div>
        <div class="ml-auto">
             <div class="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-orange-600 cursor-pointer hover:bg-orange-200">
                <Play :size="10" class="ml-0.5" />
             </div>
        </div>
    </div>

    <!-- Body -->
    <div class="p-3 space-y-2">
         <div class="rounded border border-orange-100 bg-orange-50/30 p-2 relative overflow-hidden group">
            <div class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="text-[9px] font-mono text-orange-400">py</span>
            </div>
            <pre class="text-[10px] font-mono text-orange-900 leading-relaxed overflow-hidden">{{ data.code ? data.code.substring(0, 60) + (data.code.length > 60 ? '...' : '') : '# Write your python code...' }}</pre>
        </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between border-t border-orange-50 bg-orange-50/30 px-3 py-2 rounded-b-md">
        <div class="flex items-center gap-1.5">
            <span class="text-[9px] font-medium text-orange-600">v3.10</span>
        </div>
    </div>

    <!-- Inputs -->
    <Handle type="target" :position="Position.Left"
            class="!w-2.5 !h-2.5 !bg-orange-500 !border-2 !border-white !rounded-full !-ml-[5px]" />

    <!-- Outputs -->
    <Handle type="source" :position="Position.Right"
            class="!w-2.5 !h-2.5 !bg-white !border-2 !border-orange-500 !rounded-full !-mr-[5px]" />
  </div>
</template>

