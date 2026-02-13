<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { UploadCloud, FileText, CheckCircle2, Plus, LayoutGrid, Workflow, MessageSquare, Database, User, Trash2, FolderOpen, Edit2, X, Check, FolderPlus } from 'lucide-vue-next'
import Logo from '@/components/layout/Logo.vue'
import { RouterLink, useRoute } from 'vue-router'
import { useScrollAnimations } from '@/composables/useScrollAnimations'
import { knowledgeService, type DocumentGroup, type Document } from '@/services/knowledgeService'

const route = useRoute()
useScrollAnimations()

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadStatus = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const groups = ref<DocumentGroup[]>([])
const selectedGroup = ref<DocumentGroup | null>(null)
const documents = ref<Document[]>([])
const showCreateGroup = ref(false)
const newGroupName = ref('')
const newGroupDescription = ref('')
const editingGroup = ref<DocumentGroup | null>(null)
const editGroupName = ref('')
const editGroupDescription = ref('')

const isAllDocuments = computed(() => !selectedGroup.value)

onMounted(async () => {
  document.body.classList.add('page-loaded')
  await loadGroups()
})

const navLinks = [
  { name: '仪表盘', path: '/dashboard', icon: LayoutGrid },
  { name: '工作流', path: '/workflows', icon: Workflow },
  { name: '对话', path: '/chat', icon: MessageSquare },
  { name: '知识库', path: '/knowledge', icon: Database },
]

const loadGroups = async () => {
  loading.value = true
  error.value = null

  try {
    groups.value = await knowledgeService.getGroups()
    if (groups.value.length > 0 && !selectedGroup.value) {
      await selectGroup(groups.value[0])
    }
  } catch (err) {
    console.error('[KnowledgeView] Failed to load groups:', err)
    error.value = '加载文档组失败'
  } finally {
    loading.value = false
  }
}

const selectGroup = async (group: DocumentGroup | null) => {
  selectedGroup.value = group
  await loadDocuments()
}

const selectAllDocuments = async () => {
  selectedGroup.value = null
  await loadDocuments()
}

const loadDocuments = async () => {
  loading.value = true
  error.value = null

  try {
    const result = selectedGroup.value
      ? await knowledgeService.getDocuments(selectedGroup.value.id)
      : await knowledgeService.getDocuments()
    
    documents.value = result.items.map((doc: any) => ({
      fileName: doc.fileName,
      chunkCount: doc.chunkCount,
      firstChunkId: doc.firstChunkId,
      uploadedAt: new Date(doc.uploadedAt).toISOString().split('T')[0],
      groupId: doc.groupId
    }))
  } catch (err) {
    console.error('[KnowledgeView] Failed to load documents:', err)
    error.value = '加载文档失败'
  } finally {
    loading.value = false
  }
}

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file) {
      await uploadFile(file)
    }
  }
  if (fileInput.value) fileInput.value.value = ''
}

const uploadFile = async (file: File) => {
  uploading.value = true
  uploadStatus.value = '上传中...'

  try {
    // 如果没有选择文档组，自动使用默认文档组
    let groupId = selectedGroup.value?.id
    if (!groupId) {
      // 查找默认文档组
      const defaultGroup = groups.value.find(g => g.name === '默认文档组')
      if (defaultGroup) {
        groupId = defaultGroup.id
        if (!selectedGroup.value) {
          selectGroup(defaultGroup)
        }
      }
    }

    const result = await knowledgeService.uploadDocument(file, groupId || null)

    if (result.success) {
      uploadStatus.value = '上传成功'
      await loadDocuments()
      if (selectedGroup.value) {
        groups.value = await knowledgeService.getGroups()
      }
    } else {
      throw new Error(result.error || '上传失败')
    }
  } catch (err) {
    console.error('Upload failed:', err)
    uploadStatus.value = '上传失败'
    alert('上传失败: ' + (err instanceof Error ? err.message : '未知错误'))
  } finally {
    uploading.value = false
    setTimeout(() => uploadStatus.value = '', 3000)
  }
}

const createGroup = async () => {
  if (!newGroupName.value.trim()) return

  try {
    const group = await knowledgeService.createGroup(newGroupName.value.trim(), newGroupDescription.value.trim())
    groups.value.unshift(group)
    showCreateGroup.value = false
    newGroupName.value = ''
    newGroupDescription.value = ''
  } catch (err) {
    console.error('Create group failed:', err)
    alert('创建文档组失败: ' + (err instanceof Error ? err.message : '未知错误'))
  }
}

const startEditGroup = (group: DocumentGroup) => {
  editingGroup.value = group
  editGroupName.value = group.name
  editGroupDescription.value = group.description || ''
}

const cancelEditGroup = () => {
  editingGroup.value = null
  editGroupName.value = ''
  editGroupDescription.value = ''
}

const saveEditGroup = async () => {
  if (!editingGroup.value || !editGroupName.value.trim()) return

  try {
    const updated = await knowledgeService.updateGroup(
      editingGroup.value.id,
      editGroupName.value.trim(),
      editGroupDescription.value.trim()
    )
    const index = groups.value.findIndex(g => g.id === updated.id)
    if (index !== -1) {
      groups.value[index] = { ...groups.value[index], ...updated }
    }
    if (selectedGroup.value?.id === updated.id) {
      selectedGroup.value = groups.value[index]
    }
    editingGroup.value = null
  } catch (err) {
    console.error('Update group failed:', err)
    alert('更新文档组失败: ' + (err instanceof Error ? err.message : '未知错误'))
  }
}

const deleteGroup = async (group: DocumentGroup) => {
  if (!confirm(`确定要删除文档组 "${group.name}" 吗？这将删除组内的所有文档，此操作不可恢复。`)) {
    return
  }

  try {
    await knowledgeService.deleteGroup(group.id)
    groups.value = groups.value.filter(g => g.id !== group.id)
    if (selectedGroup.value?.id === group.id) {
      selectedGroup.value = groups.value.length > 0 ? groups.value[0] : null
      await loadDocuments()
    }
  } catch (err) {
    console.error('Delete group failed:', err)
    alert('删除文档组失败: ' + (err instanceof Error ? err.message : '未知错误'))
  }
}

const deleteDocument = async (doc: Document) => {
  if (!confirm(`确定要删除文档 "${doc.fileName}" 吗？此操作不可恢复。`)) {
    return
  }

  try {
    await knowledgeService.deleteDocument(doc.fileName, selectedGroup.value?.id)
    documents.value = documents.value.filter(d => d.firstChunkId !== doc.firstChunkId)
    if (selectedGroup.value) {
      groups.value = await knowledgeService.getGroups()
    }
  } catch (err) {
    console.error('Delete failed:', err)
    alert('删除失败: ' + (err instanceof Error ? err.message : '未知错误'))
  }
}
</script>

<template>
  <div class="flex flex-col h-screen bg-background-light dark:bg-background-dark text-charcoal dark:text-sand font-sans overflow-hidden">

    <header class="h-16 px-6 border-b border-sand/30 dark:border-white/10 bg-white/80 dark:bg-[#1e1711]/80 backdrop-blur-md flex items-center justify-between z-20 shrink-0">
      <div class="flex items-center gap-12">
        <Logo class="scale-90 origin-left" />
        <nav class="hidden md:flex items-center gap-6">
          <RouterLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="flex items-center gap-2 text-sm font-medium transition-colors duration-200"
            :class="route.path === link.path ? 'text-primary font-bold' : 'text-charcoal/60 dark:text-sand/60 hover:text-charcoal dark:hover:text-sand'"
          >
            <component :is="link.icon" :size="16" />
            {{ link.name }}
          </RouterLink>
        </nav>
      </div>
      <div class="flex items-center gap-4">
         <button class="size-9 rounded-full bg-sand/30 dark:bg-white/10 flex items-center justify-center hover:bg-sand/50 transition-colors">
            <User :size="18" class="text-charcoal dark:text-sand" />
         </button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <aside class="w-64 border-r border-sand/30 dark:border-white/10 bg-white/50 dark:bg-[#1e1711]/50 flex flex-col">
        <div class="p-4 border-b border-sand/30 dark:border-white/10">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-sm font-bold text-charcoal dark:text-white">文档组</h2>
            <button
              @click="showCreateGroup = true"
              class="p-1.5 rounded-lg hover:bg-sand/30 dark:hover:bg-white/10 text-primary transition-colors"
              title="创建文档组"
            >
              <FolderPlus :size="16" />
            </button>
          </div>
          
          <div v-if="showCreateGroup" class="mt-3 p-3 bg-sand/20 dark:bg-white/5 rounded-lg">
            <input
              v-model="newGroupName"
              type="text"
              placeholder="文档组名称"
              class="w-full px-3 py-2 text-sm bg-white dark:bg-[#1e1711] border border-sand/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
            />
            <textarea
              v-model="newGroupDescription"
              placeholder="描述（可选）"
              rows="2"
              class="w-full px-3 py-2 text-sm bg-white dark:bg-[#1e1711] border border-sand/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2 resize-none"
            ></textarea>
            <div class="flex gap-2">
              <button
                @click="createGroup"
                class="flex-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
              >
                创建
              </button>
              <button
                @click="showCreateGroup = false; newGroupName = ''; newGroupDescription = ''"
                class="flex-1 px-3 py-1.5 bg-sand/30 dark:bg-white/10 text-charcoal dark:text-sand text-xs font-medium rounded-lg hover:bg-sand/50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto">
          <button
            @click="selectAllDocuments"
            class="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-sand/20 dark:hover:bg-white/5 transition-colors"
            :class="isAllDocuments ? 'bg-primary/10 text-primary' : 'text-charcoal dark:text-sand'"
          >
            <Database :size="18" />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">所有文档</div>
              <div class="text-xs text-khaki dark:text-sand/50">
                {{ groups.filter(g => g).reduce((sum, g) => sum + (g.documentCount || 0), 0) }} 个文件
              </div>
            </div>
          </button>

          <div class="border-t border-sand/20 dark:border-white/5 my-1"></div>

          <template v-for="group in groups.filter(g => g)" :key="group.id">
            <div class="group/item relative">
              <button
                v-if="editingGroup?.id !== group.id"
                @click="selectGroup(group)"
                class="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-sand/20 dark:hover:bg-white/5 transition-colors"
                :class="selectedGroup?.id === group.id ? 'bg-primary/10 text-primary' : 'text-charcoal dark:text-sand'"
              >
                <FolderOpen :size="18" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium truncate">{{ group.name }}</div>
                  <div class="text-xs text-khaki dark:text-sand/50">
                    {{ group.documentCount || 0 }} 个文件 · {{ group.chunkCount || 0 }} 块
                  </div>
                </div>
              </button>

            <div v-else class="px-4 py-3 bg-sand/20 dark:bg-white/5">
              <input
                v-model="editGroupName"
                type="text"
                class="w-full px-2 py-1 text-sm bg-white dark:bg-[#1e1711] border border-sand/30 dark:border-white/10 rounded focus:outline-none focus:ring-1 focus:ring-primary/50 mb-2"
              />
              <textarea
                v-model="editGroupDescription"
                rows="2"
                class="w-full px-2 py-1 text-sm bg-white dark:bg-[#1e1711] border border-sand/30 dark:border-white/10 rounded focus:outline-none focus:ring-1 focus:ring-primary/50 mb-2 resize-none"
              ></textarea>
              <div class="flex gap-1">
                <button @click="saveEditGroup" class="p-1 text-primary hover:bg-primary/10 rounded">
                  <Check :size="14" />
                </button>
                <button @click="cancelEditGroup" class="p-1 text-khaki hover:bg-sand/30 rounded">
                  <X :size="14" />
                </button>
              </div>
            </div>

            <div
              v-if="editingGroup?.id !== group.id"
              class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity flex gap-1"
            >
              <button
                @click.stop="startEditGroup(group)"
                class="p-1.5 text-khaki hover:text-primary hover:bg-sand/30 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <Edit2 :size="14" />
              </button>
              <button
                @click.stop="deleteGroup(group)"
                class="p-1.5 text-khaki hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 :size="14" />
              </button>
            </div>
            </div>
          </template>

          <div v-if="groups.filter(g => g).length === 0 && !loading" class="px-4 py-8 text-center">
            <p class="text-sm text-khaki dark:text-sand/50">暂无文档组</p>
            <button
              @click="showCreateGroup = true"
              class="mt-2 text-sm text-primary hover:underline"
            >
              创建第一个文档组
            </button>
          </div>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto p-8">
        <div class="max-w-4xl mx-auto">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 class="text-3xl font-serif font-medium text-charcoal dark:text-white tracking-tight mb-2">
                {{ selectedGroup?.name || '所有文档' }}
              </h1>
              <p class="text-khaki dark:text-sand/70 text-base font-normal">
                {{ selectedGroup?.description || '管理向量嵌入和 RAG 数据源，增强 Agent 的记忆。' }}
              </p>
            </div>
            <button
              @click="triggerUpload"
              :disabled="uploading"
              class="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Plus :size="18" />
              {{ uploading ? '上传处理中...' : '上传新文档' }}
            </button>
          </div>

          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span class="ml-3 text-khaki">加载中...</span>
          </div>

          <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-10">
            <p class="text-red-600 dark:text-red-400 mb-2">{{ error }}</p>
            <button @click="loadDocuments" class="text-sm text-primary hover:underline font-medium">重试</button>
          </div>

          <div
            v-else-if="documents.length === 0"
            @click="triggerUpload"
            class="group border-2 border-dashed border-sand dark:border-white/20 rounded-2xl p-16 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary/5 cursor-pointer transition-all duration-300"
          >
            <div class="size-16 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud :size="32" class="text-khaki group-hover:text-primary transition-colors" />
            </div>
            <h3 class="text-lg font-serif font-bold text-charcoal dark:text-white mb-3">点击或拖拽上传</h3>
            <p class="text-khaki/80 dark:text-sand/60 text-sm max-w-sm leading-relaxed">
              {{ isAllDocuments ? '请先选择一个文档组' : '支持 PDF, Markdown, TXT 格式' }}。<br/>系统将自动进行切片和向量化处理。
            </p>
          </div>

          <div v-else class="bg-white/60 dark:bg-[#2a241e]/60 backdrop-blur-md border border-sand/30 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-sand/30 dark:border-white/10 bg-sand/20 dark:bg-white/5 flex items-center justify-between">
              <h3 class="text-xs font-bold text-khaki uppercase tracking-[0.15em]">文档列表</h3>
              <span class="text-xs font-medium text-charcoal/60 dark:text-sand/60">{{ documents.length }} 个文件</span>
            </div>
            <div class="divide-y divide-sand/30 dark:divide-white/5">
              <div v-for="doc in documents" :key="doc.firstChunkId" class="px-6 py-4 flex items-center gap-4 hover:bg-white/50 dark:hover:bg-white/5 transition-colors group cursor-default">
                <div class="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileText :size="20" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-bold text-charcoal dark:text-white truncate mb-1">{{ doc.fileName }}</h4>
                  <p class="text-xs text-khaki dark:text-sand/50 font-medium">{{ doc.uploadedAt }} · {{ doc.chunkCount }} 块</p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-white/10 text-primary border border-primary/20 shadow-sm">
                    <CheckCircle2 :size="12" />
                    已索引
                  </span>
                  <button
                    @click="deleteDocument(doc)"
                    class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="删除文档">
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <input
            type="file"
            ref="fileInput"
            class="hidden"
            accept=".txt,.md,.pdf"
            @change="handleFileChange"
          />
        </div>
      </main>
    </div>
  </div>
</template>
