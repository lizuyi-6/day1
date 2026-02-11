<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { API_BASE_URL } from '@/config/api';
import { post, get, del } from '@/utils/api';
import { workflowService } from '@/services/workflowService';
import { Send, Bot, User, Cpu, Sparkles, MessageSquare, LayoutGrid, Workflow, Database, Trash2, CheckSquare, Square, X } from 'lucide-vue-next';
import Logo from '@/components/layout/Logo.vue';
import { RouterLink, useRoute } from 'vue-router';
import { useScrollAnimations } from '@/composables/useScrollAnimations';
import { TYPING_CHUNK_SIZE, TYPING_DELAY } from '@/config/constants';

console.log('🚀 ChatView component loading...');

const route = useRoute()

// Initialize scroll animations
useScrollAnimations()

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

interface Agent {
    id: string;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
}

const input = ref('')
const messages = ref<Message[]>([
  {
    role: 'system',
    content: '请从左侧选择一个助手（工作流）开始对话。',
    timestamp: Date.now()
  }
])
const loading = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
const agents = ref<Agent[]>([])
const activeAgentId = ref<string | null>(null)
const activeAgent = ref<any>(null)

// 批量删除相关状态
const isManageMode = ref(false)
const selectedAgentIds = ref<Set<string>>(new Set())
const isDeleting = ref(false)

const navLinks = [
  { name: '仪表盘', path: '/dashboard', icon: LayoutGrid },
  { name: '工作流', path: '/workflows', icon: Workflow },
  { name: '对话', path: '/chat', icon: MessageSquare },
  { name: '知识库', path: '/knowledge', icon: Database },
]

onMounted(async () => {
  console.log('ChatView mounted, loading agents...');
  document.body.classList.add('page-loaded')
  await loadAgents()
})

const loadAgents = async () => {
    console.log('🔄 loadAgents() called - Starting to load agents...');
    loading.value = true;
    try {
        console.log('🔄 Loading agents (deployed workflows)...');
        // Use workflowService to get workflows properly with auth headers
        // Pass status parameter to filter only published (deployed) workflows
        const result = await workflowService.getAllWorkflows(1, 50, 'published');
        console.log('📥 Agents result:', result);
        
        if (result.success && result.workflows) {
            console.log('Found deployed workflows:', result.workflows.length);
            agents.value = result.workflows.map((wf: any) => ({
                id: wf.id,
                name: wf.name,
                description: wf.description || '自定义工作流',
                status: 'inactive' // Default status, active one will be set on click
            }))
            
            // Auto-select the first agent if available
            if (agents.value.length > 0) {
                await selectAgent(agents.value[0].id)
            } else {
                messages.value = [
                    {
                        role: 'system',
                        content: '暂无已部署的工作流。请先在"工作流"页面部署一个工作流。',
                        timestamp: Date.now()
                    }
                ]
            }
        } else {
            console.error('Failed to load agents:', result.error)
            messages.value = [
                {
                    role: 'system',
                    content: `加载工作流失败: ${result.error || '未知错误'}`,
                    timestamp: Date.now()
                }
            ]
        }
    } catch (e) {
        console.error('Failed to load agents', e)
    } finally {
        loading.value = false;
    }
}

// 批量删除方法
const toggleManageMode = () => {
  isManageMode.value = !isManageMode.value
  selectedAgentIds.value.clear()
}

const toggleAgentSelection = (agentId: string) => {
  if (selectedAgentIds.value.has(agentId)) {
    selectedAgentIds.value.delete(agentId)
  } else {
    selectedAgentIds.value.add(agentId)
  }
}

const deleteSelectedAgents = async () => {
  if (selectedAgentIds.value.size === 0) {
    messages.value.push({
      role: 'system',
      content: '请先选择要删除的工作流。',
      timestamp: Date.now()
    })
    return
  }

  if (!confirm(`确定要删除选中的 ${selectedAgentIds.value.size} 个工作流吗？此操作不可撤销。`)) {
    return
  }

  isDeleting.value = true
  let successCount = 0
  let failCount = 0

  for (const agentId of selectedAgentIds.value) {
    try {
      const result = await workflowService.deleteWorkflow(agentId)
      if (result.success) {
        successCount++
      } else {
        failCount++
        console.error('Failed to delete workflow:', agentId, result.error)
      }
    } catch (error: any) {
      failCount++
      console.error('Error deleting workflow:', agentId, error)
    }
  }

  isDeleting.value = false
  selectedAgentIds.value.clear()
  isManageMode.value = false

  // 重新加载列表
  await loadAgents()

  // 显示结果
  messages.value.push({
    role: 'system',
    content: `删除完成：成功 ${successCount} 个，失败 ${failCount} 个。`,
    timestamp: Date.now()
  })
}

const selectAgent = async (id: string) => {
    activeAgentId.value = id
    try {
        // Use workflowService to fetch specific workflow details
        const result = await workflowService.fetchWorkflow(id);
        
        if (result.success && result.workflow) {
            // Adapt the workflow object structure if needed
            activeAgent.value = result.workflow
            
            // If the workflow object doesn't have a name property at the top level (it might be inside data), use the one from the agents list
            if (!activeAgent.value.name) {
                const agentInfo = agents.value.find(a => a.id === id);
                if (agentInfo) {
                    activeAgent.value.name = agentInfo.name;
                }
            }
            
            messages.value = [
                {
                    role: 'system',
                    content: `已切换至助手: ${activeAgent.value.name || '未命名助手'}。准备就绪。`,
                    timestamp: Date.now()
                }
            ]
        } else {
            console.error('Failed to fetch workflow details:', result.error)
            messages.value.push({
                role: 'system',
                content: `错误: 无法加载助手详情 (${result.error || '未知错误'})`,
                timestamp: Date.now()
            })
        }
    } catch (e) {
        console.error('Error selecting agent:', e)
        messages.value.push({
            role: 'system',
            content: '加载助手失败，请重试。',
            timestamp: Date.now()
        })
    }
}

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
  const chunkSize = TYPING_CHUNK_SIZE; // chars per tick
  for (let i = 0; i < fullText.length; i += chunkSize) {
    if (messages.value[msgIndex]) {
      messages.value[msgIndex].content += fullText.slice(i, i + chunkSize);
      await new Promise((r) => setTimeout(r, TYPING_DELAY));
      await scrollToBottom();
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
    if (!activeAgentId.value) {
        throw new Error('请先选择一个助手（工作流）。');
    }

    // Determine input variable
    let inputVar = 'userInput';
    if (activeAgent.value && activeAgent.value.graphData && activeAgent.value.graphData.nodes) {
        const startNode = activeAgent.value.graphData.nodes.find((n: any) => n.type === 'start');
        if (startNode && startNode.data && startNode.data.inputs && startNode.data.inputs.length > 0) {
            inputVar = startNode.data.inputs[0].name;
        }
    }
    
    // Construct payload with fallback aliases to ensure compatibility
    const payload: Record<string, any> = { [inputVar]: userMsg };
    if (inputVar !== 'userInput') payload['userInput'] = userMsg;
    if (inputVar !== 'input') payload['input'] = userMsg;

    // Use workflowService.executeWorkflow instead of direct post
    // This ensures consistent error handling and auth headers
    const result = await workflowService.executeWorkflow(activeAgentId.value, payload);

    if (result) {
      // Extract text output from workflow result
      // result is nodeOutputs: { 'node-id': { output_1: 'text', response: 'text', ... }, ... }
      let outputText = '';

      // Try to find the last executed node's output
      const nodeIds = Object.keys(result);
      if (nodeIds.length > 0) {
        // Get the last node's output
        const lastNodeId = nodeIds[nodeIds.length - 1];
        const lastNodeOutput = result[lastNodeId];

        // Extract text from common output fields
        if (lastNodeOutput) {
          outputText = lastNodeOutput.result ||          // Standard result field
                       lastNodeOutput.output_1 ||         // LLM node output_1
                       lastNodeOutput.response ||         // LLM node response
                       lastNodeOutput.text ||            // Generic text field
                       lastNodeOutput.output ||          // Generic output field
                       JSON.stringify(lastNodeOutput);   // Fallback
        }
      }

      // If still no text, stringify the entire result
      if (!outputText) {
        outputText = JSON.stringify(result);
      }

      loading.value = false;
      await typeMessage(outputText);
    }

  } catch (e: any) {
    console.error(e)
    loading.value = false
    messages.value.push({
        role: 'system',
        content: `错误: ${e.message || '与 Agent 服务通信时出错。'}`,
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
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-bold text-khaki uppercase tracking-[0.2em]">活跃助手 (工作流)</h2>
            <button
              @click="toggleManageMode"
              class="text-[10px] px-2 py-1 rounded-md transition-colors"
              :class="isManageMode ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-sand/20 dark:bg-white/10 text-khaki hover:text-primary'"
            >
              {{ isManageMode ? '退出管理' : '管理' }}
            </button>
          </div>
        </div>

        <!-- 批量操作工具栏 -->
        <div v-if="isManageMode" class="px-3 py-2 bg-red-50/50 dark:bg-red-900/10 border-b border-red-200/50 dark:border-red-800/30">
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-red-600 dark:text-red-400">
              已选 {{ selectedAgentIds.size }} 个
            </span>
            <div class="flex items-center gap-1">
              <button
                v-if="selectedAgentIds.size > 0"
                @click="deleteSelectedAgents"
                :disabled="isDeleting"
                class="flex items-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-[10px] rounded-md transition-colors"
              >
                <Trash2 :size="12" />
                {{ isDeleting ? '删除中...' : '删除' }}
              </button>
              <button
                v-if="selectedAgentIds.size > 0"
                @click="selectedAgentIds.clear()"
                class="px-2 py-1 bg-sand/20 dark:bg-white/10 hover:bg-sand/30 dark:hover:bg-white/20 text-[10px] rounded-md transition-colors"
              >
                清空
              </button>
            </div>
          </div>
        </div>

        <div class="p-3 space-y-2 overflow-y-auto">
          <!-- Dynamic Agent List -->
          <div
            v-for="agent in agents"
            :key="agent.id"
            @click="isManageMode ? toggleAgentSelection(agent.id) : selectAgent(agent.id)"
            class="flex items-center gap-3 p-3 rounded-xl border shadow-sm cursor-pointer group transition-all hover:shadow-md"
            :class="activeAgentId === agent.id && !isManageMode
                ? 'bg-white dark:bg-white/10 border-sand/30 dark:border-white/10'
                : 'hover:bg-sand/20 dark:hover:bg-white/5 border-transparent opacity-70 hover:opacity-100'"
          >
            <!-- 多选框 (管理模式) -->
            <div v-if="isManageMode" class="shrink-0">
              <div
                class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                :class="selectedAgentIds.has(agent.id)
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'border-sand/40 dark:border-white/20 hover:border-red-400'"
                @click.stop="toggleAgentSelection(agent.id)"
              >
                <CheckSquare v-if="selectedAgentIds.has(agent.id)" :size="14" />
                <Square v-else :size="14" class="text-sand/40" />
              </div>
            </div>

            <div class="relative">
              <div class="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Bot :size="20" />
              </div>
              <span v-if="activeAgentId === agent.id && !isManageMode" class="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-primary border-2 border-white dark:border-[#2a241e]"></span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-bold text-charcoal dark:text-white truncate">{{ agent.name }}</div>
              <div class="text-xs text-khaki truncate">{{ agent.description }}</div>
            </div>
          </div>

          <div v-if="agents.length === 0" class="p-4 text-center flex flex-col items-center gap-2">
              <span class="text-xs text-khaki">暂无已部署的工作流</span>
              <button
                @click="loadAgents"
                class="text-[10px] text-primary hover:text-primary/80 underline cursor-pointer"
              >
                刷新列表
              </button>
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