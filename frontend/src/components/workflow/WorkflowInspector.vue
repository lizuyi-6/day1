<script setup lang="ts">
import { ref, computed } from 'vue'
import { Sparkles, Trash2, Sliders, Plus, Database, ArrowUpRight, ArrowDownRight, Play, Loader2 } from 'lucide-vue-next'
import type { Node } from '@vue-flow/core'
import type { Variable } from '@/types/variable'
import { useVueFlow } from '@vue-flow/core'
import { workflowService } from '@/services/workflowService'

const selectedNode = defineModel<Node | null>('selectedNode')
const activeTab = ref('config') // config | inputs | outputs | json
const { nodes, edges } = useVueFlow()
const isTesting = ref(false)
const testResult = ref<any>(null)
const testError = ref<string | null>(null)

const inputs = computed<Variable[]>(() => {
  if (!selectedNode.value) return []
  return selectedNode.value.data.inputs || []
})

const outputs = computed<Variable[]>(() => {
  if (!selectedNode.value) return []
  return selectedNode.value.data.outputs || []
})

// 获取上游节点的输出变量
const getUpstreamVariables = () => {
  if (!selectedNode.value) return []

  // 找到所有连接到当前节点的边
  const incomingEdges = edges.value.filter(edge => edge.target === selectedNode.value?.id)
  
  // 获取上游节点
  const upstreamNodes = incomingEdges.map(edge => nodes.value.find(node => node.id === edge.source)).filter(Boolean)
  
  // 收集所有上游节点的输出变量
  const upstreamVariables: { name: string; nodeId: string; variableType: string }[] = []
  
  upstreamNodes.forEach(node => {
    if (node?.data?.outputs) {
      node.data.outputs.forEach((output: Variable) => {
        upstreamVariables.push({
          name: output.name,
          nodeId: node.id,
          variableType: output.type,
          label: `${node.data?.label || node.type}.${output.name}`
        })
      })
    }
  })

  return upstreamVariables
}

const addInput = () => {
  if (!selectedNode.value?.data.inputs) {
    selectedNode.value.data.inputs = []
  }
  selectedNode.value.data.inputs.push({
    name: `input_${selectedNode.value.data.inputs.length + 1}`,
    type: 'string',
    description: '',
    defaultValue: ''
  })
}

const removeInput = (index: number) => {
  if (selectedNode.value?.data.inputs) {
    selectedNode.value.data.inputs.splice(index, 1)
  }
}

const updateInput = (index: number, field: keyof Variable, value: any) => {
  if (selectedNode.value?.data.inputs) {
    selectedNode.value.data.inputs[index][field] = value
  }
}

const toggleVariableMode = (index: number) => {
  if (!selectedNode.value?.data.inputs) return
  
  const input = selectedNode.value.data.inputs[index]
  if (!input.mode) {
    input.mode = 'custom'
  } else if (input.mode === 'custom') {
    input.mode = 'upstream'
  } else {
    input.mode = 'custom'
  }
}

const addOutput = () => {
  if (!selectedNode.value?.data.outputs) {
    selectedNode.value.data.outputs = []
  }
  selectedNode.value.data.outputs.push({
    name: `output_${selectedNode.value.data.outputs.length + 1}`,
    type: 'string',
    description: '',
    defaultValue: ''
  })
}

const removeOutput = (index: number) => {
  if (selectedNode.value?.data.outputs) {
    selectedNode.value.data.outputs.splice(index, 1)
  }
}

const updateOutput = (index: number, field: keyof Variable, value: any) => {
  if (selectedNode.value?.data.outputs) {
    selectedNode.value.data.outputs[index][field] = value
  }
}

const testNode = async () => {
  if (!selectedNode.value) return

  isTesting.value = true
  testResult.value = null
  testError.value = null

  try {
    if (selectedNode.value.type === 'llm') {
      const testInputs = {
        prompt: '你好，请介绍一下自己。',
        systemPrompt: selectedNode.value.data.systemPrompt || '',
        temperature: selectedNode.value.data.temperature || 0.7,
        maxTokens: selectedNode.value.data.maxTokens || 2048
      }

      const workflowId = window.location.pathname.split('/').pop() || ''
      const result = await workflowService.debugNode(workflowId, selectedNode.value.id, testInputs)

      testResult.value = result
    } else {
      testResult.value = { message: '此节点类型暂不支持测试' }
    }
  } catch (error: any) {
    testError.value = error.message || '测试失败'
  } finally {
    isTesting.value = false
  }
}

const testKnowledgeNode = async () => {
  if (!selectedNode.value) return

  isTesting.value = true
  testResult.value = null
  testError.value = null

  try {
    const query = selectedNode.value.data.query || '测试查询'

    const response = await get(`${API_BASE_URL}/knowledge/search`, {
      params: { q: query }
    })

    if (response.success || response.data) {
      testResult.value = response.data || []
    }
  } catch (error: any) {
    testError.value = error.message || '测试失败'
  } finally {
    isTesting.value = false
  }
}
</script>

<template>
  <aside v-if="selectedNode" class="flex w-[340px] shrink-0 flex-col border-l border-indigo-100 bg-white z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
      <!-- Inspector Header -->
      <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div class="flex items-center gap-2">
              <Sparkles :size="16" class="text-indigo-500" />
              <span class="text-xs font-bold text-slate-700 uppercase tracking-wide">检查器</span>
          </div>
          <button @click="selectedNode = null" class="text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 :size="14" />
          </button>
      </div>

      <!-- Selected Node Identity -->
      <div class="p-4 border-b border-indigo-50 bg-white">
          <div class="flex items-start gap-3">
              <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                  <Sliders :size="18" />
              </div>
              <div class="flex-1 space-y-1">
                  <input type="text"
                      v-model="selectedNode.data.label"
                      class="w-full text-sm font-bold text-slate-800 bg-transparent border-b border-transparent focus:border-indigo-300 hover:border-slate-200 outline-none transition-all placeholder:text-slate-400 pb-0.5"
                      placeholder="节点标签"
                  />
                  <div class="flex items-center gap-2 text-[10px] text-slate-400">
                      <span class="font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">ID: {{ selectedNode.id }}</span>
                      <span class="capitalize">{{ selectedNode.type }} 节点</span>
                  </div>
              </div>
          </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-slate-100 px-4 gap-4">
          <button @click="activeTab = 'config'"
              class="py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2"
              :class="activeTab === 'config' ? 'border-indigo-600 text-indigo-900' : 'border-transparent text-slate-400 hover:text-slate-600'">
              配置
          </button>
          <button @click="activeTab = 'inputs'"
              class="py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2"
              :class="activeTab === 'inputs' ? 'border-indigo-600 text-indigo-900' : 'border-transparent text-slate-400 hover:text-slate-600'">
              输入变量
          </button>
          <button @click="activeTab = 'outputs'"
              class="py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2"
              :class="activeTab === 'outputs' ? 'border-indigo-600 text-indigo-900' : 'border-transparent text-slate-400 hover:text-slate-600'">
              输出变量
          </button>
          <button @click="activeTab = 'json'"
              class="py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2"
              :class="activeTab === 'json' ? 'border-indigo-600 text-indigo-900' : 'border-transparent text-slate-400 hover:text-slate-600'">
              JSON
          </button>
      </div>

      <!-- Form Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

          <div v-if="activeTab === 'config'" class="space-y-4">
              <!-- Dynamic Form Based on Type -->
              <div v-if="selectedNode.type === 'llm'" class="space-y-4">
                  <div class="form-group">
                      <label class="form-label">API 密钥 *</label>
                      <input type="password" v-model="selectedNode.data.apiKey" class="form-input" placeholder="sk-..." />
                  </div>
                  <div class="form-group">
                      <label class="form-label">提供商</label>
                      <select v-model="selectedNode.data.provider" class="form-select">
                          <option value="qwen">QWEN (通义千问)</option>
                          <option value="openai">OpenAI</option>
                          <option value="anthropic">Anthropic</option>
                          <option value="azure">Azure OpenAI</option>
                          <option value="custom">自定义</option>
                      </select>
                  </div>
                  <div class="form-group">
                      <label class="form-label">模型名称 *</label>
                      <input type="text" v-model="selectedNode.data.model" class="form-input" placeholder="qwen-flash" />
                  </div>
                  <div class="form-group" v-if="selectedNode.data.provider === 'custom'">
                      <label class="form-label">自定义 API 地址</label>
                      <input type="text" v-model="selectedNode.data.baseUrl" class="form-input font-mono text-[11px]" placeholder="https://api.example.com/v1" />
                  </div>
                  <div class="form-group">
                      <label class="form-label">系统提示词</label>
                      <textarea v-model="selectedNode.data.systemPrompt" rows="4" class="form-textarea" placeholder="你是一个有用的助手..."></textarea>
                  </div>
                  <div class="form-group">
                      <label class="form-label">温度 ({{ selectedNode.data.temperature || 0.7 }})</label>
                      <input type="range" v-model="selectedNode.data.temperature" min="0" max="1" step="0.1" class="w-full accent-indigo-600" />
                  </div>
                  <div class="form-group">
                      <label class="form-label">最大令牌数</label>
                      <input type="number" v-model="selectedNode.data.maxTokens" class="form-input" placeholder="4096" />
                  </div>
                  <div class="form-group">
                      <label class="form-label">欢迎语（首次对话时显示）</label>
                      <textarea v-model="selectedNode.data.welcomeMessage" rows="2" class="form-textarea" placeholder="你好！我是AI助手，有什么可以帮你的吗？"></textarea>
                      <p class="text-[10px] text-slate-400 mt-1">当用户首次选择该工作流时显示的系统消息</p>
                  </div>

                  <button
                      @click="testNode"
                      :disabled="isTesting"
                      class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wide rounded-md transition-colors">
                      <Loader2 v-if="isTesting" :size="14" class="animate-spin" />
                      <Play v-else :size="14" />
                      <span>{{ isTesting ? '测试中...' : '测试节点' }}</span>
                  </button>

                  <div v-if="testResult || testError" class="mt-4 rounded-md p-3 text-xs" :class="testError ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'">
                      <div v-if="testError" class="text-red-600">
                          <div class="font-bold mb-1">测试失败</div>
                          {{ testError }}
                      </div>
                      <div v-else class="text-emerald-600">
                          <div class="font-bold mb-1">测试成功</div>
                          <pre class="mt-2 overflow-x-auto bg-emerald-100/50 p-2 rounded text-[11px] font-mono">{{ JSON.stringify(testResult, null, 2) }}</pre>
                      </div>
                  </div>
              </div>

               <div v-else-if="selectedNode.type === 'code'" class="space-y-4">
                   <div class="form-group">
                      <label class="form-label">运行环境</label>
                      <select class="form-select">
                          <option value="python3.10">Python 3.10 (标准)</option>
                          <option value="python3.11">Python 3.11 (最新)</option>
                          <option value="nodejs18">Node.js 18 (LTS)</option>
                          <option value="nodejs20">Node.js 20 (当前)</option>
                      </select>
                  </div>
                   <div class="form-group">
                      <label class="form-label">代码脚本</label>
                      <textarea v-model="selectedNode.data.code" rows="10" class="form-textarea font-mono text-[11px]" placeholder="# 在此编写您的 Python 代码..."></textarea>
                  </div>
                  <div class="form-group">
                      <label class="form-label">超时时间（秒）</label>
                      <input type="number" v-model="selectedNode.data.timeout" class="form-input" placeholder="30" />
                  </div>
              </div>

              <div v-else-if="selectedNode.type === 'condition'" class="space-y-4">
                   <div class="form-group">
                      <label class="form-label">条件表达式 (JS)</label>
                      <textarea v-model="selectedNode.data.expression" rows="3" class="form-textarea font-mono" placeholder="input.value > 0.5"></textarea>
                      <p class="text-[10px] text-slate-400 mt-1">评估为布尔值 true/false 以路由流程。</p>
                  </div>
              </div>

               <div v-else-if="selectedNode.type === 'http'" class="space-y-4">
                   <div class="form-group">
                      <label class="form-label">请求方法</label>
                       <select v-model="selectedNode.data.method" class="form-select">
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                          <option value="PATCH">PATCH</option>
                      </select>
                  </div>
                   <div class="form-group">
                      <label class="form-label">URL</label>
                       <input type="text" v-model="selectedNode.data.url" class="form-input font-mono text-[11px]" placeholder="https://api.example.com/data" />
                  </div>
                  <div class="form-group">
                      <label class="form-label">请求头 (JSON)</label>
                      <textarea v-model="selectedNode.data.headers" rows="4" class="form-textarea font-mono text-[11px]" placeholder='{"Content-Type": "application/json"}'></textarea>
                  </div>
                  <div class="form-group">
                      <label class="form-label">请求体 (JSON)</label>
                      <textarea v-model="selectedNode.data.body" rows="4" class="form-textarea font-mono text-[11px]" placeholder='{"key": "value"}'></textarea>
                  </div>
              </div>

              <div v-else-if="selectedNode.type === 'knowledge'" class="space-y-4">
                   <div class="form-group">
                      <label class="form-label">查询文本</label>
                      <textarea v-model="selectedNode.data.query" rows="3" class="form-textarea" placeholder="输入查询内容或使用上游变量..."></textarea>
                      <p class="text-[10px] text-slate-400 mt-1">留空以使用上游节点提供的查询参数</p>
                  </div>
                  <div class="form-group">
                      <label class="form-label">返回数量 ({{ selectedNode.data.topK || 3 }})</label>
                      <input type="range" v-model="selectedNode.data.topK" min="1" max="10" step="1" class="w-full accent-emerald-600" />
                  </div>

                  <button
                      @click="testKnowledgeNode"
                      :disabled="isTesting"
                      class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold uppercase rounded-md transition-colors">
                      <Loader2 v-if="isTesting" :size="14" class="animate-spin" />
                      <Play v-else :size="14" />
                      <span>{{ isTesting ? '测试中...' : '测试检索' }}</span>
                  </button>

                  <div v-if="testResult || testError" class="mt-4 rounded-md p-3 text-xs" :class="testError ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'">
                      <div v-if="testError" class="text-red-600">
                          <div class="font-bold mb-1">测试失败</div>
                          {{ testError }}
                      </div>
                      <div v-else class="text-emerald-600">
                          <div class="font-bold mb-1">测试成功</div>
                          <div class="text-slate-600 mb-2">找到 {{ testResult?.length || 0 }} 条结果</div>
                          <div class="max-h-40 overflow-y-auto space-y-2">
                              <div v-for="(item, idx) in (testResult || []).slice(0, 3)" :key="idx" class="bg-emerald-100/50 p-2 rounded text-[10px]">
                                  <div class="font-bold">{{ item.fileName }}</div>
                                  <div class="mt-1 line-clamp-2">{{ item.content?.substring(0, 100) }}...</div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <div v-else-if="selectedNode.type === 'loop'" class="space-y-4">
                   <div class="form-group">
                      <label class="form-label">循环类型</label>
                      <select v-model="selectedNode.data.loopType" class="form-select">
                          <option value="list">列表循环</option>
                          <option value="count">计数循环</option>
                          <option value="while">条件循环</option>
                      </select>
                  </div>
                  <div class="form-group" v-if="selectedNode.data.loopType === 'count'">
                      <label class="form-label">迭代次数</label>
                      <input type="number" v-model="selectedNode.data.iterations" class="form-input" placeholder="10" />
                  </div>
                  <div class="form-group" v-if="selectedNode.data.loopType === 'while'">
                      <label class="form-label">循环条件</label>
                      <textarea v-model="selectedNode.data.condition" rows="2" class="form-textarea font-mono" placeholder="index < 100"></textarea>
                  </div>
              </div>

              <div v-else-if="selectedNode.type === 'filter'" class="space-y-4">
                   <div class="form-group">
                      <label class="form-label">过滤条件</label>
                      <textarea v-model="selectedNode.data.condition" rows="3" class="form-textarea font-mono" placeholder="item.value > 0"></textarea>
                  </div>
              </div>

              <div v-else-if="selectedNode.type === 'variable'" class="space-y-4">
                   <div class="form-group">
                      <label class="form-label">变量名</label>
                      <input type="text" v-model="selectedNode.data.variableName" class="form-input" placeholder="myVariable" />
                  </div>
                  <div class="form-group">
                      <label class="form-label">初始值</label>
                      <input type="text" v-model="selectedNode.data.value" class="form-input" placeholder="默认值" />
                  </div>
              </div>

              <div v-else-if="selectedNode.type === 'webhook'" class="space-y-4">
                   <div class="form-group">
                      <label class="form-label">请求方法</label>
                      <select v-model="selectedNode.data.method" class="form-select">
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                      </select>
                  </div>
                   <div class="form-group">
                      <label class="form-label">Webhook URL</label>
                      <input type="text" v-model="selectedNode.data.url" class="form-input font-mono text-[11px]" placeholder="https://example.com/webhook" />
                  </div>
              </div>

              <div v-else-if="selectedNode.type === 'delay'" class="space-y-4">
                   <div class="form-group">
                      <label class="form-label">延迟时间</label>
                      <input type="text" v-model="selectedNode.data.duration" class="form-input" placeholder="5s" />
                      <p class="text-[10px] text-slate-400 mt-1">支持格式: 5s, 100ms, 1m</p>
                  </div>
              </div>

              <div v-else-if="selectedNode.type === 'notification'" class="space-y-4">
                   <div class="form-group">
                      <label class="form-label">通知渠道</label>
                      <select v-model="selectedNode.data.channel" class="form-select">
                          <option value="system">系统通知</option>
                          <option value="slack">Slack</option>
                          <option value="discord">Discord</option>
                          <option value="wechat">企业微信</option>
                      </select>
                  </div>
                   <div class="form-group">
                      <label class="form-label">消息内容</label>
                      <textarea v-model="selectedNode.data.message" rows="3" class="form-textarea" placeholder="通知消息..."></textarea>
                  </div>
              </div>

              <div v-else-if="selectedNode.type === 'email'" class="space-y-4">
                   <div class="form-group">
                      <label class="form-label">收件人</label>
                      <input type="text" v-model="selectedNode.data.to" class="form-input" placeholder="user@example.com" />
                  </div>
                   <div class="form-group">
                      <label class="form-label">邮件主题</label>
                      <input type="text" v-model="selectedNode.data.subject" class="form-input" placeholder="邮件主题" />
                  </div>
                   <div class="form-group">
                      <label class="form-label">邮件正文</label>
                      <textarea v-model="selectedNode.data.body" rows="5" class="form-textarea" placeholder="邮件内容..."></textarea>
                  </div>
              </div>

              <!-- Default Fallback -->
              <div v-else class="text-center py-8 text-slate-400">
                  <p class="text-xs">此节点类型暂无特殊配置。</p>
              </div>
          </div>

          <!-- Input Variables Panel -->
          <div v-else-if="activeTab === 'inputs'" class="space-y-4">
              <div v-if="inputs.length === 0" class="text-center py-8 text-slate-400">
                  <p class="text-xs">此节点暂无输入变量</p>
              </div>
              <div v-for="(input, index) in inputs" :key="index" class="rounded border border-slate-100 bg-slate-50/30 p-3 space-y-2">
                  
                  <!-- Variable Mode Toggle -->
                  <div class="flex items-center justify-between mb-2">
                      <span class="text-[10px] font-bold text-slate-400 uppercase">{{ input.name }}</span>
                      <span class="text-[9px] font-mono text-slate-300">{{ input.type }}</span>
                      <button @click="toggleVariableMode(index)"
                              class="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-200 transition-all"
                              :class="input.mode === 'custom' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-600'">
                          <span v-if="input.mode === 'custom'" class="text-[9px] font-medium">✏️ 自定义</span>
                          <span v-else class="text-[9px] font-medium">🔗 上游</span>
                      </button>
                  </div>
                  
                  <!-- Custom Mode: Direct Input -->
                  <div v-if="input.mode === 'custom'" class="space-y-2">
                      <input type="text" 
                             :value="input.name"
                             @input="updateInput(index, 'name', ($event.target as HTMLInputElement).value)"
                             class="w-full text-[11px] font-mono font-bold text-slate-900 bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none"
                             placeholder="变量名" />
                  </div>
                  
                  <!-- Upstream Mode: Dropdown Selection -->
                  <div v-else class="space-y-2">
                      <div class="flex items-center gap-2">
                          <select :value="input.sourceVariableName || ''"
                                  @change="updateInput(index, 'sourceVariableName', ($event.target as HTMLSelectElement).value)"
                                  class="flex-1 text-[9px] font-medium text-slate-600 bg-slate-100/50 border border-slate-200 rounded px-2 py-1">
                              <option value="">选择上游变量...</option>
                              <option v-for="variable in getUpstreamVariables()" 
                                      :key="variable.name" 
                                      :value="variable.name">
                                  {{ variable.label }} ({{ variable.variableType }})
                              </option>
                          </select>
                          <button @click="updateInput(index, 'sourceVariableName', '')"
                                  class="text-slate-400 hover:text-slate-600 transition-colors"
                                  title="清除选择">
                              ✕
                          </button>
                      </div>
                  </div>
                  
                  <!-- Common Fields -->
                  <div class="flex items-center gap-2">
                      <select :value="input.type"
                              @change="updateInput(index, 'type', ($event.target as HTMLSelectElement).value)"
                              class="text-[9px] font-medium text-slate-600 bg-slate-100/50 border border-slate-200 rounded px-2 py-0.5">
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="object">Object</option>
                          <option value="array">Array</option>
                      </select>
                      <input type="text" 
                             :value="input.description || ''"
                             @input="updateInput(index, 'description', ($event.target as HTMLInputElement).value)"
                             class="flex-1 text-[10px] text-slate-600 bg-transparent border-b border-transparent focus:border-slate-300 outline-none"
                             placeholder="描述" />
                  </div>
                  <input type="text" 
                         :value="input.defaultValue || ''"
                         @input="updateInput(index, 'defaultValue', ($event.target as HTMLInputElement).value)"
                         class="w-full text-[10px] text-slate-500 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-slate-300"
                         placeholder="默认值" />
                  <button @click="removeInput(index)" 
                          class="w-full py-2 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded transition-all">
                      <Trash2 :size="12" class="inline mr-1" />
                      删除变量
                  </button>
              </div>
              <button @click="addInput" 
                      class="w-full py-2 text-[10px] text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-dashed border-indigo-300 rounded transition-all">
                  <Plus :size="12" class="inline mr-1" />
                  添加输入变量
              </button>
          </div>

          <!-- Output Variables Panel -->
          <div v-else-if="activeTab === 'outputs'" class="space-y-4">
              <div v-if="outputs.length === 0" class="text-center py-8 text-slate-400">
                  <p class="text-xs">此节点暂无输出变量</p>
              </div>
              <div v-for="(output, index) in outputs" :key="index" class="rounded border border-slate-100 bg-slate-50/30 p-3 space-y-2">
                  <div class="flex items-center justify-between">
                      <input type="text" 
                             :value="output.name"
                             @input="updateOutput(index, 'name', ($event.target as HTMLInputElement).value)"
                             class="flex-1 text-[11px] font-mono font-bold text-slate-900 bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none"
                             placeholder="变量名" />
                      <button @click="removeOutput(index)" 
                              class="text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 :size="12" />
                      </button>
                  </div>
                  <div class="flex items-center gap-2">
                      <select :value="output.type"
                              @change="updateOutput(index, 'type', ($event.target as HTMLSelectElement).value)"
                              class="text-[9px] font-medium text-slate-600 bg-slate-100/50 border border-slate-200 rounded px-2 py-0.5">
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="object">Object</option>
                          <option value="array">Array</option>
                          <option value="any">Any</option>
                      </select>
                      <input type="text" 
                             :value="output.description || ''"
                             @input="updateOutput(index, 'description', ($event.target as HTMLInputElement).value)"
                             class="flex-1 text-[10px] text-slate-600 bg-transparent border-b border-transparent focus:border-slate-300 outline-none"
                             placeholder="描述" />
                  </div>
                  <input type="text" 
                         :value="output.defaultValue || ''"
                         @input="updateOutput(index, 'defaultValue', ($event.target as HTMLInputElement).value)"
                         class="w-full text-[10px] text-slate-500 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-slate-300"
                         placeholder="默认值" />
              </div>
              <button @click="addOutput" 
                      class="w-full py-2 text-[10px] text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-dashed border-indigo-300 rounded transition-all">
                  <Plus :size="12" class="inline mr-1" />
                  添加输出变量
              </button>
          </div>

          <div v-else-if="activeTab === 'json'" class="space-y-4">
               <div class="bg-slate-50 p-3 rounded-md border border-slate-100">
                  <pre class="text-[10px] font-mono text-slate-600 overflow-x-auto whitespace-pre-wrap break-all">{{ JSON.stringify(selectedNode.data, null, 2) }}</pre>
               </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center h-48 text-slate-400 space-y-2">
              <span class="text-xs">历史记录在预览版中不可用</span>
          </div>

      </div>

      <!-- Inspector Footer -->
      <div class="p-4 border-t border-slate-100 bg-slate-50/50">
          <button class="w-full py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all">
              检查验证
          </button>
      </div>
  </aside>
</template>

<style scoped>
.form-label {
    display: block;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 4px;
    letter-spacing: 0.05em;
}

.form-input, .form-textarea, .form-select {
    width: 100%;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 0.8rem;
    color: #334155;
    outline: none;
    transition: all 0.2s;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
    background: white;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

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
</style>
