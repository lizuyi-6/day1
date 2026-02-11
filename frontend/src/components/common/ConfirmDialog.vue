<script setup lang="ts">
import { computed } from 'vue'
import { X, AlertTriangle } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const handleConfirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}

const iconColor = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'text-red-600'
    case 'warning':
      return 'text-amber-600'
    default:
      return 'text-blue-600'
  }
})

const bgColor = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-100/50'
    case 'warning':
      return 'bg-amber-100/50'
    default:
      return 'bg-blue-100/50'
  }
})

const confirmBtnClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
    case 'warning':
      return 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
    default:
      return 'bg-primary hover:bg-primary/90 shadow-primary/20'
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="handleCancel"
    >
      <div class="bg-white dark:bg-[#1e1711] rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-sand/20 dark:border-white/10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-charcoal dark:text-white">{{ title || '确认' }}</h3>
          <button
            @click="handleCancel"
            class="p-1 hover:bg-sand/20 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <X :size="20" class="text-charcoal/60 dark:text-sand/60" />
          </button>
        </div>

        <div class="flex items-start gap-4 mb-6">
          <div :class="['flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center', bgColor]">
            <AlertTriangle :size="24" :class="iconColor" />
          </div>
          <p class="text-sm text-khaki dark:text-sand/70 leading-relaxed flex-1">{{ message }}</p>
        </div>

        <div class="flex gap-3">
          <button
            @click="handleCancel"
            class="flex-1 px-4 py-2.5 border border-sand/30 dark:border-white/20 text-charcoal dark:text-sand rounded-xl hover:bg-sand/20 dark:hover:bg-white/10 transition-colors font-medium"
          >
            {{ cancelText || '取消' }}
          </button>
          <button
            @click="handleConfirm"
            :class="['flex-1 px-4 py-2.5 text-white rounded-xl transition-colors font-medium shadow-lg', confirmBtnClass]"
          >
            {{ confirmText || '确定' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
