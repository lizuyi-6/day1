import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AgentService } from './agent.service';
import { Observable } from 'rxjs';
import { HybridAuthGuard } from '../auth/hybrid-auth.guard';
import { User } from '../auth/jwt-auth.decorator';
import { BrowserId } from '../common/decorators/browser-id.decorator';
import { ChatDto } from './dto/chat.dto';
import { ChatStreamDto } from './dto/chat-stream.dto';

@Controller('agent')
@UseGuards(HybridAuthGuard)
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('chat')
  async chat(@Body() chatDto: ChatDto, @User() user: any, @BrowserId() browserId: string) {
    return await this.agentService.chat(chatDto.message, chatDto.sessionId, browserId);
  }

  @Post('chat/stream')
  chatStream(
    @Body() chatStreamDto: ChatStreamDto,
    @User() user: any,
    @BrowserId() browserId: string,
  ): Observable<MessageEvent> {
    return this.agentService.chatStream(
      chatStreamDto.message,
      chatStreamDto.sessionId,
      browserId,
    );
  }

  @Post('run/:workflowId')
  async runWorkflow(
    @Param('workflowId') workflowId: string,
    @Body() body: { inputMessage: string; sessionId?: string },
    @User() user: any,
  ) {
    return await this.agentService.executeWorkflow(
      workflowId,
      body.inputMessage,
    );
  }
}
