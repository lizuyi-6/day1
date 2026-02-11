import { BaseNode, ExecutionContext } from './node.interface';
import { Injectable } from '@nestjs/common';
import { RegisterNode } from './node.decorator';

@Injectable()
@RegisterNode()
export class EndNode extends BaseNode {
  type = 'end';

  async execute(inputs: Record<string, any>, context: ExecutionContext) {
    console.log('EndNode executing', inputs);
    console.log('EndNode node data:', context.variables);

    const outputs: Record<string, any> = {};

    if (context.variables && context.variables.inputs) {
      for (const input of context.variables.inputs) {
        if (inputs[input.name] !== undefined) {
          outputs[input.name] = input.defaultValue || '';
        } else {
          outputs[input.name] = inputs[input.name];
        }
      }
    } else {
      Object.assign(outputs, inputs);
    }

    const cleanOutputs: Record<string, any> = {};
    for (const [key, value] of Object.entries(outputs)) {
      if (!key.startsWith('_')) {
        cleanOutputs[key] = value;
      }
    }

    console.log('EndNode outputs:', cleanOutputs);
    return cleanOutputs;
  }
}
