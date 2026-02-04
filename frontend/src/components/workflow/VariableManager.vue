<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Trash2, Edit2, Eye, EyeOff, Code, FileText, Hash } from 'lucide-vue-next'

interface Variable {
  id: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'json' | 'array'
  value: string | number | boolean
  description: string
  isSecret: boolean
}

const showAddVar = ref(false)
const editingVar = ref<Variable | null>(null)
const searchQuery = ref('')

const variables = ref<Variable[]>([
  {
    id: '1',
    name: 'API_ENDPOINT',
    type: 'string',
    value: 'https://api.example.com',
    description: 'API 基础地址',
    isSecret: false
  },
  {
    id: '2',
    name: 'MAX_TOKENS',
    type: 'number',
    value: 4096,
    description: '最大令牌数',
    isSecret: false
  },
  {
    id: '3',
    name: 'OPENAI_API_KEY',
    type: 'string',
    value: 'your-openai-api-key',
    description: 'OpenAI API 密钥',
    isSecret: true
  },
  {
    id: '4',
    name: 'ENABLE_LOGGING',
    type: 'boolean',
    value: true,
    description: '是否启用日志',
    isSecret: false
  }
])

const newVar = ref<Variable>({
  id: '',
  name: '',
  type: 'string',
  value: '',
  description: '',
  isSecret: false
})

const typeIcons = {
  string: FileText,
  number: Hash,
  boolean: Code,
  json: Code,
  array: Code
}

const addVariable = () => {
  if (!newVar.value.name) return

  variables.value.push({
    ...newVar.value,
    id: Date.now().toString()
  })

  showAddVar.value = false
  newVar.value = {
    id: '',
    name: '',
    type: 'string',
    value: '',
    description: '',
    isSecret: false
  }
}

const deleteVariable = (id: string) => {
  variables.value = variables.value.filter(v => v.id !== id)
}

const editVariable = (variable: Variable) => {
  editingVar.value = { ...variable }
}

const saveVariable = () => {
  if (editingVar.value) {
    const idx = variables.value.findIndex(v => v.id === editingVar.value!.id)
    if (idx !== -1) {
      variables.value[idx] = { ...editingVar.value }
    }
    editingVar.value = null
  }
}

const cancelEdit = () => {
  editingVar.value = null
}

const toggleSecret = (variable: Variable) => {
  variable.isSecret = !variable.isSecret
}

const filteredVariables = ref(variables)

const formatValue = (variable: Variable) => {
  if (variable.isSecret) {
    return '••••••••'
  }

  if (variable.type === 'boolean') {
    return variable.value ? 'true' : 'false'
  }

  if (variable.type === 'json' || variable.type === 'array') {
    try {
      return JSON.stringify(variable.value).slice(0, 30) + (JSON.stringify(variable.value).length > 30 ? '...' : '')
    } catch {
      return String(variable.value)
    }
  }

  return String(variable.value)
}

const getTypeColor = (type: Variable['type']) => {
  const colors = {
    string: 'text-blue-600 bg-blue-50',
    number: 'text-emerald-600 bg-emerald-50',
    boolean: 'text-purple-600 bg-purple-50',
    json: 'text-orange-600 bg-orange-50',
    array: 'text-cyan-600 bg-cyan-50'
  }
  return colors[type]
}

const getTypeName = (type: Variable['type']) => {
  const names = {
    string: '字符串',
    number: '数字',
    boolean: '布尔值',
    json: 'JSON',
    array: '数组'
  }
  return names[type]
}
</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-light flex items-center justify-between">
      <div>
        <h2 class="text-sm font-bold text-slate-900">变量管理</h2>
        <p class="text-[10px] text-slate-500 mt-0.5">全局变量和环境配置</p>
      </div>
      <button
        @click="showAddVar = true"
        class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
      >
        <Plus :size="14" />
        添加变量
      </button>
    </div>

    <!-- Variable List -->
    <div class="flex-1 overflow-y-auto">
      <div class="px-6 py-3 border-b border-slate-100">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索变量..."
          class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none"
        />
      </div>

      <div class="divide-y divide-slate-100">
        <div
          v-for="variable in filteredVariables"
          :key="variable.id"
          class="group px-6 py-3 hover:bg-slate-50 transition-colors"
        >
          <div v-if="editingVar?.id !== variable.id" class="flex items-center gap-4">
            <!-- Type Icon -->
            <div
              class="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
              :class="getTypeColor(variable.type)"
            >
              <component :is="typeIcons[variable.type]" :size="14" />
            </div>

            <!-- Variable Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <h3 class="text-sm font-bold text-slate-900 font-mono">{{ variable.name }}</h3>
                <span
                  class="px-1.5 py-0.5 rounded text-[9px] font-medium"
                  :class="getTypeColor(variable.type)"
                >
                  {{ getTypeName(variable.type) }}
                </span>
                <span v-if="variable.isSecret" class="text-[9px] text-slate-400">••• 密钥</span>
              </div>
              <p class="text-[10px] text-slate-500">{{ variable.description }}</p>
              <p class="text-[10px] text-slate-400 font-mono mt-0.5">
                值：{{ formatValue(variable) }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="toggleSecret(variable)"
                class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                :title="variable.isSecret ? '显示' : '隐藏'"
              >
                <component :is="variable.isSecret ? EyeOff : Eye" :size="14" />
              </button>
              <button
                @click="editVariable(variable)"
                class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="编辑"
              >
                <Edit2 :size="14" />
              </button>
              <button
                @click="deleteVariable(variable.id)"
                class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="删除"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </div>

          <!-- Edit Form -->
          <div v-else class="space-y-3 py-2">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold text-slate-600 mb-1">变量名</label>
                <input
                  v-model="editingVar.name"
                  type="text"
                  class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none font-mono"
                  placeholder="MY_VARIABLE"
                />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-600 mb-1">类型</label>
                <select
                  v-model="editingVar.type"
                  class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none"
                >
                  <option value="string">字符串</option>
                  <option value="number">数字</option>
                  <option value="boolean">布尔值</option>
                  <option value="json">JSON</option>
                  <option value="array">数组</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-600 mb-1">值</label>
              <input
                v-if="editingVar.type !== 'boolean'"
                v-model="editingVar.value"
                type="text"
                class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none font-mono"
                placeholder="变量值"
              />
              <select
                v-else
                v-model="editingVar.value"
                class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none"
              >
                <option :value="true">true</option>
                <option :value="false">false</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-600 mb-1">描述</label>
              <input
                v-model="editingVar.description"
                type="text"
                class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none"
                placeholder="变量说明"
              />
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model="editingVar.isSecret"
                type="checkbox"
                id="secret"
                class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label for="secret" class="text-[10px] text-slate-600">标记为敏感信息</label>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button
                @click="cancelEdit"
                class="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded transition-colors"
              >
                取消
              </button>
              <button
                @click="saveVariable"
                class="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Variable Modal -->
    <div
      v-if="showAddVar"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showAddVar = false"
    >
      <div class="bg-white rounded-lg shadow-xl w-[480px] max-h-[80vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-light">
          <h3 class="text-sm font-bold text-slate-900">添加新变量</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-600 mb-1">变量名 <span class="text-red-500">*</span></label>
              <input
                v-model="newVar.name"
                type="text"
                class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none font-mono"
                placeholder="MY_VARIABLE"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-600 mb-1">类型</label>
              <select
                v-model="newVar.type"
                class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none"
              >
                <option value="string">字符串</option>
                <option value="number">数字</option>
                <option value="boolean">布尔值</option>
                <option value="json">JSON</option>
                <option value="array">数组</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-600 mb-1">值 <span class="text-red-500">*</span></label>
            <input
              v-if="newVar.type !== 'boolean'"
              v-model="newVar.value"
              type="text"
              class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none font-mono"
              placeholder="变量值"
            />
            <select
              v-else
              v-model="newVar.value"
              class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none"
            >
              <option :value="true">true</option>
              <option :value="false">false</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-600 mb-1">描述</label>
            <input
              v-model="newVar.description"
              type="text"
              class="w-full px-3 py-2 text-xs border border-light rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none"
              placeholder="变量用途说明"
            />
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="newVar.isSecret"
              type="checkbox"
              id="new-secret"
              class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label for="new-secret" class="text-[10px] text-slate-600">标记为敏感信息（如 API Key）</label>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-light bg-slate-50 flex justify-end gap-2">
          <button
            @click="showAddVar = false"
            class="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
          >
            取消
          </button>
          <button
            @click="addVariable"
            class="px-4 py-2 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            添加
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
