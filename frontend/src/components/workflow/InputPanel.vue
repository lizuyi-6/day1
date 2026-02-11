<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { FileText, Save, Upload, Download, Trash2 } from 'lucide-vue-next'
import type { Variable } from '@/types/variable'

const props = defineProps<{
  inputs: Variable[]
  executing: boolean
}>()

const emit = defineEmits<{
  execute: [data: Record<string, any>]
  close: []
}>()

const inputValues = ref<Record<string, any>>({})
const savedTemplates = ref<{ name: string; data: Record<string, any> }[]>([])

watch(() => props.inputs, (newInputs) => {
  const newValues: Record<string, any> = {}
  newInputs.forEach(input => {
    newValues[input.name] = input.defaultValue !== undefined ? input.defaultValue : ''
  })
  inputValues.value = newValues
}, { immediate: true })

const isValid = computed(() => {
  return props.inputs.every(input => {
    if (input.required && !inputValues.value[input.name]) return false
    return true
  })
})

const getDefaultValueForType = (type: string) => {
  switch (type) {
    case 'number': return 0
    case 'boolean': return false
    case 'object': return {}
    case 'array': return []
    default: return ''
  }
}

const getInputComponent = (input: Variable) => {
  switch (input.type) {
    case 'string':
      return 'textarea'
    case 'number':
      return 'number'
    case 'boolean':
      return 'checkbox'
    case 'object':
    case 'array':
      return 'textarea'
    default:
      return 'text'
  }
}

const execute = () => {
  emit('execute', inputValues.value)
}

const saveTemplate = () => {
  const name = prompt('请输入模板名称：')
  if (name) {
    savedTemplates.value.push({
      name,
      data: { ...inputValues.value }
    })
    localStorage.setItem('workflow-input-templates', JSON.stringify(savedTemplates.value))
  }
}

const loadTemplate = (index: number) => {
  const template = savedTemplates.value[index]
  if (template) {
    inputValues.value = { ...template.data }
  }
}

const deleteTemplate = (index: number) => {
  savedTemplates.value.splice(index, 1)
  localStorage.setItem('workflow-input-templates', JSON.stringify(savedTemplates.value))
}

const clearAll = () => {
  props.inputs.forEach(input => {
    inputValues.value[input.name] = input.defaultValue !== undefined ? input.defaultValue : getDefaultValueForType(input.type)
  })
}

const exportInput = () => {
  const dataStr = JSON.stringify(inputValues.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `workflow-input-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const importInput = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          inputValues.value = data
        } catch (error) {
          alert('文件格式错误，请导入有效的 JSON 文件')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const loadSavedTemplates = () => {
  const saved = localStorage.getItem('workflow-input-templates')
  if (saved) {
    try {
      savedTemplates.value = JSON.parse(saved)
    } catch (error) {
      console.error('加载模板失败:', error)
    }
  }
}

loadSavedTemplates()
</script>

<template>
  <div class="input-panel flex flex-col h-full bg-white border-l border-slate-200">
    <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
      <div class="flex items-center gap-2">
        <FileText :size="16" class="text-indigo-600" />
        <h3 class="font-bold text-sm text-slate-800">输入面板</h3>
      </div>
      <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 transition-colors">
        ✕
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-if="inputs.length === 0" class="text-center py-8 text-slate-400">
        <p class="text-sm">暂无输入变量</p>
        <p class="text-xs mt-2">请在 Start 节点中添加输入变量</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="input in inputs" :key="input.name" class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-bold text-slate-700">
              {{ input.name }}
              <span v-if="input.required" class="text-red-500 ml-1">*</span>
            </label>
            <span class="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{{ input.type }}</span>
          </div>

          <input
            v-if="getInputComponent(input) === 'text'"
            v-model="inputValues[input.name]"
            type="text"
            class="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            :placeholder="input.description || '请输入' + input.name"
          />

          <textarea
            v-else-if="getInputComponent(input) === 'textarea'"
            v-model="inputValues[input.name]"
            rows="4"
            class="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
            :placeholder="input.description || '请输入' + input.name"
          />

          <input
            v-else-if="getInputComponent(input) === 'number'"
            v-model="inputValues[input.name]"
            type="number"
            class="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            :placeholder="input.description || '请输入' + input.name"
          />

          <div v-else-if="getInputComponent(input) === 'checkbox'" class="flex items-center gap-2">
            <input
              v-model="inputValues[input.name]"
              type="checkbox"
              class="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-500"
            />
            <span class="text-sm text-slate-600">{{ input.description || input.name }}</span>
          </div>

          <div v-if="input.description" class="text-xs text-slate-500">
            {{ input.description }}
          </div>
        </div>

        <div v-if="!isValid" class="p-3 bg-red-50 border border-red-200 rounded">
          <p class="text-xs text-red-600">请填写所有必填项</p>
        </div>
      </div>
    </div>

    <div class="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
      <div class="flex gap-2">
        <button
          @click="execute"
          :disabled="!isValid || executing"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          <FileText :size="16" />
          执行工作流
        </button>
        <button
          @click="clearAll"
          :disabled="executing"
          class="px-4 py-2.5 bg-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-300 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 :size="16" />
        </button>
      </div>

      <div class="flex gap-2">
        <button
          @click="saveTemplate"
          :disabled="executing"
          class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
        >
          <Save :size="14" />
          保存模板
        </button>
        <button
          @click="exportInput"
          :disabled="executing"
          class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
        >
          <Download :size="14" />
          导出
        </button>
        <button
          @click="importInput"
          :disabled="executing"
          class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
        >
          <Upload :size="14" />
          导入
        </button>
      </div>

      <div v-if="savedTemplates.length > 0" class="border-t border-slate-200 pt-2">
        <p class="text-xs font-bold text-slate-600 mb-2">已保存的模板</p>
        <div class="space-y-1">
          <div
            v-for="(template, index) in savedTemplates"
            :key="index"
            class="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded hover:border-indigo-300 transition-colors"
          >
            <button
              @click="loadTemplate(index)"
              :disabled="executing"
              class="flex-1 text-left text-xs text-slate-700 hover:text-indigo-600 disabled:text-slate-400"
            >
              {{ template.name }}
            </button>
            <button
              @click="deleteTemplate(index)"
              :disabled="executing"
              class="text-slate-400 hover:text-red-500 disabled:text-slate-300 transition-colors"
            >
              <Trash2 :size="12" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-panel {
  font-family: var(--font-ui);
}
</style>
