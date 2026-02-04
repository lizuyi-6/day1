<script setup lang="ts">
import { ref } from 'vue'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Plus } from 'lucide-vue-next'

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadStatus = ref('')
const files = ref<Array<{ name: string, status: 'indexed' | 'processing', date: string }>>([
  { name: 'technical_spec_v1.pdf', status: 'indexed', date: '2023-10-24' },
  { name: 'api_documentation.md', status: 'indexed', date: '2023-11-02' }
])

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
}

const uploadFile = async (file: File) => {
  uploading.value = true
  uploadStatus.value = '上传中...'

  const formData = new FormData()
  formData.append('file', file)

  // Simulate upload
  setTimeout(() => {
      files.value.push({
          name: file.name || '无标题',
          status: 'indexed',
          date: new Date().toISOString().split('T')[0]
      })
      uploading.value = false
      uploadStatus.value = ''
  }, 1500)
}
</script>

<template>
  <div class="flex h-[calc(100vh-64px)] overflow-hidden bg-app">

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-8">

      <div class="max-w-4xl mx-auto">

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-xl font-bold text-slate-900 tracking-tight">知识库</h1>
            <p class="text-slate-500 text-xs mt-1">管理向量嵌入和 RAG 数据源。</p>
          </div>
          <button
            @click="triggerUpload"
            :disabled="uploading"
            class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus :size="16" />
            {{ uploading ? '上传中...' : '添加文档' }}
          </button>
        </div>

        <!-- Upload Zone (Empty State / Active) -->
        <div
            v-if="files.length === 0"
            @click="triggerUpload"
            class="border-2 border-dashed border-slate-300 rounded-md p-12 flex flex-col items-center justify-center text-center hover:border-emerald-400 hover:bg-emerald-50/50 cursor-pointer transition-all mb-6"
        >
            <div class="h-12 w-12 rounded-md bg-slate-100 flex items-center justify-center mb-4">
                <UploadCloud :size="24" class="text-slate-400" />
            </div>
            <h3 class="text-sm font-bold text-slate-900 mb-2">上传知识源</h3>
            <p class="text-slate-500 text-xs max-w-sm">
                拖放文本、PDF 或 Markdown 文件到此处，将它们导入向量数据库。
            </p>
        </div>

        <!-- File List -->
        <div v-else class="bg-white border border-light rounded-md shadow-sm overflow-hidden">
            <div class="px-4 py-3 border-b border-light bg-slate-50 flex items-center justify-between">
                <h3 class="text-[10px] font-bold text-slate-700 uppercase tracking-wider">已索引文档</h3>
                <span class="text-[10px] font-mono text-slate-400">{{ files.length }} 个文件</span>
            </div>
            <div class="divide-y divide-slate-100">
                <div v-for="(file, idx) in files" :key="idx" class="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                    <div class="h-8 w-8 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <FileText :size="16" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-xs font-semibold text-slate-900 truncate">{{ file.name }}</h4>
                        <p class="text-[10px] text-slate-500 font-mono">{{ file.date }} • 12KB</p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <CheckCircle2 :size="10" />
                            已索引
                        </span>
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
</template>
