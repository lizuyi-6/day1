<script setup lang="ts">
import { ref } from 'vue'
import { Info, Github, Book, Users, Zap } from 'lucide-vue-next'

const version = ref('1.0.0')
const buildNumber = ref('2024.02.03')
</script>

<template>
  <div class="flex h-[calc(100vh-64px)] overflow-hidden bg-app">

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-8">

      <div class="max-w-3xl mx-auto">

        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div class="h-10 w-10 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Info :size="20" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-900 tracking-tight">关于 Aether Flow</h1>
              <p class="text-slate-500 text-xs mt-0.5">AI 工程平台</p>
            </div>
          </div>
        </div>

        <!-- Info Cards -->
        <div class="space-y-4">

          <!-- Version Card -->
          <div class="bg-white border border-light rounded-md shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-bold text-slate-900">系统信息</h2>
              <div class="h-2 w-2 rounded-full bg-emerald-500"></div>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between py-2 border-b border-slate-100">
                <span class="text-xs text-slate-500">版本</span>
                <span class="text-xs font-mono font-semibold text-slate-900">{{ version }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-slate-100">
                <span class="text-xs text-slate-500">构建</span>
                <span class="text-xs font-mono font-semibold text-slate-900">{{ buildNumber }}</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-xs text-slate-500">状态</span>
                <span class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">运行中</span>
              </div>
            </div>
          </div>

          <!-- Features Card -->
          <div class="bg-white border border-light rounded-md shadow-sm p-6">
            <h2 class="text-sm font-bold text-slate-900 mb-4">核心功能</h2>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="h-8 w-8 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Zap :size="16" />
                </div>
                <div>
                  <h3 class="text-xs font-bold text-slate-900 mb-1">可视化工作流编辑器</h3>
                  <p class="text-[11px] text-slate-500 leading-relaxed">
                    拖放式界面，用于构建复杂的 AI Agent 链，支持 LLM 节点、条件判断和数据转换。
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="h-8 w-8 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Book :size="16" />
                </div>
                <div>
                  <h3 class="text-xs font-bold text-slate-900 mb-1">向量知识库</h3>
                  <p class="text-[11px] text-slate-500 leading-relaxed">
                    基于 RAG 的知识管理，支持自动文档索引和语义搜索功能。
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="h-8 w-8 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Users :size="16" />
                </div>
                <div>
                  <h3 class="text-xs font-bold text-slate-900 mb-1">Agent 对话界面</h3>
                  <p class="text-[11px] text-slate-500 leading-relaxed">
                    与已部署的 Agent 实时交互，用于测试、调试和生产环境对话。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Links Card -->
          <div class="bg-white border border-light rounded-md shadow-sm p-6">
            <h2 class="text-sm font-bold text-slate-900 mb-4">资源</h2>
            <div class="space-y-2">
              <a href="#" class="flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 border border-transparent hover:border-light transition-all group">
                <Github :size="16" class="text-slate-400 group-hover:text-slate-600" />
                <span class="text-xs text-slate-700 group-hover:text-slate-900">查看源代码</span>
              </a>
              <a href="#" class="flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 border border-transparent hover:border-light transition-all group">
                <Book :size="16" class="text-slate-400 group-hover:text-slate-600" />
                <span class="text-xs text-slate-700 group-hover:text-slate-900">文档</span>
              </a>
            </div>
          </div>

        </div>

      </div>

    </main>

  </div>
</template>
