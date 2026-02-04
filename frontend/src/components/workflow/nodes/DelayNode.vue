<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Hourglass } from 'lucide-vue-next'

defineProps(['data', 'selected'])
</script>

<template>
  <div class="custom-node delay-node" :class="{ selected }">
    <div class="node-content">
        <div class="icon-wrapper">
             <Hourglass class="icon-svg" :size="18" />
        </div>
        <div class="info-wrapper">
             <div class="title">延时 (Delay)</div>
             <div class="value">{{ data.duration || '5s' }}</div>
        </div>
    </div>

    <Handle type="target" :position="Position.Left" class="handle-input" />
    <Handle type="source" :position="Position.Right" class="handle-output" />
  </div>
</template>

<style scoped>
.delay-node {
  background: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(127, 140, 141, 0.2);
  border-radius: 50px; /* Pill shape for Delay */
  padding: 6px 16px;
  min-width: 140px;
  color: var(--text-main);
  font-family: var(--font-ui);
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.delay-node:hover {
    border-color: rgba(127, 140, 141, 0.5);
    box-shadow: 0 6px 16px rgba(0,0,0,0.08);
    transform: translateY(-2px);
}

.delay-node.selected {
  border-color: #7f8c8d;
  box-shadow: 0 0 0 2px rgba(127, 140, 141, 0.2), 0 8px 25px rgba(0,0,0,0.1);
}

.node-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.icon-wrapper {
    width: 32px;
    height: 32px;
    background: rgba(127, 140, 141, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
}

.info-wrapper {
    display: flex;
    flex-direction: column;
}

.title {
    font-size: 0.65rem;
    color: var(--text-dim);
    text-transform: uppercase;
    font-weight: 600;
}
.value {
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--text-main);
}

.handle-input {
    background: #7f8c8d;
    width: 10px;
    height: 10px;
    border: 2px solid white;
}
.handle-output {
    background: white;
    width: 10px;
    height: 10px;
    border: 2px solid #7f8c8d;
}
</style>
