<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Trash2, Edit2, Check, X, Key, Globe, Server } from 'lucide-vue-next'

interface ModelConfig {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'azure' | 'custom'
  apiKey: string
  baseUrl?: string
  model: string
  status: 'connected' | 'error' | 'testing'
}

const showAddModel = ref(false)
const editingModel = ref<ModelConfig | null>(null)
const testResult = ref<{ success: boolean; message: string } | null>(null)

const models = ref<ModelConfig[]>([
  {
    id: '1',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    apiKey: 'your-openai-api-key',
    model: 'gpt-4-turbo',
    status: 'connected'
  },
  {
    id: '2',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    apiKey: 'your-anthropic-api-key',
    model: 'claude-3-opus-20240229',
    status: 'connected'
  },
  {
    id: '3',
    name: '通义千问',
    provider: 'custom',
    apiKey: 'your-qwen-api-key',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-turbo',
    status: 'connected'
  }
])

const newModel = ref<ModelConfig>({
  id: '',
  name: '',
  provider: 'openai',
  apiKey: '',
  model: '',
  status: 'testing'
})

const providerIcons = {
  openai: '🤖',
  anthropic: '🧠',
  azure: '☁️',
  custom: '🔧'
}

const addModel = () => {
  if (!newModel.value.name || !newModel.value.apiKey) {
    testResult.value = { success: false, message: '请填写所有必填字段' }
    return
  }

  const model: ModelConfig = {
    ...newModel.value,
    id: Date.now().toString(),
    status: 'testing'
  }

  models.value.push(model)
  showAddModel.value = false
  testModelConnection(model)

  // 重置表单
  newModel.value = {
    id: '',
    name: '',
    provider: 'openai',
    apiKey: '',
    model: '',
    status: 'testing'
  }
}

const testModelConnection = async (model: ModelConfig) => {
  // 模拟测试连接
  setTimeout(() => {
    const idx = models.value.findIndex(m => m.id === model.id)
    if (idx !== -1) {
      models.value[idx].status = Math.random() > 0.2 ? 'connected' : 'error'
    }
  }, 1000)
}

const deleteModel = (id: string) => {
  models.value = models.value.filter(m => m.id !== id)
}

const editModel = (model: ModelConfig) => {
  editingModel.value = { ...model }
}

const saveModel = () => {
  if (editingModel.value) {
    const idx = models.value.findIndex(m => m.id === editingModel.value!.id)
    if (idx !== -1) {
      models.value[idx] = { ...editingModel.value }
      testModelConnection(models.value[idx])
    }
    editingModel.value = null
  }
}

const cancelEdit = () => {
  editingModel.value = null
}

const getStatusBadge = (status: ModelConfig['status']) => {
  switch (status) {
    case 'connected':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    case 'error':
      return 'bg-red-50 text-red-700 border-red-100'
    case 'testing':
      return 'bg-amber-50 text-amber-700 border-amber-100'
  }
}

const getStatusText = (status: ModelConfig['status']) => {
  switch (status) {
    case 'connected':
      return '已连接'
    case 'error':
      return '错误'
    case 'testing':
      return '测试中'
  }
}
</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-light flex items-center justify-between">
      <div>
        <h2 class="text-sm font-bold text-slate-900">模型配置管理</h2>
        <p class="text-[10px] text-slate-500 mt-0.5">接入和管理自定义 LLM 模型</p>
      </div>
      <button
        @click="showAddModel = true"
        class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
      >
        <Plus :size="14" />
        添加模型
      </button>
    </div>

    <!-- Model List -->
    <div class="flex-1 overflow-y-auto p-6 space-y-3">
      <div
        v-for="model in models"
        :key="model.id"
        class="group relative bg-white border border-light rounded-lg p-4 hover:shadow-md hover:border-indigo-200 transition-all"
      >
        <div v-if="editingModel?.id !== model.id" class="flex items-start gap-4">
          <!-- Provider Icon -->
          <div class="h-12 w-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl">
            {{ providerIcons[model.provider] }}
          </div>

          <!-- Model Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-sm font-bold text-slate-900">{{ model.name }}</h3>
              <span
                :class="['px-2 py-0.5 rounded-full text-[9px] font-bold border', getStatusBadge(model.status)]"
              >
                {{ getStatusText(model.status) }}
              </span>
            </div>
            <p class="text-[10px] text-slate-500 font-mono mb-2">模型：{{ model.model }}</p>
            <div class="flex items-center gap-4 text-[10px] text-slate-400">
              <span class="flex items-center gap-1">
                <Key :size="10" />
                {{ model.apiKey.slice(0, 8) }}***
              </span>
              <span v-if="model.baseUrl" class="flex items-center gap-1">
                <Globe :size="10" />
                {{ model.baseUrl.slice(0, 20) }}...
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click="editModel(model)"
              class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title="编辑"
            >
              <Edit2 :size="14" />
            </button>
            <button
              @click="testModelConnection(model)"
              class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
              title="测试连接"
            >
              <Server :size="14" />
            </button>
            <button
              @click="deleteModel(model.id)"
              class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="删除"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </div>

        <!-- Edit Form -->
        <div v-else class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-600 mb-1">模型名称</label>
              <input
                v-model="editingModel.name"
                type="text"
                class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none"
                placeholder="我的自定义模型"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-600 mb-1">提供商</label>
              <select
                v-model="editingModel.provider"
                class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="azure">Azure OpenAI</option>
                <option value="custom">自定义</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-600 mb-1">模型 ID</label>
            <input
              v-model="editingModel.model"
              type="text"
              class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none font-mono"
              placeholder="gpt-4-turbo"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-600 mb-1">API Key</label>
            <input
              v-model="editingModel.apiKey"
              type="password"
              class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none font-mono"
              placeholder="sk-..."
            />
          </div>
          <div v-if="editingModel.provider === 'custom'">
            <label class="block text-[10px] font-bold text-slate-600 mb-1">Base URL</label>
            <input
              v-model="editingModel.baseUrl"
              type="text"
              class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none font-mono"
              placeholder="https://api.example.com/v1"
            />
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button
              @click="cancelEdit"
              class="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded transition-colors"
            >
              取消
            </button>
            <button
              @click="saveModel"
              class="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="models.length === 0" class="text-center py-12 text-slate-400">
        <Server :size="48" class="mx-auto mb-3 opacity-20" />
        <p class="text-xs">暂无模型配置，点击右上角添加</p>
      </div>
    </div>

    <!-- Add Model Modal -->
    <div
      v-if="showAddModel"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showAddModel = false"
    >
      <div class="bg-white rounded-lg shadow-xl w-[480px] max-h-[80vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-light">
          <h3 class="text-sm font-bold text-slate-900">添加新模型</h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-[10px] font-bold text-slate-600 mb-1">模型名称 <span class="text-red-500">*</span></label>
            <input
              v-model="newModel.name"
              type="text"
              class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none"
              placeholder="例如：通义千问 Turbo"
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-600 mb-1">提供商 <span class="text-red-500">*</span></label>
              <select
                v-model="newModel.provider"
                class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="azure">Azure OpenAI</option>
                <option value="custom">自定义 API</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-600 mb-1">模型 ID <span class="text-red-500">*</span></label>
              <input
                v-model="newModel.model"
                type="text"
                class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none font-mono"
                placeholder="gpt-4-turbo"
              />
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-600 mb-1">API Key <span class="text-red-500">*</span></label>
            <input
              v-model="newModel.apiKey"
              type="password"
              class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none font-mono"
              placeholder="sk-..."
            />
          </div>
          <div v-if="newModel.provider === 'custom'">
            <label class="block text-[10px] font-bold text-slate-600 mb-1">Base URL</label>
            <input
              v-model="newModel.baseUrl"
              type="text"
              class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none font-mono"
              placeholder="https://api.example.com/v1"
            />
            <p class="text-[9px] text-slate-400 mt-1">自定义 API 端点，支持兼容 OpenAI 格式的任何服务</p>
          </div>

          <!-- Test Result -->
          <div v-if="testResult" class="p-3 rounded-md text-[10px]" :class="testResult.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">
            {{ testResult.message }}
          </div>
        </div>
        <div class="px-6 py-4 border-t border-light bg-slate-50 flex justify-end gap-2">
          <button
            @click="showAddModel = false"
            class="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
          >
            取消
          </button>
          <button
            @click="addModel"
            class="px-4 py-2 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            添加并测试
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
