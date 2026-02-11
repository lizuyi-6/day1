<template>
  <slot v-if="!error" />
  <div v-else class="error-boundary">
    <div class="error-content">
      <svg
        class="error-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>

      <h2 class="error-title">出错了</h2>
      <p class="error-message">{{ errorMessage }}</p>

      <div v-if="showDetails && errorDetails" class="error-details">
        <pre>{{ errorDetails }}</pre>
      </div>

      <div class="error-actions">
        <button @click="reset" class="btn btn-primary">
          重试
        </button>
        <button @click="toggleDetails" class="btn btn-secondary">
          {{ showDetails ? '隐藏详情' : '显示详情' }}
        </button>
        <button @click="reload" class="btn btn-secondary">
          刷新页面
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, computed } from 'vue';

const error = ref<Error | null>(null);
const showDetails = ref(false);

onErrorCaptured((err: Error) => {
  error.value = err;
  console.error('ErrorBoundary caught an error:', err);

  // 阻止错误继续传播
  return false;
});

const errorMessage = computed(() => {
  if (!error.value) return '';
  return error.value.message || '发生未知错误';
});

const errorDetails = computed(() => {
  if (!error.value) return null;
  return error.value.stack || JSON.stringify(error.value, null, 2);
});

function reset() {
  error.value = null;
  showDetails.value = false;
}

function toggleDetails() {
  showDetails.value = !showDetails.value;
}

function reload() {
  window.location.reload();
}

// 暴露方法给父组件
defineExpose({
  reset,
  setError: (err: Error) => {
    error.value = err;
  }
});
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
}

.error-content {
  max-width: 500px;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.error-icon {
  width: 64px;
  height: 64px;
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.error-details {
  margin-bottom: 1.5rem;
  text-align: left;
}

.error-details pre {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.875rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}
</style>
