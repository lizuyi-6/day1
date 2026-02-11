import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Workflow Lifecycle (e2e)', () => {
  let app: INestApplication;
  let createdWorkflowId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/workflow (POST) should create a workflow', async () => {
    const response = await request(app.getHttpServer())
      .post('/workflow')
      .send({ name: 'E2E Test Workflow' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('E2E Test Workflow');
    createdWorkflowId = response.body.id;
  });

  it('/workflow/:id (PUT) should update graph data', async () => {
    const graphData = {
      nodes: [
        { id: 'start-1', type: 'start', data: {} },
        { id: 'llm-1', type: 'llm', data: { prompt: 'Hello' } },
        { id: 'end-1', type: 'end', data: {} },
      ],
      edges: [
        { source: 'start-1', target: 'llm-1' },
        { source: 'llm-1', target: 'end-1' },
      ],
    };

    await request(app.getHttpServer())
      .put(`/workflow/${createdWorkflowId}`)
      .send({ graphData })
      .expect(200);
  });

  it('/workflow/:id/run (POST) should execute workflow', async () => {
    const response = await request(app.getHttpServer())
      .post(`/workflow/${createdWorkflowId}/run`)
      .send({ input: 'test input' })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.nodeOutputs).toBeDefined();
    expect(response.body.nodeOutputs['llm-1']).toBeDefined();
  });
});
