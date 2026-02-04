<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { API_BASE_URL } from '@/config/api'
import { Send, Bot, User, Cpu, CircleDot } from 'lucide-vue-next'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

const input = ref('')
const messages = ref<Message[]>([
  {
    role: 'system',
    content: 'Aether Agent 已初始化。准备就绪。',
    timestamp: Date.now()
  }
])
const loading = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const typeMessage = async (fullText: string) => {
  const msgIndex = messages.value.length
  messages.value.push({
    role: 'assistant',
    content: '',
    timestamp: Date.now()
  })

  // Simple typing simulation
  const chunkSize = 2 // chars per tick
  for (let i = 0; i < fullText.length; i += chunkSize) {
    if (messages.value[msgIndex]) {
        messages.value[msgIndex].content += fullText.slice(i, i + chunkSize)
        await new Promise(r => setTimeout(r, 20)) // 20ms delay
        await scrollToBottom()
    }
  }
}

const sendMessage = async () => {
  if (!input.value.trim() || loading.value) return

  const userMsg = input.value
  messages.value.push({
    role: 'user',
    content: userMsg,
    timestamp: Date.now()
  })
  input.value = ''
  loading.value = true
  await scrollToBottom()

  try {
    // Simulate API call for now if backend offline, or use fetch
    // const res = await fetch(`${API_BASE_URL}/agent/chat`...

    // Simulating response for UI check
    setTimeout(async () => {
        loading.value = false
        await typeMessage("我已经分析了您的请求。基于当前工作流配置，我可以执行部署序列。")
    }, 1000)

  } catch (e) {
    console.error(e)
    loading.value = false
    messages.value.push({
        role: 'system',
        content: '与 Agent 服务通信时出错。',
        timestamp: Date.now()
    })
  }
  await scrollToBottom()
}
</script>

<template>
  <div class="flex h-[calc(100vh-64px)] overflow-hidden bg-app">

    <!-- Chat Sidebar -->
    <aside class="w-64 bg-white border-r border-light flex flex-col hidden md:flex">
      <div class="p-4 border-b border-light">
        <h2 class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">活跃的 Agent</h2>
      </div>
      <div class="p-2 space-y-1">
        <div class="flex items-center gap-3 p-2 rounded-md bg-indigo-50 border border-indigo-100 cursor-pointer">
          <div class="relative">
            <div class="h-8 w-8 rounded-md bg-indigo-600 flex items-center justify-center text-white">
                <Bot :size="16" />
            </div>
            <span class="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-xs font-bold text-slate-900 truncate">编排器</div>
            <div class="text-[10px] text-slate-500 font-mono">gpt-4-turbo</div>
          </div>
        </div>

        <div class="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 border border-transparent cursor-pointer opacity-60">
          <div class="relative">
             <div class="h-8 w-8 rounded-md bg-slate-200 flex items-center justify-center text-slate-500">
                <Cpu :size="16" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-xs font-semibold text-slate-700 truncate">代码解释器</div>
            <div class="text-[10px] text-slate-400 font-mono">未连接</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Chat Area -->
    <main class="flex-1 flex flex-col relative bg-app">

      <!-- Messages -->
      <div
        ref="chatContainer"
        class="flex-1 overflow-y-auto p-6 space-y-4"
      >
        <div
            v-for="(msg, idx) in messages"
            :key="idx"
            class="flex gap-3 max-w-3xl mx-auto"
            :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
            <!-- Avatar (Assistant) -->
            <div v-if="msg.role !== 'user'" class="shrink-0 h-8 w-8 rounded-md bg-white border border-light flex items-center justify-center text-indigo-600 shadow-sm mt-1">
                 <CircleDot :size="16" v-if="msg.role === 'system'" class="text-slate-400" />
                 <Bot :size="16" v-else />
            </div>

            <div class="flex flex-col gap-1 max-w-[80%]">
                <div class="flex items-center gap-2" :class="msg.role === 'user' ? 'justify-end' : ''">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {{ msg.role }}
                    </span>
                    <span class="text-[10px] text-slate-300 font-mono">{{ new Date(msg.timestamp).toLocaleTimeString() }}</span>
                </div>

                <div
                    class="px-4 py-3 rounded-md shadow-sm text-sm leading-relaxed"
                    :class="[
                        msg.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : msg.role === 'system'
                                ? 'bg-white border border-light text-slate-500 font-mono text-xs py-2'
                                : 'bg-white border border-light text-slate-700'
                    ]"
                >
                    {{ msg.content }}
                </div>
            </div>

            <!-- Avatar (User) -->
            <div v-if="msg.role === 'user'" class="shrink-0 h-8 w-8 rounded-md bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-sm mt-1">
                <User :size="16" />
            </div>
        </div>

        <!-- Loading Indicator -->
        <div v-if="loading" class="flex gap-3 max-w-3xl mx-auto">
             <div class="shrink-0 h-8 w-8 rounded-md bg-white border border-light flex items-center justify-center text-indigo-600 shadow-sm mt-1">
                 <Bot :size="16" />
            </div>
            <div class="bg-white border border-light px-4 py-3 rounded-md shadow-sm flex items-center gap-2">
                <span class="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                <span class="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                <span class="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
            </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white border-t border-light">
        <div class="max-w-3xl mx-auto relative">
            <input
                v-model="input"
                @keydown.enter="sendMessage"
                type="text"
                class="w-full bg-slate-50 border border-light rounded-md pl-4 pr-12 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all shadow-sm"
                placeholder="向 Agent 发送消息..."
                :disabled="loading"
            />
            <button
                @click="sendMessage"
                :disabled="!input.trim() || loading"
                class="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
                <Send :size="16" />
            </button>
        </div>
        <div class="text-center mt-2">
            <p class="text-[10px] text-slate-400">AI 可能会出错。请审查生成内容。</p>
        </div>
      </div>

    </main>
  </div>
</template>
