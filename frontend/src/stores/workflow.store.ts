import { defineStore } from 'pinia';
import { ref, shallowRef, computed } from 'vue';
import { io, Socket } from 'socket.io-client';

export interface Node {
  id: string;
  type: string;
  data: Record<string, any>;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionLog {
  nodeId: string;
  status: 'pending' | 'running' | 'success' | 'error';
  timestamp: number;
  message?: string;
  details?: any;
}

export const useWorkflowStore = defineStore('workflow', () => {
  // State
  const workflows = shallowRef<Workflow[]>([]);
  const currentWorkflow = shallowRef<Workflow | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Real-time execution state
  const executionLogs = ref<Record<string, ExecutionLog>>({});
  const nodeStatuses = ref<Record<string, string>>({});
  const socket = shallowRef<Socket | null>(null);
  const isConnected = ref(false);

  // Computed
  const workflowCount = computed(() => workflows.value.length);
  const hasCurrentWorkflow = computed(() => currentWorkflow.value !== null);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);

  // Actions
  function connectWebSocket(workflowId: string) {
    if (socket.value) {
      socket.value.disconnect();
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    socket.value = io(`${apiUrl}/workflow`, {
      transports: ['websocket'],
    });

    socket.value.on('connect', () => {
      console.log('✅ WebSocket connected');
      isConnected.value = true;
      socket.value?.emit('join-workflow', workflowId);
    });

    socket.value.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      isConnected.value = false;
    });

    socket.value.on('node-status', (data: { nodeId: string; status: string; timestamp: number; details?: any }) => {
      console.log('🔄 Node status update:', data);
      
      // Update node status
      nodeStatuses.value = {
        ...nodeStatuses.value,
        [data.nodeId]: data.status
      };

      // Update execution log
      const log: ExecutionLog = {
        nodeId: data.nodeId,
        status: data.status as any,
        timestamp: data.timestamp,
        details: data.details
      };
      
      executionLogs.value = {
        ...executionLogs.value,
        [data.nodeId]: log
      };
    });
  }

  function disconnectWebSocket() {
    if (socket.value) {
      if (currentWorkflow.value) {
        socket.value.emit('leave-workflow', currentWorkflow.value.id);
      }
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    }
  }

  function clearExecutionState() {
    executionLogs.value = {};
    nodeStatuses.value = {};
  }

  async function fetchWorkflows() {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch('/api/workflows');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      workflows.value = data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch workflows';
      console.error('Error fetching workflows:', e);
    } finally {
      loading.value = false;
    }
  }

  async function fetchWorkflow(id: string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/workflows/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      currentWorkflow.value = data;
      
      // Connect to WebSocket when workflow is loaded
      connectWebSocket(id);
      
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch workflow';
      console.error('Error fetching workflow:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function createWorkflow(workflow: Partial<Workflow>) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflow),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      workflows.value = [...workflows.value, data];
      currentWorkflow.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create workflow';
      console.error('Error creating workflow:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateWorkflow(id: string, updates: Partial<Workflow>) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update workflows list
      workflows.value = workflows.value.map((w) =>
        w.id === id ? data : w
      );

      // Update current workflow if it's the same one
      if (currentWorkflow.value?.id === id) {
        currentWorkflow.value = data;
      }

      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update workflow';
      console.error('Error updating workflow:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteWorkflow(id: string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove from workflows list
      workflows.value = workflows.value.filter((w) => w.id !== id);

      // Clear current workflow if it's the deleted one
      if (currentWorkflow.value?.id === id) {
        disconnectWebSocket();
        currentWorkflow.value = null;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete workflow';
      console.error('Error deleting workflow:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function saveWorkflowNodes(id: string, nodes: Node[], edges: Edge[]) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update current workflow if it's the same one
      if (currentWorkflow.value?.id === id) {
        currentWorkflow.value = data;
      }

      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save workflow';
      console.error('Error saving workflow:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function setCurrentWorkflow(workflow: Workflow | null) {
    if (currentWorkflow.value && (!workflow || workflow.id !== currentWorkflow.value.id)) {
      disconnectWebSocket();
    }
    
    currentWorkflow.value = workflow;
    
    if (workflow) {
      connectWebSocket(workflow.id);
    }
  }

  function clearError() {
    error.value = null;
  }

  function reset() {
    disconnectWebSocket();
    workflows.value = [];
    currentWorkflow.value = null;
    loading.value = false;
    error.value = null;
    clearExecutionState();
  }

  return {
    // State
    workflows,
    currentWorkflow,
    loading,
    error,
    executionLogs,
    nodeStatuses,
    isConnected,

    // Computed
    workflowCount,
    hasCurrentWorkflow,
    isLoading,
    hasError,

    // Actions
    fetchWorkflows,
    fetchWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    saveWorkflowNodes,
    setCurrentWorkflow,
    clearError,
    reset,
    clearExecutionState,
  };
});
