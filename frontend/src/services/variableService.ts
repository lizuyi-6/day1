import { get, post, put, del } from '@/utils/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface Variable {
  id: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'json' | 'array'
  value: string
  description: string
  isSecret: boolean
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateVariableDto {
  name: string
  type: 'string' | 'number' | 'boolean' | 'json' | 'array'
  value: string
  description?: string
  isSecret?: boolean
}

export interface UpdateVariableDto {
  name?: string
  type?: 'string' | 'number' | 'boolean' | 'json' | 'array'
  value?: string
  description?: string
  isSecret?: boolean
}

class VariableService {
  private baseUrl = `${API_BASE_URL}/variables`

  async getAll(): Promise<Variable[]> {
    const response = await get(this.baseUrl)
    return response.data
  }

  async getById(id: string): Promise<Variable> {
    const response = await get(`${this.baseUrl}/${id}`)
    return response.data
  }

  async getByName(name: string): Promise<Variable | null> {
    const response = await get(`${this.baseUrl}/by-name/${name}`)
    return response.data
  }

  async getBatch(names: string[]): Promise<Record<string, any>> {
    const response = await post(`${this.baseUrl}/batch`, { names })
    return response.data
  }

  async create(dto: CreateVariableDto): Promise<Variable> {
    const response = await post(`${this.baseUrl}`, dto)
    return response.data
  }

  async update(id: string, dto: UpdateVariableDto): Promise<Variable> {
    const response = await put(`${this.baseUrl}/${id}`, dto)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await del(`${this.baseUrl}/${id}`)
  }
}

export const variableService = new VariableService()
