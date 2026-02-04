<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { API_BASE_URL } from '@/config/api'
import { Send, Bot, User, Cpu, Sparkles, MessageSquare, LayoutGrid, Workflow, Database } from 'lucide-vue-next'
import Logo from '@/components/layout/Logo.vue'
import { RouterLink, useRoute } from 'vue-router'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

const route = useRoute()
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

const navLinks = [
  { name: '仪表盘', path: '/dashboard', icon: LayoutGrid },
  { name: '工作流', path: '/workflow', icon: Workflow },
  { name: '对话', path: '/chat', icon: MessageSquare },
  { name: '知识库', path: '/knowledge', icon: Database },
]

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
    // Simulating response for UI check
    setTimeout(async () => {
        loading.value = false
        await typeMessage("我已经分析了您的请求。基于当前工作流配置，我可以执行部署序列。如果您需要更多细节，请随时告诉我。")
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

    <div class="flex flex-1 overflow-hidden relative">
      <!-- Sidebar -->
      <aside class="w-72 bg-white/50 dark:bg-[#2a241e]/50 backdrop-blur-sm border-r border-sand/30 dark:border-white/10 flex flex-col hidden md:flex z-10">
        <div class="p-5 border-b border-sand/30 dark:border-white/10">
          <h2 class="text-xs font-bold text-khaki uppercase tracking-[0.2em]">活跃 Agent</h2>
        </div>
        <div class="p-3 space-y-2">
          <!-- Active Item -->
          <div class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/5 border border-sand/30 dark:border-white/10 shadow-sm cursor-pointer group transition-all hover:shadow-md">
            <div class="relative">
              <div class="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Bot :size="20" />
              </div>
              <span class="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-primary border-2 border-white dark:border-[#2a241e]"></span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-bold text-charcoal dark:text-white truncate">编排器</div>
              <div class="text-xs text-khaki truncate">GPT-4 Turbo</div>
            </div>
          </div>

          <!-- Inactive Item -->
          <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-sand/20 dark:hover:bg-white/5 border border-transparent cursor-pointer transition-colors opacity-70 hover:opacity-100">
            <div class="relative">
               <div class="size-10 rounded-full bg-sand/30 dark:bg-white/10 flex items-center justify-center text-charcoal/60 dark:text-sand/60">
                  <Cpu :size="20" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-charcoal dark:text-sand truncate">代码解释器</div>
              <div class="text-xs text-khaki/60 truncate">未连接</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Chat Area -->
      <main class="flex-1 flex flex-col relative">
        <!-- Messages -->
        <div
          ref="chatContainer"
          class="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 scroll-smooth"
        >
          <div
              v-for="(msg, idx) in messages"
              :key="idx"
              class="flex gap-4 max-w-4xl mx-auto"
              :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
          >
              <!-- Avatar (Assistant) -->
              <div v-if="msg.role !== 'user'" class="shrink-0 size-9 rounded-full bg-white dark:bg-[#2a241e] border border-sand/30 dark:border-white/10 flex items-center justify-center text-primary shadow-sm mt-1">
                   <Sparkles :size="18" v-if="msg.role === 'system'" class="text-khaki" />
                   <Bot :size="18" v-else />
              </div>

              <div class="flex flex-col gap-1.5 max-w-[85%] lg:max-w-[75%]">
                  <div class="flex items-center gap-2" :class="msg.role === 'user' ? 'justify-end' : ''">
                      <span class="text-[10px] font-bold text-khaki uppercase tracking-wider">
                          {{ msg.role === 'assistant' ? 'Aether' : msg.role }}
                      </span>
                  </div>

                  <div
                      class="px-5 py-3.5 shadow-sm text-sm lg:text-base leading-loose tracking-wide"
                      :class="[
                          msg.role === 'user'
                              ? 'bg-charcoal dark:bg-sand text-white dark:text-charcoal rounded-2xl rounded-tr-sm'
                              : msg.role === 'system'
                                  ? 'bg-transparent border border-dashed border-sand/50 text-khaki font-mono text-xs py-2 shadow-none'
                                  : 'bg-white dark:bg-[#2a241e] border border-sand/30 dark:border-white/10 text-charcoal dark:text-sand/90 rounded-2xl rounded-tl-sm'
                      ]"
                  >
                      {{ msg.content }}
                  </div>
                  <span class="text-[10px] text-khaki/60 px-1" :class="msg.role === 'user' ? 'text-right' : ''">
                    {{ new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
                  </span>
              </div>

              <!-- Avatar (User) -->
              <div v-if="msg.role === 'user'" class="shrink-0 size-9 rounded-full bg-sand/30 dark:bg-white/10 border border-sand/20 flex items-center justify-center text-charcoal dark:text-sand shadow-sm mt-1">
                  <User :size="18" />
              </div>
          </div>

          <!-- Loading Indicator -->
          <div v-if="loading" class="flex gap-4 max-w-4xl mx-auto">
               <div class="shrink-0 size-9 rounded-full bg-white dark:bg-[#2a241e] border border-sand/30 flex items-center justify-center text-primary shadow-sm mt-1">
                   <Bot :size="18" />
              </div>
              <div class="bg-white dark:bg-[#2a241e] border border-sand/30 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <span class="size-1.5 bg-primary rounded-full animate-bounce"></span>
                  <span class="size-1.5 bg-primary rounded-full animate-bounce delay-75"></span>
                  <span class="size-1.5 bg-primary rounded-full animate-bounce delay-150"></span>
              </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-6 bg-white/60 dark:bg-[#1e1711]/60 backdrop-blur-xl border-t border-sand/30 dark:border-white/5 z-20">
          <div class="max-w-4xl mx-auto relative group">
              <input
                  v-model="input"
                  @keydown.enter="sendMessage"
                  type="text"
                  class="w-full bg-white dark:bg-[#2a241e] border border-sand/50 dark:border-white/10 rounded-full pl-6 pr-14 py-4 text-base text-charcoal dark:text-white placeholder:text-khaki/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm group-hover:shadow-md"
                  placeholder="询问任何事情，或输入命令..."
                  :disabled="loading"
              />
              <button
                  @click="sendMessage"
                  :disabled="!input.trim() || loading"
                  class="absolute right-2 top-2 size-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                  <Send :size="18" />
              </button>
          </div>
          <div class="text-center mt-3">
              <p class="text-[10px] text-khaki font-medium tracking-wide">Aether Agent 可辅助处理工作流与数据分析。</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>