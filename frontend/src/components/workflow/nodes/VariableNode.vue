<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Package } from 'lucide-vue-next'
import { computed } from 'vue'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  data: any
  selected: boolean
}>()

const inputs = computed<Variable[]>(() => [])

const outputs = computed<Variable[]>(() => {
  return [
    {
      name: 'value',
      type: 'any',
      description: '变量值（可以是固定值或变量引用）',
      defaultValue: props.data.value || ''
    }
  ]
})
</script>

<template>
  <div class="custom-node variable-node" :class="{ selected }">
    <div class="node-header">
      <div class="icon-wrapper">
        <Package class="icon-svg" :size="16" stroke="white" />
      </div>
      <div class="title">变量 (Var)</div>
    </div>
    <div class="node-body">
         <div class="var-name">{{ data.variableName || 'var_name' }}</div>
         <div class="arrow">⬇</div>
         <div class="var-value">{{ data.value || 'value' }}</div>
    </div>

    <!-- Footer - Output Variables List -->
    <div class="flex items-center justify-between border-t border-blue-100 bg-blue-50/30 px-3 py-2 rounded-b-md">
        <div class="flex items-center gap-2 text-[9px] text-blue-400">
            <span>输出:</span>
            <span class="font-mono">{{ outputs.map(o => o.name).join(', ') }}</span>
        </div>
    </div>

    <Handle type="target" :position="Position.Left" class="handle-input" />
    <Handle type="source" :position="Position.Right" class="handle-output" />
  </div>
</template>

<style scoped>
.variable-node {
  background: white;
  border: 1px solid rgba(52, 152, 219, 0.3);
  border-radius: 8px;
  width: 160px;
  color: var(--text-main);
  font-family: var(--font-ui);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.1);
  transition: all 0.2s;
}

.variable-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.15);
}

.variable-node.selected {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.node-header {
  background: #3498db;
  padding: 6px 10px;
  border-radius: 7px 7px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  color: white;
}

.node-body {
  padding: 10px;
  text-align: center;
}

.var-name {
    color: #3498db;
    font-family: monospace;
    font-weight: bold;
}

.arrow { color: var(--text-dim); font-size: 0.8rem; margin: 2px 0;}

.var-value {
    background: #f0f2f5;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8rem;
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-main);
}

.handle-input {
    background: #3498db;
    width: 10px;
    height: 10px;
    border: 2px solid white;
}

.handle-output {
    background: white;
    width: 10px;
    height: 10px;
    border: 2px solid #3498db;
}
</style>
