import axios from 'axios'
import { getBrowserId } from '@/utils/cookie'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important: Send cookies for authentication
})

// Request interceptor to add browser ID
api.interceptors.request.use(
  (config) => {
    const browserId = getBrowserId()
    if (browserId && !config.headers['X-Browser-Id']) {
      config.headers['X-Browser-Id'] = browserId
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api
