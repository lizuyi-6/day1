<script setup lang="ts">
import { ref } from 'vue'
import { Save, Play, ChevronDown, Code, Bug, Rocket } from 'lucide-vue-next'

defineProps<{
  saveStatus: string
  lastSaved: string | null
}>()

defineEmits<{
  (e: 'save'): void
  (e: 'deploy'): void
  (e: 'debug'): void
  (e: 'publish'): void
}>()

const showDeployMenu = ref(false)
const debugMode = ref(false)
</script>

<template>
  <header class="flex h-14 w-full shrink-0 items-center justify-between border-b border-indigo-100 bg-white px-4 z-50 shadow-sm relative">
      <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-md shadow-indigo-200">
              <span class="text-xs font-bold text-white">AI</span>
          </div>
          <div class="flex flex-col">
              <div class="flex items-center gap-2">
                  <h1 class="text-sm font-bold text-slate-800 tracking-tight">专业工作流引擎</h1>
                  <span class="px-1.5 py-0.5 rounded-full bg-indigo-50 text-[9px] font-bold text-indigo-600 border border-indigo-100">v3.0.0</span>
              </div>
              <p class="text-[10px] text-slate-400 font-medium">项目：自动化协议 Alpha</p>
          </div>
      </div>

      <div class="flex flex-1 justify-center">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 shadow-inner">
              <div class="h-1.5 w-1.5 rounded-full transition-colors duration-300"
                   :class="saveStatus === 'saved' ? 'bg-emerald-500' : saveStatus === 'saving' ? 'bg-amber-500' : 'bg-slate-300'"></div>
              <span class="text-[10px] font-medium text-slate-500 w-16 text-center">
                  {{ saveStatus === 'saved' ? '已保存' : saveStatus === 'saving' ? '保存中...' : '未保存' }}
              </span>
              <span v-if="lastSaved" class="text-[9px] text-slate-300 border-l border-slate-200 pl-2">
                  {{ lastSaved }}
              </span>
          </div>
      </div>

      <div class="flex items-center gap-2">
          <!-- Debug Toggle -->
          <button
            @click="debugMode = !debugMode; $emit('debug')"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-colors text-xs font-medium border border-transparent hover:border-amber-200"
            :class="debugMode ? 'bg-amber-50 text-amber-600 border-amber-200' : ''"
            title="调试模式"
          >
              <Bug :size="14" />
              <span>{{ debugMode ? '调试中' : '调试' }}</span>
          </button>

          <button @click="$emit('save')"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-xs font-medium border border-transparent hover:border-indigo-100">
              <Save :size="14" />
              <span>保存</span>
          </button>

          <div class="h-4 w-px bg-slate-200 mx-1"></div>

          <!-- Publish API Button -->
          <button
            @click="$emit('publish')"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-xs font-medium border border-transparent hover:border-indigo-100"
            title="发布为 API"
          >
              <Code :size="14" />
              <span>发布 API</span>
          </button>

          <!-- Deploy Dropdown -->
          <div class="relative">
              <button
                @click="showDeployMenu = !showDeployMenu"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-300 transition-all text-xs font-bold active:scale-95"
              >
                  <Rocket :size="14" />
                  <span>部署工作流</span>
                  <ChevronDown :size="12" class="opacity-70 ml-0.5" />
              </button>

              <!-- Deploy Menu -->
              <div
                v-if="showDeployMenu"
                class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-light py-1 z-50"
              >
                  <button
                    @click="$emit('deploy'); showDeployMenu = false"
                    class="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                      <Play :size="14" class="text-emerald-600" />
                      部署到生产
                  </button>
                  <button
                    @click="$emit('deploy'); showDeployMenu = false"
                    class="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                      <Play :size="14" class="text-blue-600" />
                      部署到测试
                  </button>
                  <div class="border-t border-slate-100 my-1"></div>
                  <button
                    @click="$emit('publish'); showDeployMenu = false"
                    class="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                      <Code :size="14" class="text-purple-600" />
                      发布为 API
                  </button>
              </div>
          </div>
      </div>
  </header>
</template>
