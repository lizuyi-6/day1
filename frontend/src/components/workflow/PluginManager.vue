<script setup lang="ts">
import { ref } from 'vue'
import { Puzzle, Zap, Globe, Database, Clock, Shield, Sparkles, Plus, Toggle } from 'lucide-vue-next'

interface Plugin {
  id: string
  name: string
  description: string
  icon: any
  category: 'productivity' | 'integration' | 'data' | 'utility' | 'security'
  enabled: boolean
  config?: Record<string, unknown>
}

const plugins = ref<Plugin[]>([
  {
    id: '1',
    name: '网页抓取',
    description: '从任何网站抓取内容，自动提取文本和结构化数据',
    icon: Globe,
    category: 'integration',
    enabled: true
  },
  {
    id: '2',
    name: '数据库连接',
    description: '连接 MySQL、PostgreSQL、MongoDB 等数据库',
    icon: Database,
    category: 'data',
    enabled: true
  },
  {
    id: '3',
    name: '定时任务',
    description: '设置 Cron 表达式，定时触发工作流',
    icon: Clock,
    category: 'utility',
    enabled: false
  },
  {
    id: '4',
    name: '内容安全',
    description: '自动检测和过滤敏感内容',
    icon: Shield,
    category: 'security',
    enabled: true
  },
  {
    id: '5',
    name: '智能摘要',
    description: '自动生成长文本摘要和关键点提取',
    icon: Sparkles,
    category: 'productivity',
    enabled: true
  },
  {
    id: '6',
    name: '快速执行',
    description: '缓存常用查询结果，提升响应速度',
    icon: Zap,
    category: 'utility',
    enabled: false
  }
])

const categoryNames = {
  productivity: '生产力',
  integration: '集成',
  data: '数据',
  utility: '工具',
  security: '安全'
}

const categoryColors = {
  productivity: 'bg-purple-50 text-purple-600 border-purple-100',
  integration: 'bg-blue-50 text-blue-600 border-blue-100',
  data: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  utility: 'bg-orange-50 text-orange-600 border-orange-100',
  security: 'bg-red-50 text-red-600 border-red-100'
}

const togglePlugin = (id: string) => {
  const plugin = plugins.value.find(p => p.id === id)
  if (plugin) {
    plugin.enabled = !plugin.enabled
  }
}

const configurePlugin = (plugin: Plugin) => {
  // TODO: 打开配置弹窗
  console.log('配置插件:', plugin.name)
}
</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-light flex items-center justify-between">
      <div>
        <h2 class="text-sm font-bold text-slate-900">插件市场</h2>
        <p class="text-[10px] text-slate-500 mt-0.5">扩展工作流功能的插件</p>
      </div>
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
      >
        <Plus :size="14" />
        安装插件
      </button>
    </div>

    <!-- Plugin List -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="plugin in plugins"
          :key="plugin.id"
          class="group bg-white border rounded-lg p-4 hover:shadow-md transition-all"
          :class="plugin.enabled ? 'border-indigo-200 bg-indigo-50/30' : 'border-light'"
        >
          <div class="flex items-start gap-3">
            <!-- Icon -->
            <div
              class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
              :class="plugin.enabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'"
            >
              <component :is="plugin.icon" :size="20" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-sm font-bold text-slate-900">{{ plugin.name }}</h3>
                <button
                  @click="togglePlugin(plugin.id)"
                  class="shrink-0 relative w-10 h-5 rounded-full transition-colors"
                  :class="plugin.enabled ? 'bg-indigo-600' : 'bg-slate-200'"
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                    :class="plugin.enabled ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
              <p class="text-[11px] text-slate-500 mb-2 leading-relaxed">{{ plugin.description }}</p>
              <div class="flex items-center gap-2">
                <span
                  class="px-2 py-0.5 rounded-full text-[9px] font-medium border"
                  :class="categoryColors[plugin.category]"
                >
                  {{ categoryNames[plugin.category] }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="plugin.enabled" class="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            <button
              @click="configurePlugin(plugin)"
              class="flex-1 text-[10px] text-indigo-600 hover:text-indigo-700 font-medium py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
            >
              配置
            </button>
            <button
              @click="togglePlugin(plugin.id)"
              class="flex-1 text-[10px] text-slate-600 hover:text-red-600 font-medium py-1.5 hover:bg-red-50 rounded transition-colors"
            >
              禁用
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Plugin Categories Legend -->
    <div class="px-6 py-3 border-t border-light bg-slate-50">
      <div class="flex items-center gap-4 text-[9px] text-slate-500">
        <span class="font-semibold">分类：</span>
        <span v-for="(name, key) in categoryNames" :key="key" class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full" :class="categoryColors[key as keyof typeof categoryColors].split(' ')[0]" />
          {{ name }}
        </span>
      </div>
    </div>
  </div>
</template>
