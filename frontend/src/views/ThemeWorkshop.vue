<template>
  <div class="min-h-screen bg-background-light p-8 font-ui text-charcoal transition-colors duration-500">
    <div class="max-w-6xl mx-auto">
      <header class="mb-12 text-center">
        <h1 class="text-4xl font-serif font-bold mb-4">Theme Workshop</h1>
        <p class="text-khaki text-lg">点击下方卡片切换主题，实时预览配色效果</p>
      </header>

      <!-- Theme Selector -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <button
          v-for="theme in themes"
          :key="theme.id"
          @click="applyTheme(theme)"
          class="group relative overflow-hidden rounded-2xl border-2 border-transparent transition-all hover:scale-105 hover:shadow-xl text-left"
          :class="{ 'ring-4 ring-primary ring-offset-4 ring-offset-background-light': currentThemeId === theme.id }"
        >
          <div class="h-32 w-full transition-colors" :style="{ backgroundColor: theme.colors['--bg-app'] }">
            <div class="absolute inset-0 flex items-center justify-center gap-2">
              <div class="size-8 rounded-full shadow-lg" :style="{ backgroundColor: theme.colors['--color-primary'] }"></div>
              <div class="size-8 rounded-full shadow-lg" :style="{ backgroundColor: theme.colors['--text-main'] }"></div>
              <div class="size-8 rounded-full shadow-lg" :style="{ backgroundColor: theme.colors['--bg-hover'] }"></div>
            </div>
          </div>
          <div class="bg-white p-4 dark:bg-gray-800">
            <h3 class="font-bold text-gray-900 dark:text-white">{{ theme.name }}</h3>
            <p class="text-xs text-gray-500 mt-1">{{ theme.description }}</p>
          </div>
        </button>
      </div>

      <!-- Preview Section -->
      <div class="space-y-12">
        
        <!-- Section 1: Landing Page Cards -->
        <section>
          <h2 class="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
            <span class="w-2 h-8 bg-primary rounded-full"></span>
            UI Component Preview
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Mock Card 1 -->
            <div class="bg-white/60 backdrop-blur-md rounded-2xl border border-sand/30 p-8 shadow-sm group hover:shadow-xl hover:border-primary/30 transition-all">
              <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <h3 class="text-xl font-serif font-bold mb-2 group-hover:text-primary transition-colors">Smart Workflow</h3>
              <p class="text-khaki text-sm leading-relaxed">
                Automate your business logic with our advanced AI agents. Drag and drop to build complex chains.
              </p>
            </div>

            <!-- Mock Card 2 -->
            <div class="bg-white/60 backdrop-blur-md rounded-2xl border border-sand/30 p-8 shadow-sm group hover:shadow-xl hover:border-primary/30 transition-all">
               <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </div>
              <h3 class="text-xl font-serif font-bold mb-2 group-hover:text-primary transition-colors">Agent Chat</h3>
              <p class="text-khaki text-sm leading-relaxed">
                Directly interact with your deployed agents. Test capabilities and conversational flows in real-time.
              </p>
            </div>

            <!-- Mock Card 3 -->
            <div class="bg-white/60 backdrop-blur-md rounded-2xl border border-sand/30 p-8 shadow-sm group hover:shadow-xl hover:border-primary/30 transition-all">
               <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </div>
              <h3 class="text-xl font-serif font-bold mb-2 group-hover:text-primary transition-colors">Integration</h3>
              <p class="text-khaki text-sm leading-relaxed">
                Connect with any API or data source. Seamlessly integrate into your existing infrastructure.
              </p>
            </div>
          </div>
        </section>

        <!-- Section 2: Colors & Typography -->
        <section class="bg-white/40 rounded-3xl p-8 border border-sand/20">
             <h2 class="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
            <span class="w-2 h-8 bg-cycle-2 rounded-full"></span>
            Cycle Colors & Typography
          </h2>
          <div class="flex flex-wrap gap-4 mb-8">
            <div class="size-16 rounded-xl bg-cycle-1 flex items-center justify-center text-white text-xs font-mono shadow-md">1</div>
            <div class="size-16 rounded-xl bg-cycle-2 flex items-center justify-center text-white text-xs font-mono shadow-md">2</div>
            <div class="size-16 rounded-xl bg-cycle-3 flex items-center justify-center text-white text-xs font-mono shadow-md">3</div>
            <div class="size-16 rounded-xl bg-cycle-4 flex items-center justify-center text-white text-xs font-mono shadow-md">4</div>
            <div class="size-16 rounded-xl bg-cycle-5 flex items-center justify-center text-charcoal text-xs font-mono shadow-md">5</div>
          </div>
          
          <div class="space-y-4">
            <h1 class="text-5xl font-serif font-bold">Display Heading</h1>
            <h2 class="text-3xl font-serif font-medium text-charcoal/90">Section Title Example</h2>
            <p class="text-lg text-charcoal/80 max-w-2xl">
              This is a paragraph of body text. It uses the configured UI font and text colors. 
              <span class="text-primary font-bold">This is primary highlighted text.</span>
            </p>
             <div class="flex gap-4 mt-6">
              <button class="px-6 py-2.5 bg-primary text-white rounded-lg font-medium shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">Primary Action</button>
              <button class="px-6 py-2.5 bg-white border border-sand/50 text-charcoal rounded-lg font-medium hover:bg-sand/20 transition-colors">Secondary</button>
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const currentThemeId = ref('vintage')

const themes = [
  {
    id: 'vintage',
    name: 'Vintage Cream (Current)',
    description: 'Warm beige tones with deep blue accents. Nostalgic and paper-like.',
    colors: {
      '--bg-app': '#DED7CD',
      '--bg-panel': '#ffffff',
      '--bg-hover': '#CFC5B8',
      '--border-light': '#CFC5B8',
      '--border-dim': '#DED7CD',
      '--border-dark': '#1660AB',
      '--text-main': '#1660AB',
      '--text-secondary': '#5C5C5C',
      '--text-tertiary': '#887563',
      '--color-primary': '#1660AB',
      '--color-cycle-1': '#021024',
      '--color-cycle-2': '#052659',
      '--color-cycle-3': '#548383',
      '--color-cycle-4': '#7DA0CA',
      '--color-cycle-5': '#C1E8FF',
    }
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    description: 'Dark mode with high contrast neon accents. Modern and tech-focused.',
    colors: {
      '--bg-app': '#0F172A', // Slate 900
      '--bg-panel': '#1E293B', // Slate 800
      '--bg-hover': '#334155', // Slate 700
      '--border-light': '#334155',
      '--border-dim': '#1E293B',
      '--border-dark': '#38BDF8', // Sky 400
      '--text-main': '#F8FAFC', // Slate 50
      '--text-secondary': '#94A3B8', // Slate 400
      '--text-tertiary': '#64748B', // Slate 500
      '--color-primary': '#38BDF8', // Sky 400
      '--color-cycle-1': '#6366F1', // Indigo
      '--color-cycle-2': '#8B5CF6', // Violet
      '--color-cycle-3': '#EC4899', // Pink
      '--color-cycle-4': '#F43F5E', // Rose
      '--color-cycle-5': '#F59E0B', // Amber
    }
  },
  {
    id: 'clean-slate',
    name: 'Clean Slate',
    description: 'Minimalist white and gray. Professional SaaS aesthetic.',
    colors: {
      '--bg-app': '#F8FAFC', // Slate 50
      '--bg-panel': '#ffffff',
      '--bg-hover': '#F1F5F9', // Slate 100
      '--border-light': '#E2E8F0', // Slate 200
      '--border-dim': '#F1F5F9',
      '--border-dark': '#0F172A', // Slate 900
      '--text-main': '#0F172A', // Slate 900
      '--text-secondary': '#475569', // Slate 600
      '--text-tertiary': '#94A3B8', // Slate 400
      '--color-primary': '#0F172A', // Slate 900
      '--color-cycle-1': '#0F172A',
      '--color-cycle-2': '#334155',
      '--color-cycle-3': '#475569',
      '--color-cycle-4': '#64748B',
      '--color-cycle-5': '#94A3B8',
    }
  },
  {
    id: 'nordic-blue',
    name: 'Nordic Blue',
    description: 'Clean Slate Variant. Cool, icy tones for a rational and efficient vibe.',
    colors: {
      '--bg-app': '#F0F9FF', // Sky 50
      '--bg-panel': '#ffffff',
      '--bg-hover': '#E0F2FE', // Sky 100
      '--border-light': '#BAE6FD', // Sky 200
      '--border-dim': '#E0F2FE',
      '--border-dark': '#0EA5E9', // Sky 500
      '--text-main': '#0C4A6E', // Sky 900
      '--text-secondary': '#0369A1', // Sky 700
      '--text-tertiary': '#38BDF8', // Sky 400
      '--color-primary': '#0EA5E9', // Sky 500
      '--color-cycle-1': '#0C4A6E',
      '--color-cycle-2': '#0369A1',
      '--color-cycle-3': '#0284C7',
      '--color-cycle-4': '#0EA5E9',
      '--color-cycle-5': '#38BDF8',
    }
  },
  {
    id: 'soft-purple',
    name: 'Soft Purple',
    description: 'Clean Slate Variant. Elegant and creative with a modern violet touch.',
    colors: {
      '--bg-app': '#FAFAFA', // Zinc 50
      '--bg-panel': '#ffffff',
      '--bg-hover': '#F4F4F5', // Zinc 100
      '--border-light': '#E4E4E7', // Zinc 200
      '--border-dim': '#F4F4F5',
      '--border-dark': '#8B5CF6', // Violet 500
      '--text-main': '#2E1065', // Violet 950
      '--text-secondary': '#5B21B6', // Violet 800
      '--text-tertiary': '#7C3AED', // Violet 600
      '--color-primary': '#8B5CF6', // Violet 500
      '--color-cycle-1': '#2E1065',
      '--color-cycle-2': '#4C1D95',
      '--color-cycle-3': '#6D28D9',
      '--color-cycle-4': '#8B5CF6',
      '--color-cycle-5': '#A78BFA',
    }
  },
  {
    id: 'forest-zen',
    name: 'Forest Zen',
    description: 'Soft mint green with earthy brown accents. Relaxing and organic.',
    colors: {
      '--bg-app': '#E3F4EC', // Mint
      '--bg-panel': '#ffffff',
      '--bg-hover': '#D1E8E0',
      '--border-light': '#D1E8E0',
      '--border-dim': '#E3F4EC',
      '--border-dark': '#AC8659', // Earthy Brown
      '--text-main': '#181411', // Dark Charcoal
      '--text-secondary': '#5C5C5C',
      '--text-tertiary': '#AC8659', // Brown
      '--color-primary': '#AC8659',
      '--color-cycle-1': '#166534', // Green 700
      '--color-cycle-2': '#15803D', // Green 600
      '--color-cycle-3': '#84CC16', // Lime
      '--color-cycle-4': '#14B8A6', // Teal
      '--color-cycle-5': '#A7F3D0', // Emerald 200
    }
  },
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    description: 'Forest Zen Variant. Fresh, yellowish-green tones. Energetic and young.',
    colors: {
      '--bg-app': '#F1F8E9', // Light Green 50
      '--bg-panel': '#ffffff',
      '--bg-hover': '#DCEDC8', // Light Green 100
      '--border-light': '#C5E1A5', // Light Green 200
      '--border-dim': '#DCEDC8',
      '--border-dark': '#558B2F', // Light Green 800
      '--text-main': '#1B5E20', // Green 900
      '--text-secondary': '#33691E', // Light Green 900
      '--text-tertiary': '#689F38', // Light Green 700
      '--color-primary': '#558B2F', // Light Green 800
      '--color-cycle-1': '#1B5E20',
      '--color-cycle-2': '#33691E',
      '--color-cycle-3': '#558B2F',
      '--color-cycle-4': '#689F38',
      '--color-cycle-5': '#9CCC65',
    }
  },
  {
    id: 'sandstone',
    name: 'Sandstone',
    description: 'Forest Zen Variant. Warm stone grays with terracotta accents. Grounded.',
    colors: {
      '--bg-app': '#F5F5F4', // Stone 100
      '--bg-panel': '#ffffff',
      '--bg-hover': '#E7E5E4', // Stone 200
      '--border-light': '#D6D3D1', // Stone 300
      '--border-dim': '#E7E5E4',
      '--border-dark': '#D97706', // Amber 600
      '--text-main': '#44403C', // Stone 700
      '--text-secondary': '#78716C', // Stone 500
      '--text-tertiary': '#A8A29E', // Stone 400
      '--color-primary': '#D97706', // Amber 600
      '--color-cycle-1': '#78350F', // Amber 900
      '--color-cycle-2': '#92400E', // Amber 800
      '--color-cycle-3': '#B45309', // Amber 700
      '--color-cycle-4': '#D97706', // Amber 600
      '--color-cycle-5': '#F59E0B', // Amber 500
    }
  }
]

const applyTheme = (theme: typeof themes[0]) => {
  currentThemeId.value = theme.id
  const root = document.documentElement
  
  // Update CSS variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

// Initialize with current computed styles to find matching theme or default
onMounted(() => {
  // Optional: Read current CSS vars to highlight correct theme
})
</script>