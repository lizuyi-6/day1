<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

interface Emits {
  (e: 'delete'): void
  (e: 'copy'): void
  (e: 'paste'): void
  (e: 'duplicate'): void
  (e: 'undo'): void
  (e: 'redo'): void
}

const emit = defineEmits<Emits>()

const handleKeyDown = (event: KeyboardEvent) => {
  // Delete - 删除选中的节点和边
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    emit('delete')
  }

  // Ctrl/Cmd + C - 复制
  if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
    event.preventDefault()
    emit('copy')
  }

  // Ctrl/Cmd + V - 粘贴
  if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
    event.preventDefault()
    emit('paste')
  }

  // Ctrl/Cmd + D - 复制
  if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
    event.preventDefault()
    emit('duplicate')
  }

  // Ctrl/Cmd + Z - 撤销
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    emit('undo')
  }

  // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y - 重做
  if ((event.ctrlKey || event.metaKey) && (event.shiftKey && event.key === 'z' || event.key === 'y')) {
    event.preventDefault()
    emit('redo')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <!-- 这是一个纯逻辑组件，没有UI -->
  <slot></slot>
</template>
