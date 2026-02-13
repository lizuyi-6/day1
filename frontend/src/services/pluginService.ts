import { get, post, put, del } from '@/utils/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface Plugin {
  id: string
  name: string
  description: string
  category: 'productivity' | 'integration' | 'data' | 'security'
  enabled: boolean
  config?: Record<string, unknown>
  packageName?: string
  version?: string
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePluginDto {
  name: string
  description: string
  category?: 'productivity' | 'integration' | 'data' | 'security'
  enabled?: boolean
  config?: Record<string, unknown>
  packageName?: string
  version?: string
}

export interface UpdatePluginDto {
  name?: string
  description?: string
  category?: 'productivity' | 'integration' | 'data' | 'security'
  enabled?: boolean
  config?: Record<string, unknown>
  packageName?: string
  version?: string
}

class PluginService {
  private baseUrl = `${API_BASE_URL}/plugins`

  async getAll(): Promise<Plugin[]> {
    const response = await get(this.baseUrl)
    return response.data
  }

  async getAvailable(): Promise<any[]> {
    const response = await get(`${this.baseUrl}/available`)
    return response.data
  }

  async getById(id: string): Promise<Plugin> {
    const response = await get(`${this.baseUrl}/${id}`)
    return response.data
  }

  async create(dto: CreatePluginDto): Promise<Plugin> {
    const response = await post(`${this.baseUrl}`, dto)
    return response.data
  }

  async update(id: string, dto: UpdatePluginDto): Promise<Plugin> {
    const response = await put(`${this.baseUrl}/${id}`, dto)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await del(`${this.baseUrl}/${id}`)
  }
}

export const pluginService = new PluginService()
