<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { History, RotateCcw, Trash2, MessageSquare, X, Loader2 } from 'lucide-vue-next'
import { get, post } from '@/utils/api'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const props = defineProps<{
  workflowId: string
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  restored: []
}>()

const versions = ref<Array<{
  id: string
  versionNumber: number
  graphData: { nodes: any[], edges: any[] }
  comment: string | null
  createdAt: string
}>[]>([])
const isLoading = ref(false)
const showConfirmDialog = ref(false)
const versionToRestore = ref<{ id: string; versionNumber: number } | null>(null)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const sortedVersions = computed(() => {
  return [...versions.value].sort((a, b) => b.versionNumber - a.versionNumber)
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const loadVersions = async () => {
  if (!props.workflowId) return

  isLoading.value = true
  try {
    const response = await get(`${API_BASE_URL}/workflow/${props.workflowId}/versions`)
    if (response.success) {
      versions.value = response.data || []
    }
  } catch (error) {
    console.error('加载版本历史失败:', error)
  } finally {
    isLoading.value = false
  }
}

const restoreVersion = async (versionId: string, versionNumber: number) => {
  versionToRestore.value = { id: versionId, versionNumber }
  showConfirmDialog.value = true
}

const confirmRestore = async () => {
  if (!versionToRestore.value) return

  try {
    const response = await post(`${API_BASE_URL}/workflow/${props.workflowId}/versions/${versionToRestore.value.id}/restore`, {})
    if (response.success) {
      showConfirmDialog.value = false
      emit('restored')
      emit('close')
    }
  } catch (error) {
    console.error('恢复版本失败:', error)
  }
}

const close = () => {
  emit('close')
}

onMounted(() => {
  if (props.isOpen) {
    loadVersions()
  }
})

defineExpose({
  loadVersions
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <History :size="20" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">版本历史</h2>
            <p class="text-sm text-slate-600">查看和恢复工作流的之前版本</p>
          </div>
        </div>
        <button @click="close" class="text-slate-400 hover:text-slate-600 transition-colors">
          <X :size="24" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <Loader2 :size="32" class="text-indigo-600 animate-spin" />
        </div>

        <div v-else-if="sortedVersions.length === 0" class="text-center py-12">
          <div class="h-16 w-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <History :size="32" />
          </div>
          <p class="text-slate-600">暂无版本历史</p>
          <p class="text-sm text-slate-500 mt-1">保存工作流后，版本历史会自动记录</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="version in sortedVersions"
            :key="version.id"
            class="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700 rounded-full">v{{ version.versionNumber }}</span>
                  <span class="text-xs text-slate-500">{{ formatDate(version.createdAt) }}</span>
                </div>
                <div class="flex items-center gap-4 text-sm text-slate-600">
                  <span class="flex items-center gap-1">
                    <div class="h-4 w-4 rounded bg-indigo-100" />
                    节点: {{ version.graphData?.nodes?.length || 0 }}
                  </span>
                  <span class="flex items-center gap-1">
                    <div class="h-4 w-4 rounded bg-emerald-100" />
                    边: {{ version.graphData?.edges?.length || 0 }}
                  </span>
                </div>
                <div v-if="version.comment" class="mt-2 p-2 bg-slate-50 rounded text-sm text-slate-700">
                  <div class="flex items-center gap-1 text-slate-500 mb-1">
                    <MessageSquare :size="12" />
                    <span class="text-xs font-medium">备注</span>
                  </div>
                  <p>{{ version.comment }}</p>
                </div>
              </div>
              <button
                @click="restoreVersion(version.id, version.versionNumber)"
                class="flex items-center gap-2 px-3 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <RotateCcw :size="14" />
                恢复
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
        <button
          @click="close"
          class="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  </div>

  <ConfirmDialog
    v-if="showConfirmDialog"
    :is-open="showConfirmDialog"
    title="确认恢复版本"
    :message="`确定要恢复到版本 v${versionToRestore?.versionNumber} 吗？当前工作流将被覆盖。`"
    confirm-text="恢复"
    cancel-text="取消"
    @confirm="confirmRestore"
    @close="showConfirmDialog = false"
  />
</template>

<style scoped>
.version-dialog {
  font-family: var(--font-ui);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
