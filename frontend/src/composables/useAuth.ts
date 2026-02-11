import { ref, computed } from 'vue'

const STORAGE_KEY = 'auth_token'

// 使用模块级别的响应式状态来实现单例模式
const token = ref<string | null>(localStorage.getItem(STORAGE_KEY))

// 清除过期token（可选）
const checkTokenExpiry = () => {
  const expiryTime = localStorage.getItem(`${STORAGE_KEY}_expiry`)
  if (expiryTime && new Date().getTime() > parseInt(expiryTime)) {
    clearToken()
    return false
  }
  return true
}

// 初始化时检查token是否过期
if (token.value && !checkTokenExpiry()) {
  token.value = null
}

export function useAuth() {
  /**
   * 设置认证令牌
   * @param newToken - JWT令牌或其他认证令牌
   * @param expiresInMs - 可选，令牌过期时间（毫秒），默认7天
   */
  const setToken = (newToken: string, expiresInMs: number = 7 * 24 * 60 * 60 * 1000) => {
    if (!newToken || typeof newToken !== 'string') {
      console.error('Invalid token provided')
      return
    }

    token.value = newToken
    localStorage.setItem(STORAGE_KEY, newToken)

    // 设置过期时间
    const expiryTime = new Date().getTime() + expiresInMs
    localStorage.setItem(`${STORAGE_KEY}_expiry`, expiryTime.toString())
  }

  /**
   * 清除认证令牌
   */
  const clearToken = () => {
    token.value = null
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(`${STORAGE_KEY}_expiry`)
  }

  /**
   * 获取认证请求头
   * @returns 包含Authorization头的对象
   */
  const getAuthHeaders = () => {
    if (token.value) {
      return {
        'Authorization': `Bearer ${token.value}`,
      }
    }
    return {}
  }

  /**
   * 检查用户是否已认证
   */
  const isAuthenticated = computed(() => {
    return !!token.value && checkTokenExpiry()
  })

  /**
   * 从令牌中解码用户信息（JWT）
   * 注意：这是基础实现，生产环境应使用专业的JWT库
   */
  const getUserFromToken = () => {
    if (!token.value) return null

    try {
      // 简单的JWT解码（仅用于payload，不验证签名）
      const payloadBase64 = token.value.split('.')[1]
      if (!payloadBase64) return null

      const payload = JSON.parse(atob(payloadBase64))
      return {
        id: payload.sub || payload.userId,
        email: payload.email,
        name: payload.name,
        roles: payload.roles || [],
      }
    } catch (error) {
      console.error('Failed to decode token:', error)
      return null
    }
  }

  /**
   * 刷新令牌逻辑（需要配合后端API）
   */
  const refreshToken = async () => {
    try {
      // 这里应该调用后端的刷新令牌API
      // const response = await fetch('/api/auth/refresh', {
      //   method: 'POST',
      //   headers: getAuthHeaders()
      // })
      // const data = await response.json()
      // if (data.token) {
      //   setToken(data.token)
      //   return true
      // }
      console.warn('Token refresh not implemented')
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      clearToken()
      return false
    }
  }

  return {
    // 状态
    token,
    isAuthenticated,

    // 方法
    setToken,
    clearToken,
    getAuthHeaders,
    getUserFromToken,
    refreshToken,
  }
}
