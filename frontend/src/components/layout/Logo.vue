<script setup lang="ts">
interface Props {
  onClick?: () => void
}

defineProps<Props>()
</script>

<template>
  <div class="flex items-center gap-5 text-charcoal dark:text-white cursor-pointer" @click="onClick">
    <div class="size-8 text-primary">
      <svg class="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path clip-rule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" fill-rule="evenodd"></path>
      </svg>
    </div>
    <h2 class="text-xl font-serif font-bold tracking-tight">Aether Flow</h2>
  </div>
</template>
