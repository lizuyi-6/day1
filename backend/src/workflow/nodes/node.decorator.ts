import { BaseNode } from './node.interface';
import { NodeRegistry } from './node-registry';

// 单例模式的节点注册表实例
let nodeRegistryInstance: NodeRegistry | null = null;

export function setNodeRegistry(registry: NodeRegistry) {
  nodeRegistryInstance = registry;
}

export function getNodeRegistry(): NodeRegistry | null {
  return nodeRegistryInstance;
}

/**
 * 节点注册装饰器
 * 自动将节点类注册到节点注册表中
 */
export function RegisterNode() {
  return function (target: any) {
    // 确保节点注册表实例可用
    if (!nodeRegistryInstance) {
      console.warn(
        `NodeRegistry not initialized. Cannot register node: ${target.name}`,
      );
      return;
    }

    try {
      nodeRegistryInstance.registerNode(target);
      console.log(`Node registered: ${target.name}`);
    } catch (error) {
      console.error(`Failed to register node ${target.name}:`, error.message);
    }
  };
}
