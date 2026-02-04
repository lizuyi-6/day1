<script setup lang="ts">
import Logo from './Logo.vue'
import { useScroll } from '@/composables/useScroll'

const { scrollToSection } = useScroll()

const footerLinks = {
  product: [
    { label: '功能', sectionId: 'features' },
    { label: '工作流', href: '#' },
    { label: '定价', href: '#' }
  ],
  company: [
    { label: '数据', sectionId: 'stats' },
    { label: '理念', sectionId: 'manifesto' },
    { label: '加入我们', href: '#' }
  ],
  resources: [
    { label: '动态', sectionId: 'footer' },
    { label: '文档', href: '#' },
    { label: '社区', href: '#' }
  ],
  social: [
    { label: '微博', href: '#' },
    { label: '微信', href: '#' },
    { label: '知乎', href: '#' }
  ]
}
</script>

<template>
  <footer class="bg-charcoal text-sand py-16 px-6 lg:px-20 border-t border-white/10">
    <div class="mx-auto max-w-[1400px]">
      <div class="flex flex-col md:flex-row justify-between items-start gap-12">
        <!-- Logo & Description -->
        <div class="flex flex-col gap-6 max-w-sm">
          <Logo />
          <p class="text-sand/60 font-light">
            让AI工作流如搭积木般简洁优雅。十万创作者的信赖，期待你的加入。
          </p>
        </div>

        <!-- Links Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-12 w-full md:w-auto">
          <div v-for="(links, category) in footerLinks" :key="category" class="flex flex-col gap-4">
            <h4 class="text-white font-bold text-sm uppercase tracking-wider">{{ category }}</h4>
            <a
              v-for="link in links"
              :key="link.label"
              class="text-sand/60 hover:text-primary transition-colors"
              :href="link.href"
              @click.prevent="link.sectionId ? scrollToSection(link.sectionId) : null"
            >
              {{ link.label }}
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-sand/40">
        <p>© 2024 Aether Flow Inc. 保留所有权利。</p>
        <div class="flex gap-8">
          <a class="hover:text-sand transition-colors" href="#">隐私政策</a>
          <a class="hover:text-sand transition-colors" href="#">服务条款</a>
        </div>
      </div>
    </div>
  </footer>
</template>
