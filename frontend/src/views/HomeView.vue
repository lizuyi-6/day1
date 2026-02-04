<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Database, GitBranch, MessageSquare, ArrowRight, Activity } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="flex h-[calc(100vh-64px)] overflow-hidden bg-app">

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-8">

      <div class="max-w-6xl mx-auto">

        <!-- Hero Section -->
        <div class="mb-12 text-center">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-light shadow-sm mb-6">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span class="text-[10px] font-bold text-slate-600 tracking-wider uppercase">系统运行正常</span>
          </div>
          <h1 class="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
            AI 工程平台
          </h1>
          <p class="text-sm text-slate-500 max-w-2xl mx-auto">
            构建部署和管理智能 Agent 工作流，提供企业级可靠性和控制能力。
          </p>
        </div>

        <!-- Modules Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

          <!-- Knowledge Base Card -->
          <div
            @click="router.push('/knowledge')"
            class="group bg-white rounded-md border border-light shadow-sm hover:shadow-md hover:border-emerald-200 cursor-pointer overflow-hidden transition-all"
          >
            <div class="p-6">
              <div class="h-10 w-10 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                <Database :size="20" />
              </div>
              <h2 class="text-base font-bold text-slate-900 mb-2">知识库</h2>
              <p class="text-slate-500 text-xs leading-relaxed mb-4">
                管理向量嵌入和 RAG 数据集。导入文档为您的智能 Agent 提供动力。
              </p>
              <div class="flex items-center text-xs font-medium text-slate-400 group-hover:text-emerald-600 transition-colors">
                进入模块 <ArrowRight :size="14" class="ml-1.5" />
              </div>
            </div>
          </div>

          <!-- Workflow Engine Card -->
          <div
            @click="router.push('/workflow')"
            class="group bg-white rounded-md border border-light shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer overflow-hidden transition-all"
          >
            <div class="p-6">
              <div class="h-10 w-10 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <GitBranch :size="20" />
              </div>
              <h2 class="text-base font-bold text-slate-900 mb-2">工作流引擎</h2>
              <p class="text-slate-500 text-xs leading-relaxed mb-4">
                复杂 AI 链的可视化编排。拖放式编辑器，支持高级逻辑控制。
              </p>
              <div class="flex items-center text-xs font-medium text-slate-400 group-hover:text-indigo-600 transition-colors">
                启动编辑器 <ArrowRight :size="14" class="ml-1.5" />
              </div>
            </div>
          </div>

          <!-- Agent Chat Card -->
          <div
            @click="router.push('/chat')"
            class="group bg-white rounded-md border border-light shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer overflow-hidden transition-all"
          >
            <div class="p-6">
              <div class="h-10 w-10 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <MessageSquare :size="20" />
              </div>
              <h2 class="text-base font-bold text-slate-900 mb-2">Agent 对话</h2>
              <p class="text-slate-500 text-xs leading-relaxed mb-4">
                直接与您部署的 Agent 交互。测试能力和对话流程。
              </p>
              <div class="flex items-center text-xs font-medium text-slate-400 group-hover:text-blue-600 transition-colors">
                开始会话 <ArrowRight :size="14" class="ml-1.5" />
              </div>
            </div>
          </div>

        </div>

      </div>

    </main>

  </div>
</template>
