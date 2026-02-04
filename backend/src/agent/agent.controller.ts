import { Controller, Post, Body, Param } from '@nestjs/common';
import { AgentService } from './agent.service';
import { Observable } from 'rxjs';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('chat')
  async chat(@Body() body: { message: string; sessionId?: string }) {
    const { message, sessionId } = body;
    return await this.agentService.chat(message, sessionId);
  }

  @Post('chat/stream')
  chatStream(
    @Body() body: { message: string; sessionId?: string },
  ): Observable<MessageEvent> {
    const { message, sessionId } = body;
    return this.agentService.chatStream(message, sessionId);
  }

  @Post('run/:workflowId')
  async runWorkflow(
    @Param('workflowId') workflowId: string,
    @Body() body: { inputMessage: string; sessionId?: string },
  ) {
    return await this.agentService.executeWorkflow(
      workflowId,
      body.inputMessage,
    );
  }
}
