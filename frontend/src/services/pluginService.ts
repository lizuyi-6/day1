import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export interface Plugin {
  id: string
  name: string
  description: string
  category: 'productivity' | 'integration' | 'data' | 'utility' | 'security'
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
  category?: 'productivity' | 'integration' | 'data' | 'utility' | 'security'
  packageName?: string
  version?: string
}

export interface UpdatePluginDto {
  name?: string
  description?: string
  category?: 'productivity' | 'integration' | 'data' | 'utility' | 'security'
  enabled?: boolean
  config?: Record<string, unknown>
}

class PluginService {
  private baseUrl = `${API_BASE_URL}/plugins`

  async getAll(): Promise<Plugin[]> {
    const response = await axios.get(this.baseUrl)
    return response.data.data
  }

  async getAvailable(): Promise<any[]> {
    const response = await axios.get(`${this.baseUrl}/available`)
    return response.data.data
  }

  async getById(id: string): Promise<Plugin> {
    const response = await axios.get(`${this.baseUrl}/${id}`)
    return response.data.data
  }

  async create(dto: CreatePluginDto): Promise<Plugin> {
    const response = await axios.post(this.baseUrl, dto)
    return response.data.data
  }

  async update(id: string, dto: UpdatePluginDto): Promise<Plugin> {
    const response = await axios.put(`${this.baseUrl}/${id}`, dto)
    return response.data.data
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`)
  }
}

export const pluginService = new PluginService()
