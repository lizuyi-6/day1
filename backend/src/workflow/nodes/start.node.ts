import { BaseNode, ExecutionContext } from './node.interface';
import { Injectable } from '@nestjs/common';
import { RegisterNode } from './node.decorator';

@Injectable()
@RegisterNode()
export class StartNode extends BaseNode {
  type = 'start';

  async execute(inputs: Record<string, any>, context: ExecutionContext) {
    console.log('StartNode executing', inputs);
    console.log('StartNode node data:', context.variables);

    const outputs: Record<string, any> = {};

    if (context.variables && context.variables.outputs) {
      for (const output of context.variables.outputs) {
        outputs[output.name] = inputs[output.name] || output.defaultValue || '';
      }
    } else {
      Object.assign(outputs, inputs);
    }

    console.log('StartNode outputs:', outputs);
    return outputs;
  }
}
