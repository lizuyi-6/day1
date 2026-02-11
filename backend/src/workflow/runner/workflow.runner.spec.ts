import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowRunner } from './workflow.runner';
import { GraphData } from '../nodes/node.interface';

describe('WorkflowRunner', () => {
  let runner: WorkflowRunner;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowRunner],
    }).compile();

    runner = module.get<WorkflowRunner>(WorkflowRunner);
  });

  it('should be defined', () => {
    expect(runner).toBeDefined();
  });

  it('should execute a linear workflow (Start -> LLM -> End)', async () => {
    const graph: GraphData = {
      nodes: [
        { id: '1', type: 'start', data: { label: 'Start' } },
        { id: '2', type: 'llm', data: { label: 'LLM', model: 'gpt-4' } },
        { id: '3', type: 'end', data: { label: 'End' } },
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' },
      ],
    };

    const initialInputs = { input: 'Hello World' };
    const result = await runner.execute(graph, initialInputs);

    expect(result.nodeOutputs['1']).toEqual(
      expect.objectContaining({ input: 'Hello World' }),
    );
    expect(result.nodeOutputs['2']).toHaveProperty('response');
    expect(result.nodeOutputs['3']).toBeDefined();
  });

  it('should handle complex dependencies', async () => {
    // Start -> A -> C
    // Start -> B -> C
    // C -> End
    const graph: GraphData = {
      nodes: [
        { id: 'start', type: 'start', data: {} },
        { id: 'A', type: 'llm', data: { prompt: 'Task A' } },
        { id: 'B', type: 'llm', data: { prompt: 'Task B' } },
        { id: 'C', type: 'llm', data: { prompt: 'Task C' } },
        { id: 'end', type: 'end', data: {} },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'A' },
        { id: 'e2', source: 'start', target: 'B' },
        { id: 'e3', source: 'A', target: 'C' },
        { id: 'e4', source: 'B', target: 'C' },
        { id: 'e5', source: 'C', target: 'end' },
      ],
    };

    const result = await runner.execute(graph, { input: 'test' });
    expect(result.nodeOutputs['end']).toBeDefined();
  });
});
