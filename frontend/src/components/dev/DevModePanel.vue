<template>
  <div v-if="isDevelopment" class="dev-mode-container">
    <!-- 开发模式切换按钮 -->
    <button
      @click="toggleDevPanel"
      class="dev-mode-toggle"
      :class="{ active: isDevPanelOpen }"
      title="开发模式面板"
    >
      <span v-if="errorLogs.length > 0" class="error-badge">{{ errorLogs.length }}</span>
      🔧
    </button>

    <!-- 开发模式面板 -->
    <transition name="slide">
      <div v-if="isDevPanelOpen" class="dev-mode-panel">
        <div class="panel-header">
          <h3>开发模式面板</h3>
          <div class="header-actions">
            <button @click="clearAllLogs" class="btn-clear" title="清除所有日志">
              🗑️ 清除
            </button>
            <button
              @click="exportLogs"
              class="btn-export"
              title="导出日志为JSON"
            >
              📥 导出
            </button>
            <button @click="closeDevPanel" class="btn-close" title="关闭面板">
              ✕
            </button>
          </div>
        </div>

        <div class="panel-content">
          <!-- 标签页 -->
          <div class="tabs">
            <button
              :class="{ active: activeTab === 'errors' }"
              @click="activeTab = 'errors'"
            >
              错误日志 ({{ errorLogs.length }})
            </button>
            <button
              :class="{ active: activeTab === 'network' }"
              @click="activeTab = 'network'"
            >
              网络请求 ({{ networkRequests.length }})
            </button>
          </div>

          <!-- 错误日志标签页 -->
          <div v-if="activeTab === 'errors'" class="tab-content">
            <div v-if="errorLogs.length === 0" class="empty-state">
              <p>暂无错误日志 🎉</p>
            </div>
            <div v-else class="error-list">
              <div
                v-for="error in errorLogs"
                :key="error.id"
                class="error-item"
                :class="`error-${error.type}`"
              >
                <div class="error-header" @click="toggleErrorDetail(error.id)">
                  <span class="error-icon">{{ getErrorIcon(error.type) }}</span>
                  <span class="error-time">{{ formatTimestamp(error.timestamp) }}</span>
                  <span class="error-message">{{ error.message }}</span>
                  <span class="error-expand">{{
                    expandedErrors.has(error.id) ? '▼' : '▶'
                  }}</span>
                </div>

                <div v-if="expandedErrors.has(error.id)" class="error-detail">
                  <!-- 上下文信息 -->
                  <div v-if="error.context" class="detail-section">
                    <h4>上下文信息</h4>
                    <div class="code-block">
                      <pre>{{ JSON.stringify(error.context, null, 2) }}</pre>
                    </div>
                  </div>

                  <!-- 堆栈跟踪 -->
                  <div v-if="error.stack" class="detail-section">
                    <h4>堆栈跟踪</h4>
                    <div class="code-block stack-trace">
                      <pre>{{ error.stack }}</pre>
                    </div>
                  </div>

                  <!-- 代码位置 -->
                  <div v-if="error.codeLocation" class="detail-section">
                    <h4>代码位置</h4>
                    <div class="code-location">
                      <span v-if="error.codeLocation.file"
                        >文件: {{ error.codeLocation.file }}</span
                      >
                      <span v-if="error.codeLocation.line"
                        >行: {{ error.codeLocation.line }}</span
                      >
                      <span v-if="error.codeLocation.column"
                        >列: {{ error.codeLocation.column }}</span
                      >
                    </div>
                  </div>

                  <button
                    @click="copyError(error)"
                    class="btn-copy"
                    title="复制错误信息"
                  >
                    📋 复制
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 网络请求标签页 -->
          <div v-if="activeTab === 'network'" class="tab-content">
            <div v-if="networkRequests.length === 0" class="empty-state">
              <p>暂无网络请求 📡</p>
            </div>
            <div v-else class="network-list">
              <div
                v-for="request in networkRequests"
                :key="request.id"
                class="network-item"
              >
                <div
                  class="network-header"
                  @click="toggleNetworkDetail(request.id)"
                >
                  <span
                    class="network-method"
                    :class="`method-${request.method.toLowerCase()}`"
                  >
                    {{ request.method }}
                  </span>
                  <span class="network-url">{{ request.url }}</span>
                  <span
                    v-if="request.status"
                    class="network-status"
                    :style="{ color: getStatusColor(request.status) }"
                  >
                    {{ request.status }}
                  </span>
                  <span v-if="request.duration" class="network-duration">
                    {{ request.duration }}ms
                  </span>
                  <span class="network-expand">{{
                    expandedNetwork.has(request.id) ? '▼' : '▶'
                  }}</span>
                </div>

                <div v-if="expandedNetwork.has(request.id)" class="network-detail">
                  <!-- 请求信息 -->
                  <div class="detail-section">
                    <h4>请求</h4>
                    <div v-if="request.request" class="code-block">
                      <pre>{{
                        JSON.stringify(request.request, null, 2)
                      }}</pre>
                    </div>
                  </div>

                  <!-- 响应信息 -->
                  <div class="detail-section">
                    <h4>响应</h4>
                    <div v-if="request.response" class="code-block">
                      <pre>{{
                        JSON.stringify(request.response, null, 2)
                      }}</pre>
                    </div>
                    <div v-if="request.error" class="error-message">
                      {{ request.error }}
                    </div>
                  </div>

                  <button
                    @click="copyRequest(request)"
                    class="btn-copy"
                    title="复制请求信息"
                  >
                    📋 复制
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  useDevMode,
  type ErrorLog,
  type NetworkRequest,
} from '@/composables/useDevMode'

const {
  isDevelopment,
  errorLogs,
  networkRequests,
  isDevPanelOpen,
  toggleDevPanel,
  closeDevPanel,
  clearAllLogs,
  formatTimestamp,
  getStatusColor,
  getErrorIcon,
  exportLogsAsJSON,
} = useDevMode()

const activeTab = ref<'errors' | 'network'>('errors')
const expandedErrors = ref<Set<string>>(new Set())
const expandedNetwork = ref<Set<string>>(new Set())

const toggleErrorDetail = (id: string) => {
  if (expandedErrors.value.has(id)) {
    expandedErrors.value.delete(id)
  } else {
    expandedErrors.value.add(id)
  }
}

const toggleNetworkDetail = (id: string) => {
  if (expandedNetwork.value.has(id)) {
    expandedNetwork.value.delete(id)
  } else {
    expandedNetwork.value.add(id)
  }
}

const copyError = async (error: ErrorLog) => {
  const text = JSON.stringify(error, null, 2)
  try {
    await navigator.clipboard.writeText(text)
    alert('错误信息已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const copyRequest = async (request: NetworkRequest) => {
  const text = JSON.stringify(request, null, 2)
  try {
    await navigator.clipboard.writeText(text)
    alert('请求信息已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const exportLogs = () => {
  const json = exportLogsAsJSON()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dev-logs-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.dev-mode-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.dev-mode-toggle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.dev-mode-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.dev-mode-toggle.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.error-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.dev-mode-panel {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 600px;
  max-height: 700px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-actions button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.header-actions button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.panel-content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.tabs button {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tabs button:hover {
  color: #374151;
  background: #f3f4f6;
}

.tabs button.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
  font-size: 14px;
}

.error-list,
.network-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-item,
.network-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.error-header,
.network-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.error-header:hover,
.network-header:hover {
  background: #f9fafb;
}

.error-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.error-time {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
  flex-shrink: 0;
}

.error-message {
  flex: 1;
  font-size: 14px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error-expand,
.network-expand {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
}

.error-detail,
.network-detail {
  border-top: 1px solid #e5e7eb;
  padding: 16px;
  background: #f9fafb;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.code-block {
  background: #1f2937;
  border-radius: 6px;
  padding: 12px;
  overflow: auto;
  max-height: 300px;
}

.code-block pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #e5e7eb;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.stack-trace {
  color: #fca5a5;
}

.code-location {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
}

.network-method {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
}

.method-get {
  background: #dbeafe;
  color: #1e40af;
}

.method-post {
  background: #dcfce7;
  color: #166534;
}

.method-put {
  background: #fef3c7;
  color: #92400e;
}

.method-delete {
  background: #fee2e2;
  color: #991b1b;
}

.network-url {
  flex: 1;
  font-size: 13px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
}

.network-status {
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.network-duration {
  font-size: 12px;
  color: #6b7280;
  flex-shrink: 0;
}

.error-message {
  color: #ef4444;
  font-size: 13px;
  padding: 8px;
  background: #fef2f2;
  border-radius: 4px;
  border-left: 3px solid #ef4444;
}

.btn-copy {
  margin-top: 12px;
  padding: 6px 12px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-copy:hover {
  background: #e5e7eb;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.error-error {
  border-left: 3px solid #ef4444;
}

.error-warning {
  border-left: 3px solid #f59e0b;
}

.error-info {
  border-left: 3px solid #3b82f6;
}
</style>
