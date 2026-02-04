<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Shuffle } from 'lucide-vue-next'

defineProps(['data', 'selected'])
</script>

<template>
  <div class="custom-node switch-node" :class="{ selected }">
    <div class="node-header">
      <div class="icon-wrapper">
        <Shuffle class="icon-svg" :size="20" />
      </div>
      <div class="title-wrapper">
        <div class="title">多路分支 (Switch)</div>
        <div class="sub-title">Router</div>
      </div>
    </div>

    <Handle type="target" :position="Position.Left" class="handle-input" />

    <div class="node-body">
        <div class="output-row">
            <span class="branch-label">Default</span>
            <div class="handle-wrapper">
                <Handle type="source" :position="Position.Right" id="default" class="handle-output" />
            </div>
        </div>
         <div class="output-row">
            <span class="branch-label">Branch A</span>
            <div class="handle-wrapper">
                <Handle type="source" :position="Position.Right" id="a" class="handle-output" />
            </div>
        </div>
         <div class="output-row">
            <span class="branch-label">Branch B</span>
            <div class="handle-wrapper">
                <Handle type="source" :position="Position.Right" id="b" class="handle-output" />
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.switch-node {
  background: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0,0,0,0.1);
  border-left: 4px solid #e74c3c;
  border-radius: 12px;
  width: 180px;
  color: var(--text-main);
  font-family: var(--font-ui);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.switch-node:hover {
    border-color: rgba(231, 76, 60, 0.5);
    box-shadow: 0 8px 24px rgba(231, 76, 60, 0.15);
    transform: translateY(-2px);
}

.switch-node.selected {
  border-color: #e74c3c;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2), 0 8px 24px rgba(0,0,0,0.1);
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
    background: rgba(231, 76, 60, 0.1);
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
    padding: 0; /* Flush logic */
}

.output-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid rgba(0,0,0,0.05);
    font-size: 0.75rem;
    position: relative;
    transition: background 0.2s;
}
.output-row:hover { background: rgba(0,0,0,0.02); }
.output-row:last-child { border-bottom: none; }

.branch-label {
    color: var(--text-main);
    font-weight: 500;
}

.handle-wrapper {
    position: relative;
    width: 10px;
    height: 10px;
}

.handle-input {
    background: #e74c3c;
    width: 10px;
    height: 10px;
    border: 2px solid white;
}
.handle-output {
    background: white;
    width: 10px;
    height: 10px;
    border: 2px solid #e74c3c;
    right: -21px; /* Push out slightly */
}
</style>
