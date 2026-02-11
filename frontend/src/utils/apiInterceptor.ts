import { useDevMode } from '@/composables/useDevMode'

/**
 * 设置全局 API 拦截器
 * 在开发模式下捕获和记录所有 fetch 请求和响应
 */
export function setupAPIInterceptor() {
  const { addNetworkRequest, updateNetworkRequest, addErrorLog } = useDevMode()

  // 保存原始的 fetch 函数
  const originalFetch = window.fetch

  // 重写 fetch 函数
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const startTime = Date.now()
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const method = init?.method || 'GET'

    // 创建请求 ID
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // 记录请求
    addNetworkRequest({
      id: requestId,
      timestamp: startTime,
      url,
      method: method.toUpperCase(),
      request: {
        headers: init?.headers as Record<string, string>,
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      },
    })

    try {
      // 执行原始请求
      const response = await originalFetch(input, init)
      const duration = Date.now() - startTime

      // 克隆响应以便读取
      const clonedResponse = response.clone()
      let responseBody: any

      try {
        responseBody = await clonedResponse.json()
      } catch {
        // 如果不是 JSON，尝试获取文本
        try {
          responseBody = await clonedResponse.text()
        } catch {
          responseBody = null
        }
      }

      // 更新请求日志
      updateNetworkRequest(requestId, {
        status: response.status,
        duration,
        response: {
          headers: Object.fromEntries(response.headers.entries()),
          body: responseBody,
        },
      })

      // 如果是错误响应，记录到错误日志
      if (!response.ok) {
        let errorMessage = responseBody?.message || `HTTP ${response.status}: ${response.statusText}`;
        let errorCode = responseBody?.code;

        // 标准化错误码处理
        if (errorCode) {
          switch (errorCode) {
            case 'E_WORKFLOW_NOT_FOUND':
              errorMessage = '找不到该工作流，请检查ID';
              break;
            case 'E_WORKFLOW_EXECUTION_FAILED':
              errorMessage = `工作流执行失败: ${responseBody?.details || '未知错误'}`;
              break;
            case 'E_NODE_CONFIGURATION_ERROR':
              errorMessage = `节点配置错误: ${responseBody?.details}`;
              break;
            case 'E_RATE_LIMIT_EXCEEDED':
              errorMessage = `请求过于频繁，请${responseBody?.retryAfter ? `等待 ${responseBody.retryAfter} 秒后` : ''}重试`;
              break;
            case 'E_UNAUTHORIZED_ACCESS':
              errorMessage = '无权访问此资源';
              break;
            case 'E_WORKFLOW_ALREADY_RUNNING':
              errorMessage = '工作流正在运行中，请勿重复提交';
              break;
          }
        }

        addErrorLog({
          type: response.status >= 500 ? 'error' : 'warning',
          message: errorMessage,
          context: {
            url,
            method: method.toUpperCase(),
            requestId,
            statusCode: response.status,
            responseBody,
            errorCode,
          },
        })
      }

      return response
    } catch (error: any) {
      const duration = Date.now() - startTime

      // 记录网络错误
      updateNetworkRequest(requestId, {
        duration,
        error: error.message,
      })

      // 添加到错误日志
      addErrorLog({
        type: 'error',
        message: `网络请求失败: ${error.message}`,
        context: {
          url,
          method: method.toUpperCase(),
          requestId,
        },
        stack: error.stack,
      })

      throw error
    }
  }

  console.log('[DevMode] API 拦截器已启用')
}

/**
 * 设置全局错误处理器
 * 捕获未处理的错误和 Promise 拒绝
 */
export function setupGlobalErrorHandler() {
  const { addErrorLog } = useDevMode()

  // 捕获未处理的错误
  window.addEventListener('error', (event) => {
    addErrorLog({
      type: 'error',
      message: event.message,
      context: {
        url: event.filename,
        responseBody: {
          lineno: event.lineno,
          colno: event.colno,
        },
      },
      stack: event.error?.stack,
    })
  })

  // 捕获未处理的 Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    addErrorLog({
      type: 'error',
      message: `Unhandled Promise Rejection: ${event.reason}`,
      stack: event.reason?.stack,
    })
  })

  console.log('[DevMode] 全局错误处理器已启用')
}

/**
 * 设置控制台拦截器
 * 在开发模式下增强控制台输出
 */
export function setupConsoleInterceptor() {
  if (!import.meta.env.DEV) return

  const originalError = console.error
  const originalWarn = console.warn

  console.error = function (...args: any[]) {
    originalError.apply(console, args)
    // 可以在这里添加额外的错误处理逻辑
  }

  console.warn = function (...args: any[]) {
    originalWarn.apply(console, args)
    // 可以在这里添加额外的警告处理逻辑
  }

  console.log('[DevMode] 控制台拦截器已启用')
}
