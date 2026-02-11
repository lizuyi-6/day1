<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Puzzle, Zap, Globe, Database, Clock, Shield, Sparkles, Plus } from 'lucide-vue-next'
import PluginConfigDialog, { type PluginConfigField } from './PluginConfigDialog.vue'
import { pluginService, type Plugin } from '@/services/pluginService'

interface PluginWithIcon extends Plugin {
  icon: any
}

const plugins = ref<PluginWithIcon[]>([])
const showInstallDialog = ref(false)
const availablePlugins = ref<any[]>([])
const selectedPlugin = ref<Plugin | null>(null)
const isLoading = ref(false)

const iconMap = {
  '1': Globe,
  '2': Database,
  '3': Clock,
  '4': Shield,
  '5': Sparkles,
  '6': Zap,
}

const loadPlugins = async () => {
  isLoading.value = true
  try {
    const loaded = await pluginService.getAll()
    plugins.value = loaded.map(p => ({
      ...p,
      icon: iconMap[p.id as keyof typeof iconMap] || Puzzle,
    }))
  } catch (error) {
    console.error('Failed to load plugins:', error)
  } finally {
    isLoading.value = false
  }
}

const loadAvailablePlugins = async () => {
  try {
    availablePlugins.value = await pluginService.getAvailable()
  } catch (error) {
    console.error('Failed to load available plugins:', error)
  }
}

onMounted(() => {
  loadPlugins()
  loadAvailablePlugins()
})

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
  selectedPlugin.value = plugin
}

const handleSaveConfig = async (pluginId: string, config: Record<string, unknown>) => {
  try {
    const plugin = plugins.value.find(p => p.id === pluginId)
    if (plugin) {
      await pluginService.update(pluginId, { config })
      plugin.config = config
    }
  } catch (error) {
    console.error('Failed to save plugin config:', error)
    alert('保存配置失败')
  }
  selectedPlugin.value = null
}

const handleInstallPlugin = async (pluginData: any) => {
  if (!confirm(`确定要安装插件 "${pluginData.name}" 吗？`)) return

  try {
    const installed = await pluginService.create({
      name: pluginData.name,
      description: pluginData.description,
      category: pluginData.category,
      packageName: pluginData.packageName,
      version: pluginData.version,
    })

    plugins.value.push({
      ...installed,
      icon: iconMap[installed.id as keyof typeof iconMap] || Puzzle,
    })

    showInstallDialog.value = false
    alert('插件安装成功！')
  } catch (error: any) {
    console.error('Failed to install plugin:', error)
    alert(error.response?.data?.message || '安装插件失败')
  }
}

const handleTogglePlugin = async (id: string) => {
  const plugin = plugins.value.find(p => p.id === id)
  if (!plugin) return

  try {
    const updated = await pluginService.update(id, { enabled: !plugin.enabled })
    plugin.enabled = updated.enabled
  } catch (error) {
    console.error('Failed to toggle plugin:', error)
    alert('切换插件状态失败')
  }
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
        @click="showInstallDialog = true"
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
                  @click="handleTogglePlugin(plugin.id)"
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
              @click="handleTogglePlugin(plugin.id)"
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
    
    <PluginConfigDialog
      :plugin="selectedPlugin"
      @close="selectedPlugin = null"
      @save="handleSaveConfig"
    />
    
    <div
      v-if="showInstallDialog"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showInstallDialog = false"
    >
      <div class="bg-white rounded-lg shadow-xl w-[480px] max-h-[80vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-light">
          <h3 class="text-sm font-bold text-slate-900">选择要安装的插件</h3>
        </div>
        <div class="p-6 space-y-3">
          <div
            v-for="plugin in availablePlugins"
            :key="plugin.id"
            class="p-4 border border-light rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-colors"
            @click="handleInstallPlugin(plugin)"
          >
            <div class="flex items-start gap-3">
              <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-slate-100">
                <Puzzle :size="20" />
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="text-sm font-bold text-slate-900">{{ plugin.name }}</h4>
                  <span
                    class="px-2 py-0.5 rounded text-[9px] font-medium border"
                    :class="categoryColors[plugin.category]"
                  >
                    {{ categoryNames[plugin.category] }}
                  </span>
                </div>
                <p class="text-[10px] text-slate-500">{{ plugin.description }}</p>
                <p class="text-[9px] text-slate-400 mt-1">版本: {{ plugin.version }}</p>
              </div>
            </div>
          </div>
          
          <div v-if="availablePlugins.length === 0" class="text-center py-8 text-slate-400 text-xs">
            暂无可安装的插件
          </div>
        </div>
        <div class="px-6 py-4 border-t border-light bg-slate-50 flex justify-end">
          <button
            @click="showInstallDialog = false"
            class="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
