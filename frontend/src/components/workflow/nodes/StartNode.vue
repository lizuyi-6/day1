<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { MessageSquare, Plus, X } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  data: any
  selected: boolean
}>()

const emit = defineEmits<{
  (e: 'update:data', data: any): void
}>()

const isActive = computed(() => props.data.status === 'running')

const outputs = computed<Variable[]>(() => props.data.outputs || [])

const newOutputName = ref('')

const addOutput = () => {
  if (!newOutputName.value.trim()) return
  
  const newOutput: Variable = {
    name: newOutputName.value.trim(),
    type: 'string',
    description: '',
    defaultValue: ''
  }
  
  const updatedOutputs = [...outputs.value, newOutput]
  emit('update:data', {
    ...props.data,
    outputs: updatedOutputs
  })
  
  newOutputName.value = ''
}

const removeOutput = (index: number) => {
  const updatedOutputs = outputs.value.filter((_, i) => i !== index)
  emit('update:data', {
    ...props.data,
    outputs: updatedOutputs
  })
}

const updateOutput = (index: number, field: keyof Variable, value: any) => {
  const updatedOutputs = [...outputs.value]
  updatedOutputs[index] = { ...updatedOutputs[index], [field]: value }
  emit('update:data', {
    ...props.data,
    outputs: updatedOutputs
  })
}
</script>

<template>
  <div class="w-[260px] rounded-md bg-white dark:bg-[#1e1711] shadow-md z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-blue-500 shadow-xl' : 'border border-blue-500/30 dark:border-blue-500/20 shadow-blue-100/50 dark:shadow-blue-900/20 ring-1 ring-blue-500/10',
         isActive ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''
       ]">

    <div class="flex items-center gap-3 border-b border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/20 px-3 py-2.5 rounded-t-md">
        <div class="flex h-8 w-8 items-center justify-center rounded bg-white dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-200 dark:ring-blue-700">
            <MessageSquare :size="16" />
        </div>
        <div>
            <h3 class="text-xs font-bold text-blue-950 dark:text-blue-300 uppercase tracking-wide">{{ data.label || 'START' }}</h3>
            <p class="text-[10px] font-medium text-blue-500/80 dark:text-blue-400/60">工作流入口</p>
        </div>
    </div>

    <div class="p-3 space-y-2">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">输出变量</span>
          <span class="text-[9px] text-blue-400/60">{{ outputs.length }} 个</span>
        </div>
        
        <div v-if="outputs.length === 0" class="text-center py-3 text-blue-400/50 dark:text-blue-500/30 bg-blue-50/30 dark:bg-blue-900/10 rounded">
            <p class="text-[10px]">暂无输出变量</p>
            <p class="text-[9px] mt-1">添加变量以接收用户输入</p>
        </div>
        
        <div v-for="(output, index) in outputs" :key="index" 
             class="rounded border border-blue-100 dark:border-blue-800/50 bg-blue-50/30 dark:bg-blue-900/20 p-2 group relative">
            <button 
              @click="removeOutput(index)"
              class="absolute top-1 right-1 p-0.5 rounded text-blue-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all">
              <X :size="10" />
            </button>
            
            <div class="flex items-center gap-2 mb-1.5">
              <input type="text" 
                     :value="output.name"
                     @input="updateOutput(index, 'name', ($event.target as HTMLInputElement).value)"
                     class="flex-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-transparent border-none outline-none uppercase" />
              <span class="text-[8px] font-mono text-blue-300 dark:text-blue-500 bg-blue-100/50 dark:bg-blue-800/30 px-1.5 py-0.5 rounded">{{ output.type }}</span>
            </div>
            
            <input type="text" 
                   :value="output.description || ''"
                   @input="updateOutput(index, 'description', ($event.target as HTMLInputElement).value)"
                   class="w-full text-[9px] text-blue-500/70 dark:text-blue-400/50 bg-white/50 dark:bg-blue-900/30 border border-blue-100/50 dark:border-blue-800/30 rounded px-2 py-1 outline-none focus:border-blue-300"
                   placeholder="变量描述" />
        </div>

        <div class="flex items-center gap-1.5 pt-2">
          <input type="text" 
                 v-model="newOutputName"
                 @keyup.enter="addOutput"
                 class="flex-1 text-[10px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-blue-900/20 border border-slate-200 dark:border-blue-800/30 rounded px-2 py-1.5 outline-none focus:border-blue-300"
                 placeholder="添加新变量..." />
          <button 
            @click="addOutput"
            :disabled="!newOutputName.trim()"
            class="p-1.5 rounded bg-blue-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors">
            <Plus :size="12" />
          </button>
        </div>
    </div>

    <!-- Output Handles - 每个输出变量一个 Handle -->
    <Handle 
      v-for="(output, index) in outputs" 
      :key="`output-${index}`"
      type="source" 
      :position="Position.Right"
      :id="output.name"
      :style="{ top: `${130 + index * 50}px` }"
      class="!w-2.5 !h-2.5 !bg-white dark:!bg-blue-900 !border-2 !border-blue-500 !rounded-full !-mr-[5px]" />
    
    <!-- 默认输出 Handle（当没有定义输出变量时） -->
    <Handle 
      v-if="outputs.length === 0"
      type="source" 
      :position="Position.Right"
      class="!w-2.5 !h-2.5 !bg-white dark:!bg-blue-900 !border-2 !border-blue-500 !rounded-full !-mr-[5px]" />
  </div>
</template>
