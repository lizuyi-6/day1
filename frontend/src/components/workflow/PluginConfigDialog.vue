<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, Save, RotateCcw } from 'lucide-vue-next'

export interface PluginConfigField {
  key: string
  label: string
  type: 'text' | 'password' | 'number' | 'boolean' | 'select' | 'textarea'
  default?: any
  options?: { label: string; value: any }[]
  required?: boolean
  placeholder?: string
  description?: string
}

export interface Plugin {
  id: string
  name: string
  description: string
  icon: any
  category: string
  enabled: boolean
  config?: Record<string, unknown>
}

const props = defineProps<{
  plugin: Plugin | null
  configFields?: PluginConfigField[]
}>()

const emit = defineEmits<{
  close: []
  save: [pluginId: string, config: Record<string, unknown>]
}>()

const isOpen = computed(() => props.plugin !== null)

const localConfig = ref<Record<string, unknown>>({})
const originalConfig = ref<Record<string, unknown>>({})

const defaultConfigFields: Record<string, PluginConfigField[]> = {
  '1': [
    { key: 'timeout', label: '超时时间(秒)', type: 'number', default: 30, required: true },
    { key: 'userAgent', label: 'User Agent', type: 'text', placeholder: '自定义 User Agent' },
    { key: 'retryCount', label: '重试次数', type: 'number', default: 3 },
    { key: 'enableProxy', label: '启用代理', type: 'boolean', default: false },
    { key: 'proxyUrl', label: '代理地址', type: 'text', placeholder: 'http://proxy.example.com:8080' }
  ],
  '2': [
    { key: 'connectionString', label: '连接字符串', type: 'password', required: true, placeholder: '数据库连接字符串' },
    { key: 'poolSize', label: '连接池大小', type: 'number', default: 10 },
    { key: 'queryTimeout', label: '查询超时(秒)', type: 'number', default: 30 }
  ],
  '3': [
    { key: 'cronExpression', label: 'Cron 表达式', type: 'text', required: true, placeholder: '0 0 * * *' },
    { key: 'timezone', label: '时区', type: 'select', options: [
      { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
      { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
      { label: 'UTC', value: 'UTC' }
    ], default: 'Asia/Shanghai' }
  ],
  '4': [
    { key: 'sensitivity', label: '敏感度级别', type: 'select', options: [
      { label: '低', value: 'low' },
      { label: '中', value: 'medium' },
      { label: '高', value: 'high' }
    ], default: 'medium' },
    { key: 'blockKeywords', label: '屏蔽关键词', type: 'textarea', placeholder: '每行一个关键词' },
    { key: 'enableAI', label: '启用 AI 检测', type: 'boolean', default: true }
  ],
  '5': [
    { key: 'maxLength', label: '最大摘要长度', type: 'number', default: 200 },
    { key: 'language', label: '摘要语言', type: 'select', options: [
      { label: '中文', value: 'zh' },
      { label: '英文', value: 'en' },
      { label: '自动', value: 'auto' }
    ], default: 'zh' },
    { key: 'extractKeyPoints', label: '提取关键点', type: 'boolean', default: true }
  ],
  '6': [
    { key: 'cacheSize', label: '缓存大小(MB)', type: 'number', default: 100 },
    { key: 'ttl', label: '过期时间(秒)', type: 'number', default: 3600 },
    { key: 'enableCompression', label: '启用压缩', type: 'boolean', default: true }
  ]
}

const currentFields = computed(() => {
  if (!props.plugin) return []
  if (props.configFields && props.configFields.length > 0) return props.configFields
  return defaultConfigFields[props.plugin.id] || []
})

watch(() => props.plugin, (newPlugin) => {
  if (newPlugin) {
    localConfig.value = { ...newPlugin.config }
    originalConfig.value = { ...newPlugin.config }
    
    currentFields.value.forEach(field => {
      if (localConfig.value[field.key] === undefined && field.default !== undefined) {
        localConfig.value[field.key] = field.default
      }
    })
  }
}, { immediate: true })

const hasChanges = computed(() => {
  return JSON.stringify(localConfig.value) !== JSON.stringify(originalConfig.value)
})

const handleSave = () => {
  if (props.plugin) {
    emit('save', props.plugin.id, localConfig.value)
  }
}

const resetConfig = () => {
  localConfig.value = { ...originalConfig.value }
  currentFields.value.forEach(field => {
    if (localConfig.value[field.key] === undefined && field.default !== undefined) {
      localConfig.value[field.key] = field.default
    }
  })
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="handleClose" />
        
        <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <component :is="plugin?.icon" :size="20" class="text-primary" />
              <div>
                <h3 class="text-base font-bold text-gray-900 dark:text-white">{{ plugin?.name }} 配置</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ plugin?.description }}</p>
              </div>
            </div>
            <button @click="handleClose" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X :size="20" />
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto max-h-[60vh]">
            <div v-if="currentFields.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
              此插件无需配置
            </div>
            
            <div v-else class="space-y-4">
              <div v-for="field in currentFields" :key="field.key" class="space-y-1.5">
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ field.label }}
                  <span v-if="field.required" class="text-red-500">*</span>
                </label>
                
                <input
                  v-if="field.type === 'text' || field.type === 'password' || field.type === 'number'"
                  v-model="localConfig[field.key]"
                  :type="field.type"
                  :placeholder="field.placeholder"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                
                <textarea
                  v-else-if="field.type === 'textarea'"
                  v-model="localConfig[field.key]"
                  :placeholder="field.placeholder"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
                
                <select
                  v-else-if="field.type === 'select'"
                  v-model="localConfig[field.key]"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
                
                <div v-else-if="field.type === 'boolean'" class="flex items-center gap-2">
                  <button
                    @click="localConfig[field.key] = !localConfig[field.key]"
                    class="relative w-10 h-5 rounded-full transition-colors"
                    :class="localConfig[field.key] ? 'bg-primary' : 'bg-gray-300'"
                  >
                    <span
                      class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                      :class="localConfig[field.key] ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ localConfig[field.key] ? '启用' : '禁用' }}
                  </span>
                </div>
                
                <p v-if="field.description" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ field.description }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              @click="resetConfig"
              :disabled="!hasChanges"
              class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw :size="16" />
              重置
            </button>
            <button
              @click="handleClose"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              @click="handleSave"
              :disabled="!hasChanges"
              class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save :size="16" />
              保存配置
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active > div > div,
.modal-leave-active > div > div {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div > div,
.modal-leave-to > div > div {
  transform: scale(0.95);
  opacity: 0;
}
</style>
