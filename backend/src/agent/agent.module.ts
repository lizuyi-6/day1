import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { SessionModule } from '../session/session.module';
import { NodeRegistry } from '../workflow/nodes/node-registry';

@Module({
  imports: [KnowledgeModule, WorkflowModule, SessionModule],
  controllers: [AgentController],
  providers: [AgentService, NodeRegistry],
})
export class AgentModule {}
