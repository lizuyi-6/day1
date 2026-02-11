import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

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
  type?: 'string' | 'number' | 'boolean' | 'json' | 'array'
  value?: string
  isSecret?: boolean
  description?: string
}

export interface UpdateVariableDto {
  name?: string
  type?: 'string' | 'number' | 'boolean' | 'json' | 'array'
  value?: string
  isSecret?: boolean
  description?: string
}

class VariableService {
  private baseUrl = `${API_BASE_URL}/variables`

  async getAll(): Promise<Variable[]> {
    const response = await axios.get(this.baseUrl)
    return response.data.data
  }

  async getById(id: string): Promise<Variable> {
    const response = await axios.get(`${this.baseUrl}/${id}`)
    return response.data.data
  }

  async getByName(name: string): Promise<Variable | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/by-name/${name}`)
      return response.data.data
    } catch {
      return null
    }
  }

  async getBatch(names: string[]): Promise<Record<string, any>> {
    const response = await axios.post(`${this.baseUrl}/batch`, { names })
    return response.data.data
  }

  async create(dto: CreateVariableDto): Promise<Variable> {
    const response = await axios.post(this.baseUrl, dto)
    return response.data.data
  }

  async update(id: string, dto: UpdateVariableDto): Promise<Variable> {
    const response = await axios.put(`${this.baseUrl}/${id}`, dto)
    return response.data.data
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`)
  }
}

export const variableService = new VariableService()
