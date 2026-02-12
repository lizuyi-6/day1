import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface ExecutionHistory {
  id: string
  workflowId: string
  status: 'running' | 'success' | 'error' | 'cancelled'
  duration: number
  nodeCount: number
  logs?: any[]
  result?: string
  error?: string
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateExecutionHistoryDto {
  workflowId: string
  status?: 'running' | 'success' | 'error' | 'cancelled'
  duration: number
  nodeCount: number
  logs?: any[]
  result?: string
  error?: string
}

export interface UpdateExecutionHistoryDto {
  status?: 'running' | 'success' | 'error' | 'cancelled'
  duration?: number
  nodeCount?: number
  logs?: any[]
  result?: string
  error?: string
}

class ExecutionHistoryService {
  private baseUrl = `${API_BASE_URL}/execution-history`

  async getAll(workflowId?: string): Promise<ExecutionHistory[]> {
    const params = workflowId ? { workflowId } : {}
    const response = await axios.get(this.baseUrl, { params })
    return response.data.data
  }

  async getById(id: string): Promise<ExecutionHistory> {
    const response = await axios.get(`${this.baseUrl}/${id}`)
    return response.data.data
  }

  async create(dto: CreateExecutionHistoryDto): Promise<ExecutionHistory> {
    const response = await axios.post(this.baseUrl, dto)
    return response.data.data
  }

  async update(id: string, dto: UpdateExecutionHistoryDto): Promise<ExecutionHistory> {
    const response = await axios.put(`${this.baseUrl}/${id}`, dto)
    return response.data.data
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`)
  }

  async clear(workflowId?: string): Promise<void> {
    const params = workflowId ? { workflowId } : {}
    await axios.delete(`${this.baseUrl}/clear`, { params })
  }
}

export const executionHistoryService = new ExecutionHistoryService()
