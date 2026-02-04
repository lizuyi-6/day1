<script setup lang="ts">
import { ref, type Component } from 'vue'
import { Search, ChevronDown, Layers, Box, Braces, Cpu, Plug } from 'lucide-vue-next'
import ModelManager from './ModelManager.vue'
import PluginManager from './PluginManager.vue'
import VariableManager from './VariableManager.vue'

interface NodeItem {
    type: string
    label: string
    icon: Component
    color: string
    bg: string
    border: string
    meta?: string
    items?: NodeItem[] // Recursive
}

interface NodeCategory {
    name: string
    items: NodeItem[]
}

defineProps<{
  nodeCategories: NodeCategory[]
}>()

const searchQuery = defineModel<string>('searchQuery')
const activeTab = ref('components') // components | variables | models | plugins

const onDragStart = (event: DragEvent, nodeType: string) => {
  // Stop propagation to prevent parent handlers from interfering
  event.stopPropagation()

  console.log('Drag started for:', nodeType)
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType)
    event.dataTransfer.setData('text/plain', nodeType)
    event.dataTransfer.effectAllowed = 'move'
    // Set a custom drag image if needed, or stick to default
  }
}
</script>

<template>
  <aside class="flex w-72 shrink-0 flex-col border-r border-sand/30 dark:border-white/10 bg-white/60 dark:bg-[#1e1711]/60 backdrop-blur-md z-20 shadow-xl shadow-sand/20">
      <!-- Sidebar Tabs -->
      <div class="flex border-b border-sand/30 dark:border-white/10">
          <button @click="activeTab = 'components'"
              class="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 hover:bg-white/40 dark:hover:bg-white/5"
              :class="activeTab === 'components' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-khaki dark:text-sand/60 hover:text-charcoal dark:hover:text-sand'">
              <Box :size="16" class="mx-auto mb-1" />
              组件
          </button>
          <button @click="activeTab = 'variables'"
              class="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 hover:bg-white/40 dark:hover:bg-white/5"
              :class="activeTab === 'variables' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-khaki dark:text-sand/60 hover:text-charcoal dark:hover:text-sand'">
              <Braces :size="16" class="mx-auto mb-1" />
              变量
          </button>
          <button @click="activeTab = 'models'"
              class="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 hover:bg-white/40 dark:hover:bg-white/5"
              :class="activeTab === 'models' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-khaki dark:text-sand/60 hover:text-charcoal dark:hover:text-sand'">
              <Cpu :size="16" class="mx-auto mb-1" />
              模型
          </button>
          <button @click="activeTab = 'plugins'"
              class="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 hover:bg-white/40 dark:hover:bg-white/5"
              :class="activeTab === 'plugins' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-khaki dark:text-sand/60 hover:text-charcoal dark:hover:text-sand'">
              <Plug :size="16" class="mx-auto mb-1" />
              插件
          </button>
      </div>

      <!-- Search -->
      <div class="p-4 border-b border-sand/30 dark:border-white/10">
          <div class="relative group">
              <Search :size="14" class="absolute left-3 top-3 text-khaki group-focus-within:text-primary transition-colors" />
              <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="搜索组件..."
                  class="w-full bg-white dark:bg-white/5 border border-sand/50 dark:border-white/10 text-charcoal dark:text-white text-xs rounded-full pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-khaki/60"
              />
          </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden custom-scrollbar bg-background-light/30 dark:bg-transparent">
          <!-- Components Tab -->
          <div v-if="activeTab === 'components'" class="h-full overflow-y-auto p-4 space-y-6">
              <div v-for="category in nodeCategories" :key="category.name" class="space-y-3">
                  <div class="flex items-center justify-between px-1 text-[10px] font-bold text-khaki uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">
                      <span>{{ category.name }}</span>
                      <ChevronDown :size="12" />
                  </div>
                  <div class="grid grid-cols-1 gap-2">
                      <div
                          v-for="item in category.items"
                          :key="item.type"
                          class="group relative flex items-center gap-3 p-3 rounded-xl border border-sand/30 dark:border-white/5 bg-white dark:bg-[#2a241e] hover:border-primary hover:shadow-lg hover:shadow-primary/5 cursor-grab active:cursor-grabbing transition-all duration-300 select-none"
                          :draggable="true"
                          @dragstart="onDragStart($event, item.type)"
                      >
                          <div class="h-8 w-8 flex items-center justify-center rounded-lg bg-background-light dark:bg-white/10 shadow-inner group-hover:bg-primary group-hover:text-white transition-all text-charcoal/60 dark:text-sand/60 pointer-events-none">
                              <component :is="item.icon" :size="16" class="transition-colors" />
                          </div>
                          <div class="pointer-events-none">
                              <div class="text-xs font-bold text-charcoal dark:text-white group-hover:text-primary transition-colors">{{ item.label }}</div>
                              <div class="text-[9px] text-khaki/80 font-medium">{{ item.items ? item.items.length + ' 个变体' : '拖拽添加' }}</div>
                          </div>
                           <div v-if="item.meta" class="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold bg-sand/20 dark:bg-white/10 text-khaki dark:text-sand/50 ml-auto border border-sand/10 pointer-events-none">
                               {{ item.meta }}
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <!-- Variables Tab -->
          <div v-else-if="activeTab === 'variables'" class="h-full">
              <VariableManager />
          </div>

          <!-- Models Tab -->
          <div v-else-if="activeTab === 'models'" class="h-full">
              <ModelManager />
          </div>

          <!-- Plugins Tab -->
          <div v-else-if="activeTab === 'plugins'" class="h-full">
              <PluginManager />
          </div>
      </div>

      <!-- Footer User Info -->
      <div class="p-4 border-t border-sand/30 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm">
          <div class="flex items-center gap-3">
              <div class="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  U
              </div>
              <div class="flex flex-col">
                  <span class="text-xs font-bold text-charcoal dark:text-white">用户工作区</span>
                  <span class="text-[10px] text-khaki">专业版 License</span>
              </div>
          </div>
      </div>
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e0dc; /* sand */
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #e68019; /* primary */
}
</style>
