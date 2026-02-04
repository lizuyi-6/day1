<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import Logo from './Logo.vue'
import { NAV_LINKS } from '@/config/navigation'
import { useScroll } from '@/composables/useScroll'

const isMenuOpen = ref(false)
const { scrollToSection, scrollToTop } = useScroll()

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <header class="w-full border-b border-sand/50 dark:border-khaki/20 px-8 py-8 lg:px-24 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm sticky top-0">
    <div class="mx-auto max-w-[1400px] flex items-center justify-between">
      <!-- Logo -->
      <Logo @click="scrollToTop" />

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center gap-12">
        <a
          v-for="link in NAV_LINKS"
          :key="link.sectionId"
          class="text-sm font-medium hover:text-primary transition-colors duration-300"
          :href="link.href"
          @click.prevent="scrollToSection(link.sectionId)"
        >
          {{ link.label }}
        </a>
      </nav>

      <!-- CTA Button & Mobile Menu Toggle -->
      <div class="flex items-center gap-4">
        <RouterLink
          to="/dashboard"
          class="hidden md:flex cursor-pointer items-center justify-center rounded-full h-10 px-6 bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <span>开始探索</span>
        </RouterLink>

        <!-- Mobile Menu Button -->
        <button class="md:hidden text-charcoal dark:text-white" @click="toggleMenu">
          <span class="material-symbols-outlined">{{ isMenuOpen ? 'close' : 'menu' }}</span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <div
      v-show="isMenuOpen"
      class="fixed inset-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md z-40 flex flex-col items-center justify-center gap-8 md:hidden transition-all duration-300"
    >
      <a
        v-for="link in NAV_LINKS"
        :key="link.sectionId"
        class="text-2xl font-serif font-medium text-charcoal dark:text-white"
        :href="link.href"
        @click.prevent="scrollToSection(link.sectionId, closeMenu)"
      >
        {{ link.label }}
      </a>
      <RouterLink
        to="/dashboard"
        class="cursor-pointer items-center justify-center rounded-full h-12 px-8 bg-primary text-white text-lg font-bold shadow-lg"
        @click="closeMenu"
      >
        开始探索
      </RouterLink>
    </div>
  </header>
</template>
