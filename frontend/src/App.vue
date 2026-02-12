<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { onMounted, ref, computed, watch } from 'vue'
import DevModePanel from './components/dev/DevModePanel.vue'
import ErrorBoundary from './components/common/ErrorBoundary.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import { useTheme } from './composables/useTheme'

const { initTheme } = useTheme()
const route = useRoute()
const isTransitioning = ref(false)
const previousRoute = ref('')

// 根据当前路由和导航方向计算动画类型
const transitionName = computed(() => {
  const currentTransition = route.meta?.transition as string || 'fade-slide'
  
  // 如果有上一个路由，可以根据方向调整动画
  if (previousRoute.value) {
    // 这里可以添加基于导航方向的逻辑
    // 比如返回操作使用反向动画
  }
  
  return currentTransition
})

// 监听路由变化记录前一个路由
watch(() => route.path, (newPath, oldPath) => {
  if (oldPath) {
    previousRoute.value = oldPath
  }
})

// 页面进入前
const onBeforeEnter = () => {
  isTransitioning.value = true
}

// 页面进入后
const onAfterEnter = () => {
  isTransitioning.value = false
}

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div class="min-h-screen bg-background-light font-ui text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
    <ErrorBoundary>
      <RouterView v-slot="{ Component, route }">
        <transition
          :name="transitionName"
          mode="out-in"
          :duration="{ enter: 400, leave: 300 }"
          @before-enter="onBeforeEnter"
          @after-enter="onAfterEnter"
        >
          <keep-alive :max="10">
            <component 
              :is="Component" 
              :key="route.path"
              class="page-component"
            />
          </keep-alive>
        </transition>
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
/* ========== 基础缓动函数 ========== */
:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1);
}

/* ========== 1. fade-slide (默认淡入滑动) ========== */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.35s var(--ease-out-quart);
  will-change: opacity, transform;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.98);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.99);
}

/* ========== 2. zoom-fade (缩放淡入 - landing/workshop) ========== */
.zoom-fade-enter-active {
  transition: all 0.5s var(--ease-out-expo);
  will-change: opacity, transform;
}

.zoom-fade-leave-active {
  transition: all 0.35s var(--ease-in-out-cubic);
  will-change: opacity, transform;
}

.zoom-fade-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(30px);
  filter: blur(4px);
}

.zoom-fade-enter-to {
  opacity: 1;
  transform: scale(1) translateY(0);
  filter: blur(0);
}

.zoom-fade-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* ========== 3. slide-left (从右滑入 - dashboard/about) ========== */
.slide-left-enter-active {
  transition: all 0.4s var(--ease-out-expo);
  will-change: opacity, transform;
}

.slide-left-leave-active {
  transition: all 0.3s var(--ease-out-quart);
  will-change: opacity, transform;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(60px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

/* ========== 4. slide-right (从左滑入 - workflows) ========== */
.slide-right-enter-active {
  transition: all 0.4s var(--ease-out-expo);
  will-change: opacity, transform;
}

.slide-right-leave-active {
  transition: all 0.3s var(--ease-out-quart);
  will-change: opacity, transform;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-60px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

/* ========== 5. slide-up (从底部滑入 - workflow/about) ========== */
.slide-up-enter-active {
  transition: all 0.45s var(--ease-out-back);
  will-change: opacity, transform;
}

.slide-up-leave-active {
  transition: all 0.35s var(--ease-out-quart);
  will-change: opacity, transform;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(80px) scale(0.95);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* ========== 6. flip (3D翻转 - chat) ========== */
.flip-enter-active {
  transition: all 0.5s var(--ease-out-back);
  will-change: opacity, transform;
  perspective: 1000px;
}

.flip-leave-active {
  transition: all 0.35s var(--ease-in-out-cubic);
  will-change: opacity, transform;
  perspective: 1000px;
}

.flip-enter-from {
  opacity: 0;
  transform: rotateY(-25deg) translateX(-50px);
}

.flip-leave-to {
  opacity: 0;
  transform: rotateY(15deg) translateX(30px);
}

/* ========== 7. fade-blur (模糊淡入 - knowledge) ========== */
.fade-blur-enter-active {
  transition: all 0.45s var(--ease-out-quart);
  will-change: opacity, filter, transform;
}

.fade-blur-leave-active {
  transition: all 0.35s var(--ease-out-quart);
  will-change: opacity, filter, transform;
}

.fade-blur-enter-from {
  opacity: 0;
  filter: blur(8px);
  transform: scale(1.02);
}

.fade-blur-leave-to {
  opacity: 0;
  filter: blur(4px);
  transform: scale(0.98);
}

/* ========== 8. zoom-in (缩放进入 - workflow) ========== */
.zoom-in-enter-active {
  transition: all 0.4s var(--ease-out-expo);
  will-change: opacity, transform, filter;
}

.zoom-in-leave-active {
  transition: all 0.3s var(--ease-in-out-cubic);
  will-change: opacity, transform, filter;
}

.zoom-in-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(20px);
  filter: blur(2px);
}

.zoom-in-enter-to {
  opacity: 1;
  transform: scale(1) translateY(0);
  filter: blur(0);
}

.zoom-in-leave-to {
  opacity: 0;
  transform: scale(1.05);
  filter: blur(1px);
}

/* ========== 页面组件基础样式 ========== */

.page-component {
  min-height: 100%;
}

/* ========== 性能优化 ========== */

/* 减少动画对性能的影响 */
@media (prefers-reduced-motion: reduce) {
  .page-component {
    transition: none !important;
    animation: none !important;
  }
}
</style>