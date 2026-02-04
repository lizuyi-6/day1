<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Globe } from 'lucide-vue-next'

defineProps(['data', 'selected'])
</script>

<template>
  <div class="w-[220px] rounded-md bg-white shadow-lg z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-amber-500 shadow-xl' : 'border border-amber-500 shadow-amber-100 ring-1 ring-amber-500/20'
       ]">

    <!-- Header -->
    <div class="flex items-center gap-3 border-b border-amber-100 bg-amber-50/50 px-3 py-2.5 rounded-t-md">
        <div class="flex h-8 w-8 items-center justify-center rounded bg-white text-amber-600 shadow-sm ring-1 ring-amber-200">
            <Globe :size="16" />
        </div>
        <div>
            <h3 class="text-xs font-bold text-amber-950 uppercase tracking-wide">{{ data.label || 'HTTP REQUEST' }}</h3>
            <p class="text-[10px] font-medium text-amber-500/80">External Data</p>
        </div>
    </div>

    <!-- Body -->
    <div class="p-3 space-y-2">
         <div class="flex items-center gap-2">
             <span class="px-1.5 py-0.5 rounded text-[9px] font-bold text-white bg-amber-500 shadow-sm"
                   :class="{'bg-green-500': data.method === 'POST', 'bg-blue-500': data.method === 'GET'}">
                 {{ data.method || 'GET' }}
             </span>
             <span class="text-[10px] font-mono text-slate-600 truncate flex-1">{{ data.url || 'https://api...' }}</span>
         </div>
    </div>

    <!-- Inputs -->
    <Handle type="target" :position="Position.Left"
            class="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white !rounded-full !-ml-[5px]" />

    <!-- Outputs -->
    <Handle type="source" :position="Position.Right"
            class="!w-2.5 !h-2.5 !bg-white !border-2 !border-amber-500 !rounded-full !-mr-[5px]" />
  </div>
</template>

