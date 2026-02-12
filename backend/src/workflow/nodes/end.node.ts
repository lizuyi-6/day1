import { BaseNode, ExecutionContext } from './node.interface';
import { Injectable } from '@nestjs/common';
import { RegisterNode } from './node.decorator';

@Injectable()
@RegisterNode()
export class EndNode extends BaseNode {
  type = 'end';

  async execute(inputs: Record<string, any>, context: ExecutionContext) {
    console.log('EndNode executing', JSON.stringify(inputs));
    console.log('EndNode node data:', JSON.stringify(context.variables));

    const outputs: Record<string, any> = {};

    // 调试：打印完整的上下文变量结构
    if (context.variables) {
      console.log('context.variables keys:', Object.keys(context.variables));
      if (context.variables.inputs) {
        console.log('context.variables.inputs:', JSON.stringify(context.variables.inputs));
        if (Array.isArray(context.variables.inputs)) {
          context.variables.inputs.forEach((input, index) => {
            console.log(`Input ${index}:`, JSON.stringify(input));
          });
        } else {
          console.log('context.variables.inputs is not array:', typeof context.variables.inputs);
        }
      }
    }

    if (context.variables && context.variables.inputs && Array.isArray(context.variables.inputs)) {
      for (const input of context.variables.inputs) {
        // Check if there's a sourceVariableName mapping (e.g., output_1 -> input_1)
        const sourceName = input.sourceVariableName || input.name;
        
        console.log(`Looking for input: sourceName=${sourceName}, input.name=${input.name}`);
        
        // Try to get value from inputs using sourceVariableName first, then input name
        let value = inputs[sourceName];
        if (value === undefined) {
          value = inputs[input.name];
        }
        if (value === undefined) {
          value = input.defaultValue || '';
        }
        
        console.log(`Found value: ${JSON.stringify(value)}`);
        outputs[input.name] = value;
        console.log(`EndNode mapping: ${sourceName} -> ${input.name} = ${JSON.stringify(value).substring(0, 100)}...`);
      }
    } else {
      // If no specific inputs are configured, use all available inputs
      Object.assign(outputs, inputs);
    }

    const cleanOutputs: Record<string, any> = {};
    for (const [key, value] of Object.entries(outputs)) {
      if (!key.startsWith('_')) {
        cleanOutputs[key] = value;
      }
    }

    // 特殊处理：如果没有找到 result 或 output_1，检查是否有其他输出字段
    if (!cleanOutputs['result']) {
      // 检查是否有 output_1，result，或 response 字段
      const mainOutputKey = Object.keys(cleanOutputs).find(
        k => k === 'output_1' || k === 'result' || k === 'response'
      );
      
      if (mainOutputKey) {
        cleanOutputs['result'] = cleanOutputs[mainOutputKey];
      } else if (Object.keys(cleanOutputs).length > 0) {
        // 如果没有明确的字段，使用第一个值
        cleanOutputs['result'] = Object.values(cleanOutputs)[0];
      } else {
        // 作为最后的备用，返回 "执行成功" 以确保有内容
        cleanOutputs['result'] = '执行成功，但未返回内容';
      }
    }

    // Debug: log the final outputs
    console.log('EndNode final outputs:', JSON.stringify(cleanOutputs));
    
    // 临时调试：如果 result 还是输入值，检查是否有 LLM 的输出
    if (cleanOutputs['result'] === context.variables?.inputs?.[0]?.defaultValue) {
      console.warn('EndNode result matches default value, might be a mapping issue');
    }

    return cleanOutputs;
  }
}
