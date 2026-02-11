<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import DevModePanel from './components/dev/DevModePanel.vue'
import ErrorBoundary from './components/common/ErrorBoundary.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import { useTheme } from './composables/useTheme'

const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div class="min-h-screen bg-background-light font-ui text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
    <ErrorBoundary>
      <RouterView v-slot="{ Component }">
      <keep-alive :max="10">
        <component :is="Component" />
      </keep-alive>
    </RouterView>
    </ErrorBoundary>

    <!-- Global Theme Switcher (Bottom Left) -->
    <div class="fixed bottom-6 left-6 z-[100] bg-white shadow-xl rounded-full border border-sand/30 p-1.5 transition-transform hover:scale-110">
      <ThemeSwitcher />
    </div>

    <!-- 开发模式面板 -->
    <DevModePanel />
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(5px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
