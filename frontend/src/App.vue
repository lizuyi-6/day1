<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const showHeader = computed(() => route.name !== 'workflow')
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-ui text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
    <header v-if="showHeader" class="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
      <div class="flex items-center gap-3">
        <div class="h-2.5 w-2.5 rounded-full bg-indigo-600"></div>
        <div class="text-lg font-bold tracking-tight text-slate-900 font-ui">以太流</div>
      </div>
      <div class="flex items-center gap-4">
        <div class="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-[10px] font-bold text-emerald-700 tracking-wider">系统在线</span>
        </div>
      </div>
    </header>

    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
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
