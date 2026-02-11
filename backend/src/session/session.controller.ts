import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { HybridAuthGuard } from '../auth/hybrid-auth.guard';
import { User } from '../auth/jwt-auth.decorator';

@Controller('session')
@UseGuards(HybridAuthGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async createSession(@User() user: any) {
    return await this.sessionService.createSession(user.id);
  }

  @Get(':sessionId')
  async getSession(@Param('sessionId') sessionId: string, @User() user: any) {
    return await this.sessionService.getSession(sessionId);
  }

  @Get(':sessionId/history')
  async getHistory(@Param('sessionId') sessionId: string, @User() user: any) {
    return await this.sessionService.getConversationHistory(sessionId);
  }

  @Delete(':sessionId')
  async deleteSession(
    @Param('sessionId') sessionId: string,
    @User() user: any,
  ) {
    return await this.sessionService.deleteSession(sessionId);
  }
}
