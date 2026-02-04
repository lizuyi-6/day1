<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Search } from 'lucide-vue-next'

defineProps(['data', 'selected'])
</script>

<template>
  <div class="custom-node search-node" :class="{ selected }">
    <div class="icon-wrapper">
        <Search class="icon-svg" :size="20" />
    </div>
    <div>
        <div class="title">搜索 (Search)</div>
        <div class="query">{{ data.query || 'Google Search...' }}</div>
    </div>

    <Handle type="target" :position="Position.Left" class="handle-input" />
    <Handle type="source" :position="Position.Right" class="handle-output" />
  </div>
</template>

<style scoped>
.search-node {
  background: white;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 20px;
  padding: 8px 16px;
  min-width: 160px;
  color: var(--text-main);
  font-family: var(--font-ui);
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.2s;
}

.search-node:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}

.search-node.selected {
  border-color: #bdc3c7;
  box-shadow: 0 0 0 2px rgba(189, 195, 199, 0.4);
}

.icon { font-size: 1.2rem; }

.title {
    font-size: 0.7rem;
    color: var(--text-dim);
    text-transform: uppercase;
    font-weight: 600;
}

.query {
    font-weight: 500;
    max-width: 120px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-main);
}

.handle-input {
    background: #bdc3c7;
    width: 8px;
    height: 8px;
    border: 2px solid white;
}
.handle-output {
    background: white;
    width: 8px;
    height: 8px;
    border: 2px solid #bdc3c7;
}
</style>
