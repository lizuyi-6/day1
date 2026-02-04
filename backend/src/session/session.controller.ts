import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async createSession(@Body('userId') userId?: string) {
    return await this.sessionService.createSession(userId);
  }

  @Get(':sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    return await this.sessionService.getSession(sessionId);
  }

  @Get(':sessionId/history')
  async getHistory(@Param('sessionId') sessionId: string) {
    return await this.sessionService.getConversationHistory(sessionId);
  }

  @Delete(':sessionId')
  async deleteSession(@Param('sessionId') sessionId: string) {
    return await this.sessionService.deleteSession(sessionId);
  }
}
