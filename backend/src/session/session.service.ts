import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { Message } from './entities/message.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createSession(
    userId?: string,
    metadata?: Record<string, any>,
    sessionId?: string,
  ) {
    const session = this.sessionRepository.create({
      sessionId: sessionId || this.generateSessionId(),
      userId,
      metadata,
    });
    return await this.sessionRepository.save(session);
  }

  async getSession(sessionId: string) {
    const session = await this.sessionRepository.findOne({
      where: { sessionId },
      relations: ['messages'],
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    return session;
  }

  async getOrCreateSession(sessionId: string) {
    let session = await this.sessionRepository.findOne({
      where: { sessionId },
    });

    if (!session) {
      session = await this.createSession(
        undefined,
        { source: 'auto-created' },
        sessionId,
      );
    }

    return session;
  }

  async addMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>,
  ) {
    const session = await this.getOrCreateSession(sessionId);

    const message = this.messageRepository.create({
      sessionId: session.id,
      role,
      content,
      metadata,
    });

    return await this.messageRepository.save(message);
  }

  async getConversationHistory(sessionId: string, limit = 10) {
    const session = await this.getSession(sessionId);
    const messages = await this.messageRepository.find({
      where: { sessionId: session.id },
      order: { createdAt: 'ASC' },
      take: limit,
    });

    return messages;
  }

  async deleteSession(sessionId: string) {
    const session = await this.getSession(sessionId);
    await this.sessionRepository.remove(session);
    return { deleted: true };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
