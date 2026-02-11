<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Plus, LayoutGrid, Workflow, MessageSquare, Database, User, Search, Trash2, ExternalLink } from 'lucide-vue-next'
import Logo from '@/components/layout/Logo.vue'
import { RouterLink, useRoute } from 'vue-router'
import { useScrollAnimations } from '@/composables/useScrollAnimations'
import { post, get, del } from '@/utils/api'
import { API_BASE_URL } from '@/config/api'

const route = useRoute()

// Initialize scroll animations
useScrollAnimations()

onMounted(async () => {
  document.body.classList.add('page-loaded')
  await loadDocuments()
})

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadStatus = ref('')
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)

interface Document {
  id: string
  title: string
  content?: string
  status: 'indexed' | 'processing' | 'error'
  createdAt: string
  chunkCount?: number
}

const documents = ref<Document[]>([])

const navLinks = [
  { name: '仪表盘', path: '/dashboard', icon: LayoutGrid },
  { name: '工作流', path: '/workflows', icon: Workflow },
  { name: '对话', path: '/chat', icon: MessageSquare },
  { name: '知识库', path: '/knowledge', icon: Database },
]

const loadDocuments = async () => {
    try {
        const response = await get(`${API_BASE_URL}/knowledge/documents`)

        if (response.success || response.data) {
            const data = response.data || response
            documents.value = data.items.map((doc: any) => ({
                id: doc.firstChunkId,
                title: doc.fileName,
                status: 'indexed' as const,
                createdAt: new Date(doc.uploadedAt).toISOString().split('T')[0],
                chunkCount: doc.chunkCount
            }))
        }
    } catch (error) {
        console.error('Failed to load documents', error)
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
  // Reset input
  if (fileInput.value) fileInput.value.value = ''
}

const uploadFile = async (file: File) => {
  uploading.value = true
  uploadStatus.value = '上传中...'

  const formData = new FormData()
  formData.append('file', file)
  // Optional: add title/description
  formData.append('title', file.name)

  try {
      const response = await fetch(`${API_BASE_URL}/knowledge/upload`, {
          method: 'POST',
          body: formData,
          // Don't set Content-Type header, let browser set it with boundary
      })
      
      const result = await response.json()
      
      if (result.success) {
           documents.value.unshift({
              id: result.data.id || Date.now().toString(),
              title: file.name,
              status: 'indexed',
              createdAt: new Date().toISOString().split('T')[0],
              chunkCount: result.data.chunks?.length || 0
           })
           uploadStatus.value = '上传成功'
      } else {
           throw new Error(result.error || '上传失败')
      }
  } catch (error) {
      console.error('Upload failed:', error)
      uploadStatus.value = '上传失败'
      alert('上传失败: ' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
      uploading.value = false
      setTimeout(() => uploadStatus.value = '', 3000)
  }
}

const handleSearch = async () => {
    if (!searchQuery.value.trim()) return

    isSearching.value = true
    searchResults.value = []
    try {
        const response = await get(`${API_BASE_URL}/knowledge/search`, {
            params: { q: searchQuery.value }
        })

        if (response.success || response.data) {
            searchResults.value = response.data || []
        }
    } catch (error) {
        console.error('Search failed:', error)
        alert('搜索失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
        isSearching.value = false
    }
}

const deleteDocument = async (doc: Document) => {
    if (!confirm(`确定要删除文档 "${doc.title}" 吗？此操作不可恢复，将删除该文档的所有数据块。`)) {
        return
    }

    try {
        const response = await del(`${API_BASE_URL}/knowledge/documents/${encodeURIComponent(doc.title)}`)

        if (response.success || response.data) {
            // 从列表中移除
            documents.value = documents.value.filter(d => d.id !== doc.id)
            alert('删除成功')
        }
    } catch (error) {
        console.error('Delete failed:', error)
        alert('删除失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

</script>

<template>
  <div class="flex flex-col h-screen bg-background-light dark:bg-background-dark text-charcoal dark:text-sand font-sans overflow-hidden">
    
    <!-- Internal App Header -->
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

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">

      <div class="max-w-5xl mx-auto">

        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-from-left">
          <div>
            <h1 class="text-3xl font-serif font-medium text-charcoal dark:text-white tracking-tight mb-2">知识库</h1>
            <p class="text-khaki dark:text-sand/70 text-base font-normal">管理向量嵌入和 RAG 数据源，增强 Agent 的记忆。</p>
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

        <!-- Upload Zone (Empty State / Active) -->
        <div
            v-if="documents.length === 0"
            @click="triggerUpload"
            class="group border-2 border-dashed border-sand dark:border-white/20 rounded-2xl p-16 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary/5 cursor-pointer transition-all duration-300 mb-10"
        >
            <div class="size-16 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud :size="32" class="text-khaki group-hover:text-primary transition-colors" />
            </div>
            <h3 class="text-lg font-serif font-bold text-charcoal dark:text-white mb-3">点击或拖拽上传</h3>
            <p class="text-khaki/80 dark:text-sand/60 text-sm max-w-sm leading-relaxed">
                支持 PDF, Markdown, TXT 格式。<br/>系统将自动进行切片和向量化处理。
            </p>
        </div>

        <!-- File List -->
        <div v-else class="bg-white/60 dark:bg-[#2a241e]/60 backdrop-blur-md border border-sand/30 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden animate-scale-in">
            <div class="px-6 py-4 border-b border-sand/30 dark:border-white/10 bg-sand/20 dark:bg-white/5 flex items-center justify-between">
                <h3 class="text-xs font-bold text-khaki uppercase tracking-[0.15em]">已索引文档库</h3>
                <span class="text-xs font-medium text-charcoal/60 dark:text-sand/60">{{ documents.length }} 个文件</span>
            </div>
            <div class="divide-y divide-sand/30 dark:divide-white/5">
                <div v-for="(doc, idx) in documents" :key="idx" class="px-6 py-4 flex items-center gap-4 hover:bg-white/50 dark:hover:bg-white/5 transition-colors group cursor-default">
                    <div class="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <FileText :size="20" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-bold text-charcoal dark:text-white truncate mb-1">{{ doc.title }}</h4>
                        <p class="text-xs text-khaki dark:text-sand/50 font-medium">{{ doc.createdAt }} • {{ doc.chunkCount || 0 }} 块</p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-white/10 text-primary border border-primary/20 shadow-sm">
                            <CheckCircle2 :size="12" />
                            {{ doc.status === 'indexed' ? '已索引' : '处理中' }}
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

        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="mt-8 bg-white/60 dark:bg-[#2a241e]/60 backdrop-blur-md border border-sand/30 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-sand/30 dark:border-white/10 bg-sand/20 dark:bg-white/5">
                <h3 class="text-xs font-bold text-khaki uppercase tracking-[0.15em]">搜索结果 ({{ searchResults.length }})</h3>
            </div>
            <div class="p-6 space-y-4">
                <div v-for="(result, idx) in searchResults" :key="idx"
                     class="p-4 bg-white dark:bg-[#1e1711] rounded-xl border border-sand/20 dark:border-white/10 hover:shadow-md transition-shadow">
                    <div class="flex items-center gap-2 mb-3">
                        <FileText :size="16" class="text-emerald-600" />
                        <span class="text-sm font-bold text-charcoal dark:text-white">{{ result.fileName }}</span>
                        <span class="text-[10px] text-khaki dark:text-sand/50 ml-auto">
                            {{ new Date(result.createdAt).toLocaleDateString() }}
                        </span>
                    </div>
                    <p class="text-sm text-charcoal/80 dark:text-sand/80 line-clamp-4 leading-relaxed font-mono bg-sand/10 dark:bg-white/5 p-3 rounded-lg">
                        {{ result.content }}
                    </p>
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
</template>