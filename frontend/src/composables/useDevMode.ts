import { ref, computed } from 'vue'

export interface ErrorLog {
  id: string
  timestamp: number
  type: 'error' | 'warning' | 'info'
  message: string
  stack?: string
  context?: {
    url?: string
    method?: string
    requestId?: string
    statusCode?: number
    responseBody?: any
  }
  codeLocation?: {
    file?: string
    line?: string
    column?: string
  }
}

export interface NetworkRequest {
  id: string
  timestamp: number
  url: string
  method: string
  status?: number
  duration?: number
  request?: {
    headers?: Record<string, string>
    body?: any
  }
  response?: {
    headers?: Record<string, string>
    body?: any
  }
  error?: string
}

const isDevelopment = computed(() => import.meta.env.DEV)
const errorLogs = ref<ErrorLog[]>([])
const networkRequests = ref<NetworkRequest[]>([])
const isDevPanelOpen = ref(false)

export function useDevMode() {
  /**
   * 添加错误日志
   */
  const addErrorLog = (error: Partial<ErrorLog>) => {
    const log: ErrorLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'error',
      ...error,
    }

    errorLogs.value.unshift(log)

    // 只保留最近100条日志
    if (errorLogs.value.length > 100) {
      errorLogs.value = errorLogs.value.slice(0, 100)
    }

    // 在开发模式下在控制台显示
    if (isDevelopment.value) {
      console.error('[DevMode Error]:', log)
    }

    return log.id
  }

  /**
   * 添加网络请求日志
   */
  const addNetworkRequest = (request: Partial<NetworkRequest>) => {
    const req: NetworkRequest = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...request,
    }

    networkRequests.value.unshift(req)

    // 只保留最近50条请求
    if (networkRequests.value.length > 50) {
      networkRequests.value = networkRequests.value.slice(0, 50)
    }

    return req.id
  }

  /**
   * 更新网络请求（用于更新响应信息）
   */
  const updateNetworkRequest = (id: string, updates: Partial<NetworkRequest>) => {
    const index = networkRequests.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      networkRequests.value[index] = {
        ...networkRequests.value[index],
        ...updates,
      }
    }
  }

  /**
   * 清除错误日志
   */
  const clearErrorLogs = () => {
    errorLogs.value = []
  }

  /**
   * 清除网络请求日志
   */
  const clearNetworkRequests = () => {
    networkRequests.value = []
  }

  /**
   * 清除所有日志
   */
  const clearAllLogs = () => {
    clearErrorLogs()
    clearNetworkRequests()
  }

  /**
   * 切换开发面板
   */
  const toggleDevPanel = () => {
    isDevPanelOpen.value = !isDevPanelOpen.value
  }

  /**
   * 打开开发面板
   */
  const openDevPanel = () => {
    isDevPanelOpen.value = true
  }

  /**
   * 关闭开发面板
   */
  const closeDevPanel = () => {
    isDevPanelOpen.value = false
  }

  /**
   * 格式化时间戳
   */
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  /**
   * 获取状态码对应的颜色
   */
  const getStatusColor = (status?: number): string => {
    if (!status) return 'gray'
    if (status >= 500) return 'red'
    if (status >= 400) return 'orange'
    if (status >= 300) return 'blue'
    if (status >= 200) return 'green'
    return 'gray'
  }

  /**
   * 获取错误类型对应的图标
   */
  const getErrorIcon = (type: ErrorLog['type']): string => {
    switch (type) {
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '❓'
    }
  }

  /**
   * 复制到剪贴板
   */
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }

  /**
   * 导出日志为JSON
   */
  const exportLogsAsJSON = (): string => {
    const data = {
      exportTime: new Date().toISOString(),
      errorLogs: errorLogs.value,
      networkRequests: networkRequests.value,
    }
    return JSON.stringify(data, null, 2)
  }

  return {
    // 状态
    isDevelopment,
    errorLogs,
    networkRequests,
    isDevPanelOpen,

    // 错误日志方法
    addErrorLog,
    clearErrorLogs,

    // 网络请求方法
    addNetworkRequest,
    updateNetworkRequest,
    clearNetworkRequests,

    // 通用方法
    clearAllLogs,
    toggleDevPanel,
    openDevPanel,
    closeDevPanel,

    // 工具方法
    formatTimestamp,
    getStatusColor,
    getErrorIcon,
    copyToClipboard,
    exportLogsAsJSON,
  }
}
