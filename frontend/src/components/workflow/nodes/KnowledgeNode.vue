<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Database, FolderOpen } from 'lucide-vue-next'
import { computed, ref, onMounted, watch } from 'vue'
import type { Variable } from '@/types/variable'
import { knowledgeService, type DocumentGroup } from '@/services/knowledgeService'

const props = defineProps<{
  data: any
  selected: boolean
}>()

const emit = defineEmits(['update:data'])

const groups = ref<DocumentGroup[]>([])
const loading = ref(false)

const inputs = computed<Variable[]>(() => [
  {
    name: 'query',
    type: 'string',
    description: '搜索查询',
    defaultValue: props.data.query || ''
  }
])

const outputs = computed<Variable[]>(() => [
  {
    name: 'results',
    type: 'array',
    description: '搜索结果'
  },
  {
    name: 'context',
    type: 'string',
    description: '上下文文本'
  }
])

const isActive = computed(() => props.data.status === 'running')

const selectedGroupId = computed({
  get: () => props.data.groupId || '',
  set: (value: string) => {
    emit('update:data', { ...props.data, groupId: value })
  }
})

const topK = computed({
  get: () => props.data.topK || 3,
  set: (value: number) => {
    emit('update:data', { ...props.data, topK: value })
  }
})

const selectedGroup = computed(() => 
  groups.value.find(g => g.id === selectedGroupId.value)
)

const loadGroups = async () => {
  loading.value = true
  try {
    groups.value = await knowledgeService.getGroups()
  } catch (err) {
    console.error('Failed to load document groups:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadGroups()
})
</script>

<template>
  <div class="w-[240px] rounded-md bg-white dark:bg-[#1e1711] shadow-md z-20 transition-all duration-200"
       :class="[
         selected ? 'ring-2 ring-emerald-500 shadow-xl' : 'border border-emerald-500/30 dark:border-emerald-500/20 shadow-emerald-100/50 dark:shadow-emerald-900/20 ring-1 ring-emerald-500/10',
         isActive ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : ''
       ]">

    <div class="flex items-center gap-3 border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/20 px-3 py-2.5 rounded-t-md">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-white dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-200 dark:ring-emerald-700">
        <Database :size="16" />
      </div>
      <div>
        <h3 class="text-xs font-bold text-emerald-950 dark:text-emerald-300 uppercase tracking-wide">{{ data.label || '知识库' }}</h3>
        <p class="text-[10px] font-medium text-emerald-500/80 dark:text-emerald-400/60">Data Retrieval</p>
      </div>
    </div>

    <div class="p-3 space-y-3">
      <div class="bg-emerald-50/30 dark:bg-emerald-900/20 rounded border border-emerald-100 dark:border-emerald-800/50 p-2">
        <div class="flex items-center gap-2 mb-1.5">
          <FolderOpen :size="12" class="text-emerald-600" />
          <span class="font-semibold uppercase text-[9px] text-emerald-700 dark:text-emerald-400">文档组</span>
        </div>
        <select
          v-model="selectedGroupId"
          class="w-full px-2 py-1.5 text-xs bg-white dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 text-emerald-800 dark:text-emerald-200"
          :disabled="loading"
        >
          <option value="">所有文档</option>
          <option v-for="group in groups" :key="group.id" :value="group.id">
            {{ group.name }} ({{ group.documentCount }} 文件)
          </option>
        </select>
        <div v-if="selectedGroup" class="mt-1.5 text-[9px] text-emerald-600 dark:text-emerald-400">
          {{ selectedGroup.chunkCount }} 个数据块可用
        </div>
      </div>

      <div class="bg-emerald-50/30 dark:bg-emerald-900/20 rounded border border-emerald-100 dark:border-emerald-800/50 p-2">
        <div class="flex items-center justify-between mb-1.5">
          <span class="font-semibold uppercase text-[9px] text-emerald-700 dark:text-emerald-400">返回结果数</span>
          <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-300">{{ topK }}</span>
        </div>
        <input
          v-model.number="topK"
          type="range"
          min="1"
          max="10"
          class="w-full h-1.5 bg-emerald-200 dark:bg-emerald-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10 px-3 py-2 rounded-b-md">
      <div class="flex items-center gap-2 text-[9px] text-emerald-500 dark:text-emerald-400/60">
        <span>输出:</span>
        <span class="font-mono">results, context</span>
      </div>
    </div>

    <Handle 
      type="target" 
      :position="Position.Left"
      class="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white dark:!border-[#1e1711] !rounded-full !-ml-[5px]" />

    <Handle 
      type="source" 
      :position="Position.Right"
      class="!w-2.5 !h-2.5 !bg-white dark:!bg-emerald-900 !border-2 !border-emerald-500 !rounded-full !-mr-[5px]" />
  </div>
</template>
