export interface NodeData {
  [key: string]: any;
}

export interface NodeInput {
  name: string;
  value: any;
}

export interface NodeOutput {
  name: string;
  value: any;
}

export interface WorkflowNode {
  id: string;
  type: string;
  data: NodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface GraphData {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ExecutionContext {
  workflowId: string;
  nodeId?: string;
  variables: Record<string, any>;
  nodeOutputs: Record<string, Record<string, any>>; // nodeId -> { outputName: value }
}

export abstract class BaseNode {
  abstract type: string;

  abstract execute(
    inputs: Record<string, any>,
    context: ExecutionContext,
  ): Promise<Record<string, any>>;
}
