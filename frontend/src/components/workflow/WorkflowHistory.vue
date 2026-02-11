<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import { produce } from 'immer'

interface Props {
  nodes: Node[]
  edges: Edge[]
  maxHistorySize?: number
}

interface Emits {
  (e: 'update:history', history: { nodes: Node[], edges: Edge[] }[]): void
  (e: 'update:historyIndex', index: number): void
  (e: 'restore', state: { nodes: Node[], edges: Edge[] }): void
}

const props = withDefaults(defineProps<Props>(), {
  maxHistorySize: 50
})

const emit = defineEmits<Emits>()

const history = ref<{ nodes: Node[], edges: Edge[] }[]>([])
const historyIndex = ref(-1)

// 保存当前状态到历史记录
const saveToHistory = () => {
  // 移除当前索引之后的所有历史
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }

  // 使用immer创建不可变快照
  const snapshot = produce({ nodes: props.nodes, edges: props.edges }, draft => {
    // 不需要修改，immer会自动创建不可变快照
  })

  // 添加当前状态
  history.value.push(snapshot)

  // 限制历史记录大小
  if (history.value.length > props.maxHistorySize) {
    history.value.shift()
  } else {
    historyIndex.value++
  }

  emit('update:history', history.value)
  emit('update:historyIndex', historyIndex.value)
}

// 撤销
const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    const state = history.value[historyIndex.value]
    emit('restore', state)
    emit('update:historyIndex', historyIndex.value)
  }
}

// 重做
const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    const state = history.value[historyIndex.value]
    emit('restore', state)
    emit('update:historyIndex', historyIndex.value)
  }
}

// 清除历史记录
const clearHistory = () => {
  history.value = []
  historyIndex.value = -1
  emit('update:history', history.value)
  emit('update:historyIndex', historyIndex.value)
}

// 暴露方法供父组件调用
defineExpose({
  saveToHistory,
  undo,
  redo,
  clearHistory,
  history,
  historyIndex
})
</script>

<template>
  <!-- 这是一个纯逻辑组件，没有UI -->
  <slot></slot>
</template>
