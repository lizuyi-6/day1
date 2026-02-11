<script setup lang="ts">
import { ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import { Copy, Trash2 } from 'lucide-vue-next'

interface ContextMenuState {
  show: boolean
  x: number
  y: number
  node: Node | null
  edge: Edge | null
}

interface Emits {
  (e: 'duplicate-node', node: Node): void
  (e: 'delete-node', nodeId: string): void
  (e: 'delete-edge', edgeId: string): void
  (e: 'paste'): void
}

const props = defineProps<{
  contextMenu: ContextMenuState
  clipboardLength: number
}>()

const emit = defineEmits<Emits>()

const hideContextMenu = () => {
}

const handleDuplicateNode = (node: Node) => {
  emit('duplicate-node', node)
}

const handleDeleteNode = (nodeId: string) => {
  emit('delete-node', nodeId)
}

const handleDeleteEdge = (edgeId: string) => {
  emit('delete-edge', edgeId)
}

const handlePaste = () => {
  emit('paste')
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="contextMenu && contextMenu.show"
      :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
      class="fixed z-[200] bg-white dark:bg-[#1e1711] rounded-lg shadow-2xl border border-sand/30 dark:border-white/10 py-1 min-w-[180px]"
      @click.stop
    >
      <template v-if="contextMenu.node">
        <button
          @click="handleDuplicateNode(contextMenu.node)"
          class="w-full px-4 py-2 text-left text-sm hover:bg-sand/20 dark:hover:bg-white/5 flex items-center gap-2 text-charcoal dark:text-sand transition-colors"
        >
          <Copy :size="14" />
          <span>复制节点</span>
          <span class="ml-auto text-xs text-khaki">Ctrl+D</span>
        </button>
        <button
          @click="handleDeleteNode(contextMenu.node.id)"
          class="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 text-red-600 transition-colors"
        >
          <Trash2 :size="14" />
          <span>删除节点</span>
          <span class="ml-auto text-xs text-red-400">Delete</span>
        </button>
      </template>

      <template v-else-if="contextMenu.edge">
        <button
          @click="handleDeleteEdge(contextMenu.edge.id)"
          class="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 text-red-600 transition-colors"
        >
          <Trash2 :size="14" />
          <span>删除连接</span>
          <span class="ml-auto text-xs text-red-400">Delete</span>
        </button>
      </template>

      <template v-else>
        <button
          @click="handlePaste()"
          :disabled="clipboardLength === 0"
          class="w-full px-4 py-2 text-left text-sm hover:bg-sand/20 dark:hover:bg-white/5 flex items-center gap-2 text-charcoal dark:text-sand transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Copy :size="14" />
          <span>粘贴</span>
          <span class="ml-auto text-xs text-khaki">Ctrl+V</span>
        </button>
      </template>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
