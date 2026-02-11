import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './entities/workflow.entity';

@Injectable()
export class WorkflowSeedService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowSeedService.name);

  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
  ) {}

  async onModuleInit() {
    await this.seedExampleWorkflow();
  }

  private async seedExampleWorkflow() {
    const exampleWorkflowName = '示例工作流 - AI智能助手';
    
    // Check if the workflow already exists
    const existingWorkflow = await this.workflowRepository.findOneBy({ name: exampleWorkflowName });
    
    if (existingWorkflow) {
      this.logger.log('Example workflow already exists, skipping seed.');
      return;
    }

    this.logger.log('Seeding example workflow...');

    const graphData = {
      nodes: [
        {
          id: 'start-node',
          type: 'start',
          position: { x: 100, y: 150 },
          data: {
            label: '开始',
            inputs: [
                { id: 'userInput', name: '用户输入', type: 'string', value: '请介绍一下你自己' }
            ]
          }
        },
        {
          id: 'llm-node',
          type: 'llm',
          position: { x: 450, y: 150 },
          data: {
            label: 'AI 回答',
            provider: 'qwen',
            apiKey: 'sk-9dd62d22ea0b439eb96f6800d6c7749a', // Using the known working key
            model: 'qwen-flash',
            baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            temperature: 0.7,
            maxTokens: 4096,
            systemPrompt: '你是一个乐于助人的AI助手。',
            userPrompt: '{{userInput}}'
          }
        },
        {
          id: 'end-node',
          type: 'end',
          position: { x: 800, y: 150 },
          data: {
            label: '结束',
            outputs: [
                { id: 'result', name: '最终结果', type: 'string' }
            ]
          }
        }
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'start-node',
          target: 'llm-node',
          sourceHandle: 'output',
          targetHandle: 'input',
          animated: true
        },
        {
          id: 'edge-2',
          source: 'llm-node',
          target: 'end-node',
          sourceHandle: 'output',
          targetHandle: 'input',
          animated: true
        }
      ]
    };

    const workflow = this.workflowRepository.create({
      name: exampleWorkflowName,
      description: '这是一个预置的示例工作流，展示了如何使用 LLM 节点构建简单的问答助手。',
      graphData: graphData,
    });

    try {
      await this.workflowRepository.save(workflow);
      this.logger.log('Example workflow seeded successfully.');
    } catch (error) {
      this.logger.error('Failed to seed example workflow:', error);
    }
  }
}
