import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { GraphData, ExecutionContext, BaseNode } from '../nodes/node.interface';
import { NodeRegistry } from '../nodes/node-registry';
import { setNodeRegistry } from '../nodes/node.decorator';
import { StartNode } from '../nodes/start.node';
import { EndNode } from '../nodes/end.node';
import { DelayNode } from '../nodes/delay.node';
import { LlmNode } from '../nodes/llm.node';
import { WorkflowGateway } from '../workflow.gateway';

import { LRUCache } from 'lru-cache';

interface CheckpointData {
  nodeId: string;
  outputs: Record<string, Record<string, any>>;
  timestamp: number;
}

interface GraphStructure {
  adjacencyList: Map<string, string[]>;
  inDegree: Map<string, number>;
  nodeMap: Map<string, any>;
}

@Injectable()
export class WorkflowRunner {
  private readonly logger = new Logger(WorkflowRunner.name);
  private nodeRegistry: NodeRegistry;
  private nodes: BaseNode[] = [];
  private moduleRef: ModuleRef | null = null;
  private workflowGateway: WorkflowGateway | null = null;

  private checkpoints = new Map<string, CheckpointData>();

  private graphCache = new LRUCache<string, GraphStructure>({
    max: 100,
    ttl: 1000 * 60 * 5, // 5分钟过期
  });

  constructor() {
    // Create NodeRegistry instance
    this.nodeRegistry = new NodeRegistry();

    // Set for the decorator to use
    setNodeRegistry(this.nodeRegistry);

    // Register default nodes
    this.registerDefaultNodes();
  }

  setModuleRef(moduleRef: ModuleRef) {
    this.moduleRef = moduleRef;
    this.initializeDefaultNodes();
    try {
      this.workflowGateway = this.moduleRef.get(WorkflowGateway, { strict: false });
    } catch (e) {
      this.logger.warn('WorkflowGateway not found, real-time updates disabled');
    }
  }

  private registerDefaultNodes() {
    // Note: Nodes with dependencies will be registered externally via registerNode()
    this.logger.log('Node registry initialized');
  }

  private async initializeDefaultNodes() {
    if (!this.moduleRef) {
      this.logger.warn('ModuleRef not set, cannot initialize nodes');
      return;
    }

    const startNode = await this.moduleRef.resolve(StartNode);
    const endNode = await this.moduleRef.resolve(EndNode);
    const delayNode = await this.moduleRef.resolve(DelayNode);
    const llmNode = await this.moduleRef.resolve(LlmNode);

    this.registerNode(startNode);
    this.registerNode(endNode);
    this.registerNode(delayNode);
    this.registerNode(llmNode);

    this.logger.log(
      'Node registry initialized with types: ' +
        this.nodeRegistry.getAllNodeTypes().join(', '),
    );
  }

  registerNode(node: BaseNode) {
    this.nodeRegistry.registerNodeInstance(node);
    this.nodes.push(node);
    this.logger.log(`Node registered: ${node.type}`);
  }

  initializeNodes(nodes: BaseNode[]) {
    for (const node of nodes) {
      this.registerNode(node);
    }
    this.logger.log(
      'Node registry initialized with types: ' +
        this.nodeRegistry.getAllNodeTypes().join(', '),
    );
  }

  async execute(graph: GraphData, initialInputs: Record<string, any> = {}, workflowId?: string) {
    this.logger.log('Starting workflow execution');

    // Detect cycles before execution
    if (this.detectCycle(graph)) {
      throw new Error('Workflow graph contains a cycle');
    }

    const timeout = 30000; // 30秒超时
    const maxSteps = parseInt(process.env.MAX_WORKFLOW_STEPS || '100');

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Workflow execution timeout')),
        timeout,
      ),
    );

    try {
      return await Promise.race([
        this.executeInternal(graph, initialInputs, maxSteps, workflowId),
        timeoutPromise,
      ]);
    } catch (error) {
      if (error.message === 'Workflow execution timeout') {
        throw new Error(`Workflow execution exceeded ${timeout}ms`);
      }
      throw error;
    }
  }

  private async executeInternal(
    graph: GraphData,
    initialInputs: Record<string, any>,
    maxSteps: number,
    externalWorkflowId?: string
  ): Promise<Record<string, any>> {
    const graphKey = JSON.stringify(graph);
    let graphStructure = this.graphCache.get(graphKey);

    if (!graphStructure) {
      graphStructure = this.buildGraphStructure(graph);
      this.graphCache.set(graphKey, graphStructure);
    }

    const workflowId = externalWorkflowId || `wf-${Date.now()}`;
    const context: ExecutionContext = {
      nodeId: 'workflow-root',
      nodeOutputs: {},
      variables: {},
      workflowId: workflowId,
    };

    const { adjacencyList, inDegree, nodeMap } = graphStructure;
    const ready: string[] = [];

    // Find initial nodes (no incoming edges)
    for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0) {
        ready.push(nodeId);
      }
    }

    let steps = 0;
    const executed = new Set<string>();

    while (ready.length > 0 && steps < maxSteps) {
      const currentNodeId = ready.shift()!;

      if (executed.has(currentNodeId)) {
        continue;
      }

      const nodeData = nodeMap.get(currentNodeId);
      if (!nodeData) {
        this.logger.warn(`Node ${currentNodeId} not found in graph`);
        continue;
      }

      const nodeInstance = this.nodeRegistry.getNode(nodeData.type);
      if (!nodeInstance) {
        this.logger.error(`Unknown node type: ${nodeData.type}`);
        continue;
      }

      // Gather inputs from predecessors
      const inputs: Record<string, any> = { ...initialInputs };

      // Collect data from predecessor nodes via edges
      const incomingEdges = graph.edges.filter(
        (e) => e.target === currentNodeId,
      );
      for (const edge of incomingEdges) {
        const predecessorOutput = context.nodeOutputs[edge.source];
        if (predecessorOutput) {
          const sourceHandle = edge.sourceHandle || 'output';
          const targetHandle = edge.targetHandle || 'input';

          if (predecessorOutput[sourceHandle] !== undefined) {
            inputs[targetHandle] = predecessorOutput[sourceHandle];
          } else if (Object.keys(predecessorOutput).length === 1) {
            // If there's only one output, use it for the default input
            const singleOutputKey = Object.keys(predecessorOutput)[0];
            inputs[targetHandle] = predecessorOutput[singleOutputKey];
          } else {
            // Merge all outputs if no specific handle
            Object.assign(inputs, predecessorOutput);
          }
        }
      }

      try {
        // Set context variables to node data for node to access its configuration
        context.variables = nodeData.data || {};
        context.nodeId = currentNodeId;

        // Emit node running event
        if (this.workflowGateway && externalWorkflowId) {
            this.workflowGateway.emitNodeStatus(externalWorkflowId, currentNodeId, 'running');
        }

        const outputs = await this.executeNodeWithRetry(
          nodeInstance,
          inputs,
          context,
        );

        context.nodeOutputs[currentNodeId] = outputs;
        executed.add(currentNodeId);

        // Emit node success event
        if (this.workflowGateway && externalWorkflowId) {
            this.workflowGateway.emitNodeStatus(externalWorkflowId, currentNodeId, 'success', { outputs });
        }

        // Save checkpoint
        await this.saveCheckpoint(context, currentNodeId);

        // Update ready queue with successors
        const successors = adjacencyList.get(currentNodeId) || [];
        for (const successor of successors) {
          const newDegree = (inDegree.get(successor) || 0) - 1;
          inDegree.set(successor, newDegree);

          if (newDegree === 0) {
            ready.push(successor);
          }
        }
      } catch (error) {
        this.logger.error(
          `Error executing node ${currentNodeId}: ${error.message}`,
        );
        // Emit node error event
        if (this.workflowGateway && externalWorkflowId) {
            this.workflowGateway.emitNodeStatus(externalWorkflowId, currentNodeId, 'error', { error: error.message });
        }
        throw error;
      }

      steps++;
    }

    if (steps >= maxSteps) {
      throw new Error(`Workflow exceeded maximum steps (${maxSteps})`);
    }

    return context.nodeOutputs;
  }

  async debugNode(
    node: any,
    inputs: Record<string, any>,
    graph: GraphData,
  ): Promise<Record<string, any>> {
    this.logger.log(`Debugging node: ${node.id} (${node.type})`);

    const context: ExecutionContext = {
      workflowId: 'debug-session',
      nodeId: node.id,
      nodeOutputs: {},
      variables: inputs,
    };

    const nodeInstance = this.nodeRegistry.getNode(node.type);
    if (!nodeInstance) {
      throw new Error(`Unknown node type: ${node.type}`);
    }

    try {
      const outputs = await this.executeNodeWithRetry(
        nodeInstance,
        inputs,
        context,
        1, // Single attempt for debugging
      );

      return {
        success: true,
        inputs,
        outputs,
        executionTime: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        inputs,
        error: error.message,
        executionTime: Date.now(),
      };
    }
  }

  private async executeNodeWithRetry(
    nodeInstance: BaseNode,
    inputs: Record<string, any>,
    context: ExecutionContext,
    maxRetries = 3,
  ): Promise<Record<string, any>> {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await nodeInstance.execute(inputs, context);
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Node execution attempt ${attempt} failed: ${error.message}`,
        );

        if (attempt < maxRetries) {
          await this.delay(1000 * attempt);
        }
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private buildGraphStructure(graph: GraphData): GraphStructure {
    const adjacencyList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));

    graph.nodes.forEach((node) => {
      adjacencyList.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    graph.edges.forEach((edge) => {
      const list = adjacencyList.get(edge.source);
      if (list) {
        list.push(edge.target);
      }
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    return { adjacencyList, inDegree, nodeMap };
  }

  private detectCycle(graph: GraphData): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const getNeighbors = (nodeId: string): string[] => {
      return graph.edges
        .filter((e) => e.source === nodeId)
        .map((e) => e.target);
    };

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = getNeighbors(nodeId);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) return true;
      }
    }

    return false;
  }

  private async saveCheckpoint(context: ExecutionContext, nodeId: string) {
    const checkpoint: CheckpointData = {
      nodeId,
      outputs: context.nodeOutputs,
      timestamp: Date.now(),
    };

    this.checkpoints.set(`${context.workflowId}:${nodeId}`, checkpoint);

    // TODO: Implement persistent storage (Redis/Database)
    // For now, keep in memory with automatic expiration
  }

  private async loadCheckpoint(
    workflowId: string,
    nodeId: string,
  ): Promise<CheckpointData | null> {
    return this.checkpoints.get(`${workflowId}:${nodeId}`) || null;
  }
}
