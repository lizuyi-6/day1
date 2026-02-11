import { Injectable } from '@nestjs/common';
import { BaseNode } from './node.interface';

export interface NodeConstructor {
  new (): BaseNode;
}

@Injectable()
export class NodeRegistry {
  private registry = new Map<string, NodeConstructor>();
  private nodeInstances = new Map<string, BaseNode>();

  registerNode(NodeClass: NodeConstructor) {
    const instance = new NodeClass();
    this.registry.set(instance.type, NodeClass);
    this.nodeInstances.set(instance.type, instance);
  }

  registerNodeInstance(instance: BaseNode) {
    this.registry.set(instance.type, { new: () => instance } as unknown as NodeConstructor);
    this.nodeInstances.set(instance.type, instance);
  }

  getNode(type: string): BaseNode | undefined {
    const NodeClass = this.registry.get(type);
    if (this.nodeInstances.has(type)) {
      return this.nodeInstances.get(type);
    }
    return NodeClass ? new NodeClass() : undefined;
  }

  getAllNodeTypes(): string[] {
    return Array.from(this.registry.keys());
  }

  hasNode(type: string): boolean {
    return this.registry.has(type);
  }
}
