<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { MessageSquare } from 'lucide-vue-next'
import { computed } from 'vue'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  data: any
  selected: boolean
}>()

const isActive = computed(() => props.data.status === 'running')

const inputs = computed<Variable[]>(() => props.data.inputs || [])
</script>

<template>
  <div class="w-[240px] rounded-md bg-white shadow-md z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-blue-500 shadow-xl' : 'border border-blue-500 shadow-blue-100 ring-1 ring-blue-500/20',
         isActive ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''
       ]">

    <!-- Header -->
    <div class="flex items-center gap-3 border-b border-blue-100 bg-blue-50/50 px-3 py-2.5 rounded-t-md">
        <div class="flex h-8 w-8 items-center justify-center rounded bg-white text-blue-600 shadow-sm ring-1 ring-blue-200">
            <MessageSquare :size="16" />
        </div>
        <div>
            <h3 class="text-xs font-bold text-blue-950 uppercase tracking-wide">{{ data.label || 'START' }}</h3>
            <p class="text-[10px] font-medium text-blue-500/80">Trigger</p>
        </div>
    </div>

    <!-- Body - Input Variables List -->
    <div class="p-3 space-y-2">
        <div v-if="inputs.length === 0" class="text-center py-4 text-slate-400">
            <p class="text-[10px]">暂无输入变量</p>
        </div>
        <div v-for="(input, index) in inputs" :key="index" 
             class="rounded border border-blue-100 bg-blue-50/30 p-2">
            <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-bold text-blue-400 uppercase">{{ input.name }}</span>
                <span class="text-[9px] font-mono text-blue-300">{{ input.type }}</span>
            </div>
            <p class="text-[10px] text-blue-700 line-clamp-2 leading-relaxed">
                {{ input.description || '输入变量' }}
            </p>
            <input type="text" 
                   :value="input.defaultValue || ''"
                   @input="data.inputs[index].defaultValue = ($event.target as HTMLInputElement).value"
                   class="w-full text-[10px] text-slate-500 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-300"
                   placeholder="默认值" />
        </div>
    </div>

    <!-- Outputs -->
    <Handle type="source" :position="Position.Right"
            class="!w-2.5 !h-2.5 !bg-white !border-2 !border-blue-500 !rounded-full !-mr-[5px]" />
  </div>
</template>
