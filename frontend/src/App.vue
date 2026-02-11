<script setup lang="ts">
import { RouterView } from 'vue-router'
import DevModePanel from './components/dev/DevModePanel.vue'
import ErrorBoundary from './components/common/ErrorBoundary.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-ui text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
    <ErrorBoundary>
      <RouterView v-slot="{ Component }">
      <keep-alive :max="10">
        <component :is="Component" />
      </keep-alive>
    </RouterView>
    </ErrorBoundary>

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
