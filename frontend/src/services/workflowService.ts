import api from '@/api'

export interface WorkflowExecutionResult {
  [nodeId: string]: any
}

export interface WorkflowDeployResult {
  success: boolean
  error?: string
  deploymentUrl?: string
  [key: string]: any
}

/**
 * Execute a workflow by ID
 */
export async function executeWorkflow(
  workflowId: string,
  inputs: Record<string, any> = {}
): Promise<WorkflowExecutionResult> {
  console.log(`[workflowService] Executing workflow ${workflowId} with inputs:`, inputs)
  const response = await api.post(`/workflow/${workflowId}/run`, inputs)
  console.log(`[workflowService] Execution result:`, response.data)
  
  // 检查返回格式，如果是 API 响应格式，则返回 data 属性
  if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
    return response.data.data
  }
  
  return response.data
}

/**
 * Create a new workflow with normalized response format
 */
export async function createWorkflow(
  name: string,
  description?: string
): Promise<{ success: boolean; workflow?: { id: string }; error?: string }> {
  try {
    const response = await api.post('/workflow', {
      name,
      description,
      graphData: { nodes: [], edges: [] }
    })
    return {
      success: true,
      workflow: response.data
    }
  } catch (error: any) {
    console.error('[workflowService] Failed to create workflow:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to create workflow'
    }
  }
}

/**
 * Deploy a workflow with normalized response format
 */
export async function deployWorkflow(
  workflowId: string,
  options: {
    environment?: string
    version?: string
    apiEnabled?: boolean
    webhooks?: any[]
  }
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const response = await api.post(`/workflow/${workflowId}/deploy`, options)
    return {
      success: true,
      url: response.data.deploymentUrl || response.data.url
    }
  } catch (error: any) {
    console.error('[workflowService] Failed to deploy workflow:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to deploy workflow'
    }
  }
}

/**
 * Save/update a workflow with normalized response format
 */
export async function saveWorkflow(
  workflowId: string,
  data: {
    name?: string
    description?: string
    graphData: { nodes: any[]; edges: any[] }
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await api.put(`/workflow/${workflowId}`, data)
    return { success: true }
  } catch (error: any) {
    console.error('[workflowService] Failed to save workflow:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to save workflow'
    }
  }
}

/**
 * Get a workflow by ID
 */
export async function getWorkflow(workflowId: string): Promise<any> {
  const response = await api.get(`/workflow/${workflowId}`)
  return response.data
}

/**
 * Fetch a workflow by ID with normalized response format
 */
export async function fetchWorkflow(
  workflowId: string
): Promise<{ success: boolean; workflow?: any; error?: string }> {
  try {
    const response = await api.get(`/workflow/${workflowId}`)
    // Handle nested response format from ResponseUtil
    const workflow = response.data?.data || response.data
    return {
      success: true,
      workflow
    }
  } catch (error: any) {
    console.error('[workflowService] Failed to fetch workflow:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch workflow'
    }
  }
}

/**
 * List all workflows (alias for getAllWorkflows)
 */
export async function listWorkflows(params?: {
  page?: number
  limit?: number
  status?: string
}): Promise<any> {
  return getAllWorkflows(params)
}

/**
 * Get all workflows with normalized response format
 */
export async function getAllWorkflows(params: {
  page?: number
  limit?: number
  status?: string
} = {}): Promise<{ success: boolean; workflows?: any[]; error?: string }> {
  try {
    // 确保 params 是一个有效的对象
    const validParams = params || {}
    const response = await api.get('/workflow', { params: validParams })
    console.log('[workflowService] GET /workflow response:', response.data)
    console.log('[workflowService] response.data type:', typeof response.data, 'isArray:', Array.isArray(response.data))

    // Handle different response formats
    let workflowsArray: any[] = []
    if (Array.isArray(response.data)) {
      workflowsArray = response.data
    } else if (response.data && typeof response.data === 'object') {
      // If response is an object, check if it has a workflows property or data property
      if (Array.isArray(response.data.workflows)) {
        workflowsArray = response.data.workflows
      } else if (Array.isArray(response.data.data)) {
        workflowsArray = response.data.data
      } else if (response.data.data && Array.isArray(response.data.data.items)) {
        // Handle nested data.items format (ResponseUtil wraps result in data)
        workflowsArray = response.data.data.items
      } else if (Array.isArray(response.data.items)) {
        // Handle backend paginated response format
        workflowsArray = response.data.items
      }
    }

    return {
      success: true,
      workflows: workflowsArray
    }
  } catch (error: any) {
    console.error('[workflowService] Failed to get workflows:', error)
    return {
      success: false,
      workflows: [],
      error: error.response?.data?.message || error.message || 'Failed to get workflows'
    }
  }
}

/**
 * Delete a workflow with normalized response format
 */
export async function deleteWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await api.delete(`/workflow/${workflowId}`)
    return { success: true }
  } catch (error: any) {
    console.error('[workflowService] Failed to delete workflow:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to delete workflow'
    }
  }
}

// Terminal logs management
const terminalLogs: string[] = []

export function getTerminalLogs(): string[] {
  return terminalLogs
}

export function clearTerminalLogs(): void {
  terminalLogs.length = 0
}

export function addTerminalLog(log: any) {
  terminalLogs.push(log)
  console.log('[workflowService] Added terminal log:', log)
}

// Local workflow state management
let currentNodes: any[] = []
let currentEdges: any[] = []

export function loadWorkflow(nodes: any[], edges: any[]): void {
  currentNodes = nodes
  currentEdges = edges
  console.log('[workflowService] Workflow loaded:', nodes.length, 'nodes,', edges.length, 'edges')
}

export function getCurrentWorkflow(): { nodes: any[]; edges: any[] } {
  return { nodes: currentNodes, edges: currentEdges }
}

// Export as named export for compatibility
export const workflowService = {
  executeWorkflow,
  createWorkflow,
  deployWorkflow,
  saveWorkflow,
  getWorkflow,
  fetchWorkflow,
  listWorkflows,
  getAllWorkflows,
  deleteWorkflow,
  getTerminalLogs,
  clearTerminalLogs,
  addTerminalLog,
  loadWorkflow,
  getCurrentWorkflow
}

// Also export as default for backward compatibility
export default workflowService
