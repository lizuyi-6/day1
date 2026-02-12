import { BaseNode, ExecutionContext } from './node.interface';
import { Injectable, Logger } from '@nestjs/common';
import { RegisterNode } from './node.decorator';

@Injectable()
@RegisterNode()
export class StartNode extends BaseNode {
  private readonly logger = new Logger(StartNode.name);
  type = 'start';

  async execute(inputs: Record<string, any>, context: ExecutionContext) {
    this.logger.log('StartNode executing with inputs: ' + JSON.stringify(inputs));
    this.logger.log('StartNode node data: ' + JSON.stringify(context.variables));

    const outputs: Record<string, any> = {};

    // 如果定义了输出变量，按定义输出
    if (context.variables && context.variables.outputs) {
      for (const output of context.variables.outputs) {
        // 优先使用用户输入，其次使用默认值
        outputs[output.name] = inputs[output.name] ?? output.defaultValue ?? '';
        this.logger.log(`Output "${output.name}": ${outputs[output.name]}`);
      }
    } else {
      // 如果没有定义输出变量，将所有输入传递出去
      Object.assign(outputs, inputs);
    }

    // 如果没有任何输出但有输入，创建默认的 prompt 输出
    if (Object.keys(outputs).length === 0 && Object.keys(inputs).length > 0) {
      outputs.prompt = inputs.input || inputs.prompt || inputs.message || inputs.query || '';
    }

    // 如果仍然没有输出，创建一个默认的 prompt
    if (Object.keys(outputs).length === 0) {
      outputs.prompt = '';
    }

    this.logger.log('StartNode final outputs: ' + JSON.stringify(outputs));
    return outputs;
  }
}
