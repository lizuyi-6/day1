<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-vue-next'

export type ErrorLevel = 'error' | 'warning' | 'info' | 'success'

export interface ToastMessage {
  id: string
  level: ErrorLevel
  title: string
  message?: string
  duration?: number
  actions?: Array<{ label: string; action: () => void }>
}

const props = defineProps<{
  messages: ToastMessage[]
}>()

const emit = defineEmits<{
  dismiss: [id: string]
}>()

const dismiss = (id: string) => {
  emit('dismiss', id)
}

const iconMap = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle
}

const levelColors = {
  error: 'border-red-500 bg-red-50 text-red-900',
  warning: 'border-amber-500 bg-amber-50 text-amber-900',
  info: 'border-blue-500 bg-blue-50 text-blue-900',
  success: 'border-emerald-500 bg-emerald-50 text-emerald-900'
}

const getIcon = (level: ErrorLevel | undefined) => {
  if (!level || !iconMap[level]) return Info
  return iconMap[level]
}

const getLevelColor = (level: ErrorLevel | undefined) => {
  if (!level || !levelColors[level]) return levelColors.info
  return levelColors[level]
}
</script>

<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md">
    <Transition
      v-for="message in (messages || [])"
      :key="message?.id"
      name="toast"
      mode="out-in"
    >
      <div
        v-if="message"
        class="rounded-lg border shadow-lg p-4"
        :class="getLevelColor(message.level)"
      >
        <div class="flex items-start gap-3">
          <component
            :is="getIcon(message.level)"
            :size="20"
            class="shrink-0"
          />

          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-sm mb-1">{{ message.title }}</h4>
            <p v-if="message.message" class="text-xs opacity-90">{{ message.message }}</p>

            <div v-if="message.actions && message.actions.length > 0" class="flex gap-2 mt-3">
              <button
                v-for="(action, idx) in message.actions"
                :key="idx"
                @click="action.action()"
                class="px-3 py-1.5 rounded text-xs font-medium bg-white/30 hover:bg-white/50 transition-colors"
              >
                {{ action.label }}
              </button>
            </div>
          </div>

          <button
            @click="dismiss(message.id)"
            class="shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X :size="16" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
