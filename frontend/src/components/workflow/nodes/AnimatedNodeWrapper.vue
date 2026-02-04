<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Node } from '@vue-flow/core'
import { Handle, Position } from '@vue-flow/core'

interface Props {
  node: Node
  selected?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'nodeClick', node: Node): void
}>()

const isHovered = ref(false)
const isAnimating = ref(false)

const nodeClass = computed(() => {
  return [
    'animated-node',
    props.selected ? 'node-selected' : '',
    isHovered.value ? 'node-hovered' : '',
    isAnimating.value ? 'node-animating' : ''
  ].filter(Boolean).join(' ')
})

const handleClick = () => {
  isAnimating.value = true
  setTimeout(() => {
    isAnimating.value = false
  }, 600)

  emit('nodeClick', props.node)
}
</script>

<template>
  <div
    class="animated-node-wrapper"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="handleClick"
  >
    <div :class="nodeClass">
      <!-- 节点内容 -->
      <slot :hovered="isHovered" :animating="isAnimating" />

      <!-- 输入连接点 -->
      <Handle
        v-if="node.type !== 'start'"
        type="target"
        :position="Position.Left"
        class="handle-input"
      />

      <!-- 输出连接点 -->
      <Handle
        v-if="node.type !== 'end'"
        type="source"
        :position="Position.Right"
        class="handle-output"
      />
    </div>
  </div>
</template>

<style scoped>
.animated-node-wrapper {
  position: relative;
}

.animated-node {
  position: relative;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}

.animated-node:hover {
  transform: translateY(-2px);
}

.node-selected {
  animation: pulse-glow 2s infinite;
}

.node-hovered {
  filter: brightness(1.05);
}

.node-animating {
  animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 连接点样式 */
:deep(.handle-input),
:deep(.handle-output) {
  width: 12px;
  height: 12px;
  background: #6366f1;
  border: 2px solid #fff;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
}

:deep(.handle-input:hover),
:deep(.handle-output:hover) {
  width: 16px;
  height: 16px;
  transform: scale(1.2);
  box-shadow: 0 0 0 8px rgba(99, 102, 241, 0.2);
}

/* 节点涟漪效果 */
.animated-node::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(45deg, transparent, rgba(99, 102, 241, 0.3), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.animated-node:hover::before {
  opacity: 1;
  animation: shine 2s infinite;
}
</style>
