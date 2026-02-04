<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, Trash2, Sliders } from 'lucide-vue-next'
import type { Node } from '@vue-flow/core'

const selectedNode = defineModel<Node | null>('selectedNode')
const activeTab = ref('config') // config | history | json
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
          <button @click="activeTab = 'history'"
              class="py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2"
              :class="activeTab === 'history' ? 'border-indigo-600 text-indigo-900' : 'border-transparent text-slate-400 hover:text-slate-600'">
              历史
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
                      <label class="form-label">模型选择</label>
                      <select v-model="selectedNode.data.model" class="form-select">
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          <option value="claude-3-opus">Claude 3 Opus</option>
                          <option value="qwen-turbo">通义千问 Turbo</option>
                          <option value="deepseek-chat">DeepSeek Chat</option>
                      </select>
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
                      <label class="form-label">知识库</label>
                      <select class="form-select">
                          <option value="default">默认知识库</option>
                          <option value="technical">技术文档</option>
                          <option value="legal">法律文档</option>
                      </select>
                  </div>
                  <div class="form-group">
                      <label class="form-label">查询文本</label>
                      <textarea v-model="selectedNode.data.query" rows="3" class="form-textarea" placeholder="在此输入查询内容..."></textarea>
                  </div>
                  <div class="form-group">
                      <label class="form-label">返回数量 ({{ selectedNode.data.topK || 3 }})</label>
                      <input type="range" v-model="selectedNode.data.topK" min="1" max="10" step="1" class="w-full accent-indigo-600" />
                  </div>
              </div>

              <!-- Default Fallback -->
              <div v-else class="text-center py-8 text-slate-400">
                  <p class="text-xs">此节点类型暂无特殊配置。</p>
              </div>
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
