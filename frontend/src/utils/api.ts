import { useAuth } from '../composables/useAuth'
import { getBrowserId } from './cookie'

/**
 * API请求配置
 */
interface FetchConfig extends RequestInit {
  timeout?: number
}

/**
 * API响应接口
 */
interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode?: number
}

/**
 * 带超时的fetch请求
 * @param url - 请求URL
 * @param options - 请求配置
 * @param timeout - 超时时间（毫秒），默认30秒
 * @returns Promise<Response>
 * @throws {Error} 网络错误或超时错误
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchConfig = {},
  timeout: number = 30000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`请求超时（${timeout / 1000}秒），请稍后重试`)
    }

    throw error
  }
}

/**
 * 安全的API请求包装器
 * 自动处理认证、超时、错误响应
 *
 * @param url - 请求URL
 * @param options - 请求配置
 * @param config - 额外配置
 * @returns Promise<APIResponse<T>>
 *
 * @example
 * ```typescript
 * const response = await apiRequest<UserData>('/api/user/123', {
 *   method: 'GET'
 * })
 *
 * if (response.success) {
 *   console.log(response.data)
 * } else {
 *   console.error(response.error)
 * }
 * ```
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: FetchConfig = {},
  config: {
    timeout?: number
    includeAuth?: boolean
    retries?: number
    retryDelay?: number
  } = {}
): Promise<APIResponse<T>> {
  const {
    timeout = 30000,
    includeAuth = true,
    retries = 0,
    retryDelay = 1000,
  } = config

  const { getAuthHeaders } = useAuth()

  // 根据请求类型动态设置Content-Type
  const getDefaultHeaders = () => {
    const headers: Record<string, string> = {}

    // 如果不是FormData，设置JSON Content-Type
    if (!(options?.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    return headers
  }

  // 初始化 headers 对象（关键修复：必须在 apiRequest 作用域中声明）
  const headers: Record<string, string> = {}

  if (options.headers) {
    Object.assign(headers, options.headers)
  }

  // 使用动态headers，根据请求类型设置正确的Content-Type
  const dynamicHeaders = getDefaultHeaders()
  Object.assign(headers, dynamicHeaders)

  if (includeAuth) {
    const authHeaders = getAuthHeaders()
    Object.assign(headers, authHeaders)
  }

  const browserId = getBrowserId()
  if (browserId) {
    headers['X-Browser-Id'] = browserId
  }

  // 准备请求配置
  const fetchOptions: FetchConfig = {
    ...options,
    headers,
    credentials: 'include', // Ensure cookies are sent with cross-origin requests
  }

  // 重试逻辑
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, fetchOptions, timeout)

      // 处理HTTP错误状态
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage =
          errorData?.message ||
          errorData?.error ||
          `HTTP ${response.status}: ${response.statusText}`

        // 特殊处理401未授权错误
        if (response.status === 401) {
          return {
            success: false,
            error: '认证失败，请重新登录',
            statusCode: response.status,
          }
        }

        // 特定状态码可以重试
        if (retries > 0 && attempt < retries && response.status >= 500) {
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          continue
        }

        return {
          success: false,
          error: errorMessage,
          statusCode: response.status,
        }
      }

      // 解析响应数据
      let data = null
      if (response.status !== 204) {
        try {
          data = await response.json()
        } catch {
        }
      }

      return {
        success: true,
        data,
        statusCode: response.status,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // 网络错误可以重试
      if (retries > 0 && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        continue
      }

      return {
        success: false,
        error: lastError.message || '网络请求失败',
      }
    }
  }

  // 不应该到达这里，但TypeScript需要
  return {
    success: false,
    error: lastError?.message || '请求失败',
  }
}

/**
 * GET请求快捷方法
 */
export async function get<T = unknown>(
  url: string,
  config?: Omit<Parameters<typeof apiRequest>[2], 'method'>
): Promise<APIResponse<T>> {
  return apiRequest<T>(url, { method: 'GET' }, config)
}

/**
 * POST请求快捷方法
 */
export async function post<T = unknown>(
  url: string,
  body?: unknown,
  config?: Omit<Parameters<typeof apiRequest>[2], 'method'>
): Promise<APIResponse<T>> {
  return apiRequest<T>(
    url,
    {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    },
    config
  )
}

/**
 * PUT请求快捷方法
 */
export async function put<T = unknown>(
  url: string,
  body?: unknown,
  config?: Omit<Parameters<typeof apiRequest>[2], 'method'>
): Promise<APIResponse<T>> {
  return apiRequest<T>(
    url,
    {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    },
    config
  )
}

/**
 * DELETE请求快捷方法
 */
export async function del<T = unknown>(
  url: string,
  config?: Omit<Parameters<typeof apiRequest>[2], 'method'>
): Promise<APIResponse<T>> {
  return apiRequest<T>(url, { method: 'DELETE' }, config)
}

/**
 * 文件上传请求
 */
export async function uploadFile<T = unknown>(
  url: string,
  file: File,
  config?: Omit<Parameters<typeof apiRequest>[2], 'method' | 'headers'>
): Promise<APIResponse<T>> {
  const formData = new FormData()
  formData.append('file', file)

  const { getAuthHeaders } = useAuth()

  return apiRequest<T>(
    url,
    {
      method: 'POST',
      body: formData,
      headers: {
        ...getAuthHeaders(),
        // 不设置Content-Type，让浏览器自动设置multipart/form-data边界
      },
    },
    {
      ...config,
      // 文件上传可能需要更长的超时时间
      timeout: config?.timeout || 60000,
    }
  )
}
