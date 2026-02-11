<template>
  <div class="relative">
    <!-- Overlay to close menu when clicking outside -->
    <div v-if="isOpen" class="fixed inset-0 z-40" @click="isOpen = false"></div>

    <button 
      @click="isOpen = !isOpen"
      class="relative z-50 flex items-center justify-center p-2 rounded-full text-charcoal bg-sand/20 hover:bg-primary hover:text-white transition-all shadow-sm"
      :class="{ 'bg-primary text-white': isOpen }"
      title="Switch Theme"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 1 0 10 10"/></svg>
    </button>
    
    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0 translate-y-2"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 translate-y-2"
    >
      <div v-if="isOpen" class="absolute left-0 bottom-full mb-4 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-sand/20 overflow-hidden origin-bottom-left z-50">
        <div class="p-1 space-y-1">
          <button
            v-for="theme in availableThemes"
            :key="theme.id"
            @click="handleThemeSelect($event, theme.id)"
            class="w-full relative h-10 rounded-lg overflow-hidden flex items-center text-sm font-bold shadow-sm ring-1 ring-black/5 hover:ring-primary/50 transition-all group"
          >
            <!-- Dual Color Background -->
            <div class="absolute inset-0 flex">
              <div class="w-[20%] h-full" :style="{ backgroundColor: theme.colors['--color-primary'] }"></div>
              <div class="w-[80%] h-full" :style="{ backgroundColor: theme.colors['--bg-app'] }"></div>
            </div>
            
            <!-- Text Content -->
            <span 
              class="relative z-10 ml-[20%] pl-3"
              :style="{ color: theme.colors['--text-main'] }"
            >
              {{ theme.name }}
            </span>

            <!-- Active Indicator -->
             <div v-if="currentThemeId === theme.id" class="absolute right-3 z-10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '../composables/useTheme'

const { availableThemes, currentThemeId, applyTheme } = useTheme()
const isOpen = ref(false)

const handleThemeSelect = async (event: MouseEvent, themeId: string) => {
  if (themeId === currentThemeId.value) {
    isOpen.value = false
    return
  }

  // Check if View Transitions API is supported
  if (!document.startViewTransition) {
    applyTheme(themeId)
    isOpen.value = false
    return
  }

  // Get click coordinates for the circular reveal
  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y)
  )

  // Start the View Transition
  const transition = document.startViewTransition(() => {
    applyTheme(themeId)
    isOpen.value = false
  })

  // Wait for the pseudo-elements to be created
  await transition.ready

  // Animate the circle clip path
  document.documentElement.animate(
    {
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ]
    },
    {
      duration: 500,
      easing: 'ease-in',
      // Specify which pseudo-element to animate
      pseudoElement: '::view-transition-new(root)'
    }
  )
}
</script>

<style>
/* Enable View Transitions */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

/* Ensure the new view is on top during the animation */
::view-transition-new(root) {
  z-index: 9999;
}
</style>