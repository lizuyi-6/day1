<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Database } from 'lucide-vue-next'

defineProps(['data', 'selected'])
</script>

<template>
  <div class="w-[200px] rounded-md bg-white shadow-lg z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-emerald-500 shadow-xl' : 'border border-emerald-500 shadow-emerald-100 ring-1 ring-emerald-500/20'
       ]">

    <!-- Header -->
    <div class="flex items-center gap-3 border-b border-emerald-100 bg-emerald-50/50 px-3 py-2.5 rounded-t-md">
        <div class="flex h-8 w-8 items-center justify-center rounded bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-200">
            <Database :size="16" />
        </div>
        <div>
            <h3 class="text-xs font-bold text-emerald-950 uppercase tracking-wide">{{ data.label || 'VECTOR SEARCH' }}</h3>
            <p class="text-[10px] font-medium text-emerald-500/80">Data Retrieval</p>
        </div>
    </div>

    <!-- Body -->
    <div class="p-3">
         <div class="bg-emerald-50/30 rounded border border-emerald-100 p-2 text-[10px] text-emerald-800">
             <div class="flex items-center gap-2 mb-1">
                 <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                 <span class="font-semibold uppercase text-[9px]">Collection</span>
             </div>
             <div class="truncate font-mono">default_kb</div>
         </div>
    </div>

    <!-- Inputs -->
    <Handle type="target" :position="Position.Left"
            class="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white !rounded-full !-ml-[5px]" />

    <!-- Outputs -->
    <Handle type="source" :position="Position.Right"
            class="!w-2.5 !h-2.5 !bg-white !border-2 !border-emerald-500 !rounded-full !-mr-[5px]" />
  </div>
</template>

