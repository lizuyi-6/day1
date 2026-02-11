import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { WorkflowGateway } from './workflow.gateway';
import { WorkflowSeedService } from './workflow.seed.service';
import { Workflow } from './entities/workflow.entity';
import { WorkflowVersion } from './entities/workflow-version.entity';
import { WorkflowRunner } from './runner/workflow.runner';
import { ModelModule } from '../model/model.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { ModelConfig } from '../model/entities/model.entity';
import { StartNode } from './nodes/start.node';
import { EndNode } from './nodes/end.node';
import { DelayNode } from './nodes/delay.node';
import { LlmNode } from './nodes/llm.node';
import { KnowledgeNode } from './nodes/knowledge.node';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workflow, WorkflowVersion, ModelConfig]),
    ModelModule,
    KnowledgeModule,
  ],
  controllers: [WorkflowController],
  providers: [
    WorkflowService,
    WorkflowRunner,
    WorkflowGateway,
    WorkflowSeedService,
    StartNode,
    EndNode,
    DelayNode,
    LlmNode,
    KnowledgeNode,
  ],
  exports: [WorkflowService],
})
export class WorkflowModule {}
