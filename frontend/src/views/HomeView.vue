<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Database, GitBranch, MessageSquare, ArrowRight, Activity, LayoutGrid, Workflow, User } from 'lucide-vue-next'
import Logo from '@/components/layout/Logo.vue'
import { RouterLink } from 'vue-router'
import { useScrollAnimations } from '@/composables/useScrollAnimations'

const router = useRouter()
const route = useRoute()

// Initialize scroll animations
useScrollAnimations()

onMounted(() => {
  document.body.classList.add('page-loaded')
})

const navLinks = [
  { name: '仪表盘', path: '/dashboard', icon: LayoutGrid },
  { name: '工作流', path: '/workflows', icon: Workflow },
  { name: '对话', path: '/chat', icon: MessageSquare },
  { name: '知识库', path: '/knowledge', icon: Database },
]
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

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">

      <div class="max-w-6xl mx-auto">

        <!-- Hero Section -->
        <div class="mb-16 text-center">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-sand/30 dark:border-white/10 shadow-sm mb-8 backdrop-blur-sm">
            <span class="size-2 rounded-full bg-primary animate-pulse"></span>
            <span class="text-xs font-bold text-charcoal/80 dark:text-sand/80 tracking-widest uppercase">系统运行正常</span>
          </div>
          <h1 class="text-4xl lg:text-5xl font-serif font-medium text-charcoal dark:text-white mb-6 tracking-tight leading-tight">
            AI 工程平台
          </h1>
          <p class="text-lg text-khaki dark:text-sand/70 max-w-2xl mx-auto leading-relaxed font-normal">
            构建、部署和管理智能 Agent 工作流。<br class="hidden md:block"/>提供企业级可靠性和无与伦比的控制能力。
          </p>
        </div>

        <!-- Modules Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

          <!-- Knowledge Base Card -->
          <RouterLink
            to="/knowledge"
            class="group bg-white/60 dark:bg-[#2a241e]/60 backdrop-blur-md rounded-2xl border border-sand/30 dark:border-white/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 cursor-pointer overflow-hidden transition-all duration-300 relative"
          >
            <div class="absolute inset-0 bg-gradient-to-tr from-primary/0 to-primary/0 group-hover:to-primary/5 transition-all duration-500"></div>
            <div class="p-8 relative z-10">
              <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                <Database :size="24" />
              </div>
              <h2 class="text-xl font-serif font-bold text-charcoal dark:text-white mb-3 group-hover:text-primary transition-colors">知识库</h2>
              <p class="text-khaki dark:text-sand/60 text-sm leading-loose mb-6">
                管理向量嵌入和 RAG 数据集。导入文档为您的智能 Agent 提供动力。
              </p>
              <div class="flex items-center text-xs font-bold uppercase tracking-wider text-charcoal/40 dark:text-sand/40 group-hover:text-primary transition-colors">
                进入模块 <ArrowRight :size="14" class="ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </RouterLink>

          <!-- Workflow Engine Card -->
          <RouterLink
            to="/workflows"
            class="group bg-white/60 dark:bg-[#2a241e]/60 backdrop-blur-md rounded-2xl border border-sand/30 dark:border-white/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 cursor-pointer overflow-hidden transition-all duration-300 relative"
          >
             <div class="absolute inset-0 bg-gradient-to-tr from-primary/0 to-primary/0 group-hover:to-primary/5 transition-all duration-500"></div>
            <div class="p-8 relative z-10">
              <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                <Workflow :size="24" />
              </div>
              <h2 class="text-xl font-serif font-bold text-charcoal dark:text-white mb-3 group-hover:text-primary transition-colors">工作流引擎</h2>
              <p class="text-khaki dark:text-sand/60 text-sm leading-loose mb-6">
                复杂 AI 链的可视化编排。拖放式编辑器，支持高级逻辑控制。
              </p>
              <div class="flex items-center text-xs font-bold uppercase tracking-wider text-charcoal/40 dark:text-sand/40 group-hover:text-primary transition-colors">
                启动编辑器 <ArrowRight :size="14" class="ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </RouterLink>

          <!-- Agent Chat Card -->
          <RouterLink
            to="/chat"
            class="group bg-white/60 dark:bg-[#2a241e]/60 backdrop-blur-md rounded-2xl border border-sand/30 dark:border-white/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 cursor-pointer overflow-hidden transition-all duration-300 relative"
          >
             <div class="absolute inset-0 bg-gradient-to-tr from-primary/0 to-primary/0 group-hover:to-primary/5 transition-all duration-500"></div>
            <div class="p-8 relative z-10">
              <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare :size="24" />
              </div>
              <h2 class="text-xl font-serif font-bold text-charcoal dark:text-white mb-3 group-hover:text-primary transition-colors">Agent 对话</h2>
              <p class="text-khaki dark:text-sand/60 text-sm leading-loose mb-6">
                直接与您部署的 Agent 交互。测试能力和对话流程。
              </p>
              <div class="flex items-center text-xs font-bold uppercase tracking-wider text-charcoal/40 dark:text-sand/40 group-hover:text-primary transition-colors">
                开始会话 <ArrowRight :size="14" class="ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </RouterLink>

        </div>

      </div>

    </main>

  </div>
</template>