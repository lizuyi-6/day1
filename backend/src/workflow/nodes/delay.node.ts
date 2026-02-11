import { BaseNode, ExecutionContext } from './node.interface';
import { RegisterNode } from './node.decorator';
import { Logger } from '@nestjs/common';

/**
 * DelayNode - Adds a configurable delay in workflow execution
 * Useful for pacing workflows or waiting for external conditions
 */
@RegisterNode()
export class DelayNode extends BaseNode {
  private readonly logger = new Logger(DelayNode.name);

  type = 'delay';
  label = 'Delay';
  category = 'tools';

  async execute(
    inputs: Record<string, any>,
    context: ExecutionContext,
  ): Promise<Record<string, any>> {
    // Get delay duration from node config or use default
    const nodeData = context.variables as any;
    const configuredDelay = nodeData?.delay || nodeData?.duration || 5000;
    const durationMs = typeof configuredDelay === 'string'
      ? parseInt(configuredDelay)
      : configuredDelay;

    this.logger.log(`Delaying execution for ${durationMs}ms`);

    // Real delay implementation
    await this.delay(durationMs);

    this.logger.log(`Delay completed, passing through ${Object.keys(inputs).length} input(s)`);

    // Pass through all inputs unchanged - delay node should be transparent
    // Remove internal 'duration' field if it exists in inputs
    const { duration, ...passthroughInputs } = inputs;

    return {
      ...passthroughInputs,
      // Optional: Add metadata about the delay (with a different key to avoid conflicts)
      _delayed: true,
      _delayDuration: durationMs,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
