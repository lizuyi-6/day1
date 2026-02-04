<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Repeat } from 'lucide-vue-next'

defineProps(['data', 'selected'])
</script>

<template>
  <div class="custom-node loop-node" :class="{ selected }">
    <div class="node-header">
      <div class="icon-wrapper">
        <Repeat class="icon-svg" :size="20" />
      </div>
      <div class="title-wrapper">
        <div class="title">循环 (Loop)</div>
        <div class="sub-title">ForEach Item</div>
      </div>
    </div>

    <div class="node-body">
         <div class="info">List Iterator</div>
    </div>

    <Handle type="target" :position="Position.Left" class="handle-input" />

    <div class="handle-group-body">
        <Handle type="source" :position="Position.Right" id="body" class="handle-body" />
        <span class="handle-label">Body</span>
    </div>

    <div class="handle-group-done">
        <Handle type="source" :position="Position.Right" id="done" class="handle-done" />
        <span class="handle-label">Done</span>
    </div>
  </div>
</template>

<style scoped>
.loop-node {
  background: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0,0,0,0.1);
  border-left: 4px solid #f39c12;
  border-radius: 12px;
  min-width: 180px;
  color: var(--text-main);
  font-family: var(--font-ui);
  position: relative;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.loop-node:hover {
    border-color: rgba(243, 156, 18, 0.5);
    box-shadow: 0 8px 24px rgba(243, 156, 18, 0.15);
    transform: translateY(-2px);
}

.loop-node.selected {
  border-color: #f39c12;
  box-shadow: 0 0 0 2px rgba(243, 156, 18, 0.2), 0 8px 24px rgba(0,0,0,0.1);
}

.node-header {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-wrapper {
    width: 32px;
    height: 32px;
    background: rgba(243, 156, 18, 0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.title-wrapper {
    display: flex;
    flex-direction: column;
}

.title {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-main);
}

.sub-title {
    font-size: 0.7rem;
    color: var(--text-dim);
}

.node-body {
    padding: 12px 16px;
    font-size: 0.8rem;
    color: var(--text-dim);
}

.handle-input {
    background: #f39c12;
    width: 10px;
    height: 10px;
    border: 2px solid white;
}

.handle-group-body, .handle-group-done {
    position: absolute;
    right: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    transform: translateX(50%); /* Adjust handle position */
}

/* Custom positioning for specific handles */
.handle-group-body { top: 40px; }
.handle-group-done { top: 80px; }

.handle-body {
    position: relative;
    background: #f1c40f;
    width: 10px;
    height: 10px;
    border: 2px solid white;
    right: auto;
    transform: none;
}

.handle-done {
    position: relative;
    background: white;
    width: 10px;
    height: 10px;
    border: 2px solid #f39c12;
    right: auto;
    transform: none;
}

.handle-label {
    position: absolute;
    right: 15px;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-dim);
    pointer-events: none;
}
</style>
