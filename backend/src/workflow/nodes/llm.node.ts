import { BaseNode, ExecutionContext } from './node.interface';
import { Injectable, Logger } from '@nestjs/common';
import { RegisterNode } from './node.decorator';
import axios from 'axios';

interface LlmNodeData {
  modelId?: string;
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  provider?: string;
  welcomeMessage?: string;  // 欢迎语配置
}

interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LlmResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
@RegisterNode()
export class LlmNode extends BaseNode {
  private readonly logger = new Logger(LlmNode.name);
  type = 'llm';
  label = 'LLM';
  category = 'ai';

  async execute(inputs: Record<string, any>, context: ExecutionContext) {
    const nodeData = context.variables as any;
    const data = nodeData as LlmNodeData;

    // Demo Override: Force all LLM nodes to use Qwen
    const apiKey = 'sk-9dd62d22ea0b439eb96f6800d6c7749a';
    const baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    const model = 'qwen-flash';
    const provider = 'qwen';

    // const apiKey = inputs.apiKey || data.apiKey;
    // const baseUrl = inputs.baseUrl || data.baseUrl;
    // const model = inputs.model || data.model;
    // const provider = inputs.provider || data.provider || 'openai';

    // 尝试从多个来源获取 prompt
    let prompt = inputs.prompt || inputs.message || data.prompt || '';

    // 如果没有明确的 prompt，尝试从其他输入中获取
    if (!prompt) {
      const inputKeys = Object.keys(inputs).filter(k => !['apiKey', 'baseUrl', 'model', 'provider', 'temperature', 'maxTokens', 'systemPrompt'].includes(k));
      if (inputKeys.length > 0) {
        // 优先查找包含 prompt/message/query/question 的键
        const promptKey = inputKeys.find(k => 
          k.toLowerCase().includes('prompt') || 
          k.toLowerCase().includes('message') ||
          k.toLowerCase().includes('query') ||
          k.toLowerCase().includes('question') ||
          k.toLowerCase().includes('input')
        );
        if (promptKey) {
          prompt = String(inputs[promptKey]);
        } else {
          // 使用第一个非配置输入作为 prompt
          prompt = String(inputs[inputKeys[0]]);
        }
      }
    }

    // 如果仍然没有 prompt，使用默认提示或欢迎消息
    if (!prompt) {
      prompt = data.welcomeMessage || '你好，请问有什么可以帮助你的？';
      this.logger.log(`No prompt provided, using default: ${prompt}`);
    }

    if (!apiKey) {
      throw new Error('LLM node requires an apiKey. Please configure it in the node inspector: { "apiKey": "your-api-key" }');
    }

    if (!model) {
      throw new Error('LLM node requires a model name. Please configure it in the node inspector: { "model": "gpt-4" }');
    }

    const messages: LlmMessage[] = [];

    if (data.systemPrompt) {
      messages.push({ role: 'system', content: data.systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    try {
      const response = await this.callLlmApi(
        provider,
        baseUrl,
        apiKey,
        model,
        messages,
        {
          temperature: data.temperature ?? 0.7,
          max_tokens: data.maxTokens ?? 2048,
        },
      );

      const textContent = response.choices[0]?.message?.content || '';

      this.logger.log(`LLM node executed successfully: ${textContent.substring(0, 50)}...`);
      this.logger.log(`LLM node output: ${JSON.stringify({
        response: textContent,
        prompt,
        model,
        usage: response.usage
      })}`);

      // Return simplified output with clear text field
      return {
        result: textContent,              // Primary text output for easy extraction
        text: textContent,                // Alternative text field
        response: textContent,            // LLM response content
        output_1: textContent,            // Compatibility field
        // Optional metadata
        prompt,
        model,
        provider,
        usage: response.usage,
        messages,
      };
    } catch (error: any) {
      this.logger.error(`LLM node execution failed: ${error.message}`);
      throw new Error(`LLM API call failed: ${error.message}`);
    }
  }

  private async callLlmApi(
    provider: string,
    baseUrl: string | null,
    apiKey: string,
    model: string,
    messages: LlmMessage[],
    options: { temperature: number; max_tokens: number },
  ): Promise<LlmResponse> {
    const url = baseUrl || this.getDefaultBaseUrl(provider);

    this.logger.log(`Calling LLM API: ${url}/chat/completions`);
    this.logger.log(`Using model: ${model}, provider: ${provider}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (provider === 'qwen' || provider === 'custom') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    try {
      const response = await axios.post(
        `${url}/chat/completions`,
        {
          model,
          messages,
          temperature: options.temperature,
          max_tokens: options.max_tokens,
        },
        {
          headers,
          timeout: 60000,
        },
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          throw new Error(`API 认证失败 (401): 请检查 API 密钥是否正确。密钥前5位: ${apiKey.substring(0, 5)}***`);
        } else if (status === 404) {
          throw new Error(`API 地址不存在 (404): 请检查 API 地址是否正确: ${url}`);
        } else if (status === 400) {
          throw new Error(`API 请求错误 (400): ${data?.error?.message || data?.message || JSON.stringify(data)}`);
        } else if (status === 429) {
          throw new Error(`API 请求频率超限 (429): 请稍后重试`);
        } else {
          throw new Error(`API 调用失败 (${status}): ${data?.error?.message || data?.message || '未知错误'}`);
        }
      } else if (error.request) {
        throw new Error(`无法连接到 API 服务器: ${url}. 请检查网络连接`);
      } else {
        throw new Error(`API 调用失败: ${error.message}`);
      }
    }
  }

  private getDefaultBaseUrl(provider: string): string {
    const baseUrlMap: Record<string, string> = {
      openai: 'https://api.openai.com/v1',
      anthropic: 'https://api.anthropic.com/v1',
      azure: 'https://api.openai.azure.com',
      qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      custom: 'https://api.openai.com/v1',
    };
    return baseUrlMap[provider.toLowerCase()] || 'https://api.openai.com/v1';
  }
}
