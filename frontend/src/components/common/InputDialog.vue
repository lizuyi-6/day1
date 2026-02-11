<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  title?: string
  message?: string
  placeholder?: string
  defaultValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': [value: string]
  'cancel': []
}>()

const inputValue = ref('')
const inputRef = ref<HTMLInputElement>()

watch(() => props.modelValue, (open) => {
  if (open) {
    inputValue.value = props.defaultValue || ''
    nextTick(() => {
      inputRef.value?.focus()
      inputRef.value?.select()
    })
  }
})

const handleConfirm = () => {
  emit('confirm', inputValue.value)
  emit('update:modelValue', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleConfirm()
  } else if (e.key === 'Escape') {
    handleCancel()
  }
}
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
          <h3 class="text-lg font-bold text-charcoal dark:text-white">{{ title || '输入' }}</h3>
          <button
            @click="handleCancel"
            class="p-1 hover:bg-sand/20 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <X :size="20" class="text-charcoal/60 dark:text-sand/60" />
          </button>
        </div>

        <p v-if="message" class="text-sm text-khaki dark:text-sand/70 mb-4">{{ message }}</p>

        <input
          ref="inputRef"
          v-model="inputValue"
          type="text"
          :placeholder="placeholder"
          @keydown="handleKeydown"
          class="w-full px-4 py-3 border border-sand/30 dark:border-white/20 rounded-xl bg-sand/10 dark:bg-white/5 text-charcoal dark:text-sand placeholder-khaki/50 dark:placeholder-sand/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all mb-4"
        />

        <div class="flex gap-3">
          <button
            @click="handleCancel"
            class="flex-1 px-4 py-2.5 border border-sand/30 dark:border-white/20 text-charcoal dark:text-sand rounded-xl hover:bg-sand/20 dark:hover:bg-white/10 transition-colors font-medium"
          >
            取消
          </button>
          <button
            @click="handleConfirm"
            class="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/20"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
