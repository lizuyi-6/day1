<script setup lang="ts">
import { ref, type Component } from 'vue'
import { Search, ChevronDown, Layers } from 'lucide-vue-next'
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

const emit = defineEmits(['dragStart'])

const onDragStart = (event: DragEvent, nodeType: string) => {
  emit('dragStart', event, nodeType)
}
</script>

<template>
  <aside class="flex w-80 shrink-0 flex-col border-r border-slate-200 bg-white z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <!-- Sidebar Tabs -->
      <div class="flex border-b border-indigo-50">
          <button @click="activeTab = 'components'"
              class="flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2"
              :class="activeTab === 'components' ? 'border-indigo-600 text-indigo-900 bg-indigo-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'">
              组件
          </button>
          <button @click="activeTab = 'variables'"
              class="flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2"
              :class="activeTab === 'variables' ? 'border-indigo-600 text-indigo-900 bg-indigo-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'">
              变量
          </button>
          <button @click="activeTab = 'models'"
              class="flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2"
              :class="activeTab === 'models' ? 'border-indigo-600 text-indigo-900 bg-indigo-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'">
              模型
          </button>
          <button @click="activeTab = 'plugins'"
              class="flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2"
              :class="activeTab === 'plugins' ? 'border-indigo-600 text-indigo-900 bg-indigo-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'">
              插件
          </button>
      </div>

      <!-- Search -->
      <div class="p-3 border-b border-slate-50">
          <div class="relative group">
              <Search :size="14" class="absolute left-2.5 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="搜索组件..."
                  class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md pl-8 pr-3 py-2 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all placeholder:text-slate-400"
              />
          </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden custom-scrollbar">
          <!-- Components Tab -->
          <div v-if="activeTab === 'components'" class="h-full overflow-y-auto p-2 space-y-4">
              <div v-for="category in nodeCategories" :key="category.name" class="space-y-1">
                  <div class="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-indigo-600">
                      <span>{{ category.name }}</span>
                      <ChevronDown :size="12" />
                  </div>
                  <div class="grid grid-cols-1 gap-1.5">
                      <div
                          v-for="item in category.items"
                          :key="item.type"
                          class="group relative flex items-center gap-3 p-2 rounded border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-md hover:shadow-indigo-100 cursor-grab active:cursor-grabbing transition-all duration-200 select-none bg-slate-50/50"
                          :draggable="true"
                          @dragstart="onDragStart($event, item.type)"
                      >
                          <div class="h-8 w-8 flex items-center justify-center rounded bg-white shadow-sm ring-1 ring-slate-100 group-hover:ring-indigo-200 transition-all">
                              <component :is="item.icon" :size="16" class="transition-colors" :class="item.color" />
                          </div>
                          <div>
                              <div class="text-xs font-semibold text-slate-700 group-hover:text-indigo-900">{{ item.label }}</div>
                              <div class="text-[9px] text-slate-400 group-hover:text-indigo-400/80">{{ item.items ? item.items.length + ' 个变体' : '拖拽添加' }}</div>
                          </div>
                           <div v-if="item.meta" class="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-white border border-slate-100 text-slate-400 ml-auto group-hover:text-indigo-500 group-hover:border-indigo-100">
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
      <div class="p-3 border-t border-slate-100 bg-slate-50/50">
          <div class="flex items-center gap-2">
              <div class="h-6 w-6 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                  U
              </div>
              <div class="flex flex-col">
                  <span class="text-[10px] font-bold text-slate-700">用户工作区</span>
                  <span class="text-[9px] text-slate-400">专业版</span>
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
  background: #cbd5e1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
