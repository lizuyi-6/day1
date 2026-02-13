import { get, post, put } from '@/utils/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface ModelConfig {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'azure' | 'custom'
  apiKey: string
  baseUrl?: string
  model: string
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateModelDto {
  name: string
  provider?: 'openai' | 'anthropic' | 'azure' | 'custom'
  model: string
  apiKey?: string
  baseUrl?: string
}

export interface UpdateModelDto {
  name?: string
  provider?: 'openai' | 'anthropic' | 'azure' | 'custom'
  model?: string
  apiKey?: string
  baseUrl?: string
}

export interface TestResult {
  success: boolean
  message: string
  status: 'connected' | 'error'
}

class ModelService {
  private baseUrl = `${API_BASE_URL}/models`

  async getAll(): Promise<ModelConfig[]> {
    const response = await get(this.baseUrl)
    return response.data
  }

  async getById(id: string): Promise<ModelConfig> {
    const response = await get(`${this.baseUrl}/${id}`)
    return response.data
  }

  async create(dto: CreateModelDto): Promise<ModelConfig> {
    const response = await post(`${this.baseUrl}`, dto)
    return response.data
  }

  async update(id: string, dto: UpdateModelDto): Promise<ModelConfig> {
    const response = await put(`${this.baseUrl}/${id}`, dto)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await del(`${this.baseUrl}/${id}`)
  }

  async testConnection(id: string): Promise<TestResult> {
    const response = await post(`${this.baseUrl}/${id}/test`)
    return response.data
  }
}

export const modelService = new ModelService()
