<script setup lang="ts">
interface Props {
  type: 'tactile' | 'connectors' | 'layouts'
  icon: string
  title: string
  description: string
}

defineProps<Props>()
</script>

<template>
  <div class="group p-8 rounded-2xl bg-white dark:bg-[#2a241e] border border-transparent hover:border-sand transition-all duration-300 shadow-sm hover:shadow-md">
    <!-- Tactile Interaction Visual -->
    <div v-if="type === 'tactile'" class="h-16 mb-4 flex items-center gap-2 overflow-hidden relative">
      <div class="size-10 border border-dashed border-sand dark:border-white/20 rounded flex items-center justify-center opacity-40 grayscale group-hover:opacity-20 transition-opacity">
        <span class="material-symbols-outlined text-lg">crop_square</span>
      </div>
      <div class="h-[1px] w-6 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      <div class="size-10 bg-primary text-white rounded shadow-xl flex items-center justify-center transform -translate-y-1 rotate-3 group-hover:scale-110 transition-transform duration-500 z-10">
        <span class="material-symbols-outlined text-lg">{{ icon }}</span>
      </div>
      <div class="absolute left-[4.5rem] w-12 h-[1px] bg-primary/20 -z-10 group-hover:w-20 transition-all duration-500"></div>
      <div class="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-[#2a241e] to-transparent z-20"></div>
    </div>

    <!-- Smart Connectors Visual -->
    <div v-else-if="type === 'connectors'" class="h-16 mb-4 flex items-center w-full">
      <div class="relative w-full max-w-[160px] h-8 flex items-center justify-between">
        <div class="size-3 rounded-full bg-charcoal dark:bg-sand z-10 group-hover:ring-4 ring-primary/10 transition-all"></div>
        <div class="absolute inset-0 flex items-center px-1">
          <div class="h-0.5 w-full bg-sand/50 dark:bg-white/10">
            <div class="h-full w-2/3 bg-primary rounded-full relative group-hover:w-full transition-all duration-1000 ease-out">
              <div class="absolute right-0 top-1/2 -translate-y-1/2 size-2 bg-primary blur-[2px] opacity-80"></div>
            </div>
          </div>
        </div>
        <div class="size-3 rounded-full border-2 border-dashed border-primary z-10 bg-white dark:bg-[#2a241e]"></div>
      </div>
    </div>

    <!-- Fluid Layouts Visual -->
    <div v-else-if="type === 'layouts'" class="h-16 mb-4 flex items-end gap-1.5">
      <div class="w-6 h-8 bg-sand/30 dark:bg-white/10 rounded-sm"></div>
      <div class="w-6 h-10 bg-sand/30 dark:bg-white/10 rounded-sm"></div>
      <div class="w-6 h-12 bg-primary/20 border border-primary rounded-sm shadow-lg mb-2 backdrop-blur-sm group-hover:-translate-y-1 transition-transform duration-500"></div>
      <div class="w-6 h-9 bg-sand/30 dark:bg-white/10 rounded-sm"></div>
      <div class="w-6 h-7 bg-sand/30 dark:bg-white/10 rounded-sm"></div>
    </div>

    <!-- Content -->
    <h3 class="text-xl font-serif font-bold mb-3 text-charcoal dark:text-white">{{ title }}</h3>
    <p class="text-khaki dark:text-sand/70">{{ description }}</p>
  </div>
</template>
